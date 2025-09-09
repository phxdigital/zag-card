'use client';import React from 'react';import {MessageCircle, Instagram, Facebook, Link as LinkIcon,ShoppingCart, Globe, Wifi, DollarSign, BookOpen, MapPin, Phone, Mail, Info,Star, Image as ImageIcon, Video} from 'lucide-react';import Image from 'next/image';// --- Tipos de Dados ---export type CustomLink = {id: number; text: string; url: string; icon: string | null;styleType: 'solid' | 'gradient'; bgColor1: string; bgColor2: string; textColor: string;};export type PageConfig = {landingPageBgColor?: string;landingPageBgImage?: string | null;landingPageTitleText?: string;landingPageSubtitleText?: string;landingPageLogoShape?: 'circle' | 'square';landingPageLogoSize?: number;socialLinks?: { [key: string]: string };customLinks?: CustomLink[];};interface PageClientProps {config: PageConfig;logoUrl: string;}type IconName = 'message-circle' | 'instagram' | 'facebook' | 'shopping-cart' | 'link' | 'dollar-sign' | 'wifi' | 'globe' | 'book-open' | 'map-pin' | 'phone' | 'mail' | 'info' | 'star' | 'image' | 'video';const socialMediaConfig: { [key: string]: { icon: IconName; baseUrl: string } } = {whatsapp: { icon: 'message-circle', baseUrl: 'https://wa.me/' },instagram: { icon: 'instagram', baseUrl: 'https://instagram.com/' },facebook: { icon: 'facebook', baseUrl: 'https://facebook.com/' },tiktok: { icon: 'video', baseUrl: 'https://tiktok.com/@' },};const LucideIcon = ({ name, ...props }: { name: IconName; [key: string]: string | number }) => {const icons: { [key in IconName]: React.ElementType } = {'message-circle': MessageCircle, 'instagram': Instagram, 'facebook': Facebook,'shopping-cart': ShoppingCart, 'link': LinkIcon, 'dollar-sign': DollarSign,'wifi': Wifi, 'globe': Globe, 'book-open': BookOpen, 'map-pin': MapPin,'phone': Phone, 'mail': Mail, 'info': Info, 'star': Star, 'image': ImageIcon, 'video': Video};const IconComponent = icons[name];return IconComponent ? <IconComponent {...props} /> : null;};export default function PageClient({ config, logoUrl }: PageClientProps) {const handleLinkClick = (url: string) => {
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
    }
    else {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
} // A CHAVE AQUI FOI CORRIGIDA DE }; PARA }

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
                className={`object-cover mx-auto mb-4 shadow-md ${config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'}`} 
            />

            <h1 className="text-3xl font-bold text-slate-800 break-words">
                {config.landingPageTitleText || 'Bem-vindo(a)!'}
            </h1>
            
            {config.landingPageSubtitleText && (
                 <p className="text-slate-600 mt-2 px-4 break-words">
                    {config.landingPageSubtitleText}
                </p>
            )}

            <div className="w-full mt-8 flex justify-center items-center space-x-4">
                 {Object.entries(config.socialLinks || {}).map(([key, value]) => {
                    const socialInfo = socialMediaConfig[key];
                    if (!value || !socialInfo) return null;
                    return (
                        <a key={key} href={socialInfo.baseUrl + value} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                            <LucideIcon name={socialInfo.icon} />
                        </a>
                    )
                })}
            </div>

            <div className="w-full mt-6 space-y-3">
                {config.customLinks?.map(link => (
                    <button 
                        key={link.id} 
                        onClick={() => handleLinkClick(link.url)}
                        style={{
                            color: link.textColor, 
                            background: link.styleType === 'gradient' 
                                ? `linear-gradient(to right, ${link.bgColor1}, ${link.bgColor2})` 
                                : link.bgColor1
                        }} 
                        className="w-full flex items-center justify-center gap-3 font-semibold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105"
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