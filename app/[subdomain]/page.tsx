import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import PageClient from './page-client';
import { PageConfig } from './page-client'; // Import type from client component

export default async function SubdomainPage({ params }: { params: { subdomain: string } }) {
    const supabase = createServerComponentClient({ cookies });
    const { subdomain } = params;

    // --- Fetch page data from Supabase ---
    // This is a server component, so we can fetch data directly.
    const { data: pageData, error } = await supabase
        .from('pages') // Assume your table is named 'pages'
        .select('config, logo_url') // Assuming you save logo_url and config json
        .eq('subdomain', subdomain)
        .single();

    // If no data or error, show a 404 page
    if (error || !pageData) {
        notFound();
    }
    
    // Pass fetched data to the client component
    const config: PageConfig = pageData.config || {};
    const logoUrl = pageData.logo_url || 'https://placehold.co/100x100/e2e8f0/64748b?text=Logo';

    return <PageClient config={config} logoUrl={logoUrl} />;
}

