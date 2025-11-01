// ============================================
// INTEGRAÇÃO COM PLATAFORMAS DE ENVIO
// ============================================

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  document?: string; // CPF/CNPJ do destinatário
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  reference?: string;
  instructions?: string;
}

export interface ShippingOption {
  carrier: string;
  service_type: string;
  cost: number;
  estimated_days: number;
  estimated_delivery: string;
  description: string;
  melhor_envio_id?: number; // ID do serviço do Melhor Envio
  melhor_envio_service?: number; // ID do serviço para criar envio
}

export interface ShipmentData {
  payment_id: string;
  address: ShippingAddress;
  carrier: string;
  service_type: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  declared_value: number;
  expected_cost?: number; // Custo esperado do shippingOption (usado quando criar envio mock)
}

export interface TrackingEvent {
  status: string;
  description: string;
  location?: string;
  event_date: string;
}

// ============================================
// VALIDAÇÃO DE CEP
// ============================================

export async function validateCEP(postalCode: string): Promise<{
  valid: boolean;
  address?: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  error?: string;
}> {
  try {
    const cleanCEP = postalCode.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
      return { valid: false, error: 'CEP deve ter 8 dígitos' };
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data = await response.json();

    if (data.erro) {
      return { valid: false, error: 'CEP não encontrado' };
    }

    return {
      valid: true,
      address: {
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf
      }
    };
  } catch (error) {
    return { valid: false, error: 'Erro ao validar CEP' };
  }
}

// ============================================
// CÁLCULO DE FRETE
// ============================================

// Função interna para cálculo no servidor
async function calculateShippingServer(
  origin: string,
  destination: string,
  weight: number,
  dimensions: { length: number; width: number; height: number },
  products?: Array<{
    weight: number;
    dimensions: { length: number; width: number; height: number };
    value?: number;
    quantity?: number;
  }>
): Promise<ShippingOption[]> {
  try {
    // Tentar usar Melhor Envio primeiro (se configurado)
    // Carregar variáveis de ambiente
    const { loadEnv, getEnv } = await import('./env-loader');
    loadEnv();
    
    const melhorEnvioToken = getEnv('MELHOR_ENVIO_TOKEN');
    
    if (melhorEnvioToken) {
      try {
        const { calculateMelhorEnvioShipping } = await import('./melhor-envio');
        
        const productsForCalculation = products || [{
          weight,
          dimensions,
          value: 0,
          quantity: 1
        }];

        const melhorEnvioOptions = await calculateMelhorEnvioShipping(
          origin,
          destination,
          productsForCalculation
        );

        // Converter opções do Melhor Envio para nosso formato
        const options: ShippingOption[] = melhorEnvioOptions.map(option => ({
          carrier: 'melhor_envio',
          service_type: option.name,
          cost: parseFloat(option.price),
          estimated_days: option.delivery_range?.max || option.delivery_time || 7,
          estimated_delivery: calculateEstimatedDelivery(option.delivery_range?.max || option.delivery_time || 7),
          description: `${option.company.name} - ${option.name}`,
          melhor_envio_id: option.id, // Salvar ID para criar envio depois
          melhor_envio_service: option.id
        }));

        if (options.length > 0) {
          return options.sort((a, b) => a.cost - b.cost);
        }
      } catch (melhorEnvioError) {
        console.warn('⚠️ Erro ao calcular frete via Melhor Envio, usando método alternativo:', melhorEnvioError);
      }
    }

    // Fallback: usar configurações do banco (método anterior)
    console.log('📊 Usando método alternativo (configurações do banco)...');
    // No servidor, precisamos criar um cliente diferente
    let supabase;
    if (typeof window === 'undefined') {
      // No servidor, usar createServerComponentClient ou importar diretamente
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Configuração do Supabase faltando');
        return [];
      }
      
      supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      // No cliente, usar createClientComponentClient
      supabase = createClientComponentClient();
    }
    
    const { data: configs, error } = await supabase
      .from('shipping_configs')
      .select('*')
      .eq('is_active', true)
      .eq('origin_postal_code', origin);

    if (error) {
      console.error('❌ Erro ao buscar configurações de frete:', error);
      throw error;
    }

    console.log('📦 Configurações encontradas:', configs?.length || 0);

    const options: ShippingOption[] = [];

    if (configs && configs.length > 0) {
      for (const config of configs) {
        const cost = Math.max(
          config.base_cost + (weight * config.cost_per_kg),
          config.min_cost
        );

        if (config.allowed_states && config.allowed_states.length > 0) {
          const destinationState = await getStateFromCEP(destination);
          if (!config.allowed_states.includes(destinationState)) {
            continue;
          }
        }

        if (config.excluded_states && config.excluded_states.length > 0) {
          const destinationState = await getStateFromCEP(destination);
          if (config.excluded_states.includes(destinationState)) {
            continue;
          }
        }

        const estimatedDelivery = calculateEstimatedDelivery(config.max_days);

        options.push({
          carrier: config.carrier,
          service_type: config.service_type,
          cost: cost,
          estimated_days: config.max_days,
          estimated_delivery: estimatedDelivery,
          description: getServiceDescription(config.carrier, config.service_type)
        });
      }
    }

    const sorted = options.sort((a, b) => a.cost - b.cost);
    console.log('✅ Opções finais (fallback):', sorted.length);
    return sorted;
  } catch (error) {
    console.error('❌ Erro ao calcular frete:', error);
    if (error instanceof Error) {
      console.error('Erro detalhado:', error.message, error.stack);
    }
    return [];
  }
}

