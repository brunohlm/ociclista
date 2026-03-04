const DEFAULT_RIM_WIDTH_MM = 21;

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

function toKg(value, unit) {
  return unit === 'lb' ? value * 0.453592 : value;
}

function psiToBar(psi) {
  return psi * 0.0689476;
}

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

window.PressureCore = {
  DEFAULT_RIM_WIDTH_MM,
  toKg,
  psiToBar,
  computePressure
};
