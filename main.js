window.GameState = { levelIndex: 0, money: 0, lives: 3, bestMoney: 0, upgrades: {} };
try { GameState.bestMoney = parseInt(localStorage.getItem('sar_best') || '0', 10) || 0; } catch (e) { /* kein localStorage */ }

// ---------- Upgrade-Stufen (Shop, F5) ----------
// Jedes Shop-Item ist mehrfach kaufbar. GameState.upgrades[id] = Stufe 0..UPGRADE_MAX_LEVEL.
window.UPGRADE_MAX_LEVEL = 3;

function upgradeLevel(id) {
  const v = (GameState.upgrades || {})[id];
  if (v === true) return 1;              // Altbestand: boolesches Upgrade = Stufe 1
  const n = parseInt(v, 10);
  if (isNaN(n) || n < 0) return 0;
  return Math.min(n, UPGRADE_MAX_LEVEL);
}

function saveBest() {
  GameState.bestMoney = Math.max(GameState.bestMoney, GameState.money);
  try { localStorage.setItem('sar_best', GameState.bestMoney); } catch (e) { /* kein localStorage */ }
}

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 600,
  backgroundColor: '#0a0014',
  input: { gamepad: true },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 900 }, debug: false }
  },
  scene: [MenuScene, TutorialScene, LevelIntroScene, PlayScene, ShopScene, PauseScene, LevelCompleteScene, WinScene, GameOverScene]
};

window.game = new Phaser.Game(config);
