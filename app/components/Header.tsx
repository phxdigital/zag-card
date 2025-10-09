&ldquo;use client&rdquo;

import Image from &ldquo;next/image&rdquo;
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header>
      <div className="header-content">
        <div className="flex items-center gap-2">
          <Image src=&ldquo;/zag-site.png&rdquo; alt="Zag NFC&ldquo; width={240} height={80} className=&rdquo;logo" />
        </div>

        {/* Menu Desktop */}
        <nav className="desktop-nav">
          <a href=&ldquo;#features&rdquo;>Recursos</a>
          <a href=&ldquo;#how-it-works&rdquo;>Como Funciona</a>
          <a href=&ldquo;#pricing&rdquo;>Preços</a>
          <a href=&ldquo;#faq&rdquo;>FAQ</a>
        </nav>

        {/* Botões - Visíveis em todas as resoluções */}
        <div className="header-buttons">
          <Link href=&ldquo;/login&rdquo; className="btn-primary&ldquo;>Entrar</Link>
          <button className="btn-primary">Começar Agora</button>
        </div>

        {/* Botão Menu Mobile */}
        <button className="mobile-menu-button" onClick={toggleMenu} aria-label=&rdquo;Menu">
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          <span>Menu</span>
        </button>
      </div>

      {/* Menu Mobile Popup */}
      {isMenuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={closeMenu} />
          <div className="mobile-menu">
            <nav className="mobile-nav">
              <button onClick={closeMenu} className="menu-item-button">
                <a href=&ldquo;#features&rdquo;>Recursos</a>
              </button>
              <button onClick={closeMenu} className="menu-item-button">
                <a href=&ldquo;#how-it-works&rdquo;>Como Funciona</a>
              </button>
              <button onClick={closeMenu} className="menu-item-button">
                <a href=&ldquo;#pricing&rdquo;>Preços</a>
              </button>
              <button onClick={closeMenu} className="menu-item-button">
                <a href=&ldquo;#faq&rdquo;>FAQ</a>
              </button>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
