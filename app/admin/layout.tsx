'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/auth-config';
import { Shield, LayoutDashboard, Package, ShoppingCart, FileText, LogOut, Menu, X, Globe } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
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
                const userIsAdmin = isAdminEmail(session.user.email);
                
                if (!userIsAdmin) {
                    // Se não for admin, redirecionar para página de acesso negado
                    console.warn('Tentativa de acesso não autorizado ao painel admin:', session.user.email);
                    router.push('/access-denied');
                    return;
                }

                setIsAdmin(true);
                setUser(session.user);
            } catch {
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

    if (!user || !isAdmin) {
        return null;
    }

    const menuItems = [
        { name: 'Layouts/Cartões', href: '/admin', icon: FileText },
        { name: 'Páginas Web', href: '/admin/pages', icon: Globe },
        { name: 'Produtos', href: '/admin/products', icon: Package },
        { name: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {/* Logo/Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center space-x-3">
                        <Shield className="w-8 h-8 text-purple-600" />
                        <div>
                            <h2 className="font-bold text-gray-900">Admin</h2>
                            <p className="text-xs text-gray-500">Painel</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                                    ${isActive 
                                        ? 'bg-purple-100 text-purple-700 font-medium' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
                                `}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.email}
                            </p>
                            <p className="text-xs text-gray-500">Administrador</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="bg-white shadow-sm border-b sticky top-0 z-30">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden text-gray-500 hover:text-gray-700"
                            >
                                <Menu className="w-6 h-6" />
                            </button>

                            {/* Page title */}
                            <div className="flex-1 lg:flex-none">
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {menuItems.find(item => item.href === pathname)?.name || 'Painel Administrativo'}
                                </h1>
                            </div>

                            {/* Badge */}
                            <span className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
}
