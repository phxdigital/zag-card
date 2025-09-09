'use client';

import React from 'react';
import Image from 'next/image';
import { LucideIcon } from '@/components/LucideIcon'; // Componente separado
import { handleLinkClick } from '@/utils';
import { socialMediaConfig } from '@/constants';
import type { PageConfig, IconName } from '@/types';

interface PageClientProps {
    config: PageConfig;
    logoUrl: string;
}

export default function PageClient({ config, logoUrl }: PageClientProps) {
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
                    className={`object-cover mx-auto mb-4 shadow-md ${
                        config.landingPageLogoShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                    }`} 
                    priority
                />

                <h1 className="text-3xl font-bold text-slate-800 break-words">
                    {config.landingPageTitleText || 'Bem-vindo(a)!'}
                </h1>
                
                {config.landingPageSubtitleText && (
                    <p className="text-slate-600 mt-2 px-4 break-words">
                        {config.landingPageSubtitleText}
                    </p>
                )}

                {/* Social Links */}
                <div className="w-full mt-8 flex justify-center items-center space-x-4">
                    {Object.entries(config.socialLinks || {}).map(([key, value]) => {
                        const socialInfo = socialMediaConfig[key];
                        if (!value || !socialInfo) return null;
                        
                        return (
                            <a 
                                key={key} 
                                href={socialInfo.baseUrl + value} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200"
                                aria-label={`Link para ${key}`}
                            >
                                <LucideIcon name={socialInfo.icon} size={20} />
                            </a>
                        );
                    })}
                </div>

                {/* Custom Links */}
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
                            className="w-full flex items-center justify-center gap-3 font-semibold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            aria-label={link.text}
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
