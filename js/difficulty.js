// ---------- Schwierigkeitsgrade ----------
// Jeder Grad besteht aus Faktoren, die PlayScene beim Levelstart ausliest.
//   lives         : Basis-Leben (Nerven)
//   bossHitsMult  : multipliziert die noetigen Boss-Treffer
//   bossSpeedMult : Boss feuert schneller & Projektile fliegen schneller (hoeher = haerter)
//   enemySpeedMult: Tempo der Patrouillen-Gegner
//   invulnMult    : Dauer der Unverwundbarkeit nach einem Treffer (hoeher = fairer)

const DIFFICULTY_PRESETS = {
  leicht: { key: 'leicht', label: 'LEICHT', lives: 5, bossHitsMult: 0.6, bossSpeedMult: 0.8, enemySpeedMult: 0.8, invulnMult: 1.4 },
  normal: { key: 'normal', label: 'NORMAL', lives: 3, bossHitsMult: 1.0, bossSpeedMult: 1.0, enemySpeedMult: 1.0, invulnMult: 1.0 },
  schwer: { key: 'schwer', label: 'SCHWER', lives: 2, bossHitsMult: 1.3, bossSpeedMult: 1.3, enemySpeedMult: 1.2, invulnMult: 0.8 },
  brutal: { key: 'brutal', label: 'BRUTAL', lives: 1, bossHitsMult: 1.6, bossSpeedMult: 1.5, enemySpeedMult: 1.4, invulnMult: 0.6 }
};

window.DIFFICULTY = {
  current: 'normal',
  custom: { key: 'custom', label: 'EIGEN', lives: 3, bossHitsMult: 1.0, bossSpeedMult: 1.0, enemySpeedMult: 1.0, invulnMult: 1.0 }
};

(function loadDifficulty() {
  try {
    const saved = localStorage.getItem('sar_difficulty');
    if (saved && (DIFFICULTY_PRESETS[saved] || saved === 'custom')) DIFFICULTY.current = saved;
    const savedCustom = localStorage.getItem('sar_custom_diff');
    if (savedCustom) Object.assign(DIFFICULTY.custom, JSON.parse(savedCustom));
  } catch (e) { /* kein localStorage */ }
})();

function getDifficulty() {
  if (DIFFICULTY.current === 'custom') return DIFFICULTY.custom;
  return DIFFICULTY_PRESETS[DIFFICULTY.current] || DIFFICULTY_PRESETS.normal;
}

function getDifficultyLabel() {
  return getDifficulty().label;
}

function setDifficulty(key) {
  DIFFICULTY.current = key;
  try { localStorage.setItem('sar_difficulty', key); } catch (e) { /* egal */ }
}

function saveCustomDifficulty() {
  try { localStorage.setItem('sar_custom_diff', JSON.stringify(DIFFICULTY.custom)); } catch (e) { /* egal */ }
}
