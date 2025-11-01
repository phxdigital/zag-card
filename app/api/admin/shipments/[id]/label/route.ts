import { NextRequest, NextResponse } from 'next/server';
import { generateMelhorEnvioLabel } from '@/lib/melhor-envio';
import { loadEnv } from '@/lib/env-loader';

// Carregar variáveis de ambiente explicitamente
loadEnv();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const shipmentId = parseInt(id);

        if (!shipmentId || isNaN(shipmentId)) {
            return NextResponse.json(
                { error: 'ID do envio inválido' },
                { status: 400 }
            );
        }

        // Gerar etiqueta no Melhor Envio
        const label = await generateMelhorEnvioLabel(shipmentId);

        if (!label || !label.url) {
            return NextResponse.json(
                { error: 'Erro ao gerar etiqueta. Verifique se o envio existe e está no status correto.' },
                { status: 500 }
            );
        }

        // Baixar o PDF da URL e retornar
        try {
            const pdfResponse = await fetch(label.url);
            if (!pdfResponse.ok) {
                throw new Error('Erro ao baixar PDF da etiqueta');
            }

            const pdfBlob = await pdfResponse.blob();
            
            return new NextResponse(pdfBlob, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="etiqueta-${shipmentId}.pdf"`
                }
            });
        } catch (pdfError) {
            // Se não conseguir baixar o PDF, retornar a URL para o frontend abrir
            return NextResponse.json({
                url: label.url,
                message: 'URL da etiqueta gerada. Abra em nova aba para visualizar.'
            });
        }

    } catch (error) {
        console.error('❌ Erro ao gerar etiqueta:', error);
        return NextResponse.json(
            { 
                error: 'Erro ao gerar etiqueta', 
                details: error instanceof Error ? error.message : 'Erro desconhecido' 
            },
            { status: 500 }
        );
    }
}

