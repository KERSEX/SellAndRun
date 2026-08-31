window.GameState = { levelIndex: 0, money: 0, lives: 3, bestMoney: 0, upgrades: {} };
try { GameState.bestMoney = parseInt(localStorage.getItem('sar_best') || '0', 10) || 0; } catch (e) { /* kein localStorage */ }

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
