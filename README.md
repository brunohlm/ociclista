# 🚴 O Ciclista — Calculadora de Pressão de Pneu

Calculadora de pressão de pneu para bicicletas com algoritmo calibrado contra o SRAM AXS Tire Pressure Guide.

## 📁 Estrutura do Projeto

```
ociclista/
├── index.html               ← Página principal (abre direto no browser)
├── css/
│   ├── variables.css        # Design tokens (cores, fontes, espaçamento)
│   ├── base.css             # Reset e estilos globais
│   ├── layout.css           # Grid, ad rails, responsividade
│   ├── components.css       # Mensagens, cards, botões, inputs
│   └── results.css          # Estilos da tela de resultados
├── js/
│   ├── state.js             # Estado global da aplicação
│   ├── analytics.js         # Eventos customizados do Google Analytics
│   ├── ui.js                # Navegação entre steps, validação, DOM
│   ├── calculator.js        # Motor de cálculo (fórmula SRAM calibrada)
│   └── results.js           # Renderização dos resultados
├── assets/icons/logo.svg    # Logo SVG
├── docs/FORMULA.md          # Documentação da fórmula e calibração
├── .vscode/extensions.json  # Extensões recomendadas VS Code
├── package.json
├── .gitignore
├── LICENSE
└── README.md
```

## 🚀 Como rodar

```bash
# Opção 1: Abrir direto no browser (mais simples)
# Dê duplo-clique em index.html

# Opção 2: VS Code Live Server (recomendado para dev)
# Instale a extensão "Live Server" → clique "Go Live" no index.html

# Opção 3: Servidor local via npm
npx serve . -l 3000
```

## 📊 Google Analytics

Inclui Google Analytics 4 com eventos customizados:

| Evento | Trigger | Parâmetros |
|--------|---------|------------|
| `select_ride_type` | Seleção do estilo | `ride_type` |
| `calculate_pressure` | Clique em calcular | `ride_type`, `total_weight`, `tire_width`, `rim_type`, `front_psi`, `rear_psi` |
| `reset_calculator` | Clique em recalcular | — |

> ⚠️ **Substitua `G-XXXXXXXXXX`** pelo seu Measurement ID real em `index.html` (2 ocorrências).
> Crie em: [Google Analytics](https://analytics.google.com) → Admin → Data Streams → Web

## 💰 Ads (Google AdSense)

Espaços preparados:
- **2× Laterais** (160×600) — desktop >1200px
- **2× Banners** (728×90) — topo e rodapé

Substitua os placeholders `<!-- AD SLOT -->` pelos snippets do AdSense.

## 🔬 Algoritmo

```
P = K × W_wheel / (tireWidth × rimWidth^1.4) × ajustes
```

Calibrado para bater exatamente com o SRAM AXS. Detalhes em `docs/FORMULA.md`.

## 📄 Licença

MIT — Uso livre. Não afiliado à SRAM LLC.
