'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { isAdminEmail } from '@/lib/auth-config';
import { 
  LayoutDashboard, 
  CreditCard, 
  FileText, 
  User, 
  Menu, 
  X,
  LogOut,
  Settings
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setIsAdmin(isAdminEmail(session.user.email));
      }
    };
    checkAdmin();
  }, [supabase]);

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/dashboard'
    },
    {
      name: 'Minhas Páginas',
      href: '/dashboard/pages',
      icon: FileText,
      current: pathname === '/dashboard/pages'
    },
    {
      name: 'Pagamentos',
      href: '/dashboard/payments',
      icon: CreditCard,
      current: pathname === '/dashboard/payments'
    },
    {
      name: 'Conta',
      href: '/dashboard/account',
      icon: User,
      current: pathname === '/dashboard/account'
    }
  ];

  const handleLogout = async () => {
    // Implementar logout
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Image 
                src="/logo-zag.png" 
                alt="Zag NFC" 
                width={64} 
                height={64} 
                className=&rdquo;h-12 w-auto"
              />
              <span className="text-sm font-medium text-gray-700">Menu</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4 space-y-2">
            {isAdmin && (
              <Link
                href=&ldquo;/admin&rdquo;
                className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md&ldquo;
              >
                <Settings className="mr-3 h-5 w-5" />
                Painel Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center gap-2">
              <Image 
                src=&ldquo;/logo-zag.png&rdquo; 
                alt=&rdquo;Zag NFC" 
                width={64} 
                height={64} 
                className="h-12 w-auto"
              />
              <span className="text-sm font-medium text-gray-700">Menu</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    item.current
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4 space-y-2">
            {isAdmin && (
              <Link
                href=&ldquo;/admin&rdquo;
                className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md&ldquo;
              >
                <Settings className="mr-3 h-5 w-5" />
                Painel Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar - apenas para mobile */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type=&ldquo;button&rdquo;
            className=&rdquo;-m-2.5 p-2.5 text-gray-700 flex items-center gap-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
            <span className="text-sm font-medium">Menu</span>
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch">
            <div className="flex flex-1" />
            
            {/* Logo animada centralizada - apenas mobile */}
            <div className="flex items-center justify-center flex-1">
              <div className="animate-slide-in-right">
                <Image 
                  src=&ldquo;/logo-zag.png&rdquo; 
                  alt="Zag Card Logo&ldquo; 
                  width={40} 
                  height={12} 
                  className=&rdquo;h-3 w-auto opacity-90 hover:opacity-100 transition-opacity duration-300" 
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
