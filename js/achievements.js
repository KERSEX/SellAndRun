// ---------- Achievements (F14) ----------
const ACHIEVEMENTS = [
  { id: 'sauber', name: 'Sauberer Deal', desc: 'Ein Level ohne Schaden schaffen' },
  { id: 'alles', name: 'Vollverkäufer', desc: 'Alle Kunden & Verträge eines Levels holen' },
  { id: 'flott', name: 'Quartalsziel', desc: 'Ein Level unter 60 Sekunden schaffen' },
  { id: 'reich', name: 'Sechsstellig', desc: 'Insgesamt $10.000 Kohle machen' },
  { id: 'sparfuchs', name: 'Investor', desc: 'Ein Upgrade im Shop kaufen' },
  { id: 'stylo', name: 'Gut angezogen', desc: 'Einen neuen Anzug freischalten' },
  { id: 'rushfertig', name: 'Boss-Bezwinger', desc: 'Den Boss-Rush schaffen' },
  { id: 'brutalo', name: 'Überlebenskünstler', desc: 'Ein Level auf BRUTAL meistern' },
  { id: 'durch', name: 'Abgehoben', desc: 'Das ganze Spiel durchspielen' }
];

window.ACH_UNLOCKED = {};
(function loadAch() {
  try {
    const saved = localStorage.getItem('sar_achievements');
    if (saved) window.ACH_UNLOCKED = JSON.parse(saved) || {};
  } catch (e) { /* kein localStorage */ }
})();

// Gibt true zurück, wenn NEU freigeschaltet. Zeigt Toast, wenn eine Scene übergeben wird.
function unlockAchievement(scene, id) {
  if (ACH_UNLOCKED[id]) return false;
  ACH_UNLOCKED[id] = true;
  try { localStorage.setItem('sar_achievements', JSON.stringify(ACH_UNLOCKED)); } catch (e) { /* egal */ }
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (scene && ach) showAchievementToast(scene, ach);
  if (typeof beep === 'function') { beep(880, 0.1, 'square', 0.06); beep(1320, 0.12, 'square', 0.06, 90); }
  return true;
}

function showAchievementToast(scene, ach) {
  const cont = scene.add.container(500, -40).setScrollFactor(0).setDepth(200);
  const bg = scene.add.rectangle(0, 0, 360, 46, 0x0a0014, 0.95);
  bg.setStrokeStyle(2, 0xffe94a);
  const t1 = scene.add.text(0, -9, '🏆 ERFOLG FREIGESCHALTET', { fontSize: '11px', color: '#ffe94a', fontFamily: 'monospace' }).setOrigin(0.5);
  const t2 = scene.add.text(0, 8, ach.name, { fontSize: '13px', color: '#00fff2', fontFamily: 'monospace', fontStyle: 'bold' }).setOrigin(0.5);
  cont.add([bg, t1, t2]);
  scene.tweens.add({ targets: cont, y: 74, duration: 400, ease: 'Back.easeOut' });
  scene.tweens.add({ targets: cont, y: -40, delay: 2800, duration: 350, ease: 'Back.easeIn', onComplete: () => cont.destroy() });
}
