// ---------- Boss-Rush (F11) ----------
// Level-Indizes mit Boss, in Reihenfolge (Büro, Messehalle, Flughafen, Frachtraum, Steuerparadies)
const BOSS_RUSH_SEQ = [0, 2, 3, 4, 5];

window.BOSS_RUSH_BEST = 0;
(function loadRushBest() {
  try { window.BOSS_RUSH_BEST = parseFloat(localStorage.getItem('sar_bossrush_best') || '0') || 0; } catch (e) { /* egal */ }
})();

function saveRushBest(seconds) {
  if (BOSS_RUSH_BEST === 0 || seconds < BOSS_RUSH_BEST) {
    window.BOSS_RUSH_BEST = Math.round(seconds * 10) / 10;
    try { localStorage.setItem('sar_bossrush_best', String(BOSS_RUSH_BEST)); } catch (e) { /* egal */ }
    return true;
  }
  return false;
}

function startBossRush(scene) {
  scene.scene.manager.getScenes(true).forEach(s => scene.scene.manager.stop(s.scene.key));
  scene.scene.manager.start('PlayScene', {
    levelIndex: BOSS_RUSH_SEQ[0],
    bossRush: { step: 0, lives: 0, maxLives: 0, startTime: performance.now() }
  });
}
