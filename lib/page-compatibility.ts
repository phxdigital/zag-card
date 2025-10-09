/**
 * 🛡️ Sistema de Compatibilidade para Páginas Antigas
 * Garante que páginas criadas antes das atualizações continuem funcionando
 */

export type CustomLink = {
    id: number;
    text: string;
    url: string;
    icon: string | null;
    styleType: 'solid' | 'gradient';
    bgColor1: string;
    bgColor2: string;
    textColor: string;
    isSocial?: boolean;
};

/**
 * Garante retrocompatibilidade com páginas antigas
 * Adiciona valores padrão para propriedades que podem estar faltando
 */
export function ensureBackwardCompatibility(links: CustomLink[] | undefined): CustomLink[] {
    if (!links) return [];
    
    return links.map(link => ({
        ...link,
        // Se isSocial não existe, assumir false (comportamento antigo)
        // Isso garante que páginas antigas mantenham botões retangulares
        isSocial: link.isSocial ?? false,
        
        // Garantir propriedades de estilo existam
        styleType: link.styleType || 'solid',
        bgColor1: link.bgColor1 || '#3B82F6',
        bgColor2: link.bgColor2 || '#3B82F6',
        textColor: link.textColor || '#ffffff',
        icon: link.icon || null
    }));
}

/**
 * Detecta se uma página foi criada antes da atualização
 * Útil para analytics e debugging
 */
export function isLegacyPage(config: any): boolean {
    // Páginas antigas não têm a propriedade isSocial em nenhum link
    if (!config.customLinks || config.customLinks.length === 0) return false;
    
    return config.customLinks.every((link: any) => 
        link.isSocial === undefined || link.isSocial === null
    );
}

/**
 * Garante que configurações de página tenham valores padrão
 */
export function ensureConfigDefaults(config: any): any {
    return {
        // Landing page defaults
        landingPageBgColor: config.landingPageBgColor || '#F8FAFC',
        landingPageBgImage: config.landingPageBgImage || null,
        landingPageTitleText: config.landingPageTitleText || '',
        landingPageSubtitleText: config.landingPageSubtitleText || '',
        landingPageLogoShape: config.landingPageLogoShape || 'circle',
        landingPageLogoSize: config.landingPageLogoSize || 96,
        landingPageTitleColor: config.landingPageTitleColor || '#1e293b',
        landingPageSubtitleColor: config.landingPageSubtitleColor || '#64748b',
        landingFont: config.landingFont || 'Inter',
        removeLogoBackground: config.removeLogoBackground || false,
        
        // Social & Custom Links
        socialLinks: config.socialLinks || {},
        customLinks: ensureBackwardCompatibility(config.customLinks),
        
        // Manter todas as outras propriedades do config original
        ...config
    };
}

/**
 * Versão atual do schema de dados
 * Incrementar quando houver mudanças quebradas de compatibilidade
 */
export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Migra config para versão atual (se necessário)
 * Esta função será útil para futuras atualizações
 */
export function migrateConfigIfNeeded(config: any): any {
    const version = config.schemaVersion || 1;
    
    if (version < CURRENT_SCHEMA_VERSION) {
        // Aplicar migrações necessárias
        const migrated = ensureConfigDefaults(config);
        
        return {
            ...migrated,
            schemaVersion: CURRENT_SCHEMA_VERSION
        };
    }
    
    return config;
}

