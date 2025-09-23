const dns = require('dns').promises;

async function testDNS() {
  console.log('🔍 Testando configuração DNS...\n');
  
  try {
    // Testar domínio principal
    console.log('1. Testando domínio principal: zagnfc.com.br');
    const mainResult = await dns.resolve4('zagnfc.com.br');
    console.log('✅ zagnfc.com.br resolve para:', mainResult);
    
    // Testar subdomínio
    console.log('\n2. Testando subdomínio: zazag.zagnfc.com.br');
    const subResult = await dns.resolve4('zazag.zagnfc.com.br');
    console.log('✅ zazag.zagnfc.com.br resolve para:', subResult);
    
    // Testar CNAME
    console.log('\n3. Testando CNAME do wildcard:');
    try {
      const cnameResult = await dns.resolveCname('zazag.zagnfc.com.br');
      console.log('✅ CNAME encontrado:', cnameResult);
    } catch (err) {
      console.log('❌ CNAME não encontrado:', err.message);
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 SOLUÇÃO:');
      console.log('1. Acesse o painel do seu provedor de domínio');
      console.log('2. Adicione um registro CNAME:');
      console.log('   - Tipo: CNAME');
      console.log('   - Nome: *');
      console.log('   - Valor: cname.vercel-dns.com');
      console.log('3. Aguarde a propagação DNS (pode levar até 24h)');
      console.log('4. No Vercel, adicione o domínio: *.zagnfc.com.br');
    }
  }
}

testDNS();

