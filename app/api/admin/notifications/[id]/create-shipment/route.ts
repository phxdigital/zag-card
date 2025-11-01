import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createMelhorEnvioShipment, generateMelhorEnvioLabel, getMelhorEnvioAccountInfo, purchaseMelhorEnvioCart } from '@/lib/melhor-envio';
import { loadEnv } from '@/lib/env-loader';

// Carregar variáveis de ambiente explicitamente
loadEnv();

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { serviceId } = body as { serviceId: number };

        if (!serviceId) {
            return NextResponse.json(
                { success: false, error: 'ID do serviço é obrigatório' },
                { status: 400 }
            );
        }

        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        
        // Verificar autenticação
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Buscar a notificação para obter o page_id e buscar payment_id através da página
        const { data: notification, error: notificationError } = await supabase
            .from('admin_notifications')
            .select('page_id, subdomain')
            .eq('id', id)
            .single();

        if (notificationError || !notification) {
            return NextResponse.json(
                { success: false, error: 'Notificação não encontrada' },
                { status: 404 }
            );
        }

        // Buscar page_id e payment_id - se não tiver page_id, buscar pelo subdomain
        let pageId = notification.page_id;
        let paymentId: string | null = null;

        if (pageId) {
            // Buscar payment_id através do page_id
            const { data: pageData } = await supabase
                .from('pages')
                .select('payment_id')
                .eq('id', pageId)
                .single();
            
            if (pageData?.payment_id) {
                paymentId = pageData.payment_id;
            }
        } else if (notification.subdomain) {
            // Buscar page_id pelo subdomain
            const { data: pageData } = await supabase
                .from('pages')
                .select('id, payment_id')
                .eq('subdomain', notification.subdomain)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            if (pageData) {
                pageId = pageData.id;
                paymentId = pageData.payment_id;
            }
        }

        if (!paymentId && !pageId) {
            return NextResponse.json(
                { success: false, error: 'Não foi possível encontrar pagamento ou página associados' },
                { status: 404 }
            );
        }

        // Buscar endereço de entrega - tentar por page_id primeiro, depois por payment_id
        let address = null;
        let addressError = null;

        if (pageId) {
            const result = await supabase
                .from('shipping_addresses')
                .select('*')
                .eq('page_id', pageId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            address = result.data;
            addressError = result.error;
        }

        // Se não encontrou por page_id, buscar por payment_id
        if (!address && paymentId) {
            const result = await supabase
                .from('shipping_addresses')
                .select('*')
                .eq('payment_id', paymentId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            address = result.data;
            addressError = result.error;
            
            // Se encontrou por payment_id, atualizar para vincular com page_id
            if (address && pageId) {
                await supabase
                    .from('shipping_addresses')
                    .update({ page_id: pageId })
                    .eq('id', address.id);
            }
        }

        if (!address) {
            return NextResponse.json(
                { success: false, error: 'Endereço de entrega não encontrado. O cliente precisa configurar a entrega primeiro.' },
                { status: 404 }
            );
        }

        // Buscar informações do pagamento para obter valor declarado
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .select('amount')
            .eq('id', address.payment_id)
            .single();

        const declaredValue = payment?.amount || 0;

        // Buscar informações da conta Melhor Envio (remetente)
        const accountInfo = await getMelhorEnvioAccountInfo();

        // Obter endereço de origem das variáveis de ambiente ou banco
        const originName = process.env.SHIPPING_ORIGIN_NAME || accountInfo.name || 'Zag NFC Card';
        const originPhone = process.env.SHIPPING_ORIGIN_PHONE || accountInfo.phone || '';
        const originEmail = process.env.SHIPPING_ORIGIN_EMAIL || accountInfo.email || '';
        const originDocument = process.env.SHIPPING_ORIGIN_DOCUMENT || '';
        
        // CEP de origem - buscar do banco ou usar padrão
        const { data: shippingConfig } = await supabase
            .from('shipping_configs')
            .select('origin_postal_code')
            .eq('carrier', 'melhor_envio')
            .eq('is_active', true)
            .limit(1)
            .single();

        const originCEP = shippingConfig?.origin_postal_code || '88010001';
        
        // Buscar endereço completo de origem usando ViaCEP ou usar valores padrão
        let originAddress = process.env.SHIPPING_ORIGIN_ADDRESS || '';
        const originNumber = process.env.SHIPPING_ORIGIN_NUMBER || '123';
        const originComplement = process.env.SHIPPING_ORIGIN_COMPLEMENT || '';
        let originDistrict = process.env.SHIPPING_ORIGIN_DISTRICT || '';
        let originCity = process.env.SHIPPING_ORIGIN_CITY || 'Florianópolis';
        let originState = process.env.SHIPPING_ORIGIN_STATE || 'SC';

        // Se não tiver endereço completo nas env vars, buscar via CEP
        if (!originAddress) {
            try {
                const viaCEPResponse = await fetch(`https://viacep.com.br/ws/${originCEP}/json/`);
                if (viaCEPResponse.ok) {
                    const cepData = await viaCEPResponse.json();
                    if (!cepData.erro) {
                        originAddress = cepData.logradouro || '';
                        originDistrict = cepData.bairro || '';
                        originCity = cepData.localidade || '';
                        originState = cepData.uf || '';
                    }
                }
            } catch (err) {
                console.warn('⚠️ Erro ao buscar endereço via CEP:', err);
            }
        }

        // Criar envio no Melhor Envio
        const shipment = await createMelhorEnvioShipment({
            serviceId: serviceId,
            from: {
                name: originName,
                phone: originPhone,
                email: originEmail,
                document: originDocument,
                address: originAddress || 'Endereço não configurado',
                complement: originComplement,
                number: originNumber,
                district: originDistrict || 'Centro',
                city: originCity,
                state: originState,
                postalCode: originCEP
            },
            to: {
                name: address.name,
                phone: address.phone,
                email: address.email,
                document: (address.document || '').replace(/\D/g, ''), // CPF/CNPJ do destinatário (apenas números)
                address: address.street,
                complement: address.complement || '',
                number: address.number,
                district: address.neighborhood,
                city: address.city,
                state: address.state,
                postalCode: address.postal_code
            },
            products: [{
                name: 'Zag NFC Card',
                quantity: 1,
                unitaryValue: declaredValue
            }],
            volumes: [{
                height: 1,
                width: 15,
                length: 20,
                weight: 0.05
            }]
        });

        // FAZER CHECKOUT AUTOMÁTICO - "Comprar" o frete automaticamente
        let checkoutResult = null;
        try {
            console.log('🛒 Fazendo checkout automático do carrinho Melhor Envio...');
            checkoutResult = await purchaseMelhorEnvioCart();
            console.log('✅ Checkout realizado com sucesso:', checkoutResult);
        } catch (checkoutError) {
            console.warn('⚠️ Erro ao fazer checkout automático:', checkoutError);
            // Não falhar o processo se checkout falhar, mas avisar
            console.warn('⚠️ O envio foi criado, mas precisa fazer checkout manualmente na plataforma Melhor Envio');
        }

        // Gerar etiqueta (após checkout, a etiqueta deve ficar ativa)
        let labelUrl: string | undefined;
        try {
            // Aguardar um pouco para o checkout processar
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const label = await generateMelhorEnvioLabel(shipment.id);
            labelUrl = label.url;
            console.log('✅ Etiqueta gerada com sucesso:', labelUrl);
        } catch (labelError) {
            console.warn('⚠️ Erro ao gerar etiqueta:', labelError);
            console.warn('⚠️ Verifique se o checkout foi realizado corretamente');
        }

        // Buscar tracking_code atualizado após checkout
        let finalTrackingCode = shipment.tracking;
        
        // Se o checkout retornou orders com tracking_code atualizado, usar esse
        if (checkoutResult?.orders && checkoutResult.orders.length > 0) {
            // Procurar o order correspondente ao shipment.id
            interface CheckoutOrder {
              id: number;
              service_id: number;
              tracking?: string;
            }
            const matchingOrder = checkoutResult.orders.find((order: CheckoutOrder) => 
                order.id === shipment.id || order.service_id === serviceId
            );
            if (matchingOrder?.tracking) {
                finalTrackingCode = matchingOrder.tracking;
                console.log('✅ Tracking code atualizado após checkout:', finalTrackingCode);
            }
        }

        // Salvar informações do envio na tabela shipments
        const shipmentData: {
          payment_id: string;
          carrier: string;
          service_type: string;
          tracking_code: string;
          status: string;
          shipped_at: string;
          melhor_envio_id?: number;
          created_at: string;
        } = {
            payment_id: address.payment_id,
            carrier: 'melhor_envio',
            service_type: serviceId.toString(),
            tracking_code: finalTrackingCode,
            status: 'shipped',
            shipped_at: new Date().toISOString(),
            shipping_cost: 0, // Será atualizado depois se necessário
            declared_value: declaredValue,
            weight: 0.05,
            dimensions: { length: 20, width: 15, height: 1 },
            melhor_envio_id: shipment.id, // Salvar ID do envio no Melhor Envio
            shipment_id: shipment.id // Campo alternativo caso melhor_envio_id não exista
        };

        // Vincular shipment com page_id se disponível
        if (pageId) {
            shipmentData.page_id = pageId;
        }

        // Adicionar label_url se disponível (campo pode não existir na tabela)
        if (labelUrl) {
            shipmentData.label_url = labelUrl;
        }

        await supabaseAdmin
            .from('shipments')
            .insert(shipmentData);

        // Atualizar página com tracking_code atualizado (se pageId existir)
        if (pageId) {
            await supabaseAdmin
                .from('pages')
                .update({
                    tracking_code: finalTrackingCode,
                    production_status: 'shipped'
                })
                .eq('id', pageId);
        }

        console.log(`✅ Envio criado no Melhor Envio para pedido ${id}. Tracking: ${finalTrackingCode}`);

        return NextResponse.json({ 
            success: true, 
            shipment: {
                id: shipment.id,
                tracking: finalTrackingCode,
                protocol: shipment.protocol,
                label_url: labelUrl
            },
            checkout: checkoutResult?.purchased ? 'success' : 'pending',
            message: checkoutResult?.purchased 
                ? 'Envio criado e checkout realizado com sucesso. Etiqueta pronta para impressão!'
                : 'Envio criado. Verifique se o checkout foi realizado na plataforma Melhor Envio.'
        });

    } catch (err: unknown) {
        console.error('❌ Erro ao criar envio:', err);
            return NextResponse.json(
                { success: false, error: (err instanceof Error ? err.message : String(err)) || 'Erro interno do servidor' },
                { status: 500 }
            );
    }
}

