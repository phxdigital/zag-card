#!/usr/bin/env node

/**
 * 🚀 Script de Deploy Seguro
 * Testa o build localmente antes de fazer push para produção
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('\n🚀 DEPLOY SEGURO - Zag NFC\n');

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

// Executar correção automática de erros comuns
console.log('🔧 Aplicando correções automáticas...\n');
try {
    execSync('node scripts/fix-common-errors.js', { stdio: 'inherit' });
} catch (error) {
    console.log('⚠️  Correção automática falhou, continuando...\n');
}

// Executar teste de build
console.log('🧪 Testando build local...\n');
try {
    execSync('node scripts/test-build.js', { stdio: 'inherit' });
} catch (error) {
    console.log('\n❌ Build falhou! Deploy cancelado.');
    console.log('🔧 Corrija os erros e tente novamente.\n');
    process.exit(1);
}

// Se chegou até aqui, build passou
console.log('✅ Build local passou!');
console.log('📝 Fazendo commit e push...\n');

try {
    // Adicionar todos os arquivos
    execSync('git add .', { stdio: 'inherit' });
    
    // Fazer commit
    const commitMessage = process.argv[2] || 'feat: deploy com build testado';
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    
    // Push para produção
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('\n🎉 DEPLOY ENVIADO COM SUCESSO!');
    console.log('⏱️  Aguarde ~3-5 minutos para o Vercel completar o build');
    console.log('🔗 Monitore em: https://vercel.com/dashboard\n');
    
} catch (error) {
    console.error('\n❌ Erro durante commit/push:', error.message);
    process.exit(1);
}
