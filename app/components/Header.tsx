"use client"

import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [userProfile, setUserProfile] = useState<{ name?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single()
          setUserProfile(profile)
        }
      } catch (err) {
        console.error('Erro ao buscar usuário:', err)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('name')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setUserProfile(data))
      } else {
        setUserProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

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
          <Link href="/" className="cursor-pointer">
            <Image src="/zag-site.png" alt="Zag NFC" width={240} height={80} className="logo" />
          </Link>
        </div>

        {/* Menu Desktop */}
        <nav className="desktop-nav">
          <Link href="/#features">Recursos</Link>
          <Link href="/#how-it-works">Como Funciona</Link>
          <Link href="/#pricing">Preços</Link>
          <Link href="/loja">Loja</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>

        {/* Botões - Visíveis em todas as resoluções */}
        <div className="header-buttons">
          {loading ? (
            <div className="text-sm text-gray-600">Carregando...</div>
          ) : user ? (
            <>
              {/* Desktop: Mostra nome do usuário */}
              <div className="hidden md:block text-sm text-gray-700">
                Olá, {userProfile?.name || user.email?.split('@')[0] || 'Usuário'}
              </div>
              {/* Mobile: Mostra nome do usuário e remove "Começar Agora" */}
              <div className="md:hidden text-sm text-gray-700">
                Olá, {userProfile?.name || user.email?.split('@')[0] || 'Usuário'}
              </div>
              <Link href="/dashboard/pages" className="btn-primary">Minhas páginas</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-primary">Entrar</Link>
              <button className="btn-primary">Começar Agora</button>
            </>
          )}
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
                <Link href="/#features">Recursos</Link>
              </button>
              <button onClick={closeMenu} className="menu-item-button">
                <Link href="/#how-it-works">Como Funciona</Link>
              </button>
              <button onClick={closeMenu} className="menu-item-button">
                <Link href="/#pricing">Preços</Link>
              </button>
              <button onClick={closeMenu} className="menu-item-button">
                <Link href="/loja">Loja</Link>
              </button>
              <button onClick={closeMenu} className="menu-item-button">
                <Link href="/#faq">FAQ</Link>
              </button>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