// Função pública que pode ser usada no cliente ou servidor
export async function calculateShipping(
  origin: string,
  destination: string,
  weight: number,
  dimensions: { length: number; width: number; height: number },
  products?: Array<{
    weight: number;
    dimensions: { length: number; width: number; height: number };
    value?: number;
    quantity?: number;
  }>
): Promise<ShippingOption[]> {
  // Se estiver no servidor, usar função interna diretamente
  if (typeof window === 'undefined') {
    return calculateShippingServer(origin, destination, weight, dimensions, products);
  }

  // Se estiver no cliente, chamar API no servidor
  try {
    const response = await fetch('/api/shipping/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin,
        destination,
        weight,
        dimensions,
        products: products || [{
          weight,
          dimensions,
          value: 0,
          quantity: 1
        }]
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('📦 Resposta da API de frete:', data);
      if (data.success && data.options && data.options.length > 0) {
        console.log('✅ Opções de frete recebidas:', data.options.length);
        return data.options.sort((a: ShippingOption, b: ShippingOption) => a.cost - b.cost);
      } else {
        console.warn('⚠️ API retornou sucesso mas sem opções:', data);
        throw new Error(data.error || 'Nenhuma opção de frete disponível');
      }
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      console.error('❌ API de cálculo de frete retornou erro:', response.status, errorData);
      throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
    }
  } catch (apiError) {
    console.error('❌ Erro ao chamar API de cálculo de frete:', apiError);
    if (apiError instanceof Error) {
      throw apiError; // Re-throw para que o componente possa tratar
    }
    throw new Error('Erro ao calcular frete. Tente novamente.');
  }
}

function calculateEstimatedDelivery(days: number): string {
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + days);
  return estimatedDelivery.toISOString().split('T')[0];
}

// ============================================
// CRIAÇÃO DE ENVIO
// ============================================

