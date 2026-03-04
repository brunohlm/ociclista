/* ============================================================
   O CICLISTA — Pressure Calculator Engine
   
   Reverse-engineered from SRAM AXS Tire Pressure Guide.
   
   CORRECTED FORMULA (v2 — additive offset model):
   
     P_front = BASE_F + SLOPE_F * W_total * DIST_F / (tireWidth * rimWidth^1.4)
     P_rear  = BASE_R + SLOPE_R * W_total * DIST_R / (tireWidth * rimWidth^1.4)
   
   SRAM's pressure is NOT purely linear with weight. There's a significant
   base pressure component independent of rider weight. This was discovered
   when a lighter rider (67kg) got pressures much closer to a heavier one
   (91.5kg) than a linear model would predict (+7.6% PSI for +36.6% weight).
   
   Calibration verified against SRAM AXS:
   - 91.5kg, road, dry, 28mm std, hooked tubeless, 21mm IW -> 66.5 / 70.8 psi
   - 67.0kg, road, dry, 28mm std, hooked tubeless, 21mm IW -> 61.8 / 65.7 psi
   ============================================================ */

// --- Constants (Road, calibrated on SRAM AXS) ---

const ROAD_PARAMS = {
  front: { base: 48.95, slope: 787.2, dist: 0.4843 },
  rear:  { base: 51.75, slope: 802.2, dist: 0.5157 }
};

const DISCIPLINE_PARAMS = {
  road: ROAD_PARAMS,
  gravel: {
    front: { base: 30.0, slope: 1100, dist: 0.45 },
    rear:  { base: 32.0, slope: 1120, dist: 0.55 }
  },
  cyclocross: {
    front: { base: 35.0, slope: 1000, dist: 0.45 },
    rear:  { base: 37.0, slope: 1020, dist: 0.55 }
  },
  mtb: {
    front: { base: 18.0, slope: 1450, dist: 0.42 },
    rear:  { base: 20.0, slope: 1480, dist: 0.58 }
  }
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
const TUBED_ADJ = 3;
const HOOKLESS_MAX_PSI = 72.5;
const HOOKED_MAX_PSI = 120;

// --- Helpers ---

function toKg(value, unit) {
  return unit === 'lb' ? value * 0.453592 : value;
}

function psiToBar(psi) {
  return psi * 0.0689476;
}

// --- Domain (pure) ---

function computePressure(input) {
  const params = DISCIPLINE_PARAMS[input.rideType] || DISCIPLINE_PARAMS.road;

  const frontCasingMult = CASING_MULTIPLIER[input.frontCasing] || 1.0;
  const rearCasingMult  = CASING_MULTIPLIER[input.rearCasing] || 1.0;
  const wetMult         = input.condition === 'wet' ? WET_MULTIPLIER : 1.0;
  const dMult           = DIAMETER_MULTIPLIER[input.wheelDiameter] || 1.0;

  const isTubeless = input.rimType === 'hookless_tubeless' || input.rimType === 'hooked_tubeless';
  const systemAdj  = input.rimType === 'hooked_tubed' ? TUBED_ADJ : 0;

  const rimFactor = Math.pow(input.rimWidth, RIM_EXPONENT);

  const frontWeightTerm = params.front.slope * input.totalWeightKg * params.front.dist / (input.frontWidthMm * rimFactor);
  let frontPsi = params.front.base + frontWeightTerm;
  frontPsi *= frontCasingMult * wetMult * dMult;
  frontPsi += systemAdj;

  const rearWeightTerm = params.rear.slope * input.totalWeightKg * params.rear.dist / (input.rearWidthMm * rimFactor);
  let rearPsi = params.rear.base + rearWeightTerm;
  rearPsi *= rearCasingMult * wetMult * dMult;
  rearPsi += systemAdj;

  const isHookless = input.rimType === 'hookless_tubeless';
  const maxPsi = isHookless ? HOOKLESS_MAX_PSI : HOOKED_MAX_PSI;
  const minPsi = input.rideType === 'mtb' ? 15 : 25;

  frontPsi = Math.max(minPsi, Math.min(maxPsi, frontPsi));
  rearPsi  = Math.max(minPsi, Math.min(maxPsi, rearPsi));

  frontPsi = Math.round(frontPsi * 10) / 10;
  rearPsi  = Math.round(rearPsi * 10) / 10;

  const frontBar = psiToBar(frontPsi).toFixed(2);
  const rearBar  = psiToBar(rearPsi).toFixed(2);

  return {
    frontPsi,
    rearPsi,
    frontBar,
    rearBar,
    isHookless,
    isTubeless,
    maxPsi
  };
}

// --- Main Calculator (DOM adapter) ---

function calculatePressure() {
  const riderWeightRaw = parseFloat(document.getElementById('riderWeight').value);
  const bikeWeightRaw  = parseFloat(document.getElementById('bikeWeight').value);
  const riderWeightKg  = toKg(riderWeightRaw, state.weightUnit);
  const bikeWeightKg   = toKg(bikeWeightRaw, state.weightUnit);
  const totalWeightKg  = riderWeightKg + bikeWeightKg;

  const frontWidthRaw = parseFloat(document.getElementById('frontTireWidth').value);
  const rearWidthRaw  = parseFloat(document.getElementById('rearTireWidth').value);

  let frontWidthMm = frontWidthRaw;
  let rearWidthMm  = rearWidthRaw;
  if (state.rideType === 'mtb') {
    frontWidthMm = frontWidthRaw * 25.4;
    rearWidthMm  = rearWidthRaw * 25.4;
  }

  const input = {
    rideType: state.rideType,
    condition: state.condition,
    rimType: state.rimType,
    totalWeightKg,
    frontWidthMm,
    rearWidthMm,
    frontCasing: document.getElementById('frontCasing').value,
    rearCasing: document.getElementById('rearCasing').value,
    wheelDiameter: document.getElementById('wheelDiameter').value,
    rimWidth: 21
  };

  const result = computePressure(input);

  trackEvent('calculate_pressure', {
    ride_type: input.rideType,
    condition: input.condition,
    total_weight_kg: totalWeightKg.toFixed(1),
    front_tire_mm: frontWidthMm.toFixed(0),
    rear_tire_mm: rearWidthMm.toFixed(0),
    rim_type: input.rimType,
    rim_width_mm: input.rimWidth,
    front_psi: result.frontPsi,
    rear_psi: result.rearPsi
  });

  displayResults({
    ...result,
    rideType: input.rideType,
    condition: input.condition,
    rimType: input.rimType,
    totalWeightKg: totalWeightKg.toFixed(1),
    riderWeightKg: riderWeightKg.toFixed(1),
    bikeWeightKg: bikeWeightKg.toFixed(1),
    frontWidthMm: frontWidthMm.toFixed(0),
    rearWidthMm: rearWidthMm.toFixed(0)
  });
}
