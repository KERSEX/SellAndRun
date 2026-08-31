// ---------- Schwierigkeits-Auswahl (HTML-Overlay) ----------
(function () {
  const menuEl = document.getElementById('diffMenu');
  const presetListEl = document.getElementById('diffPresetList');
  const closeBtn = document.getElementById('diffClose');

  const sliders = {
    lives: { el: document.getElementById('diffLives'), val: document.getElementById('diffValLives'), field: 'lives', fmt: v => v },
    bossHits: { el: document.getElementById('diffBossHits'), val: document.getElementById('diffValBossHits'), field: 'bossHitsMult', fmt: v => v + '%' },
    bossSpeed: { el: document.getElementById('diffBossSpeed'), val: document.getElementById('diffValBossSpeed'), field: 'bossSpeedMult', fmt: v => v + '%' },
    enemy: { el: document.getElementById('diffEnemy'), val: document.getElementById('diffValEnemy'), field: 'enemySpeedMult', fmt: v => v + '%' },
    invuln: { el: document.getElementById('diffInvuln'), val: document.getElementById('diffValInvuln'), field: 'invulnMult', fmt: v => v + '%' }
  };

  let onCloseCallback = null;

  function buildPresetButtons() {
    presetListEl.innerHTML = '';
    Object.values(DIFFICULTY_PRESETS).forEach(preset => {
      const btn = document.createElement('button');
      btn.textContent = preset.label;
      btn.dataset.key = preset.key;
      btn.addEventListener('click', () => {
        setDifficulty(preset.key);
        refreshActive();
        syncSlidersFrom(preset);
      });
      presetListEl.appendChild(btn);
    });
  }

  function refreshActive() {
    presetListEl.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.dataset.key === DIFFICULTY.current);
    });
  }

  // Setzt die Regler auf die Werte eines Grads (nur Anzeige, ohne current zu aendern)
  function syncSlidersFrom(cfg) {
    sliders.lives.el.value = cfg.lives;
    sliders.bossHits.el.value = Math.round(cfg.bossHitsMult * 100);
    sliders.bossSpeed.el.value = Math.round(cfg.bossSpeedMult * 100);
    sliders.enemy.el.value = Math.round(cfg.enemySpeedMult * 100);
    sliders.invuln.el.value = Math.round(cfg.invulnMult * 100);
    updateSliderLabels();
  }

  function updateSliderLabels() {
    Object.values(sliders).forEach(s => { s.val.textContent = s.fmt(s.el.value); });
  }

  // Sobald der Nutzer einen Regler bewegt -> Modus "custom"
  Object.values(sliders).forEach(s => {
    s.el.addEventListener('input', () => {
      DIFFICULTY.custom.lives = parseInt(sliders.lives.el.value, 10);
      DIFFICULTY.custom.bossHitsMult = parseInt(sliders.bossHits.el.value, 10) / 100;
      DIFFICULTY.custom.bossSpeedMult = parseInt(sliders.bossSpeed.el.value, 10) / 100;
      DIFFICULTY.custom.enemySpeedMult = parseInt(sliders.enemy.el.value, 10) / 100;
      DIFFICULTY.custom.invulnMult = parseInt(sliders.invuln.el.value, 10) / 100;
      setDifficulty('custom');
      saveCustomDifficulty();
      refreshActive();
      updateSliderLabels();
    });
  });

  window.openDiffMenu = function (onClose) {
    onCloseCallback = onClose || null;
    buildPresetButtons();
    refreshActive();
    syncSlidersFrom(getDifficulty());
    menuEl.classList.remove('hidden');
  };

  function closeDiffMenu() {
    menuEl.classList.add('hidden');
    if (onCloseCallback) { const cb = onCloseCallback; onCloseCallback = null; cb(); }
  }

  closeBtn.addEventListener('click', closeDiffMenu);
  window.addEventListener('keydown', (e) => {
    if (!menuEl.classList.contains('hidden') && e.key === 'Escape') { window.__overlayEscAt = performance.now(); closeDiffMenu(); }
  });
})();
