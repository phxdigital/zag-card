import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ subdomain: string }> }
) {
    try {
        const supabase = createRouteHandlerClient({ cookies: () => cookies() });
        const { subdomain } = await params;

        // Buscar dados da página
        const { data: pageData } = await supabase
            .from('pages')
            .select('config, logo_url')
            .eq('subdomain', subdomain)
            .single();

        if (!pageData) {
            return new NextResponse('Page not found', { status: 404 });
        }

        const config = pageData.config || {};
        
        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: config.landingPageBgColor || '#F8FAFC',
                        backgroundImage: 'linear-gradient(45deg, #f0f9ff 0%, #e0f2fe 100%)',
                    }}
                >
                    {/* Logo */}
                    {pageData.logo_url && (
                        <div
                            style={{
                                width: 200,
                                height: 200,
                                borderRadius: config.landingPageLogoShape === 'circle' ? '50%' : '20px',
                                marginBottom: 40,
                                backgroundImage: `url(${pageData.logo_url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                            }}
                        />
                    )}
                    
                    {/* Título */}
                    <div
                        style={{
                            fontSize: 48,
                            fontWeight: 'bold',
                            color: config.landingPageTitleColor || '#1e293b',
                            textAlign: 'center',
                            marginBottom: 20,
                            maxWidth: '80%',
                        }}
                    >
                        {config.landingPageTitleText || 'Bem-vindo(a)!'}
                    </div>
                    
                    {/* Subtítulo */}
                    {config.landingPageSubtitleText && (
                        <div
                            style={{
                                fontSize: 32,
                                color: config.landingPageSubtitleColor || '#64748b',
                                textAlign: 'center',
                                maxWidth: '80%',
                            }}
                        >
                            {config.landingPageSubtitleText}
                        </div>
                    )}
                    
                    {/* Marca d'água */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 30,
                            right: 30,
                            fontSize: 24,
                            color: 'rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        Zag Card
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (err) {
console.error('Error generating OG image:', err);
        return new NextResponse('Internal Server Error', { status: 500 




});
    }
}
