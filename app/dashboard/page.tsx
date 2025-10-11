'use client';



import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import Link from 'next/link';

import { useRouter } from 'next/navigation';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { CreditCard, Smartphone, PlusCircle, Edit, Trash2, Circle, Square, Image as ImageIcon, MessageCircle, Instagram, Facebook, Globe, MapPin, Phone, Mail, ShoppingCart, Link as LinkIcon, Youtube, Twitter, Heart, Star, Camera, Music, Video, Calendar, Clock, User, Users, Home, Building, Car, Plane, Coffee, Gift, Book, Gamepad2, Headphones, Mic, Search, Settings, Download, Upload, Share, Share2, Copy, Check, X, Plus, Minus, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Zap, Target, Award, Trophy, Shield, Lock, Unlock, Eye, EyeOff, Bell, BellOff, Volume2, VolumeX, Wifi, WifiOff, Battery, BatteryLow, Signal, SignalZero, SignalLow, SignalMedium, SignalHigh, Linkedin, UserPlus } from 'lucide-react';

import PixIconCustom from '@/app/components/PixIcon';
import BackgroundRemovalButton from '@/app/components/BackgroundRemovalButton';

import { canCreatePagesWithAdmin } from '@/lib/config';

import { jsPDF } from 'jspdf';



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

    landingPageLogoUrl?: string | null;

    landingPageBannerUrl?: string | null;

    // new options

    logoOpacityFront?: number;

    logoOpacityBack?: number;

    logoRotationFront?: number; // degrees

    logoRotationBack?: number; // degrees

    logoPositionBack?: number; // -30 (esquerda) a +30 (direita), 0 = centro

    landingFont?: string;

    landingPageTitleColor?: string;

    landingPageSubtitleColor?: string;

    socialButtonColors?: { [key: string]: string };

    socialButtonColor?: string;

};



type QRCodeOptions = { text: string; width: number; height: number };

interface QRCodeConstructor {

    new (element: HTMLElement, options: QRCodeOptions): unknown;

}



type IconName = 'image' | 'message-circle' | 'instagram' | 'facebook' | 'globe' | 'map-pin' | 'phone' | 'mail' | 'shopping-cart' | 'link' | 'youtube' | 'twitter' | 'heart' | 'star' | 'camera' | 'music' | 'video' | 'calendar' | 'clock' | 'user' | 'users' | 'home' | 'building' | 'car' | 'plane' | 'coffee' | 'gift' | 'book' | 'gamepad2' | 'headphones' | 'mic' | 'search' | 'settings' | 'download' | 'upload' | 'share' | 'copy' | 'check' | 'x' | 'plus' | 'minus' | 'arrow-right' | 'arrow-left' | 'arrow-up' | 'arrow-down' | 'chevron-right' | 'chevron-left' | 'chevron-up' | 'chevron-down' | 'zap' | 'target' | 'award' | 'trophy' | 'shield' | 'lock' | 'unlock' | 'eye' | 'eye-off' | 'bell' | 'bell-off' | 'volume2' | 'volume-x' | 'wifi' | 'wifi-off' | 'battery' | 'battery-low' | 'signal' | 'signal-zero' | 'signal-low' | 'signal-medium' | 'signal-high' | 'pix' | 'linkedin' | 'user-plus';



const IconForName = ({ name, className, size = 16 }: { name: IconName; className?: string; size?: number }) => {

    // Caso especial para o ícone PIX customizado
    if (name === 'pix') {
        return <PixIconCustom size={size} className={className} />;
    }

    const map: Record<Exclude<IconName, 'pix'>, React.ElementType> = {

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

        linkedin: Linkedin,

        'user-plus': UserPlus,

    };

    const C = map[name as Exclude<IconName, 'pix'>];

    return C ? <C className={className} size={size} /> : null;

};



