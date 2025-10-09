#!/usr/bin/env node

/**
 * 🧪 Script de Teste de Build Local
 * Executa o build do Next.js localmente para detectar erros antes do deploy
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n🧪 Iniciando teste de build local...\n');

// Verificar se estamos no diretório correto
if (!fs.existsSync('package.json')) {
    console.error('❌ Execute este script na raiz do projeto (onde está o package.json)');
    process.exit(1);
}

// Verificar se node_modules existe
if (!fs.existsSync('node_modules')) {
    console.log('📦 Instalando dependências...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependências instaladas\n');
    } catch (error) {
        console.error('❌ Erro ao instalar dependências:', error.message);
        process.exit(1);
    }
}

// Executar build
console.log('🔨 Executando build local...\n');
try {
    execSync('npm run build', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
    });
    
    console.log('\n✅ BUILD LOCAL PASSOU!');
    console.log('🚀 Seguro para fazer deploy no Vercel\n');
    
    // Limpar pasta .next se necessário
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
        console.log('🧹 Limpando pasta .next...');
        fs.rmSync(nextDir, { recursive: true, force: true });
        console.log('✅ Pasta .next limpa\n');
    }
    
    process.exit(0);
    
} catch (error) {
    console.log('\n❌ BUILD LOCAL FALHOU!');
    console.log('🔧 Corrija os erros antes de fazer deploy\n');
    
    // Mostrar dicas de correção
    console.log('💡 DICAS DE CORREÇÃO:');
    console.log('   • Erros de TypeScript: Substitua "any" por tipos específicos');
    console.log('   • Imports não encontrados: Verifique se o arquivo existe');
    console.log('   • Variáveis não usadas: Remova ou use a variável');
    console.log('   • Hooks do React: Adicione dependências no useEffect\n');
    
    process.exit(1);
}
