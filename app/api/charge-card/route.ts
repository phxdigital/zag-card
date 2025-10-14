import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createCreditCardPayment, createOrUpdateCustomer } from '@/lib/asaas';

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
      installmentValue: safeInstallments > 1 ? perInstallment : undefined,
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

    // Persistir pagamento se autenticado
    if (user) {
      console.log('💳 Salvando pagamento no banco:', {
        user_id: user.id,
        asaas_payment_id: payment.id,
        plan_type: planType,
        amount: value,
        status: payment.status
      });
      
      const { data: insertedPayment, error: insertError } = await supabase.from('payments').insert({
        user_id: user.id,
        asaas_payment_id: payment.id,
        asaas_customer_id: asaasCustomer.id,
        plan_type: planType,
        amount: value,
        status: payment.status,
        billing_type: 'CREDIT_CARD',
        description,
        invoice_url: payment.invoiceUrl,
      }).select();

      if (insertError) {
        console.error('❌ Erro ao salvar pagamento no banco:', insertError);
        throw new Error(`Erro ao salvar pagamento: ${insertError.message}`);
      }

      console.log('✅ Pagamento salvo no banco:', insertedPayment);
    } else {
      console.log('⚠️ Usuário não autenticado, pagamento não será salvo no banco');
    }

    return NextResponse.json({ success: true, payment });
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


