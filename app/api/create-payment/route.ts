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
    if (!planType || !value) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: planType, value' },
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
    const customer = await createOrUpdateCustomer({
      name: profile?.name || testUser.email?.split('@')[0] || 'Cliente',
      email: profile?.email || testUser.email || 'teste@exemplo.com',
      cpfCnpj: profile?.cpf_cnpj,
      phone: profile?.phone,
      mobilePhone: profile?.mobile_phone,
    });

    // Criar data de vencimento (3 dias a partir de hoje)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    // Criar cobrança PIX por padrão
    const payment = await createPayment({
      customer: customer.id!,
      billingType: 'PIX',
      value: value,
      dueDate: dueDateStr,
      description: description || `Plano ${planType} - Zag NFC`,
      externalReference: `${testUser.id}_${planType}_${Date.now()}`,
    });

    // Buscar QR Code PIX
    const pixQrCode = await getPixQrCode(payment.id);

    // Salvar cobrança no banco de dados (apenas se usuário real)
    if (user) {
      console.log('💰 Salvando pagamento PIX no banco:', {
        user_id: user.id,
        asaas_payment_id: payment.id,
        plan_type: planType,
        amount: value,
        status: payment.status
      });
      
      const { data: insertedPayment, error: insertError } = await supabase.from('payments').insert({
        user_id: user.id,
        asaas_payment_id: payment.id,
        asaas_customer_id: customer.id,
        plan_type: planType,
        amount: value,
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
      console.log('⚠️ Usuário não autenticado, pagamento PIX não será salvo no banco');
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
    return NextResponse.json(
      { 
        error: 'Erro ao processar pagamento', 
        details: err instanceof Error ? err.message : 'Erro desconhecido',
        stack: err instanceof Error ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}

