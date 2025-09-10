'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Crop, Wand2, MessageCircle, Instagram, Facebook, Link as LinkIcon,
    ShoppingCart, Globe, Wifi, DollarSign, BookOpen, MapPin, Phone, Mail, Info,
    Star, Image as ImageIcon, Video, PlusCircle, Edit, Trash2, Smartphone, CreditCard,
    User, Circle, Square
} from 'lucide-react';
import Image from 'next/image';

// Imports dinâmicos para bibliotecas que usam DOM
let QRCode: any = null;
let Cropper: any = null;

// --- Tipos de Dados ---
type SocialLinks = { [key: string]: string };

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
    socialLinks?: SocialLinks; 
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

// Configuração das redes sociais
const socialMediaConfig: { [key: string]: { icon: IconName; baseUrl: string } } = {
    whatsapp: { icon: 'message-circle', baseUrl: 'https://wa.me/' },
    instagram: { icon: 'instagram', baseUrl: 'https://instagram.com/' },
    facebook: { icon: 'facebook', baseUrl: 'https://facebook.com/' },
    tiktok: { icon: 'video', baseUrl: 'https://tiktok.com/@' },
};

// --- Componentes ---
const LucideIcon = ({ name, size = 24, className, ...props }: { 
    name: IconName; 
    size?: number; 
    className?: string; 
    [key: string]: string | number | undefined;
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
    return IconComponent ? <IconComponent size={size} className={className} {...props} /> : null;
};

interface LinkEditorModalProps {
    initialData?: Partial<Omit<CustomLink, 'id'>>;
    link: CustomLink | null;
    onSave: (data: Omit<CustomLink, 'id'>) => void;
    onClose: () => void;
    icons: string[];
}

const LinkEditorModal = ({ initialData, link, onSave, onClose, icons }: LinkEditorModalProps) => {
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
            alert('Texto e URL são obrigatórios.'); 
            return;
        }
        onSave(data);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4">
                <h2 className="text-2xl font-bold">{link ? 'Editar Botão' : 'Adicionar Novo Botão'}</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Texto do Botão</label>
                    <input 
                        type="text" 
                        value={data.text} 
                        onChange={e => setData({...data, text: e.target.value})} 
                        placeholder="Ex: Catálogo" 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">URL / Link</label>
                    <input 
                        type="text" 
                        value={data.url} 
                        onChange={e => setData({...data, url: e.target.value})} 
                        placeholder="https://..." 
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ícone</label>
                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-md">
                        {icons.map(icon => (
                            <div 
                                key={icon} 
                                onClick={() => setData({...data, icon})} 
                                className={`icon-picker-item p-2 border rounded-md flex items-center justify-center cursor-pointer hover:bg-amber-100 ${data.icon === icon ? 'selected' : ''}`}
                            >
                                <LucideIcon name={icon as IconName} size={20}/>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center">
                        <input 
                            id="gradient-toggle" 
                            type="checkbox" 
                            checked={data.styleType === 'gradient'} 
                            onChange={e => setData({...data, styleType: e.target.checked ? 'gradient' : 'solid'})} 
                            className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                        />
                        <label htmlFor="gradient-toggle" className="ml-2 block text-sm text-gray-900">
                            Usar fundo gradiente
                        </label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo 1</label>
                            <input 
                                type="color" 
                                value={data.bgColor1} 
                                onChange={e => setData({...data, bgColor1: e.target.value})} 
                                className="w-full h-10 border border-slate-300 rounded-md"
                            />
                        </div>
                        <div style={{display: data.styleType === 'gradient' ? 'block' : 'none'}}>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cor de Fundo 2</label>
                            <input 
                                type="color" 
                                value={data.bgColor2} 
                                onChange={e => setData({...data, bgColor2: e.target.value})} 
                                className="w-full h-10 border border-slate-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cor do Texto</label>
                            <input 
                                type="color" 
                                value={data.textColor} 
                                onChange={e => setData({...data, textColor: e.target.value})} 
                                className="w-full h-10 border border-slate-300 rounded-md"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button 
                        onClick={onClose} 
                        className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        className="bg-slate-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-900"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ModalProps {
    onClose: () => void; 
    onSave: (data: Omit<CustomLink, 'id'>) => void;
}

const WifiConfigModal = ({ onClose, onSave }: ModalProps) => {
    const [isSimple, setIsSimple] = useState(true);

    const handleSave = () => {
        let linkData;
        if (isSimple) {
            const password = (document.getElementById('wifi-password-simple') as HTMLInputElement)?.value?.trim();
            if (!password) { 
                alert("Preencha a senha da rede."); 
                return; 
            }
            linkData = { text: 'Copiar Senha do Wi-Fi', url: `copy:${password}` };
        } else {
            const ssid = (document.getElementById('wifi-ssid') as HTMLInputElement)?.value?.trim();
            const security = (document.getElementById('wifi-security') as HTMLSelectElement)?.value;
            const password = (document.getElementById('wifi-password-advanced') as HTMLInputElement)?.value?.trim();
            if (!ssid) { 
                alert("Preencha o nome da rede (SSID)."); 
                return; 
            }
            linkData = { text: 'Conectar ao Wi-Fi', url: `WIFI:S:${ssid};T:${security};P:${password};;` };
        }
        onSave({ 
            ...linkData, 
            icon: 'wifi', 
            styleType: 'solid' as const, 
            bgColor1: '#1e293b', 
            bgColor2: '#475569', 
            textColor: '#ffffff' 
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4">
                <h2 className="text-2xl font-bold">Configurar Botão Wi-Fi</h2>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <button 
                            onClick={() => setIsSimple(true)} 
                            className={`tab-btn whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                isSimple ? 'active' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Simples (Copiar Senha)
                        </button>
                        <button 
                            onClick={() => setIsSimple(false)} 
                            className={`tab-btn whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                !isSimple ? 'active' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Avançado (Conectar)
                        </button>
                    </nav>
                </div>
                <div className={isSimple ? '' : 'hidden'}>
                    <p className="text-sm text-slate-600 mb-3">
                        Crie um botão que copia a senha do Wi-Fi. A senha não ficará visível para o visitante.
                    </p>
                    <div>
                        <label htmlFor="wifi-password-simple" className="block text-sm font-medium text-slate-700 mb-1">
                            Senha da Rede
                        </label>
                        <input 
                            type="text" 
                            id="wifi-password-simple" 
                            placeholder="Digite a senha do Wi-Fi" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        />
                    </div>
                </div>
                <div className={`space-y-3 ${!isSimple ? '' : 'hidden'}`}>
                    <p className="text-sm text-slate-600 mb-3">
                        Crie um botão para conexão automática. Preencha os dados exatamente como aparecem no seu roteador.
                    </p>
                    <div>
                        <label htmlFor="wifi-ssid" className="block text-sm font-medium text-slate-700 mb-1">
                            Nome da Rede (SSID)
                        </label>
                        <input 
                            type="text" 
                            id="wifi-ssid" 
                            placeholder="NomeExatoDaSuaRede" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="wifi-security" className="block text-sm font-medium text-slate-700 mb-1">
                            Tipo de Segurança
                        </label>
                        <select id="wifi-security" className="w-full px-3 py-2 border border-slate-300 rounded-md">
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">Nenhuma</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="wifi-password-advanced" className="block text-sm font-medium text-slate-700 mb-1">
                            Senha da Rede
                        </label>
                        <input 
                            type="text" 
                            id="wifi-password-advanced" 
                            placeholder="SenhaExataDaSuaRede" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button 
                        onClick={onClose} 
                        className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="bg-slate-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-900"
                    >
                        Salvar Botão
                    </button>
                </div>
            </div>
        </div>
    );
};

const PixConfigModal = ({ onClose, onSave }: ModalProps) => {
    const [isSimple, setIsSimple] = useState(true);

    const handleSave = () => {
        let linkData;
        if (isSimple) {
            const keyType = (document.getElementById('pix-key-type') as HTMLSelectElement)?.value;
            const key = (document.getElementById('pix-key-simple') as HTMLInputElement)?.value?.trim();
            if (!key) { 
                alert("Preencha sua chave PIX."); 
                return; 
            }
            linkData = { text: `PIX: ${keyType}`, url: `copy:${key}` };
        } else {
            const pixCode = (document.getElementById('pix-code-advanced') as HTMLTextAreaElement)?.value?.trim();
            if (!pixCode) { 
                alert("Preencha o código 'PIX Copia e Cola'."); 
                return; 
            }
            linkData = { text: 'Pagar com PIX (Copia e Cola)', url: `pix:${pixCode}` };
        }
        onSave({ 
            ...linkData, 
            icon: 'dollar-sign', 
            styleType: 'solid' as const, 
            bgColor1: '#10b981', 
            bgColor2: '#059669', 
            textColor: '#ffffff' 
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4">
                <h2 className="text-2xl font-bold">Configurar Botão PIX</h2>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <button 
                            onClick={() => setIsSimple(true)} 
                            className={`tab-btn whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                isSimple ? 'active' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Chave Simples
                        </button>
                        <button 
                            onClick={() => setIsSimple(false)} 
                            className={`tab-btn whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                                !isSimple ? 'active' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            PIX Copia e Cola
                        </button>
                    </nav>
                </div>
                <div className={`space-y-3 ${isSimple ? '' : 'hidden'}`}>
                    <p className="text-sm text-slate-600 mb-3">Crie um botão para copiar sua chave PIX.</p>
                    <div>
                        <label htmlFor="pix-key-type" className="block text-sm font-medium text-slate-700 mb-1">
                            Tipo de Chave
                        </label>
                        <select id="pix-key-type" className="w-full px-3 py-2 border border-slate-300 rounded-md">
                            <option>Celular</option>
                            <option>E-mail</option>
                            <option>CPF</option>
                            <option>CNPJ</option>
                            <option>Aleatória</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="pix-key-simple" className="block text-sm font-medium text-slate-700 mb-1">
                            Sua Chave PIX
                        </label>
                        <input 
                            type="text" 
                            id="pix-key-simple" 
                            placeholder="Digite sua chave" 
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        />
                    </div>
                </div>
                <div className={`space-y-3 ${!isSimple ? '' : 'hidden'}`}>
                    <p className="text-sm text-slate-600 mb-3">
                        Cole o código &quot;PIX Copia e Cola&quot; gerado pelo seu banco.
                    </p>
                    <div>
                        <label htmlFor="pix-code-advanced" className="block text-sm font-medium text-slate-700 mb-1">
                            Código PIX &quot;Copia e Cola&quot;
                        </label>
                        <textarea 
                            id="pix-code-advanced" 
                            rows={3} 
                            placeholder="00020126..." 
                            className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button 
                        onClick={onClose} 
                        className="bg-slate-200 text-slate-800 font-bold py-2 px-6 rounded-lg hover:bg-slate-300"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="bg-slate-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-900"
                    >
                        Salvar Botão
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal da Página ---
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
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>('https://www.google.com/search?q=https://placehold.co/150x150/e2e8f0/64748b%3Ftext%3DLogo');
    const qrcodePreviewRef = useRef<HTMLDivElement>(null);
    const cropperImageRef = useRef<HTMLImageElement>(null);
    const [cropper, setCropper] = useState<any>(null);
    const [showCropperModal, setShowCropperModal] = useState(false);
    const [showLinkEditorModal, setShowLinkEditorModal] = useState(false);
    const [showWifiModal, setShowWifiModal] = useState(false);
    const [showPixModal, setShowPixModal] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [editingLink, setEditingLink] = useState<CustomLink | null>(null);
    const [isClient, setIsClient] = useState(false);

    const commonEmojis = ['✨', '🚀', '⭐', '❤️', '✅', '👇', '📱', '📞', '💡', '🔥', '🎉', '👋'];
    const availableIcons = [ 
        'shopping-cart', 'link', 'dollar-sign', 'wifi', 'globe', 'book-open', 
        'map-pin', 'phone', 'mail', 'info', 'star', 'image', 'video' 
    ];

    // Carregamento dinâmico das bibliotecas apenas no cliente
    useEffect(() => {
        setIsClient(true);
        
        const loadLibraries = async () => {
            try {
                const [qrcodeModule, cropperModule] = await Promise.all([
                    import('qrcodejs2'),
                    import('cropperjs')
                ]);
                
                QRCode = qrcodeModule.default;
                Cropper = cropperModule.default;
                
                // Importa CSS do cropper apenas no cliente
                await import('cropperjs/dist/cropper.css');
            } catch (error) {
                console.error('Erro ao carregar bibliotecas:', error);
            }
        };
        
        loadLibraries();
    }, []);

    useEffect(() => {
        if (QRCode && qrcodePreviewRef.current && subdomain && isClient) {
            qrcodePreviewRef.current.innerHTML = '';
            new QRCode(qrcodePreviewRef.current, {
                text: `https://${subdomain}.meuzag.com`, 
                width: 256, 
                height: 256,
            });
        }
    }, [subdomain, isClient]);

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
        if (!logoDataUrl || logoDataUrl.startsWith('https://placehold.co')) {
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

    const openCropper = () => { 
        if (logoDataUrl) setShowCropperModal(true); 
    };

    useEffect(() => {
        if (showCropperModal && cropperImageRef.current && !cropper && Cropper && isClient) {
            const instance = new Cropper(cropperImageRef.current, { 
                aspectRatio: 1, 
                viewMode: 1, 
                background: false 
            });
            setCropper(instance);
        } else if (!showCropperModal && cropper) {
            cropper.destroy(); 
            setCropper(null);
        }
    }, [showCropperModal, cropper, logoDataUrl, isClient]);

    const handleSaveCrop = () => {
        if (cropper) {
            const dataUrl = cropper.getCroppedCanvas({ width: 512, height: 512 }).toDataURL('image/png');
            setLogoDataUrl(dataUrl);
            setShowCropperModal(false);
        }
    };

    type LinkEditorData = Partial<Omit<CustomLink, 'id'>>;

    const openLinkEditor = (link: CustomLink | null = null, defaults: Partial<Omit<CustomLink, 'id'>> = {}) => {
        setEditingLink(link);
        const initialData: LinkEditorData = link ? { ...link } : {
            text: defaults.text || '', 
            url: defaults.url || '', 
            icon: defaults.icon || null,
            styleType: defaults.styleType || 'solid', 
            bgColor1: defaults.bgColor1 || '#1e293b',
            bgColor2: defaults.bgColor2 || '#475569', 
            textColor: defaults.textColor || '#ffffff',
        };
        if (typeof window !== 'undefined') {
            (window as { _linkEditorData?: LinkEditorData })._linkEditorData = initialData;
        }
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