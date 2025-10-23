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

export async function calculateShipping(
  origin: string,
  destination: string,
  weight: number,
  dimensions: { length: number; width: number; height: number }
): Promise<ShippingOption[]> {
  try {
    const supabase = createClientComponentClient();
    
    // Buscar configurações de frete ativas
    const { data: configs, error } = await supabase
      .from('shipping_configs')
      .select('*')
      .eq('is_active', true)
      .eq('origin_postal_code', origin);

    if (error) throw error;

    const options: ShippingOption[] = [];

    for (const config of configs) {
      const cost = Math.max(
        config.base_cost + (weight * config.cost_per_kg),
        config.min_cost
      );

      // Verificar se o destino está nas regiões permitidas
      if (config.allowed_states && config.allowed_states.length > 0) {
        const destinationState = await getStateFromCEP(destination);
        if (!config.allowed_states.includes(destinationState)) {
          continue;
        }
      }

      // Verificar se o destino não está nas regiões excluídas
      if (config.excluded_states && config.excluded_states.length > 0) {
        const destinationState = await getStateFromCEP(destination);
        if (config.excluded_states.includes(destinationState)) {
          continue;
        }
      }

      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + config.max_days);

      options.push({
        carrier: config.carrier,
        service_type: config.service_type,
        cost: cost,
        estimated_days: config.max_days,
        estimated_delivery: estimatedDelivery.toISOString().split('T')[0],
        description: getServiceDescription(config.carrier, config.service_type)
      });
    }

    // Ordenar por custo
    return options.sort((a, b) => a.cost - b.cost);
  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    return [];
  }
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
    const { data: addressData, error: addressError } = await supabase
      .from('shipping_addresses')
      .insert({
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
      })
      .select()
      .single();

    if (addressError) throw addressError;

    // Criar envio baseado na transportadora
    let trackingCode: string;
    let shippingCost: number;

    switch (shipmentData.carrier) {
      case 'correios':
        const correiosResult = await createCorreiosShipment(shipmentData);
        trackingCode = correiosResult.tracking_code;
        shippingCost = correiosResult.cost;
        break;
      
      case 'melhor_envio':
        const melhorEnvioResult = await createMelhorEnvioShipment(shipmentData);
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
    const { data: shipmentDataResult, error: shipmentError } = await supabase
      .from('shipments')
      .insert({
        payment_id: shipmentData.payment_id,
        carrier: shipmentData.carrier,
        service_type: shipmentData.service_type,
        tracking_code: trackingCode,
        status: 'created',
        shipping_cost: shippingCost,
        declared_value: shipmentData.declared_value,
        weight: shipmentData.weight,
        dimensions: shipmentData.dimensions
      })
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
}> {
  // Implementação da API do Melhor Envio
  // Por enquanto, retorna dados mock
  return {
    tracking_code: `ME${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    cost: 12.00
  };
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
