class LevelCompleteScene extends Phaser.Scene {
  constructor() { super('LevelCompleteScene'); }

  init(data) { this.levelIndex = data.levelIndex; }

  create() {
    const level = LEVELS[this.levelIndex];
    this.cameras.main.setBackgroundColor('#0a0014');
    this.stars = addScreenBackdrop(this, 0x39ff88);
    if (typeof startMusic === 'function') startMusic('menu');
    fanfare();

    this.add.text(500, 220, `LEVEL ${level.id} GESCHAFFT!`, {
      fontSize: '28px', color: '#39ff88', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setShadow(0, 0, '#39ff88', 12, true, true);

    this.add.text(500, 296, `Kohle: $${GameState.money}`, {
      fontSize: '17px', color: '#ffe94a', fontFamily: 'monospace'
    }).setOrigin(0.5);

    const best = (window.STATS && STATS.bestTimes && STATS.bestTimes[level.id]);
    if (best) {
      this.add.text(500, 330, `Bestzeit: ${best}s`, {
        fontSize: '13px', color: '#00fff2', fontFamily: 'monospace'
      }).setOrigin(0.5);
    }

    const btn = this.add.text(500, 410, '[ WEITER ]', {
      fontSize: '20px', color: '#ffe94a', fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const go = () => {
      beep(600, 0.1, 'square', 0.06);
      this.scene.start('ShopScene', { levelIndex: this.levelIndex });
    };
    btn.on('pointerover', () => btn.setColor('#000000').setBackgroundColor('#ffe94a'));
    btn.on('pointerout', () => btn.setColor('#ffe94a').setBackgroundColor(null));
    btn.on('pointerdown', go);
    this.input.keyboard.once('keydown-SPACE', go);
  }

  update() {
    if (this.stars) this.stars.tilePositionX += 0.15;
  }
}
