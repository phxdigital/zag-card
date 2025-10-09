import { Smartphone, UserPlus, Share2 } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Crie Seu Perfil",
    description: "Configure suas informações profissionais e personalize sua página em minutos.",
  },
  {
    icon: Smartphone,
    title: "Receba Seu Cartão",
    description: "Receba seu cartão NFC físico com design moderno e tecnologia de ponta.",
  },
  {
    icon: Share2,
    title: "Compartilhe Instantaneamente",
    description: "Aproxime seu cartão de qualquer smartphone ou mostre o QR code para compartilhar.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section how-it-works">
      <div className="container">
        <div className="section-header">
          <h2>Como Funciona</h2>
          <p>Três passos simples para revolucionar seu networking</p>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-icon">
                <step.icon />
              </div>
              <div className="step-number">Passo {index + 1}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
