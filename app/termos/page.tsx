import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Serviço - Zag NFC',
  description: 'Termos de serviço e condições de uso da plataforma Zag NFC',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Termos de Serviço</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-700 mb-4">
                Bem-vindo à Zag NFC! Estes Termos de Serviço (&quot;Termos&quot;) regem o uso de nossa plataforma de cartão de visita digital NFC. Ao acessar ou usar nossos serviços, você concorda em cumprir e estar vinculado a estes Termos.
              </p>
              <p className="text-gray-700 mb-4">
                Se você não concordar com qualquer parte destes Termos, não deve usar nossos serviços. Recomendamos que leia estes Termos cuidadosamente antes de usar nossa plataforma.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descrição dos Serviços</h2>
              <p className="text-gray-700 mb-4">
                A Zag NFC oferece uma plataforma digital que permite aos usuários criar, gerenciar e compartilhar cartões de visita digitais através de tecnologia NFC (Near Field Communication). Nossos serviços incluem:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Criação e personalização de cartões de visita digitais</li>
                <li>Integração com tecnologia NFC para compartilhamento instantâneo</li>
                <li>Analytics e métricas de interação</li>
                <li>Integração com redes sociais e plataformas profissionais</li>
                <li>Ferramentas de gerenciamento de contatos</li>
                <li>Suporte técnico e atendimento ao cliente</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Elegibilidade e Conta de Usuário</h2>
              <h3 className="text-xl font-medium text-gray-900 mb-3">3.1 Elegibilidade</h3>
              <p className="text-gray-700 mb-4">
                Para usar nossos serviços, você deve:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Ter pelo menos 18 anos de idade ou ter o consentimento de um responsável legal</li>
                <li>Fornecer informações verdadeiras e precisas</li>
                <li>Manter a confidencialidade de sua conta e senha</li>
                <li>Ser responsável por todas as atividades em sua conta</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">3.2 Criação de Conta</h3>
              <p className="text-gray-700 mb-4">
                Para acessar certos recursos, você precisará criar uma conta. Você concorda em fornecer informações precisas e atualizadas e manter a segurança de sua senha.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Uso Aceitável</h2>
              <h3 className="text-xl font-medium text-gray-900 mb-3">4.1 Uso Permitido</h3>
              <p className="text-gray-700 mb-4">Você pode usar nossos serviços para:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Criar cartões de visita digitais profissionais</li>
                <li>Compartilhar informações de contato de forma ética</li>
                <li>Networking profissional e pessoal</li>
                <li>Promover seus negócios de forma legítima</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">4.2 Uso Proibido</h3>
              <p className="text-gray-700 mb-4">Você não pode usar nossos serviços para:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Atividades ilegais ou fraudulentas</li>
                <li>Spam, phishing ou atividades maliciosas</li>
                <li>Violar direitos de propriedade intelectual</li>
                <li>Distribuir conteúdo ofensivo, difamatório ou inadequado</li>
                <li>Interferir no funcionamento da plataforma</li>
                <li>Criar contas falsas ou usar identidades de terceiros</li>
                <li>Vender ou revender nossos serviços sem autorização</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Propriedade Intelectual</h2>
              <h3 className="text-xl font-medium text-gray-900 mb-3">5.1 Nossa Propriedade</h3>
              <p className="text-gray-700 mb-4">
                A Zag NFC e seus licenciadores detêm todos os direitos sobre a plataforma, incluindo software, design, marcas, logotipos e conteúdo. Estes materiais são protegidos por leis de propriedade intelectual.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">5.2 Seu Conteúdo</h3>
              <p className="text-gray-700 mb-4">
                Você mantém a propriedade do conteúdo que cria e compartilha através de nossa plataforma. Ao usar nossos serviços, você nos concede uma licença limitada para usar, armazenar e exibir seu conteúdo conforme necessário para fornecer os serviços.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">5.3 Licença de Uso</h3>
              <p className="text-gray-700 mb-4">
                Concedemos a você uma licença limitada, não exclusiva e revogável para usar nossa plataforma de acordo com estes Termos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Pagamentos e Faturamento</h2>
              <h3 className="text-xl font-medium text-gray-900 mb-3">6.1 Planos e Preços</h3>
              <p className="text-gray-700 mb-4">
                Oferecemos diferentes planos de assinatura com recursos variados. Os preços estão disponíveis em nossa página de preços e podem ser alterados com aviso prévio.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.2 Cobrança e Renovação</h3>
              <p className="text-gray-700 mb-4">
                As assinaturas são cobradas antecipadamente e renovadas automaticamente. Você pode cancelar sua assinatura a qualquer momento através de sua conta.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">6.3 Reembolsos</h3>
              <p className="text-gray-700 mb-4">
                Oferecemos reembolsos conforme nossa política de reembolso, disponível em nossa página de suporte.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacidade e Proteção de Dados</h2>
              <p className="text-gray-700 mb-4">
                Sua privacidade é importante para nós. Nossa coleta e uso de informações pessoais são regidos por nossa Política de Privacidade, que faz parte integrante destes Termos.
              </p>
              <p className="text-gray-700 mb-4">
                Cumprimos com a Lei Geral de Proteção de Dados (LGPD) e outras regulamentações aplicáveis de proteção de dados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitação de Responsabilidade</h2>
              <p className="text-gray-700 mb-4">
                Nossos serviços são fornecidos &quot;como estão&quot; e &quot;conforme disponível&quot;. Não garantimos que nossos serviços serão ininterruptos, livres de erros ou atenderão às suas necessidades específicas.
              </p>
              <p className="text-gray-700 mb-4">
                Em nenhuma circunstância a Zag NFC será responsável por danos indiretos, incidentais, especiais ou consequenciais, incluindo perda de lucros, dados ou oportunidades de negócio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Indenização</h2>
              <p className="text-gray-700 mb-4">
                Você concorda em indenizar e isentar a Zag NFC de qualquer reclamação, dano, perda ou despesa (incluindo honorários advocatícios) decorrentes de:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Seu uso dos serviços</li>
                <li>Violação destes Termos</li>
                <li>Violation de direitos de terceiros</li>
                <li>Conteúdo que você cria ou compartilha</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Suspensão e Encerramento</h2>
              <h3 className="text-xl font-medium text-gray-900 mb-3">10.1 Suspensão</h3>
              <p className="text-gray-700 mb-4">
                Podemos suspender sua conta temporariamente se suspeitarmos de violação destes Termos ou atividades fraudulentas.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">10.2 Encerramento</h3>
              <p className="text-gray-700 mb-4">
                Você pode encerrar sua conta a qualquer momento. Podemos encerrar sua conta com aviso prévio por violação destes Termos ou por outros motivos legítimos.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">10.3 Efeitos do Encerramento</h3>
              <p className="text-gray-700 mb-4">
                Após o encerramento, seu acesso aos serviços será revogado e seus dados podem ser excluídos conforme nossa Política de Privacidade.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Modificações dos Termos</h2>
              <p className="text-gray-700 mb-4">
                Podemos modificar estes Termos periodicamente. Notificaremos você sobre mudanças significativas através de e-mail ou aviso em nossa plataforma. Seu uso continuado dos serviços após as modificações constitui aceitação dos novos Termos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Lei Aplicável e Jurisdição</h2>
              <p className="text-gray-700 mb-4">
                Estes Termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida nos tribunais competentes de São Paulo, SP, Brasil.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Disposições Gerais</h2>
              <h3 className="text-xl font-medium text-gray-900 mb-3">13.1 Integralidade</h3>
              <p className="text-gray-700 mb-4">
                Estes Termos, juntamente com nossa Política de Privacidade, constituem o acordo integral entre você e a Zag NFC.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">13.2 Divisibilidade</h3>
              <p className="text-gray-700 mb-4">
                Se qualquer disposição destes Termos for considerada inválida, as demais disposições permanecerão em vigor.
              </p>

              <h3 className="text-xl font-medium text-gray-900 mb-3">13.3 Renúncia</h3>
              <p className="text-gray-700 mb-4">
                A falha em fazer valer qualquer direito ou disposição destes Termos não constituirá renúncia a tal direito ou disposição.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contato</h2>
              <p className="text-gray-700 mb-4">
                Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>E-mail:</strong> legal@zagnfc.com</p>
                <p className="text-gray-700 mb-2"><strong>Telefone:</strong> (61)98193-8164</p>
                <p className="text-gray-700 mb-2"><strong>Endereço:</strong> São Paulo, SP, Brasil</p>
                <p className="text-gray-700"><strong>Horário de Atendimento:</strong> Segunda a Sexta, 9h às 18h</p>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Estes Termos de Serviço foram elaborados em conformidade com a legislação brasileira e as melhores práticas de proteção ao consumidor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
