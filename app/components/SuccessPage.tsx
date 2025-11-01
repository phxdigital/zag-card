'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, ExternalLink, ArrowLeft, Share2, Download, MessageCircle, Facebook, Twitter, Send, Linkedin, Mail, Copy, X, Loader2 } from 'lucide-react';

interface SuccessPageProps {
    subdomain: string;
    pageId?: string;
    isEdit?: boolean;
}

export default function SuccessPage({ subdomain, isEdit = false }: SuccessPageProps) {
    const pageUrl = `https://${subdomain}.zagnfc.com.br`;
    const [showShareModal, setShowShareModal] = useState(false);
    const qrCodeRef = useRef<HTMLDivElement>(null);
    const [QRCode, setQRCode] = useState<(new (element: HTMLElement, options: { text: string; width: number; height: number; colorDark: string; colorLight: string; correctLevel: number }) => void) | null>(null);
    
    // Carregar biblioteca QR Code
    useEffect(() => {
        let mounted = true;
        
        import('qrcodejs2')
            .then((mod) => {
                if (!mounted) return;
                
                const QRCodeClass = (() => {
                    const maybeDefault = (mod as unknown as { default?: unknown }).default;
                    if (typeof maybeDefault === 'function') return maybeDefault as new (element: HTMLElement, options: { text: string; width: number; height: number; colorDark: string; colorLight: string; correctLevel: number }) => void;
                    if (typeof (mod as unknown) === 'function') return mod as unknown as new (element: HTMLElement, options: { text: string; width: number; height: number; colorDark: string; colorLight: string; correctLevel: number }) => void;
                    return null;
                })();
                
                if (QRCodeClass) {
                    setQRCode(() => QRCodeClass);
                }
            })
            .catch((err) => {
                console.error('Erro ao carregar biblioteca QR Code:', err);
            });
        
        return () => {
            mounted = false;
        };
    }, []);
    
    // Gerar QR Code em background
    const [qrCodeReady, setQrCodeReady] = useState(false);
    
    useEffect(() => {
        if (!QRCode || !qrCodeRef.current || !subdomain) return;
        
        // Limpar conteúdo anterior
        qrCodeRef.current.innerHTML = '';
        
        try {
            // Gerar QR Code no elemento oculto
            new QRCode(qrCodeRef.current, {
                text: pageUrl,
                width: 300,
                height: 300,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: 2 // Nível H (High) de correção de erro
            });
            
            // Aguardar um pouco para o QR Code ser renderizado
            const checkInterval = setInterval(() => {
                const qrElement = qrCodeRef.current?.querySelector('canvas') || qrCodeRef.current?.querySelector('img');
                if (qrElement) {
                    setQrCodeReady(true);
                    clearInterval(checkInterval);
                }
            }, 100);
            
            // Timeout de segurança (máximo 3 segundos)
            setTimeout(() => {
                clearInterval(checkInterval);
                const qrElement = qrCodeRef.current?.querySelector('canvas') || qrCodeRef.current?.querySelector('img');
                if (qrElement) {
                    setQrCodeReady(true);
                }
            }, 3000);
            
            return () => {
                clearInterval(checkInterval);
            };
        } catch (err) {
            console.error('Erro ao gerar QR Code:', err);
        }
    }, [QRCode, subdomain, pageUrl]);
    
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(pageUrl);
            alert('URL copiada para a área de transferência!');
        } catch (err) {
            console.error('Erro ao copiar URL:', err);
        }
    };

    // Função para compartilhar em diferentes redes sociais
    const shareToSocial = (platform: string) => {
        const encodedUrl = encodeURIComponent(pageUrl);
        const title = encodeURIComponent('Minha Página Zag NFC');
        const text = encodeURIComponent('Confira minha página personalizada! Acesse e conecte-se comigo através do meu Zag Card.');
        
        const shareUrls: { [key: string]: string } = {
            whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${text}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            email: `mailto:?subject=${title}&body=${text}%20-%20${encodedUrl}`,
            copy: pageUrl
        };

        if (platform === 'copy') {
            copyToClipboard();
            setShowShareModal(false);
        } else {
            window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
            setShowShareModal(false);
        }
    };

    const downloadQRCode = async () => {
        try {
            if (!qrCodeRef.current || !qrCodeReady) {
                alert('QR Code ainda não está pronto. Aguarde alguns instantes.');
                return;
            }
            
            // Buscar o canvas ou imagem do QR Code gerado
            const qrElement = qrCodeRef.current.querySelector('canvas') || qrCodeRef.current.querySelector('img');
            
            if (!qrElement) {
                alert('Não foi possível encontrar o QR Code. Tente recarregar a página.');
                return;
            }
            
            let canvas: HTMLCanvasElement;
            
            if (qrElement instanceof HTMLCanvasElement) {
                // Se já for um canvas, usar diretamente
                canvas = qrElement;
            } else if (qrElement instanceof HTMLImageElement) {
                // Se for uma imagem, criar um novo canvas
                canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 300;
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    alert('Erro ao criar canvas para QR Code.');
                    return;
                }
                
                ctx.drawImage(qrElement, 0, 0, 300, 300);
            } else {
                alert('Formato de QR Code não suportado.');
                return;
            }
            
            // Converter canvas para blob e baixar
            canvas.toBlob((blob) => {
                if (!blob) {
                    alert('Erro ao gerar imagem do QR Code.');
                    return;
                }
                
                const link = document.createElement('a');
                link.download = `qr-code-${subdomain}.png`;
                link.href = URL.createObjectURL(blob);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Limpar o URL do objeto
                setTimeout(() => URL.revokeObjectURL(link.href), 100);
            }, 'image/png');
        } catch (err) {
            console.error('Erro ao baixar QR Code:', err);
            alert('Erro ao baixar QR Code. Tente novamente.');
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
                            src="/zag-botom.png" 
                            alt="Zag NFC" 
                            width={300} 
                            height={100} 
                            className="mx-auto"
                            style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
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

                        {/* QR Code oculto para geração em background - fora da tela mas visível para o navegador */}
                        <div 
                            ref={qrCodeRef}
                            style={{ 
                                position: 'absolute',
                                left: '-9999px',
                                width: '300px',
                                height: '300px',
                                visibility: 'hidden'
                            }}
                        />

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
                                onClick={() => setShowShareModal(true)}
                                className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                            >
                                <Share2 className="w-5 h-5 mr-2" />
                                Compartilhar
                            </button>

                            <button
                                onClick={downloadQRCode}
                                disabled={!qrCodeReady}
                                className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {!qrCodeReady ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Gerando QR Code...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5 mr-2" />
                                        Baixar QR Code
                                    </>
                                )}
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
                                <strong>O subdomínio &quot;{subdomain}&quot; não pode ser alterado após a criação.</strong> 
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

            {/* Modal de Compartilhamento */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    {/* Overlay */}
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                        onClick={() => setShowShareModal(false)}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slideUp"
                         style={{
                             animation: 'slideUp 0.3s ease-out'
                         }}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Compartilhar</h3>
                            <button 
                                onClick={() => setShowShareModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Fechar"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">Escolha onde deseja compartilhar:</p>

                        {/* Share Options Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {/* WhatsApp */}
                            <button
                                onClick={() => shareToSocial('whatsapp')}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all hover:scale-105"
                            >
                                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                                    <MessageCircle size={28} className="text-white" />
                                </div>
                                <span className="text-xs font-medium text-gray-700">WhatsApp</span>
                            </button>

                            {/* Facebook */}
                            <button
                                onClick={() => shareToSocial('facebook')}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all hover:scale-105"
                            >
                                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Facebook size={28} className="text-white" />
                                </div>
                                <span className="text-xs font-medium text-gray-700">Facebook</span>
                            </button>

                            {/* Twitter */}
                            <button
                                onClick={() => shareToSocial('twitter')}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all hover:scale-105"
                            >
                                <div className="w-14 h-14 bg-sky-500 rounded-full flex items-center justify-center">
                                    <Twitter size={28} className="text-white" />
                                </div>
                                <span className="text-xs font-medium text-gray-700">Twitter</span>
                            </button>

                            {/* Telegram */}
                            <button
                                onClick={() => shareToSocial('telegram')}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all hover:scale-105"
                            >
                                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Send size={28} className="text-white" />
                                </div>
                                <span className="text-xs font-medium text-gray-700">Telegram</span>
                            </button>

                            {/* LinkedIn */}
                            <button
                                onClick={() => shareToSocial('linkedin')}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all hover:scale-105"
                            >
                                <div className="w-14 h-14 bg-blue-700 rounded-full flex items-center justify-center">
                                    <Linkedin size={28} className="text-white" />
                                </div>
                                <span className="text-xs font-medium text-gray-700">LinkedIn</span>
                            </button>

                            {/* Email */}
                            <button
                                onClick={() => shareToSocial('email')}
                                className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-all hover:scale-105"
                            >
                                <div className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center">
                                    <Mail size={28} className="text-white" />
                                </div>
                                <span className="text-xs font-medium text-gray-700">Email</span>
                            </button>
                        </div>

                        {/* Copy Link Button */}
                        <button
                            onClick={() => shareToSocial('copy')}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <Copy size={18} />
                            <span>Copiar Link</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Animações CSS */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                    .animate-slideUp {
                        animation: slideUp 0.3s ease-out;
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.2s ease-out;
                    }
                `
            }} />
        </div>
    );
}
