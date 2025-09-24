'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [supabase, setSupabase] = useState<any>(null);

    useEffect(() => {
        // Verificar se estamos no cliente e se as variáveis de ambiente estão configuradas
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL) {
            const client = createClientComponentClient();
            setSupabase(client);
            
            const {
                data: { subscription },
            } = client.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    router.push('/dashboard');
                }
                setLoading(false);
            });

            return () => subscription.unsubscribe();
        } else {
            setLoading(false);
        }
    }, [router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    if (!supabase) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">
                        Configuração Necessária
                    </h2>
                    <p className="text-slate-600">
                        As variáveis de ambiente do Supabase não estão configuradas.
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                        Verifique o arquivo ENV-VARIABLES.md para mais informações.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <Image 
                        src="/logo-zag.png" 
                        alt="Zag Card Logo" 
                        width={256} 
                        height={256} 
                        className="mx-auto h-40 w-auto" 
                        style={{ width: 'auto', height: 'auto' }}
                        priority
                    />
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
                        Acesse sua conta
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Entre para gerenciar seus cartões digitais
                    </p>
                </div>
            </div>
            
            <div className="mt-8 w-full max-w-sm">
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    theme="light"
                    providers={['google', 'github']}
                    redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
                    localization={{
                        variables: {
                            sign_in: {
                                email_label: 'E-mail',
                                password_label: 'Senha',
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
}