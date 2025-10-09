// Configurações do sistema
export const config = {
  // Modo de desenvolvimento - permite criar páginas sem pagamento
  developmentMode: process.env.NODE_ENV !== 'production',
  
  // Configurações de pagamento
  payment: {
    required: process.env.NODE_ENV === 'production', // Obrigatório em produção
    asaasEnabled: !!process.env.ASAAS_API_KEY, // Habilitado se tiver chave configurada
  },
  
  // Configurações de domínio
  domain: {
    main: 'zagnfc.com.br',
    local: 'localhost:3000',
  },
  
  // Configurações de limites padrão (sobrescritos pelo plano do usuário)
  limits: {
    maxPagesPerUser: 1, // Plano gratuito/básico
    maxCustomLinks: 4,
    maxSocialLinks: 5,
  }
};

// Função para verificar se o pagamento é necessário
export const isPaymentRequired = () => {
  return !config.developmentMode && config.payment.required;
};

// Função para verificar se o usuário pode criar páginas
export const canCreatePages = () => {
  return config.developmentMode || !config.payment.required;
};
