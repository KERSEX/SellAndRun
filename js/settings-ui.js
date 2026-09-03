// ---------- Einstellungs-Menü (HTML-Overlay) ----------
(function () {
  const menuEl = document.getElementById('settingsMenu');
  const closeBtn = document.getElementById('settingsClose');

  const graphicsEl = document.getElementById('setGraphics');
  const graphicsHintEl = document.getElementById('setGraphicsHint');
  const shakeEl = document.getElementById('setShake');
  const fullscreenBtn = document.getElementById('setFullscreen');
  const musicEl = document.getElementById('setMusic');
  const volumeEl = document.getElementById('setVolume');
  const scaleSlider = document.getElementById('setScaleSlider');
  const scaleVal = document.getElementById('setValScale');

  let onCloseCallback = null;

  // Baut eine Button-Gruppe. options: [{label, value}], read()/write(value)
  function buildGroup(container, options, read, write) {
    container.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        write(opt.value);
        saveSettings();
        applyDisplayScale();
        markActive(container, read());
      });
      btn.dataset.value = String(opt.value);
      container.appendChild(btn);
    });
    markActive(container, read());
  }

  function markActive(container, value) {
    container.querySelectorAll('button').forEach(b => {
      b.classList.toggle('active', b.dataset.value === String(value));
    });
  }

  const onOff = [{ label: 'AN', value: true }, { label: 'AUS', value: false }];

  const GRAFIK_HINWEIS = {
    hoch: 'Partikel-Effekte und bewegte Hintergrund-Ebenen',
    mittel: 'Ohne Partikel-Effekte, Hintergrund bleibt bewegt',
    niedrig: 'Ohne Partikel, einfarbiger Hintergrund statt zwei bewegter Ebenen'
  };

  function updateGraphicsHint() {
    graphicsHintEl.textContent = GRAFIK_HINWEIS[graphicsLevel()] || '';
  }

  function updateFullscreenBtn() {
    fullscreenBtn.textContent = isFullscreen() ? 'AUSSCHALTEN' : 'EINSCHALTEN';
    fullscreenBtn.classList.toggle('active', isFullscreen());
  }

  function buildAll() {
    buildGroup(graphicsEl, [
      { label: 'HOCH', value: 'hoch' }, { label: 'MITTEL', value: 'mittel' }, { label: 'NIEDRIG', value: 'niedrig' }
    ], () => SETTINGS.graphics, v => {
      SETTINGS.graphics = v;
      if (typeof refreshGraphicsLevel === 'function') refreshGraphicsLevel();
      updateGraphicsHint();
    });
    buildGroup(shakeEl, onOff, () => SETTINGS.shake, v => SETTINGS.shake = v);
    buildGroup(musicEl, onOff, () => SETTINGS.music, v => { SETTINGS.music = v; if (typeof updateMusicVolume === 'function') updateMusicVolume(); });
    buildGroup(volumeEl, [
      { label: 'AUS', value: 0 }, { label: 'LEISE', value: 0.5 },
      { label: 'NORMAL', value: 1 }, { label: 'LAUT', value: 1.6 }
    ], () => SETTINGS.volume, v => { SETTINGS.volume = v; if (typeof updateMusicVolume === 'function') updateMusicVolume(); if (v > 0) beep(700, 0.06, 'square', 0.05); });
    scaleSlider.value = SETTINGS.scale;
    scaleVal.textContent = SETTINGS.scale + '%';
    updateGraphicsHint();
    updateFullscreenBtn();
  }

  fullscreenBtn.addEventListener('click', () => {
    toggleFullscreen();
    beep(700, 0.06, 'square', 0.05);
  });
  document.addEventListener('fullscreenchange', updateFullscreenBtn);
  document.addEventListener('webkitfullscreenchange', updateFullscreenBtn);

  scaleSlider.addEventListener('input', () => {
    SETTINGS.scale = parseInt(scaleSlider.value, 10);
    scaleVal.textContent = SETTINGS.scale + '%';
    applyDisplayScale();
    saveSettings();
  });

  window.openSettingsMenu = function (onClose) {
    onCloseCallback = onClose || null;
    buildAll();
    menuEl.classList.remove('hidden');
  };

  function closeSettings() {
    menuEl.classList.add('hidden');
    if (onCloseCallback) { const cb = onCloseCallback; onCloseCallback = null; cb(); }
  }

  closeBtn.addEventListener('click', closeSettings);
  window.addEventListener('keydown', (e) => {
    if (!menuEl.classList.contains('hidden') && e.key === 'Escape') { window.__overlayEscAt = performance.now(); closeSettings(); }
  });
})();
