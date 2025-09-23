// Script para testar a conexão com o Supabase
// Execute com: node scripts/test-connection.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não encontradas!');
    console.log('Certifique-se de que o arquivo .env.local existe e contém:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=...');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('🔍 Testando conexão com Supabase...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey.substring(0, 20) + '...');
    
    try {
        // Teste 1: Verificar se a tabela pages existe
        console.log('\n📋 Testando tabela pages...');
        const { data, error } = await supabase
            .from('pages')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error('❌ Erro ao acessar tabela pages:', error.message);
            return;
        }
        console.log('✅ Tabela pages acessível');
        
        // Teste 2: Verificar se o bucket logos existe
        console.log('\n🖼️ Testando bucket logos...');
        const { data: buckets, error: bucketError } = await supabase.storage
            .listBuckets();
            
        if (bucketError) {
            console.error('❌ Erro ao acessar storage:', bucketError.message);
            console.log('💡 Dica: Verifique se o RLS está configurado corretamente');
            return;
        }
        
        const logosBucket = buckets.find(bucket => bucket.name === 'logos');
        if (logosBucket) {
            console.log('✅ Bucket logos encontrado');
        } else {
            console.log('⚠️ Bucket logos não encontrado');
            console.log('💡 Crie manualmente no painel do Supabase:');
            console.log('   1. Vá para Storage');
            console.log('   2. Clique em "New bucket"');
            console.log('   3. Nome: logos');
            console.log('   4. Marque como público');
        }
        
        // Teste 3: Verificar RLS
        console.log('\n🔒 Testando Row Level Security...');
        const { data: rlsData, error: rlsError } = await supabase
            .from('pages')
            .select('*')
            .limit(1);
            
        if (rlsError && rlsError.message.includes('RLS')) {
            console.log('✅ RLS está ativo (erro esperado sem autenticação)');
        } else if (rlsError) {
            console.error('❌ Erro inesperado:', rlsError.message);
        } else {
            console.log('⚠️ RLS pode não estar ativo (dados retornados sem autenticação)');
        }
        
        console.log('\n🎉 Teste de conexão concluído!');
        console.log('\n📝 Próximos passos:');
        console.log('1. Execute: npm run dev');
        console.log('2. Acesse: http://localhost:3000/dashboard');
        console.log('3. Teste o login e criação de páginas');
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

testConnection();
