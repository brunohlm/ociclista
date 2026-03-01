/* ============================================================
   O CICLISTA — Google Analytics 4 Events
   
   Custom events tracked:
   - select_ride_type  → user picks road/gravel/cx/mtb
   - calculate_pressure → full calculation with all params
   - reset_calculator   → user starts over
   
   Usage: trackEvent('event_name', { key: value })
   ============================================================ */

function trackEvent(eventName, params = {}) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
}
