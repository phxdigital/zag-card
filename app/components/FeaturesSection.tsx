import { Globe, Lock, Zap, CreditCard, RefreshCw, QrCode } from "lucide-react"

const features = [
  {
    icon: Globe,
    title: "Página Web Instantânea",
    description: "Configure sua página profissional em minutos com seu subdomínio personalizado.",
  },
  {
    icon: Zap,
    title: "Tecnologia NFC",
    description: "Compartilhe suas informações com um simples toque em qualquer smartphone.",
  },
  {
    icon: CreditCard,
    title: "Integração PIX",
    description: "Receba pagamentos diretamente através do seu cartão digital.",
  },
  {
    icon: RefreshCw,
    title: "Atualizações em Tempo Real",
    description: "Modifique suas informações a qualquer momento sem reimprimir cartões.",
  },
  {
    icon: Lock,
    title: "Segurança Avançada",
    description: "Seus dados protegidos com criptografia de ponta a ponta.",
  },
  {
    icon: QrCode,
    title: "QR Code Integrado",
    description: "Funciona mesmo em dispositivos sem NFC através do QR code.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="section">
      <div className="container">
        <div className="section-header">
          <h2>
            Recursos Poderosos para <span style={{ color: '#2563eb' }}>Profissionais Modernos</span>
          </h2>
          <p>
            Tudo que você precisa para fazer networking de forma eficiente e profissional
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                <feature.icon />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
