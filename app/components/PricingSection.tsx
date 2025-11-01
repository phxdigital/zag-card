'use client';

import { Check } from "lucide-react"
import { useState } from "react"
import { PaymentModal } from "./PaymentModal"

const plans = [
  {
    id: 'para_mim',
    name: "Para Mim",
    originalPrice: "R$ 129",
    price: "R$ 89",
    priceValue: 89.00,
    discount: "30% OFF",
    description: "Perfeito para o profissional",
    features: [
      "1 Cartão NFC",
      "Página web personalizada",
      "QR Code integrado",
      "Atualizações ilimitadas",
    ],
    footnote: "Advogados e escritórios jurídicos, Médicos e dentistas, Psicólogos, Nutricionistas e personal trainers, Esteticistas, cabeleireiros, barbeiros, Tatuadores, Fotógrafos e videomakers, Designers e profissionais de marketing, Consultores financeiros e contadores, Coaches e mentores, Arquitetos e engenheiros, Corretor de seguros e consórcios, Representantes comerciais",
    // Usar API ao invés de links diretos
    paymentLink: '#',
  },
  {
    id: 'para_equipe',
    name: "Para minha equipe",
    originalPrice: "R$ 645",
    price: "R$ 387",
    priceValue: 387.00,
    installments: "ou 3x de R$ 129",
    discount: "40% OFF",
    description: "Para você e sua equipe",
    features: [
      "2 Cartões NFC",
      "3 Adesivos personalizados NFC",
      "1 Página web personalizada",
      "QR Codes integrados",
      "Atualizações de páginas ilimitadas",
      "Integração PIX",
      "Estatísticas de acessos",
    ],
    popular: true,
    // Usar API ao invés de links diretos
    paymentLink: '#',
  },
  {
    id: 'para_negocio',
    name: "Para meu negócio",
    originalPrice: "R$ 2.062",
    price: "R$ 928",
    priceValue: 928.00,
    installments: "ou 3x de R$ 309",
    discount: "55% OFF",
    description: "Máximo controle para empresas",
    features: [
      "8 Cartões NFC",
      "8 Adesivos personalizados NFC",
      "8 Páginas web personalizadas",
      "QR Codes integrados",
      "Atualizações de páginas ilimitadas",
      "Integração PIX",
      "Analytics avançado",
      "Suporte VIP 24/7",
    ],
    // Usar API ao invés de links diretos
    paymentLink: '#',
  },
]

export function PricingSection() {
  const [loading, setLoading] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  const handleSelectPlan = (plan: typeof plans[0]) => {
    // Se o link de pagamento direto estiver configurado, redirecionar para ele
    if (plan.paymentLink && plan.paymentLink !== '#') {
      window.location.href = plan.paymentLink;
      return;
    }

    // Caso contrário, abrir modal para coletar dados
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const handlePaymentConfirm = async (customerData: { name: string; cpf: string; phone: string; email: string; method: 'PIX' | 'CARD'; cardMode?: 'CREDIT' | 'DEBIT' }) => {
    if (!selectedPlan) return;

    setLoading(selectedPlan.id);

    try {
      if (customerData.method === 'CARD') {
        // Ir para checkout de cartão com dados do cliente e do plano
        const payload = {
          planType: selectedPlan.id,
          value: selectedPlan.priceValue,
          description: `${selectedPlan.name} - Zag NFC Card${customerData.cardMode ? ` (${customerData.cardMode === 'CREDIT' ? 'Crédito' : 'Débito'})` : ''}`,
          customer: {
            name: customerData.name,
            cpf: customerData.cpf,
            phone: customerData.phone,
            email: customerData.email,
          },
          cardMode: customerData.cardMode || 'CREDIT',
        };
        sessionStorage.setItem('card_checkout_data', JSON.stringify(payload));
        setModalOpen(false);
        setSelectedPlan(null);
        // Redirecionar para página de loading antes do checkout
        window.location.href = '/loading-checkout?type=card';
        return;
      }

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: selectedPlan.id,
          value: selectedPlan.priceValue,
          description: `${selectedPlan.name} - Zag NFC Card`,
          customerData: {
            name: customerData.name,
            cpf: customerData.cpf,
            phone: customerData.phone,
            email: customerData.email,
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao processar pagamento');
      }

      const data = await response.json();
      
      // Fechar modal
      setModalOpen(false);
      setSelectedPlan(null);
      
      // Redirecionar para página de checkout com QR code PIX
      if (data.payment && data.payment.pix) {
        // Armazenar dados do pagamento no sessionStorage
        sessionStorage.setItem('payment_data', JSON.stringify(data.payment));
        // Redirecionar para página de loading antes do checkout
        window.location.href = '/loading-checkout?type=pix';
      } else if (data.payment && data.payment.invoiceUrl) {
        // Redirecionar para fatura
        window.location.href = data.payment.invoiceUrl;
      }

    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="section bg-muted">
      <div className="container">
        <div className="section-header">
          <h2>Soluções para Profissionais</h2>
          <p>Escolha o plano ideal para você ou sua equipe</p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && (
                <div className="popular-badge">Mais Popular</div>
              )}
              <div className="pricing-header">
                <div className="pricing-name">{plan.name}</div>
                {plan.discount && (
                  <div className="pricing-discount">{plan.discount}</div>
                )}
                <div className="pricing-price-container">
                  {plan.originalPrice && (
                    <div className="pricing-original-price">{plan.originalPrice}</div>
                  )}
                  <div className="pricing-price">{plan.price}</div>
                </div>
                {plan.installments && (
                  <div className="pricing-installments">{plan.installments}</div>
                )}
                <div className="pricing-description">{plan.description}</div>
              </div>
              <div className="pricing-features">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="pricing-feature">
                    <Check />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={loading !== null}
                className={`pricing-button ${plan.popular ? 'primary' : 'outline'} ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading === plan.id ? 'Processando...' : 'Comprar agora'}
              </button>
              {plan.footnote && (
                <div className="pricing-footnote">
                  {plan.footnote}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Modal de Pagamento */}
      {selectedPlan && (
        <PaymentModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedPlan(null);
          }}
          onConfirm={handlePaymentConfirm}
          planName={selectedPlan.name}
          planValue={selectedPlan.priceValue}
          loading={loading === selectedPlan.id}
        />
      )}
    </section>
  )
}
