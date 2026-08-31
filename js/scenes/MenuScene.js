class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    GameState.levelIndex = 0;
    GameState.money = 0;
    GameState.upgrades = {};

    this.cameras.main.setBackgroundColor('#05000a');
    ensureParticleTextures(this);
    this.stars = addScreenBackdrop(this);
    makeMenuGridTexture(this);
    this.add.image(500, 505, 'fx_menugrid').setAlpha(0.9);
    if (typeof startMusic === 'function') startMusic('menu');

    const title = this.add.text(500, 78, 'SELL AND RUN', {
      fontSize: '48px', color: '#ff2fd0', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5);
    title.setShadow(0, 0, '#ff2fd0', 18, true, true);
    this.tweens.add({ targets: title, scale: { from: 1, to: 1.035 }, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut' });

    const sub = this.add.text(500, 118, '— VERKAUFEN. RENNEN. ABKASSIEREN. —', {
      fontSize: '12px', color: '#00fff2', fontFamily: 'monospace'
    }).setOrigin(0.5);
    sub.setShadow(0, 0, '#00fff2', 8, true, true);

    this.add.text(500, 168,
      'Verkauf dich durch sechs Level – vom Büro bis zum Steuerparadies –\nund überlebe die Bosse. E = Verkaufen/Schießen, SHIFT = Sprint.',
      { fontSize: '12px', color: '#ffe94a', fontFamily: 'monospace', align: 'center', lineSpacing: 6 }
    ).setOrigin(0.5);

    if (GameState.bestMoney > 0 || (typeof getWallet === 'function' && getWallet() > 0)) {
      const wallet = (typeof getWallet === 'function') ? getWallet() : 0;
      this.add.text(500, 208, `Bestleistung: $${GameState.bestMoney}    Konto: $${wallet}`, {
        fontSize: '12px', color: '#39ff88', fontFamily: 'monospace'
      }).setOrigin(0.5);
    }

    const hasContinue = window.PROGRESS && PROGRESS.unlocked > 0 && PROGRESS.unlocked < LEVELS.length;

    // ---- Primäre Buttons ----
    if (hasContinue) {
      const contLevel = LEVELS[PROGRESS.unlocked];
      this.makeBtn(500, 254, `[ WEITERSPIELEN: LEVEL ${contLevel.id} ]`, '#39ff88', 18, () => {
        this.scene.start('LevelIntroScene', { levelIndex: PROGRESS.unlocked });
      });
      this.makeBtn(500, 292, '[ NEUES SPIEL ]', '#ffe94a', 18, () => this.startGame());
    } else {
      this.makeBtn(500, 272, '[ SPIEL STARTEN ]', '#ffe94a', 20, () => this.startGame());
    }
    this.input.keyboard.once('keydown-SPACE', () => this.startGame());

    // ---- Sekundäre Buttons (2 Spalten) ----
    const lx = 320, rx = 680;
    let y = hasContinue ? 350 : 340;
    const gap = 40;

    this.diffBtn = this.makeBtn(lx, y, `[ SCHWIERIGKEIT: ${getDifficultyLabel()} ]`, '#ff2fd0', 14, () => {
      window.openDiffMenu(() => this.diffBtn.setText(`[ SCHWIERIGKEIT: ${getDifficultyLabel()} ]`));
    });
    this.makeBtn(rx, y, '[ BOSS-RUSH ]', '#ff5555', 14, () => startBossRush(this));
    y += gap;
    this.makeBtn(lx, y, '[ EINSTELLUNGEN ]', '#9a7bff', 14, () => window.openSettingsMenu());
    this.makeBtn(rx, y, '[ STATISTIK ]', '#00fff2', 14, () => window.openStatsMenu());
    y += gap;
    this.makeBtn(lx, y, '[ SKINS ]', '#ffb84a', 14, () => window.openSkinsMenu(() => this.rebuildRunner()));
    this.makeBtn(rx, y, '[ TUTORIAL ]', '#00fff2', 14, () => this.scene.start('TutorialScene'));

    // ---- Deko-Läufer ----
    this.rebuildRunner();
    if (fxEnabled()) {
      this.add.particles(0, 0, 'fx_spark', {
        x: 112, y: 562, speedX: { min: -80, max: -40 }, speedY: { min: -14, max: 6 },
        lifespan: 650, scale: { start: 0.9, end: 0 }, tint: 0xffe94a, frequency: 130
      });
    }
  }

  makeBtn(x, y, label, color, size, cb) {
    const btn = this.add.text(x, y, label, {
      fontSize: size + 'px', color, fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.setShadow(0, 0, color, 6, true, true);
    btn.on('pointerover', () => btn.setColor('#000000').setBackgroundColor(color));
    btn.on('pointerout', () => btn.setColor(color).setBackgroundColor(null));
    btn.on('pointerdown', () => { beep(500, 0.08, 'square', 0.06); cb(); });
    return btn;
  }

  startGame() {
    beep(500, 0.08, 'square', 0.06);
    this.scene.start('LevelIntroScene', { levelIndex: 0 });
  }

  rebuildRunner() {
    if (this.runner) this.runner.destroy();
    const skin = (typeof getActiveSkin === 'function') ? getActiveSkin() : null;
    this.runner = createPlayer(this, 130, 556, skin);
    this.runner.body.setAllowGravity(false);
    this.tweens.add({ targets: this.runner.legL, y: { from: 17, to: 23 }, yoyo: true, repeat: -1, duration: 130 });
    this.tweens.add({ targets: this.runner.legR, y: { from: 23, to: 17 }, yoyo: true, repeat: -1, duration: 130 });
  }

  update() {
    if (this.stars) this.stars.tilePositionX += 0.2;
  }
}
