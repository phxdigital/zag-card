import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import PageClient from './page-client';
import type { PageConfig } from './page-client';

interface SubdomainPageProps {
    params: Promise<{ subdomain: string }>;
}

export default async function SubdomainPage({ params }: SubdomainPageProps) {
    const supabase = createServerComponentClient({ cookies });
    const { subdomain } = await params;

    // --- Busca os dados da página no Supabase ---
    const { data: pageData, error } = await supabase
        .from('pages') // Sua tabela no Supabase
        .select('config, logo_url') // As colunas que você precisa
        .eq('subdomain', subdomain)
        .single();

    // Se não encontrar, mostra uma página 404
    if (!pageData) {
        notFound();
    }

    // Passa os dados para o componente de cliente
    const config: PageConfig = pageData.config || {};
    const logoUrl = pageData.logo_url || 'https://placehold.co/100x100/e2e8f0/64748b?text=Logo';

    return <PageClient config={config} logoUrl={logoUrl} />;
}