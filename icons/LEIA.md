# Ícones do Ascension 1.0

Fonte: `icon.svg` (normal), `icon-maskable.svg` (sangra até a borda; o "A" fica dentro dos 80% seguros) e `icon-monochrome.svg` (ícone temático do Android). Mesmo desenho dos `icon-*.png` da raiz, que continuam lá porque os service workers e as páginas antigas apontam para eles.

| Arquivo | Uso |
|---|---|
| `icon-48` … `icon-1024.png` | favicon, atalhos, iPad (152, 167), iPhone (180), Android (192, 512) |
| `maskable-192/512.png` | ícone adaptável do Android (manifest, `purpose: maskable`) |
| `monochrome-512.png` | ícone temático do Android 13+ |
| `store-1024.png` | App Store e Play Store (sem transparência; a loja arredonda) |
| `splash/apple-splash-*.png` | tela de abertura no iPhone instalado. Colar `splash/links.html` no `<head>` (o caminho já está certo para `/comecar/`; na raiz troque `../icons/` por `icons/`) |
| `shots/*.jpg` | screenshots do manifest (janela de instalação mais rica no Android) |

Para refazer depois de mudar o SVG: renderizar cada tamanho no Chromium (Playwright), como em `docs/lojas/screenshots.js`.
