// ---------- Einstellungen (Grafik / Sound / Anzeige) ----------
window.SETTINGS = {
  graphics: 'hoch',  // 'hoch' = Parallax + Partikel, 'mittel' = ohne Partikel, 'niedrig' = statischer Hintergrund
  shake: true,       // Bildschirm-Wackeln & Blitze
  music: true,       // Hintergrundmusik
  volume: 1,         // 0 / 0.5 / 1 / 1.6
  scale: 100         // Anzeige-Zoom in Prozent (Slider 50-200)
};

(function loadSettings() {
  try {
    const saved = localStorage.getItem('sar_settings');
    if (!saved) return;
    const s = JSON.parse(saved);
    // Altbestand: 'particles' war ein reiner Schalter, daraus wird die Stufe
    if (s.graphics === undefined && s.particles !== undefined) s.graphics = s.particles ? 'hoch' : 'mittel';
    delete s.particles;
    Object.assign(SETTINGS, s);
  } catch (e) { /* kein localStorage */ }
})();

function saveSettings() {
  try { localStorage.setItem('sar_settings', JSON.stringify(SETTINGS)); } catch (e) { /* egal */ }
}

function graphicsLevel() { return (window.SETTINGS && SETTINGS.graphics) || 'hoch'; }
// Partikel-Bursts kosten kaum Bildrate, die Parallax-Ebenen dagegen deutlich —
// deshalb zwei getrennte Stufen statt eines einzigen Schalters.
function fxEnabled() { return graphicsLevel() === 'hoch'; }
function bgParallaxEnabled() { return graphicsLevel() !== 'niedrig'; }
function shakeEnabled() { return !window.SETTINGS || SETTINGS.shake; }
function getVolume() { return window.SETTINGS ? SETTINGS.volume : 1; }

function isFullscreen() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }

function applyDisplayScale() {
  const canvas = document.querySelector('canvas');
  if (!canvas) return;
  let s = SETTINGS.scale || 100;
  if (isFullscreen()) {
    // Im Vollbild so groß wie möglich, Seitenverhältnis bleibt erhalten (Rand einrechnen)
    const passt = Math.min((window.innerWidth - 10) / 1000, (window.innerHeight - 10) / 600);
    s = Math.max(50, Math.floor(passt * 100));
  }
  canvas.style.width = (1000 * s / 100) + 'px';
  canvas.style.height = (600 * s / 100) + 'px';
}

// Vollbild über das Dokument: so bleibt die Zentrierung aus style.css erhalten
// (der Canvas selbst im Vollbild würde von den Browser-Regeln links oben geklebt).
function toggleFullscreen() {
  try {
    if (isFullscreen()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) Promise.resolve(exit.call(document)).catch(() => { /* egal */ });
    } else {
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) Promise.resolve(req.call(el)).catch(() => { /* vom Browser abgelehnt */ });
    }
  } catch (e) { /* Vollbild nicht verfuegbar */ }
}

document.addEventListener('fullscreenchange', applyDisplayScale);
document.addEventListener('webkitfullscreenchange', applyDisplayScale);
window.addEventListener('resize', () => { if (isFullscreen()) applyDisplayScale(); });
window.addEventListener('load', () => setTimeout(applyDisplayScale, 60));
