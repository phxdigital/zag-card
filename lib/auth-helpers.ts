/**
 * Helper functions para autenticação e verificação de permissões
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { isAdminEmail } from './auth-config';

/**
 * Verifica se o usuário atual é administrador (Client Component)
 */
export async function isAdmin(): Promise<boolean> {
    try {
        const supabase = createClientComponentClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.email) {
            return false;
        }

        // Verificar pelo email (mais simples e rápido)
        if (isAdminEmail(session.user.email)) {
            return true;
        }

        // Verificar na tabela user_roles (backup)
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

        return roleData?.role === 'admin';
    } catch (error) {
        console.error('Erro ao verificar permissões de admin:', error);
        return false;
    }
}

/**
 * Verifica se o usuário atual é administrador (Server Component)
 */
export async function isAdminServer(): Promise<boolean> {
    try {
        const supabase = createServerComponentClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.email) {
            return false;
        }

        // Verificar pelo email (mais simples e rápido)
        if (isAdminEmail(session.user.email)) {
            return true;
        }

        // Verificar na tabela user_roles (backup)
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

        return roleData?.role === 'admin';
    } catch (error) {
        console.error('Erro ao verificar permissões de admin (server):', error);
        return false;
    }
}

/**
 * Obtém o role do usuário atual (Client Component)
 */
export async function getUserRole(): Promise<'admin' | 'user'> {
    try {
        const supabase = createClientComponentClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.email) {
            return 'user';
        }

        // Verificar pelo email primeiro
        if (isAdminEmail(session.user.email)) {
            return 'admin';
        }

        // Verificar na tabela user_roles
        const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

        return (roleData?.role as 'admin' | 'user') || 'user';
    } catch (error) {
        console.error('Erro ao obter role do usuário:', error);
        return 'user';
    }
}
