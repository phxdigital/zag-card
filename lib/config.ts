// Configurações do sistema
export const config = {
  // Modo de desenvolvimento - permite criar páginas sem pagamento
  developmentMode: true,
  
  // Configurações de pagamento
  payment: {
    required: false, // Temporariamente false para desenvolvimento
    stripeEnabled: false, // Desabilitado em desenvolvimento
  },
  
  // Configurações de domínio
  domain: {
    main: 'zagnfc.com.br',
    local: 'localhost:3000',
  },
  
  // Configurações de limites
  limits: {
    maxPagesPerUser: 10, // Limite em desenvolvimento
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
