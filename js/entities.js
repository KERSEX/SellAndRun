// ---------- Spieler ----------
function createPlayer(scene, x, y, skin) {
  const s = skin || { suit: 0x1b2a6b, suitDark: 0x14204f, suitLight: 0x22337f, tie: 0xff2fd0, hair: 0x241505 };
  const armB = scene.add.rectangle(-13, 4, 7, 15, s.suitDark);

  const legLRect = scene.add.rectangle(0, -1, 9, 10, s.suit);
  const legLShoe = scene.add.rectangle(1, 5, 10, 4, 0x10131c);
  const legL = scene.add.container(-6, 20, [legLRect, legLShoe]);

  const legRRect = scene.add.rectangle(0, -1, 9, 10, s.suit);
  const legRShoe = scene.add.rectangle(1, 5, 10, 4, 0x10131c);
  const legR = scene.add.container(6, 20, [legRRect, legRShoe]);

  const body = scene.add.rectangle(0, 3, 26, 22, s.suit);
  const shirt = scene.add.rectangle(0, -5, 20, 7, 0xffffff);
  const tie = scene.add.rectangle(0, 1, 5, 14, s.tie);
  const belt = scene.add.rectangle(0, 12, 26, 3, 0x10131c);
  const hair = scene.add.rectangle(0, -22, 18, 5, s.hair);
  const face = scene.add.rectangle(0, -16, 18, 12, 0xffcf9e);
  const glasses = scene.add.rectangle(2, -18, 15, 4, 0x0a0a0a);
  const bag = scene.add.rectangle(18, 9, 12, 15, 0x5a3a16);
  const armF = scene.add.rectangle(12, 4, 7, 15, s.suitLight || s.suit);

  const c = scene.add.container(x, y, [armB, legL, legR, body, shirt, tie, belt, face, hair, glasses, bag, armF]);
  scene.physics.add.existing(c);
  c.body.setSize(30, 48);
  c.body.setOffset(-15, -24);
  c.body.setMaxVelocity(260, 900);
  c.legL = legL; c.legR = legR;
  c.armF = armF; c.armB = armB;
  c.bag = bag;
  c.facing = 1;
  return c;
}

// ---------- Kunde (NPC) ----------
function createNpc(scene, def) {
  const legL = scene.add.rectangle(-6, 24, 9, 8, 0x0a1626);
  const legR = scene.add.rectangle(6, 24, 9, 8, 0x0a1626);
  const bodyRect = scene.add.rectangle(0, 6, 26, 30, 0x0066ff);
  const badge = scene.add.rectangle(7, 0, 6, 6, 0xffe94a);
  const head = scene.add.rectangle(0, -16, 18, 12, 0xffcf9e);
  const hair = scene.add.rectangle(0, -22, 18, 5, 0x101418);

  const bubble = scene.add.graphics();
  bubble.fillStyle(0xffffff, 1);
  bubble.fillRoundedRect(-13, -58, 26, 20, 5);
  bubble.fillTriangle(-3, -38, 5, -38, 0, -31);
  const q = scene.add.text(-4, -55, '?', { fontSize: '14px', color: '#0a0014', fontFamily: 'monospace', fontStyle: 'bold' });

  const prompt = scene.add.text(-62, -84, '[E] VERKAUFEN', { fontSize: '12px', color: '#39ff88', fontFamily: 'monospace' }).setVisible(false);
  prompt.setShadow(0, 0, '#39ff88', 6, true, true);

  const c = scene.add.container(def.x, def.y, [legL, legR, bodyRect, badge, head, hair, bubble, q, prompt]);
  scene.tweens.add({ targets: [bubble, q], y: '+=3', yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });
  c.bodyRect = bodyRect;
  c.prompt = prompt;
  c.value = def.value || 300;
  c.sold = false;
  c.isNpc = true;
  return c;
}

