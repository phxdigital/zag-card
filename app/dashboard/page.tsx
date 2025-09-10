'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Componente simplificado sem QRCode e Cropper por enquanto
export default function DashboardPage() {
    const [isClient, setIsClient] = useState(false);
    
    // Garante que só renderiza no cliente
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <header className="mb-8 flex items-center space-x-4">
                <Image 
                    src="/logo.png" 
                    alt="Zag Card Logo" 
                    width={64} 
                    height={64} 
                    className="h-12 w-auto"
                />
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Configure seu Zag Card</h1>
                    <p className="text-slate-500 mt-1">Siga as etapas para personalizar seu produto.</p>
                </div>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold mb-4">Dashboard em Desenvolvimento</h2>
                <p className="text-slate-600">
                    O dashboard está sendo carregado. Esta é uma versão temporária para resolver os problemas de compilação.
                </p>
                
                <div className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Teste de Input
                        </label>
                        <input 
                            type="text" 
                            placeholder="Digite algo..." 
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        />
                    </div>
                    
                    <button className="bg-slate-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-900">
                        Botão de Teste
                    </button>
                </div>
            </div>
        </div>
    );
}