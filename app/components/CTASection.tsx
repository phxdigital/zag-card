import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="section">
      <div className="container">
        <div className="cta">
          <h2>Pronto Para Revolucionar Seu Networking?</h2>
          <p>Junte-se a milhares de profissionais que já transformaram a forma como fazem conexões</p>
          <a href="#" className="cta-button">
            Começar Agora
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
