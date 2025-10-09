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

function fixCatchBlocks(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        let fixes = [];
        
        // Padrão 1: } catch { ... error ... }
        const catchWithoutErrorPattern = /} catch \{\s*([^}]*\berror\b[^}]*)\s*\}/g;
        const matches1 = content.match(catchWithoutErrorPattern);
        if (matches1) {
            content = content.replace(catchWithoutErrorPattern, '} catch (error) {\n$1\n}');
            fixes.push(`Corrigido ${matches1.length} catch block(s) sem variável error`);
        }
        
        // Padrão 2: } catch { console.error('...', error); }
        const consoleErrorPattern = /} catch \{\s*console\.error\('[^']*:', error\);\s*\}/g;
        const matches2 = content.match(consoleErrorPattern);
        if (matches2) {
            content = content.replace(consoleErrorPattern, '} catch (error) {\nconsole.error(\'$1\', error);\n}');
            fixes.push(`Corrigido ${matches2.length} catch block(s) com console.error`);
        }
        
        // Padrão 3: } catch { const errorMessage = error instanceof Error ... }
        const instanceofPattern = /} catch \{\s*const errorMessage = error instanceof Error[^}]*\}/g;
        const matches3 = content.match(instanceofPattern);
        if (matches3) {
            content = content.replace(instanceofPattern, '} catch (error) {\nconst errorMessage = error instanceof Error$1\n}');
            fixes.push(`Corrigido ${matches3.length} catch block(s) com instanceof Error`);
        }
        
        // Padrão 4: } catch { ... ${error} ... }
        const templateLiteralPattern = /} catch \{\s*([^}]*\$\{error\}[^}]*)\s*\}/g;
        const matches4 = content.match(templateLiteralPattern);
        if (matches4) {
            content = content.replace(templateLiteralPattern, '} catch (error) {\n$1\n}');
            fixes.push(`Corrigido ${matches4.length} catch block(s) com template literals`);
        }
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${path.relative(process.cwd(), filePath)}:`);
            fixes.forEach(fix => console.log(`  🔧 ${fix}`));
            return true;
        }
        
        return false;
    } catch (error) {
        console.log(`❌ Erro ao processar ${filePath}: ${error.message}`);
        return false;
    }
}

console.log('🔧 Corrigindo catch blocks problemáticos...\n');

const appDir = path.join(process.cwd(), 'app');
const files = findFiles(appDir);

let fixedCount = 0;
files.forEach(file => {
    if (fixCatchBlocks(file)) {
        fixedCount++;
    }
});

console.log(`\n✅ ${fixedCount} arquivos corrigidos!`);
