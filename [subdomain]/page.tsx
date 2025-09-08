'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import QRCode from 'qrcodejs2';
import ColorThief from 'color-thief-ts';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { 
    Upload, Crop, Wand2, MessageCircle, Instagram, Facebook, Link as LinkIcon, 
    ShoppingCart, Globe, Wifi, DollarSign, BookOpen, MapPin, Phone, Mail, Info, 
    Star, Image as ImageIcon, Video, PlusCircle, Edit, Trash2, Smartphone, CreditCard, 
    User, Circle, Square, Edit2, Key, AtSign, Hash, Banknote
} from 'lucide-react';
import Image from 'next/image';

// --- Tipos de Dados ---
type SocialLinks = { [key: string]: string };
type CustomLink = {
    id: number; text: string; url: string; icon: string | null;
    styleType: 'solid' | 'gradient'; bgColor1: string; bgColor2: string; textColor: string;
};
type PageConfig = {
    cardText?: string; isTextEnabled?: boolean; cardBgColor?: string; cardTextColor?: string;
    cardBackBgColor?: string; logoSize?: number; qrCodeSize?: number; clientLogoBackSize?: number;
    qrCodePosition?: string; socialLinks?: SocialLinks; customLinks?: CustomLink[];
    landingPageBgColor?: string; landingPageBgImage?: string | null; landingPageTitleText?: string;
    landingPageSubtitleText?: string; landingPageLogoShape?: 'circle' | 'square'; landingPageLogoSize?: number;
};

