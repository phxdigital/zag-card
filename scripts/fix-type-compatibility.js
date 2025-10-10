const fs = require('fs');
const path = require('path');

function findFiles(dir) {
    let files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            files = files.concat(findFiles(fullPath));
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

function fixTypeCompatibility(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        let fixes = [];
        
        // Padrão 1: NextResponse com .buffer
        const nextResponseBufferPattern = /new NextResponse\(([^,]+)\.buffer,/g;
        const matches1 = content.match(nextResponseBufferPattern);
        if (matches1) {
            content = content.replace(nextResponseBufferPattern, 'new NextResponse(new Uint8Array($1),');
            fixes.push(`Corrigido ${matches1.length} NextResponse com .buffer`);
        }
        
        // Padrão 2: ArrayBufferLike em NextResponse
        const arrayBufferPattern = /new NextResponse\(([^,]+)\.buffer\s*,/g;
        const matches2 = content.match(arrayBufferPattern);
        if (matches2) {
            content = content.replace(arrayBufferPattern, 'new NextResponse(new Uint8Array($1),');
            fixes.push(`Corrigido ${matches2.length} ArrayBufferLike em NextResponse`);
        }
        
        // Padrão 3: Uint8Array.buffer em NextResponse
        const uint8ArrayBufferPattern = /new NextResponse\(([^,]+)\.buffer\s*,/g;
        const matches3 = content.match(uint8ArrayBufferPattern);
        if (matches3) {
            content = content.replace(uint8ArrayBufferPattern, 'new NextResponse(new Uint8Array($1),');
            fixes.push(`Corrigido ${matches3.length} Uint8Array.buffer em NextResponse`);
        }
        
        // Padrão 4: Uint8Array direto em NextResponse (converter para Blob) - DESABILITADO
        // Este padrão estava causando duplicação de código
        // const uint8ArrayDirectPattern = /new NextResponse\(([^,]+),\s*\{[\s\S]*?'Content-Type':\s*'application\/pdf'/g;
        // const matches4 = content.match(uint8ArrayDirectPattern);
        // if (matches4) {
        //     content = content.replace(uint8ArrayDirectPattern, (match, varName) => {
        //         return match.replace(`new NextResponse(${varName},`, `const pdfBlob = new Blob([${varName} as BlobPart], { type: 'application/pdf' });\n        return new NextResponse(pdfBlob,`);
        //     });
        //     fixes.push(`Corrigido ${matches4.length} Uint8Array direto em NextResponse para Blob`);
        // }
        
        // Padrão 5: ArrayBuffer/SharedArrayBuffer em Blob (usar BlobPart)
        const arrayBufferBlobPattern = /new Blob\(\[([^,]+)\.buffer\.slice\([^)]+\)\]/g;
        const matches5 = content.match(arrayBufferBlobPattern);
        if (matches5) {
            content = content.replace(arrayBufferBlobPattern, 'new Blob([$1 as BlobPart]');
            fixes.push(`Corrigido ${matches5.length} ArrayBuffer em Blob com BlobPart`);
        }
        
        // Padrão 6: any em Blob (substituir por BlobPart)
        const anyInBlobPattern = /new Blob\(\[([^,]+) as any\]/g;
        const matches6 = content.match(anyInBlobPattern);
        if (matches6) {
            content = content.replace(anyInBlobPattern, 'new Blob([$1 as BlobPart]');
            fixes.push(`Corrigido ${matches6.length} any em Blob para BlobPart`);
        }
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${path.relative(process.cwd(), filePath)}:`);
            fixes.forEach(fix => console.log(`  🔧 ${fix}`));
            return true;
        }
        
        return false;
    } catch (error) {
        console.log(`❌ Erro ao processar ${filePath}: ${error.message}`);
        return false;
    }
}

console.log('🔧 Corrigindo problemas de compatibilidade de tipos...\n');

const appDir = path.join(process.cwd(), 'app');
const files = findFiles(appDir);

let fixedCount = 0;
files.forEach(file => {
    if (fixTypeCompatibility(file)) {
        fixedCount++;
    }
});

console.log(`\n✅ ${fixedCount} arquivos corrigidos!`);
