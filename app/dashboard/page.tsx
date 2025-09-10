'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Crop, MessageCircle, Instagram, Facebook, Link as LinkIcon,
    ShoppingCart, Globe, Wifi, DollarSign, BookOpen, MapPin, Phone, Mail, Info,
    Star, Image as ImageIcon, Video, PlusCircle, Edit, Trash2, Smartphone, CreditCard,
    User, Circle, Square
} from 'lucide-react';
import Image from 'next/image';

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
    qrCodePosition?: string; 
    socialLinks?: { [key: string]: string }; 
    customLinks?: CustomLink[];
    landingPageBgColor?: string; 
    landingPageBgImage?: string | null; 
    landingPageTitleText?: string;
    landingPageSubtitleText?: string; 
    landingPageLogoShape?: 'circle' | 'square'; 
    landingPageLogoSize?: number;
};

type IconName = 
    | 'shopping-cart' | 'link' | 'dollar-sign' | 'wifi' | 'globe' | 'book-open' 
    | 'map-pin' | 'phone' | 'mail' | 'info' | 'star' | 'image' | 'video' 
    | 'plus-circle' | 'edit' | 'trash-2' | 'user' | 'circle' | 'square' 
    | 'message-circle' | 'instagram' | 'facebook';

const LucideIcon = ({ name, size = 24, className }: { 
    name: IconName; 
    size?: number; 
    className?: string; 
}) => {
    const icons: { [key in IconName]: React.ElementType } = {
        'message-circle': MessageCircle, 'instagram': Instagram, 'facebook': Facebook,
        'shopping-cart': ShoppingCart, 'link': LinkIcon, 'dollar-sign': DollarSign,
        'wifi': Wifi, 'globe': Globe, 'book-open': BookOpen, 'map-pin': MapPin,
        'phone': Phone, 'mail': Mail, 'info': Info, 'star': Star, 'image': ImageIcon,
        'video': Video, 'plus-circle': PlusCircle, 'edit': Edit, 'trash-2': Trash2,
        'user': User, 'circle': Circle, 'square': Square
    };
    const IconComponent = icons[name];
    return IconComponent ? <IconComponent size={size} className={className} /> : null;
};

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
    });
    
    const [activeStep, setActiveStep] = useState(1);
    const [subdomain, setSubdomain] = useState('');
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
    const [showLinkEditorModal, setShowLinkEditorModal] = useState(false);
    const [editingLink, setEditingLink] = useState<CustomLink | null>(null);
    const [isClient, setIsClient] = useState(false);

    const availableIcons = [ 
        'shopping-cart', 'link', 'dollar-sign', 'wifi', 'globe', 'book-open', 
        'map-pin', 'phone', 'mail', 'info', 'star', 'image', 'video' 
    ];

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleConfigChange = (key: keyof PageConfig, value: unknown) => {
        setConfig(prev => ({ ...prev, [key]: value }));
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
        setConfig(prev => ({ ...prev, landingPageTitleText: prev.cardText || 'Seu Título Aqui' }));
        setActiveStep(2);
    };

    const openLinkEditor = (link: CustomLink | null = null) => {
        setEditingLink(link);
        setShowLinkEditorModal(true);
    };

    const saveCustomLink = (linkData: Omit<CustomLink, 'id'>) => {
        if (editingLink) {
            setConfig(prev => ({
                ...prev, 
                customLinks: prev.customLinks?.map(l => 
                    l.id === editingLink.id ? { ...l, ...linkData } : l
                )
            }));
        } else {
            if ((config.customLinks?.length || 0) >= 4) {
                alert('Você pode adicionar no máximo 4 links personalizados.'); 
                return;
            }
            setConfig(prev => ({
                ...prev, 
                customLinks: [...(prev.customLinks || []), { ...linkData, id: Date.now() }]
            }));
        }
        setShowLinkEditorModal(false); 
        setEditingLink(null);
    };

    const deleteCustomLink = (id: number) => {
        setConfig(prev => ({
            ...prev, 
            customLinks: prev.customLinks?.filter(l => l.id !== id)
        }));
    };

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

            <div className="flex items-center justify-center space-x-4 md:space-x-8 mb-8">
                <div className={`flex items-center space-x-2 border-b-4 pb-2 ${
                    activeStep === 1 ? 'border-blue-500 text-blue-600' : 'border-green-500 text-green-600'
                }`}>
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">
                        <CreditCard size={16}/>
                    </div>
                    <span className="font-semibold hidden md:block">Design do Cartão</span>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-slate-300"></div>
                <div className={`flex items-center space-x-2 border-b-4 pb-2 ${
                    activeStep === 2 ? 'border-blue-500 text-blue-600' : 'border-slate-300 text-slate-500'
                }`}>
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">
                        <Smartphone size={16}/>
                    </div>
                    <span className="font-semibold hidden md:block">Landing Page</span>
                </div>
            </div>
            
            <main>
                {/* ETAPA 1 */}
                {activeStep === 1 && (
                    <div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <p className="text-center font-semibold mb-4">Frente</p>
                                <div 
                                    style={{ backgroundColor: config.cardBgColor }} 
                                    className="w-80 h-48 mx-auto rounded-xl shadow-lg flex flex-col items-center justify-center p-4 border"
                                >
                                    {logoDataUrl ? (
                                        <Image 
                                            src={logoDataUrl} 
                                            alt="Logo Preview" 
                                            width={120} 
                                            height={120} 
                                            className="object-contain mb-2" 
                                            style={{ width: `${config.logoSize}%`, height: 'auto', maxHeight: '60%' }}
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center mb-2">
                                            <ImageIcon className="w-8 h-8 text-slate-400" />
                                        </div>
                                    )}
                                    {config.isTextEnabled && (
                                        <p 
                                            style={{color: config.cardTextColor}} 
                                            className="font-semibold text-lg text-center"
                                        >
                                            {config.cardText || 'Seu Nome'}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-6 space-y-4 max-w-sm mx-auto">
                                    <h3 className="font-bold text-lg border-b pb-2">Personalizar Frente</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Logo da Empresa
                                        </label>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleLogoUpload} 
                                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Tamanho da Logo ({config.logoSize}%)
                                        </label>
                                        <input 
                                            type="range" 
                                            min="30" 
                                            max="90" 
                                            value={config.logoSize} 
                                            onChange={(e) => handleConfigChange('logoSize', Number(e.target.value))} 
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center mb-2">
                                            <input 
                                                type="checkbox" 
                                                checked={!!config.isTextEnabled} 
                                                onChange={(e) => handleConfigChange('isTextEnabled', e.target.checked)} 
                                                className="h-4 w-4 text-amber-600"
                                            />
                                            <label className="ml-2 block text-sm font-medium text-slate-700">
                                                Adicionar texto?
                                            </label>
                                        </div>
                                        <input 
                                            type="text" 
                                            placeholder="Seu Nome ou Empresa" 
                                            value={config.cardText || ''} 
                                            onChange={(e) => handleConfigChange('cardText', e.target.value)} 
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md disabled:bg-slate-100" 
                                            disabled={!config.isTextEnabled}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Cor de Fundo
                                            </label>
                                            <input 
                                                type="color" 
                                                value={config.cardBgColor} 
                                                onChange={(e) => handleConfigChange('cardBgColor', e.target.value)} 
                                                className="w-full h-10 border border-slate-300 rounded-md"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Cor do Texto
                                            </label>
                                            <input 
                                                type="color" 
                                                value={config.cardTextColor} 
                                                onChange={(e) => handleConfigChange('cardTextColor', e.target.value)} 
                                                className="w-full h-10 border border-slate-300 rounded-md"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <p className="text-center font-semibold mb-4">Verso</p>
                                <div 
                                    style={{backgroundColor: config.cardBackBgColor}} 
                                    className="w-80 h-48 mx-auto rounded-xl shadow-lg p-4 border relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-24 h-24 bg-white p-1 rounded-md">
                                            <div className="w-full h-full bg-slate-200 rounded flex items-center justify-center text-xs text-slate-500">
                                                QR Code
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                                        Zag Card
                                    </div>
                                </div>
                                <div className="mt-6 space-y-4 max-w-sm mx-auto">
                                    <h3 className="font-bold text-lg border-b pb-2">Personalizar Verso</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Seu Subdomínio
                                        </label>
                                        <div className="flex">
                                            <input 
                                                type="text" 
                                                placeholder="sua-empresa" 
                                                value={subdomain} 
                                                onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                                                className="w-full px-3 py-2 border border-slate-300 rounded-l-md"
                                            />
                                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                                                .meuzag.com
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-center">
                            <button 
                                onClick={handleNextStep} 
                                className="w-full max-w-md bg-slate-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-900"
                            >
                                Próximo Passo
                            </button>
                        </div>
                    </div>
                )}
                
                {/* ETAPA 2 */}
                {activeStep === 2 && (
                    <div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border">
                                <div className="space-y-6">
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm font-medium text-blue-800">
                                            Design do cartão salvo! Agora, personalize a sua página de links.
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Conteúdo da Página</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                                    Título Principal
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={config.landingPageTitleText || ''} 
                                                    onChange={e => handleConfigChange('landingPageTitleText', e.target.value)} 
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                                    Subtítulo (opcional)
                                                </label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Sua frase de efeito aqui" 
                                                    value={config.landingPageSubtitleText || ''} 
                                                    onChange={e => handleConfigChange('landingPageSubtitleText', e.target.value)} 
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Links Personalizados</h3>
                                        <div className="space-y-4">
                                            <button 
                                                onClick={() => openLinkEditor(null)} 
                                                className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2"
                                            >
                                                <PlusCircle size={20} /> Adicionar Novo Botão
                                            </button>
                                            <div className="space-y-2">
                                                {config.customLinks?.map(link => (
                                                    <div key={link.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                                                        <div className="flex items-center gap-2">
                                                            {link.icon && <LucideIcon name={link.icon as IconName} className="w-5 h-5 text-slate-600" />}
                                                            <span className="text-sm font-medium">{link.text}</span>
                                                        </div>
                                                        <div>
                                                            <button 
                                                                onClick={() => openLinkEditor(link)} 
                                                                className="p-1 text-slate-500 hover:text-slate-800"
                                                            >
                                                                <Edit size={16}/>
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteCustomLink(link.id)} 
                                                                className="p-1 text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash2 size={16}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col items-center justify-center">
                                <p className="text-center font-semibold mb-4">Preview da Landing Page</p>
                                <div className="w-72 h-96 bg-slate-100 rounded-3xl p-4 shadow-xl border-8 border-slate-300 flex flex-col overflow-hidden">
                                    <div className="flex-grow p-4 rounded-2xl" style={{backgroundColor: config.landingPageBgColor}}>
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            {logoDataUrl ? (
                                                <Image 
                                                    src={logoDataUrl} 
                                                    alt="Logo Preview" 
                                                    width={config.landingPageLogoSize || 96} 
                                                    height={config.landingPageLogoSize || 96} 
                                                    className={`object-cover shadow-md ${config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`} 
                                                />
                                            ) : (
                                                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center shadow-md">
                                                    <ImageIcon className="w-8 h-8 text-slate-400" />
                                                </div>
                                            )}
                                            <h1 className="text-xl font-bold text-slate-800">
                                                {config.landingPageTitleText || 'Bem-vindo(a)!'}
                                            </h1>
                                            {config.landingPageSubtitleText && (
                                                <p className="text-slate-600 text-sm">
                                                    {config.landingPageSubtitleText}
                                                </p>
                                            )}
                                            <div className="w-full space-y-2">
                                                {config.customLinks?.map(link => (
                                                    <div 
                                                        key={link.id} 
                                                        style={{
                                                            color: link.textColor, 
                                                            background: link.styleType === 'gradient' ? 
                                                                `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` : 
                                                                link.bgColor1
                                                        }} 
                                                        className="w-full flex items-center justify-center gap-2 font-semibold py-2 px-3 rounded-lg text-sm"
                                                    >
                                                        {link.icon && <LucideIcon name={link.icon as IconName} size={16} />}
                                                        <span>{link.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-center">
                            <button 
                                className="w-full max-w-md bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700"
                                onClick={() => alert('Funcionalidade de salvar será implementada!')}
                            >
                                Salvar e Publicar
                            </button>
                        </div>
                    </div>
                )}
            </main>
            
            {/* Modal Simples para Links */}
            {showLinkEditorModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4">
                        <h2 className="text-2xl font-bold">{editingLink ? 'Editar Botão' : 'Adicionar Novo Botão'}</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const linkData = {
                                text: formData.get('text') as string,
                                url: formData.get('url') as string,
                                icon: formData.get('icon') as string || null,
                                styleType: 'solid' as const,
                                bgColor1: formData.get('bgColor1') as string,
                                bgColor2: '#475569',
                                textColor: formData.get('textColor') as string,
                            };
                            if (linkData.text && linkData.url) {
                                saveCustomLink(linkData);
                            }
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Texto do Botão</label>
                                    <input 
                                        name="text"
                                        type="text" 
                                        defaultValue={editingLink?.text || ''}
                                        placeholder="Ex: Meu Site" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">URL / Link</label>
                                    <input 
                                        name="url"
                                        type="text" 
                                        defaultValue={editingLink?.url || ''}
                                        placeholder="https://..." 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ícone</label>
                                    <select 
                                        name="icon"
                                        defaultValue={editingLink?.icon || ''}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                                    >
                                        <option value="">Sem ícone</option>
                                        {availableIcons.map(icon => (
                                            <option key={icon} value={icon}>{icon}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo</label>
                                        <input 
                                            name="bgColor1"
                                            type="color" 
                                            defaultValue={editingLink?.bgColor1 || '#1e293b'}
                                            className="w-full h-10 border border-slate-300 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Cor do Texto</label>
                                        <input 
                                            name="textColor"
                                            type="color" 
                                            defaultValue={editingLink?.textColor || '#ffffff'}
                                            className="w-full h-10 border border-slate-300 rounded-md"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowLinkEditorModal(false)} 
                                    className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-slate-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-900"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}