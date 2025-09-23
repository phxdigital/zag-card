'use client';

import React from 'react';
import {
    MessageCircle, Instagram, Facebook, Link as LinkIcon,
    ShoppingCart, Globe, Wifi, DollarSign, BookOpen, MapPin,
    Phone, Mail, Info, Star, Image as ImageIcon, Video,
    Heart, Camera, Music, Calendar, Clock, User, Users, Home, Building, Car, Plane, Coffee, Gift, Book, Gamepad2, Headphones, Mic, Search, Settings, Download, Upload, Share, Copy, Check, X, Plus, Minus, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Zap, Target, Award, Trophy, Shield, Lock, Unlock, Eye, EyeOff, Bell, BellOff, Volume2, VolumeX, WifiOff, Battery, BatteryLow, Signal, SignalZero, SignalLow, SignalMedium, SignalHigh, Youtube, Twitter
} from 'lucide-react';
import Image from 'next/image';

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

type IconName = 'image' | 'message-circle' | 'instagram' | 'facebook' | 'globe' | 'map-pin' | 'phone' | 'mail' | 'shopping-cart' | 'link' | 'youtube' | 'twitter' | 'heart' | 'star' | 'camera' | 'music' | 'video' | 'calendar' | 'clock' | 'user' | 'users' | 'home' | 'building' | 'car' | 'plane' | 'coffee' | 'gift' | 'book' | 'gamepad2' | 'headphones' | 'mic' | 'search' | 'settings' | 'download' | 'upload' | 'share' | 'copy' | 'check' | 'x' | 'plus' | 'minus' | 'arrow-right' | 'arrow-left' | 'arrow-up' | 'arrow-down' | 'chevron-right' | 'chevron-left' | 'chevron-up' | 'chevron-down' | 'zap' | 'target' | 'award' | 'trophy' | 'shield' | 'lock' | 'unlock' | 'eye' | 'eye-off' | 'bell' | 'bell-off' | 'volume2' | 'volume-x' | 'wifi' | 'wifi-off' | 'battery' | 'battery-low' | 'signal' | 'signal-zero' | 'signal-low' | 'signal-medium' | 'signal-high';

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
    const icons: { [key in IconName]: React.ElementType } = {
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
        share: Share,
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
    };
    
    const IconComponent = icons[name];
    return IconComponent ? <IconComponent size={size} className={className} {...props} /> : null;
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
            alert('Código PIX copiado! Cole no seu app de banco.');
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
            <div className="w-full max-w-md mx-auto text-center">
                <Image 
                    src={logoUrl} 
                    alt="Logo"
                    width={config.landingPageLogoSize || 96}
                    height={config.landingPageLogoSize || 96}
                    className={`object-cover mx-auto mb-4 shadow-md ${
                        config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                    }`} 
                    priority
                />

                <h1 
                    className="text-3xl font-bold break-words"
                    style={{ 
                        color: config.landingPageTitleColor || '#1e293b',
                        fontFamily: config.landingFont ? `var(--font-${config.landingFont.toLowerCase().replace(' ', '-')})` : undefined
                    }}
                >
                    {config.landingPageTitleText || 'Bem-vindo(a)!'}
                </h1>
                
                {config.landingPageSubtitleText && (
                    <p 
                        className="mt-2 px-4 break-words"
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

                {/* Botões Sociais (Redondos) */}
                <div className="w-full flex flex-wrap justify-center items-center gap-3 mt-6 mb-4">
                    {config.customLinks?.filter(link => link.isSocial).map((link) => (
                        <button
                            key={link.id}
                            onClick={() => handleLinkClick(link.url)}
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
                    ))}
                </div>

                {/* Botões Personalizados (Retangulares) */}
                <div className="w-full space-y-3">
                    {config.customLinks?.filter(link => !link.isSocial).map(link => (
                        <button 
                            key={link.id} 
                            onClick={() => handleLinkClick(link.url)}
                            style={{
                                color: link.textColor, 
                                background: link.styleType === 'gradient' 
                                    ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` 
                                    : link.bgColor1
                            }} 
                            className="w-full flex items-center justify-center gap-3 font-semibold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            aria-label={link.text}
                        >
                            {link.icon && <LucideIcon name={link.icon as IconName} className="w-5 h-5 flex-shrink-0" />}
                            <span>{link.text}</span>
                        </button>
                    ))}
                </div>
            </div>
        </main>
    );
}