'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CreditCard, Smartphone, Crop, Wand2, PlusCircle, Edit, Trash2, Circle, Square, Image as ImageIcon, MessageCircle, Instagram, Facebook, Globe, MapPin, Phone, Mail, ShoppingCart, Link as LinkIcon, Youtube, Twitter } from 'lucide-react';

type CustomLink = {
    id: number;
    text: string;
    url: string;
    icon: string | null;
    styleType: 'solid' | 'gradient';
    bgColor1: string;
    bgColor2: string;
    textColor: string;
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
};

type QRCodeOptions = { text: string; width: number; height: number };
interface QRCodeConstructor {
    new (element: HTMLElement, options: QRCodeOptions): unknown;
}

export default function DashboardPage() {
    const [config, setConfig] = useState<PageConfig>({
        cardText: '',
        isTextEnabled: false,
        cardBgColor: '#FFFFFF',
        cardTextColor: '#1e293b',
        cardBackBgColor: '#e2e8f0',
        logoSize: 60,
        qrCodeSize: 35,
        clientLogoBackSize: 35,
        qrCodePosition: 'justify-start',
        socialLinks: {},
        customLinks: [],
        landingPageBgColor: '#F8FAFC',
        landingPageBgImage: null,
        landingPageTitleText: '',
        landingPageSubtitleText: '',
        landingPageLogoShape: 'circle',
        landingPageLogoSize: 96,
        logoOpacityFront: 1,
        logoOpacityBack: 1,
        logoRotationFront: 0,
        logoRotationBack: 0,
    });

    const [activeStep, setActiveStep] = useState(1);
    const [subdomain, setSubdomain] = useState('');
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const qrcodePreviewRef = useRef<HTMLDivElement>(null);

    type IconName = 'image' | 'message-circle' | 'instagram' | 'facebook' | 'globe' | 'map-pin' | 'phone' | 'mail' | 'shopping-cart' | 'link' | 'youtube' | 'twitter';
    const availableIcons: IconName[] = ['message-circle','instagram','facebook','youtube','twitter','globe','map-pin','phone','mail','shopping-cart','link','image'];
    const commonEmojis = ['✨', '🚀', '⭐', '❤️', '✅', '👇', '📱', '📞', '💡', '🔥', '🎉', '👋', '🙌', '👍', '😎', '🎁', '🛒', '🔗', '🧭', '💬', '📧', '☎️', '📍', '💼', '🏷️', '🆕', '🏆', '🖼️', '🎬'];
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [editingLink, setEditingLink] = useState<CustomLink | null>(null);
    const [showLinkEditor, setShowLinkEditor] = useState(false);
    const [QRCode, setQRCode] = useState<QRCodeConstructor | null>(null);
    const [showLogoEditor, setShowLogoEditor] = useState(false);
    const [editorZoom, setEditorZoom] = useState(1);
    const [editorOffset, setEditorOffset] = useState({ x: 0, y: 0 });
    const dragRef = useRef<{ dragging: boolean; startX: number; startY: number; origX: number; origY: number; touchDist?: number; startZoom?: number }>({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0 });

    const handleConfigChange = (key: keyof PageConfig, value: unknown) => {
        setConfig((prev) => ({ ...prev, [key]: value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('O arquivo é muito grande. O tamanho máximo é 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => setLogoDataUrl(event.target?.result as string);
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
            if ((config.customLinks?.length || 0) >= 4) {
                alert('Você pode adicionar no máximo 4 links personalizados.');
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

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('zag-dashboard-config');
            if (saved) {
                const parsed = JSON.parse(saved);
                setConfig((prev) => ({ ...prev, ...(parsed.config || {}) }));
                if (typeof parsed.subdomain === 'string') setSubdomain(parsed.subdomain);
                if (typeof parsed.logoDataUrl === 'string') setLogoDataUrl(parsed.logoDataUrl);
            }
        } catch {}
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
            text: `https://${subdomain}.zagcnfc.com.br`,
            width: size,
            height: size,
        });
    }, [QRCode, subdomain, config.qrCodeSize]);

    const addSocialPreset = (kind: 'whatsapp' | 'instagram' | 'facebook' | 'youtube' | 'twitter') => {
        const presets: { [k in typeof kind]: { text: string; url: string; icon: IconName; color: string } } = {
            whatsapp: { text: 'WhatsApp', url: 'https://wa.me/', icon: 'message-circle', color: '#16a34a' },
            instagram: { text: 'Instagram', url: 'https://instagram.com/', icon: 'instagram', color: '#DB2777' },
            facebook: { text: 'Facebook', url: 'https://facebook.com/', icon: 'facebook', color: '#2563EB' },
            youtube: { text: 'YouTube', url: 'https://youtube.com/', icon: 'youtube', color: '#DC2626' },
            twitter: { text: 'Twitter/X', url: 'https://twitter.com/', icon: 'twitter', color: '#0ea5e9' },
        } as const;
        const p = presets[kind];
        const newBtn = { text: p.text, url: p.url, icon: p.icon, styleType: 'solid' as const, bgColor1: p.color, bgColor2: p.color, textColor: '#ffffff' };
        if ((config.customLinks?.length || 0) >= 4) {
            alert('Você pode adicionar no máximo 4 botões.');
            return;
        }
        setConfig(prev => ({ ...prev, customLinks: [...(prev.customLinks || []), { ...newBtn, id: Date.now() }] }));
    };

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
        };
        const C = map[name];
        return <C className={className} size={size} />;
    };

    const suggestColorsFromLogo = async () => {
        if (!logoDataUrl) return;
        const img = document.createElement('img');
        img.crossOrigin = 'anonymous';
        img.src = logoDataUrl;
        await new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
        });
        const canvas = document.createElement('canvas');
        const w = 64, h = 64;
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3];
            if (a < 10) continue;
            r += data[i]; g += data[i + 1]; b += data[i + 2];
            n++;
        }
        if (!n) return;
        r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
        const bg = `rgb(${r}, ${g}, ${b})`;
        // Use exact background and derive readable text
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const text = luminance > 0.6 ? '#111827' : '#ffffff';
        setConfig(prev => ({ ...prev, cardBackBgColor: bg, cardBgColor: bg, cardTextColor: text, landingPageBgColor: '#ffffff' }));
        alert('Cores sugeridas com base na sua logo foram aplicadas.');
    };

    return (
        <>
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8 flex items-center space-x-4">
                    <Image src="/logo-zag.png" alt="Zag Card Logo" width={128} height={128} className="h-24 w-auto" />
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
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                    <p className="text-center font-semibold mb-4">Frente</p>
                                    <div style={{ backgroundColor: config.cardBgColor }} className="w-80 h-48 mx-auto rounded-xl shadow-lg flex flex-col items-center justify-center p-4 transition-colors duration-300 border">
                                        {logoDataUrl ? (
                                            <Image src={logoDataUrl} alt="Logo Preview" width={120} height={120} className="object-contain mb-2" style={{ width: `${config.logoSize}%`, height: 'auto', maxHeight: '60%', opacity: config.logoOpacityFront ?? 1, transform: `rotate(${config.logoRotationFront || 0}deg)` }} />
                                        ) : (
                                            <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center mb-2">
                                                <ImageIcon className="w-8 h-8 text-slate-400" />
                                            </div>
                                        )}
                                        {config.isTextEnabled && (
                                            <p style={{ color: config.cardTextColor }} className="font-semibold text-lg text-center">
                                                {config.cardText || 'Seu Nome'}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-6 space-y-4 max-w-sm mx-auto">
                                        <h3 className="font-bold text-lg border-b pb-2">Personalizar Frente</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Logo da Empresa</label>
                                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
                                            <p className="text-xs text-slate-400 mt-1">Tamanho máximo: 5MB.</p>
                                        </div>
                                        {logoDataUrl && (
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <button className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 p-2 rounded-md" onClick={() => setShowLogoEditor(true)}>
                                                    <Crop className="w-4 h-4" /> Editar logo
                                                </button>
                                                <a href="https://www.remove.bg/upload" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 p-2 rounded-md">
                                                    <Wand2 className="w-4 h-4" /> Remover Fundo
                                                </a>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <button onClick={suggestColorsFromLogo} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-sm">Sugerir paleta pela logo</button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Opacidade da Logo (Frente) ({Math.round((config.logoOpacityFront ?? 1) * 100)}%)</label>
                                                <input type="range" min={10} max={100} value={Math.round((config.logoOpacityFront ?? 1) * 100)} onChange={(e) => handleConfigChange('logoOpacityFront', Number(e.target.value) / 100)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Rotação da Logo (Frente) ({config.logoRotationFront || 0}°)</label>
                                                <input type="range" min={-180} max={180} value={config.logoRotationFront || 0} onChange={(e) => handleConfigChange('logoRotationFront', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Tamanho da Logo ({config.logoSize}%)</label>
                                            <input type="range" min={30} max={150} value={config.logoSize} onChange={(e) => handleConfigChange('logoSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                        </div>
                                        <div>
                                            <div className="flex items-center mb-2">
                                                <input type="checkbox" checked={!!config.isTextEnabled} onChange={(e) => handleConfigChange('isTextEnabled', e.target.checked)} className="h-4 w-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500" />
                                                <label className="ml-2 block text-sm font-medium text-slate-700">Adicionar texto?</label>
                                            </div>
                                            <input type="text" placeholder="Seu Nome ou Empresa" value={config.cardText || ''} onChange={(e) => handleConfigChange('cardText', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm disabled:bg-slate-100" disabled={!config.isTextEnabled} />
                                        </div>
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
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                    <p className="text-center font-semibold mb-4">Verso</p>
                                    <div style={{ backgroundColor: config.cardBackBgColor }} className="w-80 h-48 mx-auto rounded-xl shadow-lg p-4 border relative overflow-hidden">
                                        {logoDataUrl && (
                                            <Image src={logoDataUrl} alt="Logo Verso" width={150} height={150} className="object-contain absolute transition-all duration-300" style={{ width: `${config.clientLogoBackSize}%`, top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${config.logoRotationBack || 0}deg)`, opacity: config.logoOpacityBack ?? 0.3 }} />
                                        )}
                                        <div className={`absolute inset-0 p-4 flex items-center ${config.qrCodePosition}`}>
                                            <div ref={qrcodePreviewRef} className="bg-white p-1 rounded-md aspect-square" style={{ width: `${config.qrCodeSize}%` }} />
                                        </div>
                                        <Image src="/logo-zag.png" alt="Logo Zag Card" width={80} height={24} className="absolute bottom-3 right-3 h-5 w-auto object-contain" />
                                    </div>
                                    <div className="mt-6 space-y-4 max-w-sm mx-auto">
                                        <h3 className="font-bold text-lg border-b pb-2">Personalizar Verso</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Seu Subdomínio</label>
                                            <div className="flex">
                                                <input type="text" placeholder="sua-empresa" value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="w-full px-3 py-2 border border-slate-300 rounded-l-md shadow-sm" />
                                                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">.meuzag.com</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo</label>
                                            <input type="color" value={config.cardBackBgColor} onChange={(e) => handleConfigChange('cardBackBgColor', e.target.value)} className="w-full h-10 border border-slate-300 rounded-md" />
                                        </div>
                                        <hr />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Opacidade da Logo (Verso) ({Math.round((config.logoOpacityBack ?? 0.3) * 100)}%)</label>
                                                <input type="range" min={10} max={100} value={Math.round((config.logoOpacityBack ?? 0.3) * 100)} onChange={(e) => handleConfigChange('logoOpacityBack', Number(e.target.value) / 100)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Rotação da Logo (Verso) ({config.logoRotationBack || 0}°)</label>
                                                <input type="range" min={-180} max={180} value={config.logoRotationBack || 0} onChange={(e) => handleConfigChange('logoRotationBack', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Tamanho do QR Code ({config.qrCodeSize}%)</label>
                                            <input type="range" min={25} max={50} value={config.qrCodeSize} onChange={(e) => handleConfigChange('qrCodeSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
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
                                            <input type="range" min={20} max={70} value={config.clientLogoBackSize} onChange={(e) => handleConfigChange('clientLogoBackSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
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
                                                    <input type="range" min={48} max={128} value={config.landingPageLogoSize} onChange={(e) => handleConfigChange('landingPageLogoSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo da Página</label>
                                                    <input type="color" value={config.landingPageBgColor || '#ffffff'} onChange={(e) => handleConfigChange('landingPageBgColor', e.target.value)} className="w-24 h-10 border border-slate-300 rounded-md" />
                                                </div>
                                            </div>
                                        </fieldset>

                                        <fieldset className="border-t pt-4">
                                            <legend className="text-lg font-semibold text-slate-800 -mt-7 px-2 bg-white">Botões Personalizados (até 4)</legend>
                                            <div className="space-y-4 mt-4">
                                                <button onClick={() => openLinkEditor(null)} className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2">
                                                    <PlusCircle /> Adicionar Novo Botão
                                                </button>
                                                <div className="space-y-2">
                                                    {config.customLinks?.map((link) => (
                                                        <div key={link.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                                                            <div className="flex items-center gap-2">
                                                                {link.icon && <IconForName name={link.icon as IconName} className="w-5 h-5 text-slate-600" />}
                                                                <span className="text-sm font-medium">{link.text}</span>
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
                                                    <Image src={logoDataUrl} alt="Logo Preview" width={config.landingPageLogoSize || 96} height={config.landingPageLogoSize || 96} className={`object-cover mx-auto shadow-md ${config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`} />
                                                ) : (
                                                    <div className={`w-24 h-24 bg-slate-200 flex items-center justify-center shadow-md ${config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`}>
                                                        <ImageIcon className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                )}
                                                <h1 className="text-xl font-bold text-slate-800 break-words">{config.landingPageTitleText || 'Bem-vindo(a)!'}</h1>
                                                {config.landingPageSubtitleText && <p className="text-slate-600 text-sm px-2 break-words">{config.landingPageSubtitleText}</p>}
                                                <div className="w-full flex flex-wrap justify-center items-center gap-3">
                                                    {config.customLinks?.map((link) => (
                                                        <div key={link.id} className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: link.styleType === 'gradient' ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` : link.bgColor1 }}>
                                                            {link.icon && <IconForName name={link.icon as IconName} />}
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
                                    onClick={() => {
                                        try {
                                            localStorage.setItem(
                                                'zag-dashboard-config',
                                                JSON.stringify({ config, subdomain, logoDataUrl })
                                            );
                                            alert('Configurações salvas com sucesso!');
                                        } catch {
                                            alert('Não foi possível salvar localmente.');
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

            {showLogoEditor && logoDataUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onMouseUp={() => (dragRef.current.dragging = false)}>
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl space-y-4">
                        <h2 className="text-2xl font-bold">Editar logo</h2>
                        <div className="relative w-full h-80 bg-slate-100 rounded-lg overflow-hidden border"
                            onTouchStart={(e) => {
                                if (e.touches.length === 1) {
                                    const t = e.touches[0];
                                    dragRef.current.dragging = true;
                                    dragRef.current.startX = t.clientX;
                                    dragRef.current.startY = t.clientY;
                                    dragRef.current.origX = editorOffset.x;
                                    dragRef.current.origY = editorOffset.y;
                                } else if (e.touches.length === 2) {
                                    const [a, b] = [e.touches[0], e.touches[1]];
                                    const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
                                    dragRef.current.touchDist = dist;
                                    dragRef.current.startZoom = editorZoom;
                                }
                            }}
                            onTouchMove={(e) => {
                                if (e.touches.length === 1 && dragRef.current.dragging) {
                                    const t = e.touches[0];
                                    const dx = t.clientX - dragRef.current.startX;
                                    const dy = t.clientY - dragRef.current.startY;
                                    setEditorOffset({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
                                } else if (e.touches.length === 2 && dragRef.current.touchDist && dragRef.current.startZoom) {
                                    const [a, b] = [e.touches[0], e.touches[1]];
                                    const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
                                    const ratio = dist / dragRef.current.touchDist;
                                    setEditorZoom(Math.min(3, Math.max(0.5, dragRef.current.startZoom * ratio)));
                                }
                            }}
                            onTouchEnd={() => { dragRef.current.dragging = false; dragRef.current.touchDist = undefined; dragRef.current.startZoom = undefined; }}
                        >
                            <div
                                className="absolute inset-0 cursor-move"
                                onMouseDown={(e) => {
                                    dragRef.current.dragging = true;
                                    dragRef.current.startX = e.clientX;
                                    dragRef.current.startY = e.clientY;
                                    dragRef.current.origX = editorOffset.x;
                                    dragRef.current.origY = editorOffset.y;
                                }}
                                onMouseMove={(e) => {
                                    if (!dragRef.current.dragging) return;
                                    const dx = e.clientX - dragRef.current.startX;
                                    const dy = e.clientY - dragRef.current.startY;
                                    setEditorOffset({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy });
                                }}
                            >
                                {/* Visible crop area (square) */}
                                <div className="absolute inset-10 border-2 border-white/80 rounded-md pointer-events-none"></div>
                                <img
                                    src={logoDataUrl}
                                    alt="logo"
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
                                    style={{ transform: `translate(-50%, -50%) translate(${editorOffset.x}px, ${editorOffset.y}px) scale(${editorZoom})` }}
                                    draggable={false}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Zoom ({Math.round(editorZoom * 100)}%)</label>
                                <input type="range" min={50} max={300} value={Math.round(editorZoom * 100)} onChange={(e) => setEditorZoom(Number(e.target.value) / 100)} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button className="px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300" onClick={() => { setEditorZoom(1); setEditorOffset({ x: 0, y: 0 }); }}>Resetar</button>
                                <button className="px-4 py-2 rounded-md bg-slate-800 text-white hover:bg-slate-900" onClick={async () => {
                                    const container = document.createElement('canvas');
                                    const size = 512;
                                    container.width = size; container.height = size;
                                    const ctx = container.getContext('2d');
                                    if (!ctx) return;
                                    const img = new window.Image();
                                    img.crossOrigin = 'anonymous';
                                    img.src = logoDataUrl;
                                    await new Promise(res => { img.onload = () => res(undefined); img.onerror = () => res(undefined); });
                                    // map editor coords to image draw
                                    const scale = editorZoom;
                                    const offsetX = editorOffset.x;
                                    const offsetY = editorOffset.y;
                                    const drawW = img.width * scale;
                                    const drawH = img.height * scale;
                                    const centerX = size / 2 + offsetX;
                                    const centerY = size / 2 + offsetY;
                                    ctx.clearRect(0,0,size,size);
                                    ctx.drawImage(img, centerX - drawW / 2, centerY - drawH / 2, drawW, drawH);
                                    setLogoDataUrl(container.toDataURL('image/png'));
                                    setShowLogoEditor(false);
                                }}>Aplicar</button>
                                <button className="px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300" onClick={() => setShowLogoEditor(false)}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function LinkEditorForm({ initial, onSave, onCancel, icons }: { initial: CustomLink | null; onSave: (d: Omit<CustomLink, 'id'>) => void; onCancel: () => void; icons: string[] }) {
    const [data, setData] = useState({
        text: initial?.text || '',
        url: initial?.url || '',
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
        onSave(data);
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Texto do Botão</label>
                <input type="text" value={data.text} onChange={(e) => setData({ ...data, text: e.target.value })} placeholder="Ex: Meu Site" className="w-full px-3 py-2 border border-slate-300 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL / Link</label>
                <input type="text" value={data.url} onChange={(e) => setData({ ...data, url: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-slate-300 rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ícone</label>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-md">
                    <div onClick={() => setData({ ...data, icon: null })} className={`p-2 border rounded-md flex items-center justify-center cursor-pointer hover:bg-amber-100 ${data.icon === null ? 'bg-amber-200 border-amber-400' : 'border-slate-300'}`}>
                        <span className="text-xs">Nenhum</span>
                    </div>
                    {icons.map((icon) => (
                        <div key={icon} onClick={() => setData({ ...data, icon })} className={`p-2 border rounded-md flex items-center justify-center cursor-pointer hover:bg-amber-100 ${data.icon === icon ? 'bg-amber-200 border-amber-400' : 'border-slate-300'}`}>
                            <ImageIcon className="w-4 h-4" />
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


