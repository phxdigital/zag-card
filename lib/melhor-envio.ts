// ============================================
// INTEGRAÇÃO COM MELHOR ENVIO API
// ============================================

// Carregar variáveis de ambiente explicitamente
import { loadEnv, getEnv } from './env-loader';

// Carregar variáveis de ambiente
loadEnv();

const MELHOR_ENVIO_API_URL = 'https://www.melhorenvio.com.br/api/v2/me';

// Tipos da API do Melhor Envio
interface MelhorEnvioCalculateRequest {
  from: {
    postal_code: string;
  };
  to: {
    postal_code: string;
  };
  products: Array<{
    id: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    insurance_value: number;
    quantity: number;
  }>;
  services?: string; // IDs dos serviços separados por vírgula
}

interface MelhorEnvioCompany {
  id: number;
  name: string;
  picture?: string;
  status?: string;
}

interface MelhorEnvioShippingOption {
  id: number;
  name: string;
  company: {
    id: number;
    name: string;
  };
  price: string;
  currency: string;
  delivery_time: number;
  delivery_range: {
    min: number;
    max: number;
  };
  packages: Array<{
    price: string;
    discount: string;
    format: string;
    dimensions: {
      height: number;
      width: number;
      length: number;
    };
    weight: number;
    insurance_value: number;
    products: Array<{
      id: string;
      quantity: number;
    }>;
  }>;
}

interface MelhorEnvioCreateShipmentRequest {
  service: number;
  from: {
    name: string;
    phone: string;
    email: string;
    document: string;
    company_document?: string;
    state_register?: string;
    address: string;
    complement: string;
    number: string;
    district: string;
    city: string;
    state_abbr: string;
    country_id: string;
    postal_code: string;
  };
  to: {
    name: string;
    phone: string;
    email: string;
    document: string;
    address: string;
    complement?: string;
    number: string;
    district: string;
    city: string;
    state_abbr: string;
    country_id: string;
    postal_code: string;
  };
  products: Array<{
    name: string;
    quantity: number;
    unitary_value: number;
  }>;
  volumes: Array<{
    height: number;
    width: number;
    length: number;
    weight: number;
  }>;
}

interface MelhorEnvioShipmentResponse {
  id: number;
  protocol: string;
  service_id: number;
  status: string;
  tracking: string;
  label?: {
    url: string;
  };
  invoice?: {
    key: string;
  };
}

// ============================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================

function getToken(): string {
  // Usar o loader centralizado de env
  const token = getEnv('MELHOR_ENVIO_TOKEN');
  
  if (!token) {
    // Log para debug
    console.error('❌ MELHOR_ENVIO_TOKEN não encontrado');
    console.error('Process.cwd():', process.cwd());
    console.error('Verificando arquivos .env em:', process.cwd());
    console.error('Variáveis de ambiente disponíveis:', {
      has_token: !!process.env.MELHOR_ENVIO_TOKEN,
      token_length: process.env.MELHOR_ENVIO_TOKEN?.length,
      env_keys: Object.keys(process.env).filter(k => k.includes('MELHOR') || k.includes('ENVIO'))
    });
    throw new Error('MELHOR_ENVIO_TOKEN não configurado. Adicione MELHOR_ENVIO_TOKEN=seu_token no arquivo .env.local na raiz do projeto e reinicie o servidor.');
  }
  
  // Remover espaços em branco se houver
  return token.trim();
}

async function makeRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' = 'GET',
  body?: unknown
): Promise<T> {
  const token = getToken();
  const url = `${MELHOR_ENVIO_API_URL}${endpoint}`;
  
  console.log(`🔗 Requisição Melhor Envio: ${method} ${endpoint}`);
  if (body) {
    console.log('📤 Body:', JSON.stringify(body, null, 2));
  }
  
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Zag NFC Card App (contact@zagcard.com.br)'
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  console.log(`📥 Resposta: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Erro na API Melhor Envio (${response.status}):`, errorText);
    throw new Error(`Erro na API Melhor Envio: ${response.status} - ${errorText}`);
  }

  const jsonResponse = await response.json();
  console.log('📦 Resposta JSON:', typeof jsonResponse, Array.isArray(jsonResponse) ? `${jsonResponse.length} itens` : 'objeto');
  
  return jsonResponse as T;
}

