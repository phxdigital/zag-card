'use client';

import React, { useState } from 'react';
import {
    MessageCircle, Instagram, Facebook, Link as LinkIcon,
    ShoppingCart, Globe, Wifi, MapPin,
    Phone, Mail, Star, Image as ImageIcon, Video,
    Heart, Camera, Music, Calendar, Clock, User, Users, Home, Building, Car, Plane, Coffee, Gift, Book, Gamepad2, Headphones, Mic, Search, Settings, Download, Upload, Share2, Copy, Check, X, Plus, Minus, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Zap, Target, Award, Trophy, Shield, Lock, Unlock, Eye, EyeOff, Bell, BellOff, Volume2, VolumeX, WifiOff, Battery, BatteryLow, Signal, SignalZero, SignalLow, SignalMedium, SignalHigh, Youtube, Twitter, UserPlus, Linkedin, Send
} from 'lucide-react';
import Image from 'next/image';
import PixIconCustom from '@/app/components/PixIcon';
import { ensureBackwardCompatibility } from '@/lib/page-compatibility';

// 🎯 Função para mostrar feedback personalizado do PIX
const showPixFeedback = () => {
    // Criar elemento de feedback
    const feedback = document.createElement('div');
    feedback.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #32BCAD, #059669);
            color: white;
            padding: 20px 30px;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: 'Inter', sans-serif;
            font-weight: 600;
            text-align: center;
            max-width: 300px;
            animation: pixFeedbackSlideIn 0.4s ease-out;
        ">
            <div style="font-size: 18px; margin-bottom: 8px;">✅ PIX Copiado!</div>
            <div style="font-size: 14px; opacity: 0.9;">Efetue o pagamento no aplicativo do seu banco preferido</div>
        </div>
        <style>
            @keyframes pixFeedbackSlideIn {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        </style>
    `;
    
    document.body.appendChild(feedback);
    
    // Remover após 3 segundos
    setTimeout(() => {
        feedback.style.animation = 'pixFeedbackSlideIn 0.3s ease-in reverse';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }, 3000);
};

// --- Tipos de Dados ---
export type CustomLink = {
    id: number;
    text: string;
    url: string;
    icon: string | null;
    styleType: 'solid' | 'gradient';
    bgColor1: string;
    bgColor2: string;
    textColor: string;
    isSocial?: boolean;
};

export type PageConfig = {
    landingPageBgColor?: string;
    landingPageBgImage?: string | null;
    landingPageTitleText?: string;
    landingPageSubtitleText?: string;
    landingPageLogoShape?: 'circle' | 'square';
    landingPageLogoSize?: number;
    landingPageLogoUrl?: string | null;
    landingPageBannerUrl?: string | null;
    landingPageTitleColor?: string;
    landingPageSubtitleColor?: string;
    removeLogoBackground?: boolean;
    landingFont?: string;
    socialLinks?: { [key: string]: string };
    customLinks?: CustomLink[];
};

interface PageClientProps {
    config: PageConfig;
    logoUrl: string;
}

type IconName = 'image' | 'message-circle' | 'instagram' | 'facebook' | 'globe' | 'map-pin' | 'phone' | 'mail' | 'shopping-cart' | 'link' | 'youtube' | 'twitter' | 'heart' | 'star' | 'camera' | 'music' | 'video' | 'calendar' | 'clock' | 'user' | 'users' | 'home' | 'building' | 'car' | 'plane' | 'coffee' | 'gift' | 'book' | 'gamepad2' | 'headphones' | 'mic' | 'search' | 'settings' | 'download' | 'upload' | 'share' | 'copy' | 'check' | 'x' | 'plus' | 'minus' | 'arrow-right' | 'arrow-left' | 'arrow-up' | 'arrow-down' | 'chevron-right' | 'chevron-left' | 'chevron-up' | 'chevron-down' | 'zap' | 'target' | 'award' | 'trophy' | 'shield' | 'lock' | 'unlock' | 'eye' | 'eye-off' | 'bell' | 'bell-off' | 'volume2' | 'volume-x' | 'wifi' | 'wifi-off' | 'battery' | 'battery-low' | 'signal' | 'signal-zero' | 'signal-low' | 'signal-medium' | 'signal-high' | 'user-plus' | 'pix' | 'linkedin';

// Configuração das redes sociais
const socialMediaConfig: { [key: string]: { icon: IconName; baseUrl: string } } = {
    whatsapp: { icon: 'message-circle', baseUrl: 'https://wa.me/' },
    instagram: { icon: 'instagram', baseUrl: 'https://instagram.com/' },
    facebook: { icon: 'facebook', baseUrl: 'https://facebook.com/' },
    tiktok: { icon: 'video', baseUrl: 'https://tiktok.com/@' },
};

// Componente para ícones Lucide
const LucideIcon = ({ name, size = 24, className, ...props }: { 
    name: IconName; 
    size?: number; 
    className?: string; 
    [key: string]: string | number | undefined;
}) => {
    // Caso especial para o ícone PIX customizado
    if (name === 'pix') {
        return <PixIconCustom size={size} className={className} />;
    }

    const icons: Record<string, React.ElementType> = {
        'message-circle': MessageCircle,
        instagram: Instagram,
        facebook: Facebook,
        globe: Globe,
        'map-pin': MapPin,
        phone: Phone,
        mail: Mail,
        'shopping-cart': ShoppingCart,
        link: LinkIcon,
        image: ImageIcon,
        youtube: Youtube,
        twitter: Twitter,
        heart: Heart,
        star: Star,
        camera: Camera,
        music: Music,
        video: Video,
        calendar: Calendar,
        clock: Clock,
        user: User,
        users: Users,
        home: Home,
        building: Building,
        car: Car,
        plane: Plane,
        coffee: Coffee,
        gift: Gift,
        book: Book,
        gamepad2: Gamepad2,
        headphones: Headphones,
        mic: Mic,
        search: Search,
        settings: Settings,
        download: Download,
        upload: Upload,
        share: Share2,
        share2: Share2, // Alias para share2
        copy: Copy,
        check: Check,
        x: X,
        plus: Plus,
        minus: Minus,
        'arrow-right': ArrowRight,
        'arrow-left': ArrowLeft,
        'arrow-up': ArrowUp,
        'arrow-down': ArrowDown,
        'chevron-right': ChevronRight,
        'chevron-left': ChevronLeft,
        'chevron-up': ChevronUp,
        'chevron-down': ChevronDown,
        zap: Zap,
        target: Target,
        award: Award,
        trophy: Trophy,
        shield: Shield,
        lock: Lock,
        unlock: Unlock,
        eye: Eye,
        'eye-off': EyeOff,
        bell: Bell,
        'bell-off': BellOff,
        volume2: Volume2,
        'volume-x': VolumeX,
        wifi: Wifi,
        'wifi-off': WifiOff,
        battery: Battery,
        'battery-low': BatteryLow,
        signal: Signal,
        'signal-zero': SignalZero,
        'signal-low': SignalLow,
        'signal-medium': SignalMedium,
        'signal-high': SignalHigh,
        'user-plus': UserPlus,
        linkedin: Linkedin,
    };
    
    const IconComponent = icons[name];
    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in icon map`);
        return null;
    }
    return <IconComponent size={size} className={className} {...props} />;
};

