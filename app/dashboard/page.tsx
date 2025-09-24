'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, Smartphone, PlusCircle, Edit, Trash2, Circle, Square, Image as ImageIcon, MessageCircle, Instagram, Facebook, Globe, MapPin, Phone, Mail, ShoppingCart, Link as LinkIcon, Youtube, Twitter, Heart, Star, Camera, Music, Video, Calendar, Clock, User, Users, Home, Building, Car, Plane, Coffee, Gift, Book, Gamepad2, Headphones, Mic, Search, Settings, Download, Upload, Share, Copy, Check, X, Plus, Minus, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Zap, Target, Award, Trophy, Shield, Lock, Unlock, Eye, EyeOff, Bell, BellOff, Volume2, VolumeX, Wifi, WifiOff, Battery, BatteryLow, Signal, SignalZero, SignalLow, SignalMedium, SignalHigh } from 'lucide-react';
import { canCreatePages } from '@/lib/config';

type CustomLink = {
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

type PageConfig = {
    cardText?: string;
    isTextEnabled?: boolean;
    cardBgColor?: string;
    cardTextColor?: string;
    cardBackBgColor?: string;
    logoSize?: number;
    qrCodeSize?: number;
    clientLogoBackSize?: number;
    qrCodePosition?: 'justify-start' | 'justify-end';
    logoPosition?: number; // -100 (esquerda) a +100 (direita), 0 = centro
    socialLinks?: { [key: string]: string };
    customLinks?: CustomLink[];
    landingPageBgColor?: string;
    landingPageBgImage?: string | null;
    landingPageTitleText?: string;
    landingPageSubtitleText?: string;
    landingPageLogoShape?: 'circle' | 'square';
    landingPageLogoSize?: number;
    // new options
    logoOpacityFront?: number;
    logoOpacityBack?: number;
    logoRotationFront?: number; // degrees
    logoRotationBack?: number; // degrees
    logoPositionBack?: number; // -30 (esquerda) a +30 (direita), 0 = centro
    landingFont?: string;
    landingPageTitleColor?: string;
    landingPageSubtitleColor?: string;
};

type QRCodeOptions = { text: string; width: number; height: number };
interface QRCodeConstructor {
    new (element: HTMLElement, options: QRCodeOptions): unknown;
}

type IconName = 'image' | 'message-circle' | 'instagram' | 'facebook' | 'globe' | 'map-pin' | 'phone' | 'mail' | 'shopping-cart' | 'link' | 'youtube' | 'twitter' | 'heart' | 'star' | 'camera' | 'music' | 'video' | 'calendar' | 'clock' | 'user' | 'users' | 'home' | 'building' | 'car' | 'plane' | 'coffee' | 'gift' | 'book' | 'gamepad2' | 'headphones' | 'mic' | 'search' | 'settings' | 'download' | 'upload' | 'share' | 'copy' | 'check' | 'x' | 'plus' | 'minus' | 'arrow-right' | 'arrow-left' | 'arrow-up' | 'arrow-down' | 'chevron-right' | 'chevron-left' | 'chevron-up' | 'chevron-down' | 'zap' | 'target' | 'award' | 'trophy' | 'shield' | 'lock' | 'unlock' | 'eye' | 'eye-off' | 'bell' | 'bell-off' | 'volume2' | 'volume-x' | 'wifi' | 'wifi-off' | 'battery' | 'battery-low' | 'signal' | 'signal-zero' | 'signal-low' | 'signal-medium' | 'signal-high';

const IconForName = ({ name, className, size = 16 }: { name: IconName; className?: string; size?: number }) => {
    const map: Record<IconName, React.ElementType> = {
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
    const C = map[name];
    return <C className={className} size={size} />;
};

export default function DashboardPage() {
    const router = useRouter();
    const [hasActiveSubscription] = useState(canCreatePages());
    const [config, setConfig] = useState<PageConfig>({
        // Configurações do cartão - FRENTE
        cardBgColor: '#FFFFFF',
        cardTextColor: '#1e293b',
        cardText: '',
        isTextEnabled: false,
        logoSize: 60,
        logoPosition: 0, // 0 = centro
        logoOpacityFront: 1,
        logoRotationFront: 0,
        
        // Configurações do cartão - VERSO
        cardBackBgColor: '#e2e8f0',
        qrCodeSize: 35,
        clientLogoBackSize: 35,
        qrCodePosition: 'justify-start',
        logoOpacityBack: 1,
        logoRotationBack: 0,
        logoPositionBack: 0,
        
        // Configurações da landing page
        landingPageBgColor: '#F8FAFC',
        landingPageBgImage: null,
        landingPageTitleText: '',
        landingPageSubtitleText: '',
        landingPageTitleColor: '#1e293b',
        landingPageSubtitleColor: '#64748b',
        landingPageLogoShape: 'circle',
        landingPageLogoSize: 96,
        landingFont: 'Inter',
        
        // Links
        socialLinks: {},
        customLinks: [],
    });

    const [activeStep, setActiveStep] = useState(1);
    const [subdomain, setSubdomain] = useState('');
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const qrcodePreviewRef = useRef<HTMLDivElement>(null);

    const availableIcons: IconName[] = [
        'message-circle', 'instagram', 'facebook', 'youtube', 'twitter', 'globe', 'map-pin', 'phone', 'mail', 'shopping-cart', 'link', 'image',
        'heart', 'star', 'camera', 'music', 'video', 'calendar', 'clock', 'user', 'users', 'home', 'building', 'car', 'plane', 'coffee', 'gift', 'book', 'gamepad2', 'headphones', 'mic', 'search', 'settings', 'download', 'upload', 'share', 'copy', 'check', 'x', 'plus', 'minus', 'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'chevron-right', 'chevron-left', 'chevron-up', 'chevron-down', 'zap', 'target', 'award', 'trophy', 'shield', 'lock', 'unlock', 'eye', 'eye-off', 'bell', 'bell-off', 'volume2', 'volume-x', 'wifi', 'wifi-off', 'battery', 'battery-low', 'signal', 'signal-zero', 'signal-low', 'signal-medium', 'signal-high'
    ];
    const commonEmojis = ['✨', '🚀', '⭐', '❤️', '✅', '👇', '📱', '📞', '💡', '🔥', '🎉', '👋', '🙌', '👍', '😎', '🎁', '🛒', '🔗', '🧭', '💬', '📧', '☎️', '📍', '💼', '🏷️', '🆕', '🏆', '🖼️', '🎬', '🌟', '💫', '🎯', '🎊', '🎈', '🎂', '🍰', '☕', '🌺', '🌸', '🌻', '🌷', '🌹', '🌿', '🍀', '🌈', '☀️', '🌙', '⭐', '💎', '🎪', '🎨', '🎭', '🎪', '🎸', '🎵', '🎶', '🎤', '🎧', '📷', '📹', '🎥', '💻', '📱', '⌚', '📺', '🔊', '🎮', '🕹️', '🎲', '🃏', '🎴', '🀄', '🎯', '🏹', '🎣', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🏏', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '🤾', '🤽', '🤹', '🧘', '🏃', '🚶', '🧗', '🏇', '🏊', '🏄', '🚣', '🏊', '🚴', '🚵', '🤸', '🤾', '🤽', '🤹', '🧘', '🏃', '🚶', '🧗', '🏇', '🏊', '🏄', '🚣', '🏊', '🚴', '🚵'];
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [editingLink, setEditingLink] = useState<CustomLink | null>(null);
    const [showLinkEditor, setShowLinkEditor] = useState(false);
    const [QRCode, setQRCode] = useState<QRCodeConstructor | null>(null);
    const [saving, setSaving] = useState(false);
    const [savingMessage, setSavingMessage] = useState('');
    const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
    const [checkingSubdomain, setCheckingSubdomain] = useState(false);
    const subdomainTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleConfigChange = (key: keyof PageConfig, value: unknown) => {
        setConfig((prev) => {
            const newConfig = { ...prev, [key]: value };
            
            // Sincronizar cor de fundo da frente com o verso
            if (key === 'cardBgColor') {
                newConfig.cardBackBgColor = value as string;
            }
            
            return newConfig;
        });
    };

    const resetToNewPage = () => {
        // Limpar localStorage
        try {
            localStorage.removeItem('zag-dashboard-config');
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
        
        // Resetar todos os estados
        setConfig({
            // Configurações do cartão - FRENTE
            cardBgColor: '#FFFFFF',
            cardTextColor: '#1e293b',
            cardText: '',
            isTextEnabled: false,
            logoSize: 60,
            logoPosition: 0, // 0 = centro
            logoOpacityFront: 1,
            logoRotationFront: 0,
            
            // Configurações do cartão - VERSO
            cardBackBgColor: '#e2e8f0',
            qrCodeSize: 35,
            clientLogoBackSize: 35,
            qrCodePosition: 'justify-start',
            logoOpacityBack: 1,
            logoRotationBack: 0,
            
            // Configurações da landing page
            landingPageBgColor: '#F8FAFC',
            landingPageBgImage: null,
            landingPageTitleText: '',
            landingPageSubtitleText: '',
            landingPageTitleColor: '#1e293b',
            landingPageSubtitleColor: '#64748b',
            landingPageLogoShape: 'circle',
            landingPageLogoSize: 80,
            socialLinks: {},
            customLinks: []
        });
        setSubdomain('');
        setLogoDataUrl('');
        setActiveStep(1);
        setSaving(false);
        setSavingMessage('');
    };

    const checkSubdomainAvailability = async (subdomainToCheck: string) => {
        if (!subdomainToCheck || subdomainToCheck.length < 3) {
            setSubdomainAvailable(null);
            return;
        }

        console.log('Verificando subdomínio:', subdomainToCheck);
        setCheckingSubdomain(true);
        try {
            const response = await fetch('/api/check-subdomain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subdomain: subdomainToCheck }),
            });

            console.log('Resposta da API:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Dados da resposta:', data);
                setSubdomainAvailable(!data.exists);
            } else {
                console.error('Erro na resposta:', response.status);
                setSubdomainAvailable(null);
            }
        } catch (error) {
            console.error('Erro ao verificar subdomínio:', error);
            setSubdomainAvailable(null);
        } finally {
            setCheckingSubdomain(false);
        }
    };

    const optimizeImage = (dataUrl: string, maxSize: number = 800): Promise<string> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    resolve(dataUrl);
                    return;
                }
                
                // Calcular novas dimensões mantendo proporção
                let { width, height } = img;
                if (width > height) {
                    if (width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Desenhar imagem redimensionada
                ctx.drawImage(img, 0, 0, width, height);
                
                // Converter para base64 com qualidade reduzida
                const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(optimizedDataUrl);
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        });
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('O arquivo é muito grande. O tamanho máximo é 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = async (event) => {
                const originalDataUrl = event.target?.result as string;
                // Otimizar a imagem antes de definir
                const optimizedDataUrl = await optimizeImage(originalDataUrl);
                setLogoDataUrl(optimizedDataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNextStep = () => {
        if (!logoDataUrl) {
            alert('É necessário fazer o upload de uma logo.');
            return;
        }
        if (!subdomain.trim()) {
            alert('É necessário preencher o subdomínio.');
            return;
        }
        setConfig((prev) => ({ ...prev, landingPageTitleText: prev.cardText || 'Seu Título Aqui' }));
        setActiveStep(2);
    };

    const openLinkEditor = (link: CustomLink | null = null) => {
        setEditingLink(link);
        setShowLinkEditor(true);
    };

    const saveCustomLink = (linkData: Omit<CustomLink, 'id'>) => {
        if (editingLink) {
            setConfig((prev) => ({
                ...prev,
                customLinks: prev.customLinks?.map((l) => (l.id === editingLink.id ? { ...l, ...linkData } : l)),
            }));
        } else {
            if ((config.customLinks?.filter(b => !b.isSocial).length || 0) >= 4) {
                alert('Você pode adicionar no máximo 4 botões personalizados.');
                return;
            }
            setConfig((prev) => ({
                ...prev,
                customLinks: [...(prev.customLinks || []), { ...linkData, id: Date.now() }],
            }));
        }
        setShowLinkEditor(false);
        setEditingLink(null);
    };

    const deleteCustomLink = (id: number) => {
        setConfig((prev) => ({
            ...prev,
            customLinks: prev.customLinks?.filter((l) => l.id !== id),
        }));
    };

    // Garantir que a página sempre comece limpa
    useEffect(() => {
        // Limpar qualquer localStorage existente
        try {
            localStorage.removeItem('zag-dashboard-config');
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
        
        // Resetar todos os estados para valores padrão
        setConfig({
            // Configurações do cartão - FRENTE
            cardBgColor: '#FFFFFF',
            cardTextColor: '#1e293b',
            cardText: '',
            isTextEnabled: false,
            logoSize: 60,
            logoPosition: 0, // 0 = centro
            logoOpacityFront: 1,
            logoRotationFront: 0,
            
            // Configurações do cartão - VERSO
            cardBackBgColor: '#e2e8f0',
            qrCodeSize: 35,
            clientLogoBackSize: 35,
            qrCodePosition: 'justify-start',
            logoOpacityBack: 1,
            logoRotationBack: 0,
            
            // Configurações da landing page
            landingPageBgColor: '#F8FAFC',
            landingPageBgImage: null,
            landingPageTitleText: '',
            landingPageSubtitleText: '',
            landingPageTitleColor: '#1e293b',
            landingPageSubtitleColor: '#64748b',
            landingPageLogoShape: 'circle',
            landingPageLogoSize: 80,
            socialLinks: {},
            customLinks: []
        });
        setSubdomain('');
        setLogoDataUrl('');
        setActiveStep(1);
    }, []);

    // Dynamic import for QRCode library
    useEffect(() => {
        let mounted = true;
        import('qrcodejs2')
            .then((mod) => {
                if (!mounted) return;
                const factory = (() => {
                    const maybeDefault = (mod as unknown as { default?: unknown }).default;
                    if (typeof maybeDefault === 'function') return maybeDefault as unknown as QRCodeConstructor;
                    if (typeof (mod as unknown) === 'function') return mod as unknown as QRCodeConstructor;
                    return null;
                })();
                if (factory) setQRCode(() => factory);
            })
            .catch(() => {});
        return () => {
            mounted = false;
        };
    }, []);

    // Render QR code whenever dependencies change
    useEffect(() => {
        if (!QRCode || !qrcodePreviewRef.current || !subdomain) return;
        qrcodePreviewRef.current.innerHTML = '';
        const size = Math.round(2.56 * (config.qrCodeSize || 35)); // 25-50% -> 64-128px
        new QRCode(qrcodePreviewRef.current, {
            text: `https://${subdomain}.zagnfc.com.br`,
            width: size,
            height: size,
        });
    }, [QRCode, subdomain, config.qrCodeSize]);

    // Limpar timeout quando componente for desmontado
    useEffect(() => {
        return () => {
            if (subdomainTimeoutRef.current) {
                clearTimeout(subdomainTimeoutRef.current);
            }
        };
    }, []);

    const addSocialPreset = (kind: 'whatsapp' | 'instagram' | 'facebook' | 'youtube' | 'twitter') => {
        const presets: { [k in typeof kind]: { text: string; url: string; icon: IconName; color: string } } = {
            whatsapp: { text: 'WhatsApp', url: 'https://wa.me/+55', icon: 'message-circle', color: '#16a34a' },
            instagram: { text: 'Instagram', url: 'https://instagram.com/', icon: 'instagram', color: '#DB2777' },
            facebook: { text: 'Facebook', url: 'https://facebook.com/', icon: 'facebook', color: '#2563EB' },
            youtube: { text: 'YouTube', url: 'https://youtube.com/', icon: 'youtube', color: '#DC2626' },
            twitter: { text: 'Twitter/X', url: 'https://twitter.com/', icon: 'twitter', color: '#0ea5e9' },
        } as const;
        const p = presets[kind];
        const newBtn = { text: p.text, url: p.url, icon: p.icon, styleType: 'solid' as const, bgColor1: p.color, bgColor2: p.color, textColor: '#ffffff', isSocial: true };
        // Botões sociais são ilimitados
        setConfig(prev => ({ ...prev, customLinks: [...(prev.customLinks || []), { ...newBtn, id: Date.now() }] }));
    };


    // Componente de verificação de pagamento
    const PaymentRequired = () => (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Assinatura Necessária
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Para criar páginas NFC, você precisa de uma assinatura ativa. 
                        Escolha um plano e comece a criar suas páginas personalizadas.
                    </p>
                    <div className="space-y-3">
                        <Link
                            href="/dashboard/payments"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 inline-block"
                        >
                            Ver Planos e Preços
                        </Link>
                        <p className="text-sm text-gray-500">
                            A partir de R$ 29,90/mês
                        </p>
                        </div>
                    </div>
                </div>
        </div>
    );

    // Se não tem assinatura ativa, mostrar tela de pagamento
    if (!hasActiveSubscription) {
        return <PaymentRequired />;
    }

    return (
        <>
            {/* Banner de Desenvolvimento */}
            {canCreatePages() && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <strong>Modo de Desenvolvimento:</strong> Você pode criar páginas sem pagamento para testar o sistema.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Botão Nova Página */}
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Criar Nova Página</h1>
                <button
                    onClick={resetToNewPage}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Nova Página</span>
                </button>
            </div>
            
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 card-container">
                <header className="mb-8 flex items-center space-x-4">
                    <Image src="/logo-zag.png" alt="Zag Card Logo" width={128} height={128} className="h-24 w-auto" style={{ width: 'auto', height: 'auto' }} />
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Configure seu Zag Card</h1>
                        <p className="text-slate-500 mt-1">Siga as etapas para personalizar seu produto.</p>
                    </div>
                </header>

                <div className="flex items-center justify-center space-x-4 md:space-x-8 mb-8">
                    <div className={`flex items-center space-x-2 border-b-4 pb-2 transition-all duration-300 ${activeStep === 1 ? 'border-blue-500 text-blue-600' : 'border-green-500 text-green-600'}`}>
                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">
                            <CreditCard size={16} />
                        </div>
                        <span className="font-semibold hidden md:block">Design do Cartão</span>
                    </div>
                    <div className="flex-1 border-t-2 border-dashed border-slate-300"></div>
                    <div className={`flex items-center space-x-2 border-b-4 pb-2 transition-all duration-300 ${activeStep === 2 ? 'border-blue-500 text-blue-600' : 'border-slate-300 text-slate-500'}`}>
                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">
                            <Smartphone size={16} />
                        </div>
                        <span className="font-semibold hidden md:block">Landing Page</span>
                    </div>
                </div>
                
                <main>
                    {activeStep === 1 && (
                        <div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 card-container">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                    <p className="text-center font-semibold mb-4">Frente</p>
                                    <div style={{ backgroundColor: config.cardBgColor }} className="w-80 h-48 mx-auto rounded-xl shadow-lg relative p-4 transition-colors duration-300 border overflow-hidden card-preview">
                                        {/* Logo com posicionamento simplificado e centralizado */}
                                        {logoDataUrl ? (
                                            <div 
                                                className="absolute transition-all duration-300"
                                                style={{ 
                                                    width: `${config.logoSize || 60}%`, 
                                                    height: `${config.logoSize || 60}%`,
                                                    top: '50%', 
                                                    left: `${50 + (config.logoPosition || 0) * 0.3}%`, 
                                                    transform: `translate(-50%, -50%) rotate(${config.logoRotationFront || 0}deg)`,
                                                    opacity: config.logoOpacityFront ?? 1,
                                                    overflow: 'hidden',
                                                    borderRadius: '8px'
                                                }}
                                            >
                                                <Image 
                                                    src={logoDataUrl} 
                                                    alt="Logo Preview" 
                                                    width={120} 
                                                    height={120} 
                                                    className="object-contain w-full h-full image-transparent" 
                                                    style={{ 
                                                        filter: 'none',
                                                        mixBlendMode: 'normal',
                                                        background: 'transparent'
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.accept = 'image/*';
                                                    input.onchange = (e) => {
                                                        const file = (e.target as HTMLInputElement).files?.[0];
                                                        if (file) {
                                                            handleLogoUpload(e as unknown as React.ChangeEvent<HTMLInputElement>);
                                                        }
                                                    };
                                                    input.click();
                                                }}
                                                className="absolute w-20 h-20 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer border-2 border-dashed border-slate-300 hover:border-slate-400"
                                                style={{
                                                    top: '50%', 
                                                    left: `${50 + (config.logoPosition || 0) * 0.3}%`, 
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                                title="Clique para fazer upload do logo"
                                            >
                                                <ImageIcon className="w-8 h-8 text-slate-400" />
                                            </button>
                                        )}
                                        
                                        {/* Texto com posicionamento fixo na parte inferior */}
                                        {config.isTextEnabled && (
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <p style={{ color: config.cardTextColor }} className="text-center font-semibold text-sm break-words">
                                                    {config.cardText || 'Seu Nome'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6 space-y-4 max-w-sm mx-auto">
                                        <h3 className="font-bold text-lg border-b pb-2">Personalizar Frente</h3>
                                        
                                        {/* Cores - Primeiro */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo</label>
                                                <input type="color" value={config.cardBgColor} onChange={(e) => handleConfigChange('cardBgColor', e.target.value)} className="w-full h-10 border border-slate-300 rounded-md" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Cor do Texto</label>
                                                <input type="color" value={config.cardTextColor} onChange={(e) => handleConfigChange('cardTextColor', e.target.value)} className="w-full h-10 border border-slate-300 rounded-md" />
                                            </div>
                                        </div>
                                        
                                        {/* Logo da Empresa */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Logo da Empresa</label>
                                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
                                            <p className="text-xs text-slate-400 mt-1">Tamanho máximo: 5MB.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Posicionamento da Logo ({(config.logoPosition ?? 0) === 0 ? 'Centro' : (config.logoPosition ?? 0) < 0 ? 'Esquerda' : 'Direita'})
                                            </label>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xs text-slate-500">Esquerda</span>
                                                <input 
                                                    type="range" 
                                                    min={-30} 
                                                    max={30} 
                                                    value={config.logoPosition || 0} 
                                                    onChange={(e) => handleConfigChange('logoPosition', Number(e.target.value))} 
                                                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" 
                                                />
                                                <span className="text-xs text-slate-500">Direita</span>
                                            </div>
                                            <div className="text-center mt-1">
                                                <span className="text-xs text-slate-400">
                                                    {(config.logoPosition ?? 0) === 0 ? 'Centro' : `${(config.logoPosition ?? 0) > 0 ? '+' : ''}${config.logoPosition ?? 0}%`}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Removed logo editor and color suggestion per request */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Opacidade da Logo (Frente) ({Math.round((config.logoOpacityFront ?? 1) * 100)}%)</label>
                                                <input type="range" min={10} max={100} value={Math.round((config.logoOpacityFront ?? 1) * 100)} onChange={(e) => handleConfigChange('logoOpacityFront', Number(e.target.value) / 100)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" />
                                            </div>
                                        <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Rotação da Logo (Frente) ({config.logoRotationFront || 0}°)</label>
                                                <input type="range" min={-180} max={180} value={config.logoRotationFront || 0} onChange={(e) => handleConfigChange('logoRotationFront', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Remover Fundo da Logo</label>
                                            <a 
                                                href="https://www.remove.bg/" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                Remover Fundo Online
                                            </a>
                                            <p className="text-xs text-slate-500 mt-1">Ferramenta gratuita para remover o fundo da sua logo</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Tamanho da Logo ({config.logoSize}%)</label>
                                                <input type="range" min={40} max={100} value={config.logoSize} onChange={(e) => handleConfigChange('logoSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Texto do Cartão</label>
                                            <input 
                                                type="text" 
                                                placeholder="Seu Nome ou Empresa" 
                                                value={config.cardText || ''} 
                                                onChange={(e) => handleConfigChange('cardText', e.target.value)} 
                                                onFocus={() => handleConfigChange('isTextEnabled', true)}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500" 
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                    <p className="text-center font-semibold mb-4">Verso</p>
                                    <div style={{ backgroundColor: config.cardBackBgColor }} className="w-80 h-48 mx-auto rounded-xl shadow-lg p-4 border relative overflow-hidden card-preview">
                                        {logoDataUrl && (
                                            <Image src={logoDataUrl} alt="Logo Verso" width={150} height={150} className="object-contain absolute transition-all duration-300 image-transparent" style={{ width: `${config.clientLogoBackSize}%`, top: '50%', left: `${50 + (config.logoPositionBack ?? 0) * 0.3}%`, transform: `translate(-50%, -50%) rotate(${config.logoRotationBack || 0}deg)`, opacity: config.logoOpacityBack ?? 0.3, background: 'transparent' }} />
                                        )}
                                        <div className={`absolute inset-0 p-4 flex items-center ${config.qrCodePosition}`}>
                                            <div ref={qrcodePreviewRef} className="bg-white p-1 rounded-md aspect-square" style={{ width: `${config.qrCodeSize}%` }} />
                                        </div>
                                        {/* Logo Zag fixa no canto inferior direito - sempre visível e sutil */}
                                        <Image 
                                            src="/logo-zag.png" 
                                            alt="Logo Zag Card" 
                                            width={60} 
                                            height={18} 
                                            className="absolute bottom-2 right-2 h-4 w-auto object-contain opacity-60" 
                                            style={{ 
                                                width: 'auto', 
                                                height: 'auto',
                                                minWidth: '40px',
                                                maxWidth: '60px'
                                            }} 
                                        />
                                    </div>
                                    <div className="mt-6 space-y-4 max-w-sm mx-auto">
                                        <h3 className="font-bold text-lg border-b pb-2">Personalizar Verso</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Seu Subdomínio</label>
                                            <div className="flex">
                                                <input 
                                                    type="text" 
                                                    placeholder="sua-empresa" 
                                                    value={subdomain} 
                                                    onChange={(e) => {
                                                        const newSubdomain = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                                                        setSubdomain(newSubdomain);
                                                        
                                                        // Limpar timeout anterior
                                                        if (subdomainTimeoutRef.current) {
                                                            clearTimeout(subdomainTimeoutRef.current);
                                                        }
                                                        
                                                        // Verificar disponibilidade após 500ms de inatividade
                                                        subdomainTimeoutRef.current = setTimeout(() => {
                                                            checkSubdomainAvailability(newSubdomain);
                                                        }, 500);
                                                    }} 
                                                    className={`w-full px-3 py-2 border rounded-l-md shadow-sm ${
                                                        subdomainAvailable === true ? 'border-green-500' : 
                                                        subdomainAvailable === false ? 'border-red-500' : 
                                                        'border-slate-300'
                                                    }`} 
                                                />
                                                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">.zagnfc.com.br</span>
                                            </div>
                                            {subdomain && subdomain.length >= 3 && (
                                                <div className="mt-1 text-sm">
                                                    {checkingSubdomain ? (
                                                        <span className="text-blue-600">Verificando disponibilidade...</span>
                                                    ) : subdomainAvailable === true ? (
                                                        <span className="text-green-600">✓ Subdomínio disponível</span>
                                                    ) : subdomainAvailable === false ? (
                                                        <span className="text-red-600">✗ Subdomínio já existe</span>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo</label>
                                            <input type="color" value={config.cardBackBgColor} onChange={(e) => handleConfigChange('cardBackBgColor', e.target.value)} className="w-full h-10 border border-slate-300 rounded-md" />
                                        </div>
                                        <hr />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Opacidade da Logo (Verso) ({Math.round((config.logoOpacityBack ?? 0.3) * 100)}%)</label>
                                                <input type="range" min={10} max={100} value={Math.round((config.logoOpacityBack ?? 0.3) * 100)} onChange={(e) => handleConfigChange('logoOpacityBack', Number(e.target.value) / 100)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Rotação da Logo (Verso) ({config.logoRotationBack || 0}°)</label>
                                                <input type="range" min={-180} max={180} value={config.logoRotationBack || 0} onChange={(e) => handleConfigChange('logoRotationBack', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Tamanho do QR Code ({config.qrCodeSize}%)</label>
                                            <input type="range" min={25} max={50} value={config.qrCodeSize} onChange={(e) => handleConfigChange('qrCodeSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" />
                                            <p className="text-xs text-slate-500 mt-1">💡 O tamanho padrão (35%) é o recomendado para melhor leitura</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Posição do QR Code</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button onClick={() => handleConfigChange('qrCodePosition', 'justify-start')} className={`border rounded p-2 text-xs ${config.qrCodePosition === 'justify-start' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-300 hover:bg-slate-50'}`}>Esquerda</button>
                                                <button onClick={() => handleConfigChange('qrCodePosition', 'justify-end')} className={`border rounded p-2 text-xs ${config.qrCodePosition === 'justify-end' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-300 hover:bg-slate-50'}`}>Direita</button>
                                            </div>
                                        </div>
                                        <hr />
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Tamanho da sua Logo no verso ({config.clientLogoBackSize}%)</label>
                                            <input type="range" min={20} max={70} value={config.clientLogoBackSize} onChange={(e) => handleConfigChange('clientLogoBackSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Posicionamento da Logo no Verso ({(config.logoPositionBack ?? 0) === 0 ? 'Centro' : (config.logoPositionBack ?? 0) < 0 ? 'Esquerda' : 'Direita'})
                                            </label>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xs text-slate-500">Esquerda</span>
                                                <input 
                                                    type="range" 
                                                    min={-30} 
                                                    max={30} 
                                                    value={config.logoPositionBack ?? 0} 
                                                    onChange={(e) => handleConfigChange('logoPositionBack', Number(e.target.value))} 
                                                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" 
                                                />
                                                <span className="text-xs text-slate-500">Direita</span>
                                            </div>
                                            <div className="text-center mt-1">
                                                <span className="text-xs text-slate-400">
                                                    {(config.logoPositionBack ?? 0) === 0 ? 'Centro' : `${(config.logoPositionBack ?? 0) > 0 ? '+' : ''}${config.logoPositionBack ?? 0}%`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-center">
                                <button onClick={handleNextStep} className="w-full max-w-md bg-slate-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-900 transition-colors duration-300">Próximo Passo</button>
                            </div>
                        </div>
                    )}
                    
                    {activeStep === 2 && (
                        <div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-y-auto" style={{ maxHeight: '85vh' }}>
                                    <div className="space-y-6">
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm font-medium text-blue-800">Design do cartão salvo! Agora, personalize a sua página de botões.</p>
                                        </div>
                                        <fieldset className="border-t pt-4">
                                            <legend className="text-lg font-semibold text-slate-800 -mt-7 px-2 bg-white">Conteúdo da Página</legend>
                                            <div className="space-y-4 mt-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Título Principal</label>
                                                    <input type="text" value={config.landingPageTitleText || ''} onChange={(e) => handleConfigChange('landingPageTitleText', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo (opcional)</label>
                                                    <div className="relative">
                                                        <input type="text" placeholder="Sua frase de efeito aqui" value={config.landingPageSubtitleText || ''} onChange={(e) => handleConfigChange('landingPageSubtitleText', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md pr-10" />
                                                        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-amber-600">😊</button>
                                                    </div>
                                                    {showEmojiPicker && (
                                                        <div className="grid grid-cols-8 gap-1 p-2 bg-white border rounded-lg shadow-lg mt-2 absolute z-10">
                                                            {commonEmojis.map((emoji) => (
                                                                <button key={emoji} onClick={() => { handleConfigChange('landingPageSubtitleText', (config.landingPageSubtitleText || '') + emoji); setShowEmojiPicker(false); }} className="text-xl p-1 transition-transform duration-150 hover:scale-125 hover:bg-slate-100 rounded">
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="pt-2">
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">Aparência da Logo</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button onClick={() => handleConfigChange('landingPageLogoShape', 'circle')} className={`border rounded p-2 text-xs flex items-center justify-center gap-2 ${config.landingPageLogoShape === 'circle' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-300 hover:bg-slate-50'}`}><Circle size={14} /> Redonda</button>
                                                        <button onClick={() => handleConfigChange('landingPageLogoShape', 'square')} className={`border rounded p-2 text-xs flex items-center justify-center gap-2 ${config.landingPageLogoShape === 'square' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-300 hover:bg-slate-50'}`}><Square size={14} /> Quadrada</button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">Fonte da Página</label>
                                                    <select value={config.landingFont || 'Inter'} onChange={(e) => handleConfigChange('landingFont', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                                                        <option value="Inter">Inter</option>
                                                        <option value="Roboto">Roboto</option>
                                                        <option value="Poppins">Poppins</option>
                                                        <option value="Montserrat">Montserrat</option>
                                                        <option value="Open Sans">Open Sans</option>
                                                    </select>
                                                    <p className="text-xs text-slate-500 mt-1">Aplicada ao título e subtítulo.</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">Cor do Título</label>
                                                        <input type="color" value={config.landingPageTitleColor || '#1e293b'} onChange={(e) => handleConfigChange('landingPageTitleColor', e.target.value)} className="w-full h-10 border border-slate-300 rounded-md" />
                                            </div>
                                                <div>
                                                        <label className="block text-sm font-medium text-slate-700 mb-2">Cor do Subtítulo</label>
                                                        <input type="color" value={config.landingPageSubtitleColor || '#64748b'} onChange={(e) => handleConfigChange('landingPageSubtitleColor', e.target.value)} className="w-full h-10 border border-slate-300 rounded-md" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-2">Botões rápidos (sociais)</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button onClick={() => addSocialPreset('whatsapp')} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300 flex items-center gap-1"><MessageCircle size={14}/> WhatsApp</button>
                                                        <button onClick={() => addSocialPreset('instagram')} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300 flex items-center gap-1"><Instagram size={14}/> Instagram</button>
                                                        <button onClick={() => addSocialPreset('facebook')} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300 flex items-center gap-1"><Facebook size={14}/> Facebook</button>
                                                        <button onClick={() => addSocialPreset('youtube')} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300 flex items-center gap-1"><Youtube size={14}/> YouTube</button>
                                                        <button onClick={() => addSocialPreset('twitter')} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300 flex items-center gap-1"><Twitter size={14}/> Twitter</button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Tamanho da Logo na Página ({config.landingPageLogoSize}px)</label>
                                                    <input type="range" min={48} max={128} value={config.landingPageLogoSize} onChange={(e) => handleConfigChange('landingPageLogoSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo da Página</label>
                                                    <input type="color" value={config.landingPageBgColor || '#ffffff'} onChange={(e) => handleConfigChange('landingPageBgColor', e.target.value)} className="w-24 h-10 border border-slate-300 rounded-md" />
                                                </div>
                                            </div>
                                        </fieldset>
                                        
                                        <fieldset className="border-t pt-4">
                                            <legend className="text-lg font-semibold text-slate-800 -mt-7 px-2 bg-white">Botões Personalizados (até 4) + Sociais (ilimitados)</legend>
                                            <div className="space-y-4 mt-4">
                                                <button onClick={() => openLinkEditor(null)} className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2">
                                                    <PlusCircle /> Adicionar Novo Botão
                                                </button>
                                                <div className="space-y-2">
                                                    {config.customLinks?.map((link) => (
                                                        <div key={link.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                                                            <div className="flex items-center gap-2">
                                                                {link.icon && <IconForName name={link.icon as IconName} className="w-5 h-5 text-slate-600" />}
                                                                <span className="text-sm font-medium">{link.text} {link.isSocial && <em className="text-xs text-slate-500 italic">({link.url}coloque-seu-dado)</em>}</span>
                                                            </div>
                                                            <div>
                                                                <button onClick={() => openLinkEditor(link)} className="p-1 text-slate-500 hover:text-slate-800"><Edit size={16} /></button>
                                                                <button onClick={() => deleteCustomLink(link.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </fieldset>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                                    <p className="text-center font-semibold mb-4">Preview da Landing Page</p>
                                    <div className="w-72 h-[600px] bg-slate-100 rounded-3xl p-4 shadow-xl border-8 border-slate-300 flex flex-col overflow-hidden">
                                        <div className="flex-shrink-0 mx-auto mb-4">
                                            <div className="w-32 h-6 bg-slate-800 rounded-full"></div>
                                        </div>
                                        <div style={{ backgroundColor: config.landingPageBgColor, backgroundImage: config.landingPageBgImage ? `url('${config.landingPageBgImage}')` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} className="flex-grow overflow-y-auto p-4 rounded-2xl">
                                            <div className="flex flex-col items-center text-center space-y-4">
                                                {logoDataUrl ? (
                                                    <Image src={logoDataUrl} alt="Logo Preview" width={config.landingPageLogoSize || 96} height={config.landingPageLogoSize || 96} className={`object-cover mx-auto shadow-md image-transparent ${config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`} style={{ background: 'transparent' }} />
                                                ) : (
                                                    <div className={`w-24 h-24 bg-slate-200 flex items-center justify-center shadow-md ${config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`}>
                                                        <ImageIcon className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                )}
                                                <h1 className="text-xl font-bold break-words" style={{ fontFamily: `var(--font-${(config.landingFont || 'Inter').toLowerCase().replace(' ', '-')})`, color: config.landingPageTitleColor || '#1e293b' }}>{config.landingPageTitleText || 'Bem-vindo(a)!'}</h1>
                                                {config.landingPageSubtitleText && <p className="text-sm px-2 break-words" style={{ fontFamily: `var(--font-${(config.landingFont || 'Inter').toLowerCase().replace(' ', '-')})`, color: config.landingPageSubtitleColor || '#64748b' }}>{config.landingPageSubtitleText}</p>}
                                                {/* Botões Sociais (Redondos) */}
                                                <div className="w-full flex flex-wrap justify-center items-center gap-3 mb-4">
                                                    {config.customLinks?.filter(link => link.isSocial).map((link) => (
                                                        <div key={link.id} className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md" style={{ background: link.styleType === 'gradient' ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` : link.bgColor1 }}>
                                                            {link.icon ? (
                                                                <IconForName name={link.icon as IconName} size={20} />
                                                            ) : (
                                                                <span className="text-xs font-bold">?</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                {/* Botões Personalizados (Retangulares) */}
                                                <div className="w-full flex flex-col items-center gap-2">
                                                    {config.customLinks?.filter(link => !link.isSocial).map((link) => (
                                                        <div key={link.id} className="w-48 h-10 rounded-lg flex items-center justify-center text-white shadow-md gap-2" style={{ background: link.styleType === 'gradient' ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` : link.bgColor1 }}>
                                                            {link.icon && <IconForName name={link.icon as IconName} size={16} />}
                                                            <span className="text-sm font-medium">{link.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex flex-col md:flex-row md:justify-between gap-3">
                                <button className="w-full md:w-auto bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-lg hover:bg-slate-300" onClick={() => setActiveStep(1)}>
                                    Voltar
                                </button>
                                <button 
                                    className="w-full md:w-auto bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300"
                                    onClick={async () => {
                                        // Verificar se o subdomínio está disponível
                                        if (subdomainAvailable === false) {
                                            alert('Este subdomínio já está em uso. Escolha outro nome.');
                                            return;
                                        }

                                        if (!subdomain || subdomain.length < 3) {
                                            alert('Por favor, escolha um subdomínio válido (mínimo 3 caracteres).');
                                            return;
                                        }

                                        setSaving(true);
                                        setSavingMessage('Salvando página...');
                                        
                                        try {
                                            // Não salvar no localStorage - sempre começar limpo

                                            // Simular progresso
                                            await new Promise(resolve => setTimeout(resolve, 500));
                                            setSavingMessage('Publicando página...');

                                            // Verificar tamanho dos dados antes de enviar
                                            const payload = {
                                                subdomain,
                                                config,
                                                logo_url: logoDataUrl
                                            };
                                            
                                            const payloadSize = JSON.stringify(payload).length;
                                            console.log('Payload size:', payloadSize, 'bytes');
                                            
                                            // Se o payload for muito grande, mostrar aviso
                                            if (payloadSize > 1024 * 1024) { // 1MB
                                                console.warn('Payload muito grande:', payloadSize, 'bytes');
                                            }

                                            // Detectar se é mobile
                                            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                                            console.log('Is mobile:', isMobile);
                                            
                                            // Salvar no banco de dados
                                            const response = await fetch('/api/pages', {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify(payload),
                                            });

                                            if (!response.ok) {
                                                let errorMessage = 'Erro ao salvar';
                                                try {
                                                    const errorData = await response.json();
                                                    errorMessage = errorData.error || errorMessage;
                                                } catch (parseError) {
                                                    // Se não conseguir fazer parse do JSON, usar o status e texto da resposta
                                                    const responseText = await response.text();
                                                    console.error('Response text:', responseText);
                                                    errorMessage = `Erro ${response.status}: ${responseText.substring(0, 100)}`;
                                                }
                                                throw new Error(errorMessage);
                                            }

                                            setSavingMessage('Redirecionando...');
                                            await new Promise(resolve => setTimeout(resolve, 300));
                                            
                                            const pageData = await response.json();
                                            router.push(`/success?subdomain=${subdomain}&pageId=${pageData.id}`);
                                        } catch (error) {
                                            console.error('Erro ao salvar:', error);
                                            alert('Erro ao salvar: ' + (error as Error).message);
                                        } finally {
                                            setSaving(false);
                                            setSavingMessage('');
                                        }
                                    }}
                                >
                                    Salvar e Publicar
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            
            {showLinkEditor && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4">
                        <h2 className="text-2xl font-bold">{editingLink ? 'Editar Botão' : 'Adicionar Novo Botão'}</h2>
                        <LinkEditorForm initial={editingLink || null} icons={availableIcons} onCancel={() => setShowLinkEditor(false)} onSave={saveCustomLink} />
                    </div>
                </div>
            )}

            {/* Modal de loading durante salvamento */}
            {saving && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="relative inline-block mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">✓</span>
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                {savingMessage}
                            </h2>
                            
                            <p className="text-gray-600 mb-6">
                                Por favor, aguarde enquanto processamos sua página...
                            </p>
                            
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Removed logo editor per request */}
        </>
    );
}

function LinkEditorForm({ initial, onSave, onCancel, icons }: { initial: CustomLink | null; onSave: (d: Omit<CustomLink, 'id'>) => void; onCancel: () => void; icons: string[] }) {
    const getSocialBaseUrl = (icon: string | null) => {
        if (!icon) return '';
        const baseUrls: { [key: string]: string } = {
            'message-circle': 'https://wa.me/+55',
            'instagram': 'https://instagram.com/',
            'facebook': 'https://facebook.com/',
            'youtube': 'https://youtube.com/',
            'twitter': 'https://twitter.com/',
        };
        return baseUrls[icon] || '';
    };

    const getSocialPlaceholder = (icon: string | null) => {
        if (!icon) return '';
        const placeholders: { [key: string]: string } = {
            'message-circle': 'Ex: 11999999999 (código de área + número)',
            'instagram': 'Ex: @seuusuario',
            'facebook': 'Ex: seuusuario',
            'youtube': 'Ex: @seucanal',
            'twitter': 'Ex: @seuusuario',
        };
        return placeholders[icon] || '';
    };

    const [data, setData] = useState({
        text: initial?.text || '',
        url: initial?.url || (initial?.isSocial ? getSocialBaseUrl(initial?.icon) : ''),
        icon: initial?.icon || null as string | null,
        styleType: (initial?.styleType || 'solid') as 'solid' | 'gradient',
        bgColor1: initial?.bgColor1 || '#1e293b',
        bgColor2: initial?.bgColor2 || '#475569',
        textColor: initial?.textColor || '#ffffff',
    });

    const handleSubmit = () => {
        if (!data.text || !data.url) {
            alert('Texto e URL são obrigatórios.'); 
            return;
        }
        
        // Garantir que URLs personalizadas tenham protocolo
        let finalUrl = data.url;
        if (!getSocialBaseUrl(data.icon)) {
            // Se não é um botão social, garantir que tenha protocolo
            if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
                finalUrl = 'http://' + finalUrl;
            }
        }
        
        onSave({ ...data, url: finalUrl });
    };

    return (
        <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Texto do Botão</label>
                <input type="text" value={data.text} onChange={(e) => setData({ ...data, text: e.target.value })} placeholder="Ex: Meu Site" className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">URL / Link</label>
                <div className="flex">
                    <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-md text-sm text-slate-600">
                        {getSocialBaseUrl(data.icon) || 'https://'}
                    </span>
                    <input 
                        type="text" 
                        value={getSocialBaseUrl(data.icon) ? data.url.replace(getSocialBaseUrl(data.icon), '') : data.url} 
                        onChange={(e) => {
                            const baseUrl = getSocialBaseUrl(data.icon);
                            const newUrl = baseUrl ? baseUrl + e.target.value : e.target.value;
                            setData({ ...data, url: newUrl });
                        }} 
                        placeholder={getSocialBaseUrl(data.icon) ? "seuusuario" : "exemplo.com"} 
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-r-md" 
                    />
                </div>
                {getSocialPlaceholder(data.icon) && (
                    <p className="text-xs text-slate-500 mt-1 italic">{getSocialPlaceholder(data.icon)}</p>
                )}
                {!getSocialBaseUrl(data.icon) && (
                    <p className="text-xs text-slate-500 mt-1 italic">Digite a URL completa (ex: https://meusite.com)</p>
                )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ícone</label>
                    <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-md border">
                        <div onClick={() => setData({ ...data, icon: null })} className={`p-3 border rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-amber-100 transition-colors ${data.icon === null ? 'bg-amber-200 border-amber-400' : 'border-slate-300'}`}>
                            <span className="text-xs font-medium text-slate-500">Nenhum</span>
                        </div>
                        {icons.map((icon) => (
                            <div key={icon} onClick={() => setData({ ...data, icon })} className={`p-3 border rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-amber-100 transition-colors ${data.icon === icon ? 'bg-amber-200 border-amber-400' : 'border-slate-300'}`} title={icon}>
                                <IconForName name={icon as IconName} className="w-5 h-5 text-slate-600 mb-1" />
                                <span className="text-xs text-slate-500 text-center leading-tight">{icon.replace('-', ' ')}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center">
                    <input id="gradient-toggle" type="checkbox" checked={data.styleType === 'gradient'} onChange={(e) => setData({ ...data, styleType: e.target.checked ? 'gradient' : 'solid' })} className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500" />
                    <label htmlFor="gradient-toggle" className="ml-2 block text-sm text-gray-900">Usar fundo gradiente</label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo 1</label>
                        <input type="color" value={data.bgColor1} onChange={(e) => setData({ ...data, bgColor1: e.target.value })} className="w-full h-10 border border-slate-300 rounded-md" />
                        </div>
                    {data.styleType === 'gradient' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo 2</label>
                            <input type="color" value={data.bgColor2} onChange={(e) => setData({ ...data, bgColor2: e.target.value })} className="w-full h-10 border border-slate-300 rounded-md" />
                        </div>
                    )}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cor do Texto</label>
                        <input type="color" value={data.textColor} onChange={(e) => setData({ ...data, textColor: e.target.value })} className="w-full h-10 border border-slate-300 rounded-md" />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                <button onClick={onCancel} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300">Cancelar</button>
                <button onClick={handleSubmit} className="bg-slate-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-900">Salvar</button>
            </div>
        </div>
    );
}