// ============================================
// CÁLCULO DE FRETE
// ============================================

export async function calculateMelhorEnvioShipping(
  originPostalCode: string,
  destinationPostalCode: string,
  products: Array<{
    weight: number;
    dimensions: { length: number; width: number; height: number };
    value?: number;
    quantity?: number;
  }>
): Promise<MelhorEnvioShippingOption[]> {
  try {
    const requestBody: MelhorEnvioCalculateRequest = {
      from: {
        postal_code: originPostalCode.replace(/\D/g, ''),
      },
      to: {
        postal_code: destinationPostalCode.replace(/\D/g, ''),
      },
      products: products.map((product, index) => ({
        id: `product-${index}`,
        width: product.dimensions.width,
        height: product.dimensions.height,
        length: product.dimensions.length,
        weight: product.weight,
        insurance_value: product.value || 0,
        quantity: product.quantity || 1,
      })),
    };

    console.log('📦 Calculando frete no Melhor Envio:', {
      origin: originPostalCode.replace(/\D/g, ''),
      destination: destinationPostalCode.replace(/\D/g, ''),
      productsCount: products.length,
      requestBody
    });

    // Tentar endpoint /cart/calculate primeiro (endpoint recomendado pela documentação)
    let response: MelhorEnvioShippingOption[] | { data?: unknown } | unknown;
    
    try {
      console.log('🔄 Tentando endpoint /cart/calculate...');
      response = await makeRequest<MelhorEnvioShippingOption[]>(
        '/cart/calculate',
        'POST',
        requestBody
      );
      console.log('✅ Resposta de /cart/calculate:', typeof response, Array.isArray(response) ? response.length : 'não é array');
    } catch (error) {
      console.warn('⚠️ Erro em /cart/calculate, tentando /shipments/calculate...', error);
      
      // Fallback para /shipments/calculate se /cart/calculate falhar
      try {
        response = await makeRequest<MelhorEnvioShippingOption[]>(
          '/shipments/calculate',
          'POST',
          requestBody
        );
        console.log('✅ Resposta de /shipments/calculate:', typeof response, Array.isArray(response) ? response.length : 'não é array');
      } catch (secondError) {
        console.error('❌ Erro em ambos os endpoints:', secondError);
        throw secondError;
      }
    }

    // Se a resposta não for um array, pode ser um objeto com 'data'
    if (!Array.isArray(response)) {
      console.log('📦 Resposta não é array, processando estrutura...', typeof response);
      const responseObj = response as { data?: unknown } | unknown;
      const data = (typeof responseObj === 'object' && responseObj !== null && 'data' in responseObj) 
        ? (responseObj as { data: unknown }).data 
        : response;
      
      if (Array.isArray(data)) {
        console.log('✅ Array encontrado em data:', data.length);
        return data as MelhorEnvioShippingOption[];
      }
      
      if (data && typeof data === 'object') {
        console.log('✅ Objeto único encontrado, convertendo para array');
        return [data as MelhorEnvioShippingOption];
      }
      
      console.warn('⚠️ Formato de resposta não reconhecido:', typeof data, data);
      return [];
    }

    console.log('✅ Retornando', response.length, 'opções de frete');
    return response;
  } catch (error) {
    console.error('❌ Erro ao calcular frete no Melhor Envio:', error);
    if (error instanceof Error) {
      console.error('Erro detalhado:', error.message, error.stack);
    }
    throw error;
  }
}

// ============================================
// CRIAÇÃO DE ENVIO
// ============================================

