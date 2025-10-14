import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Corretor de Imóveis",
    content: "Desde que comecei a usar o Zag NFC, minhas conversões aumentaram 40%. Os clientes adoram a praticidade!",
    rating: 5,
  },
  {
    name: "Ana Paula Costa",
    role: "Consultora de Vendas",
    content: "Profissional, moderno e super fácil de usar. Meus clientes sempre comentam sobre o cartão digital.",
    rating: 5,
  },
  {
    name: "Roberto Mendes",
    role: "Empresário",
    content: "A integração com PIX foi um diferencial. Facilita muito receber pagamentos dos clientes.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <h2>O Que Nossos Clientes Dizem</h2>
          <p>Profissionais que transformaram seu networking com Zag NFC</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="stars">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="star" />
                ))}
              </div>
              <p className="testimonial-text">&quot;{testimonial.content}&quot;</p>
              <div>
                <div className="testimonial-author">{testimonial.name}</div>
                <div className="testimonial-role">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
