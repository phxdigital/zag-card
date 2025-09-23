'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, ExternalLink, ArrowLeft, Share2 } from 'lucide-react';

interface SuccessPageProps {
    subdomain: string;
    pageId?: string;
    isEdit?: boolean;
}

export default function SuccessPage({ subdomain, pageId, isEdit = false }: SuccessPageProps) {
    const pageUrl = `https://${subdomain}.zagnfc.com.br`;
    
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(pageUrl);
            alert('URL copiada para a área de transferência!');
        } catch (err) {
            console.error('Erro ao copiar URL:', err);
        }
    };

    const sharePage = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Minha Página Zag NFC',
                    text: 'Confira minha página personalizada!',
                    url: pageUrl,
                });
            } catch (err) {
                console.error('Erro ao compartilhar:', err);
            }
        } else {
            copyToClipboard();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="relative inline-block">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">✓</span>
                        </div>
                    </div>
                    
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {isEdit ? 'Página Atualizada!' : 'Página Criada!'}
                    </h1>
                    <p className="text-xl text-gray-600 mb-6">
                        {isEdit 
                            ? 'Suas alterações foram salvas com sucesso!' 
                            : 'Sua página personalizada está pronta para o mundo!'
                        }
                    </p>
                </div>

                {/* Zag Logo */}
                <div className="text-center mb-8">
                    <div className="inline-block p-6 bg-white rounded-2xl shadow-lg">
                        <Image 
                            src="/logo-zag.png" 
                            alt="Zag NFC" 
                            width={120} 
                            height={120} 
                            className="mx-auto"
                        />
                    </div>
                </div>

                {/* Page Preview Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Sua Página Está Online!
                        </h2>
                        
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-600 mb-2">URL da sua página:</p>
                            <div className="flex items-center justify-center space-x-2">
                                <code className="bg-white px-3 py-2 rounded-lg text-blue-600 font-mono text-sm border">
                                    {pageUrl}
                                </code>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                    title="Copiar URL"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                            >
                                <ExternalLink className="w-5 h-5 mr-2" />
                                Ver Página Online
                            </Link>
                            
                            <button
                                onClick={sharePage}
                                className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                            >
                                <Share2 className="w-5 h-5 mr-2" />
                                Compartilhar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Important Notice - Always show */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                    <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-amber-600 text-xs font-bold">!</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-amber-900 mb-2">
                                Informação Importante
                            </h3>
                            <p className="text-amber-800">
                                <strong>O subdomínio "{subdomain}" não pode ser alterado após a criação.</strong> 
                                Se precisar de um subdomínio diferente, você terá que criar uma nova página. 
                                Você pode editar todos os outros aspectos da sua página (design, conteúdo, links) 
                                a qualquer momento no seu dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                        Próximos Passos
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 text-xs font-bold">1</span>
                            </div>
                            <p className="text-gray-700">
                                <strong>Teste sua página</strong> em diferentes dispositivos para garantir que tudo está funcionando perfeitamente.
                            </p>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 text-xs font-bold">2</span>
                            </div>
                            <p className="text-gray-700">
                                <strong>Compartilhe o link</strong> com seus clientes, amigos ou nas suas redes sociais.
                            </p>
                        </div>
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-blue-600 text-xs font-bold">3</span>
                            </div>
                            <p className="text-gray-700">
                                <strong>Monitore o acesso</strong> e faça ajustes conforme necessário no seu dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back to Dashboard */}
                <div className="text-center">
                    <Link
                        href="/dashboard/pages"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar ao Dashboard
                    </Link>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-20 animate-bounce"></div>
                <div className="absolute bottom-10 right-10 w-16 h-16 bg-green-100 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-5 w-12 h-12 bg-purple-100 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s' }}></div>
            </div>
        </div>
    );
}
