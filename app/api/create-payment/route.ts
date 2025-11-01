import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createOrUpdateCustomer, createPayment, getPixQrCode } from '@/lib/asaas';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticação (temporariamente desabilitado para teste)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Para teste, vamos usar um usuário mock se não estiver logado
    const testUser = user || { 
      id: 'test-user-id', 
      email: 'teste@exemplo.com' 
    };

    const body = await request.json();
    const { planType, value, description, customerData } = body;

    // Validação básica
    if (!planType || value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: planType, value' },
        { status: 400 }
      );
    }

    // Garantir que value é um número
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido. Deve ser um número maior que zero' },
        { status: 400 }
      );
    }

    // Buscar dados do usuário (ou usar dados mock)
    let profile = null;
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = data;
    }
    
    // Usar dados do modal se fornecidos, senão usar dados do perfil ou mock
    if (customerData) {
      profile = {
        name: customerData.name,
        email: customerData.email,
        cpf_cnpj: customerData.cpf,
        phone: customerData.phone
      };
    } else if (!profile) {
      profile = {
        name: 'Cliente Teste',
        email: 'teste@exemplo.com',
        cpf_cnpj: '11144477735', // CPF válido para teste
        phone: '11999999999'
      };
    }
    
    // Garantir que o CPF/CNPJ está presente
    if (!profile.cpf_cnpj) {
      profile.cpf_cnpj = '11144477735'; // CPF válido para teste
    }

    // Criar ou atualizar cliente no Asaas
    console.log('🔍 Criando/atualizando cliente no Asaas:', {
      name: profile?.name || testUser.email?.split('@')[0] || 'Cliente',
      email: profile?.email || testUser.email || 'teste@exemplo.com',
      cpfCnpj: profile?.cpf_cnpj ? '***' : 'não informado',
    });
    
    const customer = await createOrUpdateCustomer({
      name: profile?.name || testUser.email?.split('@')[0] || 'Cliente',
      email: profile?.email || testUser.email || 'teste@exemplo.com',
      cpfCnpj: profile?.cpf_cnpj,
      phone: profile?.phone,
      mobilePhone: profile?.mobile_phone,
    });
    
    console.log('✅ Cliente criado/atualizado no Asaas:', customer.id);

    // Criar data de vencimento (3 dias a partir de hoje)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    // Criar cobrança PIX por padrão
    console.log('🔍 Criando pagamento PIX:', {
      customer: customer.id,
      value: numericValue,
      dueDate: dueDateStr,
      planType,
    });
    
    const payment = await createPayment({
      customer: customer.id!,
      billingType: 'PIX',
      value: numericValue, // Usar valor numérico validado
      dueDate: dueDateStr,
      description: description || `Plano ${planType} - Zag NFC`,
      externalReference: `${testUser.id}_${planType}_${Date.now()}`,
    });
    
    console.log('✅ Pagamento PIX criado:', payment.id);

    // Buscar QR Code PIX
    console.log('🔍 Buscando QR Code PIX para pagamento:', payment.id);
    const pixQrCode = await getPixQrCode(payment.id);
    console.log('✅ QR Code PIX obtido');

    // Salvar cobrança no banco de dados (apenas se usuário real E planType válido)
    // Plan types válidos: 'para_mim', 'para_equipe', 'para_negocio'
    const validPlanTypes = ['para_mim', 'para_equipe', 'para_negocio'];
    const isValidPlanType = validPlanTypes.includes(planType);
    
    if (user && isValidPlanType) {
      console.log('💰 Salvando pagamento PIX no banco:', {
        user_id: user.id,
        asaas_payment_id: payment.id,
        plan_type: planType,
        amount: numericValue,
        status: payment.status
      });
      
      const { data: insertedPayment, error: insertError } = await supabase.from('payments').insert({
        user_id: user.id,
        asaas_payment_id: payment.id,
        asaas_customer_id: customer.id,
        plan_type: planType,
        amount: numericValue,
        status: payment.status,
        billing_type: 'PIX',
        due_date: dueDateStr,
        description: description,
        pix_qr_code: pixQrCode.payload,
        pix_qr_code_image: pixQrCode.encodedImage,
        pix_expiration: pixQrCode.expirationDate,
      }).select();

      if (insertError) {
        console.error('❌ Erro ao salvar pagamento PIX no banco:', insertError);
        throw new Error(`Erro ao salvar pagamento: ${insertError.message}`);
      }

      console.log('✅ Pagamento PIX salvo no banco:', insertedPayment);
    } else {
      if (!user) {
        console.log('⚠️ Usuário não autenticado, pagamento PIX não será salvo no banco');
      } else if (!isValidPlanType) {
        console.log('⚠️ PlanType inválido para salvar no banco (produto da loja), pagamento criado apenas no Asaas');
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        value: payment.value,
        dueDate: payment.dueDate,
        invoiceUrl: payment.invoiceUrl,
        pix: {
          qrCode: pixQrCode.payload,
          qrCodeImage: pixQrCode.encodedImage,
          expirationDate: pixQrCode.expirationDate,
        },
      },
    });

  } catch (err) {
    console.error('Erro ao criar cobrança:', err);
    
    // Extrair mensagem de erro mais detalhada
    let errorMessage = 'Erro ao processar pagamento';
    let errorDetails: string | undefined;
    
    if (err instanceof Error) {
      errorMessage = err.message;
      errorDetails = err.stack;
      
      // Se for erro do Asaas, tentar extrair detalhes
      if (err.message.includes('Erro ao criar cobrança')) {
        try {
          const errorMatch = err.message.match(/\{.*\}/);
          if (errorMatch) {
            const asaasError = JSON.parse(errorMatch[0]);
            errorDetails = JSON.stringify(asaasError, null, 2);
          }
        } catch {
          // Ignorar se não conseguir parsear
        }
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails || (err instanceof Error ? err.message : 'Erro desconhecido'),
        stack: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

