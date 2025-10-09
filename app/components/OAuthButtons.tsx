'use client';

import React from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Chrome } from 'lucide-react';

interface OAuthButtonsProps {
    redirectTo?: string;
    onError?: (error: string) => void;
    disabled?: boolean;
}

export default function OAuthButtons({ 
    redirectTo = '/dashboard', 
    onError,
    disabled = false 
}: OAuthButtonsProps) {
    const supabase = createClientComponentClient();

    const handleOAuthLogin = async (provider: 'google' | 'github' | 'facebook' | 'twitter') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}${redirectTo}`
                }
            });

            if (error) {
                onError?.(error.message);
            }
        } catch (error) {
            onError?.(`Erro ao fazer login com ${provider}`);
        }
    };

    return (
        <div className="space-y-3">
            {/* Google OAuth */}
            <button
                onClick={() => handleOAuthLogin('google')}
                disabled={disabled}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24&ldquo;>
                    <path fill=&ldquo;#4285F4&rdquo; d=&rdquo;M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill=&ldquo;#34A853&rdquo; d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z&ldquo;/>
                    <path fill=&ldquo;#FBBC05&rdquo; d=&rdquo;M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill=&ldquo;#EA4335&rdquo; d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z&ldquo;/>
                </svg>
                Continuar com Google
            </button>

            {/* GitHub OAuth (opcional - comentado por padrão) */}
            {/* 
            <button
                onClick={() => handleOAuthLogin('github')}
                disabled={disabled}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Github className="w-5 h-5 mr-2" />
                Continuar com GitHub
            </button>
            */}

            {/* Facebook OAuth (opcional - comentado por padrão) */}
            {/*
            <button
                onClick={() => handleOAuthLogin('facebook')}
                disabled={disabled}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5 mr-2" viewBox=&rdquo;0 0 24 24" fill="#1877F2">
                    <path d=&ldquo;M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z&rdquo;/>
                </svg>
                Continuar com Facebook
            </button>
            */}
        </div>
    );
}

// Componente alternativo com layout em grid (2 colunas)
export function OAuthButtonsGrid({ 
    redirectTo = '/dashboard', 
    onError,
    disabled = false 
}: OAuthButtonsProps) {
    const supabase = createClientComponentClient();

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}${redirectTo}`
                }
            });

            if (error) {
                onError?.(error.message);
            }
        } catch (error) {
            onError?.(`Erro ao fazer login com ${provider}`);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-3">
            {/* Google */}
            <button
                onClick={() => handleOAuthLogin('google')}
                disabled={disabled}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Login com Google&ldquo;
            >
                <Chrome className="w-5 h-5" />
            </button>

            {/* GitHub - descomente para usar */}
            {/*
            <button
                onClick={() => handleOAuthLogin('github')}
                disabled={disabled}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title=&rdquo;Login com GitHub"
            >
                <Github className="w-5 h-5" />
            </button>
            */}
        </div>
    );
}

