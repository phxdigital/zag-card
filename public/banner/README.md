# 📸 Imagens do Banner - Hero Section

## Como usar:

1. **Adicione suas imagens nesta pasta com os seguintes nomes:**
   - `banner-1.png`
   - `banner-2.png`
   - `banner-3.png`

2. **Formatos recomendados:**
   - PNG ou JPG
   - Resolução mínima: 1920x600 pixels
   - Aspect ratio: 16:9 ou similar
   - Tamanho otimizado (máximo 500KB por imagem)

3. **Dicas de design:**
   - Use imagens horizontais (landscape)
   - Evite texto importante nas imagens (o conteúdo da Hero aparece por cima)
   - Prefira imagens com boa iluminação e cores vibrantes
   - Mantenha o foco no centro da imagem

## Slider automático:
- O banner muda automaticamente a cada **3 segundos**
- Transição suave com fade de 1 segundo
- As imagens aparecem em loop infinito

## Para adicionar mais ou menos imagens:
Edite o arquivo: `app/components/HeroSection.tsx`
```typescript
const bannerImages = [
  "/banner/banner-1.png",
  "/banner/banner-2.png",
  "/banner/banner-3.png",
  // Adicione mais imagens aqui
]
```

## Efeito visual:
- Banner fica atrás do conteúdo
- Gradiente azul suave sobreposto
- Conteúdo do hero (título, botões, etc) fica visível por cima

