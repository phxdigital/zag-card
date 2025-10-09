#!/usr/bin/env node

/**
 * 🧠 Deploy Inteligente - Versão 2.0
 * Sistema realmente inteligente que detecta e corrige erros automaticamente
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🧠 DEPLOY INTELIGENTE v2.0 - Zag NFC\n');

// Verificar se estamos no git
try {
    execSync('git status', { stdio: 'pipe' });
} catch (error) {
    console.error('❌ Não é um repositório git');
    process.exit(1);
}

// Verificar se há mudanças
try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (!status.trim()) {
        console.log('ℹ️  Nenhuma mudança para commitar');
        process.exit(0);
    }
} catch (error) {
    console.error('❌ Erro ao verificar status do git');
    process.exit(1);
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

// Correções inteligentes baseadas em erros reais
const smartFixes = [
    {
        name: 'Aspas escapadas em atributos',
        pattern: /(\w+)=&ldquo;([^&]*)&rdquo;/g,
        replacement: '$1="$2"',
        description: 'Corrige aspas escapadas em atributos HTML/JSX',
        critical: true
    },
    {
        name: 'Aspas escapadas em strings',
        pattern: /&ldquo;([^&]*)&rdquo;/g,
        replacement: '"$1"',
        description: 'Corrige aspas escapadas em strings',
        critical: true
    },
    {
        name: 'Next.js 15 params Promise',
        pattern: /{ params }: { params: { ([^}]+) } }/g,
        replacement: '{ params }: { params: Promise<{ $1 }> }',
        description: 'Corrige tipo de params para Next.js 15',
        critical: true
    },
    {
        name: 'Next.js 15 cookies await',
        pattern: /const cookieStore = await cookies\(\);/g,
        replacement: 'const cookieStore = cookies();',
        description: 'Remove await desnecessário do cookies()',
        critical: true
    },
    {
        name: 'Require para Import',
        pattern: /require\(['"]([^'"]+)['"]\)/g,
        replacement: "import('$1')",
        description: 'Converte require() para import()',
        critical: true
    },
    {
        name: 'Any para unknown',
        pattern: /: any\b/g,
        replacement: ': unknown',
        description: 'Substitui any por unknown',
        critical: false
    },
    {
        name: 'Variáveis não usadas em catch',
        pattern: /} catch \(error\) \{[^}]*console\.error[^}]*\}/g,
        replacement: (match) => match.replace(/} catch \(error\) \{/, '} catch {'),
        description: 'Remove variável error não usada em catch',
        critical: false
    }
];

// Função para processar arquivo com correções inteligentes
function processFileSmart(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let fixesApplied = [];
        
        smartFixes.forEach(fix => {
            const originalContent = content;
            
            if (typeof fix.replacement === 'function') {
                content = content.replace(fix.pattern, fix.replacement);
            } else {
                content = content.replace(fix.pattern, fix.replacement);
            }
            
            if (content !== originalContent) {
                modified = true;
                fixesApplied.push({
                    name: fix.name,
                    critical: fix.critical,
                    description: fix.description
                });
            }
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            return { modified: true, fixes: fixesApplied };
        }
        
        return { modified: false, fixes: [] };
    } catch (error) {
        console.log(`  ❌ Erro ao processar ${filePath}: ${error.message}`);
        return { modified: false, fixes: [] };
    }
}

// Executar correções inteligentes
console.log('🧠 Aplicando correções inteligentes...\n');

const appDir = path.join(process.cwd(), 'app');
const files = findFiles(appDir);

console.log(`📁 Analisando ${files.length} arquivos...\n`);

let totalFixes = 0;
let criticalFixes = 0;
let filesModified = 0;

files.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    const result = processFileSmart(file);
    
    if (result.modified) {
        filesModified++;
        console.log(`🔧 ${relativePath}:`);
        
        result.fixes.forEach(fix => {
            totalFixes++;
            if (fix.critical) criticalFixes++;
            console.log(`  ${fix.critical ? '🚨' : '⚠️'} ${fix.name}: ${fix.description}`);
        });
        console.log('');
    }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 RESULTADO DAS CORREÇÕES INTELIGENTES');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`✅ Arquivos corrigidos: ${filesModified}/${files.length}`);
console.log(`🚨 Correções críticas: ${criticalFixes}`);
console.log(`⚠️  Correções menores: ${totalFixes - criticalFixes}`);
console.log(`📊 Total de correções: ${totalFixes}`);

if (totalFixes > 0) {
    console.log('\n🎉 Correções aplicadas com sucesso!');
    
    // Executar teste de build
    console.log('\n🧪 Testando build após correções...\n');
    try {
        execSync('npm run build', { 
            stdio: 'inherit',
            env: { ...process.env, NODE_ENV: 'production' }
        });
        
        console.log('\n✅ BUILD PASSOU APÓS CORREÇÕES!');
        console.log('📝 Fazendo commit e push...\n');
        
        // Fazer commit
        const commitMessage = process.argv[2] || 'fix: correções inteligentes aplicadas automaticamente';
        execSync(`git add .`, { stdio: 'inherit' });
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
        execSync('git push origin main', { stdio: 'inherit' });
        
        console.log('\n🎉 DEPLOY INTELIGENTE CONCLUÍDO!');
        console.log('⏱️  Aguarde ~3-5 minutos para o Vercel completar o build');
        console.log('🔗 Monitore em: https://vercel.com/dashboard\n');
        
    } catch (error) {
        console.log('\n❌ Build ainda falhou após correções!');
        console.log('🔧 Execute "npm run test-build" para ver os erros restantes');
        console.log('💡 Ou corrija manualmente os erros mostrados acima\n');
        process.exit(1);
    }
} else {
    console.log('\n✨ Nenhuma correção necessária');
    console.log('🧪 Testando build...\n');
    
    try {
        execSync('npm run build', { 
            stdio: 'inherit',
            env: { ...process.env, NODE_ENV: 'production' }
        });
        
        console.log('\n✅ BUILD PASSOU!');
        console.log('📝 Fazendo commit e push...\n');
        
        const commitMessage = process.argv[2] || 'feat: deploy com build testado';
        execSync(`git add .`, { stdio: 'inherit' });
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
        execSync('git push origin main', { stdio: 'inherit' });
        
        console.log('\n🎉 DEPLOY CONCLUÍDO!');
        console.log('⏱️  Aguarde ~3-5 minutos para o Vercel completar o build\n');
        
    } catch (error) {
        console.log('\n❌ Build falhou!');
        console.log('🔧 Execute "npm run test-build" para ver os erros');
        process.exit(1);
    }
}
