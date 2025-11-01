"use client"

import { useState } from 'react'
import { X } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { name: string; cpf: string; phone: string; email: string; method: 'PIX' | 'CARD'; cardMode?: 'CREDIT' | 'DEBIT' }) => void
  planName: string
  planValue: number
  loading?: boolean
}

export function PaymentModal({ isOpen, onClose, onConfirm, planName, planValue, loading = false }: PaymentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: ''
  })
  const [method, setMethod] = useState<'PIX' | 'CARD'>('PIX')
  const [cardMode, setCardMode] = useState<'CREDIT' | 'DEBIT'>('CREDIT')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório'
    } else if (!/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
      newErrors.cpf = 'CPF deve ter 11 dígitos'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Telefone deve ter 10 ou 11 dígitos'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onConfirm({
        name: formData.name.trim(),
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.phone.replace(/\D/g, ''),
        email: formData.email.trim(),
        method,
        cardMode: method === 'CARD' ? cardMode : undefined
      })
    }
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value)
    setFormData(prev => ({ ...prev, cpf: formatted }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({ ...prev, phone: formatted }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-end p-6 border-b">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <img src="/zag-site.png" alt="Zag" className="h-8 object-contain" />
          </div>
          
          <div className="font-bold text-gray-600 text-center mb-3" style={{ fontSize: '18px' }}>
            Finalizar Compra
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900">{planName}</h3>
            <p className="text-2xl font-bold text-blue-900">
              R$ {planValue.toFixed(2).replace('.', ',')}
            </p>
            <p className="text-sm text-blue-700">Selecione a forma de pagamento</p>
          </div>

          {/* Método de pagamento */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Forma de pagamento</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('PIX')}
                className={`px-4 py-2 rounded-md border transition-colors ${method === 'PIX' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                disabled={loading}
              >
                PIX
              </button>
              <button
                type="button"
                onClick={() => setMethod('CARD')}
                className={`px-4 py-2 rounded-md border transition-colors ${method === 'CARD' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                disabled={loading}
              >
                Cartão
              </button>
            </div>
          </div>

          {/* Tipo de cartão: crédito ou débito */}
          {method === 'CARD' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de cartão</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCardMode('CREDIT')}
                  className={`px-4 py-2 rounded-md border transition-colors ${cardMode === 'CREDIT' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  disabled={loading}
                >
                  Crédito
                </button>
                <button
                  type="button"
                  onClick={() => setCardMode('DEBIT')}
                  className={`px-4 py-2 rounded-md border transition-colors ${cardMode === 'DEBIT' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  disabled={loading}
                >
                  Débito
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite seu nome completo"
                disabled={loading}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                id="cpf"
                value={formData.cpf}
                onChange={handleCPFChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cpf ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="000.000.000-00"
                maxLength={14}
                disabled={loading}
              />
              {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="text"
                id="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(00) 00000-0000"
                maxLength={15}
                disabled={loading}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="seu@email.com"
                disabled={loading}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Processando...' : method === 'PIX' ? 'Gerar PIX' : 'Continuar com Cartão'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