export async function createShipment(shipmentData: ShipmentData): Promise<{
  success: boolean;
  tracking_code?: string;
  error?: string;
}> {
  try {
    const supabase = createClientComponentClient();

    // Salvar endereço de entrega
    // Preparar dados para inserção (sem document primeiro)
    interface AddressInsertData {
      payment_id: string;
      name: string;
      email: string;
      phone: string;
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      postal_code: string;
      country?: string;
      reference?: string;
      instructions?: string;
      document?: string;
    }
    
    const addressInsertData: AddressInsertData = {
      payment_id: shipmentData.payment_id,
      name: shipmentData.address.name,
      email: shipmentData.address.email,
      phone: shipmentData.address.phone,
      street: shipmentData.address.street,
      number: shipmentData.address.number,
      complement: shipmentData.address.complement,
      neighborhood: shipmentData.address.neighborhood,
      city: shipmentData.address.city,
      state: shipmentData.address.state,
      postal_code: shipmentData.address.postal_code,
      country: shipmentData.address.country || 'BR',
      reference: shipmentData.address.reference,
      instructions: shipmentData.address.instructions
    };

    // Adicionar document se disponível (só se a coluna existir no banco)
    if (shipmentData.address.document) {
      addressInsertData.document = shipmentData.address.document.replace(/\D/g, '');
    }

    // Tentar inserir com document primeiro, se der erro relacionado à coluna, tentar sem
    let { data: addressData, error: addressError } = await supabase
      .from('shipping_addresses')
      .insert(addressInsertData)
      .select()
      .single();

    // Se erro relacionado à coluna document, tentar sem document
    if (addressError && addressError.message?.includes('column "document"')) {
      delete addressInsertData.document;
      const retryResult = await supabase
        .from('shipping_addresses')
        .insert(addressInsertData)
        .select()
        .single();
      addressData = retryResult.data;
      addressError = retryResult.error;
      console.warn('⚠️ Coluna document não existe no banco. Executando INSERT sem document. Execute o script: database/add-document-column.sql');
    }

    if (addressError) {
      console.error('❌ Erro ao salvar endereço de entrega:', addressError);
      throw addressError;
    }

    // Criar envio baseado na transportadora
    let trackingCode: string;
    let shippingCost: number;
    let melhorEnvioResult: { tracking_code: string; cost: number; label_url?: string; shipment_id?: number } | undefined;

    switch (shipmentData.carrier) {
      case 'correios':
        const correiosResult = await createCorreiosShipment(shipmentData);
        trackingCode = correiosResult.tracking_code;
        shippingCost = correiosResult.cost;
        break;
      
      case 'melhor_envio':
        melhorEnvioResult = await createMelhorEnvioShipment(shipmentData);
        trackingCode = melhorEnvioResult.tracking_code;
        shippingCost = melhorEnvioResult.cost;
        break;
      
      case 'jadlog':
        const jadlogResult = await createJadlogShipment(shipmentData);
        trackingCode = jadlogResult.tracking_code;
        shippingCost = jadlogResult.cost;
        break;
      
      default:
        throw new Error('Transportadora não suportada');
    }

    // Salvar informações do envio
    // Para Melhor Envio, buscar label_url e shipment_id se disponíveis
    let labelUrl: string | undefined;
    let shipmentId: number | undefined;
    
    if (shipmentData.carrier === 'melhor_envio' && melhorEnvioResult) {
      labelUrl = melhorEnvioResult.label_url;
      shipmentId = melhorEnvioResult.shipment_id;
    }

    interface ShipmentInsertData {
      payment_id: string;
      carrier: string;
      service_type: string;
      tracking_code: string;
      status: string;
      shipping_cost: number;
      declared_value: number;
      weight: number;
      dimensions: { length: number; width: number; height: number };
      label_url?: string;
      melhor_envio_id?: number;
    }
    
    const shipmentInsertData: ShipmentInsertData = {
      payment_id: shipmentData.payment_id,
      carrier: shipmentData.carrier,
      service_type: shipmentData.service_type,
      tracking_code: trackingCode,
      status: shipmentData.carrier === 'melhor_envio' ? 'shipped' : 'created',
      shipping_cost: shippingCost,
      declared_value: shipmentData.declared_value,
      weight: shipmentData.weight,
      dimensions: shipmentData.dimensions
    };

    // Adicionar label_url se disponível (campo pode não existir na tabela)
    if (labelUrl) {
      shipmentInsertData.label_url = labelUrl;
    }

    const { data: shipmentDataResult, error: shipmentError } = await supabase
      .from('shipments')
      .insert(shipmentInsertData)
      .select()
      .single();

    if (shipmentError) throw shipmentError;

    // Atualizar tabela payments
    await supabase
      .from('payments')
      .update({
        shipping_address: shipmentData.address,
        tracking_code: trackingCode,
        shipping_carrier: shipmentData.carrier,
        shipping_service: shipmentData.service_type,
        shipping_cost: shippingCost,
        shipping_status: 'created'
      })
      .eq('id', shipmentData.payment_id);

    return {
      success: true,
      tracking_code: trackingCode
    };
  } catch (error) {
    console.error('Erro ao criar envio:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// ============================================
// RASTREAMENTO
// ============================================

export async function trackShipment(trackingCode: string): Promise<{
  success: boolean;
  events?: TrackingEvent[];
  error?: string;
}> {
  try {
    const supabase = createClientComponentClient();

    // Buscar informações do envio
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('tracking_code', trackingCode)
      .single();

    if (shipmentError) throw shipmentError;

    // Buscar eventos de rastreamento
    const { data: events, error: eventsError } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('shipment_id', shipment.id)
      .order('event_date', { ascending: false });

    if (eventsError) throw eventsError;

    return {
      success: true,
      events: events || []
    };
  } catch (error) {
    console.error('Erro ao rastrear envio:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// ============================================
// INTEGRAÇÕES COM TRANSPORTADORAS
// ============================================

async function createCorreiosShipment(data: ShipmentData): Promise<{
  tracking_code: string;
  cost: number;
}> {
  // Implementação da API dos Correios
  // Por enquanto, retorna dados mock
  return {
    tracking_code: `BR${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    cost: 15.00
  };
}

async function createMelhorEnvioShipment(data: ShipmentData): Promise<{
  tracking_code: string;
  cost: number;
  label_url?: string;
  shipment_id?: number;
}> {
  try {
    const { createMelhorEnvioShipment: createME, generateMelhorEnvioLabel } = await import('./melhor-envio');
    
    // Buscar CEP de origem do banco ou usar padrão
    const supabase = createClientComponentClient();
    const { data: config } = await supabase
      .from('shipping_configs')
      .select('origin_postal_code')
      .eq('carrier', 'melhor_envio')
      .eq('is_active', true)
      .limit(1)
      .single();

    const originCEP = config?.origin_postal_code || '88010001';

    // Extrair dados de endereço de origem (precisa estar configurado)
    // Por enquanto, vamos precisar que seja passado ou buscar do banco
    const originAddress = await getOriginAddress(originCEP, supabase);

    if (!originAddress) {
      console.warn('⚠️ Endereço de origem não configurado. Usando envio mock temporário.');
      // Se o endereço de origem não estiver configurado, criar um envio mock temporário
      // Isso permite que o sistema funcione mesmo sem configuração completa do Melhor Envio
      // Em produção, você deve configurar as variáveis de ambiente:
      // SHIPPING_ORIGIN_NAME, SHIPPING_ORIGIN_PHONE, SHIPPING_ORIGIN_EMAIL, SHIPPING_ORIGIN_DOCUMENT
      return {
        tracking_code: `ME${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        cost: data.expected_cost || 0, // Usar custo esperado se disponível
      };
    }

    // Adicionar envio ao carrinho do Melhor Envio
    // Isso adiciona ao carrinho, mas ainda não cria o envio
    const shipment = await createME({
      serviceId: parseInt(data.service_type) || 0, // Deve ser o ID do serviço do Melhor Envio
      from: {
        name: originAddress.name,
        phone: originAddress.phone,
        email: originAddress.email,
        document: originAddress.document,
        address: originAddress.street,
        complement: originAddress.complement || '',
        number: originAddress.number,
        district: originAddress.neighborhood,
        city: originAddress.city,
        state: originAddress.state,
        postalCode: originCEP,
      },
      to: {
        name: data.address.name,
        phone: data.address.phone,
        email: data.address.email,
        document: (data.address.document || '').replace(/\D/g, ''), // CPF/CNPJ do destinatário (apenas números)
        address: data.address.street,
        complement: data.address.complement || '',
        number: data.address.number,
        district: data.address.neighborhood,
        city: data.address.city,
        state: data.address.state,
        postalCode: data.address.postal_code,
      },
      products: [{
        name: 'Zag NFC Card',
        quantity: 1,
        unitaryValue: data.declared_value || 0,
      }],
      volumes: [{
        height: data.dimensions.height,
        width: data.dimensions.width,
        length: data.dimensions.length,
        weight: data.weight,
      }],
    });

    console.log('✅ Envio adicionado ao carrinho:', shipment);

    // FAZER CHECKOUT AUTOMÁTICO - "Comprar" o frete automaticamente
    // Após checkout, o envio será criado e terá tracking_code
    let checkoutResult = null;
    let finalTrackingCode = shipment.tracking || '';
    
    try {
      const { purchaseMelhorEnvioCart } = await import('./melhor-envio');
      console.log('🛒 Fazendo checkout automático do carrinho Melhor Envio...');
      checkoutResult = await purchaseMelhorEnvioCart();
      console.log('✅ Checkout realizado com sucesso:', checkoutResult);
      
      // Buscar tracking_code atualizado após checkout
      if (checkoutResult?.orders && checkoutResult.orders.length > 0) {
        // Procurar o order correspondente ao shipment.id
        interface CheckoutOrder {
          id: number;
          service_id: number;
          tracking?: string;
        }
        
        const matchingOrder = checkoutResult.orders.find((order: CheckoutOrder) => 
          order.id === shipment.id || order.service_id === parseInt(data.service_type) || 0
        );
        if (matchingOrder?.tracking) {
          finalTrackingCode = matchingOrder.tracking;
          console.log('✅ Tracking code atualizado após checkout:', finalTrackingCode);
        }
      }
    } catch (checkoutError) {
      console.warn('⚠️ Erro ao fazer checkout automático:', checkoutError);
      console.warn('⚠️ O envio foi criado, mas precisa fazer checkout manualmente na plataforma Melhor Envio');
      // Continuar sem checkout - envio ficará pendente
    }

    // Gerar etiqueta (após checkout, a etiqueta deve ficar ativa)
    let labelUrl: string | undefined;
    try {
      // Aguardar um pouco para o checkout processar (se foi feito)
      if (checkoutResult?.purchased) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const label = await generateMelhorEnvioLabel(shipment.id);
      labelUrl = label.url;
      console.log('✅ Etiqueta gerada com sucesso:', labelUrl);
    } catch (labelError) {
      console.warn('⚠️ Erro ao gerar etiqueta:', labelError);
      if (!checkoutResult?.purchased) {
        console.warn('⚠️ Etiqueta não pode ser gerada sem checkout. Faça checkout na plataforma Melhor Envio.');
      }
    }

    return {
      tracking_code: finalTrackingCode,
      cost: parseFloat(data.service_type) || 0, // Custo já foi calculado antes
      label_url: labelUrl,
      shipment_id: shipment.id,
    };
  } catch (error) {
    console.error('❌ Erro ao criar envio no Melhor Envio:', error);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOriginAddress(postalCode: string, supabase: any): Promise<{
  name: string;
  phone: string;
  email: string;
  document: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
} | null> {
  // Buscar informações da empresa/remetente
  // Por enquanto retorna null - precisa ser configurado
  // Você pode criar uma tabela shipping_origin_addresses ou usar env vars
  const originName = process.env.SHIPPING_ORIGIN_NAME || '';
  const originPhone = process.env.SHIPPING_ORIGIN_PHONE || '';
  const originEmail = process.env.SHIPPING_ORIGIN_EMAIL || '';
  const originDocument = process.env.SHIPPING_ORIGIN_DOCUMENT || '';

  if (!originName || !originPhone || !originEmail || !originDocument) {
    return null;
  }

  // Buscar endereço pelo CEP
  try {
    const response = await fetch(`https://viacep.com.br/ws/${postalCode}/json/`);
    const addressData = await response.json();
    
    if (addressData.erro) {
      return null;
    }

    return {
      name: originName,
      phone: originPhone,
      email: originEmail,
      document: originDocument,
      street: addressData.logradouro || '',
      number: process.env.SHIPPING_ORIGIN_NUMBER || '1',
      complement: process.env.SHIPPING_ORIGIN_COMPLEMENT || '',
      neighborhood: addressData.bairro || '',
      city: addressData.localidade || '',
      state: addressData.uf || '',
    };
  } catch {
    return null;
  }
}

async function createJadlogShipment(data: ShipmentData): Promise<{
  tracking_code: string;
  cost: number;
}> {
  // Implementação da API da Jadlog
  // Por enquanto, retorna dados mock
  return {
    tracking_code: `JL${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    cost: 18.00
  };
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

async function getStateFromCEP(postalCode: string): Promise<string> {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${postalCode}/json/`);
    const data = await response.json();
    return data.uf || '';
  } catch {
    return '';
  }
}

function getServiceDescription(carrier: string, serviceType: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    correios: {
      'PAC': 'PAC - Envio econômico',
      'SEDEX': 'SEDEX - Envio expresso',
      'SEDEX_10': 'SEDEX 10 - Entrega até 10h'
    },
    melhor_envio: {
      'PAC': 'PAC via Melhor Envio',
      'SEDEX': 'SEDEX via Melhor Envio'
    },
    jadlog: {
      'PACKAGE': 'Jadlog Package'
    },
    total_express: {
      'EXPRESS': 'Total Express'
    }
  };

  return descriptions[carrier]?.[serviceType] || `${carrier} - ${serviceType}`;
}

// ============================================
// WEBHOOKS DE ATUALIZAÇÃO
// ============================================

export async function updateShipmentStatus(
  trackingCode: string,
  status: string,
  description: string,
  location?: string
): Promise<void> {
  try {
    const supabase = createClientComponentClient();

    // Buscar envio
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('id')
      .eq('tracking_code', trackingCode)
      .single();

    if (shipmentError) throw shipmentError;

    // Adicionar evento de rastreamento
    await supabase
      .from('tracking_events')
      .insert({
        shipment_id: shipment.id,
        status,
        description,
        location,
        event_date: new Date().toISOString()
      });

    // Atualizar status do envio
    await supabase
      .from('shipments')
      .update({ status })
      .eq('id', shipment.id);

    // Atualizar status na tabela payments
    await supabase
      .from('payments')
      .update({ shipping_status: status })
      .eq('tracking_code', trackingCode);

  } catch (error) {
    console.error('Erro ao atualizar status do envio:', error);
  }
}
