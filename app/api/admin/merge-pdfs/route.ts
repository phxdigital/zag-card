import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        
        // Verificar autenticação
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { notificationIds } = body as { notificationIds: string[] };

        console.log('📥 Requisição de mesclagem recebida:', {
            quantidade: notificationIds?.length,
            ids: notificationIds
        });

        if (!notificationIds || notificationIds.length === 0) {
            console.error('❌ Nenhuma notificação selecionada');
            return NextResponse.json(
                { error: 'Nenhuma notificação selecionada' },
                { status: 400 }
            );
        }

        if (notificationIds.length !== 5) {
            console.error('❌ Quantidade incorreta:', notificationIds.length);
            return NextResponse.json(
                { error: 'Selecione exatamente 5 cartões' },
                { status: 400 }
            );
        }

        // Buscar PDFs do banco de dados
        const { data: notifications, error } = await supabase
            .from('admin_notifications')
            .select('id, subdomain, pdf_data')
            .in('id', notificationIds);

        if (error) {
            console.error('❌ Erro ao buscar notificações:', error);
            return NextResponse.json(
                { error: 'Erro ao buscar PDFs' },
                { status: 500 }
            );
        }

        console.log('📋 Notificações encontradas:', {
            quantidade: notifications?.length,
            com_pdf: notifications?.filter(n => n.pdf_data).length
        });

        if (!notifications || notifications.length === 0) {
            console.error('❌ Nenhuma notificação encontrada no banco');
            return NextResponse.json(
                { error: 'Nenhum PDF encontrado' },
                { status: 404 }
            );
        }

        // Verificar se há PDFs
        const notificationsWithPdf = notifications.filter(n => n.pdf_data);
        if (notificationsWithPdf.length === 0) {
            console.error('❌ Nenhuma notificação tem PDF');
            return NextResponse.json(
                { error: 'Nenhuma das notificações selecionadas possui PDF' },
                { status: 400 }
            );
        }

        // Criar documento PDF mesclado mantendo páginas originais
        const mergedPdf = await PDFDocument.create();
        
        // Dimensões A4 em pontos (72 DPI)
        const A4_WIDTH = 595.28;  // 210mm
        const A4_HEIGHT = 841.89; // 297mm
        
        // Dimensões do cartão de crédito padrão em pontos (85.6mm x 53.98mm)
        const CARD_WIDTH = 242.64;  // 85.6mm a 72 DPI
        const CARD_HEIGHT = 153.00; // 54mm a 72 DPI
        
        // Margens e espaçamento
        const MARGIN = 30;
        const GAP_X = 15;
        const GAP_Y = 12;
        
        console.log(`📐 Cartão de crédito: ${CARD_WIDTH}x${CARD_HEIGHT} pts (85.6mm x 54mm)`);
        console.log(`📄 A4: ${A4_WIDTH}x${A4_HEIGHT} pts`);
        
        // Coletar todas as páginas de todos os PDFs
        interface EmbeddedPageInfo {
            subdomain: string;
            pageNumber: number;
            type: string;
            embeddedPage: ReturnType<Awaited<ReturnType<typeof PDFDocument.prototype.embedPdf>>[number]>;
        }
        const allPages: EmbeddedPageInfo[] = [];
        
        for (const notification of notificationsWithPdf) {
            try {
                console.log(`🔄 Processando: ${notification.subdomain}`);
                
                // Converter base64 para bytes
                const base64Data = notification.pdf_data.split('base64,')[1] || notification.pdf_data;
                const pdfBytes = Buffer.from(base64Data, 'base64');
                
                // Carregar PDF original
                const sourcePdf = await PDFDocument.load(pdfBytes);
                const pageCount = sourcePdf.getPageCount();
                
                console.log(`📑 ${notification.subdomain}: ${pageCount} páginas`);
                
                // Embedar TODAS as páginas (frente e verso)
                const indices = Array.from({ length: pageCount }, (_, i) => i);
                const embeddedPages = await mergedPdf.embedPdf(sourcePdf, indices);
                
                embeddedPages.forEach((page, idx) => {
                    allPages.push({
                        subdomain: notification.subdomain,
                        pageNumber: idx + 1,
                        type: idx === 0 ? 'FRENTE' : 'VERSO',
                        embeddedPage: page,
                    });
                });
                
                console.log(`✅ ${notification.subdomain}: ${pageCount} páginas embedadas`);
                
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
                console.error(`❌ Erro ao processar PDF de ${notification.subdomain}:`, errorMessage);
            }
        }

        if (allPages.length === 0) {
            return NextResponse.json(
                { error: 'Nenhum PDF válido para mesclar' },
                { status: 400 }
            );
        }

        console.log(`📦 Total de páginas coletadas: ${allPages.length}`);
        
        // Organizar em páginas A4 (2 colunas x 5 linhas = 10 páginas de cartão por A4)
        const PAGES_PER_A4 = 10;
        let currentIndex = 0;
        
        while (currentIndex < allPages.length) {
            // Criar nova página A4
            const a4Page = mergedPdf.addPage([A4_WIDTH, A4_HEIGHT]);
            const pagesToDraw = allPages.slice(currentIndex, currentIndex + PAGES_PER_A4);
            
            console.log(`\n📄 Criando página A4 #${mergedPdf.getPageCount()} com ${pagesToDraw.length} cartões`);
            
            // Desenhar cada cartão na grade (2x5)
            pagesToDraw.forEach((item, index) => {
                const col = index % 2;  // 0 ou 1
                const row = Math.floor(index / 2);  // 0 a 4
                
                // Posição X e Y
                const x = MARGIN + (col * (CARD_WIDTH + GAP_X));
                const y = A4_HEIGHT - MARGIN - CARD_HEIGHT - (row * (CARD_HEIGHT + GAP_Y));
                
                // Desenhar a página do cartão NO TAMANHO ORIGINAL
                a4Page.drawPage(item.embeddedPage, {
                    x: x,
                    y: y,
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                });
                
                console.log(`  ✓ ${item.subdomain} ${item.type} → Col ${col}, Row ${row} (${x.toFixed(1)}, ${y.toFixed(1)})`);
            });
            
            currentIndex += PAGES_PER_A4;
        }

        // Gerar PDF final
        const mergedPdfBytes = await mergedPdf.save();

        const cartoesProcessados = notificationsWithPdf.length;
        const paginasCartao = allPages.length;
        const paginasA4 = mergedPdf.getPageCount();
        console.log(`\n✅ PDF GERADO COM SUCESSO!`);
        console.log(`   • ${cartoesProcessados} cartões`);
        console.log(`   • ${paginasCartao} páginas (frentes + versos)`);
        console.log(`   • ${paginasA4} página(s) A4`);
        console.log(`   • Tamanho: ${(mergedPdfBytes.length / 1024).toFixed(1)} KB`);

        // Retornar PDF como blob
        return new NextResponse(mergedPdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="impressao-cartoes-${new Date().toISOString().split('T')[0]}.pdf"`,
            },
        });

    } catch (error) {
        console.error('Erro ao mesclar PDFs:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

