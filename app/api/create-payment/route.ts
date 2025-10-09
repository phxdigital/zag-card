import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';
import { createOrUpdateCustomer, createPayment, getPixQrCode } from '@/lib/asaas';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planType, value, description } = body;

    // Validação básica
    if (!planType || !value) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios: planType, value' },
        { status: 400 }
      );
    }

    // Buscar dados do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Criar ou atualizar cliente no Asaas
    const customer = await createOrUpdateCustomer({
      name: profile?.name || user.email?.split('@')[0] || 'Cliente',
      email: user.email || '',
      cpfCnpj: profile?.cpf_cnpj,
      phone: profile?.phone,
      mobilePhone: profile?.mobile_phone,
    });

    // Criar data de vencimento (3 dias a partir de hoje)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    // Criar cobrança
    const payment = await createPayment({
      customer: customer.id!,
      billingType: 'PIX',
      value: value,
      dueDate: dueDateStr,
      description: description || `Plano ${planType} - Zag NFC`,
      externalReference: `${user.id}_${planType}_${Date.now()}`,
    });

    // Buscar QR Code PIX
    const pixQrCode = await getPixQrCode(payment.id);

    // Salvar cobrança no banco de dados
    await supabase.from('payments').insert({
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
    });

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

  } catch (error) {
    console.error('Erro ao criar cobrança:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao processar pagamento', 
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}

