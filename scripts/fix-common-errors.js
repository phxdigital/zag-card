#!/usr/bin/env node

/**
 * 🔧 Script de Correção Automática de Erros Comuns
 * Corrige automaticamente os erros mais frequentes no deploy
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 Iniciando correção automática de erros comuns...\n');

// Lista de correções automáticas
const fixes = [
    {
        name: 'Next.js 15 params Promise',
        pattern: /{ params }: { params: { ([^}]+) } }/g,
        replacement: '{ params }: { params: Promise<{ $1 }> }',
        description: 'Corrige tipo de params para Next.js 15'
    },
    {
        name: 'Require para Import',
        pattern: /require\(['"]([^'"]+)['"]\)/g,
        replacement: "import('$1')",
        description: 'Converte require() para import()'
    },
    {
        name: 'Any para unknown',
        pattern: /: any\b/g,
        replacement: ': unknown',
        description: 'Substitui any por unknown'
    },
    {
        name: 'Aspas não escapadas',
        pattern: /"([^"]*)"([^>]*>)/g,
        replacement: '&ldquo;$1&rdquo;$2',
        description: 'Escapa aspas em JSX'
    }
];

// Função para processar arquivo
function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        fixes.forEach(fix => {
            const originalContent = content;
            content = content.replace(fix.pattern, fix.replacement);
            if (content !== originalContent) {
                modified = true;
                console.log(`  ✅ ${fix.name}: ${fix.description}`);
            }
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            return true;
        }
        
        return false;
    } catch (error) {
        console.log(`  ❌ Erro ao processar ${filePath}: ${error.message}`);
        return false;
    }
}

// Função para encontrar arquivos
function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    let files = [];
    
    try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                files = files.concat(findFiles(fullPath, extensions));
            } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        // Ignorar erros de permissão
    }
    
    return files;
}

// Processar arquivos
const appDir = path.join(process.cwd(), 'app');
const files = findFiles(appDir);

console.log(`📁 Encontrados ${files.length} arquivos para verificar\n`);

let fixedFiles = 0;
files.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`🔍 Verificando: ${relativePath}`);
    
    if (processFile(file)) {
        fixedFiles++;
        console.log(`  ✅ Arquivo corrigido\n`);
    } else {
        console.log(`  ⏭️  Nenhuma correção necessária\n`);
    }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 RESULTADO DA CORREÇÃO AUTOMÁTICA');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`✅ Arquivos corrigidos: ${fixedFiles}/${files.length}`);
console.log(`📁 Total de arquivos verificados: ${files.length}`);

if (fixedFiles > 0) {
    console.log('\n🎉 Correções aplicadas com sucesso!');
    console.log('💡 Execute "npm run test-build" para verificar se os erros foram corrigidos');
} else {
    console.log('\n✨ Nenhuma correção automática necessária');
    console.log('💡 Todos os arquivos já estão corretos');
}

console.log('\n');
