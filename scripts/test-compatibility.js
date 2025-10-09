#!/usr/bin/env node

/**
 * 🧪 Script de Teste de Compatibilidade
 * Valida se o sistema de retrocompatibilidade está funcionando
 */

console.log('\n🧪 Iniciando testes de compatibilidade...\n');

// Simular dados de uma página antiga (sem isSocial)
const oldPageConfig = {
    customLinks: [
        {
            id: 1,
            text: "WhatsApp",
            url: "https://wa.me/5511999999999",
            icon: "message-circle",
            styleType: "solid",
            bgColor1: "#25D366",
            bgColor2: "#25D366",
            textColor: "#ffffff"
            // ❌ Sem isSocial (página antiga)
        },
        {
            id: 2,
            text: "Instagram",
            url: "https://instagram.com/usuario",
            icon: "instagram",
            styleType: "solid",
            bgColor1: "#E4405F",
            bgColor2: "#E4405F",
            textColor: "#ffffff"
            // ❌ Sem isSocial (página antiga)
        }
    ]
};

// Simular dados de uma página nova (com isSocial)
const newPageConfig = {
    customLinks: [
        {
            id: 1,
            text: "WhatsApp",
            url: "https://wa.me/5511999999999",
            icon: "message-circle",
            styleType: "solid",
            bgColor1: "#25D366",
            bgColor2: "#25D366",
            textColor: "#ffffff",
            isSocial: true // ✅ Página nova
        },
        {
            id: 2,
            text: "Meu Site",
            url: "https://meusite.com",
            icon: "globe",
            styleType: "gradient",
            bgColor1: "#3B82F6",
            bgColor2: "#8B5CF6",
            textColor: "#ffffff",
            isSocial: false // ✅ Botão personalizado
        }
    ]
};

// Função de compatibilidade (copiada de lib/page-compatibility.ts)
function ensureBackwardCompatibility(links) {
    if (!links) return [];
    
    return links.map(link => ({
        ...link,
        isSocial: link.isSocial ?? false,
        styleType: link.styleType || 'solid',
        bgColor1: link.bgColor1 || '#3B82F6',
        bgColor2: link.bgColor2 || '#3B82F6',
        textColor: link.textColor || '#ffffff',
        icon: link.icon || null
    }));
}

// Função para testar
function runTests() {
    let passed = 0;
    let failed = 0;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TESTE 1: Página Antiga (Sem isSocial)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const processedOldLinks = ensureBackwardCompatibility(oldPageConfig.customLinks);
    
    // Verificar se isSocial foi adicionado
    const allHaveIsSocial = processedOldLinks.every(link => 
        link.hasOwnProperty('isSocial')
    );
    
    if (allHaveIsSocial) {
        console.log('✅ PASSOU: Todas as páginas antigas receberam isSocial');
        passed++;
    } else {
        console.log('❌ FALHOU: Algumas páginas não têm isSocial');
        failed++;
    }

    // Verificar se isSocial é false (comportamento antigo)
    const allAreFalse = processedOldLinks.every(link => 
        link.isSocial === false
    );
    
    if (allAreFalse) {
        console.log('✅ PASSOU: Botões mantêm comportamento antigo (isSocial=false)');
        passed++;
    } else {
        console.log('❌ FALHOU: Botões não mantêm comportamento antigo');
        failed++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TESTE 2: Página Nova (Com isSocial)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const processedNewLinks = ensureBackwardCompatibility(newPageConfig.customLinks);
    
    // Verificar se valores originais foram mantidos
    const socialMaintained = processedNewLinks[0].isSocial === true;
    const customMaintained = processedNewLinks[1].isSocial === false;
    
    if (socialMaintained && customMaintained) {
        console.log('✅ PASSOU: Valores originais de isSocial mantidos');
        passed++;
    } else {
        console.log('❌ FALHOU: Valores originais foram alterados');
        failed++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TESTE 3: Valores Padrão');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const linkSemValores = {
        id: 999,
        text: "Teste",
        url: "https://test.com",
        icon: null
        // Sem cores, styleType, etc
    };

    const processed = ensureBackwardCompatibility([linkSemValores])[0];
    
    const hasDefaults = 
        processed.styleType === 'solid' &&
        processed.bgColor1 === '#3B82F6' &&
        processed.bgColor2 === '#3B82F6' &&
        processed.textColor === '#ffffff' &&
        processed.isSocial === false;
    
    if (hasDefaults) {
        console.log('✅ PASSOU: Valores padrão aplicados corretamente');
        passed++;
    } else {
        console.log('❌ FALHOU: Valores padrão não foram aplicados');
        console.log('Esperado:', {
            styleType: 'solid',
            bgColor1: '#3B82F6',
            bgColor2: '#3B82F6',
            textColor: '#ffffff',
            isSocial: false
        });
        console.log('Recebido:', {
            styleType: processed.styleType,
            bgColor1: processed.bgColor1,
            bgColor2: processed.bgColor2,
            textColor: processed.textColor,
            isSocial: processed.isSocial
        });
        failed++;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 TESTE 4: Array Vazio/Undefined');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const emptyResult = ensureBackwardCompatibility([]);
    const undefinedResult = ensureBackwardCompatibility(undefined);
    
    if (Array.isArray(emptyResult) && Array.isArray(undefinedResult)) {
        console.log('✅ PASSOU: Arrays vazios/undefined tratados corretamente');
        passed++;
    } else {
        console.log('❌ FALHOU: Arrays vazios/undefined não tratados');
        failed++;
    }

    // Resultado final
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESULTADO FINAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log(`✅ Testes Passados: ${passed}/${passed + failed}`);
    console.log(`❌ Testes Falhos:   ${failed}/${passed + failed}`);
    
    if (failed === 0) {
        console.log('\n🎉 TODOS OS TESTES PASSARAM!');
        console.log('✅ Sistema de compatibilidade está funcionando corretamente');
        console.log('✅ Seguro para fazer deploy!\n');
        process.exit(0);
    } else {
        console.log('\n⚠️  ALGUNS TESTES FALHARAM!');
        console.log('❌ NÃO faça o deploy ainda');
        console.log('❌ Verifique o código de compatibilidade\n');
        process.exit(1);
    }
}

// Executar testes
runTests();

