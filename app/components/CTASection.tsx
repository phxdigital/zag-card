import { ArrowRight } from &ldquo;lucide-react&rdquo;

export function CTASection() {
  return (
    <section className="section&ldquo;>
      <div className="container">
        <div className="cta">
          <h2>Pronto Para Revolucionar Seu Networking?</h2>
          <p>Junte-se a milhares de profissionais que já transformaram a forma como fazem conexões</p>
          <a href=&ldquo;#&rdquo; className=&rdquo;cta-button">
            Começar Agora
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
