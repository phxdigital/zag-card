// Carregar .env.local MANUALMENTE para forçar leitura correta do $
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPaths = [
        path.join(process.cwd(), '.env.local'),
        path.join(require('os').homedir(), '.env.local'),
    ];

    for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
            console.log(`📂 Carregando env de: ${envPath}`);
            const content = fs.readFileSync(envPath, 'utf8');
            
            content.split('\n').forEach(line => {
                line = line.trim();
                if (!line || line.startsWith('#')) return;
                
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    let value = match[2].trim();
                    
                    // Remover aspas se existirem
                    if ((value.startsWith('"') && value.endsWith('"')) ||
                        (value.startsWith("'") && value.endsWith("'"))) {
                        value = value.slice(1, -1);
                    }
                    
                    // Só setar se ainda não existir (env do sistema tem precedência)
                    if (!process.env[key]) {
                        process.env[key] = value;
                        if (key === 'ASAAS_API_KEY') {
                            console.log(`🔑 ${key} carregado: ${value.substring(0, 20)}...`);
                        }
                    }
                }
            });
            
            return true;
        }
    }
    
    console.log('⚠️ Nenhum .env.local encontrado!');
    return false;
}

// Carregar imediatamente
loadEnv();

module.exports = { loadEnv };


