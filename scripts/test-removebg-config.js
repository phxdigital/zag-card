const fs = require('fs');
const path = require('path');

// Script para testar a configuração do remove.bg
async function testRemoveBgConfig() {
  console.log('🧪 Testando configuração do remove.bg...\n');

  // Verificar se o arquivo .env.local existe
  console.log('1. Verificando arquivo .env.local:');
  
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('❌ Arquivo .env.local não encontrado');
    console.log('📝 Crie o arquivo .env.local na raiz do projeto');
    console.log('📝 Adicione a linha: REMOVEBG_API_KEY=9eyfX7z4VUYxy679BCBYkrdv');
    return false;
  }

  // Ler o arquivo .env.local
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (!envContent.includes('REMOVEBG_API_KEY=9eyfX7z4VUYxy679BCBYkrdv')) {
    console.log('❌ API key do remove.bg não encontrada no .env.local');
    console.log('📝 Adicione a linha: REMOVEBG_API_KEY=9eyfX7z4VUYxy679BCBYkrdv');
    return false;
  }

  console.log('✅ API key do remove.bg configurada\n');

  // Verificar se os arquivos necessários existem
  console.log('2. Verificando arquivos necessários:');
  
  const requiredFiles = [
    'lib/removebg.ts',
    'app/api/remove-background/route.ts',
    'database/setup-removebg-bucket.sql'
  ];

  const missingFiles = requiredFiles.filter(filePath => !fs.existsSync(filePath));
  
  if (missingFiles.length > 0) {
    console.log('❌ Arquivos faltando:');
    missingFiles.forEach(filePath => console.log(`   - ${filePath}`));
    return false;
  }

  console.log('✅ Todos os arquivos necessários existem\n');

  // Verificar se a dependência do Cloudinary foi removida
  console.log('3. Verificando dependências:');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.dependencies.cloudinary) {
    console.log('⚠️  Dependência do Cloudinary ainda presente');
    console.log('   Execute: npm uninstall cloudinary');
  } else {
    console.log('✅ Dependência do Cloudinary removida');
  }

  console.log('\n4. Próximos passos:');
  console.log('   ✅ API key configurada');
  console.log('   📝 Execute o SQL em database/setup-removebg-bucket.sql no Supabase');
  console.log('   🧪 Teste a funcionalidade no dashboard');
  console.log('   📊 Monitore os logs para possíveis erros');

  return true;
}

// Executar teste
if (require.main === module) {
  testRemoveBgConfig()
    .then(success => {
      if (success) {
        console.log('\n🎉 Configuração do remove.bg concluída!');
        console.log('📝 Não esqueça de executar o SQL no Supabase');
      } else {
        console.log('\n❌ Configuração incompleta. Verifique os erros acima.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Erro durante o teste:', error);
      process.exit(1);
    });
}

module.exports = { testRemoveBgConfig };
