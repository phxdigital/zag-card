import Image from &ldquo;next/image&rdquo;
import { Instagram, Linkedin, Mail } from &ldquo;lucide-react&rdquo;

export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <Image src=&ldquo;/logo.svg&rdquo; alt="Zag NFC&ldquo; width={120} height={40} className=&rdquo;footer-logo" />
            <p className="footer-description">
              Transformando conexões profissionais através da tecnologia NFC. Seu cartão de visita digital inteligente.
            </p>
            <div className="social-links">
              <a href=&ldquo;#&rdquo; className="social-link&ldquo;>
                <Instagram className="h-5 w-5" />
              </a>
              <a href=&ldquo;#&rdquo; className=&rdquo;social-link">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href=&ldquo;#&rdquo; className="social-link">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Produto</h3>
            <ul className="footer-links">
              <li><a href=&ldquo;#features&rdquo;>Recursos</a></li>
              <li><a href=&ldquo;#pricing&rdquo;>Preços</a></li>
              <li><a href=&ldquo;#faq&rdquo;>FAQ</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Empresa</h3>
            <ul className="footer-links">
              <li><a href=&ldquo;#&rdquo;>Sobre Nós</a></li>
              <li><a href=&ldquo;#&rdquo;>Contato</a></li>
              <li><a href=&ldquo;#&rdquo;>Termos de Uso</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Zag NFC. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
