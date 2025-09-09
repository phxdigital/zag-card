import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/auth-helpers-nextjs';

export const useSupabase = () => {
    const supabase = createClientComponentClient();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                setUser(session.user);
                router.push('/dashboard');
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                router.push('/');
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase, router]);

    return { supabase, user, loading };
};

// ===== 7. PÁGINA DE LOGIN MELHORADA =====

'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Image from 'next/image';
import { useSupabase } from '@/hooks/useSupabase';

export default function LoginPage() {
    const { supabase, loading } = useSupabase();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center">
                    <Image 
                        src="/logo.png" 
                        alt="Zag Card Logo" 
                        width={128} 
                        height={128} 
                        className="mx-auto h-20 w-auto" 
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