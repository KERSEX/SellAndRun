// ---------- Statistiken (F13) ----------
window.STATS = { deaths: 0, jumps: 0, sales: 0, coins: 0, bossKills: 0, playtimeS: 0, bestTimes: {} };

(function loadStats() {
  try {
    const saved = localStorage.getItem('sar_stats');
    if (saved) Object.assign(STATS, JSON.parse(saved));
    if (!STATS.bestTimes) STATS.bestTimes = {};
  } catch (e) { /* kein localStorage */ }
})();

function addStat(key, n) { STATS[key] = (STATS[key] || 0) + (n === undefined ? 1 : n); }

function recordBestTime(levelId, seconds) {
  const cur = STATS.bestTimes[levelId];
  if (cur === undefined || seconds < cur) { STATS.bestTimes[levelId] = Math.round(seconds * 10) / 10; return true; }
  return false;
}

function saveStats() {
  try { localStorage.setItem('sar_stats', JSON.stringify(STATS)); } catch (e) { /* egal */ }
}

function resetStats() {
  window.STATS = { deaths: 0, jumps: 0, sales: 0, coins: 0, bossKills: 0, playtimeS: 0, bestTimes: {} };
  saveStats();
}
