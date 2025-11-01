// ============================================
// CARREGADOR DE VARIÁVEIS DE AMBIENTE
// ============================================
// Este módulo garante que as variáveis de ambiente sejam carregadas
// mesmo quando o Next.js não as carrega automaticamente
// IMPORTANTE: Só funciona no servidor (não no cliente)

import { config } from 'dotenv';
import path from 'path';

let envLoaded = false;
let fsModule: typeof import('fs') | null = null;

// Carregar fs apenas no servidor (lazy loading para evitar bundle no cliente)
function getFs() {
  // Se estiver no cliente, retornar null imediatamente
  if (typeof window !== 'undefined' || typeof process === 'undefined') {
    return null;
  }
  
  if (!fsModule) {
    try {
      // Usar Function constructor para evitar que o webpack faça bundle do fs no cliente
      const requireFunc = new Function('moduleName', 'return require(moduleName)');
      fsModule = requireFunc('fs');
    } catch (error) {
      // Se require não estiver disponível, retornar null
      return null;
    }
  }
  
  return fsModule;
}

export function loadEnv() {
  // Não executar no cliente
  if (typeof window !== 'undefined') {
    return;
  }
  
  if (envLoaded) return; // Evitar carregar múltiplas vezes
  
  const fileSystem = getFs();
  if (!fileSystem) {
    // Se fs não estiver disponível, apenas usar dotenv
    const rootPath = process.cwd();
    const envPaths = [
      path.resolve(rootPath, '.env.local'),
      path.resolve(rootPath, '.env'),
    ];

    for (const envPath of envPaths) {
      try {
        const result = config({ path: envPath, override: false });
        if (!result.error) {
          console.log(`✅ Carregado ${envPath}`);
          envLoaded = true;
          break;
        }
      } catch (error) {
        // Continuar tentando
      }
    }
    return;
  }
  
  const rootPath = process.cwd();
  const envPaths = [
    path.resolve(rootPath, '.env.local'),
    path.resolve(rootPath, '.env'),
  ];

  for (const envPath of envPaths) {
    if (fileSystem.existsSync(envPath)) {
      try {
        const result = config({ path: envPath, override: false });
        if (result.error) {
          console.warn(`⚠️ Erro ao carregar ${envPath}:`, result.error);
        } else {
          console.log(`✅ Carregado ${envPath}`);
          envLoaded = true;
          break; // Usar o primeiro arquivo encontrado
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao processar ${envPath}:`, error);
      }
    }
  }
  
  if (!envLoaded) {
    console.warn('⚠️ Nenhum arquivo .env encontrado');
  }
}

// Carregar imediatamente quando o módulo for importado (apenas no servidor)
if (typeof window === 'undefined') {
  loadEnv();
}

// Função para obter uma variável de ambiente com fallback
export function getEnv(key: string, defaultValue?: string): string | undefined {
  // Não executar no cliente
  if (typeof window !== 'undefined') {
    return process.env[key] || defaultValue;
  }
  
  // Garantir que está carregado
  if (!envLoaded) {
    loadEnv();
  }
  
  // Tentar process.env primeiro
  let value = process.env[key];
  
  // Se não encontrou, tentar ler diretamente do arquivo
  if (!value) {
    const fileSystem = getFs();
    if (fileSystem) {
      const rootPath = process.cwd();
      const envPaths = [
        path.resolve(rootPath, '.env.local'),
        path.resolve(rootPath, '.env'),
      ];
      
      for (const envPath of envPaths) {
        if (fileSystem.existsSync(envPath)) {
          try {
            const content = fileSystem.readFileSync(envPath, 'utf-8');
            const lines = content.split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith(`${key}=`) && !trimmed.startsWith('#')) {
                const match = trimmed.match(/^([^=]+)=(.*)$/);
                if (match) {
                  value = match[2]?.trim();
                  // Remover aspas se houver
                  value = value?.replace(/^["']|["']$/g, '');
                  if (value) {
                    // Atualizar process.env para uso futuro
                    process.env[key] = value;
                    break;
                  }
                }
              }
            }
            if (value) break;
          } catch (error) {
            // Continuar tentando outros arquivos
          }
        }
      }
    }
  }
  
  return value || defaultValue;
}