// --- Componente Principal ---
export default function DashboardPage() {
    // --- Estados ---
    const [config, setConfig] = useState<PageConfig>({
        cardText: '', isTextEnabled: false, cardBgColor: '#FFFFFF', cardTextColor: '#1e293b',
        cardBackBgColor: '#e2e8f0', logoSize: 60, qrCodeSize: 35, clientLogoBackSize: 35,
        qrCodePosition: 'justify-start', socialLinks: {}, customLinks: [], landingPageBgColor: '#F8FAFC',
        landingPageBgImage: null, landingPageTitleText: '', landingPageSubtitleText: '',
        landingPageLogoShape: 'circle', landingPageLogoSize: 96,
    });
    
    const [activeStep, setActiveStep] = useState(1);
    const [subdomain, setSubdomain] = useState('');
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>('https://placehold.co/150x150/e2e8f0/64748b?text=Logo');
    
    // Refs
    const qrcodePreviewRef = useRef<HTMLDivElement>(null);
    const cropperImageRef = useRef<HTMLImageElement>(null);
    const [cropper, setCropper] = useState<Cropper | null>(null);
    
    // UI States
    const [isSaving, setIsSaving] = useState(false);
    const [showCropperModal, setShowCropperModal] = useState(false);
    const [showLinkEditorModal, setShowLinkEditorModal] = useState(false);
    const [showWifiModal, setShowWifiModal] = useState(false);
    const [showPixModal, setShowPixModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    const [editingLink, setEditingLink] = useState<CustomLink | null>(null);
    
    const supabase = createClientComponentClient();

    const commonEmojis = ['✨', '🚀', '⭐', '❤️', '✅', '👇', '📍', '📞', '💡', '🔥', '🎉', '👋'];
    const availableIcons = [ 'shopping-cart', 'link', 'dollar-sign', 'wifi', 'globe', 'book-open', 'map-pin', 'phone', 'mail', 'info', 'star', 'image', 'video' ];
    
    // --- Efeitos ---
    useEffect(() => {
        if (qrcodePreviewRef.current && subdomain) {
            qrcodePreviewRef.current.innerHTML = '';
            new QRCode(qrcodePreviewRef.current, {
                text: `https://${subdomain}.meuzag.com`, width: 256, height: 256,
            });
        }
    }, [subdomain]);

    // --- Handlers ---
    const handleConfigChange = (key: keyof PageConfig, value: any) => {
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
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setLogoDataUrl(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSaveAll = async () => {
        setIsSaving(true);
        console.log("Salvando configuração:", { subdomain, config });
        // Lógica de salvamento com Supabase aqui
        setTimeout(() => {
            setIsSaving(false);
            alert("Configurações salvas com sucesso! (Simulação)");
        }, 1500);
    };

    const handleNextStep = () => {
         if (!logoDataUrl || logoDataUrl.startsWith('https://placehold.co')) {
            alert('É necessário fazer o upload de uma logo.'); return;
        }
        if (!subdomain.trim()) {
            alert('É necessário preencher o subdomínio.'); return;
        }
        setConfig(prev => ({ ...prev, landingPageTitleText: prev.cardText || 'Seu Título Aqui' }));
        setActiveStep(2);
    };

    // --- Modal Handlers ---
    const openCropper = () => { if (logoDataUrl) setShowCropperModal(true); };
    
    useEffect(() => {
        if (showCropperModal && cropperImageRef.current && !cropper) {
            const instance = new Cropper(cropperImageRef.current, { aspectRatio: 1, viewMode: 1, background: false });
            setCropper(instance);
        } else if (!showCropperModal && cropper) {
            cropper.destroy(); setCropper(null);
        }
    }, [showCropperModal, cropper, logoDataUrl]);

    const handleSaveCrop = () => {
        if (cropper) {
            const dataUrl = cropper.getCroppedCanvas({ width: 512, height: 512 }).toDataURL('image/png');
            setLogoDataUrl(dataUrl);
            setShowCropperModal(false);
        }
    };
    
    const openLinkEditor = (link: CustomLink | null = null, defaults: Partial<Omit<CustomLink, 'id'>> = {}) => {
        setEditingLink(link);
        const initialData = link ? { ...link } : {
            text: defaults.text || '',
            url: defaults.url || '',
            icon: defaults.icon || null,
            styleType: defaults.styleType || 'solid',
            bgColor1: defaults.bgColor1 || '#1e293b',
            bgColor2: defaults.bgColor2 || '#475569',
            textColor: defaults.textColor || '#ffffff',
        };
        (window as any)._linkEditorData = initialData; // Store temp data
        setShowLinkEditorModal(true);
    };
    
    const saveCustomLink = (linkData: Omit<CustomLink, 'id'>) => {
        if (editingLink) {
            handleConfigChange('customLinks', config.customLinks?.map(l => l.id === editingLink.id ? { ...l, ...linkData } : l));
        } else {
             if ((config.customLinks?.length || 0) >= 4) {
                alert('Você pode adicionar no máximo 4 links personalizados.'); return;
            }
            handleConfigChange('customLinks', [...(config.customLinks || []), { ...linkData, id: Date.now() }]);
        }
        setShowLinkEditorModal(false); setEditingLink(null);
    };
    
    const deleteCustomLink = (id: number) => {
        handleConfigChange('customLinks', config.customLinks?.filter(l => l.id !== id));
    };
    
    const LucideIcon = ({ name, ...props }: { name: string, [key: string]: any }) => {
        const icons: { [key: string]: React.ElementType } = { 
            'message-circle': MessageCircle, 'instagram': Instagram, 'facebook': Facebook, 
            'shopping-cart': ShoppingCart, 'link': LinkIcon, 'dollar-sign': DollarSign, 
            'wifi': Wifi, 'globe': Globe, 'book-open': BookOpen, 'map-pin': MapPin, 
            'phone': Phone, 'mail': Mail, 'info': Info, 'star': Star, 'image': ImageIcon, 
            'video': Video, 'plus-circle': PlusCircle, 'edit': Edit, 'trash-2': Trash2,
            'user': User, 'circle': Circle, 'square': Square, 'edit-2': Edit2, 'key': Key,
            'at-sign': AtSign, 'hash': Hash, 'banknote': Banknote,
        };
        const IconComponent = icons[name];
        return IconComponent ? <IconComponent {...props} /> : null;
    };

    // --- Renderização ---
    return (
        <>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex items-center space-x-4">
                    <Image src="/logo.png" alt="Logo Zag Card" width={64} height={64} className="h-12 w-auto rounded-lg"/>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Configure seu Zag Card</h1>
                        <p className="text-slate-500 mt-1">Siga as etapas para personalizar seu produto.</p>
                    </div>
                </header>

                <div className="flex items-center justify-center space-x-4 md:space-x-8 mb-8">
                    <div className={`flex items-center space-x-2 border-b-4 pb-2 transition-all duration-300 ${activeStep === 1 ? 'step-active' : 'step-complete'}`}>
                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold"><CreditCard size={16}/></div>
                        <span className="font-semibold hidden md:block">Design do Cartão</span>
                    </div>
                    <div className="flex-1 border-t-2 border-dashed border-slate-300"></div>
                    <div className={`flex items-center space-x-2 border-b-4 pb-2 transition-all duration-300 ${activeStep === 2 ? 'step-active' : 'step-inactive'}`}>
                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold"><Smartphone size={16}/></div>
                        <span className="font-semibold hidden md:block">Landing Page</span>
                    </div>
                </div>

                <main id="workspace">
                    <div className={activeStep === 1 ? '' : 'hidden'}>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <p className="text-center font-semibold mb-4">Frente</p>
                                <div style={{ backgroundColor: config.cardBgColor }} className="card-preview mx-auto rounded-xl shadow-lg flex flex-col items-center justify-center p-4 transition-colors duration-300 border">
                                    <img src={logoDataUrl || ''} alt="Logo Preview" className="object-contain mb-2" style={{ width: `${config.logoSize}%`, height: `${config.logoSize}%` }}/>
                                    {config.isTextEnabled && <p style={{color: config.cardTextColor}} className="font-semibold text-lg text-center">{config.cardText}</p>}
                                </div>
                                <div className="mt-6 space-y-4 max-w-sm mx-auto">
                                    <h3 className="font-bold text-lg border-b pb-2">Personalizar Frente</h3>
                                    <div>
                                        <label htmlFor="logo-upload" className="block text-sm font-medium text-slate-700 mb-1">Logo da Empresa</label>
                                        <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"/>
                                        <p className="text-xs text-slate-400 mt-1">Tamanho máximo: 5MB.</p>
                                    </div>
                                    <div className={`grid grid-cols-2 gap-2 text-sm ${!logoDataUrl || logoDataUrl.startsWith('https://placehold.co') ? 'hidden' : ''}`}>
                                        <button onClick={openCropper} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 p-2 rounded-md"><Crop className="w-4 h-4"/> Recortar Logo</button>
                                        <a href="https://www.remove.bg/upload" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 p-2 rounded-md"><Wand2 className="w-4 h-4"/> Remover Fundo</a>
                                    </div>
                                     <div>
                                        <label htmlFor="logo-size-slider" className="block text-sm font-medium text-slate-700 mb-1">Tamanho da Logo</label>
                                        <input id="logo-size-slider" type="range" min="30" max="90" value={config.logoSize} onChange={(e) => handleConfigChange('logoSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                                    </div>
                                    <div>
                                        <div className="flex items-center mb-2">
                                            <input id="text-enabled-checkbox" type="checkbox" checked={config.isTextEnabled} onChange={(e) => handleConfigChange('isTextEnabled', e.target.checked)} className="h-4 w-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"/>
                                            <label htmlFor="text-enabled-checkbox" className="ml-2 block text-sm font-medium text-slate-700">Adicionar texto?</label>
                                        </div>
                                        <input type="text" id="card-text" placeholder="Seu Nome ou Empresa" value={config.cardText} onChange={(e) => handleConfigChange('cardText', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-slate-100" disabled={!config.isTextEnabled}/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="card-bg-color" className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo</label>
                                            <input type="color" id="card-bg-color" value={config.cardBgColor} onChange={(e) => handleConfigChange('cardBgColor', e.target.value)} className="w-full h-10 border border-slate-300 rounded-md"/>
                                        </div>
                                        <div>
                                            <label htmlFor="card-text-color" className="block text-sm font-medium text-slate-700 mb-1">Cor do Texto</label>
                                            <input type="color" id="card-text-color" value={config.cardTextColor} onChange={(e) => handleConfigChange('cardTextColor', e.target.value)} className="w-full h-10 border border-slate-300 rounded-md"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <p className="text-center font-semibold mb-4">Verso</p>
                                <div style={{backgroundColor: config.cardBackBgColor}} className="card-preview mx-auto rounded-xl shadow-lg p-4 border relative overflow-hidden">
                                    {logoDataUrl && <img src={logoDataUrl} alt="Logo Verso" className="object-contain absolute transition-all duration-300" style={{ opacity: 1, width: `${config.clientLogoBackSize}%`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}/>}
                                    <div className={`absolute inset-0 p-4 flex items-center ${config.qrCodePosition}`}>
                                        <div ref={qrcodePreviewRef} className="bg-white p-1 rounded-md aspect-square" style={{ width: `${config.qrCodeSize}%` }}></div>
                                    </div>
                                    <Image src="/logo.png" alt="Logo Zag Card" width={80} height={24} className="absolute bottom-3 right-3 h-5 w-auto object-contain"/>
                                </div>
                                 <div className="mt-6 space-y-4 max-w-sm mx-auto">
                                    <h3 className="font-bold text-lg border-b pb-2">Personalizar Verso</h3>
                                    <div>
                                        <label htmlFor="subdomain" className="block text-sm font-medium text-slate-700 mb-1">Seu Subdomínio</label>
                                        <div className="flex">
                                            <input type="text" id="subdomain" placeholder="sua-empresa" value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="w-full px-3 py-2 border border-slate-300 rounded-l-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"/>
                                            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">.meuzag.com</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="card-back-bg-color" className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo</label>
                                        <input type="color" id="card-back-bg-color" value={config.cardBackBgColor} onChange={(e) => handleConfigChange('cardBackBgColor', e.target.value)} className="w-full h-10 border border-slate-300 rounded-md"/>
                                    </div>
                                    <hr/>
                                    <div>
                                        <label htmlFor="qrcode-size-slider" className="block text-sm font-medium text-slate-700 mb-1">Tamanho do QR Code</label>
                                        <input id="qrcode-size-slider" type="range" min="25" max="50" value={config.qrCodeSize} onChange={(e) => handleConfigChange('qrCodeSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Posição do QR Code</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button onClick={() => handleConfigChange('qrCodePosition', 'justify-start')} className={`pos-btn border rounded p-2 text-xs ${config.qrCodePosition === 'justify-start' ? 'active' : ''}`}>Esquerda</button>
                                            <button onClick={() => handleConfigChange('qrCodePosition', 'justify-end')} className={`pos-btn border rounded p-2 text-xs ${config.qrCodePosition === 'justify-end' ? 'active' : ''}`}>Direita</button>
                                        </div>
                                    </div>
                                    <hr/>
                                    <div>
                                        <label htmlFor="client-logo-back-size-slider" className="block text-sm font-medium text-slate-700 mb-1">Tamanho da sua Logo (no verso)</label>
                                        <input id="client-logo-back-size-slider" type="range" min="20" max="70" value={config.clientLogoBackSize} onChange={(e) => handleConfigChange('clientLogoBackSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                                    </div>
                                 </div>
                             </div>
                         </div>
                        <div className="mt-8 flex justify-center">
                             <button onClick={handleNextStep} className="w-full max-w-md bg-slate-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-900 transition-colors duration-300">Próximo Passo</button>
                        </div>
                    </div>

                    {/* ETAPA 2: LANDING PAGE */}
                    <div className={activeStep === 2 ? '' : 'hidden'}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-y-auto" style={{maxHeight: '85vh'}}>
                               <div className="space-y-6">
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm font-medium text-blue-800">Design do cartão salvo! Agora, personalize a sua página de links.</p>
                                    </div>
                                    <fieldset className="border-t pt-4">
                                        <legend className="text-lg font-semibold text-slate-800 -mt-7 px-2 bg-white">Conteúdo da Página</legend>
                                        <div className="space-y-4 mt-4">
                                            <div>
                                                <label htmlFor="landing-title-input" className="block text-sm font-medium text-slate-700 mb-1">Título Principal</label>
                                                <input type="text" id="landing-title-input" value={config.landingPageTitleText} onChange={e => handleConfigChange('landingPageTitleText', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                                            </div>
                                            <div>
                                                <label htmlFor="landing-subtitle-input" className="block text-sm font-medium text-slate-700 mb-1">Subtítulo (opcional)</label>
                                                <div className="relative">
                                                    <input type="text" id="landing-subtitle-input" placeholder="Sua frase de efeito aqui ✨" value={config.landingPageSubtitleText} onChange={e => handleConfigChange('landingPageSubtitleText', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md pr-10"/>
                                                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-amber-600">☺</button>
                                                </div>
                                                {showEmojiPicker && (
                                                    <div className="grid grid-cols-8 gap-1 p-2 bg-white border rounded-lg shadow-lg mt-2 absolute z-10">
                                                        {commonEmojis.map(emoji => <button key={emoji} onClick={() => { handleConfigChange('landingPageSubtitleText', (config.landingPageSubtitleText || '') + emoji); setShowEmojiPicker(false); }} className="emoji-picker-item text-xl p-1 transition-transform duration-150 hover:scale-125">{emoji}</button>)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="pt-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Aparência da Logo</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button onClick={() => handleConfigChange('landingPageLogoShape', 'circle')} className={`shape-btn border rounded p-2 text-xs flex items-center justify-center gap-2 ${config.landingPageLogoShape === 'circle' ? 'active' : ''}`}><Circle size={14}/> Redonda</button>
                                                    <button onClick={() => handleConfigChange('landingPageLogoShape', 'square')} className={`shape-btn border rounded p-2 text-xs flex items-center justify-center gap-2 ${config.landingPageLogoShape === 'square' ? 'active' : ''}`}><Square size={14}/> Quadrada</button>
                                                </div>
                                            </div>
                                             <div>
                                                <label htmlFor="landing-logo-size-slider" className="block text-sm font-medium text-slate-700 mb-1">Tamanho da Logo na Página</label>
                                                <input id="landing-logo-size-slider" type="range" min="48" max="128" value={config.landingPageLogoSize} onChange={(e) => handleConfigChange('landingPageLogoSize', Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"/>
                                            </div>
                                        </div>
                                    </fieldset>
                                    
                                    <fieldset className="border-t pt-4">
                                        <legend className="text-lg font-semibold text-slate-800 -mt-7 px-2 bg-white">Links Personalizados (até 4)</legend>
                                        <div className="space-y-4 mt-4">
                                            <div>
                                                <p className="text-sm font-medium text-slate-700 mb-2">Sugestões rápidas:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <button onClick={() => { openLinkEditor(null, {text: 'Catálogo'}); }} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300">Catálogo</button>
                                                    <button onClick={() => { openLinkEditor(null, {text: 'Website'});}} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300">Website</button>
                                                    <button onClick={() => setShowPixModal(true)} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300">PIX</button>
                                                    <button onClick={() => setShowWifiModal(true)} className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-sm hover:bg-slate-300">Senha Wifi</button>
                                                </div>
                                            </div>
                                            
                                            <button onClick={() => openLinkEditor(null)} className="w-full bg-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-600 flex items-center justify-center gap-2">
                                                <PlusCircle/> Adicionar Novo Botão
                                            </button>
                                            <div id="links-list" className="space-y-2">
                                                {config.customLinks?.map(link => (
                                                    <div key={link.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                                                        <div className="flex items-center gap-2">
                                                           {link.icon && <LucideIcon name={link.icon} className="w-5 h-5 text-slate-600" />}
                                                           <span className="text-sm font-medium">{link.text}</span>
                                                        </div>
                                                        <div>
                                                            <button onClick={() => openLinkEditor(link)} className="p-1 text-slate-500 hover:text-slate-800"><Edit size={16}/></button>
                                                            <button onClick={() => deleteCustomLink(link.id)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
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
                                <div className="phone-preview bg-white flex flex-col overflow-hidden">
                                    <div className="flex-shrink-0 mx-auto mt-2"><div className="phone-notch"></div></div>
                                    <div id="phone-content-preview" style={{backgroundColor: config.landingPageBgColor, backgroundImage: config.landingPageBgImage ? `url('${config.landingPageBgImage}')` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} className="flex-grow overflow-y-auto preview-content p-4">
                                        <div className="flex flex-col items-center text-center">
                                            <img src={logoDataUrl || ''} alt="Logo Preview" className={`object-contain mb-4 shadow-md ${config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`} style={{width: `${config.landingPageLogoSize}px`, height: `${config.landingPageLogoSize}px`}} />
                                            <h1 className="text-2xl font-bold text-slate-800 break-words">{config.landingPageTitleText}</h1>
                                            <p className={`text-slate-600 mt-1 px-4 break-words ${config.landingPageSubtitleText ? '' : 'hidden'}`}>{config.landingPageSubtitleText}</p>
                                            <div className="w-full mt-6 flex justify-center items-center space-x-4">
                                                {Object.entries(config.socialLinks || {}).map(([key, value]) => value && (
                                                    <a key={key} href="#" className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                                                        <LucideIcon name={(socialMediaConfig as any)[key]?.icon || 'link'} />
                                                    </a>
                                                ))}
                                            </div>
                                            <div className="w-full mt-6 space-y-3">
                                               {config.customLinks?.map(link => (
                                                    <a key={link.id} href="#" style={{color: link.textColor, background: link.styleType === 'gradient' ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` : link.bgColor1}} className="w-full flex items-center justify-center gap-3 font-semibold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105">
                                                        {link.icon && <LucideIcon name={link.icon} className="w-5 h-5 flex-shrink-0" />}
                                                        <span>{link.text}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                         </div>
                         <div className="mt-8 flex justify-center">
                             <button onClick={handleSaveAll} disabled={isSaving} className="w-full max-w-md bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-300 disabled:bg-green-400">
                                 {isSaving ? 'Salvando...' : 'Salvar e Publicar'}
                             </button>
                        </div>
                    </div>
                </main>
            </div>
            {/* Modais */}
            {showCropperModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4">
                        <h2 className="text-2xl font-bold">Recortar Logo</h2>
                        <div className="w-full h-64 bg-slate-100"><img ref={cropperImageRef} src={logoDataUrl || ''} className="max-w-full"/></div>
                        <div className="flex justify-end gap-4 pt-4">
                            <button onClick={() => setShowCropperModal(false)} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300">Cancelar</button>
                            <button onClick={handleSaveCrop} className="bg-slate-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-900">Salvar Recorte</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showLinkEditorModal && <LinkEditorModal initialData={(window as any)._linkEditorData} link={editingLink} onSave={saveCustomLink} onClose={() => setShowLinkEditorModal(false)} icons={availableIcons} />}
            {showWifiModal && <WifiConfigModal onClose={() => setShowWifiModal(false)} onSave={(linkData) => {saveCustomLink(linkData); setShowWifiModal(false);}} />}
            {showPixModal && <PixConfigModal onClose={() => setShowPixModal(false)} onSave={(linkData) => {saveCustomLink(linkData); setShowPixModal(false);}} />}
        </>
    );
}

// --- Componentes de Modal ---

const LinkEditorModal = ({ initialData, link, onSave, onClose, icons }: { initialData?: Partial<Omit<CustomLink, 'id'>>, link: CustomLink | null, onSave: (data: Omit<CustomLink, 'id'>) => void, onClose: () => void, icons: string[] }) => {
    const [data, setData] = useState({
        text: link?.text || initialData?.text || '',
        url: link?.url || '',
        icon: link?.icon || null,
        styleType: link?.styleType || 'solid',
        bgColor1: link?.bgColor1 || '#1e293b',
        bgColor2: link?.bgColor2 || '#475569',
        textColor: link?.textColor || '#ffffff',
    });

    const handleSubmit = () => {
        if (!data.text || !data.url) {
            alert('Texto e URL são obrigatórios.'); return;
        }
        onSave(data);
    };
    
    const LucideIcon = ({ name, ...props }: { name: string, [key: string]: any }) => {
        const iconsMap: { [key: string]: React.ElementType } = { 'shopping-cart': ShoppingCart, 'link': LinkIcon, 'dollar-sign': DollarSign, 'wifi': Wifi, 'globe': Globe, 'book-open': BookOpen, 'map-pin': MapPin, 'phone': Phone, 'mail': Mail, 'info': Info, 'star': Star, 'image': ImageIcon, 'video': Video };
        const Icon = iconsMap[name];
        return Icon ? <Icon {...props} /> : null;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4">
                <h2 className="text-2xl font-bold">{link ? 'Editar Botão' : 'Adicionar Novo Botão'}</h2>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Texto do Botão</label>
                    <input type="text" value={data.text} onChange={e => setData({...data, text: e.target.value})} placeholder="Ex: Catálogo" className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">URL / Link</label>
                    <input type="text" value={data.url} onChange={e => setData({...data, url: e.target.value})} placeholder="https://..." className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ícone</label>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-md">
                        {icons.map(icon => (
                            <div key={icon} onClick={() => setData({...data, icon})} className={`icon-picker-item p-2 border rounded-md flex items-center justify-center cursor-pointer hover:bg-amber-100 ${data.icon === icon ? 'selected' : ''}`}>
                                <LucideIcon name={icon} size={20}/>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center">
                        <input id="gradient-toggle" type="checkbox" checked={data.styleType === 'gradient'} onChange={e => setData({...data, styleType: e.target.checked ? 'gradient' : 'solid'})} className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"/>
                        <label htmlFor="gradient-toggle" className="ml-2 block text-sm text-gray-900">Usar fundo gradiente</label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo 1</label>
                            <input type="color" value={data.bgColor1} onChange={e => setData({...data, bgColor1: e.target.value})} className="w-full h-10 border border-slate-300 rounded-md"/>
                        </div>
                        <div style={{display: data.styleType === 'gradient' ? 'block' : 'none'}}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo 2</label>
                            <input type="color" value={data.bgColor2} onChange={e => setData({...data, bgColor2: e.target.value})} className="w-full h-10 border border-slate-300 rounded-md"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cor do Texto</label>
                            <input type="color" value={data.textColor} onChange={e => setData({...data, textColor: e.target.value})} className="w-full h-10 border border-slate-300 rounded-md"/>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300">Cancelar</button>
                    <button onClick={handleSubmit} className="bg-slate-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-900">Salvar</button>
                </div>
            </div>
        </div>
    );
};

const WifiConfigModal = ({ onClose, onSave }: { onClose: () => void, onSave: (data: Omit<CustomLink, 'id'>) => void }) => {
    const [isSimple, setIsSimple] = useState(true);

    const handleSave = () => {
        let linkData;
        if (isSimple) {
            const password = (document.getElementById('wifi-password-simple') as HTMLInputElement).value.trim();
            if (!password) { alert("Preencha a senha da rede."); return; }
            linkData = { text: 'Copiar Senha do Wi-Fi', url: `copy:${password}` };
        } else {
            const ssid = (document.getElementById('wifi-ssid') as HTMLInputElement).value.trim();
            const security = (document.getElementById('wifi-security') as HTMLSelectElement).value;
            const password = (document.getElementById('wifi-password-advanced') as HTMLInputElement).value.trim();
            if (!ssid) { alert("Preencha o nome da rede (SSID)."); return; }
            linkData = { text: 'Conectar ao Wi-Fi', url: `WIFI:S:${ssid};T:${security};P:${password};;` };
        }
        onSave({ ...linkData, icon: 'wifi', styleType: 'solid', bgColor1: '#1e293b', bgColor2: '#475569', textColor: '#ffffff' });
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4">
                <h2 className="text-2xl font-bold">Configurar Botão Wi-Fi</h2>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <button onClick={() => setIsSimple(true)} className={`tab-btn whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${isSimple ? 'active' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Simples (Copiar Senha)</button>
                        <button onClick={() => setIsSimple(false)} className={`tab-btn whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${!isSimple ? 'active' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Avançado (Conectar)</button>
                    </nav>
                </div>
                <div className={isSimple ? '' : 'hidden'}>
                    <p className="text-sm text-slate-600 mb-3">Crie um botão que copia a senha do Wi-Fi. A senha não ficará visível para o visitante.</p>
                    <div>
                        <label htmlFor="wifi-password-simple" className="block text-sm font-medium text-slate-700 mb-1">Senha da Rede</label>
                        <input type="text" id="wifi-password-simple" placeholder="Digite a senha do Wi-Fi" className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                    </div>
                </div>
                <div className={`space-y-3 ${!isSimple ? '' : 'hidden'}`}>
                    <p className="text-sm text-slate-600 mb-3">Crie um botão para conexão automática. Preencha os dados exatamente como aparecem no seu roteador.</p>
                     <div>
                        <label htmlFor="wifi-ssid" className="block text-sm font-medium text-slate-700 mb-1">Nome da Rede (SSID)</label>
                        <input type="text" id="wifi-ssid" placeholder="NomeExatoDaSuaRede" className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="wifi-security" className="block text-sm font-medium text-slate-700 mb-1">Tipo de Segurança</label>
                         <select id="wifi-security" className="w-full px-3 py-2 border border-slate-300 rounded-md">
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">Nenhuma</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="wifi-password-advanced" className="block text-sm font-medium text-slate-700 mb-1">Senha da Rede</label>
                        <input type="text" id="wifi-password-advanced" placeholder="SenhaExataDaSuaRede" className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                    </div>
                </div>
                 <div className="flex justify-end gap-4 pt-4">
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300">Cancelar</button>
                    <button onClick={handleSave} className="bg-slate-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-900">Salvar Botão</button>
                </div>
            </div>
        </div>
    )
};

const PixConfigModal = ({ onClose, onSave }: { onClose: () => void, onSave: (data: Omit<CustomLink, 'id'>) => void }) => {
    const [isSimple, setIsSimple] = useState(true);

    const handleSave = () => {
        let linkData;
        if (isSimple) {
            const keyType = (document.getElementById('pix-key-type') as HTMLSelectElement).value;
            const key = (document.getElementById('pix-key-simple') as HTMLInputElement).value.trim();
            if (!key) { alert("Preencha sua chave PIX."); return; }
            linkData = { text: `PIX: ${keyType}`, url: `copy:${key}` };
        } else {
            const pixCode = (document.getElementById('pix-code-advanced') as HTMLTextAreaElement).value.trim();
            if (!pixCode) { alert("Preencha o código 'PIX Copia e Cola'."); return; }
            linkData = { text: 'Pagar com PIX (Copia e Cola)', url: `pix:${pixCode}` };
        }
        onSave({ ...linkData, icon: 'dollar-sign', styleType: 'solid', bgColor1: '#10b981', bgColor2: '#059669', textColor: '#ffffff' });
    };
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4">
                <h2 className="text-2xl font-bold">Configurar Botão PIX</h2>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <button onClick={() => setIsSimple(true)} className={`tab-btn whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${isSimple ? 'active' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Chave Simples</button>
                        <button onClick={() => setIsSimple(false)} className={`tab-btn whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${!isSimple ? 'active' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>PIX Copia e Cola</button>
                    </nav>
                </div>
                <div className={`space-y-3 ${isSimple ? '' : 'hidden'}`}>
                    <p className="text-sm text-slate-600 mb-3">Crie um botão para copiar sua chave PIX.</p>
                    <div>
                        <label htmlFor="pix-key-type" className="block text-sm font-medium text-slate-700 mb-1">Tipo de Chave</label>
                        <select id="pix-key-type" className="w-full px-3 py-2 border border-slate-300 rounded-md">
                            <option>Celular</option>
                            <option>E-mail</option>
                            <option>CPF</option>
                            <option>CNPJ</option>
                            <option>Aleatória</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="pix-key-simple" className="block text-sm font-medium text-slate-700 mb-1">Sua Chave PIX</label>
                        <input type="text" id="pix-key-simple" placeholder="Digite sua chave" className="w-full px-3 py-2 border border-slate-300 rounded-md"/>
                    </div>
                </div>
                <div className={`space-y-3 ${!isSimple ? '' : 'hidden'}`}>
                    <p className="text-sm text-slate-600 mb-3">Cole o código "PIX Copia e Cola" gerado pelo seu banco.</p>
                     <div>
                        <label htmlFor="pix-code-advanced" className="block text-sm font-medium text-slate-700 mb-1">Código PIX "Copia e Cola"</label>
                        <textarea id="pix-code-advanced" rows={3} placeholder="00020126..." className="w-full px-3 py-2 border border-slate-300 rounded-md"></textarea>
                    </div>
                </div>
                 <div className="flex justify-end gap-4 pt-4">
                    <button onClick={onClose} className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300">Cancelar</button>
                    <button onClick={handleSave} className="bg-slate-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-900">Salvar Botão</button>
                </div>
            </div>
        </div>
    )
};

