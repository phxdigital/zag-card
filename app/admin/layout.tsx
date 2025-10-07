'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClientComponentClient();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session) {
                    router.push('/login');
                    return;
                }

                // Verificar se o usuário tem permissão de admin
                // Aqui você pode implementar sua lógica de verificação de role
                // Por exemplo, verificar em uma tabela de usuários ou metadata
                setUser(session.user);
            } catch (error) {
                console.error('Erro ao verificar usuário:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verificando permissões...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header com logout */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Painel Administrativo
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Olá, {user.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {children}
        </div>
    );
}
