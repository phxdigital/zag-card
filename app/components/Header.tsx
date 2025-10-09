"use client"

import Image from "next/image"
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
          <Image src="/zag-site.png" alt="Zag NFC" width={240} height={80} className="logo" />
        </div>

        {/* Menu Desktop */}
        <nav className="desktop-nav">
          <a href="#features">Recursos</a>
          <a href="#how-it-works">Como Funciona</a>
          <a href="#pricing">Preços</a>
          <a href="#faq">FAQ</a>
        </nav>

        {/* Botões - Visíveis em todas as resoluções */}
        <div className="header-buttons">
          <Link href="/login" className="btn-primary">Entrar</Link>
          <button className="btn-primary">Começar Agora</button>
        </div>

        {/* Botão Menu Mobile */}
        <button className="mobile-menu-button" onClick={toggleMenu} aria-label="Menu">
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
                <a href="#features">Recursos</a>
              </button>
              <button onClick={closeMenu} className="menu-item-button">
                <a href="#how-it-works">Como Funciona</a>
              </button>
              <button onClick={closeMenu} className="menu-item-button">
                <a href="#pricing">Preços</a>
              </button>
              <button onClick={closeMenu} className="menu-item-button">
                <a href="#faq">FAQ</a>
              </button>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
