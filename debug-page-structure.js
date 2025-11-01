/**
 * Script para debugar a estrutura da tabela pages
 * Execute este script no console do navegador
 */

console.log('🔍 Debugando estrutura da tabela pages...');

// 1. Verificar se estamos em uma página NFC ou dashboard
console.log('1. Tipo de página:');
console.log('   URL:', window.location.href);
console.log('   É dashboard?', window.location.pathname.includes('/dashboard'));
console.log('   É subdomain?', !window.location.pathname.includes('/dashboard'));

// 2. Verificar se o Page ID está definido
console.log('2. Page ID:');
console.log('   Valor:', window.__PAGE_ID__);
console.log('   Tipo:', typeof window.__PAGE_ID__);

// 3. Verificar se o script de tracking está carregado
console.log('3. Script de tracking:');
const trackingScript = document.querySelector('script[src="/tracking.js"]');
console.log('   Carregado:', !!trackingScript);
if (trackingScript) {
    console.log('   Elemento:', trackingScript);
}

// 4. Verificar se há scripts de analytics
console.log('4. Scripts de analytics:');
const analyticsScripts = document.querySelectorAll('script[id*="analytics"]');
console.log('   Quantidade:', analyticsScripts.length);
analyticsScripts.forEach((script, index) => {
    console.log(`   Script ${index + 1}:`, script.id, script.innerHTML);
});

// 5. Verificar se há erros no console
console.log('5. Verifique se há erros relacionados ao analytics acima');

console.log('🎯 Para testar analytics corretamente:');
console.log('- Acesse uma página NFC (ex: https://seu-subdomain.zagnfc.com.br)');
console.log('- NÃO acesse páginas do dashboard');
console.log('- O analytics só funciona em páginas NFC públicas');
