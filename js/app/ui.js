function selectRideType(btn) {
  const state = window.AppState;
  document.querySelectorAll('#rideTypeGroup .toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.rideType = btn.dataset.value;
  document.getElementById('conditionGroup').style.display = 'block';
  updatePlaceholders();
  trackEvent('select_ride_type', { ride_type: state.rideType });
}

function selectCondition(btn) {
  const state = window.AppState;
  document.querySelectorAll('#conditionToggle .toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.condition = btn.dataset.value;
  setTimeout(() => goToStep(2), 300);
}

function selectRimType(btn) {
  const state = window.AppState;
  document.querySelectorAll('#rimTypeGroup .toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.rimType = btn.dataset.value;
  validateStep4();
}

function goToStep(step) {
  const state = window.AppState;
  state.currentStep = step;
  const el = document.getElementById('step' + step);
  if (el) {
    el.classList.remove('hidden');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  updateStepIndicator();
}

function updateStepIndicator() {
  const state = window.AppState;
  document.querySelectorAll('.step-dot').forEach(dot => {
    const s = parseInt(dot.dataset.step);
    dot.classList.remove('active', 'done');
    if (s < state.currentStep) dot.classList.add('done');
    else if (s === state.currentStep) dot.classList.add('active');
  });
  document.querySelectorAll('.step-line').forEach(line => {
    const s = parseInt(line.dataset.step);
    line.classList.toggle('done', s < state.currentStep);
  });
}

function updatePlaceholders() {
  const state = window.AppState;
  const fInput = document.getElementById('frontTireWidth');
  const rInput = document.getElementById('rearTireWidth');

  const defaults = {
    road:       { f: '25', r: '25' },
    gravel:     { f: '40', r: '40' },
    cyclocross: { f: '33', r: '33' },
    mtb:        { f: '2.4', r: '2.4' }
  };

  const d = defaults[state.rideType] || defaults.road;
  fInput.placeholder = d.f;
  rInput.placeholder = d.r;

  if (state.rideType === 'mtb') {
    fInput.min = '1.5'; fInput.max = '5.0'; fInput.step = '0.05';
    rInput.min = '1.5'; rInput.max = '5.0'; rInput.step = '0.05';
    document.getElementById('frontWidthUnit').textContent = '(pol)';
    document.getElementById('rearWidthUnit').textContent = '(pol)';
  } else {
    fInput.min = '20'; fInput.max = '70'; fInput.step = '1';
    rInput.min = '20'; rInput.max = '70'; rInput.step = '1';
    document.getElementById('frontWidthUnit').textContent = '(mm)';
    document.getElementById('rearWidthUnit').textContent = '(mm)';
  }
}

function setWeightUnit(unit) {
  const state = window.AppState;
  const btns = document.querySelectorAll('#weightUnitToggle button');
  btns.forEach(b => b.classList.remove('active'));
  btns.forEach(b => { if (b.textContent.trim() === unit) b.classList.add('active'); });
  state.weightUnit = unit;
  document.getElementById('riderWeightUnit').textContent = `(${unit})`;
  document.getElementById('bikeWeightUnit').textContent = `(${unit})`;
}

function validateStep2() {
  const rw = parseFloat(document.getElementById('riderWeight').value);
  const bw = parseFloat(document.getElementById('bikeWeight').value);
  document.getElementById('step2Btn').disabled = !(rw > 0 && bw > 0);
}

function validateStep3() {
  const fw = document.getElementById('frontTireWidth').value;
  const rw = document.getElementById('rearTireWidth').value;
  const fc = document.getElementById('frontCasing').value;
  const rc = document.getElementById('rearCasing').value;
  document.getElementById('step3Btn').disabled = !(fw && rw && fc && rc);
}

function validateStep4() {
  const state = window.AppState;
  const wd = document.getElementById('wheelDiameter').value;
  const riw = window.PressureCore.DEFAULT_RIM_WIDTH_MM;
  document.getElementById('step4Btn').disabled = !(wd && state.rimType && riw);
}

function resetCalculator() {
  const state = window.AppState;
  for (let i = 2; i <= 5; i++) {
    document.getElementById('step' + i).classList.add('hidden');
  }
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('conditionGroup').style.display = 'none';

  ['riderWeight', 'bikeWeight', 'frontTireWidth', 'rearTireWidth',
   'frontCasing', 'rearCasing', 'wheelDiameter', 'rimWidth'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  state.rideType = null;
  state.condition = null;
  state.rimType = null;
  state.currentStep = 1;

  updateStepIndicator();
  document.getElementById('step1').scrollIntoView({ behavior: 'smooth', block: 'center' });
  trackEvent('reset_calculator');
}

updateStepIndicator();
