const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSubdomain() {
  console.log('🔍 Testando subdomínio "zazag"...');
  
  try {
    // Buscar a página com subdomain "zazag"
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('subdomain', 'zazag')
      .single();

    if (error) {
      console.error('❌ Erro ao buscar página:', error);
      return;
    }

    if (data) {
      console.log('✅ Página encontrada!');
      console.log('📄 Dados:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Página não encontrada no banco de dados');
      
      // Listar todas as páginas para debug
      console.log('\n🔍 Listando todas as páginas existentes:');
      const { data: allPages, error: allError } = await supabase
        .from('pages')
        .select('subdomain, id, created_at');
      
      if (allError) {
        console.error('❌ Erro ao listar páginas:', allError);
      } else {
        console.log('📋 Páginas encontradas:', allPages);
      }
    }
  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

testSubdomain();
