// Tipos para integração com Asaas API
// Documentação: https://docs.asaas.com/reference/overview

export interface AsaasCustomer {
  id?: string;
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  mobilePhone?: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'RECEIVED_IN_CASH' | 'REFUND_REQUESTED' | 'CHARGEBACK_REQUESTED' | 'CHARGEBACK_DISPUTE' | 'AWAITING_CHARGEBACK_REVERSAL' | 'DUNNING_REQUESTED' | 'DUNNING_RECEIVED' | 'AWAITING_RISK_ANALYSIS';
  invoiceUrl?: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  pixTransaction?: {
    encodedImage: string;
    payload: string;
    expirationDate: string;
  };
}

export interface AsaasPaymentLink {
  id: string;
  name: string;
  value?: number;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  chargeType: 'DETACHED' | 'RECURRENT';
  url: string;
  active: boolean;
}

export interface AsaasWebhook {
  event: 
    | 'PAYMENT_CREATED'
    | 'PAYMENT_UPDATED'
    | 'PAYMENT_CONFIRMED'
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_OVERDUE'
    | 'PAYMENT_DELETED'
    | 'PAYMENT_RESTORED'
    | 'PAYMENT_REFUNDED'
    | 'PAYMENT_RECEIVED_IN_CASH_UNDONE'
    | 'PAYMENT_CHARGEBACK_REQUESTED'
    | 'PAYMENT_CHARGEBACK_DISPUTE'
    | 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL'
    | 'PAYMENT_DUNNING_RECEIVED'
    | 'PAYMENT_DUNNING_REQUESTED'
    | 'PAYMENT_BANK_SLIP_VIEWED'
    | 'PAYMENT_CHECKOUT_VIEWED';
  payment: AsaasPayment;
}

export interface CreatePaymentLinkRequest {
  name: string;
  description?: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  chargeType: 'DETACHED' | 'RECURRENT';
  value?: number;
  endDate?: string;
  maxInstallmentCount?: number;
  notificationEnabled?: boolean;
}

export interface CreatePaymentRequest {
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
  discount?: {
    value: number;
    dueDateLimitDays: number;
  };
  interest?: {
    value: number;
  };
  fine?: {
    value: number;
  };
  postalService?: boolean;
}

