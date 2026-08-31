class TutorialScene extends Phaser.Scene {
  constructor() { super('TutorialScene'); }

  create() {
    this.cameras.main.setBackgroundColor('#0a0014');
    this.stars = addScreenBackdrop(this);

    this.add.text(500, 80, 'TUTORIAL', {
      fontSize: '28px', color: '#ff2fd0', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setShadow(0, 0, '#ff2fd0', 12, true, true);

    // ---- Steuerungs-Tabelle (linksbündig, damit die Spalten stimmen) ----
    const colAction = 95, colKey = 300, colXbox = 560, colPs = 760;
    this.add.text(colAction, 130, 'AKTION', {
      fontSize: '12px', color: '#00fff2', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.add.text(colKey, 130, 'TASTATUR', {
      fontSize: '12px', color: '#ffe94a', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.add.text(colXbox, 130, 'XBOX', {
      fontSize: '12px', color: '#39ff88', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.add.text(colPs, 130, 'PLAYSTATION', {
      fontSize: '12px', color: '#7aa8ff', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    const controls = [
      ['Laufen', 'A / D oder Pfeile', 'Stick / D-Pad', 'Stick / D-Pad'],
      ['Springen', 'W / LEERTASTE', 'A', '✕ (Kreuz)'],
      ['Verkaufen / Schießen', 'E', 'X', '□ (Viereck)'],
      ['Sprint (Dash)', 'SHIFT', 'RB', 'R1'],
      ['Pause', 'ESC', 'START', 'OPTIONS']
    ];
    controls.forEach((row, i) => {
      const y = 158 + i * 22;
      this.add.text(colAction, y, row[0], { fontSize: '12px', color: '#ffffff', fontFamily: 'monospace' }).setOrigin(0, 0.5);
      this.add.text(colKey, y, row[1], { fontSize: '12px', color: '#ffe94a', fontFamily: 'monospace' }).setOrigin(0, 0.5);
      this.add.text(colXbox, y, row[2], { fontSize: '12px', color: '#39ff88', fontFamily: 'monospace' }).setOrigin(0, 0.5);
      this.add.text(colPs, y, row[3], { fontSize: '12px', color: '#7aa8ff', fontFamily: 'monospace' }).setOrigin(0, 0.5);
    });

    // ---- Spielprinzip ----
    const lines = [
      'Verkauf an Kunden (?) und sammle Verträge ($) & Münzen.',
      'Schnell hintereinander = COMBO-Multiplikator für mehr Kohle!',
      '',
      'Power-Ups: ☕ Speed  ·  🧳 Schild  ·  🧲 Magnet',
      'Zwischen den Leveln gibt es einen Shop für Upgrades.',
      '',
      'Erst wenn du genug verkauft hast, öffnet sich das Tor –',
      'dann wirst du in der Boss-Arena eingesperrt. Besiege den Boss!',
      '',
      'Im Finale wird aus dem Koffer eine Schrotflinte:',
      'E / X / □ heißt dann „Schießen“. Viel Erfolg, Vertriebler!'
    ];

    this.add.text(500, 388, lines.join('\n'), {
      fontSize: '13px', color: '#00fff2', fontFamily: 'monospace', align: 'center', lineSpacing: 6
    }).setOrigin(0.5);

    // Übungsparcours starten
    const playBtn = this.add.text(500, 522, '[ ÜBUNGS-LEVEL SPIELEN ]', {
      fontSize: '19px', color: '#39ff88', fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    playBtn.setShadow(0, 0, '#39ff88', 8, true, true);
    const play = () => {
      beep(600, 0.1, 'square', 0.06);
      GameState.money = 0;
      GameState.upgrades = {};
      this.scene.start('PlayScene', { levelIndex: 'tutorial' });
    };
    playBtn.on('pointerover', () => playBtn.setColor('#000000').setBackgroundColor('#39ff88'));
    playBtn.on('pointerout', () => playBtn.setColor('#39ff88').setBackgroundColor(null));
    playBtn.on('pointerdown', play);
    this.input.keyboard.once('keydown-SPACE', play);

    this.add.text(500, 552, 'Hier probierst du jede Funktion einmal aus', {
      fontSize: '11px', color: '#8a8fa0', fontFamily: 'monospace'
    }).setOrigin(0.5);

    const btn = this.add.text(500, 580, '[ ZURÜCK ]', {
      fontSize: '16px', color: '#ffe94a', fontFamily: 'monospace'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const go = () => { beep(500, 0.08, 'square', 0.06); this.scene.start('MenuScene'); };
    btn.on('pointerover', () => btn.setColor('#000000').setBackgroundColor('#ffe94a'));
    btn.on('pointerout', () => btn.setColor('#ffe94a').setBackgroundColor(null));
    btn.on('pointerdown', go);
  }
}
