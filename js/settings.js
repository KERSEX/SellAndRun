// ---------- Einstellungen (Grafik / Sound / Anzeige) ----------
window.SETTINGS = {
  particles: true,   // Partikel-Effekte
  shake: true,       // Bildschirm-Wackeln & Blitze
  music: true,       // Hintergrundmusik
  volume: 1,         // 0 / 0.5 / 1 / 1.6
  scale: 100         // Anzeige-Zoom in Prozent: 75 / 100 / 125
};

(function loadSettings() {
  try {
    const saved = localStorage.getItem('sar_settings');
    if (saved) Object.assign(SETTINGS, JSON.parse(saved));
  } catch (e) { /* kein localStorage */ }
})();

function saveSettings() {
  try { localStorage.setItem('sar_settings', JSON.stringify(SETTINGS)); } catch (e) { /* egal */ }
}

function fxEnabled() { return !window.SETTINGS || SETTINGS.particles; }
function shakeEnabled() { return !window.SETTINGS || SETTINGS.shake; }
function getVolume() { return window.SETTINGS ? SETTINGS.volume : 1; }

function applyDisplayScale() {
  const canvas = document.querySelector('canvas');
  if (!canvas) return;
  const s = SETTINGS.scale || 100;
  canvas.style.width = (1000 * s / 100) + 'px';
  canvas.style.height = (600 * s / 100) + 'px';
}

function toggleFullscreen() {
  try {
    if (window.game && game.scale) game.scale.toggleFullscreen();
  } catch (e) { /* Vollbild nicht verfuegbar */ }
}

window.addEventListener('load', () => setTimeout(applyDisplayScale, 60));
