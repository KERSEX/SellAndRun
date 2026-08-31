// ---------- Skins-Menü (F15) ----------
(function () {
  const menu = document.getElementById('skinsMenu');
  const list = document.getElementById('skinsList');
  const walletEl = document.getElementById('skinsWallet');
  const closeBtn = document.getElementById('skinsClose');
  let onCloseCallback = null;

  function toCss(hex) { return '#' + hex.toString(16).padStart(6, '0'); }

  function build() {
    walletEl.textContent = 'Konto: $' + getWallet();
    list.innerHTML = '';
    SKINS.forEach(skin => {
      const row = document.createElement('div');
      row.className = 'skinRow';

      const sw = document.createElement('div');
      sw.className = 'skinSwatch';
      sw.style.background = toCss(skin.suit);
      const tie = document.createElement('div');
      tie.className = 'skinTie';
      tie.style.background = toCss(skin.tie);
      sw.appendChild(tie);

      const name = document.createElement('span');
      name.className = 'skinName';
      name.textContent = skin.name;

      const btn = document.createElement('button');
      if (SKIN_ACTIVE === skin.id) {
        btn.textContent = 'AKTIV'; btn.className = 'active';
      } else if (ownsSkin(skin.id)) {
        btn.textContent = 'ANLEGEN';
        btn.addEventListener('click', () => { setActiveSkin(skin.id); beep(700, 0.08, 'square', 0.05); build(); notify(); });
      } else if (getWallet() >= skin.preis) {
        btn.textContent = 'KAUFEN $' + skin.preis;
        btn.addEventListener('click', () => {
          if (buySkin(skin.id)) {
            beep(1000, 0.1, 'square', 0.07); beep(1400, 0.1, 'square', 0.06, 70);
            setActiveSkin(skin.id);
            if (typeof unlockAchievement === 'function') unlockAchievement(null, 'stylo');
            build(); notify();
          }
        });
      } else {
        btn.textContent = '$' + skin.preis;
        btn.disabled = true; btn.style.opacity = 0.5;
      }

      row.appendChild(sw); row.appendChild(name); row.appendChild(btn);
      list.appendChild(row);
    });
  }

  function notify() { if (onCloseCallback) onCloseCallback(); }

  window.openSkinsMenu = function (cb) {
    onCloseCallback = cb || null;
    build();
    menu.classList.remove('hidden');
  };

  function close() {
    menu.classList.add('hidden');
    if (onCloseCallback) { const c = onCloseCallback; onCloseCallback = null; c(); }
  }
  closeBtn.addEventListener('click', close);
  window.addEventListener('keydown', e => {
    if (!menu.classList.contains('hidden') && e.key === 'Escape') { window.__overlayEscAt = performance.now(); close(); }
  });
})();
