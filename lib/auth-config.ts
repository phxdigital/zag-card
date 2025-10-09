/**
 * Configuração de Autenticação e Permissões
 * 
 * Define quais usuários têm acesso administrativo ao sistema
 */

// Lista de emails com permissão de administrador
export const ADMIN_EMAILS = [
    'andresavite@gmail.com',
    // Adicione mais emails de admin aqui se necessário
    // 'outro-admin@example.com',
];

// Tipos de roles disponíveis
export type UserRole = 'admin' | 'user';

// Configuração de roles
export const ROLES = {
    ADMIN: 'admin' as UserRole,
    USER: 'user' as UserRole,
} as const;

/**
 * Verifica se um email é de administrador
 */
export function isAdminEmail(email: string | undefined | null): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Verifica se um role é admin
 */
export function isAdminRole(role: string | undefined | null): boolean {
    return role === ROLES.ADMIN;
}
