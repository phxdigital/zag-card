// FAQ Section with simple expandable items

const faqs = [
  {
    question: &ldquo;O que é tecnologia NFC?&rdquo;,
    answer:
      &ldquo;NFC (Near Field Communication) é uma tecnologia de comunicação sem fio de curto alcance que permite a troca de dados entre dispositivos próximos. No caso do Zag NFC, basta aproximar o cartão de um smartphone para compartilhar suas informações instantaneamente.&rdquo;,
  },
  {
    question: "Funciona em todos os smartphones?",
    answer:
      "Sim! A maioria dos smartphones modernos possui tecnologia NFC. Para dispositivos sem NFC, oferecemos um QR code integrado que funciona em qualquer câmera de smartphone.",
  },
  {
    question: "Posso atualizar minhas informações depois?",
    answer:
      "Absolutamente! Uma das grandes vantagens do Zag NFC é que você pode atualizar suas informações a qualquer momento através do painel de controle, sem precisar de um novo cartão.",
  },
  {
    question: "Como funciona a integração com PIX?",
    answer:
      "Você pode adicionar sua chave PIX ao seu perfil, permitindo que clientes façam pagamentos diretamente através do seu cartão digital. É rápido, seguro e conveniente.",
  },
  {
    question: "O cartão é seguro?",
    answer:
      "Sim! Utilizamos criptografia de ponta a ponta para proteger seus dados. Você tem controle total sobre quais informações compartilhar e pode desativar o cartão a qualquer momento.",
  },
  {
    question: "Quanto tempo leva para receber o cartão?",
    answer:
      "Após a confirmação do pagamento, seu cartão é produzido e enviado em até 3 dias úteis. O prazo de entrega varia conforme sua localização.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="section">
      <div className="container">
        <div className="section-header">
          <h2>Perguntas Frequentes</h2>
          <p>Tudo que você precisa saber sobre o Zag NFC</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <h3 className="faq-question">{faq.question}</h3>
              <p className="faq-answer">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
