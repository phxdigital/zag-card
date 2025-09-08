// app/[subdomain]/page.tsx

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import {
    MessageCircle, Instagram, Facebook, Link as LinkIcon, ShoppingCart, 
    Globe, Wifi, DollarSign, BookOpen, MapPin, Phone, Mail, Info, Star, Image as ImageIcon, Video 
} from 'lucide-react';

// Tipos para os dados, para garantir a consistência
type CustomLink = {
    id: number; text: string; url: string; icon: string | null;
    styleType: 'solid' | 'gradient'; bgColor1: string; bgColor2: string; textColor: string;
};
type PageConfig = {
    landingPageTitleText?: string;
    landingPageSubtitleText?: string;
    landingPageLogoShape?: 'circle' | 'square';
    landingPageLogoSize?: number;
    landingPageBgColor?: string;
    landingPageBgImage?: string | null;
    socialLinks?: { [key: string]: string };
    customLinks?: CustomLink[];
};

// Mapeamento de ícones para renderização segura
const LucideIcon = ({ name, ...props }: { name: string, [key: string]: any }) => {
    const icons: { [key: string]: React.ElementType } = {
        'message-circle': MessageCircle, 'instagram': Instagram, 'facebook': Facebook, 
        'shopping-cart': ShoppingCart, 'link': LinkIcon, 'dollar-sign': DollarSign, 
        'wifi': Wifi, 'globe': Globe, 'book-open': BookOpen, 'map-pin': MapPin, 
        'phone': Phone, 'mail': Mail, 'info': Info, 'star': Star, 'image': ImageIcon, 'video': Video
    };
    const IconComponent = icons[name];
    return IconComponent ? <IconComponent {...props} /> : null;
};

// Mapeamento de links de redes sociais
const socialMediaConfig: { [key: string]: { icon: string, baseUrl: string } } = {
    whatsapp: { icon: 'message-circle', baseUrl: 'https://wa.me/' },
    instagram: { icon: 'instagram', baseUrl: 'https://instagram.com/' },
    facebook: { icon: 'facebook', baseUrl: 'https://facebook.com/' },
    tiktok: { icon: 'music-2', baseUrl: 'https://tiktok.com/' },
};

// Função para buscar os dados da página no Supabase
async function getPageData(subdomain: string) {
    const supabase = createServerComponentClient({ cookies });
    const { data, error } = await supabase
        .from('pages')
        .select('config, logo_url')
        .eq('subdomain', subdomain)
        .single();

    if (error || !data) {
        return null;
    }
    return data as { config: PageConfig, logo_url: string };
}


// O Componente da Página
export default async function LandingPage({ params }: { params: { subdomain: string } }) {
    const pageData = await getPageData(params.subdomain);

    if (!pageData) {
        notFound(); // Redireciona para 404 se o subdomínio não for encontrado
    }

    const { config, logo_url } = pageData;
    const { 
        landingPageTitleText = 'Título não configurado',
        landingPageSubtitleText = '',
        landingPageLogoShape = 'circle',
        landingPageLogoSize = 96,
        landingPageBgColor = '#F8FAFC',
        landingPageBgImage = null,
        socialLinks = {},
        customLinks = []
    } = config || {};

    const logoShapeClass = landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl';

    return (
        <main 
            className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center" 
            style={{
                backgroundColor: landingPageBgColor,
                backgroundImage: landingPageBgImage ? `url('${landingPageBgImage}')` : 'none'
            }}
        >
            <div className="w-full max-w-md mx-auto">
                <div className="flex flex-col items-center text-center">
                    {logo_url && (
                        <img 
                            src={logo_url} 
                            alt="Logo" 
                            className={`object-cover mb-4 shadow-md ${logoShapeClass}`}
                            style={{ width: `${landingPageLogoSize}px`, height: `${landingPageLogoSize}px` }}
                        />
                    )}
                    <h1 className="text-3xl font-bold text-slate-800 break-words">{landingPageTitleText}</h1>
                    {landingPageSubtitleText && (
                        <p className="text-slate-600 mt-2 px-4 break-words">{landingPageSubtitleText}</p>
                    )}

                    <div className="w-full mt-8 flex justify-center items-center space-x-4">
                       {Object.entries(socialLinks).map(([key, value]) => {
                           if (!value) return null;
                           const social = socialMediaConfig[key];
                           return (
                                <a key={key} href={social.baseUrl + value} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                                   <LucideIcon name={social.icon} size={24} />
                                </a>
                           )
                       })}
                    </div>

                    <div className="w-full mt-6 space-y-3">
                        {customLinks.map((link) => (
                            <a 
                                key={link.id} 
                                href={link.url.startsWith('copy:') || link.url.startsWith('pix:') ? '#' : link.url}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-3 font-semibold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105"
                                style={{
                                    color: link.textColor,
                                    background: link.styleType === 'gradient' ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` : link.bgColor1
                                }}
                                onClick={(e) => {
                                    if (link.url.startsWith('copy:')) {
                                        e.preventDefault();
                                        navigator.clipboard.writeText(link.url.replace('copy:', ''));
                                        alert('Copiado para a área de transferência!');
                                    }
                                }}
                            >
                                {link.icon && <LucideIcon name={link.icon} className="w-5 h-5 flex-shrink-0" />}
                                <span>{link.text}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}

// Forçar a página a ser dinâmica para sempre buscar os dados mais recentes
export const revalidate = 0;

