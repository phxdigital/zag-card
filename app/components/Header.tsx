import Image from "next/image"

export function Header() {
  return (
    <header>
      <div className="header-content">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Zag NFC" width={120} height={40} className="logo" />
        </div>

        <nav>
          <a href="#features">Recursos</a>
          <a href="#how-it-works">Como Funciona</a>
          <a href="#pricing">Preços</a>
          <a href="#faq">FAQ</a>
        </nav>

        <button className="btn-primary">Começar Agora</button>
      </div>
    </header>
  )
}
