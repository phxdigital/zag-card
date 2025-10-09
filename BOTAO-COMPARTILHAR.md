# 🔗 Botão de Compartilhar - Como Funciona

## 📋 Descrição

O botão "Compartilhar" permite que visitantes da sua página compartilhem automaticamente a URL da página em redes sociais e aplicativos de mensagem.

## ✨ Características

- ✅ **Automático**: Não precisa configurar nada além de adicionar o botão
- ✅ **Inteligente**: Usa a URL da página atual automaticamente
- ✅ **Nativo**: Abre o menu de compartilhamento do dispositivo
- ✅ **Compatível**: Funciona em mobile e desktop
- ✅ **Fallback**: Se o compartilhamento não estiver disponível, copia a URL

## 🎯 Como Funciona

### 1. No Dashboard
Ao clicar em "Adicionar Botão Compartilhar":
- O sistema cria um botão social com `icon: 'share'` e `url: 'share:'`
- Não é necessário configurar URL ou texto adicional

### 2. Na Página Publicada
Quando o visitante clica no botão:

**Em Mobile (com Web Share API):**
```
📱 Abre menu nativo com opções:
   - WhatsApp
   - Facebook
   - Instagram
   - Telegram
   - Email
   - Copiar link
   - Etc.
```

**Em Desktop (sem Web Share API):**
```
💻 Copia automaticamente a URL e mostra:
   "Link copiado! Compartilhe com seus contatos: [URL]"
```

## 🔍 Detalhes Técnicos

### URL Compartilhada
A URL compartilhada é sempre a URL atual da página:
- **Local**: `http://localhost:3000/subdominio`
- **Produção**: `https://subdominio.zagnfc.com.br`

### Informações Compartilhadas
Quando alguém compartilha, o sistema envia:
- **Título**: Nome da página (ou "Confira meu cartão digital")
- **Texto**: "Veja minhas informações e entre em contato!"
- **URL**: URL completa da página

### Compatibilidade
- ✅ **Mobile**: iOS Safari, Chrome Android, Edge Mobile
- ✅ **Desktop**: Copia URL automaticamente
- ✅ **Todos os navegadores**: Sempre funciona (com fallback)

## 🛠️ Troubleshooting

### Problema: Botão não aparece
**Solução:**
1. Verifique se você adicionou o botão no dashboard
2. Salve a página
3. Recarregue a página publicada

### Problema: Ao clicar nada acontece
**Solução:**
1. Abra o console do navegador (F12)
2. Procure por logs: `"Compartilhando página: [URL]"`
3. Verifique se há erros em vermelho

### Problema: Menu de compartilhamento não abre
**Possíveis causas:**
- Navegador não suporta Web Share API (desktop)
- Página não está em HTTPS (necessário para Web Share API)

**Solução:**
O sistema automaticamente usa fallback (copia URL)

## 💡 Exemplos de Uso

### Exemplo 1: Cartão Profissional
```
Visitante clica em "Compartilhar"
→ Escolhe WhatsApp
→ Mensagem pronta: "Veja minhas informações e entre em contato! https://joao.zagnfc.com.br"
```

### Exemplo 2: Networking
```
Em evento, alguém acessa seu cartão
→ Clica em "Compartilhar"
→ Envia para múltiplos contatos
→ Sua rede cresce automaticamente
```

### Exemplo 3: Desktop
```
Visitante no computador clica em "Compartilhar"
→ URL é copiada automaticamente
→ Cole onde quiser: email, LinkedIn, etc.
```

## 🎨 Personalização

O botão de compartilhar:
- Usa o ícone Share2 (mesmo da página de sucesso)
- É redondo e pequeno (como outros botões sociais)
- Cor pode ser personalizada no dashboard

## 📱 Redes Sociais Suportadas

Quando o menu nativo abre, o visitante pode compartilhar em:
- WhatsApp
- Facebook
- Twitter/X
- Instagram (stories)
- LinkedIn
- Telegram
- Email
- SMS
- E muitas outras...

**Nota:** As opções disponíveis dependem dos apps instalados no dispositivo do visitante.

## ✅ Checklist de Funcionamento

- [ ] Botão aparece na página publicada
- [ ] Ao clicar, abre console (F12) e veja: "Compartilhando página: [URL]"
- [ ] No mobile: menu de compartilhamento abre
- [ ] No desktop: URL é copiada
- [ ] URL compartilhada está correta

## 🚀 Melhorias Futuras

Possíveis adições:
- Customizar texto de compartilhamento
- Escolher imagem de preview
- Analytics de compartilhamentos
- Botões diretos para redes específicas

