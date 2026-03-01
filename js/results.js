/* ============================================================
   O CICLISTA — Results Renderer
   ============================================================ */

function displayResults(data) {
  const rideTypeLabels = { road: 'Road', gravel: 'Gravel', cyclocross: 'Cyclocross', mtb: 'MTB' };
  const condLabels = { dry: 'Seco', wet: 'Molhado' };
  const rimLabels = {
    hookless_tubeless: 'Hookless (Tubeless)',
    hooked_tubeless:   'Hooked (Tubeless)',
    hooked_tubed:      'Hooked (com Câmara)'
  };

  let warningHtml = '';
  if (data.isHookless) {
    warningHtml = `
      <div class="results-warning">
        ⚠️ <strong>Aro Hookless:</strong> Pressão máxima limitada a 72.5 psi (5 bar) conforme norma ETRTO.
        Nunca exceda este limite.
      </div>`;
  }
  if (data.frontPsi >= data.maxPsi || data.rearPsi >= data.maxPsi) {
    warningHtml += `
      <div class="results-warning">
        ⚠️ A pressão calculada atingiu o limite máximo do seu tipo de aro. Considere usar pneus mais largos
        para obter pressões mais confortáveis.
      </div>`;
  }

  const container = document.getElementById('resultsContent');
  container.innerHTML = `
    <p>Aqui está a sua <span class="highlight">pressão recomendada</span>:</p>
    <div class="results-card">
      <div class="results-header">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        <span>Pressão Recomendada</span>
      </div>
      <div class="results-body">
        <div class="tire-visual">
          <div class="tire-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" stroke-width="6"/>
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--accent)" stroke-width="6"
                stroke-dasharray="${(data.frontPsi / data.maxPsi) * 276} 276"
                stroke-linecap="round" transform="rotate(-90 50 50)"/>
              <circle cx="50" cy="50" r="16" fill="none" stroke="var(--border)" stroke-width="3"/>
            </svg>
            <div class="tire-circle-label">
              <div class="tc-value">${data.frontPsi}</div>
              <div class="tc-unit">PSI</div>
              <div class="tc-pos">Frente</div>
            </div>
          </div>
          <div class="tire-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" stroke-width="6"/>
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--accent)" stroke-width="6"
                stroke-dasharray="${(data.rearPsi / data.maxPsi) * 276} 276"
                stroke-linecap="round" transform="rotate(-90 50 50)"/>
              <circle cx="50" cy="50" r="16" fill="none" stroke="var(--border)" stroke-width="3"/>
            </svg>
            <div class="tire-circle-label">
              <div class="tc-value">${data.rearPsi}</div>
              <div class="tc-unit">PSI</div>
              <div class="tc-pos">Traseiro</div>
            </div>
          </div>
        </div>

        <div class="pressure-display">
          <div class="pressure-item">
            <div class="pressure-label">Dianteiro</div>
            <div class="pressure-value">${data.frontPsi}</div>
            <div class="pressure-unit">psi</div>
            <div class="bar-value">${data.frontBar} bar</div>
          </div>
          <div class="pressure-item">
            <div class="pressure-label">Traseiro</div>
            <div class="pressure-value">${data.rearPsi}</div>
            <div class="pressure-unit">psi</div>
            <div class="bar-value">${data.rearBar} bar</div>
          </div>
        </div>

        <div class="results-details">
          <div class="detail-row">
            <span class="label">Estilo</span>
            <span class="value">${rideTypeLabels[state.rideType]} — ${condLabels[state.condition]}</span>
          </div>
          <div class="detail-row">
            <span class="label">Peso total</span>
            <span class="value">${data.totalWeightKg} kg (ciclista: ${data.riderWeightKg} + bike: ${data.bikeWeightKg})</span>
          </div>
          <div class="detail-row">
            <span class="label">Pneus</span>
            <span class="value">F: ${data.frontWidthMm}mm / R: ${data.rearWidthMm}mm</span>
          </div>
          <div class="detail-row">
            <span class="label">Aro</span>
            <span class="value">${rimLabels[state.rimType]}</span>
          </div>
          <div class="detail-row">
            <span class="label">Setup</span>
            <span class="value">${data.isTubeless ? '✅ Tubeless' : '🔵 Com câmara'}</span>
          </div>
        </div>

        ${warningHtml}

        <div class="results-tip">
          💡 <strong>Dica:</strong> Estas são recomendações como ponto de partida. Ajuste ±2-3 psi conforme
          seu conforto. Em piso irregular, reduza 3-5 psi. Verifique a pressão antes de cada pedal —
          variações de temperatura afetam a pressão.
        </div>
      </div>
    </div>

    <button class="calc-btn" onclick="resetCalculator()" style="margin-top:16px;background:var(--bg-input);color:var(--text-primary);border:1px solid var(--border);">
      ↻ Recalcular
    </button>
  `;

  goToStep(5);
}
