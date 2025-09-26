import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface SubdomainLayoutProps {
    children: React.ReactNode;
    params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
    const supabase = createServerComponentClient({ cookies });
    const { subdomain } = await params;

    // Buscar dados da página
    const { data: pageData } = await supabase
        .from('pages')
        .select('config, logo_url, thumbnail_url')
        .eq('subdomain', subdomain)
        .single();

    if (!pageData) {
        return {
            title: 'Página não encontrada',
            description: 'A página solicitada não foi encontrada.'
        };
    }

    const config = pageData.config || {};
    const pageUrl = `https://${subdomain}.zagnfc.com.br`;
    
    // Título e descrição
    const title = config.landingPageTitleText || 'Zag Card';
    const description = config.landingPageSubtitleText || 'Conecte-se comigo através do meu Zag Card';
    
    // URL da imagem (thumbnail dinâmico ou logo)
    const imageUrl = pageData.thumbnail_url || `https://zag-card.vercel.app/api/og/${subdomain}` || 'https://zag-card.vercel.app/logo-zag.png';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: pageUrl,
            siteName: 'Zag Card',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: 'pt_BR',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
        other: {
            'og:image:width': '1200',
            'og:image:height': '630',
            'og:image:type': 'image/png',
            'og:image:secure_url': imageUrl,
            'og:image:alt': title,
            'og:url': pageUrl,
            'og:site_name': 'Zag Card',
            'og:locale': 'pt_BR',
            'og:type': 'website',
            'twitter:image:alt': title,
            'twitter:url': pageUrl,
            'twitter:site': '@zagcard',
            'twitter:creator': '@zagcard',
        },
    };
}

export default async function SubdomainLayout({ children, params }: SubdomainLayoutProps) {
    const supabase = createServerComponentClient({ cookies });
    const { subdomain } = await params;

    // Verificar se a página existe
    const { data: pageData } = await supabase
        .from('pages')
        .select('id')
        .eq('subdomain', subdomain)
        .single();

    if (!pageData) {
        notFound();
    }

    return <>{children}</>;
}