export async function createMelhorEnvioShipment(
  shipmentData: {
    serviceId: number;
    from: {
      name: string;
      phone: string;
      email: string;
      document: string;
      address: string;
      complement?: string;
      number: string;
      district: string;
      city: string;
      state: string;
      postalCode: string;
    };
    to: {
      name: string;
      phone: string;
      email: string;
      document: string;
      address: string;
      complement?: string;
      number: string;
      district: string;
      city: string;
      state: string;
      postalCode: string;
    };
    products: Array<{
      name: string;
      quantity: number;
      unitaryValue: number;
    }>;
    volumes: Array<{
      height: number;
      width: number;
      length: number;
      weight: number;
    }>;
  }
): Promise<MelhorEnvioShipmentResponse> {
  try {
    const requestBody: MelhorEnvioCreateShipmentRequest = {
      service: shipmentData.serviceId,
      from: {
        name: shipmentData.from.name,
        phone: shipmentData.from.phone.replace(/\D/g, ''),
        email: shipmentData.from.email,
        document: shipmentData.from.document.replace(/\D/g, ''),
        address: shipmentData.from.address,
        complement: shipmentData.from.complement || '',
        number: shipmentData.from.number,
        district: shipmentData.from.district,
        city: shipmentData.from.city,
        state_abbr: shipmentData.from.state,
        country_id: 'BR',
        postal_code: shipmentData.from.postalCode.replace(/\D/g, ''),
      },
      to: {
        name: shipmentData.to.name,
        phone: shipmentData.to.phone.replace(/\D/g, ''),
        email: shipmentData.to.email,
        document: shipmentData.to.document.replace(/\D/g, ''),
        address: shipmentData.to.address,
        complement: shipmentData.to.complement || '',
        number: shipmentData.to.number,
        district: shipmentData.to.district,
        city: shipmentData.to.city,
        state_abbr: shipmentData.to.state,
        country_id: 'BR',
        postal_code: shipmentData.to.postalCode.replace(/\D/g, ''),
      },
      products: shipmentData.products.map(p => ({
        name: p.name,
        quantity: p.quantity,
        unitary_value: p.unitaryValue,
      })),
      volumes: shipmentData.volumes,
    };

    // No Melhor Envio, o fluxo correto é adicionar ao carrinho primeiro
    // Endpoint correto: POST /cart para adicionar envio ao carrinho
    const response = await makeRequest<MelhorEnvioShipmentResponse>(
      '/cart',
      'POST',
      requestBody
    );

    return response;
  } catch (error) {
    console.error('❌ Erro ao criar envio no Melhor Envio:', error);
    throw error;
  }
}

// ============================================
// GERAR ETIQUETA
// ============================================

export async function generateMelhorEnvioLabel(shipmentId: number): Promise<{
  url: string;
  base64?: string;
}> {
  try {
    const response = await makeRequest<{ url: string }>(
      `/shipment/${shipmentId}/label`,
      'GET'
    );

    return response;
  } catch (error) {
    console.error('❌ Erro ao gerar etiqueta no Melhor Envio:', error);
    throw error;
  }
}

// ============================================
// BUSCAR ENVIO
// ============================================

export async function getMelhorEnvioShipment(shipmentId: number): Promise<MelhorEnvioShipmentResponse> {
  try {
    const response = await makeRequest<MelhorEnvioShipmentResponse>(
      `/shipment/${shipmentId}`,
      'GET'
    );

    return response;
  } catch (error) {
    console.error('❌ Erro ao buscar envio no Melhor Envio:', error);
    throw error;
  }
}

// ============================================
// CHECKOUT/CARRINHO - COMPRAR ENVIO
// ============================================

export async function purchaseMelhorEnvioCart(): Promise<{
  purchased: boolean;
  orders?: Array<{
    id: number;
    protocol: string;
    service_id: number;
    status: string;
    tracking: string;
  }>;
}> {
  try {
    // Fazer checkout do carrinho (comprar todos os envios pendentes)
    const response = await makeRequest<{
      purchased: boolean;
      orders?: Array<{
        id: number;
        protocol: string;
        service_id: number;
        status: string;
        tracking: string;
      }>;
    }>(
      '/cart/purchase',
      'POST'
    );

    return response;
  } catch (error) {
    console.error('❌ Erro ao fazer checkout do carrinho no Melhor Envio:', error);
    throw error;
  }
}

// ============================================
// CANCELAR ENVIO
// ============================================

