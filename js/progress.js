// ---------- Fortschritt: höchstes freigeschaltetes Level ----------
// PROGRESS.unlocked = höchster erreichter levelIndex (0 = nur Level 1 verfügbar)
window.PROGRESS = { unlocked: 0 };

(function loadProgress() {
  try {
    const saved = parseInt(localStorage.getItem('sar_progress') || '0', 10);
    if (!isNaN(saved) && saved > 0) PROGRESS.unlocked = saved;
  } catch (e) { /* kein localStorage */ }
})();

function saveProgress() {
  try { localStorage.setItem('sar_progress', String(PROGRESS.unlocked)); } catch (e) { /* egal */ }
}

// Schaltet Level idx frei (nur nach oben, nie über das letzte Level hinaus)
function unlockLevel(idx) {
  if (idx > PROGRESS.unlocked && idx < LEVELS.length) {
    PROGRESS.unlocked = idx;
    saveProgress();
  }
}
