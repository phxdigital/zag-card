"use client"

import { ArrowRight, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Array de imagens do banner - adicione suas imagens aqui
  const bannerImages = [
    "/banner/banner-1.png",
    "/banner/banner-2.png",
    "/banner/banner-3.png",
  ]

  // Auto-slide a cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [bannerImages.length])

  return (
    <section className="hero">
      <div className="hero-main">
        <div className="container">
          <div className="hero-banner-container">
            {/* Banner Background Slider */}
            <div className="hero-banner-slider">
              {bannerImages.map((image, index) => (
                <div
                  key={index}
                  className={`hero-banner-slide ${index === currentSlide ? 'active' : ''}`}
                >
                  <Image
                    src={image}
                    alt={`Banner ${index + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
            
            <div className="hero-content">
              <div className="badge">
                <Zap className="h-4 w-4" />
                <span>Tecnologia NFC de Última Geração</span>
              </div>

              <h1>
                Transforme Conexões em<br />
                <span style={{ background: 'linear-gradient(to right, #2563eb, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Oportunidades
                </span>
              </h1>

              <p>
                Seu cartão personalizado e inteligente.<br />
                Compartilhe suas informações profissionais com um simples <strong>toque</strong>.
              </p>

              <div className="hero-buttons">
                <a href="#" className="btn-lg btn-primary-lg">
                  Começar Agora
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#" className="btn-lg btn-outline">
                  Ver Demonstração
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Outside Banner */}
      <div className="container">
        <div className="stats">
          <div className="stat">
            <div className="stat-number">100%</div>
            <div className="stat-label">Digital e Sustentável</div>
          </div>
          <div className="stat">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Atualizações em Tempo Real</div>
          </div>
          <div className="stat">
            <div className="stat-number">∞</div>
            <div className="stat-label">Compartilhamentos Ilimitados</div>
          </div>
        </div>
      </div>
    </section>
  )
}
