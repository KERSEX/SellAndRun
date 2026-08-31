window.CHEATS = { invincible: false, extraLives: 0 };

(function () {
  const SEQUENCE = 'KAOS';
  let buffer = '';

  const menuEl = document.getElementById('cheatMenu');
  const listEl = document.getElementById('cheatLevelList');
  const closeBtn = document.getElementById('cheatClose');
  const invincibleBox = document.getElementById('cheatInvincible');
  const livesBtnsEl = document.getElementById('cheatLivesButtons');
  const diffBtn = document.getElementById('cheatDiffBtn');

  diffBtn.addEventListener('click', () => {
    window.openDiffMenu(() => { diffBtn.textContent = getDifficultyLabel(); });
  });

  function buildLevelButtons() {
    listEl.innerHTML = '';
    LEVELS.forEach((level, idx) => {
      const btn = document.createElement('button');
      btn.textContent = `LEVEL ${level.id}: ${level.name}`;
      btn.addEventListener('click', () => goToLevel(idx));
      listEl.appendChild(btn);
    });
  }

  function buildLivesButtons() {
    livesBtnsEl.innerHTML = '';
    for (let n = 0; n <= 4; n++) {
      const btn = document.createElement('button');
      btn.textContent = '+' + n;
      if (n === CHEATS.extraLives) btn.classList.add('active');
      btn.addEventListener('click', () => {
        CHEATS.extraLives = n;
        livesBtnsEl.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      livesBtnsEl.appendChild(btn);
    }
  }

  invincibleBox.addEventListener('change', () => {
    CHEATS.invincible = invincibleBox.checked;
  });

  function goToLevel(levelIndex) {
    if (!window.game) return;
    game.scene.getScenes(true).forEach(s => game.scene.stop(s.scene.key));
    game.scene.start('PlayScene', { levelIndex });
    hideMenu();
  }

  function showMenu() {
    buildLevelButtons();
    buildLivesButtons();
    invincibleBox.checked = CHEATS.invincible;
    diffBtn.textContent = getDifficultyLabel();
    menuEl.classList.remove('hidden');
  }

  function hideMenu() {
    menuEl.classList.add('hidden');
  }

  window.addEventListener('keydown', (e) => {
    if (!menuEl.classList.contains('hidden')) {
      if (e.key === 'Escape') { window.__overlayEscAt = performance.now(); hideMenu(); }
      return;
    }
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key.toUpperCase()).slice(-SEQUENCE.length);
    if (buffer === SEQUENCE) {
      buffer = '';
      showMenu();
    }
  });

  closeBtn.addEventListener('click', hideMenu);
})();
