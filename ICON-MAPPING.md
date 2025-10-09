# Mapeamento de Ícones - Zag Card App

## Ícones Verificados e Funcionais ✅

### Ícones Sociais
- **WhatsApp**: `message-circle` → MessageCircle
- **Instagram**: `instagram` → Instagram  
- **YouTube**: `youtube` → Youtube
- **LinkedIn**: `linkedin` → Linkedin ✅
- **Facebook**: `facebook` → Facebook
- **Twitter**: `twitter` → Twitter

### Ícones Especiais
- **PIX**: `pix` → PixIconCustom (componente customizado) ✅
- **Salvar Contato (Tel)**: `user-plus` → UserPlus ✅
- **Compartilhar**: `share` → Share2 ✅

### Ícones de Comunicação
- **Telefone**: `phone` → Phone ✅
- **Email**: `mail` → Mail
- **Localização**: `map-pin` → MapPin

### Ícones de Ação
- **Copiar**: `copy` → Copy
- **Download**: `download` → Download
- **Upload**: `upload` → Upload
- **Link**: `link` → LinkIcon

## Debug

Se um ícone não estiver aparecendo na página publicada, verifique o console do navegador.
Haverá um warning indicando qual ícone não foi encontrado:

```
Icon "nome-do-icone" not found in icon map
```

## Arquivos Importantes

- **Dashboard**: `app/dashboard/page.tsx` - Define quais ícones são salvos
- **Página Publicada**: `app/[subdomain]/page-client.tsx` - Renderiza os ícones
- **Ícone PIX**: `app/components/PixIcon.tsx` - Componente customizado para PIX

## Verificação Rápida

Se um botão não estiver mostrando o ícone correto:

1. Abra o console do navegador (F12)
2. Olhe por warnings do tipo "Icon not found"
3. Verifique se o nome do ícone está no mapa em `page-client.tsx`
4. Verifique se o ícone está importado do `lucide-react`