export async function cancelMelhorEnvioShipment(shipmentId: number): Promise<void> {
  try {
    await makeRequest(
      `/shipment/${shipmentId}/cancel`,
      'POST'
    );
  } catch (error) {
    console.error('❌ Erro ao cancelar envio no Melhor Envio:', error);
    throw error;
  }
}

// ============================================
// OBTER INFORMAÇÕES DA CONTA
// ============================================

export async function getMelhorEnvioAccountInfo(): Promise<{
  id: number;
  name: string;
  email: string;
  phone: string;
  postal_code: string;
}> {
  try {
    const response = await makeRequest<Array<MelhorEnvioCompany & { email?: string; phone?: string; postal_code?: string }>>(
      '/companies',
      'GET'
    );

    // A API retorna um array, pegamos a primeira empresa
    if (Array.isArray(response) && response.length > 0) {
      const company = response[0];
      return {
        id: company.id,
        name: company.name,
        email: company.email || '',
        phone: company.phone || '',
        postal_code: company.postal_code || ''
      };
    }

    throw new Error('Nenhuma empresa encontrada na conta Melhor Envio');
  } catch (error) {
    console.error('❌ Erro ao buscar informações da conta Melhor Envio:', error);
    throw error;
  }
}

// ============================================
// SOLICITAR COLETA
// ============================================

/**
 * Solicita coleta de encomendas no Melhor Envio
 * @param shipmentIds Array de IDs dos envios para solicitar coleta
 * @returns Status da solicitação de coleta
 */
export async function requestMelhorEnvioPickup(shipmentIds: number[]): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    // A API do Melhor Envio geralmente solicita coleta através do endpoint /shipment/{id}/collect
    // Vamos tentar solicitar para cada envio
    const results = [];
    
    for (const shipmentId of shipmentIds) {
      try {
        const response = await makeRequest<{ success: boolean; message?: string }>(
          `/shipment/${shipmentId}/collect`,
          'POST'
        );
        results.push({ shipmentId, success: true, response });
      } catch (error) {
        console.warn(`⚠️ Erro ao solicitar coleta para envio ${shipmentId}:`, error);
        results.push({ shipmentId, success: false, error });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    if (successful > 0) {
      return {
        success: true,
        message: `Coleta solicitada para ${successful} envio(s). ${failed > 0 ? `${failed} falha(s).` : ''}`
      };
    } else {
      return {
        success: false,
        error: 'Não foi possível solicitar coleta para nenhum envio. Verifique se os envios estão no status correto.'
      };
    }
  } catch (error) {
    console.error('❌ Erro ao solicitar coleta no Melhor Envio:', error);
    // Pode ser que a API use um endpoint diferente ou não suporte coletas automatizadas
    // Nesse caso, retornamos uma mensagem informativa
    return {
      success: false,
      error: 'Funcionalidade de coleta pode não estar disponível na API do Melhor Envio. Verifique a documentação oficial.'
    };
  }
}

// ============================================
// RASTREAMENTO
// ============================================

/**
 * Rastreia um envio no Melhor Envio usando o código de rastreamento
 * @param trackingCode Código de rastreamento do envio
 * @returns Informações de rastreamento
 */
interface MelhorEnvioTracking {
  tracking: string;
  status?: string;
  events?: Array<{
    date: string;
    description: string;
    location?: string;
  }>;
}

export async function trackMelhorEnvioShipment(trackingCode: string): Promise<{
  success: boolean;
  tracking?: MelhorEnvioTracking;
  error?: string;
}> {
  try {
    // A API do Melhor Envio geralmente rastreia através do código de rastreamento
    // Endpoint pode variar, tentamos o mais comum
    const response = await makeRequest<MelhorEnvioTracking>(
      `/shipment/tracking?tracking=${trackingCode}`,
      'GET'
    );

    return {
      success: true,
      tracking: response
    };
  } catch (error) {
    console.error('❌ Erro ao rastrear envio no Melhor Envio:', error);
    return {
      success: false,
      error: 'Não foi possível rastrear o envio. Tente novamente ou rastreie diretamente no site do Melhor Envio.'
    };
  }
}