// ---------- Vertrag (Sammel-Item) ----------
function createContract(scene, def) {
  const glow = scene.add.rectangle(0, 0, 36, 40, 0xffe94a, 0.16);
  const paper = scene.add.rectangle(0, 0, 26, 30, 0xffffff);
  paper.setStrokeStyle(1, 0xd8dde6);
  const line1 = scene.add.rectangle(0, -9, 16, 2, 0xb9c0cc);
  const line2 = scene.add.rectangle(0, -4, 16, 2, 0xb9c0cc);
  const line3 = scene.add.rectangle(0, 1, 12, 2, 0xb9c0cc);
  const label = scene.add.text(-5, 3, '$', { fontSize: '14px', color: '#c8a418', fontFamily: 'monospace', fontStyle: 'bold' });
  const c = scene.add.container(def.x, def.y, [glow, paper, line1, line2, line3, label]);
  c.value = def.value || 150;
  c.collected = false;
  c.isContract = true;
  scene.tweens.add({ targets: c, y: def.y - 10, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut' });
  scene.tweens.add({ targets: glow, alpha: { from: 0.10, to: 0.30 }, yoyo: true, repeat: -1, duration: 600 });
  return c;
}

// ---------- Gegner (Patrouille) ----------
function createEnemy(scene, def, colors) {
  const darker = fxDarken(colors.body, 0.6);
  const legA = scene.add.rectangle(-6, 17, 9, 8, 0x11151d);
  const legB = scene.add.rectangle(6, 17, 9, 8, 0x11151d);
  const armL = scene.add.rectangle(-15, 5, 5, 12, darker);
  const armR = scene.add.rectangle(15, 5, 5, 12, darker);
  const bodyRect = scene.add.rectangle(0, 4, 26, 17, colors.body);
  const head = scene.add.rectangle(0, -12, 16, 11, colors.head);
  const hat = scene.add.rectangle(0, -18, 20, 4, 0x0d0f14);
  const eyeL = scene.add.rectangle(-4, -13, 3, 3, 0x1a1a1a);
  const eyeR = scene.add.rectangle(4, -13, 3, 3, 0x1a1a1a);

  const c = scene.add.container(def.x, def.y, [legA, legB, armL, armR, bodyRect, head, hat, eyeL, eyeR]);
  scene.physics.add.existing(c);
  c.body.setSize(28, 40);
  c.body.setOffset(-14, -20);
  c.body.setCollideWorldBounds(false);
  c.minX = def.x - def.range;
  c.maxX = def.x + def.range;
  c.speed = def.speed || 60;
  c.isEnemy = true;
  scene.tweens.add({ targets: legA, y: { from: 15, to: 19 }, yoyo: true, repeat: -1, duration: 150 });
  scene.tweens.add({ targets: legB, y: { from: 19, to: 15 }, yoyo: true, repeat: -1, duration: 150 });
  return c;
}

// ---------- Stachel-Hindernis ----------
function createSpike(scene, def) {
  const g = scene.add.graphics();
  g.fillStyle(0xd93030, 1);
  g.fillTriangle(-def.w / 2, def.h / 2, def.w / 2, def.h / 2, 0, -def.h / 2);
  g.fillTriangle(-def.w / 2 + 12, def.h / 2, -def.w / 2 + 24, def.h / 2, -def.w / 2 + 18, -def.h / 2 + 4);
  const c = scene.add.container(def.x, def.y, [g]);
  scene.physics.add.existing(c, true);
  c.body.setSize(def.w, def.h);
  c.body.setOffset(-def.w / 2, -def.h / 2);
  c.isHazard = true;
  return c;
}

// ---------- Bewegliche Plattform ----------
function createMovingPlatform(scene, def) {
  const rect = scene.add.rectangle(0, 0, def.w, def.h, def.color || 0x795548);
  const topLine = scene.add.rectangle(0, -def.h / 2 + 1, def.w, 2, 0xffffff, 0.3);
  const c = scene.add.container(def.x, def.y, [rect, topLine]);
  scene.physics.add.existing(c);
  c.body.setSize(def.w, def.h);
  c.body.setOffset(-def.w / 2, -def.h / 2);
  c.body.setAllowGravity(false);
  c.body.setImmovable(true);
  c.axis = def.axis || 'x';
  c.minPos = (c.axis === 'y' ? def.y - def.range : def.x - def.range);
  c.maxPos = (c.axis === 'y' ? def.y + def.range : def.x + def.range);
  c.speed = def.speed || 50;
  if (c.axis === 'x') c.body.setVelocityX(c.speed);
  else c.body.setVelocityY(c.speed);
  c.isMovingPlatform = true;
  return c;
}

// ---------- Schaltbare Sicherheitsschranke ----------
function createToggleBarrier(scene, def) {
  const rect = scene.add.rectangle(0, 0, def.w, def.h, 0xffe94a);
  const c = scene.add.container(def.x, def.y, [rect]);
  scene.physics.add.existing(c, true);
  c.body.setSize(def.w, def.h);
  c.body.setOffset(-def.w / 2, -def.h / 2);
  c.on = def.startOn;
  c.onTime = def.onTime; c.offTime = def.offTime;
  c.timer = c.on ? c.onTime : c.offTime;
  c.body.enable = c.on;
  c.setAlpha(c.on ? 1 : 0.25);
  c.isToggleBarrier = true;
  return c;
}

// ---------- Boss ----------
function createBoss(scene, def) {
  const darker = fxDarken(def.color, 0.6);
  const bodyRect = scene.add.rectangle(0, 0, 70, 80, def.color);
  const belt = scene.add.rectangle(0, 26, 70, 6, darker);
  const tie = scene.add.rectangle(0, -14, 10, 34, 0xd8b430);
  const armL = scene.add.rectangle(-41, 6, 10, 34, darker);
  const armR = scene.add.rectangle(41, 6, 10, 34, darker);
  const caseHandle = scene.add.rectangle(52, 15, 8, 3, 0x241a0e);
  const briefcase = scene.add.rectangle(52, 26, 16, 20, 0x3a2a16);
  const head = scene.add.rectangle(0, -48, 34, 20, 0xe0b98a);
  const eyeL = scene.add.rectangle(-8, -50, 5, 4, 0x201010);
  const eyeR = scene.add.rectangle(8, -50, 5, 4, 0x201010);
  const browL = scene.add.rectangle(-8, -54, 7, 2, 0x5a1010);
  const browR = scene.add.rectangle(8, -54, 7, 2, 0x5a1010);
  const hatBrim = scene.add.rectangle(0, -59, 46, 4, 0x14161f);
  const hatTop = scene.add.rectangle(0, -67, 28, 13, 0x14161f);
  const nameText = scene.add.text(-70, -98, def.name, { fontSize: '11px', color: '#ffffff', fontFamily: 'monospace' });
  nameText.setShadow(0, 0, '#ff2fd0', 6, true, true);

  const c = scene.add.container(def.x, def.y, [armL, armR, bodyRect, belt, tie, caseHandle, briefcase, head, eyeL, eyeR, browL, browR, hatBrim, hatTop, nameText]);
  scene.physics.add.existing(c);
  c.body.setSize(70, 80);
  c.body.setOffset(-35, -40);
  c.body.setImmovable(true);
  c.body.setAllowGravity(false);
  c.bodyRect = bodyRect;
  c.hits = 0;
  c.hitsNeeded = def.hitsNeeded;
  c.state = 'DORMANT';
  c.stateTimer = 1.0;
  c.baseX = def.x; c.baseY = def.y;
  c.attacksInCycle = 0;
  c.isBoss = true;
  return c;
}

// ---------- Münze (Streu-Collectible, nur Kohle) ----------
function createCoin(scene, def) {
  const glow = scene.add.circle(0, 0, 11, 0xffe94a, 0.2);
  const coin = scene.add.circle(0, 0, 7, 0xffe94a);
  coin.setStrokeStyle(2, 0xc8a418);
  const label = scene.add.text(-3, -6, '$', { fontSize: '10px', color: '#8a6a10', fontFamily: 'monospace', fontStyle: 'bold' });
  const c = scene.add.container(def.x, def.y, [glow, coin, label]);
  c.collected = false;
  c.isCoin = true;
  c.coin = coin; c.label = label;
  scene.tweens.add({ targets: coin, scaleX: { from: 1, to: 0.25 }, yoyo: true, repeat: -1, duration: 500, ease: 'Sine.easeInOut' });
  scene.tweens.add({ targets: label, scaleX: { from: 1, to: 0.25 }, yoyo: true, repeat: -1, duration: 500, ease: 'Sine.easeInOut' });
  return c;
}

// ---------- Power-Up (temporär) ----------
function createPowerup(scene, def) {
  const glow = scene.add.circle(0, 0, 18, 0xffffff, 0.12);
  const parts = [glow];
  if (def.kind === 'coffee') {
    const cup = scene.add.rectangle(0, 2, 18, 20, 0x5a3a1a);
    cup.setStrokeStyle(2, 0x8a6a3a);
    const rim = scene.add.rectangle(0, -8, 22, 4, 0xd8c0a0);
    const steam1 = scene.add.rectangle(-4, -16, 3, 8, 0xffffff, 0.6);
    const steam2 = scene.add.rectangle(4, -16, 3, 8, 0xffffff, 0.6);
    parts.push(cup, rim, steam1, steam2);
    scene.tweens.add({ targets: [steam1, steam2], y: '-=4', alpha: 0.2, yoyo: true, repeat: -1, duration: 600 });
    glow.setFillStyle(0xffa040, 0.16);
  } else if (def.kind === 'shield') {
    const caseR = scene.add.rectangle(0, 0, 24, 20, 0x3a2a16);
    caseR.setStrokeStyle(2, 0x00fff2);
    const handle = scene.add.rectangle(0, -12, 10, 4, 0x241a0e);
    const shine = scene.add.rectangle(-5, -3, 4, 10, 0xffffff, 0.4);
    parts.push(caseR, handle, shine);
    glow.setFillStyle(0x00fff2, 0.16);
  } else { // magnet
    const barL = scene.add.rectangle(-6, -2, 6, 18, 0xd93030);
    const barR = scene.add.rectangle(6, -2, 6, 18, 0xd93030);
    const arc = scene.add.rectangle(0, -9, 18, 6, 0xd93030);
    const tipL = scene.add.rectangle(-6, 9, 6, 5, 0xcccccc);
    const tipR = scene.add.rectangle(6, 9, 6, 5, 0xcccccc);
    parts.push(barL, barR, arc, tipL, tipR);
    glow.setFillStyle(0xff5555, 0.16);
  }
  const c = scene.add.container(def.x, def.y, parts);
  c.kind = def.kind;
  c.collected = false;
  c.isPowerup = true;
  scene.tweens.add({ targets: c, y: def.y - 10, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut' });
  scene.tweens.add({ targets: glow, alpha: { from: 0.10, to: 0.28 }, yoyo: true, repeat: -1, duration: 700 });
  return c;
}

// ---------- Checkpoint-Fahne ----------
function createCheckpoint(scene, def) {
  const mast = scene.add.rectangle(0, -30, 4, 60, 0x8a8f9a);
  const knob = scene.add.circle(0, -60, 4, 0xffe94a);
  const flag = scene.add.triangle(16, -52, 0, 0, 24, 7, 0, 14, 0x888a90);
  const c = scene.add.container(def.x, GROUND_Y, [mast, knob, flag]);
  c.flag = flag;
  c.activated = false;
  c.isCheckpoint = true;
  return c;
}

// ---------- Gegner: Drohne (fliegt Sinuskurve) ----------
function createDrone(scene, def) {
  const rotor = scene.add.rectangle(0, -14, 30, 4, 0xcccccc);
  const bodyRect = scene.add.rectangle(0, 0, 26, 18, 0x444a5a);
  const light = scene.add.circle(0, 4, 3, 0xff3030);
  const eyeL = scene.add.rectangle(-5, -2, 4, 4, 0x00fff2);
  const eyeR = scene.add.rectangle(5, -2, 4, 4, 0x00fff2);
  const c = scene.add.container(def.x, def.y, [rotor, bodyRect, light, eyeL, eyeR]);
  scene.physics.add.existing(c);
  c.body.setSize(28, 24);
  c.body.setOffset(-14, -12);
  c.body.setAllowGravity(false);
  c.minX = def.x - def.range;
  c.maxX = def.x + def.range;
  c.speed = def.speed || 70;
  c.baseY = def.y;
  c.amplitude = def.amplitude || 40;
  c.phase = Math.random() * Math.PI * 2;
  c.isEnemy = true;
  c.isDrone = true;
  scene.tweens.add({ targets: rotor, scaleX: { from: 1, to: 0.2 }, yoyo: true, repeat: -1, duration: 60 });
  return c;
}

// ---------- Gegner: Werfer (stationär, wirft Akten) ----------
function createThrower(scene, def, colors) {
  const legA = scene.add.rectangle(-6, 17, 9, 8, 0x11151d);
  const legB = scene.add.rectangle(6, 17, 9, 8, 0x11151d);
  const bodyRect = scene.add.rectangle(0, 4, 26, 20, colors.body);
  const arm = scene.add.rectangle(14, -6, 6, 16, fxDarken(colors.body, 0.6));
  const head = scene.add.rectangle(0, -14, 16, 12, colors.head);
  const eyeL = scene.add.rectangle(-4, -14, 3, 3, 0x1a1a1a);
  const eyeR = scene.add.rectangle(4, -14, 3, 3, 0x1a1a1a);
  const c = scene.add.container(def.x, def.y, [legA, legB, bodyRect, arm, head, eyeL, eyeR]);
  scene.physics.add.existing(c);
  c.body.setSize(28, 44);
  c.body.setOffset(-14, -22);
  c.body.setImmovable(true);
  c.body.setAllowGravity(false);
  c.arm = arm;
  c.throwTimer = 2.5;
  c.isEnemy = true;
  c.isThrower = true;
  return c;
}
