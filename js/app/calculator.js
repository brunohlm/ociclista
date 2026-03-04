function calculatePressure() {
  const state = window.AppState;

  const riderWeightRaw = parseFloat(document.getElementById('riderWeight').value);
  const bikeWeightRaw  = parseFloat(document.getElementById('bikeWeight').value);
  const riderWeightKg  = window.PressureCore.toKg(riderWeightRaw, state.weightUnit);
  const bikeWeightKg   = window.PressureCore.toKg(bikeWeightRaw, state.weightUnit);
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
    rimWidth: window.PressureCore.DEFAULT_RIM_WIDTH_MM
  };

  const result = window.PressureCore.computePressure(input);

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
