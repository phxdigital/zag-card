import { ArrowRight, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="badge">
            <Zap className="h-4 w-4" />
            <span>Tecnologia NFC de Última Geração</span>
          </div>

          <h1>
            Transforme Conexões em{" "}
            <span style={{ background: 'linear-gradient(to right, #2563eb, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Oportunidades
            </span>
          </h1>

          <p>
            Seu cartão de visita digital inteligente. Compartilhe suas informações profissionais com um simples toque ou
            QR code.
          </p>

          <div className="hero-buttons">
            <a href="#" className="btn-lg btn-primary-lg">
              Começar Agora
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#" className="btn-lg btn-outline">
              Ver Demonstração
            </a>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="stat-number">100%</div>
              <div className="stat-label">Digital e Sustentável</div>
            </div>
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Atualizações em Tempo Real</div>
            </div>
            <div className="stat">
              <div className="stat-number">∞</div>
              <div className="stat-label">Compartilhamentos Ilimitados</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
