class PauseScene extends Phaser.Scene {
  constructor() { super('PauseScene'); }

  init(data) { this.levelIndex = data.levelIndex; this.bossRush = data.bossRush || null; }

  create() {
    // Halbtransparentes Overlay über der pausierten PlayScene
    this.add.rectangle(500, 300, 1000, 600, 0x05000a, 0.78);

    const title = this.add.text(500, 175, 'PAUSE', {
      fontSize: '46px', color: '#ff2fd0', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5);
    title.setShadow(0, 0, '#ff2fd0', 16, true, true);

    this.makeButton(500, 285, '[ WEITER ]', '#39ff88', () => this.resumeGame());
    this.makeButton(500, 340, '[ LEVEL NEU STARTEN ]', '#ffe94a', () => this.restartLevel());
    this.makeButton(500, 395, '[ HAUPTMENÜ ]', '#00fff2', () => this.toMenu());

    this.add.text(500, 465, 'ESC = Weiter   ·   Controller: START / OPTIONS', {
      fontSize: '12px', color: '#8a8fa0', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
  }

  makeButton(x, y, label, color, cb) {
    const btn = this.add.text(x, y, label, {
      fontSize: '18px', color, fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.setShadow(0, 0, color, 6, true, true);
    btn.on('pointerover', () => btn.setColor('#000000').setBackgroundColor(color));
    btn.on('pointerout', () => btn.setColor(color).setBackgroundColor(null));
    btn.on('pointerdown', () => { beep(500, 0.08, 'square', 0.06); cb(); });
    return btn;
  }

  // SceneManager statt ScenePlugin (resume/pause über ScenePlugin greifen in 3.90 hier nicht)
  resumeGame() {
    this.scene.manager.resume('PlayScene');
    this.scene.manager.stop('PauseScene');
  }

  restartLevel() {
    this.scene.manager.stop('PauseScene');
    this.scene.manager.stop('PlayScene');
    this.scene.manager.start('PlayScene', { levelIndex: this.levelIndex, bossRush: this.bossRush });
  }

  toMenu() {
    this.scene.manager.stop('PauseScene');
    this.scene.manager.stop('PlayScene');
    this.scene.manager.start('MenuScene');
  }
}
