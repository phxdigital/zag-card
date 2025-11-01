import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createCreditCardPayment, createOrUpdateCustomer } from '@/lib/asaas';
import { createShipment } from '@/lib/shipping';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const {
      planType,
      value,
      description,
      customer, // { name, email, cpf, phone }
      card, // { holderName, number, expiryMonth, expiryYear, ccv }
      address, // optional { postalCode, addressNumber, addressComplement }
      shippingAddress, // { name, email, phone, street, number, etc }
      shippingOption, // { carrier, service_type, cost, estimated_days }
      cardMode, // optional 'CREDIT' | 'DEBIT'
      installments // optional number (1-3)
    } = body;

    if (!planType || !value || !customer || !card) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes' }, { status: 400 });
    }

    // Criar/atualizar cliente Asaas
    const asaasCustomer = await createOrUpdateCustomer({
      name: customer.name,
      email: customer.email,
      cpfCnpj: customer.cpf,
      phone: customer.phone,
      mobilePhone: customer.phone,
    });

    // Data de vencimento hoje (cartão processa imediato)
    const dueDate = new Date();
    const dueDateStr = dueDate.toISOString().split('T')[0];

    // Defaults helpful for sandbox: postalCode and addressNumber often required in risk analysis
    const postalCode = address?.postalCode || '88010001';
    const addressNumber = address?.addressNumber || '100';
    const addressComplement = address?.addressComplement;

    // Remote IP can help pass risk analysis in some gateways
    const remoteIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';

    const safeInstallments = Math.min(Math.max(Number(installments) || 1, 1), 3);
    const perInstallment = Number((value / safeInstallments).toFixed(2));

    const payment = await createCreditCardPayment({
      customer: asaasCustomer.id!,
      billingType: 'CREDIT_CARD',
      value,
      dueDate: dueDateStr,
      description: description || `Plano ${planType} - Zag NFC${cardMode ? ` (${cardMode === 'DEBIT' ? 'Débito' : 'Crédito'})` : ''}`,
      externalReference: `${(user?.id || 'guest')}_${planType}_${Date.now()}`,
      installmentCount: safeInstallments,
      installmentValue: perInstallment,
      remoteIp,
      creditCard: {
        holderName: card.holderName,
        number: card.number.replace(/\s/g, ''),
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        ccv: card.ccv,
      },
      creditCardHolderInfo: {
        name: customer.name,
        email: customer.email,
        cpfCnpj: customer.cpf,
        postalCode,
        addressNumber,
        addressComplement,
        phone: customer.phone,
        mobilePhone: customer.phone,
      },
    });

    // Variável para armazenar o pagamento inserido
    interface PaymentData {
      id: string;
      user_id: string;
      amount: number;
      description: string;
      plan_type: string;
      status: string;
      created_at: string;
    }
    let insertedPayment: PaymentData[] | null = null;

    // Salvar cobrança no banco de dados (apenas se usuário real E planType válido)
    // Plan types válidos: 'para_mim', 'para_equipe', 'para_negocio'
    const validPlanTypes = ['para_mim', 'para_equipe', 'para_negocio'];
    const isValidPlanType = validPlanTypes.includes(planType);

    // Persistir pagamento se autenticado E planType válido
    if (user && isValidPlanType) {
      console.log('💳 Salvando pagamento no banco:', {
        user_id: user.id,
        asaas_payment_id: payment.id,
        plan_type: planType,
        amount: value,
        status: payment.status
      });
      
      const { data: paymentData, error: insertError } = await supabase.from('payments').insert({
        user_id: user.id,
        asaas_payment_id: payment.id,
        asaas_customer_id: asaasCustomer.id,
        plan_type: planType,
        amount: value,
        status: payment.status,
        billing_type: 'CREDIT_CARD',
        due_date: dueDateStr,
        description,
        invoice_url: payment.invoiceUrl,
        // Campos de shipping
        shipping_address: shippingAddress,
        shipping_carrier: shippingOption?.carrier,
        shipping_service: shippingOption?.service_type,
        shipping_cost: shippingOption?.cost || 0,
        shipping_status: 'pending'
      }).select();

      if (insertError) {
        console.error('❌ Erro ao salvar pagamento no banco:', insertError);
        throw new Error(`Erro ao salvar pagamento: ${insertError.message}`);
      }

      insertedPayment = paymentData;
      console.log('✅ Pagamento salvo no banco:', insertedPayment);

      // Criar envio se dados de shipping foram fornecidos
      if (shippingAddress && shippingOption && payment.status === 'CONFIRMED' && insertedPayment && insertedPayment.length > 0) {
        try {
          console.log('🚚 Criando envio para pagamento:', payment.id);
          
          const shipmentResult = await createShipment({
            payment_id: insertedPayment[0].id,
            address: shippingAddress,
            carrier: shippingOption.carrier,
            service_type: shippingOption.service_type,
            weight: 1.0, // Peso padrão do cartão NFC
            dimensions: { length: 20, width: 15, height: 5 },
            declared_value: value
          });

          if (shipmentResult.success) {
            console.log('✅ Envio criado com sucesso:', shipmentResult.tracking_code);
            
            // Atualizar pagamento com código de rastreamento
            await supabase
              .from('payments')
              .update({
                tracking_code: shipmentResult.tracking_code,
                shipping_status: 'created'
              })
              .eq('id', insertedPayment[0].id);
          } else {
            console.error('❌ Erro ao criar envio:', shipmentResult.error);
          }
        } catch (shipmentError) {
          console.error('❌ Erro ao processar envio:', shipmentError);
          // Não falhar o pagamento por erro de envio
        }
      }
    } else {
      if (!user) {
        console.log('⚠️ Usuário não autenticado, pagamento não será salvo no banco');
      } else if (!isValidPlanType) {
        console.log('⚠️ PlanType inválido para salvar no banco (produto da loja), pagamento criado apenas no Asaas');
      }
    }

    // Retornar payment_id para ser salvo no sessionStorage
    // Isso será usado na página de entrega
    const paymentId = insertedPayment && insertedPayment.length > 0 
      ? insertedPayment[0].id 
      : null;

    return NextResponse.json({ 
      success: true, 
      payment: {
        id: payment.id,
        status: payment.status,
        value: payment.value,
        invoiceUrl: payment.invoiceUrl,
      },
      payment_id: paymentId, // ID do pagamento no banco (UUID)
      asaas_payment_id: payment.id // ID do pagamento no Asaas
    });
  } catch (err) {
    console.error('Erro ao processar pagamento com cartão:', err);
    const errMsg: string = err instanceof Error ? err.message : 'Erro desconhecido';
    // Tentar extrair um payload conhecido do Asaas
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(errMsg.replace('Erro ao criar cobrança no cartão: ', ''));
    } catch {}
    return NextResponse.json({
      error: 'Erro ao processar pagamento com cartão',
      details: errMsg,
      asaas: parsed,
    }, { status: 500 });
  }
}