export default function DashboardPage() {

    const router = useRouter();

    const [userName, setUserName] = useState<string>('');

    const [userEmail, setUserEmail] = useState<string>('');

    const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

    const [config, setConfig] = useState<PageConfig>({

        // Configurações do cartão - FRENTE

        cardBgColor: '#FFFFFF',

        cardTextColor: '#1e293b',

        cardText: '',

        isTextEnabled: false,

        logoSize: 80,

        logoPosition: 0, // 0 = centro

        logoOpacityFront: 1,

        logoRotationFront: 0,

        

        // Configurações do cartão - VERSO

        cardBackBgColor: '#e2e8f0',

        qrCodeSize: 35,

        clientLogoBackSize: 50,

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

        landingPageLogoUrl: null,

        landingPageBannerUrl: null,

        landingFont: 'Inter',

        

        // Links

        socialLinks: {},

        customLinks: [],

        

        // Cores dos botões sociais

        socialButtonColors: {

            'message-circle': '#25D366',

            'instagram': '#E4405F',

            'youtube': '#FF0000',

            'pix': '#32BCAD',

            'linkedin': '#0077B5',

        },

        socialButtonColor: '#3B82F6', // Cor padrão para todos os botões sociais

    });



    const [activeStep, setActiveStep] = useState(1);

    const [subdomain, setSubdomain] = useState('');

    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

    const [showCardConfirmation, setShowCardConfirmation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const qrcodePreviewRef = useRef<HTMLDivElement>(null);



    const availableIcons: IconName[] = [

        'message-circle', 'instagram', 'facebook', 'youtube', 'twitter', 'pix', 'linkedin', 'globe', 'map-pin', 'phone', 'mail', 'shopping-cart', 'link', 'image',

        'heart', 'star', 'camera', 'music', 'video', 'calendar', 'clock', 'user', 'users', 'home', 'building', 'car', 'plane', 'coffee', 'gift', 'book', 'gamepad2', 'headphones', 'mic', 'search', 'settings', 'download', 'upload', 'share', 'copy', 'check', 'x', 'plus', 'minus', 'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'chevron-right', 'chevron-left', 'chevron-up', 'chevron-down', 'zap', 'target', 'award', 'trophy', 'shield', 'lock', 'unlock', 'eye', 'eye-off', 'bell', 'bell-off', 'volume2', 'volume-x', 'wifi', 'wifi-off', 'battery', 'battery-low', 'signal', 'signal-zero', 'signal-low', 'signal-medium', 'signal-high'

    ];

    const emojiCategories = {

        'Geral': ['✨', '🚀', '⭐', '❤️', '✅', '👇', '📱', '📞', '💡', '🔥', '🎉', '👋', '🙌', '👍', '😎', '🎁', '🛒', '🔗', '🧭', '💬', '📧', '☎️', '📍', '💼', '🏷️', '🆕', '🏆', '🖼️', '🎬', '🌟', '💫', '🎯', '🎊', '🎈', '🎂', '🍰', '☕', '🌺', '🌸', '🌻', '🌷', '🌹', '🌿', '🍀', '🌈', '☀️', '🌙', '💎', '🎪', '🎨', '🎭', '🎸', '🎵', '🎶', '🎤', '🎧', '📷', '📹', '🎥', '💻', '⌚', '📺', '🔊', '🎮', '🕹️', '🎲', '🃏', '🎴', '🀄', '🏹', '🎣', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🏏', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '🤾', '🤽', '🤹', '🧘', '🏃', '🚶', '🧗', '🏇', '🏊', '🏄', '🚣', '🚴', '🚵'],

        'Negócios': ['💼', '📊', '📈', '💰', '💳', '🏢', '🏪', '🛍️', '📦', '🚚', '📞', '📧', '💻', '📱', '⌚', '🔔', '📋', '📝', '✍️', '📄', '📑', '📌', '📍', '🗂️', '📁', '💼', '🎯', '🏆', '⭐', '✅', '❌', '⚠️', 'ℹ️', '🔍', '🔎', '💡', '💭', '🎪', '🎨', '🎭'],

        'Comida': ['🍎', '🍊', '🍌', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥯', '🧀', '🥚', '🍳', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🥗', '🥘', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧃', '🧉', '🧊'],

        'Viagem': ['✈️', '🚁', '🚀', '🛸', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '🚀', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚢', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '🚀', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚢', '⛵', '🚤', '🛥️', '🛳️', '⛴️']

    };

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('Geral');

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



    // Função para resetar slider para o valor do meio

    const resetSliderToMiddle = (min: number, max: number, key: keyof PageConfig) => {

        const middleValue = Math.round((min + max) / 2);

        handleConfigChange(key, middleValue);

    };


    // Função para snap no valor 0 para sliders de rotação
    const handleRotationChange = (key: keyof PageConfig, value: number) => {
        // Se o valor estiver entre -5 e 5, snap para 0
        if (value >= -5 && value <= 5) {
            handleConfigChange(key, 0);
        } else {
            handleConfigChange(key, value);
        }
    };

    // Função para detectar duplo toque no mobile
    const handleDoubleTap = (key: keyof PageConfig) => {
        handleConfigChange(key, 0);
    };


    // Função para gerar e baixar a visualização do cartão

    const generateCardImage = async (side: 'front' | 'back', returnAsDataUrl: boolean = false): Promise<string | void> => {

        return new Promise((resolve) => {

            const canvas = document.createElement('canvas');

            const ctx = canvas.getContext('2d');

            

            if (!ctx) {

                resolve();

                return;

            }



            // Dimensões reais de cartão de crédito para impressão (85.6mm x 53.98mm)
            // Convertendo para pixels em 300 DPI para alta qualidade de impressão
            const cardWidth = 1011; // 85.6mm * 300 DPI / 25.4mm
            const cardHeight = 638;  // 53.98mm * 300 DPI / 25.4mm
            
            // Dimensões do preview para proporções
            const PREVIEW_WIDTH = 320;
            

            canvas.width = cardWidth;

            canvas.height = cardHeight;



            // Configurar fundo

            const bgColor = side === 'front' ? (config.cardBgColor || '#FFFFFF') : (config.cardBackBgColor || '#e2e8f0');

            ctx.fillStyle = bgColor;

            ctx.fillRect(0, 0, cardWidth, cardHeight);



            if (side === 'front') {

                // Desenhar logo na frente

                if (logoDataUrl) {

                    const img = new window.Image();

                    img.onload = () => {

                        // ✅ Logo proporcional mantendo o aspect ratio real da imagem
                        const logoSizePercent = config.logoSize || 60;
                        const baseHeight = (logoSizePercent / 100) * cardHeight; // altura-alvo
                        const logoRatio = (img.naturalWidth && img.naturalHeight)
                            ? (img.naturalWidth / img.naturalHeight)
                            : 1;
                        const logoHeight = Math.round(baseHeight);
                        const logoWidth = Math.round(baseHeight * logoRatio);
                        
                        // ✅ CORRIGIDO: Posicionamento com multiplicador 0.3 (igual ao CSS)
                        const positionPercent = config.logoPosition || 0;
                        const maxOffset = cardWidth * 0.15; // Limitar a 15% da largura
                        const x = (cardWidth / 2) + (positionPercent / 100) * maxOffset;
                        const y = cardHeight / 2;

                        

                        ctx.save();

                        ctx.globalAlpha = config.logoOpacityFront || 1;

                        ctx.translate(x, y);

                        ctx.rotate((config.logoRotationFront || 0) * Math.PI / 180);

                        ctx.drawImage(img, -logoWidth/2, -logoHeight/2, logoWidth, logoHeight);

                        ctx.restore();

                        

                        // Desenhar símbolo NFC na frente também

                        const nfcImg = new window.Image();

                        nfcImg.onload = () => {

                            // Manter proporção do arquivo NFC
                            const nfcHeight = Math.round(24 * (cardWidth / 320));
                            const nfcRatio = (nfcImg.naturalWidth && nfcImg.naturalHeight)
                                ? (nfcImg.naturalWidth / nfcImg.naturalHeight)
                                : 1;
                            const nfcWidth = Math.round(nfcHeight * nfcRatio);
                            ctx.globalAlpha = 0.8;

                            // Posição proporcional
                            const marginTop = Math.round(20 * (cardHeight / 192));
                            const marginRight = Math.round(20 * (cardWidth / 320));
                            ctx.drawImage(nfcImg, cardWidth - nfcWidth - marginRight, marginTop, nfcWidth, nfcHeight);
                            ctx.globalAlpha = 1;

                            

                            // Desenhar texto do cartão se habilitado

                            if (config.isTextEnabled && config.cardText) {

                                ctx.fillStyle = config.cardTextColor || '#1e293b';

                                // Manter proporção da fonte: 14px em 320px, então proporcional em 1011px
                                const fontSize = Math.round(14 * (cardWidth / 320));
                                ctx.font = `bold ${fontSize}px Arial`;
                                ctx.textAlign = 'center';

                                ctx.textBaseline = 'middle';

                                

                                const textX = cardWidth / 2;

                                const textY = cardHeight - 30;

                                

                                // Quebrar texto em linhas se necessário

                                const words = config.cardText.split(' ');

                                let line = '';

                                let y = textY;

                                

                                for (let n = 0; n < words.length; n++) {

                                    const testLine = line + words[n] + ' ';

                                    const metrics = ctx.measureText(testLine);

                                    const testWidth = metrics.width;

                                    

                                    if (testWidth > cardWidth - 40 && n > 0) {

                                        ctx.fillText(line, textX, y);

                                        line = words[n] + ' ';

                                        y += 20;

                                    } else {

                                        line = testLine;

                                    }

                                }

                                ctx.fillText(line, textX, y);

                            }

                            

                            // Retornar dataURL ou baixar imagem

                            if (returnAsDataUrl) {

                                resolve(canvas.toDataURL('image/png'));

                            } else {

                                downloadCardImage(canvas, 'cartao-frente');

                                resolve();

                            }

                        };

                        nfcImg.onerror = () => {

                            if (returnAsDataUrl) {

                                resolve(canvas.toDataURL('image/png'));

                            } else {

                                downloadCardImage(canvas, 'cartao-frente');

                                resolve();

                            }

                        };

                        nfcImg.src = '/nfc-symbol.png';

                    };

                    img.src = logoDataUrl;

                } else {

                    // Desenhar símbolo NFC mesmo sem logo

                    const nfcImg = new window.Image();

                    nfcImg.onload = () => {

                        const nfcHeight = Math.round(24 * (cardWidth / 320));
                        const nfcRatio = (nfcImg.naturalWidth && nfcImg.naturalHeight)
                            ? (nfcImg.naturalWidth / nfcImg.naturalHeight)
                            : 1;
                        const nfcWidth = Math.round(nfcHeight * nfcRatio);
                        ctx.globalAlpha = 0.8;

                        const marginTop = Math.round(20 * (cardHeight / 192));
                        const marginRight = Math.round(20 * (cardWidth / 320));
                        ctx.drawImage(nfcImg, cardWidth - nfcWidth - marginRight, marginTop, nfcWidth, nfcHeight);
                        ctx.globalAlpha = 1;

                        

                        // Desenhar texto do cartão se habilitado

                        if (config.isTextEnabled && config.cardText) {

                            ctx.fillStyle = config.cardTextColor || '#1e293b';

                            // Manter proporção da fonte: 14px em 320px, então proporcional em 1011px
                            const fontSize = Math.round(14 * (cardWidth / 320));
                            ctx.font = `bold ${fontSize}px Arial`;
                            ctx.textAlign = 'center';

                            ctx.textBaseline = 'middle';

                            

                            const textX = cardWidth / 2;

                            const textY = cardHeight - 30;

                            

                            // Quebrar texto em linhas se necessário

                            const words = config.cardText.split(' ');

                            let line = '';

                            let y = textY;

                            

                            for (let n = 0; n < words.length; n++) {

                                const testLine = line + words[n] + ' ';

                                const metrics = ctx.measureText(testLine);

                                const testWidth = metrics.width;

                                

                                if (testWidth > cardWidth - 40 && n > 0) {

                                    ctx.fillText(line, textX, y);

                                    line = words[n] + ' ';

                                    y += 20;

                                } else {

                                    line = testLine;

                                }

                            }

                            ctx.fillText(line, textX, y);

                        }

                        

                        if (returnAsDataUrl) {

                            resolve(canvas.toDataURL('image/png'));

                        } else {

                            downloadCardImage(canvas, 'cartao-frente');

                            resolve();

                        }

                    };

                    nfcImg.onerror = () => {

                        if (returnAsDataUrl) {

                            resolve(canvas.toDataURL('image/png'));

                        } else {

                            downloadCardImage(canvas, 'cartao-frente');

                            resolve();

                        }

                    };

                    nfcImg.src = '/nfc-symbol.png';

                }

            } else {

                // Desenhar logo no verso

                if (logoDataUrl) {

                    const img = new window.Image();

                    img.onload = () => {

                        // ✅ Logo do verso mantendo o aspect ratio real da imagem
                        const logoSizePercent = config.clientLogoBackSize || 50;
                        const baseWidth = (logoSizePercent / 100) * cardWidth; // largura-alvo
                        const imgRatioBack = (img.naturalWidth && img.naturalHeight)
                            ? (img.naturalWidth / img.naturalHeight)
                            : 1;
                        const logoWidth = Math.round(baseWidth);
                        const logoHeight = Math.round(baseWidth / imgRatioBack);
                        
                        // Usar a mesma lógica do preview: 50% + (position * 1.2)%
                        const positionPercent = config.logoPositionBack || 0;
                        const xPercent = 50 + (positionPercent * 1.2);
                        const x = (xPercent / 100) * cardWidth;
                        const y = cardHeight / 2;

                        

                        ctx.save();

                        ctx.globalAlpha = config.logoOpacityBack || 0.3;

                        ctx.translate(x, y);

                        ctx.rotate((config.logoRotationBack || 0) * Math.PI / 180);

                        ctx.drawImage(img, -logoWidth/2, -logoHeight/2, logoWidth, logoHeight);

                        ctx.restore();

                        

                        // Desenhar QR Code real

                        // ✅ QR Code baseado na LARGURA também
                        const qrSizePercent = config.qrCodeSize || 35;
                        const qrSizeBase = (qrSizePercent / 100) * cardWidth;
                        // Reduzir mais 8% (total ~15.4% menor: 0.92 * 0.92 = 0.8464)
                        const qrSize = Math.round(qrSizeBase * 0.846);
                        
                        // Posição considerando padding de 16px (p-4)
                        const horizontalPadding = 16 * (cardWidth / PREVIEW_WIDTH);
                        const qrX = config.qrCodePosition === 'justify-end' 
                            ? cardWidth - qrSize - horizontalPadding 
                            : horizontalPadding;
                        
                        // Usar exatamente a mesma lógica do preview
                        // No preview: absolute inset-0 p-4 flex items-center
                        // O items-center centraliza o elemento no container
                        const qrY = cardHeight / 2;

                        

                        // Gerar QR Code real usando API externa

                        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(`https://${subdomain}.zagnfc.com.br`)}`;

                        

                        const qrImg = new window.Image();

                        qrImg.crossOrigin = 'anonymous';

                        qrImg.onload = () => {

                            ctx.drawImage(qrImg, qrX, qrY - qrSize/2, qrSize, qrSize);

                            

                            // Desenhar símbolo NFC (opcional)

                            const nfcImg = new window.Image();

                            nfcImg.onload = () => {

                                // Base: 24px no preview (320x192) -> escalar para PDF
                                const nfcHeight = Math.round(24 * (cardWidth / 320));
                                // Manter proporção real do arquivo NFC (evita alongamento)
                                const nfcRatio = (nfcImg.naturalWidth && nfcImg.naturalHeight)
                                    ? (nfcImg.naturalWidth / nfcImg.naturalHeight)
                                    : 1;
                                const nfcWidth = Math.round(nfcHeight * nfcRatio);
                                ctx.globalAlpha = 0.8;

                                // Margens proporcionais como no preview
                                const marginTop = Math.round(20 * (cardHeight / 192));
                                const marginRight = Math.round(20 * (cardWidth / 320));
                                ctx.drawImage(nfcImg, cardWidth - nfcWidth - marginRight, marginTop, nfcWidth, nfcHeight);
                                ctx.globalAlpha = 1;

                                

                                // Desenhar logo Zag (opcional)

                                const zagImg = new window.Image();

                                zagImg.onload = () => {

                                    // Altura proporcional ao preview (12px em 192px = 6.25%)
                                    const zagHeight = Math.round(12 * (cardHeight / 192));
                                    // Usar proporção real da imagem (fallback 60:18)
                                    const zagRatio = (zagImg.naturalWidth && zagImg.naturalHeight)
                                        ? (zagImg.naturalWidth / zagImg.naturalHeight)
                                        : (60 / 18);
                                    const zagWidth = Math.round(zagHeight * zagRatio);
                                    // Usar as mesmas margens do NFC: right = marginRight, bottom = marginTop
                                    const bottomMargin = marginTop; // espelha o top do NFC
                                    const rightMargin = marginRight; // mesma distância da borda direita
                                    ctx.drawImage(zagImg, cardWidth - zagWidth - rightMargin, cardHeight - zagHeight - bottomMargin, zagWidth, zagHeight);
                                    

                                    // Retornar dataURL ou baixar imagem

                                    if (returnAsDataUrl) {

                                        resolve(canvas.toDataURL('image/png'));

                                    } else {

                                        downloadCardImage(canvas, 'cartao-verso');

                                        resolve();

                                    }

                                };

                                zagImg.onerror = () => {

                                    // Se logo Zag falhar, continuar sem ela

                                    if (returnAsDataUrl) {

                                        resolve(canvas.toDataURL('image/png'));

                                    } else {

                                        downloadCardImage(canvas, 'cartao-verso');

                                        resolve();

                                    }

                                };

                                zagImg.src = '/zag-botom.png';

                            };

                            nfcImg.onerror = () => {

                                // Se NFC falhar, tentar logo Zag diretamente

                                const zagImg = new window.Image();

                                zagImg.onload = () => {

                                    // Altura proporcional ao preview (12px em 192px = 6.25%)
                                    const zagHeight = Math.round(12 * (cardHeight / 192));
                                    // Usar proporção real da imagem (fallback 60:18)
                                    const zagRatio = (zagImg.naturalWidth && zagImg.naturalHeight)
                                        ? (zagImg.naturalWidth / zagImg.naturalHeight)
                                        : (60 / 18);
                                    const zagWidth = Math.round(zagHeight * zagRatio);
                                    // Usar as mesmas margens do NFC
                                    const marginTop = Math.round(20 * (cardHeight / 192));
                                    const marginRight = Math.round(20 * (cardWidth / 320));
                                    const bottomMargin = marginTop;
                                    const rightMargin = marginRight;
                                    ctx.drawImage(zagImg, cardWidth - zagWidth - rightMargin, cardHeight - zagHeight - bottomMargin, zagWidth, zagHeight);
                                    

                                    if (returnAsDataUrl) {

                                        resolve(canvas.toDataURL('image/png'));

                                    } else {

                                        downloadCardImage(canvas, 'cartao-verso');

                                        resolve();

                                    }

                                };

                                zagImg.onerror = () => {

                                    // Se ambas falharem, continuar sem elas

                                    if (returnAsDataUrl) {

                                        resolve(canvas.toDataURL('image/png'));

                                    } else {

                                        downloadCardImage(canvas, 'cartao-verso');

                                        resolve();

                                    }

                                };

                                zagImg.src = '/zag-botom.png';

                            };

                            nfcImg.src = '/nfc-symbol.png';

                        };

                        qrImg.onerror = () => {

                            // Fallback para QR Code placeholder se a API falhar

                            ctx.fillStyle = '#FFFFFF';

                            ctx.fillRect(qrX, qrY - qrSize/2, qrSize, qrSize);

                            ctx.fillStyle = '#000000';

                            ctx.fillRect(qrX + 5, qrY - qrSize/2 + 5, qrSize - 10, qrSize - 10);

                            

                            // Tentar adicionar símbolos NFC e Zag mesmo com QR Code falhando

                            const nfcImg = new window.Image();

                            nfcImg.onload = () => {

                                const nfcSize = 24 * (cardWidth / 1011);

                                ctx.globalAlpha = 0.8;

                                ctx.drawImage(nfcImg, cardWidth - nfcSize - 20, 20, nfcSize, nfcSize);

                                ctx.globalAlpha = 1;

                                

                                const zagImg = new window.Image();

                                zagImg.onload = () => {

                                    // Escalar proporcionalmente da prévia (320x192) para o PDF (1011x638)
                                    // Altura da logo no preview = 12px -> 6.25% da altura (12/192)
                                    const zagHeight = Math.round(12 * (cardHeight / 192));
                                    // Usar proporção real da imagem (fallback 60:18) para evitar achatamento
                                    const zagRatio = (zagImg.naturalWidth && zagImg.naturalHeight)
                                        ? (zagImg.naturalWidth / zagImg.naturalHeight)
                                        : (60 / 18);
                                    const zagWidth = Math.round(zagHeight * zagRatio);
                                    // Margens proporcionais: 4px no preview -> escalar para PDF
                                    const marginBottom = Math.round(4 * (cardHeight / 192));
                                    const marginRight = Math.round(4 * (cardWidth / 320));
                                    // Leve ajuste: mover para esquerda e para cima (≈ +2px do preview)
                                    const offsetBottom = Math.round(2 * (cardHeight / 192));
                                    const offsetRight = Math.round(2 * (cardWidth / 320));
                                    // Posicionar no canto inferior direito com margens proporcionais
                                    ctx.drawImage(zagImg, cardWidth - zagWidth - (marginRight + offsetRight), cardHeight - zagHeight - (marginBottom + offsetBottom), zagWidth, zagHeight);
                                    

                                    if (returnAsDataUrl) {

                                        resolve(canvas.toDataURL('image/png'));

                                    } else {

                                        downloadCardImage(canvas, 'cartao-verso');

                                        resolve();

                                    }

                                };

                                zagImg.onerror = () => {

                                    if (returnAsDataUrl) {

                                        resolve(canvas.toDataURL('image/png'));

                                    } else {

                                        downloadCardImage(canvas, 'cartao-verso');

                                        resolve();

                                    }

                                };

                                zagImg.src = '/zag-botom.png';

                            };

                            nfcImg.onerror = () => {

                                if (returnAsDataUrl) {

                                    resolve(canvas.toDataURL('image/png'));

                                } else {

                                    downloadCardImage(canvas, 'cartao-verso');

                                    resolve();

                                }

                            };

                            nfcImg.src = '/nfc-symbol.png';

                        };

                        qrImg.src = qrCodeUrl;

                    };

                    img.src = logoDataUrl;

                } else {

                    // Apenas QR Code real

                    // ✅ QR Code baseado na LARGURA também
                    const qrSizePercent = config.qrCodeSize || 35;
                    const qrSize = (qrSizePercent / 100) * cardWidth;
                    
                    // Posição considerando padding de 16px (p-4)
                    const horizontalPadding = 16 * (cardWidth / PREVIEW_WIDTH);
                    const qrX = config.qrCodePosition === 'justify-end' 
                        ? cardWidth - qrSize - horizontalPadding 
                        : horizontalPadding;
                    
                    // Usar exatamente a mesma lógica do preview
                    const qrY = cardHeight / 2;

                    

                    // Gerar QR Code real usando API externa

                    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(`https://${subdomain}.zagnfc.com.br`)}`;

                    

                    const qrImg = new window.Image();

                    qrImg.crossOrigin = 'anonymous';

                    qrImg.onload = () => {

                        ctx.drawImage(qrImg, qrX, qrY - qrSize/2, qrSize, qrSize);

                        

                        // Desenhar símbolo NFC (opcional)

                        const nfcImg = new window.Image();

                        nfcImg.onload = () => {

                            const nfcSize = 24 * (cardWidth / 1011); // Escalar proporcionalmente

                            ctx.globalAlpha = 0.8;

                            ctx.drawImage(nfcImg, cardWidth - nfcSize - 20, 20, nfcSize, nfcSize);

                            ctx.globalAlpha = 1;

                            

                            // Desenhar logo Zag (opcional)

                            const zagImg = new window.Image();

                            zagImg.onload = () => {

                                    // Escalar proporcionalmente da prévia (320x192) para o PDF (1011x638)
                                    // Altura da logo no preview = 12px -> 6.25% da altura (12/192)
                                    const zagHeight = Math.round(12 * (cardHeight / 192));
                                    // Manter a proporção original da imagem 60:18 (3.33:1)
                                    const zagWidth = (zagHeight * 60) / 18;
                                    // Usar as mesmas margens do NFC
                                    const bottomMargin = Math.round(20 * (cardHeight / 192)); // mesmo que marginTop do NFC
                                    const rightMargin = Math.round(20 * (cardWidth / 320));
                                    ctx.drawImage(zagImg, cardWidth - zagWidth - rightMargin, cardHeight - zagHeight - bottomMargin, zagWidth, zagHeight);
                                

                                if (returnAsDataUrl) {

                                    resolve(canvas.toDataURL('image/png'));

                                } else {

                                    downloadCardImage(canvas, 'cartao-verso');

                                    resolve();

                                }

                            };

                            zagImg.onerror = () => {

                                // Se logo Zag falhar, continuar sem ela

                                if (returnAsDataUrl) {

                                    resolve(canvas.toDataURL('image/png'));

                                } else {

                                    downloadCardImage(canvas, 'cartao-verso');

                                    resolve();

                                }

                            };

                            zagImg.src = '/logo-zag.png';

                        };

                        nfcImg.onerror = () => {

                            // Se NFC falhar, tentar logo Zag diretamente

                            const zagImg = new window.Image();

                            zagImg.onload = () => {

                                const zagWidth = 60 * (cardWidth / 1011);

                                const zagHeight = 18 * (cardHeight / 638);

                                // Posição bottom-right com escala correta
ctx.drawImage(zagImg, cardWidth - zagWidth - 20, cardHeight - zagHeight - 20, zagWidth, zagHeight);
                                

                                if (returnAsDataUrl) {

                                    resolve(canvas.toDataURL('image/png'));

                                } else {

                                    downloadCardImage(canvas, 'cartao-verso');

                                    resolve();

                                }

                            };

                            zagImg.onerror = () => {

                                // Se ambas falharem, continuar sem elas

                                if (returnAsDataUrl) {

                                    resolve(canvas.toDataURL('image/png'));

                                } else {

                                    downloadCardImage(canvas, 'cartao-verso');

                                    resolve();

                                }

                            };

                            zagImg.src = '/logo-zag.png';

                        };

                        nfcImg.src = '/nfc-symbol.png';

                    };

                    qrImg.onerror = () => {

                        // Fallback para QR Code placeholder se a API falhar

                        ctx.fillStyle = '#FFFFFF';

                        ctx.fillRect(qrX, qrY - qrSize/2, qrSize, qrSize);

                        ctx.fillStyle = '#000000';

                        ctx.fillRect(qrX + 5, qrY - qrSize/2 + 5, qrSize - 10, qrSize - 10);

                        

                        // Tentar adicionar símbolos NFC e Zag mesmo com QR Code falhando

                        const nfcImg = new window.Image();

                        nfcImg.onload = () => {

                            const nfcSize = 24 * (cardWidth / 1011);

                            ctx.globalAlpha = 0.8;

                            ctx.drawImage(nfcImg, cardWidth - nfcSize - 20, 20, nfcSize, nfcSize);

                            ctx.globalAlpha = 1;

                            

                            const zagImg = new window.Image();

                            zagImg.onload = () => {

                                const zagWidth = 60 * (cardWidth / 1011);

                                const zagHeight = 18 * (cardHeight / 638);

                                // Posição bottom-right com escala correta
ctx.drawImage(zagImg, cardWidth - zagWidth - 20, cardHeight - zagHeight - 20, zagWidth, zagHeight);
                                

                                if (returnAsDataUrl) {

                                    resolve(canvas.toDataURL('image/png'));

                                } else {

                                    downloadCardImage(canvas, 'cartao-verso');

                                    resolve();

                                }

                            };

                            zagImg.onerror = () => {

                                if (returnAsDataUrl) {

                                    resolve(canvas.toDataURL('image/png'));

                                } else {

                                    downloadCardImage(canvas, 'cartao-verso');

                                    resolve();

                                }

                            };

                            zagImg.src = '/logo-zag.png';

                        };

                        nfcImg.onerror = () => {

                            if (returnAsDataUrl) {

                                resolve(canvas.toDataURL('image/png'));

                            } else {

                                downloadCardImage(canvas, 'cartao-verso');

                                resolve();

                            }

                        };

                        nfcImg.src = '/nfc-symbol.png';

                    };

                    qrImg.src = qrCodeUrl;

                }

            }

        });

    };



    const downloadCardImage = (canvas: HTMLCanvasElement, filename: string) => {

        const link = document.createElement('a');

        link.download = `${filename}.png`;

        link.href = canvas.toDataURL('image/png');

        link.click();

    };



    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

            logoSize: 80,

            logoPosition: 0, // 0 = centro

            logoOpacityFront: 1,

            logoRotationFront: 0,

            

            // Configurações do cartão - VERSO

            cardBackBgColor: '#e2e8f0',

            qrCodeSize: 35,

            clientLogoBackSize: 50,

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

                

                // Detectar se é PNG e manter transparência

                const isPng = dataUrl.includes('data:image/png') || dataUrl.includes('image/png');

                const optimizedDataUrl = isPng 

                    ? canvas.toDataURL('image/png') 

                    : canvas.toDataURL('image/jpeg', 0.8);

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


        // Mostrar página de confirmação
        setShowCardConfirmation(true);
    };

    const handleConfirmLayout = async () => {
        setShowCardConfirmation(false);
        setIsProcessing(true);


        try {

            // 1. Gerar as imagens da frente e verso do cartão como data URLs

            const frontImageDataUrl = await generateCardImage('front', true) as string;

            const backImageDataUrl = await generateCardImage('back', true) as string;



            let pdfDataUri: string | undefined;



            if (frontImageDataUrl && backImageDataUrl) {

                // 2. Gerar o PDF com as dimensões reais de cartão de crédito
                // Dimensões padrão de cartão de crédito: 85.6mm x 53.98mm
                const containerWidth = 85.6; // mm
                const containerHeight = 53.98; // mm
                
                const doc = new jsPDF({

                    orientation: 'landscape',
                    unit: 'mm',

                    format: [containerWidth, containerHeight]
                });



                // Adicionar imagem da frente com proporções corretas do container
                doc.addImage(frontImageDataUrl, 'PNG', 0, 0, containerWidth, containerHeight, undefined, 'FAST');


                // Adicionar imagem do verso em uma nova página

                doc.addPage([containerWidth, containerHeight], 'landscape');
                doc.addImage(backImageDataUrl, 'PNG', 0, 0, containerWidth, containerHeight, undefined, 'FAST');


                pdfDataUri = doc.output('datauristring'); // Obter o PDF como data URI

                

                console.log('📄 PDF gerado com sucesso:', {

                    frontImageSize: frontImageDataUrl.length,

                    backImageSize: backImageDataUrl.length,

                    pdfSize: pdfDataUri.length

                });

            }

            

            // 3. Notificar admin via API com o PDF

            try {

                const response = await fetch('/api/notify-admin', {

                    method: 'POST',

                    headers: {

                        'Content-Type': 'application/json',

                    },

                    body: JSON.stringify({

                        subdomain,

                        action: 'layout_saved',

                        message: `Novo layout salvo para ${subdomain}.zagnfc.com.br`,

                        pdfData: pdfDataUri // Envia o PDF como data URI

                    })

                });

                

                if (!response.ok) {

                    console.warn('Falha ao notificar admin, mas continuando...');

                }

            } catch (error) {

                console.warn('Erro ao notificar admin:', error);

            }



            // Aguardar um pouco para mostrar a tela de carregamento
            await new Promise(resolve => setTimeout(resolve, 2000));
            

            setConfig((prev) => ({ ...prev, landingPageTitleText: prev.cardText || 'Seu Título Aqui' }));

            setActiveStep(2);

        } catch (error) {
console.error('Erro ao processar layout:', error);

            alert('Erro ao salvar o layout. Tente novamente.');

        




} finally {
            setIsProcessing(false);
        }

    };


    const handleCancelConfirmation = () => {
        setShowCardConfirmation(false);
    };


    const openLinkEditor = (link: CustomLink | null = null) => {

        setEditingLink(link);

        setShowLinkEditor(true);

    };

    // Função para adicionar botão PIX personalizado
    const openPixEditor = () => {
        // Verificar se já existe um botão PIX
        const existingPix = config.customLinks?.find(link => link.icon === 'pix');
        if (existingPix) {
            alert('Já existe um botão PIX adicionado. Você pode editar ou remover o existente.');
            return;
        }

        // Verificar limite de botões personalizados
        if ((config.customLinks?.filter(b => !b.isSocial).length || 0) >= 4) {
            alert('Você pode adicionar no máximo 4 botões personalizados.');
            return;
        }

        // Pré-configurar o editor com valores PIX (sem id para ser tratado como novo)
        const pixTemplate = {
            id: 0, // id temporário para identificar no editor
            text: 'PIX',
            url: 'pix:',
            icon: 'pix',
            isSocial: false,
            styleType: 'solid' as const,
            bgColor1: '#32BCAD',
            bgColor2: '#32BCAD',
            textColor: '#ffffff'
        };
        
        setEditingLink(pixTemplate as CustomLink);
        setShowLinkEditor(true);
    };



    const saveCustomLink = (linkData: Omit<CustomLink, 'id'>) => {

        // Se editingLink existe E tem id diferente de 0, é uma edição
        if (editingLink && editingLink.id !== 0) {

            setConfig((prev) => ({

                ...prev,

                customLinks: prev.customLinks?.map((l) => (l.id === editingLink.id ? { ...l, ...linkData } : l)),

            }));

        } else {
            // É um novo botão (editingLink null ou id === 0)

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

            logoSize: 80,

            logoPosition: 0, // 0 = centro

            logoOpacityFront: 1,

            logoRotationFront: 0,

            

            // Configurações do cartão - VERSO

            cardBackBgColor: '#e2e8f0',

            qrCodeSize: 35,

            clientLogoBackSize: 50,

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



    // Carregar dados do usuário logado

    useEffect(() => {

        const loadUserData = async () => {

            try {

                const supabase = createClientComponentClient();

                const { data: { session } } = await supabase.auth.getSession();

                

                if (session?.user) {

                    const user = session.user;

                    // Priorizar nome completo do metadata, senão usar email

                    const name = user.user_metadata?.full_name || user.user_metadata?.name || '';

                    setUserName(name);

                    setUserEmail(user.email || '');

                    
                    // Verificar se pode criar páginas (incluindo verificação de admin)
                    const canCreate = canCreatePagesWithAdmin(user.email);
                    setHasActiveSubscription(canCreate);

                }

            } catch (error) {
console.error('Erro ao carregar dados do usuário:', error);

            




}

        };

        

        loadUserData();

    }, []);



    const addSocialPreset = (kind: 'whatsapp' | 'instagram' | 'youtube' | 'linkedin' | 'save-contact' | 'share') => {

        const presets: { [k in typeof kind]: { text: string; url: string; icon: IconName; color: string } } = {

            whatsapp: { text: 'WhatsApp', url: 'https://wa.me/+55', icon: 'message-circle', color: '#16a34a' },

            instagram: { text: 'Instagram', url: 'https://instagram.com/', icon: 'instagram', color: '#DB2777' },

            youtube: { text: 'YouTube', url: 'https://youtube.com/', icon: 'youtube', color: '#DC2626' },

            linkedin: { text: 'LinkedIn', url: 'https://linkedin.com/in/', icon: 'linkedin', color: '#0077B5' },

            'save-contact': { text: 'Salvar Contato', url: 'tel:', icon: 'user-plus', color: '#059669' },

            'share': { text: 'Compartilhar', url: 'share:', icon: 'share', color: '#8B5CF6' },

        } as const;

        

        // Verificar se já existe um botão deste tipo

        const existingButton = config.customLinks?.find(link => link.isSocial && link.icon === presets[kind].icon);

        if (existingButton) {

            alert(`Já existe um botão ${presets[kind].text} adicionado. Você pode editar ou remover o existente.`);

            return;

        }

        

        const p = presets[kind];

        const globalColor = config.socialButtonColor || '#3B82F6';

        const newBtn = { text: p.text, url: p.url, icon: p.icon, styleType: 'solid' as const, bgColor1: globalColor, bgColor2: globalColor, textColor: '#ffffff', isSocial: true };

        // Botões sociais são ilimitados

        setConfig(prev => ({ ...prev, customLinks: [...(prev.customLinks || []), { ...newBtn, id: Date.now() }] }));

    };



    const isSocialButtonActive = (kind: 'whatsapp' | 'instagram' | 'youtube' | 'linkedin' | 'save-contact' | 'share') => {

        const iconMap = {

            whatsapp: 'message-circle',

            instagram: 'instagram',

            youtube: 'youtube',

            linkedin: 'linkedin',

            'save-contact': 'user-plus',

            'share': 'share',

        };

        return config.customLinks?.some(link => link.isSocial && link.icon === iconMap[kind]) || false;

    };



    const moveButtonUp = (index: number) => {

        if (index === 0) return;

        const newLinks = [...(config.customLinks || [])];

        [newLinks[index - 1], newLinks[index]] = [newLinks[index], newLinks[index - 1]];

        setConfig(prev => ({ ...prev, customLinks: newLinks }));

    };



    const moveButtonDown = (index: number) => {

        const links = config.customLinks || [];

        if (index === links.length - 1) return;

        const newLinks = [...links];

        [newLinks[index], newLinks[index + 1]] = [newLinks[index + 1], newLinks[index]];

        setConfig(prev => ({ ...prev, customLinks: newLinks }));

    };



    const generateThumbnail = () => {

        // Criar um canvas para gerar o thumbnail

        const canvas = document.createElement('canvas');

        const ctx = canvas.getContext('2d');

        if (!ctx) return null;



        // Definir dimensões do thumbnail (mobile preview)

        canvas.width = 200;

        canvas.height = 400;



        // Desenhar fundo

        ctx.fillStyle = config.landingPageBgColor || '#F8FAFC';

        ctx.fillRect(0, 0, canvas.width, canvas.height);



        // Desenhar logo se existir

        if (logoDataUrl) {

            const img = new window.Image();

            img.onload = () => {

                const logoSize = Math.min(80, canvas.width * 0.4);

                const x = (canvas.width - logoSize) / 2;

                const y = 40;

                

                if (config.landingPageLogoShape === 'circle') {

                    ctx.save();

                    ctx.beginPath();

                    ctx.arc(x + logoSize/2, y + logoSize/2, logoSize/2, 0, Math.PI * 2);

                    ctx.clip();

                    ctx.drawImage(img, x, y, logoSize, logoSize);

                    ctx.restore();

                } else {

                    ctx.drawImage(img, x, y, logoSize, logoSize);

                }

            };

            img.src = logoDataUrl;

        }



        // Desenhar título

        ctx.fillStyle = config.landingPageTitleColor || '#1e293b';

        ctx.font = 'bold 18px Inter, sans-serif';

        ctx.textAlign = 'center';

        const titleText = config.landingPageTitleText || 'Bem-vindo(a)!';

        ctx.fillText(titleText, canvas.width / 2, 150);



        // Desenhar subtítulo se existir

        if (config.landingPageSubtitleText) {

            ctx.fillStyle = config.landingPageSubtitleColor || '#64748b';

            ctx.font = '14px Inter, sans-serif';

            ctx.fillText(config.landingPageSubtitleText, canvas.width / 2, 175);

        }



        // Desenhar botões (layout mobile)

        const allButtons = config.customLinks || [];

        const buttonY = 220;

        const buttonWidth = canvas.width - 40;

        const buttonHeight = 35;

        const buttonSpacing = 15;

        const maxButtons = Math.min(4, allButtons.length);

        

        for (let i = 0; i < maxButtons; i++) {

            const button = allButtons[i];

            const y = buttonY + i * (buttonHeight + buttonSpacing);

            

            // Cor do botão

            const buttonColor = button.isSocial 

                ? (config.socialButtonColors?.[button.icon || ''] || config.socialButtonColor || '#3B82F6')

                : (button.bgColor1 || '#3B82F6');

            

            ctx.fillStyle = buttonColor;

            ctx.fillRect(20, y, buttonWidth, buttonHeight);

            

            // Texto do botão

            ctx.fillStyle = 'white';

            ctx.font = 'bold 14px Inter, sans-serif';

            ctx.textAlign = 'center';

            ctx.fillText(button.text || `Botão ${i + 1}`, canvas.width / 2, y + 22);

        }



        return canvas.toDataURL('image/png');

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


            

            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 card-container">

                {/* Mensagem de Boas-vindas */}

                {(userName || userEmail) && (

                    <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-3 sm:p-4">

                        <p className="text-sm sm:text-base text-slate-700">

                            <span className="font-semibold">Seja bem-vindo(a), </span>

                            <span className="text-blue-600 font-medium">

                                {userName || userEmail.split('@')[0]}

                            </span>

                            ! 👋

                        </p>

                    </div>

                )}



                <header className="text-center mb-4 sm:mb-6">
                    <div>
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">Configure seu Zag Card</h1>
                        <p className="text-xs sm:text-sm text-slate-600">Personalize seu produto em poucos passos</p>
                    </div>

                </header>



                <div className="flex items-center justify-center space-x-2 sm:space-x-4 md:space-x-8 mb-2 sm:mb-4">
                    <div className={`flex items-center space-x-1 sm:space-x-2 border-b-4 pb-2 transition-all duration-300 ${activeStep === 1 ? 'border-blue-500 text-blue-600' : 'border-green-500 text-green-600'}`}>

                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-bold">

                            <CreditCard size={12} className="sm:w-4 sm:h-4" />

                        </div>

                        <span className="font-semibold text-xs sm:text-sm hidden sm:block">Design do Cartão</span>

                    </div>

                    <div className="flex-1 border-t-2 border-dashed border-slate-300"></div>

                    <div className={`flex items-center space-x-1 sm:space-x-2 border-b-4 pb-2 transition-all duration-300 ${activeStep === 2 ? 'border-blue-500 text-blue-600' : 'border-slate-300 text-slate-500'}`}>

                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-bold">

                            <Smartphone size={12} className="sm:w-4 sm:h-4" />

                        </div>

                        <span className="font-semibold text-xs sm:text-sm hidden sm:block">Landing Page</span>

                    </div>

                </div>

                

                <main>

                    {activeStep === 1 && (

                        <div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 card-container">

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">

                                    <div className="flex justify-between items-center mb-4">

                                        <p className="text-center font-semibold">Frente</p>

                                        {logoDataUrl && (

                                            <button

                                                onClick={() => {

                                                    setLogoDataUrl(null);

                                                    handleConfigChange('logoSize', 80);

                                                    handleConfigChange('logoPosition', 0);

                                                    handleConfigChange('logoRotationFront', 0);

                                                    handleConfigChange('logoOpacityFront', 1);

                                                }}

                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"

                                                title="Limpar logo do cartão"

                                            >

                                                <Trash2 size={16} />

                                            </button>

                                        )}

                                    </div>

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

                                                className="absolute w-20 h-20 bg-slate-200 hover:bg-slate-300 rounded-lg flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer border-2 border-dashed border-slate-300 hover:border-slate-400"

                                                style={{

                                                    top: '50%', 

                                                    left: `${50 + (config.logoPosition || 0) * 0.3}%`, 

                                                    transform: 'translate(-50%, -50%)'

                                                }}

                                                title="Clique para carregar sua logomarca"

                                            >

                                                <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />

                                                <span className="text-xs text-slate-500 text-center leading-tight">Logo</span>

                                            </button>

                                        )}

                                        

                                        {/* Texto com posicionamento fixo na parte inferior */}

                                        {config.isTextEnabled && config.cardText && (

                                            <div className="absolute bottom-4 left-4 right-4">

                                                <p style={{ color: config.cardTextColor }} className="text-center font-semibold text-sm break-words">

                                                    {config.cardText}

                                                </p>

                                            </div>

                                        )}

                                        {/* Símbolo NFC fixo no canto superior direito */}

                                        <Image 

                                            src="/nfc-symbol.png" 

                                            alt="NFC" 

                                            width={24} 

                                            height={24} 

                                            className="absolute top-5 right-5 w-6 h-6 object-contain opacity-80" 
                                        />

                                    </div>

                                    <div className="mt-6 space-y-4 max-w-sm mx-auto">

                                        <h3 className="font-bold text-lg border-b pb-2">Personalizar Frente</h3>

                                        

                                        {/* Cores - Primeiro */}

                                        {/* 1. Tamanho da Logo */}

                                        <div className="slider-container" onTouchStart={(e) => {

                                            if (e.currentTarget) {
                                            e.currentTarget.classList.add('disabled');

                                            setTimeout(() => {

                                                    if (e.currentTarget) {
                                                e.currentTarget.classList.remove('disabled');

                                                    }
                                            }, 300);

                                            }
                                        }}>

                                            <label className="block text-sm font-medium text-slate-700 mb-1 slider-label">Tamanho da Logo ({config.logoSize}%)</label>

                                            <input 

                                                type="range" 

                                                min={20} 

                                                max={150} 

                                                value={config.logoSize} 

                                                onChange={(e) => handleConfigChange('logoSize', Number(e.target.value))} 

                                                onDoubleClick={() => resetSliderToMiddle(20, 150, 'logoSize')}

                                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" 

                                            />

                                            <p className="text-xs text-slate-500 mt-1">💡 Ajuste conforme o tamanho da sua imagem</p>

                                        </div>



                                        {/* 2. Cores do Cartão e Remover Fundo */}

                                        <div className="grid grid-cols-3 gap-1 sm:gap-3">
                                            <div>

                                                <label className="block text-xs font-medium text-slate-700 mb-1">Cor de Fundo</label>
                                                <input type="color" value={config.cardBgColor} onChange={(e) => handleConfigChange('cardBgColor', e.target.value)} className="w-full h-6 border border-slate-300 rounded-md" />
                                            </div>

                                            <div>

                                                <label className="block text-xs font-medium text-slate-700 mb-1">Cor do Texto</label>
                                                <input type="color" value={config.cardTextColor} onChange={(e) => handleConfigChange('cardTextColor', e.target.value)} className="w-full h-6 border border-slate-300 rounded-md" />
                                            </div>

                                            <div>

                                                <label className="block text-xs font-medium text-slate-700 mb-1">Remover Fundo</label>
                                                <BackgroundRemovalButton 
                                                    onImageProcessed={(url) => {
                                                        setLogoDataUrl(url);
                                                    }}
                                                />

                                        </div>

                                        </div>



                                        {/* 4. Rotação e Opacidade lado a lado */}

                                        <div className="grid grid-cols-2 gap-4">

                                            <div className="slider-container" onTouchStart={(e) => {

                                                if (e.currentTarget) {
                                                e.currentTarget.classList.add('disabled');

                                                setTimeout(() => {

                                                        if (e.currentTarget) {
                                                    e.currentTarget.classList.remove('disabled');

                                                        }
                                                }, 300);

                                                }
                                            }} onTouchEnd={(e) => {
                                                // Detectar duplo toque no mobile
                                                const now = Date.now();
                                                const target = e.currentTarget as (HTMLElement & { lastTap?: number });
                                                const lastTap = target.lastTap || 0;
                                                if (now - lastTap < 300) {
                                                    handleDoubleTap('logoRotationFront');
                                                }
                                                target.lastTap = now;
                                            }}>

                                                <label className="block text-sm font-medium text-slate-700 mb-1 slider-label">Rotação ({config.logoRotationFront || 0}°)</label>

                                                <input 
                                                    type="range" 
                                                    min={-180} 
                                                    max={180} 
                                                    value={config.logoRotationFront || 0} 
                                                    onChange={(e) => handleRotationChange('logoRotationFront', Number(e.target.value))} 
                                                    onDoubleClick={() => handleConfigChange('logoRotationFront', 0)}
                                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" 
                                                />
                                        </div>

                                            <div className="slider-container" onTouchStart={(e) => {

                                                if (e.currentTarget) {
                                                e.currentTarget.classList.add('disabled');

                                                setTimeout(() => {

                                                        if (e.currentTarget) {
                                                    e.currentTarget.classList.remove('disabled');

                                                        }
                                                }, 300);

                                                }
                                            }}>

                                                <label className="block text-sm font-medium text-slate-700 mb-1 slider-label">Opacidade ({Math.round((config.logoOpacityFront ?? 1) * 100)}%)</label>

                                                <input type="range" min={10} max={100} value={Math.round((config.logoOpacityFront ?? 1) * 100)} onChange={(e) => handleConfigChange('logoOpacityFront', Number(e.target.value) / 100)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" />

                                            </div>

                                        </div>



                                        {/* Posicionamento da Logo */}

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



                                        {/* Texto do Cartão */}

                                        <div>

                                            <label className="block text-sm font-medium text-slate-700 mb-2">Texto do Cartão</label>

                                            <div className="flex items-center gap-2">

                                            <input 

                                                type="text" 

                                                placeholder="Seu Nome ou Empresa" 

                                                value={config.cardText || ''} 

                                                onChange={(e) => handleConfigChange('cardText', e.target.value)} 

                                                onFocus={() => handleConfigChange('isTextEnabled', true)}

                                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500" 

                                                />

                                                {config.cardText && (

                                                    <button

                                                        onClick={() => {

                                                            handleConfigChange('cardText', '');

                                                            handleConfigChange('isTextEnabled', false);

                                                        }}

                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"

                                                        title="Limpar texto"

                                                    >

                                                        <Trash2 size={16} />

                                                    </button>

                                                )}

                                            </div>

                                            <p className="text-xs text-slate-500 mt-1">💡 Esta é uma configuração opcional.</p>

                                        </div>

                                    </div>

                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">

                                    <p className="text-center font-semibold mb-4">Verso</p>

                                    <div style={{ backgroundColor: config.cardBackBgColor }} className="w-80 h-48 mx-auto rounded-xl shadow-lg p-4 border relative overflow-hidden card-preview">

                                        {logoDataUrl && (

                                            <Image src={logoDataUrl} alt="Logo Verso" width={150} height={150} className="object-contain absolute transition-all duration-300 image-transparent" style={{ width: `${config.clientLogoBackSize}%`, top: '50%', left: `${50 + (config.logoPositionBack ?? 0) * 1.2}%`, transform: `translate(-50%, -50%) rotate(${config.logoRotationBack || 0}deg)`, opacity: config.logoOpacityBack ?? 0.3, background: 'transparent' }} />

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

                                            className="absolute bottom-2 right-2 h-4 w-auto object-contain opacity-100" 

                                            style={{ 

                                                width: 'auto', 

                                                height: 'auto',

                                                minWidth: '40px',

                                                maxWidth: '60px'

                                            }} 

                                        />

                                        {/* Símbolo NFC fixo no canto superior direito */}

                                        <Image 

                                            src="/nfc-symbol.png" 

                                            alt="NFC" 

                                            width={24} 

                                            height={24} 

                                            className="absolute top-5 right-5 w-6 h-6 object-contain opacity-80" 
                                        />

                                    </div>

                                    <div className="mt-6 space-y-4 max-w-sm mx-auto">

                                        <h3 className="font-bold text-lg border-b pb-2">Personalizar Verso</h3>

                                        

                                        {/* 1. Tamanho da Logo no Verso */}

                                        <div className="slider-container" onTouchStart={(e) => {

                                            if (e.currentTarget) {
                                            e.currentTarget.classList.add('disabled');

                                            setTimeout(() => {

                                                    if (e.currentTarget) {
                                                e.currentTarget.classList.remove('disabled');

                                                    }
                                            }, 300);

                                            }
                                        }}>

                                            <label className="block text-sm font-medium text-slate-700 mb-1 slider-label">Tamanho da Logo ({config.clientLogoBackSize}%)</label>

                                            <input type="range" min={10} max={120} value={config.clientLogoBackSize} onChange={(e) => handleConfigChange('clientLogoBackSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" />

                                            <p className="text-xs text-slate-500 mt-1">💡 Ajuste conforme o tamanho da sua imagem</p>

                                        </div>



                                        {/* 2. Cor de Fundo e Posicionamento de QR Code */}

                                        <div className="grid grid-cols-2 gap-4">

                                        <div>

                                                <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo</label>

                                                <input type="color" value={config.cardBackBgColor} onChange={(e) => handleConfigChange('cardBackBgColor', e.target.value)} className="w-full h-8 border border-slate-300 rounded-md" />

                                            </div>

                                            <div>

                                                <label className="block text-sm font-medium text-slate-700 mb-1">Tamanho QR Code</label>

                                                <div className="grid grid-cols-3 gap-1">

                                                    <button 

                                                        onClick={() => handleConfigChange('qrCodeSize', 25)} 

                                                        className={`border rounded p-1 text-xs ${config.qrCodeSize === 25 ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-300 hover:bg-slate-50'}`}

                                                    >

                                                        <span className="sm:hidden">P</span>
                                                        <span className="hidden sm:inline">Pequeno</span>
                                                    </button>

                                                    <button 

                                                        onClick={() => handleConfigChange('qrCodeSize', 35)} 

                                                        className={`border rounded p-1 text-xs ${config.qrCodeSize === 35 ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-300 hover:bg-slate-50'}`}

                                                    >

                                                        <span className="sm:hidden">M</span>
                                                        <span className="hidden sm:inline">Médio</span>
                                                    </button>

                                                    <button 

                                                        onClick={() => handleConfigChange('qrCodeSize', 45)} 

                                                        className={`border rounded p-1 text-xs ${config.qrCodeSize === 45 ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-300 hover:bg-slate-50'}`}

                                                    >

                                                        <span className="sm:hidden">G</span>
                                                        <span className="hidden sm:inline">Grande</span>
                                                    </button>

                                                </div>

                                            </div>

                                        </div>



                                        {/* 3. Opacidade e Rotação da Logo */}

                                        <div className="grid grid-cols-2 gap-4">

                                            <div className="slider-container" onTouchStart={(e) => {

                                                if (e.currentTarget) {
                                                e.currentTarget.classList.add('disabled');

                                                setTimeout(() => {

                                                        if (e.currentTarget) {
                                                    e.currentTarget.classList.remove('disabled');

                                                        }
                                                }, 300);

                                                }
                                            }}>

                                                <label className="block text-sm font-medium text-slate-700 mb-1 slider-label">Opacidade ({Math.round((config.logoOpacityBack ?? 0.3) * 100)}%)</label>

                                                <input 

                                                    type="range" 

                                                    min={10} 

                                                    max={100} 

                                                    value={Math.round((config.logoOpacityBack ?? 0.3) * 100)} 

                                                    onChange={(e) => handleConfigChange('logoOpacityBack', Number(e.target.value) / 100)} 

                                                    onDoubleClick={() => resetSliderToMiddle(10, 100, 'logoOpacityBack')}

                                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" 

                                                />

                                            </div>

                                            <div className="slider-container" onTouchStart={(e) => {

                                                if (e.currentTarget) {
                                                e.currentTarget.classList.add('disabled');

                                                setTimeout(() => {

                                                        if (e.currentTarget) {
                                                    e.currentTarget.classList.remove('disabled');

                                                        }
                                                }, 300);

                                                }
                                            }} onTouchEnd={(e) => {
                                                // Detectar duplo toque no mobile
                                                const now = Date.now();
                                                const target = e.currentTarget as (HTMLElement & { lastTap?: number });
                                                const lastTap = target.lastTap || 0;
                                                if (now - lastTap < 300) {
                                                    handleDoubleTap('logoRotationBack');
                                                }
                                                target.lastTap = now;
                                            }}>

                                                <label className="block text-sm font-medium text-slate-700 mb-1 slider-label">Rotação ({config.logoRotationBack || 0}°)</label>

                                                <input 

                                                    type="range" 

                                                    min={-180} 

                                                    max={180} 

                                                    value={config.logoRotationBack || 0} 

                                                    onChange={(e) => handleRotationChange('logoRotationBack', Number(e.target.value))} 
                                                    onDoubleClick={() => handleConfigChange('logoRotationBack', 0)}
                                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" 

                                                />

                                            </div>

                                        </div>



                                        {/* 4. Posicionamento da Logo */}

                                        <div>

                                            <label className="block text-sm font-medium text-slate-700 mb-2">

                                                Posicionamento da Logo ({(config.logoPositionBack ?? 0) === 0 ? 'Centro' : (config.logoPositionBack ?? 0) < 0 ? 'Esquerda' : 'Direita'})

                                            </label>

                                            <div className="flex items-center space-x-3">

                                                <span className="text-xs text-slate-500">Esquerda</span>

                                                <input 

                                                    type="range" 

                                                    min={-30} 

                                                    max={30} 

                                                    value={config.logoPositionBack ?? 0} 

                                                    onChange={(e) => handleConfigChange('logoPositionBack', Number(e.target.value))} 

                                                    onDoubleClick={() => resetSliderToMiddle(-30, 30, 'logoPositionBack')}

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



                                        {/* 5. Posição do QR Code */}

                                        <div>

                                            <label className="block text-sm font-medium text-slate-700 mb-2">Posição do QR Code</label>

                                            <div className="grid grid-cols-2 gap-2">

                                                <button onClick={() => handleConfigChange('qrCodePosition', 'justify-start')} className={`border rounded p-2 text-xs ${config.qrCodePosition === 'justify-start' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-300 hover:bg-slate-50'}`}>Esquerda</button>

                                                <button onClick={() => handleConfigChange('qrCodePosition', 'justify-end')} className={`border rounded p-2 text-xs ${config.qrCodePosition === 'justify-end' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-300 hover:bg-slate-50'}`}>Direita</button>

                                            </div>

                                        </div>





                                        {/* 7. Seu Domínio */}

                                        <div>

                                            <label className="block text-sm font-medium text-slate-700 mb-1">Seu Domínio</label>

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

                                        </div>

                                </div>

                            </div>

                            <div className="mt-8 flex justify-center">

                                <button onClick={handleNextStep} className="w-full max-w-md bg-slate-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-900 transition-colors duration-300">Segunda Etapa</button>
                            </div>
                        </div>
                    )}

                    {/* Página de Confirmação do Layout */}
                    {showCardConfirmation && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Confirme o Layout do Seu Cartão</h2>
                                    <p className="text-slate-600">Revise o design do seu cartão. Após confirmar, não será possível alterar.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Frente do Cartão */}
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-slate-700 mb-3">Frente do Cartão</h3>
                                        <div className="bg-white border-2 border-slate-200 rounded-lg p-4 shadow-sm">
                                            <div 
                                                style={{ backgroundColor: config.cardBgColor }} 
                                                className="w-64 h-40 mx-auto rounded-xl shadow-lg relative p-3 transition-colors duration-300 border overflow-hidden card-preview"
                                            >
                                                {/* Logo com posicionamento simplificado e centralizado */}
                                                {logoDataUrl && (
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
                                                        <img 
                                                            src={logoDataUrl} 
                                                            alt="Logo Preview" 
                                                            className="object-contain w-full h-full" 
                                                            style={{ 
                                                                filter: 'none',
                                                                mixBlendMode: 'normal',
                                                                background: 'transparent'
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                
                                                {/* Texto com posicionamento fixo na parte inferior */}
                                                {config.isTextEnabled && config.cardText && (
                                                    <div className="absolute bottom-3 left-3 right-3">
                                                        <p style={{ color: config.cardTextColor }} className="text-center font-semibold text-xs break-words">
                                                            {config.cardText}
                                                        </p>
                                                    </div>
                                                )}
                                                {/* Símbolo NFC fixo no canto superior direito */}
                                                <img 
                                                    src="/nfc-symbol.png" 
                                                    alt="NFC" 
                                                    className="absolute top-4 right-4 w-4 h-4 object-contain opacity-80" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verso do Cartão */}
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-slate-700 mb-3">Verso do Cartão</h3>
                                        <div className="bg-white border-2 border-slate-200 rounded-lg p-4 shadow-sm">
                                            <div 
                                                style={{ backgroundColor: config.cardBackBgColor }} 
                                                className="w-64 h-40 mx-auto rounded-xl shadow-lg p-3 border relative overflow-hidden card-preview"
                                            >
                                                {logoDataUrl && (
                                                    <img 
                                                        src={logoDataUrl} 
                                                        alt="Logo Verso" 
                                                        className="object-contain absolute transition-all duration-300" 
                                                        style={{ 
                                                            width: `${config.clientLogoBackSize}%`, 
                                                            top: '50%', 
                                                            left: `${50 + (config.logoPositionBack ?? 0) * 1.2}%`, 
                                                            transform: `translate(-50%, -50%) rotate(${config.logoRotationBack || 0}deg)`, 
                                                            opacity: config.logoOpacityBack ?? 0.3, 
                                                            background: 'transparent' 
                                                        }} 
                                                    />
                                                )}
                                                <div className={`absolute inset-0 p-3 flex items-center ${config.qrCodePosition}`}>
                                                    <div 
                                                        className="bg-white p-1 rounded-md aspect-square" 
                                                        style={{ width: `${config.qrCodeSize}%` }}
                                                    >
                                                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xs text-slate-500">
                                                            QR Code
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Logo Zag fixa no canto inferior direito - sempre visível e sutil */}
                                                <img 
                                                    src="/logo-zag.png" 
                                                    alt="Logo Zag Card" 
                                                    className="absolute bottom-1 right-1 h-3 w-auto object-contain opacity-100" 
                                                    style={{ 
                                                        width: 'auto', 
                                                        height: 'auto',
                                                        minWidth: '30px',
                                                        maxWidth: '45px'
                                                    }} 
                                                />
                                                {/* Símbolo NFC fixo no canto superior direito */}
                                                <img 
                                                    src="/nfc-symbol.png" 
                                                    alt="NFC" 
                                                    className="absolute top-4 right-4 w-4 h-4 object-contain opacity-80" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-amber-800">Atenção!</h3>
                                            <div className="mt-2 text-sm text-amber-700">
                                                <p>Após confirmar, o layout do cartão será salvo e não poderá ser alterado. Certifique-se de que está satisfeito com o design antes de prosseguir.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center space-x-4">
                                    <button 
                                        onClick={handleCancelConfirmation}
                                        className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Voltar e Editar
                                    </button>
                                    <button 
                                        onClick={handleConfirmLayout}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Confirmar Layout
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Página de Carregamento */}
                    {isProcessing && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
                                <div className="mb-6">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 mb-2">Salvando seu Layout</h2>
                                <p className="text-slate-600 mb-4">Processando as imagens do cartão e gerando o PDF...</p>
                                <div className="space-y-2 text-sm text-slate-500">
                                    <div className="flex items-center justify-center">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
                                        Gerando imagens do cartão
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
                                        Criando PDF para impressão
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
                                        Enviando para aprovação
                                    </div>
                                </div>
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

                                                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowEmojiPicker(false)}>

                                                            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-96 overflow-hidden" onClick={(e) => e.stopPropagation()}>

                                                                {/* Cabeçalho com categorias */}

                                                                <div className="p-3 border-b">

                                                                    <div className="flex flex-wrap gap-1 mb-2">

                                                                        {Object.keys(emojiCategories).map((category) => (

                                                                            <button

                                                                                key={category}

                                                                                onClick={() => setSelectedEmojiCategory(category)}

                                                                                className={`px-2 py-1 text-xs rounded-md transition-colors ${

                                                                                    selectedEmojiCategory === category 

                                                                                        ? 'bg-blue-500 text-white' 

                                                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'

                                                                                }`}

                                                                            >

                                                                                {category}

                                                                            </button>

                                                                        ))}

                                                                    </div>

                                                                    <div className="flex justify-between items-center">

                                                                        <span className="text-sm font-medium text-slate-700">Selecione um emoji</span>

                                                                        <button 

                                                                            onClick={() => setShowEmojiPicker(false)}

                                                                            className="text-slate-500 hover:text-slate-700"

                                                                        >

                                                                            ✕

                                                                        </button>

                                                                    </div>

                                                                </div>

                                                                

                                                                {/* Grid de emojis */}

                                                                <div className="p-3 max-h-64 overflow-y-auto">

                                                                    <div className="grid grid-cols-6 gap-1">

                                                                        {emojiCategories[selectedEmojiCategory as keyof typeof emojiCategories].map((emoji, index) => (

                                                                            <button 

                                                                                key={`${selectedEmojiCategory}-${emoji}-${index}`} 

                                                                                onClick={() => { 

                                                                                    handleConfigChange('landingPageSubtitleText', (config.landingPageSubtitleText || '') + emoji); 

                                                                                    setShowEmojiPicker(false); 

                                                                                }} 

                                                                                className="text-xl p-2 transition-transform duration-150 hover:scale-125 hover:bg-slate-100 rounded"

                                                                            >

                                                                                {emoji}

                                                                            </button>

                                                                        ))}

                                                                    </div>

                                                                </div>

                                                            </div>

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

                                                <div className="grid grid-cols-3 gap-4">

                                                    <div>

                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cor do Título</label>

                                                        <input type="color" value={config.landingPageTitleColor || '#1e293b'} onChange={(e) => handleConfigChange('landingPageTitleColor', e.target.value)} className="w-full h-8 border border-slate-300 rounded-md" />

                                            </div>

                                                <div>

                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cor do Subtítulo</label>

                                                        <input type="color" value={config.landingPageSubtitleColor || '#64748b'} onChange={(e) => handleConfigChange('landingPageSubtitleColor', e.target.value)} className="w-full h-8 border border-slate-300 rounded-md" />

                                                    </div>

                                                    <div>

                                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo</label>

                                                        <input type="color" value={config.landingPageBgColor || '#ffffff'} onChange={(e) => handleConfigChange('landingPageBgColor', e.target.value)} className="w-full h-8 border border-slate-300 rounded-md" />

                                                    </div>

                                                </div>

                                                

                                                <div>

                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Adiciones botões sociais</label>

                                                    {/* Primeira linha - Redes sociais */}
                                                    <div className="flex flex-wrap gap-2 mb-2">

                                                        <button 

                                                            onClick={() => addSocialPreset('whatsapp')} 

                                                            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${

                                                                isSocialButtonActive('whatsapp') 

                                                                    ? 'bg-blue-500 text-white' 

                                                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'

                                                            }`}

                                                        >

                                                            <MessageCircle size={14}/> WhatsApp

                                                        </button>

                                                        <button 

                                                            onClick={() => addSocialPreset('instagram')} 

                                                            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${

                                                                isSocialButtonActive('instagram') 

                                                                    ? 'bg-blue-500 text-white' 

                                                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'

                                                            }`}

                                                        >

                                                            <Instagram size={14}/> Instagram

                                                        </button>

                                                        <button 

                                                            onClick={() => addSocialPreset('youtube')} 

                                                            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${

                                                                isSocialButtonActive('youtube') 

                                                                    ? 'bg-blue-500 text-white' 

                                                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'

                                                            }`}

                                                        >

                                                            <Youtube size={14}/> YouTube

                                                        </button>

                                                        <button 

                                                            onClick={() => addSocialPreset('linkedin')} 

                                                            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${

                                                                isSocialButtonActive('linkedin') 

                                                                    ? 'bg-blue-500 text-white' 

                                                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'

                                                            }`}

                                                        >

                                                            <Linkedin size={14}/> LinkedIn

                                                        </button>

                                                    </div>

                                                    {/* Segunda linha - Salvar Contato e Compartilhar */}
                                                    <div className="grid grid-cols-2 gap-2 mb-4">

                                                        <button 

                                                            onClick={() => addSocialPreset('save-contact')} 

                                                            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors ${

                                                                isSocialButtonActive('save-contact') 

                                                                    ? 'bg-blue-500 text-white' 

                                                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'

                                                            }`}

                                                        >

                                                            <UserPlus size={16}/> Salvar Contato

                                                        </button>

                                                        <button 

                                                            onClick={() => addSocialPreset('share')} 

                                                            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors ${

                                                                isSocialButtonActive('share') 

                                                                    ? 'bg-blue-500 text-white' 

                                                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'

                                                            }`}

                                                        >

                                                            <Share size={16}/> Compartilhar

                                                        </button>

                                                    </div>

                                                    

                                                    {/* Cores dos Botões Sociais */}

                                                    {config.customLinks?.some(link => link.isSocial) && (

                                                        <div>

                                                            <label className="block text-sm font-medium text-slate-700 mb-2">Cor dos Botões Sociais</label>

                                                            <div className="flex items-center gap-3">

                                                                <input 

                                                                    type="color" 

                                                                    value={config.socialButtonColor || '#3B82F6'} 

                                                                    onChange={(e) => {

                                                                        const newColor = e.target.value;

                                                                        handleConfigChange('socialButtonColor', newColor);

                                                                        

                                                                        // Atualizar todos os botões sociais com a nova cor

                                                                        const updatedLinks = config.customLinks?.map(link => {

                                                                            if (link.isSocial) {

                                                                                return { ...link, bgColor1: newColor, bgColor2: newColor };

                                                                            }

                                                                            return link;

                                                                        });

                                                                        handleConfigChange('customLinks', updatedLinks);

                                                                    }} 

                                                                    className="w-12 h-10 border border-slate-300 rounded-md" 

                                                                />

                                                                <span className="text-sm text-slate-600">Cor aplicada a todos os botões sociais</span>

                                                            </div>

                                                        </div>

                                                    )}

                                                </div>

                                                <div className="slider-container">

                                                    <label className="block text-sm font-medium text-slate-700 mb-1 slider-label">Tamanho da Logo na Página ({config.landingPageLogoSize}px)</label>

                                                    <input type="range" min={32} max={200} value={config.landingPageLogoSize} onChange={(e) => handleConfigChange('landingPageLogoSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer no-select" />

                                                    <p className="text-xs text-slate-500 mt-1">💡 Ajuste conforme o tamanho da sua imagem</p>

                                                </div>

                                            </div>

                                        </fieldset>

                                        

                                        <fieldset className="border-t pt-4">

                                            <div className="space-y-4 mt-4">

                                                <button onClick={() => openLinkEditor(null)} className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2">

                                                    <PlusCircle /> Adicionar Novo Botão

                                                </button>

                                                {/* Botão PIX Destacado */}
                                                <button 
                                                    onClick={openPixEditor} 
                                                    className="w-full font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all text-lg bg-blue-500 text-white hover:bg-blue-600 shadow-md"
                                                >
                                                    <PixIconCustom size={24}/> Adicionar Botão PIX
                                                </button>

                                                <div className="space-y-2">

                                                    {config.customLinks?.map((link, index) => (

                                                        <div key={link.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">

                                                            <div className="flex items-center gap-2">

                                                                {link.icon && <IconForName name={link.icon as IconName} className="w-5 h-5 text-slate-600" />}

                                                                <span className="text-sm font-medium">{link.text} {link.isSocial && <em className="text-xs text-slate-500 italic">({link.url}coloque-seu-dado)</em>}</span>

                                                            </div>

                                                            <div className="flex items-center gap-1">

                                                                <button 

                                                                    onClick={() => moveButtonUp(index)} 

                                                                    disabled={index === 0}

                                                                    className="p-1 text-slate-500 hover:text-slate-800 disabled:text-slate-300 disabled:cursor-not-allowed"

                                                                    title="Mover para cima"

                                                                >

                                                                    <ArrowUp size={14} />

                                                                </button>

                                                                <button 

                                                                    onClick={() => moveButtonDown(index)} 

                                                                    disabled={index === (config.customLinks?.length || 0) - 1}

                                                                    className="p-1 text-slate-500 hover:text-slate-800 disabled:text-slate-300 disabled:cursor-not-allowed"

                                                                    title="Mover para baixo"

                                                                >

                                                                    <ArrowDown size={14} />

                                                                </button>

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

                                        <div style={{ backgroundColor: config.landingPageBgColor, backgroundImage: config.landingPageBgImage ? `url('${config.landingPageBgImage}')` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} className="flex-grow overflow-y-auto p-4 rounded-2xl relative">

                                            {/* Banner do Topo (atrás da logo) */}
                                            {config.landingPageBannerUrl ? (
                                                <>
                                                    {/* Imagem do banner (camada de fundo) */}
                                                    <div className="absolute top-0 left-0 right-0 z-0" style={{ height: `calc(64px + ${(config.landingPageLogoSize || 96) / 2}px)` }}>
                                                        <img src={config.landingPageBannerUrl} alt="Banner" className="w-full h-full object-cover" />
                                                    </div>
                                                    {/* Área clicável do banner (acima do banner, abaixo da logo) */}
                                                    <div 
                                                        className="absolute top-0 left-0 right-0 group cursor-pointer"
                                                        style={{ height: `calc(64px + ${(config.landingPageLogoSize || 96) / 2}px)`, zIndex: 1 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            document.getElementById('banner-upload-input')?.click();
                                                        }}
                                                    >
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <span className="text-white text-xs font-medium">Trocar Banner</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div 
                                                    className="absolute top-0 left-0 right-0 bg-gray-100 bg-opacity-50 border-2 border-dashed border-gray-300 group hover:bg-opacity-70 transition-opacity cursor-pointer"
                                                    style={{ height: `calc(64px + ${(config.landingPageLogoSize || 96) / 2}px)`, zIndex: 1 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        document.getElementById('banner-upload-input')?.click();
                                                    }}
                                                >
                                                    <div className="absolute top-2 left-0 right-0 text-center pointer-events-none">
                                                        <span className="text-xs text-gray-500 font-medium">Adicionar Banner</span>
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                </div>
                                            )}

                                            <input
                                                id="banner-upload-input"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (event) => {
                                                            setConfig(prev => ({ ...prev, landingPageBannerUrl: event.target?.result as string }));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />

                                            {/* Logo com botão de troca - Posicionada absolutamente sobre o banner */}
                                            <div 
                                                className="absolute left-1/2 transform -translate-x-1/2 group"
                                                style={{ 
                                                    top: `calc(64px + ${(config.landingPageLogoSize || 96) / 2}px - ${(config.landingPageLogoSize || 96) / 2}px)`,
                                                    zIndex: 20
                                                }}
                                            >
                                                {config.landingPageLogoUrl || logoDataUrl ? (

                                                    <Image src={config.landingPageLogoUrl || logoDataUrl || ''} alt="Logo Preview" width={config.landingPageLogoSize || 96} height={config.landingPageLogoSize || 96} className={`object-cover mx-auto shadow-md image-transparent ${config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`} style={{ background: 'transparent' }} />

                                                ) : (

                                                    <div className={`w-24 h-24 bg-slate-200 flex items-center justify-center shadow-md ${config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`}>

                                                        <ImageIcon className="w-8 h-8 text-slate-400" />

                                                    </div>

                                                )}
                                                
                                                {/* Botão de troca de logo (aparece ao hover) */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        document.getElementById('logo-upload-input')?.click();
                                                    }}
                                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="text-white text-xs font-medium">Trocar Logo</span>
                                                </button>
                                            </div>

                                            <input
                                                id="logo-upload-input"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (event) => {
                                                            setConfig(prev => ({ ...prev, landingPageLogoUrl: event.target?.result as string }));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />

                                            <div className="flex flex-col items-center text-center relative" style={{ zIndex: 5, marginTop: `calc(64px + ${(config.landingPageLogoSize || 96) / 2}px + ${(config.landingPageLogoSize || 96) / 2}px)` }}>

                                                <h1 className="text-xl font-bold break-words mt-4 mb-1" style={{ fontFamily: `var(--font-${(config.landingFont || 'Inter').toLowerCase().replace(' ', '-')})`, color: config.landingPageTitleColor || '#1e293b' }}>{config.landingPageTitleText || 'Bem-vindo(a)!'}</h1>

                                                {config.landingPageSubtitleText && <p className="text-sm px-2 break-words mb-4" style={{ fontFamily: `var(--font-${(config.landingFont || 'Inter').toLowerCase().replace(' ', '-')})`, color: config.landingPageSubtitleColor || '#64748b' }}>{config.landingPageSubtitleText}</p>}

                                                {/* Botões Sociais - Todos na mesma linha */}
                                                <div className="w-full flex flex-wrap justify-center items-center gap-3 mb-4">

                                                    {config.customLinks?.filter(link => link.isSocial).map((link) => {

                                                        const globalColor = config.socialButtonColor || '#3B82F6';
                                                        const isPillButton = link.icon === 'user-plus';

                                                        return (

                                                            <div 
                                                                key={link.id} 
                                                                className={`${
                                                                    isPillButton 
                                                                        ? 'h-10 px-4 rounded-full gap-2 font-medium' 
                                                                        : 'w-12 h-12 rounded-full'
                                                                } flex items-center justify-center text-white shadow-md`}
                                                                style={{ background: link.styleType === 'gradient' ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` : globalColor }}
                                                            >

                                                            {link.icon ? (

                                                                <IconForName name={link.icon as IconName} size={isPillButton ? 16 : 20} />

                                                            ) : (

                                                                <span className="text-xs font-bold">?</span>

                                                            )}

                                                            {isPillButton && <span className="text-xs whitespace-nowrap">{link.text}</span>}

                                                        </div>

                                                        );

                                                    })}

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



                                            // Gerar thumbnail da landing page

                                            const thumbnail = generateThumbnail();

                                            

                                            // Verificar tamanho dos dados antes de enviar

                                            const payload = {

                                                subdomain,

                                                config,

                                                logo_url: logoDataUrl,

                                                thumbnail_url: thumbnail

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

                                                } catch (error) {
// Se não conseguir fazer parse do JSON, usar o status e texto da resposta

                                                    const responseText = await response.text();

                                                    console.error('Response text:', responseText);

                                                    errorMessage = `Erro ${response.status




}: ${responseText.substring(0, 100)}`;

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

            'youtube': 'https://youtube.com/',

            'pix': 'pix:',

            'linkedin': 'https://linkedin.com/in/',

            'user-plus': 'tel:',

        };

        return baseUrls[icon] || '';

    };



    const getSocialPlaceholder = (icon: string | null) => {

        if (!icon) return '';

        const placeholders: { [key: string]: string } = {

            'message-circle': 'Ex: 11999999999 (código de área + número)',

            'instagram': 'Ex: @seuusuario',

            'youtube': 'Ex: @seucanal',

            'pix': 'Ex: sua-chave-pix@email.com ou CPF ou telefone',

            'linkedin': 'Ex: seuusuario',

            'user-plus': 'Ex: 11999999999 (número de celular)',

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

                                <IconForName name={icon as IconName} className="w-5 h-5 text-slate-600" />

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





