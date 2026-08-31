class LevelIntroScene extends Phaser.Scene {
  constructor() { super('LevelIntroScene'); }

  init(data) { this.levelIndex = data.levelIndex; }

  create() {
    const level = LEVELS[this.levelIndex];
    this.cameras.main.setBackgroundColor('#0a0014');
    this.stars = addScreenBackdrop(this, level.bgBottom);

    this.add.text(500, 180, `LEVEL ${level.id}: ${level.name}`, {
      fontSize: '30px', color: '#ffe94a', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setShadow(0, 0, '#ffe94a', 12, true, true);

    this.add.text(500, 270, level.intro, {
      fontSize: '15px', color: '#00fff2', fontFamily: 'monospace', align: 'center', lineSpacing: 8
    }).setOrigin(0.5);

    let goalLines;
    if (level.isGunfight) {
      goalLines = [`GUNFIGHT! Besiege: ${level.boss.name}`];
    } else {
      goalLines = [`Ziel: ${level.requiredSales} Verkäufe/Verträge einsammeln,`];
      goalLines.push(level.hasBoss ? `dann Endgegner besiegen: ${level.boss.name}` : 'dann harte Parkour-Passage meistern.');
    }
    this.add.text(500, 360, goalLines.join('\n'), {
      fontSize: '14px', color: '#ff2fd0', fontFamily: 'monospace', align: 'center', lineSpacing: 6
    }).setOrigin(0.5);

    const btn = this.add.text(500, 470, '[ LOS! ]', {
      fontSize: '20px', color: '#39ff88', fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const go = () => {
      beep(600, 0.1, 'square', 0.06);
      this.scene.start('PlayScene', { levelIndex: this.levelIndex });
    };
    btn.on('pointerover', () => btn.setColor('#000000').setBackgroundColor('#39ff88'));
    btn.on('pointerout', () => btn.setColor('#39ff88').setBackgroundColor(null));
    btn.on('pointerdown', go);
    this.input.keyboard.once('keydown-SPACE', go);
  }

  update() {
    if (this.stars) this.stars.tilePositionX += 0.15;
  }
}
