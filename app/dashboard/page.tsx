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

        cardBackBgColor: '#FFFFFF',

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
    const [processedLogoUrl, setProcessedLogoUrl] = useState<string | null>(null);

    const [showCardConfirmation, setShowCardConfirmation] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // 🎨 Estado para feedback visual da detecção automática de cor
    const [autoDetectedColor, setAutoDetectedColor] = useState<string | null>(null);
    const [showColorDetectionFeedback, setShowColorDetectionFeedback] = useState(false);
    
    // ✏️ Estados para edição inline na segunda etapa
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
    const [tempTitleText, setTempTitleText] = useState('');
    const [tempSubtitleText, setTempSubtitleText] = useState('');
    
    // 🔧 Estados para edição inline dos botões
    const [editingButtonId, setEditingButtonId] = useState<number | null>(null);
    const [tempButtonText, setTempButtonText] = useState('');
    const [tempButtonUrl, setTempButtonUrl] = useState('');
    const qrcodePreviewRef = useRef<HTMLDivElement>(null);



    // Helper para detectar contraste do fundo
    const isColorDark = (hexColor?: string) => {
        const hex = (hexColor || '#FFFFFF').replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        return luminance < 140; // threshold for dark background
    };

    // Calcular cor média da imagem enviada para a frente
    const [averageFrontImageColor, setAverageFrontImageColor] = useState<string | null>(null);
    const [averageFrontImageColorNfc, setAverageFrontImageColorNfc] = useState<string | null>(null);

    // 🎨 ALGORITMO MELHORADO: Detecção de cor mais precisa
    const getAverageImageColor = async (url: string): Promise<string | null> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return resolve(null);
                    
                    // 🎯 Aumentar amostragem para maior precisão
                    const sampleSize = 64; // Dobrou de 32 para 64
                    canvas.width = sampleSize;
                    canvas.height = sampleSize;
                    
                    // Configurar qualidade de renderização
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
                    const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
                    
                    // 🎯 Algoritmo melhorado: Histograma de cores com pesos
                    const colorHistogram = new Map<string, number>();
                    let totalWeight = 0;
                    
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const alpha = data[i + 3];
                        
                        // Ignorar pixels transparentes ou muito transparentes
                        if (alpha < 128) continue;
                        
                        // 🎯 Quantização para agrupar cores similares (reduzir ruído)
                        const quantizedR = Math.round(r / 8) * 8;
                        const quantizedG = Math.round(g / 8) * 8;
                        const quantizedB = Math.round(b / 8) * 8;
                        
                        const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
                        
                        // 🎯 Peso baseado na saturação e luminosidade
                        const saturation = Math.max(r, g, b) - Math.min(r, g, b);
                        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                        const weight = (saturation / 255) * (luminance / 255) * (alpha / 255);
                        
                        colorHistogram.set(colorKey, (colorHistogram.get(colorKey) || 0) + weight);
                        totalWeight += weight;
                    }
                    
                    if (totalWeight === 0) return resolve(null);
                    
                    // 🎯 Encontrar a cor mais frequente (não apenas média)
                    let maxWeight = 0;
                    let dominantColor = '';
                    
                    for (const [color, weight] of colorHistogram) {
                        if (weight > maxWeight) {
                            maxWeight = weight;
                            dominantColor = color;
                        }
                    }
                    
                    if (!dominantColor) return resolve(null);
                    
                    // Converter de volta para hex
                    const [r, g, b] = dominantColor.split(',').map(Number);
                    const hex = `#${r.toString(16).padStart(2, '0')}${g
                        .toString(16)
                        .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                    
                    console.log('🎨 COR DETECTADA - Algoritmo melhorado:', {
                        corOriginal: `${r},${g},${b}`,
                        hex,
                        totalPixels: totalWeight,
                        histogramSize: colorHistogram.size
                    });
                    
                    resolve(hex);
                } catch (error) {
                    console.error('Erro na detecção de cor:', error);
                    resolve(null);
                }
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    };

    // 🎨 FUNÇÃO MELHORADA: Detecção de cor mais precisa com análise de regiões
    const detectAndApplyBackgroundColor = async (imageUrl: string) => {
        try {
            // 🎯 Análise em múltiplas regiões para maior precisão
            const regions = [
                { x: 0, y: 0, w: 1, h: 1, name: 'full' }, // Imagem completa
                { x: 0.1, y: 0.1, w: 0.8, h: 0.8, name: 'center' }, // Região central
                { x: 0, y: 0, w: 0.3, h: 1, name: 'left' }, // Lado esquerdo
                { x: 0.7, y: 0, w: 0.3, h: 1, name: 'right' }, // Lado direito
            ];
            
            const regionColors = [];
            
            for (const region of regions) {
                const color = await getAverageImageColorRegion(imageUrl, region);
                if (color) {
                    regionColors.push({ color, region: region.name });
                }
            }
            
            if (regionColors.length === 0) return null;
            
            // 🎯 Escolher a cor mais representativa
            // Priorizar região central, depois full, depois laterais
            const priorityOrder = ['center', 'full', 'left', 'right'];
            let selectedColor = null;
            
            for (const priority of priorityOrder) {
                const regionData = regionColors.find(r => r.region === priority);
                if (regionData) {
                    selectedColor = regionData.color;
                    break;
                }
            }
            
            if (selectedColor) {
                // Aplicar a cor detectada ao fundo do cartão
                handleConfigChange('cardBgColor', selectedColor);
                
                // Feedback visual para o usuário
                console.log('🎨 COR DETECTADA - Algoritmo melhorado:', {
                    corFinal: selectedColor,
                    regioesAnalisadas: regionColors.length,
                    coresEncontradas: regionColors.map(r => ({ regiao: r.region, cor: r.color })),
                    isBlack: selectedColor.toLowerCase() === '#000000' || selectedColor.toLowerCase() === '#000'
                });
                
                // Mostrar feedback visual
                setAutoDetectedColor(selectedColor);
                setShowColorDetectionFeedback(true);
                
                // Auto-hide após 3 segundos
                setTimeout(() => {
                    setShowColorDetectionFeedback(false);
                }, 3000);
                
                return selectedColor;
            }
        } catch (error) {
            console.error('Erro ao detectar cor da imagem:', error);
        }
        return null;
    };

    // 🎨 REGIÃO MELHORADA: Detecção de cor mais precisa em regiões específicas
    const getAverageImageColorRegion = async (
        url: string,
        region: { x: number; y: number; w: number; h: number }
    ): Promise<string | null> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    const sampleSize = 64;
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return resolve(null);
                    
                    // Configurar qualidade de renderização
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    const sx = Math.max(0, Math.min(img.width - 1, Math.floor(img.width * region.x)));
                    const sy = Math.max(0, Math.min(img.height - 1, Math.floor(img.height * region.y)));
                    const sw = Math.max(1, Math.floor(img.width * region.w));
                    const sh = Math.max(1, Math.floor(img.height * region.h));
                    canvas.width = sampleSize;
                    canvas.height = sampleSize;
                    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sampleSize, sampleSize);
                    const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
                    
                    // 🎯 Algoritmo melhorado: Histograma de cores com pesos
                    const colorHistogram = new Map<string, number>();
                    let totalWeight = 0;
                    
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const alpha = data[i + 3];
                        
                        // Ignorar pixels transparentes ou muito transparentes
                        if (alpha < 128) continue;
                        
                        // 🎯 Quantização mais fina para regiões específicas
                        const quantizedR = Math.round(r / 4) * 4; // Mais preciso que /8
                        const quantizedG = Math.round(g / 4) * 4;
                        const quantizedB = Math.round(b / 4) * 4;
                        
                        const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;
                        
                        // 🎯 Peso baseado na saturação, luminosidade e posição
                        const saturation = Math.max(r, g, b) - Math.min(r, g, b);
                        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                        
                        // 🎨 CORREÇÃO: Não penalizar cores escuras (como preto)
                        // Para cores muito escuras, usar peso baseado na frequência, não na luminosidade
                        const isVeryDark = luminance < 50; // Cores muito escuras
                        const weight = isVeryDark 
                            ? (alpha / 255) * 0.8 // Peso fixo para cores escuras
                            : (saturation / 255) * (luminance / 255) * (alpha / 255);
                        
                        colorHistogram.set(colorKey, (colorHistogram.get(colorKey) || 0) + weight);
                        totalWeight += weight;
                    }
                    
                    if (totalWeight === 0) return resolve(null);
                    
                    // 🎯 Encontrar a cor mais frequente
                    let maxWeight = 0;
                    let dominantColor = '';
                    
                    for (const [color, weight] of colorHistogram) {
                        if (weight > maxWeight) {
                            maxWeight = weight;
                            dominantColor = color;
                        }
                    }
                    
                    if (!dominantColor) return resolve(null);
                    
                    // Converter de volta para hex
                    const [r, g, b] = dominantColor.split(',').map(Number);
                    const hex = `#${r.toString(16).padStart(2, '0')}${g
                        .toString(16)
                        .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                    
                    // 🎨 DEBUG: Log para cores escuras
                    if (r < 30 && g < 30 && b < 30) {
                        console.log('🔍 COR ESCURA DETECTADA:', {
                            rgb: [r, g, b],
                            hex: hex,
                            region: 'region'
                        });
                    }
                    
                    resolve(hex);
                } catch (error) {
                    console.error('Erro na detecção de cor da região:', error);
                    resolve(null);
                }
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    };

    useEffect(() => {
        let cancelled = false;
        const compute = async () => {
            if (!logoDataUrl) {
                if (!cancelled) {
                    setAverageFrontImageColor(null);
                    setAverageFrontImageColorNfc(null);
                }
                return;
            }
            const color = await getAverageImageColor(logoDataUrl);
            if (!cancelled) setAverageFrontImageColor(color);
            // top-right região ~20% x 25%
            const regionColor = await getAverageImageColorRegion(logoDataUrl, { x: 0.78, y: 0.02, w: 0.2, h: 0.25 });
            if (!cancelled) setAverageFrontImageColorNfc(regionColor);
        };
        compute();
        return () => { cancelled = true; };
    }, [logoDataUrl]);

    const useImageColorForFront = !!logoDataUrl && (config.logoSize || 60) >= 90;
    const frontContrastHex = useImageColorForFront && averageFrontImageColor ? averageFrontImageColor : (config.cardBgColor || '#FFFFFF');
    const frontContrastHexNfc = useImageColorForFront && averageFrontImageColorNfc ? averageFrontImageColorNfc : (config.cardBgColor || '#FFFFFF');
    
    const isBackDark = isColorDark(config.cardBackBgColor);
    const isFrontDark = isColorDark(frontContrastHex);
    const isFrontDarkNfc = isColorDark(frontContrastHexNfc);
    
    const availableIcons: IconName[] = [

        'message-circle', 'instagram', 'facebook', 'youtube', 'twitter', 'pix', 'linkedin', 'globe', 'map-pin', 'phone', 'mail', 'shopping-cart', 'link', 'image',

        'heart', 'star', 'camera', 'music', 'video', 'calendar', 'clock', 'user', 'users', 'home', 'building', 'car', 'plane', 'coffee', 'gift', 'book', 'gamepad2', 'headphones', 'mic', 'search', 'settings', 'download', 'upload', 'share', 'copy', 'check', 'x', 'plus', 'minus', 'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'chevron-right', 'chevron-left', 'chevron-up', 'chevron-down', 'zap', 'target', 'award', 'trophy', 'shield', 'lock', 'unlock', 'eye', 'eye-off', 'bell', 'bell-off', 'volume2', 'volume-x', 'wifi', 'wifi-off', 'battery', 'battery-low', 'signal', 'signal-zero', 'signal-low', 'signal-medium', 'signal-high'

    ];

    const emojiCategories = {

        'Geral': ['✨', '🚀', '⭐', '❤️', '✅', '👇', '📱', '📞', '💡', '🔥', '🎉', '👋', '🙌', '👍', '😎', '🎁', '🛒', '🔗', '🧭', '💬', '📧', '☎️', '📍', '💼', '🏷️', '🆕', '🏆', '🖼️', '🎬', '🌟', '💫', '🎯', '🎊', '🎈', '🎂', '🍰', '☕', '🌺', '🌸', '🌻', '🌷', '🌹', '🌿', '🍀', '🌈', '☀️', '🌙', '💎', '🎪', '🎨', '🎭', '🎸', '🎵', '🎶', '🎤', '🎧', '📷', '📹', '🎥', '💻', '⌚', '📺', '🔊', '🎮', '🕹️', '🎲', '🃏', '🎴', '🀄', '🏹', '🎣', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏑', '🏏', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '🤾', '🤽', '🤹', '🧘', '🏃', '🚶', '🧗', '🏇', '🏊', '🏄', '🚣', '🚴', '🚵'],

        'Negócios': ['💼', '📊', '📈', '💰', '💳', '🏢', '🏪', '🛍️', '📦', '🚚', '📞', '📧', '💻', '📱', '⌚', '🔔', '📋', '📝', '✍️', '📄', '📑', '📌', '📍', '🗂️', '📁', '💼', '🎯', '🏆', '⭐', '✅', '❌', '⚠️', 'ℹ️', '🔍', '🔎', '💡', '💭', '🎪', '🎨', '🎭'],

        'Comida': ['🍎', '🍊', '🍌', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥕', '🌽', '🌶️', '🥒', '🥬', '🥦', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🥨', '🥯', '🧀', '🥚', '🍳', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🌮', '🌯', '🥗', '8', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧃', '🧉', '🧊'],

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

    // BACK: média de áreas específicas quando houver logo no verso
    const [averageBackImageColorNfc, setAverageBackImageColorNfc] = useState<string | null>(null);
    const [averageBackImageColorZag, setAverageBackImageColorZag] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const compute = async () => {
            if (!logoDataUrl) {
                if (!cancelled) {
                    setAverageBackImageColorNfc(null);
                    setAverageBackImageColorZag(null);
                }
                return;
            }
            // mesma imagem é usada frente/verso; amostrar regiões do verso
            const nfcRegion = await getAverageImageColorRegion(logoDataUrl, { x: 0.78, y: 0.02, w: 0.2, h: 0.25 });
            const zagRegion = await getAverageImageColorRegion(logoDataUrl, { x: 0.70, y: 0.75, w: 0.28, h: 0.23 });
            if (!cancelled) {
                setAverageBackImageColorNfc(nfcRegion);
                setAverageBackImageColorZag(zagRegion);
            }
        };
        compute();
        return () => { cancelled = true; };
    }, [logoDataUrl]);

    const useImageColorForBack = !!logoDataUrl && (config.clientLogoBackSize || 35) >= 50; // logo grande no verso
    const backContrastHexNfc = useImageColorForBack && averageBackImageColorNfc ? averageBackImageColorNfc : (config.cardBackBgColor || '#FFFFFF');
    const backContrastHexZag = useImageColorForBack && averageBackImageColorZag ? averageBackImageColorZag : (config.cardBackBgColor || '#FFFFFF');

    const isBackDarkNfc = isColorDark(backContrastHexNfc);
    const isBackDarkZag = isColorDark(backContrastHexZag);

    const handleConfigChange = (key: keyof PageConfig, value: unknown) => {

        setConfig((prev) => {

            const newConfig = { ...prev, [key]: value };

            // 🎨 DEBUG: Log para mudanças de cor
            if (key === 'cardBgColor') {
                console.log('🎨 COR APLICADA:', {
                    corAnterior: prev.cardBgColor,
                    corNova: value,
                    tipo: typeof value
                });
            }

            // Sincronizar cor de fundo da frente com o verso

            if (key === 'cardBgColor') {

                newConfig.cardBackBgColor = value as string;

            }

            

            return newConfig;

        });

    };

    // 🎨 DEBUG: Monitorar mudanças na cor
    useEffect(() => {
        console.log('🎨 ESTADO DA COR ATUALIZADO:', {
            cardBgColor: config.cardBgColor,
            timestamp: new Date().toISOString()
        });
    }, [config.cardBgColor]);



    // Função para resetar slider para o valor do meio

    const resetSliderToMiddle = (min: number, max: number, key: keyof PageConfig) => {

        const middleValue = Math.round((min + max) / 2);

        handleConfigChange(key, middleValue);

    };


    // Função para snap nos valores comuns para sliders de rotação
    const handleRotationChange = (key: keyof PageConfig, value: number) => {
        // Trava em 0° (entre -15 e 15)
        if (value >= -15 && value <= 15) {
            handleConfigChange(key, 0);
        } 
        // Trava em 90° (entre 75 e 105)
        else if (value >= 75 && value <= 105) {
            handleConfigChange(key, 90);
        }
        // Trava em -90° (entre -105 e -75)
        else if (value >= -105 && value <= -75) {
            handleConfigChange(key, -90);
        }
        // Trava em 180° (entre 165 e 180)
        else if (value >= 165 && value <= 180) {
            handleConfigChange(key, 180);
        }
        // Trava em -180° (entre -180 e -165)
        else if (value >= -180 && value <= -165) {
            handleConfigChange(key, -180);
        }
        else {
            handleConfigChange(key, value);
        }
    };

    // Função para detectar duplo toque no mobile
    const handleDoubleTap = (key: keyof PageConfig) => {
        handleConfigChange(key, 0);
    };


    // Função para gerar e baixar a visualização do cartão

    // Função para carregar imagem com fallback para CORS
    const loadImageWithCorsFallback = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            // Se não for URL externa, usar diretamente
            if (!url.startsWith('http')) {
                resolve(url);
                return;
            }

            // Para URLs do remove.bg (Supabase), tentar usar diretamente primeiro
            if (url.includes('supabase') || url.includes('remove.bg')) {
                console.log('Imagem do remove.bg detectada, usando URL original para manter qualidade');
                resolve(url);
                return;
            }

            const img = new window.Image();
            
            // Tentar primeiro com CORS
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                // Se carregou com CORS, usar a URL original (melhor qualidade)
                resolve(url);
            };
            
            img.onerror = () => {
                // Se falhou com CORS, converter para data URL
                console.log('CORS falhou, convertendo para data URL...');
                convertUrlToDataUrl(url)
                    .then(resolve)
                    .catch(() => resolve(url)); // Fallback final
            };
            
            img.src = url;
        });
    };

    // Função para converter URL em data URL (resolve problemas de CORS)
    const convertUrlToDataUrl = async (url: string): Promise<string> => {
        console.log('🔍 CONVERTER - URL de entrada:', url);
        console.log('🔍 CONVERTER - Tipo:', url.startsWith('data:') ? 'Data URL' : 'URL Externa');
        
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            
            console.log('🔍 CONVERTER - Blob type:', blob.type);
            console.log('🔍 CONVERTER - Blob size:', blob.size);
            
            // Verificar se é uma imagem PNG (que mantém transparência)
            if (blob.type === 'image/png') {
                console.log('🔍 CONVERTER - Usando FileReader para PNG');
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        console.log('🔍 CONVERTER - Data URL gerada (PNG):', result.substring(0, 100) + '...');
                        resolve(result);
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } else {
                console.log('🔍 CONVERTER - Usando Canvas para não-PNG');
                // Para outros tipos, usar canvas para garantir qualidade
                return new Promise((resolve, reject) => {
                    const img = new window.Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        console.log('🔍 CONVERTER - Imagem carregada no canvas:', {
                            naturalWidth: img.naturalWidth,
                            naturalHeight: img.naturalHeight
                        });
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            reject(new Error('Não foi possível criar contexto do canvas'));
                            return;
                        }
                        
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        ctx.drawImage(img, 0, 0);
                        const result = canvas.toDataURL('image/png', 1.0); // Qualidade máxima
                        console.log('🔍 CONVERTER - Data URL gerada (Canvas):', result.substring(0, 100) + '...');
                        resolve(result);
                    };
                    img.onerror = reject;
                    img.src = url;
                });
            }
        } catch (error) {
            console.error('Erro ao converter URL para data URL:', error);
            return url; // Fallback para a URL original
        }
    };

    const generateCardImage = async (side: 'front' | 'back', returnAsDataUrl: boolean = false): Promise<string | void> => {

        return new Promise(async (resolve) => {

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

            // 🔍 DIAGNÓSTICO: Log das configurações do canvas
            console.log('🔍 CANVAS - Configurações:', {
                cardWidth,
                cardHeight,
                side,
                canvasWidth: canvas.width,
                canvasHeight: canvas.height
            });
            

            canvas.width = cardWidth;

            canvas.height = cardHeight;

            // 🔍 DIAGNÓSTICO: Log do contexto do canvas
            console.log('🔍 CANVAS - Contexto:', {
                imageSmoothingEnabled: ctx.imageSmoothingEnabled,
                imageSmoothingQuality: ctx.imageSmoothingQuality,
                globalAlpha: ctx.globalAlpha
            });

            // Configurar fundo

            const bgColor = side === 'front' ? (config.cardBgColor || '#FFFFFF') : (config.cardBackBgColor || '#FFFFFF');

            // 🎨 DEBUG: Log para cor do canvas
            if (side === 'front' && (bgColor === '#000000' || bgColor === '#000')) {
                console.log('🎨 CANVAS - Cor preta aplicada:', {
                    side: side,
                    bgColor: bgColor,
                    configCardBgColor: config.cardBgColor,
                    timestamp: new Date().toISOString()
                });
            }

            ctx.fillStyle = bgColor;

            ctx.fillRect(0, 0, cardWidth, cardHeight);



            if (side === 'front') {

                // Desenhar logo na frente

                if (logoDataUrl) {

                    // Para URLs do Supabase (remove.bg), converter para data URL para evitar CORS
                    let processedLogoUrl = logoDataUrl;
                    if (logoDataUrl.includes('supabase') || logoDataUrl.includes('remove.bg')) {
                        console.log('🔍 FRENTE - Convertendo URL do Supabase para data URL...');
                        processedLogoUrl = await convertUrlToDataUrl(logoDataUrl);
                    }

                    // 🔍 DIAGNÓSTICO: Log da URL da frente
                    console.log('🔍 FRENTE - URL recebida:', logoDataUrl);
                    console.log('🔍 FRENTE - URL processada:', processedLogoUrl);
                    console.log('🔍 FRENTE - Tipo de URL:', logoDataUrl.startsWith('data:') ? 'Data URL' : 'URL Externa');

                    const img = new window.Image();

                    img.onload = () => {

                        // 🔍 DIAGNÓSTICO: Log das dimensões da imagem
                        console.log('🔍 FRENTE - Dimensões naturais:', {
                            naturalWidth: img.naturalWidth,
                            naturalHeight: img.naturalHeight,
                            ratio: img.naturalWidth / img.naturalHeight
                        });

                        // ✅ Logo proporcional mantendo o aspect ratio real da imagem (igual ao verso)
                        // CORREÇÃO: Para imagens do remove.bg, limitar o tamanho máximo para evitar redimensionamento excessivo
                        const isRemoveBgImage = logoDataUrl.includes('supabase') || logoDataUrl.includes('remove.bg');
                        const logoSizePercent = isRemoveBgImage 
                            ? Math.min(config.logoSize || 60, 80) // Máximo 80% para remove.bg
                            : (config.logoSize || 60); // Normal para upload do usuário
                        const baseWidth = (logoSizePercent / 100) * cardWidth; // largura-alvo (igual ao verso)
                        const imgRatio = (img.naturalWidth && img.naturalHeight)
                            ? (img.naturalWidth / img.naturalHeight)
                            : 1;
                        const logoWidth = Math.round(baseWidth);
                        const logoHeight = Math.round(baseWidth / imgRatio);

                        // 🔍 DIAGNÓSTICO: Log das dimensões calculadas
                        console.log('🔍 FRENTE - Dimensões calculadas:', {
                            logoWidth,
                            logoHeight,
                            baseWidth,
                            logoSizePercent,
                            configLogoSize: config.logoSize,
                            isRemoveBgImage,
                            originalSize: isRemoveBgImage ? 'Limitado para remove.bg' : 'Normal para upload'
                        });
                        
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

                        nfcImg.src = isColorDark(frontContrastHexNfc) ? '/nfc-symbol-white.png' : '/nfc-symbol.png';

                    };

                    img.src = processedLogoUrl;

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

                    nfcImg.src = isColorDark(frontContrastHexNfc) ? '/nfc-symbol-white.png' : '/nfc-symbol.png';

                }

            } else {

                // Desenhar logo no verso

                if (logoDataUrl) {

                    // Para URLs do Supabase (remove.bg), converter para data URL para evitar CORS
                    let processedLogoUrl = logoDataUrl;
                    if (logoDataUrl.includes('supabase') || logoDataUrl.includes('remove.bg')) {
                        console.log('🔍 VERSO - Convertendo URL do Supabase para data URL...');
                        processedLogoUrl = await convertUrlToDataUrl(logoDataUrl);
                    }

                    // 🔍 DIAGNÓSTICO: Log da URL do verso
                    console.log('🔍 VERSO - URL recebida:', logoDataUrl);
                    console.log('🔍 VERSO - URL processada:', processedLogoUrl);
                    console.log('🔍 VERSO - Tipo de URL:', logoDataUrl.startsWith('data:') ? 'Data URL' : 'URL Externa');

                    const img = new window.Image();

                    img.onload = () => {

                        // 🔍 DIAGNÓSTICO: Log das dimensões da imagem
                        console.log('🔍 VERSO - Dimensões naturais:', {
                            naturalWidth: img.naturalWidth,
                            naturalHeight: img.naturalHeight,
                            ratio: img.naturalWidth / img.naturalHeight
                        });

                        // ✅ Logo do verso mantendo o aspect ratio real da imagem
                        // CORREÇÃO: Para imagens do remove.bg, limitar o tamanho máximo para evitar redimensionamento excessivo
                        const isRemoveBgImage = logoDataUrl.includes('supabase') || logoDataUrl.includes('remove.bg');
                        const logoSizePercent = isRemoveBgImage 
                            ? Math.min(config.clientLogoBackSize || 50, 80) // Máximo 80% para remove.bg
                            : (config.clientLogoBackSize || 50); // Normal para upload do usuário
                        const baseWidth = (logoSizePercent / 100) * cardWidth; // largura-alvo
                        const imgRatioBack = (img.naturalWidth && img.naturalHeight)
                            ? (img.naturalWidth / img.naturalHeight)
                            : 1;
                        const logoWidth = Math.round(baseWidth);
                        const logoHeight = Math.round(baseWidth / imgRatioBack);

                        // 🔍 DIAGNÓSTICO: Log das dimensões calculadas
                        console.log('🔍 VERSO - Dimensões calculadas:', {
                            logoWidth,
                            logoHeight,
                            baseWidth,
                            logoSizePercent
                        });
                        
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

                                    // Altura proporcional ao preview (12px em 192px = 6.25%) - 3x maior
                                    const zagHeight = Math.round(36 * (cardHeight / 192));
                                    // Preservar aspect ratio do próprio asset
                                    const zagRatio = (zagImg.naturalWidth && zagImg.naturalHeight)
                                        ? (zagImg.naturalWidth / zagImg.naturalHeight)
                                        : (60 / 18);
                                    const zagWidth = Math.round(zagHeight * zagRatio);
                                    // Usar as mesmas margens do NFC: right = marginRight, bottom = marginTop
                                    const bottomMargin = marginTop; // espelha o top do NFC
                                    const rightMargin = marginRight; // mesma distância da borda direita
                                    // Aproximar mais da borda direita e inferior (12px direita, 8px inferior)
                                    const deltaRight = Math.round(12 * (cardWidth / 320));
                                    const deltaBottom = Math.round(8 * (cardHeight / 192));
                                    ctx.drawImage(zagImg, cardWidth - zagWidth - (rightMargin - deltaRight), cardHeight - zagHeight - (bottomMargin - deltaBottom), zagWidth, zagHeight);
                                    

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

                                zagImg.src = isBackDarkZag ? '/logo-zag-white.png' : '/logo-zag-black.png';

                            };

                            nfcImg.onerror = () => {

                                // Se NFC falhar, tentar logo Zag diretamente

                                const zagImg = new window.Image();

                                zagImg.onload = () => {

                                    // Altura proporcional ao preview (12px em 192px = 6.25%) - 3x maior
                                    const zagHeight = Math.round(36 * (cardHeight / 192));
                                    // Preservar aspect ratio do próprio asset
                                    const zagRatio = (zagImg.naturalWidth && zagImg.naturalHeight)
                                        ? (zagImg.naturalWidth / zagImg.naturalHeight)
                                        : (60 / 18);
                                    const zagWidth = Math.round(zagHeight * zagRatio);
                                    // Usar as mesmas margens do NFC
                                    const marginTop = Math.round(20 * (cardHeight / 192));
                                    const marginRight = Math.round(20 * (cardWidth / 320));
                                    const bottomMargin = marginTop;
                                    const rightMargin = marginRight;
                                    // Aproximar mais da borda direita e inferior (12px direita, 8px inferior)
                                    const deltaRight = Math.round(12 * (cardWidth / 320));
                                    const deltaBottom = Math.round(8 * (cardHeight / 192));
                                    ctx.drawImage(zagImg, cardWidth - zagWidth - (rightMargin - deltaRight), cardHeight - zagHeight - (bottomMargin - deltaBottom), zagWidth, zagHeight);
                                    

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

                                zagImg.src = isBackDarkZag ? '/logo-zag-white.png' : '/logo-zag-black.png';

                            };

                            nfcImg.src = isBackDarkNfc ? '/nfc-symbol-white.png' : '/nfc-symbol.png';

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
                                    // Altura da logo no preview = 12px -> 6.25% da altura (12/192) - 3x maior
                                    const zagHeight = Math.round(36 * (cardHeight / 192));
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

                                zagImg.src = isBackDarkZag ? '/logo-zag-white.png' : '/logo-zag-black.png';

                            };

                            nfcImg.onerror = () => {

                                if (returnAsDataUrl) {

                                    resolve(canvas.toDataURL('image/png'));

                                } else {

                                    downloadCardImage(canvas, 'cartao-verso');

                                    resolve();

                                }

                            };

                            nfcImg.src = isColorDark(frontContrastHexNfc) ? '/nfc-symbol-white.png' : '/nfc-symbol.png';

                        };

                        qrImg.src = qrCodeUrl;

                    };

                    img.src = processedLogoUrl;

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
                                    // Altura da logo no preview = 12px -> 6.25% da altura (12/192) - 3x maior
                                    const zagHeight = Math.round(36 * (cardHeight / 192));
                                    // Preservar aspect ratio do asset
                                    const zagRatio = (zagImg.naturalWidth && zagImg.naturalHeight)
                                        ? (zagImg.naturalWidth / zagImg.naturalHeight)
                                        : (60 / 18);
                                    const zagWidth = Math.round(zagHeight * zagRatio);
                                    // Usar as mesmas margens do NFC
                                    const bottomMargin = Math.round(20 * (cardHeight / 192)); // mesmo que marginTop do NFC
                                    const rightMargin = Math.round(20 * (cardWidth / 320));
                                    // Aproximar mais da borda direita e inferior (12px direita, 8px inferior)
                                    const deltaRight = Math.round(12 * (cardWidth / 320));
                                    const deltaBottom = Math.round(8 * (cardHeight / 192));
                                    ctx.drawImage(zagImg, cardWidth - zagWidth - (rightMargin - deltaRight), cardHeight - zagHeight - (bottomMargin - deltaBottom), zagWidth, zagHeight);
                                

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

                            zagImg.src = isBackDarkZag ? '/logo-zag-white.png' : '/logo-zag-black.png';

                        };

                        nfcImg.onerror = () => {

                            // Se NFC falhar, tentar logo Zag diretamente

                            const zagImg = new window.Image();

                            zagImg.onload = () => {

                                // Manter altura base e preservar aspect ratio do asset - 3x maior
                                const zagHeight = Math.round(36 * (cardHeight / 192));
                                const zagRatio = (zagImg.naturalWidth && zagImg.naturalHeight)
                                    ? (zagImg.naturalWidth / zagImg.naturalHeight)
                                    : (60 / 18);
                                const zagWidth = Math.round(zagHeight * zagRatio);

                                // Posição bottom-right com escala correta
// Aproximar mais da borda direita e inferior (12px direita, 8px inferior)
const deltaRight = Math.round(12 * (cardWidth / 320));
const deltaBottom = Math.round(8 * (cardHeight / 192));
ctx.drawImage(zagImg, cardWidth - zagWidth - (20 - deltaRight), cardHeight - zagHeight - (20 - deltaBottom), zagWidth, zagHeight);
                                

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

                            zagImg.src = isBackDarkZag ? '/logo-zag-white.png' : '/logo-zag-black.png';

                        };

                        nfcImg.src = isBackDarkNfc ? '/nfc-symbol-white.png' : '/nfc-symbol.png';

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

                                const zagHeight = Math.round(36 * (cardHeight / 192));
                                const zagRatio = (zagImg.naturalWidth && zagImg.naturalHeight)
                                    ? (zagImg.naturalWidth / zagImg.naturalHeight)
                                    : (60 / 18);
                                const zagWidth = Math.round(zagHeight * zagRatio);

                                // Posição bottom-right com escala correta
// Aproximar mais da borda direita e inferior (12px direita, 8px inferior)
const deltaRight = Math.round(12 * (cardWidth / 320));
const deltaBottom = Math.round(8 * (cardHeight / 192));
ctx.drawImage(zagImg, cardWidth - zagWidth - (20 - deltaRight), cardHeight - zagHeight - (20 - deltaBottom), zagWidth, zagHeight);
                                

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

                            zagImg.src = isBackDarkZag ? '/logo-zag-white.png' : '/logo-zag-black.png';

                        };

                        nfcImg.onerror = () => {

                            if (returnAsDataUrl) {

                                resolve(canvas.toDataURL('image/png'));

                            } else {

                                downloadCardImage(canvas, 'cartao-verso');

                                resolve();

                            }

                        };

                        nfcImg.src = isColorDark(frontContrastHexNfc) ? '/nfc-symbol-white.png' : '/nfc-symbol.png';

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

        } catch (err) {
console.error('Error clearing localStorage:', err);

        




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

            cardBackBgColor: '#FFFFFF',

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

        } catch (err) {
console.error('Erro ao verificar subdomínio:', err);
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

            // Verificar qualidade da imagem
            const img: HTMLImageElement = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (ctx) {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    // Verificar resolução mínima (exemplo: 100x100 pixels)
                    if (img.width < 200 || img.height < 200) {
                        alert('⚠️ Atenção: A imagem parece ter baixa resolução. Para melhor qualidade, recomendamos usar imagens com pelo menos 200x200 pixels.');
                    }
                    
                    // Verificar se a imagem é muito pequena em relação ao tamanho do arquivo
                    const pixelsPerKB = (img.width * img.height) / (file.size / 1024);
                    if (pixelsPerKB < 20) {
                        alert('⚠️ Atenção: A qualidade da imagem pode estar comprometida. Recomendamos usar imagens com melhor resolução.');
                    }
                }
            };
            
            img.src = URL.createObjectURL(file);

            const reader = new FileReader();

            reader.onload = async (event) => {

                const originalDataUrl = event.target?.result as string;

                // Otimizar a imagem antes de definir

                const optimizedDataUrl = await optimizeImage(originalDataUrl);

                setLogoDataUrl(optimizedDataUrl);

                // 🎨 NOVA FUNCIONALIDADE: Detectar cor predominante e aplicar automaticamente
                await detectAndApplyBackgroundColor(optimizedDataUrl);

            };

            reader.readAsDataURL(file);

        }

    };



    const handleNextStep = async () => {
        if (!logoDataUrl) {

            alert('É necessário fazer o upload de uma logo.');

            return;

        }

        if (!subdomain.trim()) {

            alert('É necessário preencher o subdomínio.');

            return;

        }

        // Gate: verificar créditos antes de prosseguir à confirmação
        try {
            const { data: { user } } = await createClientComponentClient().auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            const supabase = createClientComponentClient();
            // Verificar perfil do usuário para obter créditos disponíveis
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_status, subscription_plan, max_pages')
                .eq('id', user.id)
                .single();

            // Se o usuário tem assinatura ativa, usar max_pages do perfil
            // Caso contrário, calcular baseado nos pagamentos confirmados
            let totalCredits = 0;
            
            if (profile?.subscription_status === 'active' && profile?.max_pages) {
                totalCredits = profile.max_pages;
            } else {
                // Fallback: calcular baseado nos pagamentos confirmados
                const { data: payments } = await supabase
                    .from('payments')
                    .select('status, plan_type')
                    .eq('user_id', user.id);

                const confirmed = (payments || []).filter(p => p.status === 'RECEIVED' || p.status === 'CONFIRMED');
                const planCredits: Record<string, number> = { para_mim: 1, para_equipe: 2, para_negocio: 8 };
                totalCredits = confirmed.reduce((sum, p) => sum + (planCredits[p.plan_type] || 0), 0);
            }
            const { data: pagesData } = await supabase
                .from('pages')
                .select('id')
                .eq('user_id', user.id);
            const used = (pagesData || []).length;
            if (totalCredits <= used) {
                router.push('/create-page');
                return;
            }
        } catch (e) {
            console.error('Erro ao verificar créditos:', e);
            alert('Não foi possível verificar seus créditos. Tente novamente.');
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

        } catch (err) {
console.error('Erro ao processar layout:', err);
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

    // 💰 Função para adicionar botão PIX personalizado
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

        // 💰 Criar botão PIX diretamente com funcionalidade inline
        const newPixButton: CustomLink = {
            id: Date.now(),
            text: 'Pix Copia e Cola', // Texto fixo
            url: 'Digite sua chave PIX', // Chave PIX vai na URL
            icon: 'pix',
            isSocial: false,
            styleType: 'solid',
            bgColor1: '#32BCAD',
            bgColor2: '#32BCAD',
            textColor: '#ffffff'
        };
        
        setConfig(prev => ({
            ...prev,
            customLinks: [...(prev.customLinks || []), newPixButton]
        }));

        // 🎯 Auto-editar o botão PIX recém-criado
        setTimeout(() => {
            startEditingButton(newPixButton.id, newPixButton.text, newPixButton.url);
        }, 100);
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

    // ✏️ Funções para edição inline
    const startEditingTitle = () => {
        setTempTitleText(config.landingPageTitleText || '');
        setIsEditingTitle(true);
    };

    const startEditingSubtitle = () => {
        setTempSubtitleText(config.landingPageSubtitleText || '');
        setIsEditingSubtitle(true);
    };

    const saveTitleEdit = () => {
        if (tempTitleText.trim()) {
            handleConfigChange('landingPageTitleText', tempTitleText.trim());
        }
        setIsEditingTitle(false);
    };

    const saveSubtitleEdit = () => {
        handleConfigChange('landingPageSubtitleText', tempSubtitleText.trim());
        setIsEditingSubtitle(false);
    };

    const cancelTitleEdit = () => {
        setTempTitleText('');
        setIsEditingTitle(false);
    };

    const cancelSubtitleEdit = () => {
        setTempSubtitleText('');
        setIsEditingSubtitle(false);
    };

    // 🔧 Funções para edição inline dos botões
    const startEditingButton = (buttonId: number, currentText: string, currentUrl: string) => {
        setEditingButtonId(buttonId);
        
        // 💰 Tratamento especial para PIX - carregar chave PIX no campo correto
        const link = config.customLinks?.find(l => l.id === buttonId);
        if (link?.icon === 'pix') {
            setTempButtonText('Pix Copia e Cola'); // Texto fixo
            setTempButtonUrl(currentUrl); // Chave PIX vai na URL
        } else if (link?.icon === 'user-plus') {
            // 📞 Tratamento especial para Salvar Contato
            setTempButtonText('Salvar Contato'); // Texto fixo
            // Remove o prefixo "tel:+" para mostrar apenas o número
            const phoneNumber = currentUrl.replace(/^tel:\+?/, '');
            setTempButtonUrl(phoneNumber); // Número limpo para edição
        } else {
            setTempButtonText(currentText);
            setTempButtonUrl(currentUrl);
        }
    };

    const saveButtonEdit = () => {
        if (editingButtonId !== null) {
            const link = config.customLinks?.find(l => l.id === editingButtonId);
            // 💰 Para PIX, validar a chave PIX (URL), não o texto
            // 📞 Para Salvar Contato, validar o número (URL), não o texto
            const isValid = (link?.icon === 'pix' || link?.icon === 'user-plus') ? tempButtonUrl.trim() : tempButtonText.trim();
            
            if (!isValid) return;
            setConfig((prev) => ({
                ...prev,
                customLinks: prev.customLinks?.map(link => {
                    if (link.id === editingButtonId) {
                        // 📞 Tratamento especial para Salvar Contato
                        if (link.icon === 'user-plus') {
                            return { 
                                ...link, 
                                text: 'Salvar Contato', // Texto fixo
                                url: `tel:+${tempButtonUrl.trim()}` // Formata como tel:+número
                            };
                        }
                        // 💰 Tratamento especial para PIX - manter texto fixo, editar apenas chave
                        if (link.icon === 'pix') {
                            return { 
                                ...link, 
                                text: 'Pix Copia e Cola', // Texto sempre fixo
                                url: tempButtonUrl.trim() // Chave PIX vai na URL
                            };
                        }
                        return { ...link, text: tempButtonText.trim(), url: tempButtonUrl.trim() };
                    }
                    return link;
                }) || []
            }));
        }
        setEditingButtonId(null);
        setTempButtonText('');
        setTempButtonUrl('');
    };

    const cancelButtonEdit = () => {
        setEditingButtonId(null);
        setTempButtonText('');
        setTempButtonUrl('');
    };

    // 💰 Função específica para PIX - Copiar chave para clipboard
    const copyPixToClipboard = async (pixKey: string) => {
        try {
            await navigator.clipboard.writeText(pixKey);
            
            // 🎯 Feedback apenas na página publicada (não na visualização)
            // A mensagem será implementada na página publicada
            console.log('PIX copiado para clipboard:', pixKey);
            
        } catch (error) {
            console.error('Erro ao copiar PIX:', error);
            alert('Erro ao copiar chave PIX. Tente novamente.');
        }
    };

    // 📞 Função específica para Salvar Contato - Direcionar para página de contatos
    const openContactPage = (phoneNumber: string) => {
        try {
            // Obter o título da página
            const pageTitle = config.landingPageTitleText || 'Contato';
            
            // Criar URL para adicionar contato com dados preenchidos
            const contactUrl = `tel:${phoneNumber}`;
            
            // Para dispositivos móveis, tentar abrir o app de contatos
            if (navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)) {
                // Tentar abrir o app de contatos nativo
                window.location.href = contactUrl;
            } else {
                // Para desktop, copiar informações para clipboard
                const contactInfo = `Nome: ${pageTitle}\nTelefone: ${phoneNumber}`;
                navigator.clipboard.writeText(contactInfo).then(() => {
                    alert(`Informações do contato copiadas:\n${contactInfo}\n\nCole no seu app de contatos.`);
                }).catch(() => {
                    alert(`Contato: ${pageTitle}\nTelefone: ${phoneNumber}`);
                });
            }
            
        } catch (error) {
            console.error('Erro ao abrir página de contatos:', error);
            alert('Erro ao abrir página de contatos. Tente novamente.');
        }
    };



    // Garantir que a página sempre comece limpa

    useEffect(() => {

        // Limpar qualquer localStorage existente

        try {

            localStorage.removeItem('zag-dashboard-config');

        } catch (err) {
console.error('Error clearing localStorage:', err);

        




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

            cardBackBgColor: '#FFFFFF',

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

            } catch (err) {
console.error('Erro ao carregar dados do usuário:', err);

            




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

            'share': { text: 'Compartilhar', url: '#', icon: 'share', color: '#8B5CF6' },

        } as const;

        

        // Verificar se já existe um botão deste tipo

        const existingButton = config.customLinks?.find(link => link.isSocial && link.icon === presets[kind].icon);

        if (existingButton) {

            alert(`Já existe um botão ${presets[kind].text} adicionado. Você pode editar ou remover o existente.`);

            return;

        }

        

        const p = presets[kind];

        const globalColor = config.socialButtonColor || '#3B82F6';

        // 🔧 NOVA FUNCIONALIDADE: Criar botão social simplificado com placeholder
        const placeholders: { [key: string]: string } = {
            whatsapp: 'Ex: 11999999999',
            instagram: 'Ex: @seuusuario', 
            youtube: 'Ex: @seucanal',
            linkedin: 'Ex: seuusuario',
            'save-contact': '(61)981938165',
            share: '' // Botão de compartilhar não precisa de placeholder
        };

        // Para botão de compartilhar, adicionar automaticamente sem formulário
        if (kind === 'share') {
            const shareBtn = { 
                text: 'Compartilhar', 
                url: 'share:', 
                icon: 'share', 
                styleType: 'solid' as const,
                bgColor1: '#8B5CF6',
                bgColor2: '#8B5CF6',
                textColor: '#ffffff',
                isSocial: true,
                id: Date.now()
            };

            setConfig(prev => ({
                ...prev,
                customLinks: [...(prev.customLinks || []), shareBtn]
            }));
            
            return; // Não abrir formulário para botão de compartilhar
        }

        // Para outros botões, usar a lógica normal com formulário
        const newBtn = { 
            text: placeholders[kind] || p.text, 
            url: p.url, 
            icon: p.icon, 
            styleType: 'solid' as const, 
            bgColor1: globalColor, 
            bgColor2: globalColor, 
            textColor: '#ffffff', 
            isSocial: true 
        };

        const newLink = { ...newBtn, id: Date.now() };

        setConfig(prev => ({ ...prev, customLinks: [...(prev.customLinks || []), newLink] }));

        // 🎯 Auto-editar o botão recém-criado para facilitar a edição
        setTimeout(() => {
            startEditingButton(newLink.id, newLink.text, newLink.url);
        }, 100);

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

                                        <h3 className="text-center font-bold text-lg flex-1">Personalizar Frente</h3>

                                        {logoDataUrl && (

                                            <button

                                                onClick={() => {

                                                    setLogoDataUrl(null);
                                                    setProcessedLogoUrl(null);

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

                                    <div 
                                        style={{ backgroundColor: config.cardBgColor }} 
                                        className="w-80 h-48 mx-auto rounded-xl shadow-lg relative p-4 transition-colors duration-300 border overflow-hidden card-preview"
                                        data-debug-color={config.cardBgColor}
                                        onLoad={() => {
                                            console.log('🎨 PREVIEW CARREGADO:', {
                                                backgroundColor: config.cardBgColor,
                                                element: 'preview-1',
                                                timestamp: new Date().toISOString()
                                            });
                                        }}
                                        onMouseEnter={() => {
                                            console.log('🎨 PREVIEW HOVER:', {
                                                backgroundColor: config.cardBgColor,
                                                element: 'preview-1',
                                                timestamp: new Date().toISOString()
                                            });
                                        }}
                                        onMouseLeave={() => {
                                            console.log('🎨 PREVIEW LEAVE:', {
                                                backgroundColor: config.cardBgColor,
                                                element: 'preview-1',
                                                timestamp: new Date().toISOString()
                                            });
                                        }}
                                        onFocus={() => {
                                            console.log('🎨 PREVIEW FOCUS:', {
                                                backgroundColor: config.cardBgColor,
                                                element: 'preview-1',
                                                timestamp: new Date().toISOString()
                                            });
                                        }}
                                        onBlur={() => {
                                            console.log('🎨 PREVIEW BLUR:', {
                                                backgroundColor: config.cardBgColor,
                                                element: 'preview-1',
                                                timestamp: new Date().toISOString()
                                            });
                                        }}
                                    >

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

                                                    src={processedLogoUrl || logoDataUrl} 

                                                    alt="Logo Preview" 

                                                    width={150} 

                                                    height={150} 

                                                    className="w-full h-full image-transparent object-contain" 

                                                    style={{ 

                                                filter: 'none',

                                                        mixBlendMode: 'normal',

                                                        background: 'transparent',
                                                        
                                                        imageRendering: (logoDataUrl.includes('supabase') || logoDataUrl.includes('remove.bg')) ? 'crisp-edges' : 'auto'

                                                }}

                                                    onLoad={(e) => {
                                                        const img = e.target as HTMLImageElement;
                                                        console.log('🔍 FRENTE-PREVIEW - Dimensões:', {
                                                            offsetWidth: img.offsetWidth,
                                                            offsetHeight: img.offsetHeight,
                                                            naturalWidth: img.naturalWidth,
                                                            naturalHeight: img.naturalHeight,
                                                            src: img.src,
                                                            className: img.className,
                                                            style: img.style.cssText,
                                                            parentWidth: img.parentElement?.offsetWidth,
                                                            parentHeight: img.parentElement?.offsetHeight,
                                                            isRemoveBg: (processedLogoUrl || logoDataUrl)?.includes('supabase') || (processedLogoUrl || logoDataUrl)?.includes('remove.bg'),
                                                            urlType: img.src.startsWith('data:') ? 'Data URL' : 'URL Externa'
                                                        });
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

                                            src={isFrontDarkNfc ? '/nfc-symbol-white.png' : '/nfc-symbol.png'} 

                                            alt="NFC" 

                                            width={24} 

                                            height={24} 

                                            className="absolute top-5 right-5 w-6 h-6 object-contain opacity-80" 

                                        />

                                    </div>

                                    <div className="mt-6 space-y-4 max-w-sm mx-auto">

                                        {/* 🎨 Feedback visual da detecção automática de cor */}
                                        {showColorDetectionFeedback && autoDetectedColor && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 animate-fade-in">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-4 h-4 rounded-full border border-gray-300"
                                                        style={{ backgroundColor: autoDetectedColor }}
                                                    ></div>
                                                    <span className="text-sm text-green-700 font-medium">
                                                        Cor detectada automaticamente!
                                                    </span>
                                                </div>
                                                <p className="text-xs text-green-600 mt-1">
                                                    O fundo do cartão foi ajustado para combinar com sua imagem
                                                </p>
                                            </div>
                                        )}

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
                                                <input 
                                                    type="color" 
                                                    value={config.cardBgColor} 
                                                    onChange={(e) => handleConfigChange('cardBgColor', e.target.value)} 
                                                    className="w-full h-6 border border-slate-300 rounded-md"
                                                    data-debug-color={config.cardBgColor}
                                                />
                                            </div>

                                            <div>

                                                <label className="block text-xs font-medium text-slate-700 mb-1">Cor do Texto</label>
                                                <input type="color" value={config.cardTextColor} onChange={(e) => handleConfigChange('cardTextColor', e.target.value)} className="w-full h-6 border border-slate-300 rounded-md" />
                                            </div>

                                            <div>

                                                <label className="block text-xs font-medium text-slate-700 mb-1">Remover Fundo</label>
                                                <BackgroundRemovalButton 
                                                    onImageProcessed={(url) => {
                                                        console.log('🔍 REMOVEBG - URL recebida:', url);
                                                        console.log('🔍 REMOVEBG - Tipo:', url.startsWith('data:') ? 'Data URL' : 'URL Externa');
                                                        console.log('🔍 REMOVEBG - Tamanho:', url.length);
                                                        setLogoDataUrl(url);
                                                        setProcessedLogoUrl(url);
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

                                    <h3 className="text-center font-bold text-lg mb-4">Personalizar Verso</h3>

                                    <div style={{ backgroundColor: config.cardBackBgColor }} className="w-80 h-48 mx-auto rounded-xl shadow-lg p-4 border relative overflow-hidden card-preview">

                                        {logoDataUrl && (

                                            <Image 
                                                src={processedLogoUrl || logoDataUrl} 
                                                alt="Logo Verso" 
                                                width={150} 
                                                height={150} 
                                                className="object-contain absolute transition-all duration-300 image-transparent" 
                                                style={{ 
                                                    width: `${config.clientLogoBackSize}%`, 
                                                    top: '50%', 
                                                    left: `${50 + (config.logoPositionBack ?? 0) * 1.2}%`, 
                                                    transform: `translate(-50%, -50%) rotate(${config.logoRotationBack || 0}deg)`, 
                                                    opacity: config.logoOpacityBack ?? 0.3, 
                                                    background: 'transparent' 
                                                }} 
                                                onLoad={(e) => {
                                                    const img = e.target as HTMLImageElement;
                                                    console.log('🔍 VERSO-PREVIEW - Dimensões:', {
                                                        offsetWidth: img.offsetWidth,
                                                        offsetHeight: img.offsetHeight,
                                                        naturalWidth: img.naturalWidth,
                                                        naturalHeight: img.naturalHeight,
                                                        src: img.src,
                                                        className: img.className,
                                                        style: img.style.cssText,
                                                        parentWidth: img.parentElement?.offsetWidth,
                                                        parentHeight: img.parentElement?.offsetHeight
                                                    });
                                                }}
                                            />

                                        )}

                                        <div className={`absolute inset-0 p-4 flex items-center ${config.qrCodePosition}`}>

                                            <div
                                                ref={qrcodePreviewRef}
                                                className={`${!subdomain ? 'bg-slate-200' : 'bg-white'} p-1 rounded-md aspect-square`}
                                                style={{ width: `${config.qrCodeSize}%` }}
                                            />

                                        </div>

                                        {/* Logo Zag fixa no canto inferior direito - alterna conforme contraste */}
                                        <Image 

                                            src={isBackDarkZag ? '/logo-zag-white.png' : '/logo-zag-black.png'} 

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

                                        {/* Símbolo NFC fixo no canto superior direito - alterna conforme contraste */}

                                        <Image 

                                            src={isBackDarkNfc ? '/nfc-symbol-white.png' : '/nfc-symbol.png'} 

                                            alt="NFC" 

                                            width={24} 

                                            height={24} 

                                            className="absolute top-5 right-5 w-6 h-6 object-contain opacity-80" 

                                        />

                                    </div>

                                    <div className="mt-6 space-y-4 max-w-sm mx-auto">

                                        

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
                                                data-debug-color={config.cardBgColor}
                                                onLoad={() => {
                                                    console.log('🎨 PREVIEW CARREGADO:', {
                                                        backgroundColor: config.cardBgColor,
                                                        element: 'preview-2',
                                                        timestamp: new Date().toISOString()
                                                    });
                                                }}
                                                onMouseEnter={() => {
                                                    console.log('🎨 PREVIEW HOVER:', {
                                                        backgroundColor: config.cardBgColor,
                                                        element: 'preview-2',
                                                        timestamp: new Date().toISOString()
                                                    });
                                                }}
                                                onMouseLeave={() => {
                                                    console.log('🎨 PREVIEW LEAVE:', {
                                                        backgroundColor: config.cardBgColor,
                                                        element: 'preview-2',
                                                        timestamp: new Date().toISOString()
                                                    });
                                                }}
                                                onFocus={() => {
                                                    console.log('🎨 PREVIEW FOCUS:', {
                                                        backgroundColor: config.cardBgColor,
                                                        element: 'preview-2',
                                                        timestamp: new Date().toISOString()
                                                    });
                                                }}
                                                onBlur={() => {
                                                    console.log('🎨 PREVIEW BLUR:', {
                                                        backgroundColor: config.cardBgColor,
                                                        element: 'preview-2',
                                                        timestamp: new Date().toISOString()
                                                    });
                                                }}
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
                                                <Image 

                                                    src={isFrontDarkNfc ? '/nfc-symbol-white.png' : '/nfc-symbol.png'} 

                                                    alt="NFC" 

                                                    width={24} 

                                                    height={24} 

                                                    className="absolute top-5 right-5 w-6 h-6 object-contain opacity-80" 

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
                                                {/* Logo Zag fixa no canto inferior direito - alterna conforme contraste */}
                                                <Image 

                                                    src={isBackDarkZag ? '/logo-zag-white.png' : '/logo-zag-black.png'} 

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

                                                {/* Símbolo NFC fixo no canto superior direito - alterna conforme contraste */}

                                                <Image 

                                                    src={isBackDarkNfc ? '/nfc-symbol-white.png' : '/nfc-symbol.png'} 

                                                    alt="NFC" 

                                                    width={24} 

                                                    height={24} 

                                                    className="absolute top-5 right-5 w-6 h-6 object-contain opacity-80" 

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
                                                    
                                                    {/* Botão de remover banner (aparece no canto superior direito) */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleConfigChange('landingPageBannerUrl', '');
                                                        }}
                                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md z-10"
                                                        title="Remover banner"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                    
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

                                                    <div className="relative group">
                                                        <Image src={config.landingPageLogoUrl || logoDataUrl || ''} alt="Logo Preview" width={config.landingPageLogoSize || 96} height={config.landingPageLogoSize || 96} className={`object-cover mx-auto shadow-md image-transparent ${config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`} style={{ background: 'transparent' }} />
                                                        
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

                                                ) : (

                                                    <div className={`w-24 h-24 bg-slate-200 flex items-center justify-center shadow-md ${config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`}>

                                                        <ImageIcon className="w-8 h-8 text-slate-400" />

                                                    </div>

                                                )}
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

                                            {/* Botões Salvar Contato e Compartilhar - Posicionados entre logo e título */}
                                            <div 
                                                className="flex justify-center items-center gap-3 mb-4 relative"
                                                style={{ 
                                                    marginTop: `calc(64px + ${(config.landingPageLogoSize || 96) / 2}px + 15px)`,
                                                    zIndex: 30
                                                }}
                                            >
                                                {config.customLinks?.filter(link => link.isSocial && (link.icon === 'user-plus' || link.icon === 'share')).map((link) => {
                                                    const globalColor = config.socialButtonColor || '#3B82F6';
                                                    const isPillButton = link.icon === 'user-plus';

                                                    return (
                                                        <div key={link.id}>
                                                            {editingButtonId === link.id && link.icon !== 'share' ? (
                                                                link.icon === 'user-plus' ? (
                                                                    // 📞 Interface especial para Salvar Contato - apenas número de telefone
                                                                    <input
                                                                        type="text"
                                                                        value={tempButtonUrl.replace('tel:', '')}
                                                                        onChange={(e) => setTempButtonUrl('tel:' + e.target.value)}
                                                                        onBlur={saveButtonEdit}
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                saveButtonEdit();
                                                                            } else if (e.key === 'Escape') {
                                                                                cancelButtonEdit();
                                                                            }
                                                                        }}
                                                                        className="h-8 px-3 rounded-full text-xs font-medium bg-white border-2 border-dashed border-blue-400 focus:outline-none focus:border-blue-500"
                                                                        placeholder="(61)981938165"
                                                                        autoFocus
                                                                    />
                                                                ) : (
                                                                    // Interface normal para outros botões sociais
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="text"
                                                                            value={tempButtonText}
                                                                            onChange={(e) => setTempButtonText(e.target.value)}
                                                                            onBlur={saveButtonEdit}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    saveButtonEdit();
                                                                                } else if (e.key === 'Escape') {
                                                                                    cancelButtonEdit();
                                                                                }
                                                                            }}
                                                                            className="h-8 px-3 rounded-full text-xs font-medium bg-white border-2 border-dashed border-blue-400 focus:outline-none focus:border-blue-500"
                                                                            placeholder="Digite o texto..."
                                                                            autoFocus
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            value={tempButtonUrl}
                                                                            onChange={(e) => setTempButtonUrl(e.target.value)}
                                                                            onBlur={saveButtonEdit}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    saveButtonEdit();
                                                                                } else if (e.key === 'Escape') {
                                                                                    cancelButtonEdit();
                                                                                }
                                                                            }}
                                                                            className="h-8 px-3 rounded-full text-xs font-medium bg-white border-2 border-dashed border-blue-400 focus:outline-none focus:border-blue-500"
                                                                            placeholder="Digite a URL..."
                                                                        />
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <div 
                                                            className={`${
                                                                isPillButton 
                                                                            ? 'h-8 px-3 rounded-full gap-1 font-medium cursor-pointer border-2 border-dashed border-transparent hover:border-blue-300 transition-all duration-200 hover:bg-blue-50' 
                                                                            : 'w-8 h-8 rounded-full cursor-pointer border-2 border-dashed border-transparent hover:border-blue-300 transition-all duration-200 hover:bg-blue-50'
                                                                    } flex items-center justify-center text-white shadow-md inline-editable`}
                                                            style={{ background: link.styleType === 'gradient' ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` : globalColor }}
                                                                    onClick={() => {
                                                                        if (link.icon === 'share') {
                                                                            // Para botão de compartilhar, mostrar feedback em vez de editar
                                                                            alert('Botão de compartilhar configurado automaticamente!');
                                                                        } else {
                                                                            startEditingButton(link.id, link.text, link.url);
                                                                        }
                                                                    }}
                                                                    title={link.icon === 'share' ? 'Compartilhar configurado automaticamente' : 'Clique para editar'}
                                                        >
                                                            {link.icon ? (
                                                                <IconForName name={link.icon as IconName} size={isPillButton ? 14 : 16} />
                                                            ) : (
                                                                <span className="text-xs font-bold">?</span>
                                                            )}
                                                            {isPillButton && <span className="text-xs whitespace-nowrap">{link.text}</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex flex-col items-center text-center relative" style={{ zIndex: 30, marginTop: '8px' }}>

                                                {/* ✏️ Título editável inline */}
                                                {isEditingTitle ? (
                                                    <div className="w-full mb-1">
                                                        <input
                                                            type="text"
                                                            value={tempTitleText}
                                                            onChange={(e) => setTempTitleText(e.target.value)}
                                                            onBlur={saveTitleEdit}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    saveTitleEdit();
                                                                } else if (e.key === 'Escape') {
                                                                    cancelTitleEdit();
                                                                }
                                                            }}
                                                            className="w-full text-xl font-bold text-center bg-transparent border-2 border-dashed border-blue-400 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
                                                            style={{ 
                                                                fontFamily: `var(--font-${(config.landingFont || 'Inter').toLowerCase().replace(' ', '-')})`, 
                                                                color: config.landingPageTitleColor || '#1e293b' 
                                                            }}
                                                            autoFocus
                                                            placeholder="Digite o título aqui..."
                                                        />
                                                    </div>
                                                ) : (
                                                    <h1 
                                                        className="text-xl font-bold break-words mb-1 cursor-pointer border-2 border-dashed border-transparent rounded-lg px-2 py-1 inline-editable"
                                                        style={{ 
                                                            fontFamily: `var(--font-${(config.landingFont || 'Inter').toLowerCase().replace(' ', '-')})`, 
                                                            color: config.landingPageTitleColor || '#1e293b' 
                                                        }}
                                                        onClick={startEditingTitle}
                                                        title="Clique para editar o título"
                                                    >
                                                        {config.landingPageTitleText || 'Bem-vindo(a)!'}
                                                    </h1>
                                                )}

                                                {/* ✏️ Subtítulo editável inline */}
                                                {isEditingSubtitle ? (
                                                    <div className="w-full mb-4">
                                                        <input
                                                            type="text"
                                                            value={tempSubtitleText}
                                                            onChange={(e) => setTempSubtitleText(e.target.value)}
                                                            onBlur={saveSubtitleEdit}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    saveSubtitleEdit();
                                                                } else if (e.key === 'Escape') {
                                                                    cancelSubtitleEdit();
                                                                }
                                                            }}
                                                            className="w-full text-sm text-center bg-transparent border-2 border-dashed border-blue-400 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
                                                            style={{ 
                                                                fontFamily: `var(--font-${(config.landingFont || 'Inter').toLowerCase().replace(' ', '-')})`, 
                                                                color: config.landingPageSubtitleColor || '#64748b' 
                                                            }}
                                                            autoFocus
                                                            placeholder="Digite o subtítulo aqui..."
                                                        />
                                                    </div>
                                                ) : (
                                                    <div 
                                                        className="w-full mb-4 cursor-pointer border-2 border-dashed border-transparent rounded-lg px-2 py-1 inline-editable relative group"
                                                        onClick={startEditingSubtitle}
                                                        title="Clique para editar o subtítulo"
                                                    >
                                                        {config.landingPageSubtitleText ? (
                                                            <>
                                                                <p 
                                                                    className="text-sm px-2 break-words" 
                                                                    style={{ 
                                                                        fontFamily: `var(--font-${(config.landingFont || 'Inter').toLowerCase().replace(' ', '-')})`, 
                                                                        color: config.landingPageSubtitleColor || '#64748b' 
                                                                    }}
                                                                >
                                                                    {config.landingPageSubtitleText}
                                                                </p>
                                                                
                                                                {/* Botão de remover subtítulo (aparece no canto superior direito) */}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleConfigChange('landingPageSubtitleText', '');
                                                                    }}
                                                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                                                                    title="Remover subtítulo"
                                                                >
                                                                    <Trash2 size={10} />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <p 
                                                                className="text-sm px-2 break-words inline-editable-placeholder" 
                                                                style={{ 
                                                                    fontFamily: `var(--font-${(config.landingFont || 'Inter').toLowerCase().replace(' ', '-')})` 
                                                                }}
                                                            >
                                                                Clique para adicionar um subtítulo...
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Outros Botões Sociais (exceto salvar-contato e compartilhar) */}
                                                <div className="w-full flex flex-wrap justify-center items-center gap-3 mb-4">

                                                    {config.customLinks?.filter(link => link.isSocial && link.icon !== 'user-plus' && link.icon !== 'share').map((link) => {

                                                        const globalColor = config.socialButtonColor || '#3B82F6';

                                                        return (
                                                            <div key={link.id}>
                                                                {editingButtonId === link.id ? (
                                                                    <div className="flex flex-col items-center gap-2">
                                                                        {link.icon === 'pix' ? (
                                                                            // 💰 Interface específica para editar PIX
                                                                            <div className="flex flex-col items-center gap-3 p-3 bg-white border-2 border-dashed border-blue-400 rounded-lg">
                                                                                <input
                                                                                    type="text"
                                                                                    value={tempButtonText}
                                                                                    onChange={(e) => setTempButtonText(e.target.value)}
                                                                                    onBlur={saveButtonEdit}
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') {
                                                                                            saveButtonEdit();
                                                                                        } else if (e.key === 'Escape') {
                                                                                            cancelButtonEdit();
                                                                                        }
                                                                                    }}
                                                                                    className="w-48 h-8 px-3 rounded-lg text-sm font-medium bg-white border border-gray-300 focus:outline-none focus:border-blue-500 text-center"
                                                                                    placeholder="Digite sua chave PIX"
                                                                                    autoFocus
                                                                                />
                                                                                <div className="flex items-center gap-2">
                                                                                    <label className="text-xs text-gray-600">Cor do botão:</label>
                                                                                    <input
                                                                                        type="color"
                                                                                        value={link.bgColor1 || '#32BCAD'}
                                                                                        onChange={(e) => {
                                                                                            setConfig(prev => ({
                                                                                                ...prev,
                                                                                                customLinks: prev.customLinks?.map(l => 
                                                                                                    l.id === link.id 
                                                                                                        ? { ...l, bgColor1: e.target.value, bgColor2: e.target.value }
                                                                                                        : l
                                                                                                ) || []
                                                                                            }));
                                                                                        }}
                                                                                        className="w-8 h-6 border border-gray-300 rounded"
                                                                                    />
                                                                                </div>
                                                                                <div className="flex gap-2">
                                                                                    <button
                                                                                        onClick={saveButtonEdit}
                                                                                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                                                    >
                                                                                        Salvar
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={cancelButtonEdit}
                                                                                        className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                                                                    >
                                                                                        Cancelar
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <input
                                                                                type="text"
                                                                                value={link.icon === 'user-plus' ? tempButtonUrl : tempButtonText}
                                                                                onChange={(e) => link.icon === 'user-plus' ? setTempButtonUrl(e.target.value) : setTempButtonText(e.target.value)}
                                                                                onBlur={saveButtonEdit}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') {
                                                                                        saveButtonEdit();
                                                                                    } else if (e.key === 'Escape') {
                                                                                        cancelButtonEdit();
                                                                                    }
                                                                                }}
                                                                                className="w-32 h-8 px-2 rounded-full text-xs font-medium bg-white border-2 border-dashed border-blue-400 focus:outline-none focus:border-blue-500 text-center"
                                                                                placeholder={link.icon === 'user-plus' ? 'Ex: 11999999999' : 'Usuário/Telefone...'}
                                                                                autoFocus
                                                                            />
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div 
                                                                        className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer border-2 border-dashed border-transparent hover:border-blue-300 transition-all duration-200 hover:bg-blue-50 inline-editable"
                                                                style={{ background: link.styleType === 'gradient' ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` : globalColor }}
                                                                        onClick={() => {
                                                                            // 💰 Comportamento específico para PIX
                                                                            if (link.icon === 'pix') {
                                                                                copyPixToClipboard(link.text);
                                                                            } else {
                                                                                startEditingButton(link.id, link.text, link.url);
                                                                            }
                                                                        }}
                                                                        onDoubleClick={() => {
                                                                            // 💰 Duplo clique no PIX para editar
                                                                            if (link.icon === 'pix') {
                                                                                startEditingButton(link.id, link.text, link.url);
                                                                            }
                                                                        }}
                                                                        title={link.icon === 'pix' ? 'Clique para copiar PIX • Duplo clique para editar chave e cor' : 'Clique para editar'}
                                                                    >
                                                            {link.icon ? (
                                                                <IconForName name={link.icon as IconName} size={20} />
                                                            ) : (
                                                                <span className="text-xs font-bold">?</span>
                                                            )}
                                                        </div>
                                                                )}
                                                            </div>
                                                        );

                                                    })}

                                                </div>

                                                

                                                {/* Botões Personalizados (Retangulares) */}

                                                <div className="w-full flex flex-col items-center gap-2">

                                                    {config.customLinks?.filter(link => !link.isSocial).map((link) => (
                                                        <div key={link.id}>
                                                            {editingButtonId === link.id ? (
                                                                <div className="flex flex-col items-center gap-2">
                                                                    {link.icon === 'pix' ? (
                                                                        // 💰 Interface específica para editar PIX
                                                                        <div className="flex flex-col items-center gap-3 p-3 bg-white border-2 border-dashed border-blue-400 rounded-lg">
                                                                            <div className="text-center">
                                                                                <p className="text-sm font-medium text-gray-700 mb-2">Texto do botão: <strong>Pix Copia e Cola</strong></p>
                                                                                <input
                                                                                    type="text"
                                                                                    value={tempButtonUrl} // Editar a chave PIX (que está na URL)
                                                                                    onChange={(e) => setTempButtonUrl(e.target.value)}
                                                                                    onBlur={saveButtonEdit}
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') {
                                                                                            saveButtonEdit();
                                                                                        } else if (e.key === 'Escape') {
                                                                                            cancelButtonEdit();
                                                                                        }
                                                                                    }}
                                                                                    className="w-48 h-8 px-3 rounded-lg text-sm font-medium bg-white border border-gray-300 focus:outline-none focus:border-blue-500 text-center"
                                                                                    placeholder="Digite sua chave PIX"
                                                                                    autoFocus
                                                                                />
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <label className="text-xs text-gray-600">Cor do botão:</label>
                                                                                <input
                                                                                    type="color"
                                                                                    value={link.bgColor1 || '#32BCAD'}
                                                                                    onChange={(e) => {
                                                                                        setConfig(prev => ({
                                                                                            ...prev,
                                                                                            customLinks: prev.customLinks?.map(l => 
                                                                                                l.id === link.id 
                                                                                                    ? { ...l, bgColor1: e.target.value, bgColor2: e.target.value }
                                                                                                    : l
                                                                                            ) || []
                                                                                        }));
                                                                                    }}
                                                                                    className="w-8 h-6 border border-gray-300 rounded"
                                                                                />
                                                                            </div>
                                                                            <div className="flex gap-2">
                                                                                <button
                                                                                    onClick={saveButtonEdit}
                                                                                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                                                >
                                                                                    Salvar
                                                                                </button>
                                                                                <button
                                                                                    onClick={cancelButtonEdit}
                                                                                    className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                                                                >
                                                                                    Cancelar
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <input
                                                                                type="text"
                                                                                value={tempButtonText}
                                                                                onChange={(e) => setTempButtonText(e.target.value)}
                                                                                onBlur={saveButtonEdit}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') {
                                                                                        saveButtonEdit();
                                                                                    } else if (e.key === 'Escape') {
                                                                                        cancelButtonEdit();
                                                                                    }
                                                                                }}
                                                                                className="w-48 h-10 px-3 rounded-lg text-sm font-medium bg-white border-2 border-dashed border-blue-400 focus:outline-none focus:border-blue-500 text-center"
                                                                                placeholder="Digite o texto..."
                                                                                autoFocus
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                value={tempButtonUrl}
                                                                                onChange={(e) => setTempButtonUrl(e.target.value)}
                                                                                onBlur={saveButtonEdit}
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') {
                                                                                        saveButtonEdit();
                                                                                    } else if (e.key === 'Escape') {
                                                                                        cancelButtonEdit();
                                                                                    }
                                                                                }}
                                                                                className="w-48 h-8 px-3 rounded-lg text-xs font-medium bg-white border-2 border-dashed border-blue-400 focus:outline-none focus:border-blue-500 text-center"
                                                                                placeholder="Digite a URL..."
                                                                            />
                                                                        </>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div 
                                                                    className="w-48 h-10 rounded-lg flex items-center justify-center text-white shadow-md gap-2 cursor-pointer border-2 border-dashed border-transparent hover:border-blue-300 transition-all duration-200 hover:bg-blue-50 inline-editable"
                                                                    style={{ background: link.styleType === 'gradient' ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` : link.bgColor1 }}
                                                                    onClick={() => {
                                                                        // 💰 Comportamento específico para PIX
                                                                        if (link.icon === 'pix') {
                                                                            copyPixToClipboard(link.url); // Chave PIX está na URL
                                                                        } else if (link.icon === 'user-plus') {
                                                                            // 📞 Comportamento específico para Salvar Contato
                                                                            openContactPage(link.url); // Número está na URL
                                                                        } else {
                                                                            startEditingButton(link.id, link.text, link.url);
                                                                        }
                                                                    }}
                                                                    onDoubleClick={() => {
                                                                        // 💰 Duplo clique no PIX para editar
                                                                        if (link.icon === 'pix') {
                                                                            startEditingButton(link.id, link.text, link.url);
                                                                        } else if (link.icon === 'user-plus') {
                                                                            // 📞 Duplo clique no Salvar Contato para editar
                                                                            startEditingButton(link.id, link.text, link.url);
                                                                        }
                                                                    }}
                                                                    title={link.icon === 'pix' ? 'Clique para copiar PIX • Duplo clique para editar' : link.icon === 'user-plus' ? 'Clique para salvar contato • Duplo clique para editar número' : 'Clique para editar'}
                                                                >
                                                            {link.icon && <IconForName name={link.icon as IconName} size={16} />}
                                                            <span className="text-sm font-medium">{link.text}</span>
                                                        </div>
                                                            )}
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

                                                } catch {
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

                                        } catch (err) {
console.error('Erro ao salvar:', err);
                                            alert('Erro ao salvar: ' + (err as Error).message);
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

            'user-plus': '(61)981938165',

        };

        return placeholders[icon] || '';

    };

    // Função para formatar número de telefone
    const formatPhoneNumber = (value: string) => {
        // Remove tudo que não é número
        const numbers = value.replace(/\D/g, '');
        
        // Aplica formatação (XX)XXXXX-XXXX
        if (numbers.length <= 2) {
            return numbers;
        } else if (numbers.length <= 7) {
            return `(${numbers.slice(0, 2)})${numbers.slice(2)}`;
        } else {
            return `(${numbers.slice(0, 2)})${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
        }
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

        

        // Processar URL baseado no tipo de botão
        let finalUrl = data.url;

        if (data.icon === 'user-plus') {
            // Para botão de salvar contato, adicionar 'tel:' automaticamente
            if (!finalUrl.startsWith('tel:')) {
                finalUrl = 'tel:' + finalUrl;
            }
        } else if (!getSocialBaseUrl(data.icon)) {
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
                            let inputValue = e.target.value;

                            // Aplicar formatação automática para botão de salvar contato
                            if (data.icon === 'user-plus') {
                                inputValue = formatPhoneNumber(inputValue);
                            }

                            const newUrl = baseUrl ? baseUrl + inputValue : inputValue;

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





