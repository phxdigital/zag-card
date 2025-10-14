import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade - Zag NFC',
  description: 'Política de privacidade e proteção de dados da Zag NFC',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introdução</h2>
              <p className="text-gray-700 mb-4">
                A Zag NFC ("nós", "nosso" ou "empresa") está comprometida em proteger a privacidade e os dados pessoais de nossos usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nossos serviços de cartão de visita digital NFC.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Informações que Coletamos</h2>
              <h3 className="text-xl font-medium text-gray-900 mb-3">2.1 Informações Fornecidas por Você</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Nome completo e informações de contato</li>
                <li>Endereço de e-mail</li>
                <li>Número de telefone</li>
                <li>Informações profissionais (cargo, empresa, biografia)</li>
                <li>Redes sociais e links pessoais</li>
                <li>Fotos e imagens de perfil</li>
                <li>Informações de pagamento (processadas de forma segura)</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 mb-3">2.2 Informações Coletadas Automaticamente</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Endereço IP e localização aproximada</li>
                <li>Informações do dispositivo e navegador</li>
                <li>Dados de uso e interação com nossos serviços</li>
                <li>Cookies e tecnologias similares</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Como Usamos suas Informações</h2>
              <p className="text-gray-700 mb-4">Utilizamos suas informações pessoais para:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Fornecer e melhorar nossos serviços de cartão digital</li>
                <li>Processar pagamentos e gerenciar sua conta</li>
                <li>Comunicar-nos com você sobre atualizações e suporte</li>
                <li>Personalizar sua experiência de usuário</li>
                <li>Analisar o uso de nossos serviços para melhorias</li>
                <li>Cumprir obrigações legais e regulamentares</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Compartilhamento de Informações</h2>
              <p className="text-gray-700 mb-4">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto nas seguintes circunstâncias:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Com seu consentimento explícito</li>
                <li>Para prestadores de serviços que nos auxiliam na operação (sob acordos de confidencialidade)</li>
                <li>Para cumprir obrigações legais ou responder a processos judiciais</li>
                <li>Para proteger nossos direitos, propriedade ou segurança</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies e Tecnologias de Rastreamento</h2>
              <p className="text-gray-700 mb-4">
                Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do site e personalizar conteúdo. Você pode controlar o uso de cookies através das configurações do seu navegador.
              </p>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Tipos de Cookies:</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Cookies Essenciais:</strong> Necessários para o funcionamento básico do site</li>
                <li><strong>Cookies de Performance:</strong> Coletam informações sobre como você usa o site</li>
                <li><strong>Cookies de Funcionalidade:</strong> Lembram suas preferências e configurações</li>
                <li><strong>Cookies de Marketing:</strong> Usados para personalizar anúncios e conteúdo</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Segurança dos Dados</h2>
              <p className="text-gray-700 mb-4">
                Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Controles de acesso rigorosos</li>
                <li>Monitoramento regular de segurança</li>
                <li>Backup seguro e recuperação de dados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Seus Direitos</h2>
              <p className="text-gray-700 mb-4">Você tem os seguintes direitos em relação aos seus dados pessoais:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Acesso:</strong> Solicitar uma cópia dos dados que temos sobre você</li>
                <li><strong>Retificação:</strong> Corrigir dados incorretos ou incompletos</li>
                <li><strong>Eliminação:</strong> Solicitar a exclusão de seus dados pessoais</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados</li>
                <li><strong>Restrição:</strong> Limitar como processamos seus dados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Retenção de Dados</h2>
              <p className="text-gray-700 mb-4">
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Transferência Internacional</h2>
              <p className="text-gray-700 mb-4">
                Seus dados podem ser transferidos e processados em países diferentes do seu país de residência. Garantimos que tais transferências sejam feitas com proteções adequadas de acordo com as leis aplicáveis de proteção de dados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Menores de Idade</h2>
              <p className="text-gray-700 mb-4">
                Nossos serviços não são direcionados a menores de 18 anos. Não coletamos intencionalmente informações pessoais de menores. Se tomarmos conhecimento de que coletamos dados de um menor, tomaremos medidas para excluir essas informações.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Alterações nesta Política</h2>
              <p className="text-gray-700 mb-4">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas através de e-mail ou aviso em nosso site. Recomendamos que revise esta política regularmente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contato</h2>
              <p className="text-gray-700 mb-4">
                Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados pessoais, entre em contato conosco:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>E-mail:</strong> privacidade@zagnfc.com</p>
                <p className="text-gray-700 mb-2"><strong>Telefone:</strong> (61)98193-8164</p>
                <p className="text-gray-700"><strong>Endereço:</strong> São Paulo, SP, Brasil</p>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD) do Brasil e outras regulamentações aplicáveis de proteção de dados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
