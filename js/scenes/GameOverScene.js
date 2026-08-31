class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) { this.levelIndex = data.levelIndex; }

  create() {
    saveBest();
    const level = (this.levelIndex === 'tutorial') ? TUTORIAL_LEVEL : LEVELS[this.levelIndex];
    this.cameras.main.setBackgroundColor('#0a0014');
    this.stars = addScreenBackdrop(this);
    const vignette = this.add.rectangle(500, 300, 1000, 600, 0xff2040, 0.08).setDepth(-8);
    this.tweens.add({ targets: vignette, alpha: { from: 0.05, to: 0.16 }, yoyo: true, repeat: -1, duration: 1100 });
    sadTune();

    this.add.text(500, 200, 'FEIERABEND!', {
      fontSize: '34px', color: '#ff2fd0', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setShadow(0, 0, '#ff2fd0', 16, true, true);

    const wo = level.isTutorial ? 'Training' : `Level ${level.id} (${level.name})`;
    this.add.text(500, 280,
      `Erreicht: ${wo}\nKohle: $${GameState.money}  —  Bestleistung: $${GameState.bestMoney}`,
      { fontSize: '15px', color: '#00fff2', fontFamily: 'monospace', align: 'center', lineSpacing: 6 }
    ).setOrigin(0.5);

    const btn = this.add.text(500, 380, '[ NOCHMAL VERSUCHEN ]', {
      fontSize: '18px', color: '#ffe94a', fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const go = () => { beep(500, 0.08, 'square', 0.06); this.scene.start('MenuScene'); };
    btn.on('pointerover', () => btn.setColor('#000000').setBackgroundColor('#ffe94a'));
    btn.on('pointerout', () => btn.setColor('#ffe94a').setBackgroundColor(null));
    btn.on('pointerdown', go);
    this.input.keyboard.once('keydown-SPACE', go);
  }
}
