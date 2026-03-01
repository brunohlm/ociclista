# 🔬 Documentação da Fórmula — O Ciclista

## Fórmula Principal

```
P = K × W_wheel / (tireWidth × rimWidth^1.4) × casingMult × wetMult × diameterMult + systemAdj
```

## Variáveis

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `P` | output | Pressão recomendada em PSI |
| `K` | constante | Fator por tipo de pedal |
| `W_wheel` | calculado | Peso no eixo (kg) = totalWeight × distribuição |
| `tireWidth` | input | Largura do pneu em mm |
| `rimWidth` | input | Largura interna do aro em mm |
| `1.4` | constante | Expoente que modela relação rim-width → volume de ar |
| `casingMult` | lookup | Multiplicador por tipo de casing |
| `wetMult` | lookup | Multiplicador por condição do piso |
| `diameterMult` | lookup | Multiplicador por diâmetro da roda |
| `systemAdj` | lookup | Ajuste aditivo (PSI) por tipo de sistema (tubed/tubeless) |

## Constantes Calibradas

### K (Ride Type Constants)

| Tipo | K | Calibração |
|------|---|-----------|
| Road | 2982.5 | Calibrado contra SRAM AXS (66.5/70.8 psi) |
| Gravel | 4200 | Ajustado para 35-55 psi em pneus 38-42mm |
| Cyclocross | 3800 | Ajustado para 45-65 psi em pneus 33mm |
| MTB | 5600 | Ajustado para 20-35 psi em pneus 2.3-2.5" |

### Distribuição de Peso (front / rear)

| Tipo | Frente | Traseiro | Fonte |
|------|--------|----------|-------|
| Road | 48.43% | 51.57% | Derivado da razão 66.5/70.8 do SRAM |
| Gravel | 45% | 55% | Posição mais relaxada |
| Cyclocross | 45% | 55% | Similar ao gravel |
| MTB | 42% | 58% | Posição mais traseira |

### Casing Multiplier

| Casing | Multiplicador | Justificativa |
|--------|--------------|---------------|
| Thin | 1.06 (+6%) | Menos proteção → precisa mais ar para suporte |
| Standard | 1.00 | Baseline |
| Reinforced | 0.95 (-5%) | Mais estrutura → pode rodar com menos ar |

### System Adjustment (PSI aditivo)

| Sistema | Ajuste | Justificativa |
|---------|--------|---------------|
| Hooked Tubeless | 0 | **BASELINE** (K calibrado neste sistema) |
| Hookless Tubeless | 0 | Mesma fórmula, cap em 72.5 PSI |
| Hooked com Câmara | +3 | Tubo interno adiciona fricção, risco de pinch flat |

### Wet Multiplier

| Condição | Multiplicador |
|----------|--------------|
| Seco | 1.0 |
| Molhado | 0.93 (-7%) |

### Diameter Multiplier

| Diâmetro | Multiplicador |
|----------|--------------|
| 700c / 29" | 1.0 |
| 650b / 27.5" | 1.03 |
| 650c | 1.03 |
| 26" | 1.06 |

## Limites de Segurança

| Condição | Limite |
|----------|--------|
| Hookless Tubeless | Máx 72.5 PSI (5 bar) — norma ETRTO |
| Hooked (qualquer) | Máx 120 PSI |
| MTB mínimo | 15 PSI |
| Road/Gravel/CX mínimo | 25 PSI |

## Pontos de Calibração Verificados

### Ponto 1 (do usuário vs SRAM AXS)
- **Input:** 84kg rider + 7.5kg bike, road, dry, 28mm standard, 700c, hooked tubeless, 21mm IW
- **SRAM:** Front 66.5 psi / Rear 70.8 psi
- **Nosso:** Front 66.5 psi / Rear 70.8 psi ✅

### Ponto 2 (fórum WeightWeenies)
- **Input:** ~108kg total, 28mm, 23mm IW, hooked
- **SRAM:** Rear ~73.8 psi (5.09 bar)
- **Nosso:** Rear 73.6 psi (5.07 bar) ✅

## Derivação Matemática

A fórmula foi obtida por engenharia reversa:

1. Da relação front/rear com mesmos pneus, derivamos a distribuição de peso:
   - `66.5 / 70.8 = 0.93926`
   - `front% = 0.93926 / (1 + 0.93926) = 0.4843`

2. Dos dois data points, derivamos o expoente do rim width:
   - `(23/21)^p = 1.5008 / 1.3249 = 1.1328`
   - `p = ln(1.1328) / ln(23/21) = 1.4`

3. Com p=1.4, calculamos K:
   - `K = 66.5 × 28 × 21^1.4 / (91.5 × 0.4843) = 2982.5`
