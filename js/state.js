/* ============================================================
   O CICLISTA — State Management
   Estado global da aplicação.
   ============================================================ */

const DEFAULT_RIM_WIDTH_MM = 21;

const state = {
  rideType: null,       // 'road' | 'gravel' | 'cyclocross' | 'mtb'
  condition: null,      // 'dry' | 'wet'
  riderWeight: 0,
  bikeWeight: 0,
  weightUnit: 'kg',     // 'kg' | 'lb'
  frontTireWidth: 0,
  rearTireWidth: 0,
  frontCasing: null,    // 'thin' | 'standard' | 'reinforced'
  rearCasing: null,
  wheelDiameter: null,  // '700c' | '650b' | '650c' | '29' | '27.5' | '26'
  rimType: null,        // 'hookless_tubeless' | 'hooked_tubeless' | 'hooked_tubed'
  rimWidth: 0,
  currentStep: 1
};