// Função para lidar com cliques nos links
const handleLinkClick = (url: string): void => {
    if (url.startsWith('copy:')) {
        const textToCopy = url.substring(5);
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Copiado para a área de transferência!');
        }).catch(err => {
            console.error('Erro ao copiar:', err);
            alert('Não foi possível copiar.');
        });
    } else if (url.startsWith('pix:')) {
        const textToCopy = url.substring(4);
        navigator.clipboard.writeText(textToCopy).then(() => {
            // 🎯 Feedback personalizado para PIX
            showPixFeedback();
        }).catch(err => {
            console.error('Erro ao copiar PIX:', err);
            alert('Não foi possível copiar o código PIX.');
        });
    } else if (url.startsWith('WIFI:')) {
        alert('Aponte a câmera do seu celular para o QR Code no cartão para conectar ao Wi-Fi.');
    } else {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
};

export default function PageClient({ config, logoUrl }: PageClientProps) {
    const [showShareModal, setShowShareModal] = useState(false);
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

    // 🛡️ RETROCOMPATIBILIDADE: Garante que páginas antigas continuem funcionando
    // Adiciona valores padrão para propriedades que podem estar faltando
    const safeCustomLinks = ensureBackwardCompatibility(config.customLinks);

    // Função para compartilhar em diferentes redes sociais
    const shareToSocial = (platform: string) => {
        const encodedUrl = encodeURIComponent(pageUrl);
        const title = encodeURIComponent(config.landingPageTitleText || 'Confira meu cartão digital');
        
        const shareUrls: { [key: string]: string } = {
            whatsapp: `https://wa.me/?text=${title}%20${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${title}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${title}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            email: `mailto:?subject=${title}&body=${title}%20-%20${encodedUrl}`,
            copy: pageUrl
        };

        if (platform === 'copy') {
            navigator.clipboard.writeText(pageUrl).then(() => {
                alert('Link copiado para a área de transferência!');
                setShowShareModal(false);
            }).catch(() => {
                alert('Não foi possível copiar o link.');
            });
        } else {
            window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
            setShowShareModal(false);
        }
    };

    const handleLinkClickWrapper = (url: string) => {
        if (url.startsWith('share:') || url === 'share:') {
            // 🎯 Usar API nativa de compartilhamento com URL da página atual
            if (navigator.share) {
                navigator.share({
                    title: config.landingPageTitleText || 'Meu Cartão Digital',
                    text: config.landingPageSubtitleText || 'Confira meu cartão digital',
                    url: window.location.href
                }).catch(err => {
                    console.error('Erro ao compartilhar:', err);
                    // Fallback: copiar URL para clipboard
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        alert('Link copiado para a área de transferência!');
                    });
                });
            } else {
                // Fallback para navegadores sem suporte ao Web Share API
                navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('Link copiado para a área de transferência!');
                }).catch(() => {
                    alert('Link da página: ' + window.location.href);
                });
            }
        } else {
            handleLinkClick(url);
        }
    };

    return (
        <main 
            className="flex min-h-screen flex-col items-center justify-center p-4"
            style={{
                backgroundColor: config.landingPageBgColor || '#F8FAFC',
                backgroundImage: config.landingPageBgImage ? `url('${config.landingPageBgImage}')` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="w-full max-w-md mx-auto text-center relative">
                {/* Banner do Topo (atrás da logo) */}
                {config.landingPageBannerUrl && (
                    <div 
                        className="absolute top-0 left-0 right-0 z-0" 
                        style={{ height: `calc(64px + ${(config.landingPageLogoSize || 96) / 2}px)` }}
                    >
                        <img 
                            src={config.landingPageBannerUrl} 
                            alt="Banner" 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                )}
                
                {/* Logo posicionada absolutamente sobrepondo a metade do banner */}
                <div 
                    className="absolute left-1/2 transform -translate-x-1/2"
                    style={{ 
                        top: `calc(64px + ${(config.landingPageLogoSize || 96) / 2}px - ${(config.landingPageLogoSize || 96) / 2}px)`,
                        zIndex: 20
                    }}
                >
                    <Image 
                        src={logoUrl} 
                        alt="Logo"
                        width={config.landingPageLogoSize || 96}
                        height={config.landingPageLogoSize || 96}
                        className={`object-cover shadow-md ${
                            config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                        }`} 
                        priority
                    />
                </div>

                {/* Conteúdo com espaçamento ajustado para compensar o posicionamento absoluto da logo */}
                <div 
                    className="flex flex-col items-center text-center"
                    style={{ 
                        marginTop: `calc(64px + ${(config.landingPageLogoSize || 96) / 2}px + ${(config.landingPageLogoSize || 96) / 2}px)`,
                        zIndex: 5
                    }}
                >
                    <h1 
                        className="text-3xl font-bold break-words mt-4 mb-1"
                        style={{ 
                            color: config.landingPageTitleColor || '#1e293b',
                            fontFamily: config.landingFont ? `var(--font-${config.landingFont.toLowerCase().replace(' ', '-')})` : undefined
                        }}
                    >
                        {config.landingPageTitleText || 'Bem-vindo(a)!'}
                    </h1>
                
                    {config.landingPageSubtitleText && (
                        <p 
                            className="mt-2 px-4 break-words mb-4"
                            style={{ 
                                color: config.landingPageSubtitleColor || '#64748b',
                                fontFamily: config.landingFont ? `var(--font-${config.landingFont.toLowerCase().replace(' ', '-')})` : undefined
                            }}
                        >
                            {config.landingPageSubtitleText}
                        </p>
                    )}

                    {/* Social Links */}
                    <div className="w-full mt-8 flex justify-center items-center space-x-4">
                        {Object.entries(config.socialLinks || {}).map(([key, value]) => {
                            const socialInfo = socialMediaConfig[key];
                            if (!value || !socialInfo) return null;
                            
                            return (
                                <a 
                                    key={key} 
                                    href={socialInfo.baseUrl + value} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200"
                                    aria-label={`Link para ${key}`}
                                >
                                    <LucideIcon name={socialInfo.icon} size={20} />
                                </a>
                            );
                        })}
                    </div>

                    {/* Botões Sociais - Duas linhas */}
                    <div className="w-full mt-6 mb-4">
                        {/* Linha 1: Salvar Contato (pill) e Compartilhar (redondo) */}
                        <div className="flex flex-wrap justify-center items-center gap-3 mb-3">
                            {safeCustomLinks?.filter(link => link.isSocial && (link.icon === 'user-plus' || link.icon === 'share')).map((link) => {
                                const isPillButton = link.icon === 'user-plus';
                                
                                return (
                                    <button
                                        key={link.id}
                                        onClick={() => handleLinkClickWrapper(link.url)}
                                        style={{
                                            background: link.styleType === 'gradient' 
                                                ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` 
                                                : link.bgColor1
                                        }}
                                        className={`${
                                            isPillButton 
                                                ? 'h-10 px-4 rounded-full gap-2 font-medium' 
                                                : 'w-10 h-10 rounded-full'
                                        } flex items-center justify-center text-white shadow-md transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                        aria-label={link.text}
                                    >
                                        {link.icon && <LucideIcon name={link.icon as IconName} size={isPillButton ? 16 : 18} />}
                                        {isPillButton && <span className="text-xs whitespace-nowrap">{link.text}</span>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Linha 2: Botões de redes sociais pequenos (exceto salvar-contato e compartilhar) */}
                        <div className="flex flex-wrap justify-center items-center gap-3">
                            {safeCustomLinks?.filter(link => link.isSocial && link.icon !== 'user-plus' && link.icon !== 'share').map((link) => {
                                return (
                                    <button
                                        key={link.id}
                                        onClick={() => {
                                            // 💰 Tratamento especial para PIX
                                            if (link.icon === 'pix') {
                                                const pixKey = link.url.startsWith('pix:') ? link.url.substring(4) : link.url;
                                                navigator.clipboard.writeText(pixKey).then(() => {
                                                    showPixFeedback();
                                                }).catch(err => {
                                                    console.error('Erro ao copiar PIX:', err);
                                                    alert('Não foi possível copiar o código PIX.');
                                                });
                                            } else {
                                                handleLinkClickWrapper(link.url);
                                            }
                                        }}
                                        style={{
                                            background: link.styleType === 'gradient' 
                                                ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` 
                                                : link.bgColor1
                                        }}
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        aria-label={link.text}
                                    >
                                        {link.icon && <LucideIcon name={link.icon as IconName} size={20} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Botões Personalizados (Retangulares) */}
                    <div className="w-full flex flex-col items-center gap-2">
                        {safeCustomLinks?.filter(link => !link.isSocial).map(link => (
                            <button 
                                key={link.id} 
                                onClick={() => {
                                    // 💰 Tratamento especial para PIX
                                    console.log('Botão clicado:', { icon: link.icon, url: link.url, text: link.text });
                                    if (link.icon === 'pix') {
                                        const pixKey = link.url.startsWith('pix:') ? link.url.substring(4) : link.url;
                                        console.log('Copiando PIX:', pixKey);
                                        navigator.clipboard.writeText(pixKey).then(() => {
                                            showPixFeedback();
                                        }).catch(err => {
                                            console.error('Erro ao copiar PIX:', err);
                                            alert('Não foi possível copiar o código PIX.');
                                        });
                                    } else {
                                        console.log('Não é PIX, chamando handleLinkClickWrapper');
                                        handleLinkClickWrapper(link.url);
                                    }
                                }}
                                style={{
                                    color: link.textColor, 
                                    background: link.styleType === 'gradient' 
                                        ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` 
                                        : link.bgColor1
                                }} 
                                className="w-48 h-10 rounded-lg flex items-center justify-center text-white shadow-md gap-2 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                aria-label={link.text}
                            >
                                {link.icon && <LucideIcon name={link.icon as IconName} size={16} />}
                                <span className="text-sm font-medium">{link.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
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
        </main>
    );
}