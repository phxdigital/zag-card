'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Save, 
  CreditCard, 
  Smartphone, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Circle, 
  Square, 
  Image as ImageIcon, 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  ShoppingCart, 
  Link as LinkIcon, 
  Youtube, 
  Twitter 
} from 'lucide-react';

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
    logoPosition?: 'left' | 'center' | 'right';
    socialLinks?: { [key: string]: string };
    customLinks?: CustomLink[];
    landingPageBgColor?: string;
    landingPageBgImage?: string | null;
    landingPageTitleText?: string;
    landingPageSubtitleText?: string;
    landingPageLogoShape?: 'circle' | 'square';
    landingPageLogoSize?: number;
    logoOpacityFront?: number;
    logoOpacityBack?: number;
    logoRotationFront?: number;
    logoRotationBack?: number;
    removeLogoBackground?: boolean;
    landingFont?: string;
    landingPageTitleColor?: string;
    landingPageSubtitleColor?: string;
};

type IconName = 'image' | 'message-circle' | 'instagram' | 'facebook' | 'globe' | 'map-pin' | 'phone' | 'mail' | 'shopping-cart' | 'link' | 'youtube' | 'twitter';

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

export default function EditPage() {
    const params = useParams();
    const router = useRouter();
    const pageId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingMessage, setSavingMessage] = useState('');
    const [editingLink, setEditingLink] = useState<CustomLink | null>(null);
    const [showLinkEditor, setShowLinkEditor] = useState(false);
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
        removeLogoBackground: false,
        landingFont: 'Inter',
        landingPageTitleColor: '#1e293b',
        landingPageSubtitleColor: '#64748b',
    });
    const [subdomain, setSubdomain] = useState('');
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const [activeStep, setActiveStep] = useState(1);

    useEffect(() => {
        loadPageData();
    }, [pageId]);

    const loadPageData = async () => {
        try {
            const response = await fetch(`/api/pages/${pageId}`);
            if (response.ok) {
                const pageData = await response.json();
                // Carregar configuração existente ou usar padrões
                setConfig({
                    cardText: pageData.config?.cardText || '',
                    isTextEnabled: pageData.config?.isTextEnabled || false,
                    cardBgColor: pageData.config?.cardBgColor || '#FFFFFF',
                    cardTextColor: pageData.config?.cardTextColor || '#1e293b',
                    cardBackBgColor: pageData.config?.cardBackBgColor || '#e2e8f0',
                    logoSize: pageData.config?.logoSize || 40,
                    qrCodeSize: pageData.config?.qrCodeSize || 35,
                    clientLogoBackSize: pageData.config?.clientLogoBackSize || 35,
                    qrCodePosition: pageData.config?.qrCodePosition || 'justify-start',
                    logoPosition: pageData.config?.logoPosition || 'center',
                    socialLinks: pageData.config?.socialLinks || {},
                    customLinks: pageData.config?.customLinks || [],
                    landingPageBgColor: pageData.config?.landingPageBgColor || '#F8FAFC',
                    landingPageBgImage: pageData.config?.landingPageBgImage || null,
                    landingPageTitleText: pageData.config?.landingPageTitleText || '',
                    landingPageSubtitleText: pageData.config?.landingPageSubtitleText || '',
                    landingPageLogoShape: pageData.config?.landingPageLogoShape || 'circle',
                    landingPageLogoSize: pageData.config?.landingPageLogoSize || 96,
                    logoOpacityFront: pageData.config?.logoOpacityFront ?? 1,
                    logoOpacityBack: pageData.config?.logoOpacityBack ?? 1,
                    logoRotationFront: pageData.config?.logoRotationFront || 0,
                    logoRotationBack: pageData.config?.logoRotationBack || 0,
                    removeLogoBackground: pageData.config?.removeLogoBackground || false,
                    landingFont: pageData.config?.landingFont || 'Inter',
                    landingPageTitleColor: pageData.config?.landingPageTitleColor || '#1e293b',
                    landingPageSubtitleColor: pageData.config?.landingPageSubtitleColor || '#64748b',
                });
                setSubdomain(pageData.subdomain || '');
                setLogoDataUrl(pageData.logo_url || null);
            } else {
                alert('Página não encontrada');
                router.push('/dashboard/pages');
            }
        } catch (error) {
            console.error('Erro ao carregar página:', error);
            alert('Erro ao carregar página');
        } finally {
            setLoading(false);
        }
    };

    const handleConfigChange = (key: keyof PageConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

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
        setConfig(prev => ({ ...prev, customLinks: [...(prev.customLinks || []), { ...newBtn, id: Date.now() }] }));
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

    const savePage = async () => {
        setSaving(true);
        setSavingMessage('Salvando alterações...');
        
        try {
            // Simular progresso
            await new Promise(resolve => setTimeout(resolve, 500));
            setSavingMessage('Atualizando página...');
            
            const response = await fetch(`/api/pages/${pageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    config,
                    logo_url: logoDataUrl
                }),
            });

            if (response.ok) {
                setSavingMessage('Redirecionando...');
                await new Promise(resolve => setTimeout(resolve, 300));
                router.push(`/success?subdomain=${subdomain}&pageId=${pageId}&edit=true`);
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao salvar');
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar: ' + (error as Error).message);
        } finally {
            setSaving(false);
            setSavingMessage('');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Modal de loading durante salvamento
    if (saving) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
                            Por favor, aguarde enquanto processamos suas alterações...
                        </p>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/dashboard/pages"
                            className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Voltar
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Editar Página</h1>
                            <p className="text-slate-500 mt-1">Editando: {subdomain}.zagnfc.com.br</p>
                        </div>
                    </div>
                    <button
                        onClick={savePage}
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Alterações
                            </>
                        )}
                    </button>
                </div>

                {/* Steps */}
                <div className="flex items-center justify-center space-x-4 md:space-x-8 mb-8">
                    <div className={`flex items-center space-x-2 border-b-4 pb-2 transition-all duration-300 ${activeStep === 1 ? 'border-blue-500 text-blue-600' : 'border-green-500 text-green-600'}`}>
                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">
                            <CreditCard size={16} />
                        </div>
                        <span className="text-sm font-medium">Cartão</span>
                    </div>
                    <div className={`flex items-center space-x-2 border-b-4 pb-2 transition-all duration-300 ${activeStep === 2 ? 'border-blue-500 text-blue-600' : activeStep > 2 ? 'border-green-500 text-green-600' : 'border-gray-300 text-gray-400'}`}>
                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">
                            <Smartphone size={16} />
                        </div>
                        <span className="text-sm font-medium">Landing Page</span>
                    </div>
                </div>

                {/* Step 1: Card Configuration */}
                {activeStep === 1 && (
                    <div className="space-y-8">
                        {/* Subdomain and QR Code Info (Read-only) */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4">Informações da Página</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-blue-700 mb-2">Subdomínio</label>
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="text" 
                                            value={subdomain} 
                                            disabled 
                                            className="w-full px-3 py-2 border border-blue-300 rounded-md bg-blue-100 text-blue-800 font-mono" 
                                        />
                                        <span className="text-sm text-blue-600">.zagnfc.com.br</span>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-1">Não pode ser alterado após a criação</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-blue-700 mb-2">URL da Página</label>
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="text" 
                                            value={`https://${subdomain}.zagnfc.com.br`} 
                                            disabled 
                                            className="w-full px-3 py-2 border border-blue-300 rounded-md bg-blue-100 text-blue-800 font-mono text-sm" 
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`https://${subdomain}.zagnfc.com.br`);
                                                alert('URL copiada!');
                                            }}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                                        >
                                            Copiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Card Preview */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Card Front */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <p className="text-center font-semibold mb-4">Frente</p>
                                <div style={{ backgroundColor: config.cardBgColor }} className="w-80 h-48 mx-auto rounded-xl shadow-lg flex flex-col justify-center p-4 transition-colors duration-300 border">
                                    <div className={`flex ${config.logoPosition === 'left' ? 'justify-start' : config.logoPosition === 'right' ? 'justify-end' : 'justify-center'} items-center mb-2`}>
                                        {logoDataUrl ? (
                                            <Image 
                                                src={logoDataUrl} 
                                                alt="Logo Preview" 
                                                width={120} 
                                                height={120} 
                                                className="object-contain" 
                                                style={{ 
                                                    width: `${config.logoSize || 40}%`, 
                                                    height: `${config.logoSize || 40}%`, 
                                                    opacity: config.logoOpacityFront ?? 1, 
                                                    transform: `rotate(${config.logoRotationFront || 0}deg)`,
                                                    filter: config.removeLogoBackground ? 'contrast(1.2) brightness(1.1)' : 'none',
                                                    mixBlendMode: config.removeLogoBackground ? 'multiply' : 'normal'
                                                }} 
                                            />
                                        ) : (
                                            <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center">
                                                <ImageIcon className="w-8 h-8 text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                    {config.isTextEnabled && config.cardText && (
                                        <p style={{ color: config.cardTextColor }} className="text-center font-semibold text-sm break-words px-2">
                                            {config.cardText}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Card Back */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <p className="text-center font-semibold mb-4">Verso</p>
                                <div style={{ backgroundColor: config.cardBackBgColor }} className="w-80 h-48 mx-auto rounded-xl shadow-lg flex items-center justify-between p-4 transition-colors duration-300 border">
                                    <div className="flex flex-col items-center">
                                        {logoDataUrl && (
                                            <Image src={logoDataUrl} alt="Logo Preview" width={60} height={60} className="object-contain mb-2" style={{ width: `${config.clientLogoBackSize || 35}px`, height: `${config.clientLogoBackSize || 35}px`, opacity: config.logoOpacityBack ?? 1, transform: `rotate(${config.logoRotationBack || 0}deg)` }} />
                                        )}
                                    </div>
                                    <div className={`flex ${config.qrCodePosition}`}>
                                        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                                            <div className="w-12 h-12 bg-slate-200 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logo Configuration */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Configurações da Logo</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Front Logo Settings */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-slate-700">Logo da Frente</h4>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Tamanho ({config.logoSize || 40}%)</label>
                                        <input 
                                            type="range" 
                                            min={20} 
                                            max={70} 
                                            value={config.logoSize || 40} 
                                            onChange={(e) => handleConfigChange('logoSize', Number(e.target.value))} 
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Posicionamento da Logo</label>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleConfigChange('logoPosition', 'left')}
                                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                                    config.logoPosition === 'left' 
                                                        ? 'bg-blue-600 text-white' 
                                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                                }`}
                                            >
                                                Esquerda
                                            </button>
                                            <button
                                                onClick={() => handleConfigChange('logoPosition', 'center')}
                                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                                    config.logoPosition === 'center' 
                                                        ? 'bg-blue-600 text-white' 
                                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                                }`}
                                            >
                                                Centro
                                            </button>
                                            <button
                                                onClick={() => handleConfigChange('logoPosition', 'right')}
                                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                                    config.logoPosition === 'right' 
                                                        ? 'bg-blue-600 text-white' 
                                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                                }`}
                                            >
                                                Direita
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Opacidade ({Math.round((config.logoOpacityFront ?? 1) * 100)}%)</label>
                                        <input 
                                            type="range" 
                                            min={10} 
                                            max={100} 
                                            value={Math.round((config.logoOpacityFront ?? 1) * 100)} 
                                            onChange={(e) => handleConfigChange('logoOpacityFront', Number(e.target.value) / 100)} 
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Rotação ({config.logoRotationFront || 0}°)</label>
                                        <input 
                                            type="range" 
                                            min={-180} 
                                            max={180} 
                                            value={config.logoRotationFront || 0} 
                                            onChange={(e) => handleConfigChange('logoRotationFront', Number(e.target.value))} 
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                                        />
                                    </div>

                                    <div>
                                        <label className="flex items-center space-x-2">
                                            <input 
                                                type="checkbox" 
                                                checked={config.removeLogoBackground || false} 
                                                onChange={(e) => handleConfigChange('removeLogoBackground', e.target.checked)} 
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                                            />
                                            <span className="text-sm font-medium text-slate-700">Remover fundo da logo</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Back Logo Settings */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-slate-700">Logo do Verso</h4>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Tamanho ({config.clientLogoBackSize || 35}%)</label>
                                        <input 
                                            type="range" 
                                            min={20} 
                                            max={80} 
                                            value={config.clientLogoBackSize || 35} 
                                            onChange={(e) => handleConfigChange('clientLogoBackSize', Number(e.target.value))} 
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Opacidade ({Math.round((config.logoOpacityBack ?? 1) * 100)}%)</label>
                                        <input 
                                            type="range" 
                                            min={10} 
                                            max={100} 
                                            value={Math.round((config.logoOpacityBack ?? 1) * 100)} 
                                            onChange={(e) => handleConfigChange('logoOpacityBack', Number(e.target.value) / 100)} 
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Rotação ({config.logoRotationBack || 0}°)</label>
                                        <input 
                                            type="range" 
                                            min={-180} 
                                            max={180} 
                                            value={config.logoRotationBack || 0} 
                                            onChange={(e) => handleConfigChange('logoRotationBack', Number(e.target.value))} 
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Landing Page Configuration */}
                {activeStep === 2 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Preview */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <p className="text-center font-semibold mb-4">Preview</p>
                            <div className="w-80 h-96 mx-auto rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: config.landingPageBgColor || '#F8FAFC' }}>
                                <div className="p-4 h-full flex flex-col items-center justify-center text-center">
                                    {logoDataUrl ? (
                                        <Image src={logoDataUrl} alt="Logo Preview" width={96} height={96} className={`object-cover mx-auto mb-4 shadow-md ${config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`} />
                                    ) : (
                                        <div className={`w-24 h-24 bg-slate-200 flex items-center justify-center shadow-md ${config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`}>
                                            <ImageIcon className="w-8 h-8 text-slate-400" />
                                        </div>
                                    )}
                                    <h1 className="text-xl font-bold break-words" style={{ fontFamily: `var(--font-${(config.landingFont || 'Inter').toLowerCase().replace(' ', '-')})`, color: config.landingPageTitleColor || '#1e293b' }}>{config.landingPageTitleText || 'Bem-vindo(a)!'}</h1>
                                    {config.landingPageSubtitleText && <p className="text-sm px-2 break-words" style={{ fontFamily: `var(--font-${(config.landingFont || 'Inter').toLowerCase().replace(' ', '-')})`, color: config.landingPageSubtitleColor || '#64748b' }}>{config.landingPageSubtitleText}</p>}
                                    {/* Botões Sociais (Redondos) */}
                                    <div className="w-full flex flex-wrap justify-center items-center gap-3 mt-4 mb-4">
                                        {config.customLinks?.filter(link => link.isSocial).map((link) => (
                                            <div key={link.id} className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md" style={{ background: link.styleType === 'gradient' ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` : link.bgColor1 }}>
                                                {link.icon && <IconForName name={link.icon as IconName} size={20} />}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Botões Personalizados (Retangulares) */}
                                    <div className="w-full flex flex-col items-center gap-2">
                                        {config.customLinks?.filter(link => !link.isSocial).map((link) => (
                                            <div key={link.id} className="w-48 h-10 rounded-lg flex items-center justify-center text-white shadow-md" style={{ background: link.styleType === 'gradient' ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` : link.bgColor1 }}>
                                                <span className="text-sm font-medium">{link.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Configuration */}
                        <div className="space-y-6">
                            {/* Background Color */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Cor de Fundo</label>
                                <input type="color" value={config.landingPageBgColor || '#F8FAFC'} onChange={(e) => handleConfigChange('landingPageBgColor', e.target.value)} className="w-full h-10 border border-slate-300 rounded-md" />
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Título</label>
                                <input type="text" value={config.landingPageTitleText || ''} onChange={(e) => handleConfigChange('landingPageTitleText', e.target.value)} placeholder="Ex: Bem-vindo(a)!" className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Subtítulo</label>
                                <input type="text" value={config.landingPageSubtitleText || ''} onChange={(e) => handleConfigChange('landingPageSubtitleText', e.target.value)} placeholder="Ex: Conheça mais sobre nós!" className="w-full px-3 py-2 border border-slate-300 rounded-md" />
                            </div>

                            {/* Font */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Fonte</label>
                                <select value={config.landingFont || 'Inter'} onChange={(e) => handleConfigChange('landingFont', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md">
                                    <option value="Inter">Inter</option>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Poppins">Poppins</option>
                                    <option value="Montserrat">Montserrat</option>
                                    <option value="Open Sans">Open Sans</option>
                                </select>
                            </div>

                            {/* Colors */}
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

                            {/* Social Presets */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Botões Rápidos</label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => addSocialPreset('whatsapp')} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300 flex items-center gap-1"><MessageCircle size={14}/> WhatsApp</button>
                                    <button onClick={() => addSocialPreset('instagram')} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300 flex items-center gap-1"><Instagram size={14}/> Instagram</button>
                                    <button onClick={() => addSocialPreset('facebook')} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300 flex items-center gap-1"><Facebook size={14}/> Facebook</button>
                                    <button onClick={() => addSocialPreset('youtube')} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300 flex items-center gap-1"><Youtube size={14}/> YouTube</button>
                                    <button onClick={() => addSocialPreset('twitter')} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300 flex items-center gap-1"><Twitter size={14}/> Twitter</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                    <button 
                        onClick={() => setActiveStep(1)} 
                        className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                        disabled={activeStep === 1}
                    >
                        Anterior
                    </button>
                    {activeStep === 1 && (
                        <button 
                            onClick={() => setActiveStep(2)} 
                            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                        >
                            Próximo
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
