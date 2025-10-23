import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import PageClient from './page-client';
import type { PageConfig } from './page-client';

interface SubdomainPageProps {
    params: Promise<{ subdomain: string }>;
}

export default async function SubdomainPage({ params }: SubdomainPageProps) {
    const supabase = createServerComponentClient({ cookies });
    const { subdomain } = await params;

    // --- Busca os dados da página no Supabase ---
    const { data: pageData } = await supabase
        .from('pages') // Sua tabela no Supabase
        .select('id, config, logo_url') // As colunas que você precisa
        .eq('subdomain', subdomain)
        .single();

    // Se não encontrar, mostra uma página 404
    if (!pageData) {
        notFound();
    }

    // Passa os dados para o componente de cliente
    const config: PageConfig = pageData.config || {};
    const logoUrl = pageData.logo_url || 'https://placehold.co/100x100/e2e8f0/64748b?text=Logo';
    const pageId = pageData.id;

    return (
        <>
            {/* Analytics Tracking Script */}
            <Script
                id="analytics-tracking"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        // Inject page ID for tracking
                        window.__PAGE_ID__ = ${pageId};
                    `
                }}
            />
            
            {/* Analytics Tracking Script */}
            <Script
                src="/tracking.js"
                strategy="afterInteractive"
            />
            
            <PageClient config={config} logoUrl={logoUrl} />
        </>
    );
}