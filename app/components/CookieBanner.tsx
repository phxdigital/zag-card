'use client'

import { useState, useEffect } from 'react'
import { X, Cookie, Settings } from 'lucide-react'
import Link from 'next/link'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Sempre true, não pode ser desabilitado
    performance: false,
    functionality: false,
    marketing: false
  })

  useEffect(() => {
    // Verificar se o usuário já aceitou os cookies
    const cookieConsent = localStorage.getItem('cookie-consent')
    if (!cookieConsent) {
      setIsVisible(true)
    } else {
      // Carregar preferências salvas
      const savedPreferences = localStorage.getItem('cookie-preferences')
      if (savedPreferences) {
        setCookiePreferences(JSON.parse(savedPreferences))
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      performance: true,
      functionality: true,
      marketing: true
    }
    setCookiePreferences(allAccepted)
    localStorage.setItem('cookie-consent', 'accepted')
    localStorage.setItem('cookie-preferences', JSON.stringify(allAccepted))
    setIsVisible(false)
    setShowSettings(false)
  }

  const handleAcceptSelected = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    localStorage.setItem('cookie-preferences', JSON.stringify(cookiePreferences))
    setIsVisible(false)
    setShowSettings(false)
  }

  const handleRejectAll = () => {
    const onlyEssential = {
      essential: true,
      performance: false,
      functionality: false,
      marketing: false
    }
    setCookiePreferences(onlyEssential)
    localStorage.setItem('cookie-consent', 'accepted')
    localStorage.setItem('cookie-preferences', JSON.stringify(onlyEssential))
    setIsVisible(false)
    setShowSettings(false)
  }

  const togglePreference = (type: keyof typeof cookiePreferences) => {
    if (type === 'essential') return // Não pode ser desabilitado
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  if (!isVisible) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Cookie className="h-6 w-6 text-blue-600 mt-1" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Utilizamos cookies para melhorar sua experiência
              </h3>
              <p className="text-gray-600 mb-4">
                Utilizamos cookies essenciais para o funcionamento do site e cookies opcionais para análise e personalização. 
                Você pode escolher quais tipos de cookies aceitar.
              </p>
              
              {!showSettings ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleAcceptAll}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Aceitar Todos
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Personalizar
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Rejeitar Opcionais
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Cookies Essenciais</h4>
                        <p className="text-sm text-gray-600">Necessários para o funcionamento básico do site</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-500">Obrigatório</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Cookies de Performance</h4>
                        <p className="text-sm text-gray-600">Coletam informações sobre como você usa o site</p>
                      </div>
                      <button
                        onClick={() => togglePreference('performance')}
                        className={`w-10 h-6 rounded-full relative transition-colors ${
                          cookiePreferences.performance ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                          cookiePreferences.performance ? 'right-1' : 'left-1'
                        }`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Cookies de Funcionalidade</h4>
                        <p className="text-sm text-gray-600">Lembram suas preferências e configurações</p>
                      </div>
                      <button
                        onClick={() => togglePreference('functionality')}
                        className={`w-10 h-6 rounded-full relative transition-colors ${
                          cookiePreferences.functionality ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                          cookiePreferences.functionality ? 'right-1' : 'left-1'
                        }`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Cookies de Marketing</h4>
                        <p className="text-sm text-gray-600">Usados para personalizar anúncios e conteúdo</p>
                      </div>
                      <button
                        onClick={() => togglePreference('marketing')}
                        className={`w-10 h-6 rounded-full relative transition-colors ${
                          cookiePreferences.marketing ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                          cookiePreferences.marketing ? 'right-1' : 'left-1'
                        }`}></div>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleAcceptSelected}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Salvar Preferências
                    </button>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Para mais informações, consulte nossa{' '}
              <Link href="/privacidade/" className="text-blue-600 underline">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
