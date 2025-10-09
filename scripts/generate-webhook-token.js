#!/usr/bin/env node

/**
 * Gera um token seguro para webhook
 * Execute: node scripts/generate-webhook-token.js
 */

const crypto = require('crypto');

// Gerar token aleatório
const token = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 Token de Webhook Gerado com Sucesso!\n');
console.log('━'.repeat(70));
console.log('\n📋 Copie este token:\n');
console.log(`   ${token}`);
console.log('\n━'.repeat(70));
console.log('\n📝 Adicione no seu .env.local:\n');
console.log(`   ASAAS_WEBHOOK_TOKEN=${token}`);
console.log('\n━'.repeat(70));
console.log('\n⚠️  IMPORTANTE:');
console.log('   1. Cole o MESMO token na Vercel (Environment Variables)');
console.log('   2. Cole o MESMO token no painel do Asaas (Webhook settings)');
console.log('   3. NÃO compartilhe este token publicamente!\n');

// Também gerar um UUID como alternativa
const uuid = crypto.randomUUID();
console.log('💡 Alternativa (UUID):\n');
console.log(`   ${uuid}\n`);

