import { Check } from "lucide-react"

const plans = [
  {
    name: "Básico",
    price: "R$ 29",
    description: "Perfeito para começar",
    features: [
      "1 Cartão NFC",
      "Página web personalizada",
      "QR Code integrado",
      "Atualizações ilimitadas",
      "Suporte por email",
    ],
  },
  {
    name: "Duo",
    price: "R$ 159",
    description: "Para você e sua equipe",
    features: [
      "2 Cartões NFC",
      "Páginas web personalizadas",
      "QR Codes integrados",
      "Atualizações ilimitadas",
      "Integração PIX",
      "Suporte prioritário",
    ],
    popular: true,
  },
  {
    name: "Trio",
    price: "R$ 229",
    description: "Máximo valor para equipes",
    features: [
      "3 Cartões NFC",
      "Páginas web personalizadas",
      "QR Codes integrados",
      "Atualizações ilimitadas",
      "Integração PIX",
      "Analytics avançado",
      "Suporte VIP 24/7",
    ],
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="section bg-muted">
      <div className="container">
        <div className="section-header">
          <h2>Planos Para Todos os Profissionais</h2>
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
                <div className="pricing-price">{plan.price}</div>
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
                className={`pricing-button ${plan.popular ? 'primary' : 'outline'}`}
              >
                Escolher {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
