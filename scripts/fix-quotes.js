const fs = require('fs');
const path = require('path');

function findFiles(dir) {
    let files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            files = files.concat(findFiles(fullPath));
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

function fixQuotes(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Corrigir &quot; para " em atributos className
        content = content.replace(/className=&quot;([^&]*)&quot;/g, 'className="$1"');
        
        // Corrigir &quot; para " em outros atributos
        content = content.replace(/&quot;/g, '"');
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Corrigido: ${path.relative(process.cwd(), filePath)}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.log(`❌ Erro ao processar ${filePath}: ${error.message}`);
        return false;
    }
}

console.log('🔧 Corrigindo aspas em arquivos...\n');

const appDir = path.join(process.cwd(), 'app');
const files = findFiles(appDir);

let fixedCount = 0;
files.forEach(file => {
    if (fixQuotes(file)) {
        fixedCount++;
    }
});

console.log(`\n✅ ${fixedCount} arquivos corrigidos!`);
