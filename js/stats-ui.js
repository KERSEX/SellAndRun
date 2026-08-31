// ---------- Statistik-Menü (F13/F14) ----------
(function () {
  const menu = document.getElementById('statsMenu');
  const list = document.getElementById('statsList');
  const achList = document.getElementById('achList');
  const closeBtn = document.getElementById('statsClose');
  const resetBtn = document.getElementById('statsReset');

  function fmtTime(s) {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  }

  function build() {
    list.innerHTML = '';
    const rows = [
      ['Verkäufe', STATS.sales || 0],
      ['Münzen', STATS.coins || 0],
      ['Sprünge', STATS.jumps || 0],
      ['Bosse besiegt', STATS.bossKills || 0],
      ['Tode', STATS.deaths || 0],
      ['Gesamt-Kohle', '$' + (STATS.totalMoney || 0)],
      ['Spielzeit', fmtTime(STATS.playtimeS || 0)],
      ['Konto', '$' + ((typeof getWallet === 'function') ? getWallet() : 0)]
    ];
    rows.forEach(([k, v]) => {
      const row = document.createElement('div');
      row.className = 'statRow';
      row.innerHTML = `<span>${k}</span><span>${v}</span>`;
      list.appendChild(row);
    });

    achList.innerHTML = '';
    ACHIEVEMENTS.forEach(a => {
      const on = !!ACH_UNLOCKED[a.id];
      const row = document.createElement('div');
      row.className = 'achRow' + (on ? ' achOn' : '');
      row.innerHTML = `<span>${on ? '✓' : '✗'} ${a.name}</span><span>${a.desc}</span>`;
      achList.appendChild(row);
    });
  }

  let confirmReset = false;
  resetBtn.addEventListener('click', () => {
    if (!confirmReset) { confirmReset = true; resetBtn.textContent = 'WIRKLICH? NOCHMAL'; return; }
    if (typeof resetStats === 'function') resetStats();
    confirmReset = false; resetBtn.textContent = 'STATS ZURÜCKSETZEN';
    build();
  });

  // Kompletter Reset: alle Spielstände löschen (Fortschritt, Stats, Erfolge, Skins, Konto, Settings, Diff, Best)
  const wipeBtn = document.getElementById('statsWipe');
  let confirmWipe = false;
  wipeBtn.addEventListener('click', () => {
    if (!confirmWipe) { confirmWipe = true; wipeBtn.textContent = 'WIRKLICH ALLES?'; return; }
    try {
      Object.keys(localStorage).filter(k => k.indexOf('sar_') === 0).forEach(k => localStorage.removeItem(k));
    } catch (e) { /* egal */ }
    location.reload();
  });

  window.openStatsMenu = function () {
    confirmReset = false; resetBtn.textContent = 'STATS ZURÜCKSETZEN';
    confirmWipe = false; wipeBtn.textContent = 'ALLES LÖSCHEN';
    build();
    menu.classList.remove('hidden');
  };

  function close() { menu.classList.add('hidden'); }
  closeBtn.addEventListener('click', close);
  window.addEventListener('keydown', e => {
    if (!menu.classList.contains('hidden') && e.key === 'Escape') { window.__overlayEscAt = performance.now(); close(); }
  });
})();
