class WinScene extends Phaser.Scene {
  constructor() { super('WinScene'); }

  init(data) { this.rushTime = data && data.rushTime; }

  create() {
    saveBest();
    if (typeof stopMusic === 'function') stopMusic();
    this.cameras.main.setBackgroundColor('#0a0014');
    ensureParticleTextures(this);
    this.stars = addScreenBackdrop(this, 0xffe94a);
    if (fxEnabled()) {
      this.add.particles(0, 0, 'fx_square', {
        x: { min: 0, max: 1000 }, y: -10, lifespan: 4200,
        speedY: { min: 60, max: 150 }, speedX: { min: -30, max: 30 },
        rotate: { start: 0, end: 360 }, scale: { min: 0.6, max: 1.4 },
        tint: [0xffe94a, 0xff2fd0, 0x00fff2, 0x39ff88],
        quantity: 2, frequency: 90
      });
    }
    fanfare();

    if (this.rushTime !== undefined) {
      const isBest = (typeof saveRushBest === 'function') && saveRushBest(this.rushTime);
      this.add.text(500, 190, 'BOSS-RUSH GESCHAFFT!', {
        fontSize: '28px', color: '#ff2fd0', fontFamily: 'monospace', fontStyle: 'bold'
      }).setOrigin(0.5).setShadow(0, 0, '#ff2fd0', 16, true, true);
      this.add.text(500, 270,
        `Zeit: ${this.rushTime.toFixed(1)}s   Bestzeit: ${window.BOSS_RUSH_BEST}s${isBest ? '  (NEU!)' : ''}`,
        { fontSize: '15px', color: '#39ff88', fontFamily: 'monospace' }
      ).setOrigin(0.5);
      this.add.text(500, 330, 'Alle Bosse erledigt – in Rekordzeit.',
        { fontSize: '14px', color: '#00fff2', fontFamily: 'monospace', align: 'center' }
      ).setOrigin(0.5);
    } else {
      this.add.text(500, 190, 'DEAL ABGESCHLOSSEN!', {
        fontSize: '30px', color: '#ff2fd0', fontFamily: 'monospace', fontStyle: 'bold'
      }).setOrigin(0.5).setShadow(0, 0, '#ff2fd0', 16, true, true);

      this.add.text(500, 270,
        `Gesamt-Kohle: $${GameState.money}  —  Konto: $${(typeof getWallet === 'function') ? getWallet() : 0}`,
        { fontSize: '15px', color: '#39ff88', fontFamily: 'monospace' }
      ).setOrigin(0.5);

      this.add.text(500, 330,
        'Cocktail an der Strandbar, Interpol im Sand.\nDu bist raus aus der Nummer – für immer.',
        { fontSize: '14px', color: '#00fff2', fontFamily: 'monospace', align: 'center', lineSpacing: 6 }
      ).setOrigin(0.5);
    }

    const btn = this.add.text(500, 430, '[ NOCHMAL VON VORNE ]', {
      fontSize: '18px', color: '#ffe94a', fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const go = () => { beep(500, 0.08, 'square', 0.06); this.scene.start('MenuScene'); };
    btn.on('pointerover', () => btn.setColor('#000000').setBackgroundColor('#ffe94a'));
    btn.on('pointerout', () => btn.setColor('#ffe94a').setBackgroundColor(null));
    btn.on('pointerdown', go);
    this.input.keyboard.once('keydown-SPACE', go);
  }

  update() {
    if (this.stars) this.stars.tilePositionX += 0.15;
  }
}
