import Image from "next/image"
import { Instagram, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <Image src="/logo.svg" alt="Zag NFC" width={120} height={40} className="footer-logo" />
            <p className="footer-description">
              Transformando conexões profissionais através da tecnologia NFC. Seu cartão de visita digital inteligente.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="social-link">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="social-link">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Produto</h3>
            <ul className="footer-links">
              <li><a href="#features">Recursos</a></li>
              <li><a href="#pricing">Preços</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Empresa</h3>
            <ul className="footer-links">
              <li><a href="#">Sobre Nós</a></li>
              <li><a href="#">Contato</a></li>
              <li><a href="#">Termos de Uso</a></li>
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
