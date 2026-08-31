const SHOP_ITEMS = [
  { id: 'espresso', icon: '☕', name: 'Espresso-Abo', desc: 'Lauftempo +18%', preis: 400 },
  { id: 'stressball', icon: '❤', name: 'Stressball', desc: '+1 Nerven (Leben)', preis: 450 },
  { id: 'schnellfeuer', icon: '⚡', name: 'Schnellfeuer-Pitch', desc: 'Schneller schießen (Finale)', preis: 500 },
  { id: 'charisma', icon: '🤝', name: 'Charisma-Seminar', desc: 'Größere Verkaufsreichweite', preis: 350 },
  { id: 'magnet', icon: '🧲', name: 'Klammer-Magnet', desc: 'Zieht Verträge & Münzen an', preis: 600 }
];

class ShopScene extends Phaser.Scene {
  constructor() { super('ShopScene'); }

  init(data) { this.levelIndex = data.levelIndex; }

  create() {
    this.cameras.main.setBackgroundColor('#0a0014');
    this.stars = addScreenBackdrop(this, 0xffe94a);

    this.add.text(500, 60, '💼 ZWISCHENHÄNDLER', {
      fontSize: '30px', color: '#ffe94a', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setShadow(0, 0, '#ffe94a', 14, true, true);

    this.add.text(500, 100, 'Investier in dich selbst – gilt für diesen Durchlauf', {
      fontSize: '12px', color: '#00fff2', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.kohleText = this.add.text(500, 132, '', {
      fontSize: '16px', color: '#39ff88', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.itemTexts = [];
    SHOP_ITEMS.forEach((item, i) => {
      const y = 190 + i * 52;
      this.add.text(150, y, `${item.icon} ${item.name}`, {
        fontSize: '15px', color: '#ffffff', fontFamily: 'monospace'
      }).setOrigin(0, 0.5);
      this.add.text(150, y + 16, item.desc, {
        fontSize: '11px', color: '#8a8fa0', fontFamily: 'monospace'
      }).setOrigin(0, 0.5);
      const btn = this.add.text(850, y, '', {
        fontSize: '14px', color: '#39ff88', fontFamily: 'monospace'
      }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => this.buy(item, btn));
      this.itemTexts.push({ item, btn });
    });

    const weiter = this.add.text(500, 470, '[ WEITER ZUM NÄCHSTEN LEVEL ]', {
      fontSize: '18px', color: '#ffe94a', fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    weiter.setShadow(0, 0, '#ffe94a', 8, true, true);
    const go = () => { beep(600, 0.1, 'square', 0.06); this.scene.start('LevelIntroScene', { levelIndex: this.levelIndex + 1 }); };
    weiter.on('pointerover', () => weiter.setColor('#000000').setBackgroundColor('#ffe94a'));
    weiter.on('pointerout', () => weiter.setColor('#ffe94a').setBackgroundColor(null));
    weiter.on('pointerdown', go);
    this.input.keyboard.once('keydown-SPACE', go);

    this.refresh();
  }

  buy(item, btn) {
    if (GameState.upgrades[item.id] || GameState.money < item.preis) { beep(160, 0.12, 'sawtooth', 0.06); return; }
    GameState.money -= item.preis;
    GameState.upgrades[item.id] = true;
    beep(1000, 0.1, 'square', 0.07); beep(1400, 0.1, 'square', 0.06, 70);
    if (typeof unlockAchievement === 'function') unlockAchievement(this, 'sparfuchs');
    this.refresh();
  }

  refresh() {
    this.kohleText.setText(`RUN-KOHLE: $${GameState.money}`);
    this.itemTexts.forEach(({ item, btn }) => {
      if (GameState.upgrades[item.id]) {
        btn.setText('GEKAUFT ✓').setColor('#39ff88').setAlpha(0.6);
      } else if (GameState.money < item.preis) {
        btn.setText(`$${item.preis}`).setColor('#8a5a5a').setAlpha(0.55);
      } else {
        btn.setText(`[ $${item.preis} ]`).setColor('#39ff88').setAlpha(1);
      }
    });
  }

  update() {
    if (this.stars) this.stars.tilePositionX += 0.12;
  }
}
