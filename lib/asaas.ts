// Serviço de integração com Asaas API
// Documentação: https://docs.asaas.com/reference/overview

import type {
  AsaasCustomer,
  AsaasPayment,
  AsaasPaymentLink,
  CreatePaymentLinkRequest,
  CreatePaymentRequest,
} from '@/types/asaas';

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmQzNTEzODQ1LTI4ZTEtNDNjNi05NjhiLWRhODVhZDRiZTRjNzo6JGFhY2hfYWExMGQ5MzMtNjkzYy00YmJjLWI2NjItM2JkMGZlMWEyYzQy';

if (!ASAAS_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ ASAAS_API_KEY não configurada!');
}

// Headers padrão para requisições
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'access_token': ASAAS_API_KEY || '',
});

/**
 * Cria ou atualiza um cliente no Asaas
 */
export async function createOrUpdateCustomer(customer: AsaasCustomer): Promise<AsaasCustomer> {
  try {
    const response = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(customer),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao criar cliente: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar cliente no Asaas:', error);
    throw error;
  }
}

/**
 * Cria uma cobrança no Asaas
 */
export async function createPayment(payment: CreatePaymentRequest): Promise<AsaasPayment> {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payment),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao criar cobrança: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar cobrança no Asaas:', error);
    throw error;
  }
}

/**
 * Cria cobrança e processa pagamento com cartão de crédito
 * Observação: Para cartão, `billingType` deve ser 'CREDIT_CARD' e é necessário enviar `creditCard` e `creditCardHolderInfo`.
 */
export async function createCreditCardPayment(payment: CreatePaymentRequest): Promise<AsaasPayment> {
  try {
    const payload: CreatePaymentRequest = {
      ...payment,
      billingType: 'CREDIT_CARD',
    };

    const response = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorBody: any = null;
      try { errorBody = await response.json(); } catch {}
      throw new Error(`Erro ao criar cobrança no cartão: ${JSON.stringify({ status: response.status, body: errorBody })}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar cobrança com cartão no Asaas:', error);
    throw error;
  }
}

/**
 * Busca uma cobrança específica
 */
export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao buscar cobrança: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar cobrança no Asaas:', error);
    throw error;
  }
}

/**
 * Busca QR Code PIX de uma cobrança
 */
export async function getPixQrCode(paymentId: string): Promise<{
  encodedImage: string;
  payload: string;
  expirationDate: string;
}> {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}/pixQrCode`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao buscar QR Code PIX: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar QR Code PIX:', error);
    throw error;
  }
}

/**
 * Cria um link de pagamento reutilizável
 */
export async function createPaymentLink(
  link: CreatePaymentLinkRequest
): Promise<AsaasPaymentLink> {
  try {
    const response = await fetch(`${ASAAS_API_URL}/paymentLinks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(link),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao criar link de pagamento: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao criar link de pagamento:', error);
    throw error;
  }
}

/**
 * Lista links de pagamento
 */
export async function listPaymentLinks(): Promise<{ data: AsaasPaymentLink[] }> {
  try {
    const response = await fetch(`${ASAAS_API_URL}/paymentLinks`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao listar links de pagamento: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao listar links de pagamento:', error);
    throw error;
  }
}

/**
 * Busca cobranças de um cliente
 */
export async function getCustomerPayments(customerId: string): Promise<{ data: AsaasPayment[] }> {
  try {
    const response = await fetch(
      `${ASAAS_API_URL}/payments?customer=${customerId}&limit=100`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao buscar cobranças do cliente: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar cobranças do cliente:', error);
    throw error;
  }
}

/**
 * Confirma recebimento de pagamento em dinheiro
 */
export async function confirmPaymentInCash(paymentId: string): Promise<AsaasPayment> {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}/receiveInCash`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao confirmar pagamento: ${JSON.stringify(error)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao confirmar pagamento:', error);
    throw error;
  }
}

