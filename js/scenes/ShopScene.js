// Items sind gestuft kaufbar (max. UPGRADE_MAX_LEVEL Stufen). Jede Stufe kostet deutlich
// mehr als die vorige — man kann sich nicht alles leisten, sondern muss sich entscheiden:
// breit streuen oder ein Item hochziehen.
const SHOP_ITEMS = [
  { id: 'espresso', icon: '☕', name: 'Espresso-Abo', desc: 'Lauftempo +12% pro Stufe', preise: [750, 1350, 2400] },
  { id: 'stressball', icon: '❤', name: 'Stressball', desc: '+1 Nerv (Leben) pro Stufe', preise: [900, 1700, 3000] },
  { id: 'schnellfeuer', icon: '⚡', name: 'Schnellfeuer-Pitch', desc: 'Schneller schießen (Finale)', preise: [850, 1500, 2600] },
  { id: 'charisma', icon: '🤝', name: 'Charisma-Seminar', desc: 'Verkaufsreichweite +22px pro Stufe', preise: [700, 1250, 2200] },
  { id: 'magnet', icon: '🧲', name: 'Klammer-Magnet', desc: 'Zieht Verträge & Münzen an (stärker pro Stufe)', preise: [1000, 1800, 3100] }
];

// Preis der nächsten Stufe – null, wenn das Item schon auf Maximalstufe ist.
function shopNextPrice(item) {
  const lvl = upgradeLevel(item.id);
  return (lvl >= item.preise.length) ? null : item.preise[lvl];
}

// Stufen-Anzeige: ●●○ für Stufe 2 von 3
function shopPips(item) {
  const lvl = upgradeLevel(item.id);
  return '●'.repeat(lvl) + '○'.repeat(item.preise.length - lvl);
}

class ShopScene extends Phaser.Scene {
  constructor() { super('ShopScene'); }

  init(data) { this.levelIndex = data.levelIndex; }

  create() {
    this.cameras.main.setBackgroundColor('#0a0014');
    this.stars = addScreenBackdrop(this, 0xffe94a);

    this.add.text(500, 52, '💼 ZWISCHENHÄNDLER', {
      fontSize: '30px', color: '#ffe94a', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setShadow(0, 0, '#ffe94a', 14, true, true);

    this.add.text(500, 90, 'Investier in dich selbst – gilt für diesen Durchlauf', {
      fontSize: '12px', color: '#00fff2', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.add.text(500, 110, 'Jedes Item max. 3 Stufen – jede Stufe kostet mehr. Wähl weise!', {
      fontSize: '11px', color: '#8a8fa0', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.kohleText = this.add.text(500, 138, '', {
      fontSize: '16px', color: '#39ff88', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.itemTexts = [];
    SHOP_ITEMS.forEach((item, i) => {
      const y = 194 + i * 52;
      this.add.text(150, y, `${item.icon} ${item.name}`, {
        fontSize: '15px', color: '#ffffff', fontFamily: 'monospace'
      }).setOrigin(0, 0.5);
      this.add.text(150, y + 16, item.desc, {
        fontSize: '11px', color: '#8a8fa0', fontFamily: 'monospace'
      }).setOrigin(0, 0.5);
      const pips = this.add.text(640, y, '', {
        fontSize: '15px', color: '#ffe94a', fontFamily: 'monospace'
      }).setOrigin(0, 0.5);
      const btn = this.add.text(850, y, '', {
        fontSize: '14px', color: '#39ff88', fontFamily: 'monospace'
      }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => this.buy(item));
      this.itemTexts.push({ item, btn, pips });
    });

    const weiter = this.add.text(500, 472, '[ WEITER ZUM NÄCHSTEN LEVEL ]', {
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

  buy(item) {
    const preis = shopNextPrice(item);
    if (preis === null || GameState.money < preis) { beep(160, 0.12, 'sawtooth', 0.06); return; }
    GameState.money -= preis;
    GameState.upgrades[item.id] = upgradeLevel(item.id) + 1;
    beep(1000, 0.1, 'square', 0.07); beep(1400, 0.1, 'square', 0.06, 70);
    if (typeof unlockAchievement === 'function') unlockAchievement(this, 'sparfuchs');
    this.refresh();
  }

  refresh() {
    this.kohleText.setText(`RUN-KOHLE: $${GameState.money}`);
    this.itemTexts.forEach(({ item, btn, pips }) => {
      const lvl = upgradeLevel(item.id);
      const preis = shopNextPrice(item);
      pips.setText(shopPips(item)).setAlpha(lvl > 0 ? 1 : 0.45);
      if (preis === null) {
        btn.setText('MAX ✓').setColor('#39ff88').setAlpha(0.6);
      } else if (GameState.money < preis) {
        btn.setText(`$${preis}`).setColor('#8a5a5a').setAlpha(0.55);
      } else {
        btn.setText(`[ STUFE ${lvl + 1} · $${preis} ]`).setColor('#39ff88').setAlpha(1);
      }
    });
  }

  update() {
    if (this.stars) this.stars.tilePositionX += 0.12;
  }
}
