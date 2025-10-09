'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

export default function AccessDeniedPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Image 
                        src="/logo-zag.png" 
                        alt="Zag NFC" 
                        width={80} 
                        height={80} 
                        className="mx-auto mb-4"
                    />
                    <h1 className="text-3xl font-bold text-gray-900">Zag NFC</h1>
                </div>

                {/* Mensagem de Acesso Negado */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-6">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Acesso Negado
                        </h2>
                        <p className="text-gray-600">
                            Você não tem permissão para acessar esta área.
                        </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800 text-sm">
                            Esta página é restrita a administradores do sistema. 
                            Se você acredita que deveria ter acesso, entre em contato 
                            com o administrador.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Ir para Dashboard
                        </button>

                        <button
                            onClick={() => router.back()}
                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Voltar
                        </button>
                    </div>
                </div>

                {/* Informação Adicional */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Precisa de ajuda? Entre em contato com o suporte.
                    </p>
                </div>
            </div>
        </div>
    );
}
