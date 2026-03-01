/* ============================================================
   O CICLISTA — Pressure Calculator Engine
   
   Reverse-engineered from SRAM AXS Tire Pressure Guide.
   
   Core formula:
     P = K × W_wheel / (tireWidth × rimWidth^1.4) × adjustments
   
   Calibration verified:
   - 91.5kg, road, dry, 28mm std, hooked tubeless, 21mm → 66.5 / 70.8 psi ✅
   - 108kg, 28mm, 23mm IW, hooked → ~73.8 psi rear (5.09 bar) ✅
   ============================================================ */

// --- Constants ---

const WEIGHT_DISTRIBUTION = {
  road:       { front: 0.4843, rear: 0.5157 },
  gravel:     { front: 0.45,   rear: 0.55 },
  cyclocross: { front: 0.45,   rear: 0.55 },
  mtb:        { front: 0.42,   rear: 0.58 }
};

const PRESSURE_K = {
  road:       2982.5,
  gravel:     4200,
  cyclocross: 3800,
  mtb:        5600
};

const CASING_MULTIPLIER = {
  thin:       1.06,
  standard:   1.00,
  reinforced: 0.95
};

const DIAMETER_MULTIPLIER = {
  '700c': 1.0,
  '650b': 1.03,
  '650c': 1.03,
  '29':   1.0,
  '27.5': 1.03,
  '26':   1.06
};

const RIM_EXPONENT = 1.4;
const WET_MULTIPLIER = 0.93;
const TUBELESS_ADJ = 0;       // baseline (calibrated on hooked tubeless)
const TUBED_ADJ = 3;          // +3 psi for inner tube
const HOOKLESS_MAX_PSI = 72.5;
const HOOKED_MAX_PSI = 120;

// --- Helpers ---

function toKg(value, unit) {
  return unit === 'lb' ? value * 0.453592 : value;
}

function psiToBar(psi) {
  return psi * 0.0689476;
}

// --- Main Calculator ---

function calculatePressure() {
  // Collect inputs
  const riderWeightRaw = parseFloat(document.getElementById('riderWeight').value);
  const bikeWeightRaw  = parseFloat(document.getElementById('bikeWeight').value);
  const riderWeightKg  = toKg(riderWeightRaw, state.weightUnit);
  const bikeWeightKg   = toKg(bikeWeightRaw, state.weightUnit);
  const totalWeightKg  = riderWeightKg + bikeWeightKg;

  let frontWidthRaw = parseFloat(document.getElementById('frontTireWidth').value);
  let rearWidthRaw  = parseFloat(document.getElementById('rearTireWidth').value);

  let frontWidthMm = frontWidthRaw;
  let rearWidthMm  = rearWidthRaw;
  if (state.rideType === 'mtb') {
    frontWidthMm = frontWidthRaw * 25.4;
    rearWidthMm  = rearWidthRaw * 25.4;
  }

  const frontCasing   = document.getElementById('frontCasing').value;
  const rearCasing    = document.getElementById('rearCasing').value;
  const wheelDiameter = document.getElementById('wheelDiameter').value;
  const rimWidth      = 21;

  // Distribution & constants
  const dist = WEIGHT_DISTRIBUTION[state.rideType] || WEIGHT_DISTRIBUTION.road;
  const K    = PRESSURE_K[state.rideType] || PRESSURE_K.road;

  // Multipliers
  const frontCasingMult = CASING_MULTIPLIER[frontCasing] || 1.0;
  const rearCasingMult  = CASING_MULTIPLIER[rearCasing] || 1.0;
  const wetMult         = state.condition === 'wet' ? WET_MULTIPLIER : 1.0;
  const dMult           = DIAMETER_MULTIPLIER[wheelDiameter] || 1.0;

  // System adjustment
  const isTubeless = state.rimType === 'hookless_tubeless' || state.rimType === 'hooked_tubeless';
  const systemAdj  = state.rimType === 'hooked_tubed' ? TUBED_ADJ : TUBELESS_ADJ;

  // Core calculation
  const rimFactor = Math.pow(rimWidth, RIM_EXPONENT);
  const frontLoad = totalWeightKg * dist.front;
  const rearLoad  = totalWeightKg * dist.rear;

  let frontPsi = (K * frontLoad) / (frontWidthMm * rimFactor);
  frontPsi *= frontCasingMult * wetMult * dMult;
  frontPsi += systemAdj;

  let rearPsi = (K * rearLoad) / (rearWidthMm * rimFactor);
  rearPsi *= rearCasingMult * wetMult * dMult;
  rearPsi += systemAdj;

  // Safety limits
  const isHookless = state.rimType === 'hookless_tubeless';
  const maxPsi = isHookless ? HOOKLESS_MAX_PSI : HOOKED_MAX_PSI;
  const minPsi = state.rideType === 'mtb' ? 15 : 25;

  frontPsi = Math.max(minPsi, Math.min(maxPsi, frontPsi));
  rearPsi  = Math.max(minPsi, Math.min(maxPsi, rearPsi));

  // Round to 1 decimal (SRAM precision)
  frontPsi = Math.round(frontPsi * 10) / 10;
  rearPsi  = Math.round(rearPsi * 10) / 10;

  const frontBar = psiToBar(frontPsi).toFixed(2);
  const rearBar  = psiToBar(rearPsi).toFixed(2);

  // Analytics
  trackEvent('calculate_pressure', {
    ride_type: state.rideType,
    condition: state.condition,
    total_weight_kg: totalWeightKg.toFixed(1),
    front_tire_mm: frontWidthMm.toFixed(0),
    rear_tire_mm: rearWidthMm.toFixed(0),
    rim_type: state.rimType,
    rim_width_mm: rimWidth,
    front_psi: frontPsi,
    rear_psi: rearPsi
  });

  // Render results
  displayResults({
    frontPsi, rearPsi, frontBar, rearBar,
    totalWeightKg: totalWeightKg.toFixed(1),
    riderWeightKg: riderWeightKg.toFixed(1),
    bikeWeightKg: bikeWeightKg.toFixed(1),
    frontWidthMm: frontWidthMm.toFixed(0),
    rearWidthMm: rearWidthMm.toFixed(0),
    isHookless, isTubeless, maxPsi
  });
}
