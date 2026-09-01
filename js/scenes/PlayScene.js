class PlayScene extends Phaser.Scene {
  constructor() { super('PlayScene'); }

  init(data) {
    this.levelIndex = data.levelIndex;
    this.bossRush = data.bossRush || null;
  }

  create() {
    const level = (this.levelIndex === 'tutorial') ? TUTORIAL_LEVEL : LEVELS[this.levelIndex];
    this.level = level;
    this.isTutorial = !!level.isTutorial;
    // Gunfight entweder von Anfang an (Level 5/6) oder ab einer Stelle im Level (Tutorial)
    this.usesGunfight = !!(level.isGunfight || level.gunfightFromX);
    this.gunfightActive = !!level.isGunfight;
    this.diff = (typeof getDifficulty === 'function') ? getDifficulty()
      : { lives: 3, bossHitsMult: 1, bossSpeedMult: 1, enemySpeedMult: 1, invulnMult: 1 };

    // Shop-Upgrades sind gestuft (0..3) und skalieren pro Stufe
    const upgStressball = upgradeLevel('stressball');
    let baseLives = this.diff.lives + (window.CHEATS ? window.CHEATS.extraLives : 0);
    baseLives += upgStressball;
    // Training: feste, großzügige Lebenszahl zum Ausprobieren
    if (level.fixedLives) baseLives = level.fixedLives + (window.CHEATS ? window.CHEATS.extraLives : 0);
    this.maxLives = baseLives;
    // Boss-Rush: gemeinsamer Lebenspool, nur bei Schritt 0 zurücksetzen
    if (this.bossRush && this.bossRush.step > 0) {
      this.maxLives = this.bossRush.maxLives;
      GameState.lives = this.bossRush.lives;
    } else {
      GameState.lives = this.maxLives;
      if (this.bossRush) this.bossRush.maxLives = this.maxLives;
    }

    this.salesCount = 0;
    this.gateOpen = false;
    this.arenaLocked = false;
    this.lockWall = null;
    this.lockWallLabel = null;
    this.invulnTimer = 0;
    this.levelComplete = false;
    this.telegraphMarker = null;
    this.bossContract = null;
    this.shootCooldown = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.activeEffects = { speedUntil: 0, shield: false, magnetUntil: 0 };
    this.dashUntil = 0;
    this.dashCooldownUntil = 0;
    this.respawnPoint = null;
    this.tookDamage = false;
    this.levelStartTime = this.time.now;
    GameState.levelStartMoney = GameState.money;

    this.runSpeed = Math.round(200 * (1 + 0.12 * upgradeLevel('espresso')));
    this.sellRadius = 55 + 22 * upgradeLevel('charisma');
    this.shootCd = 0.35 * Math.pow(0.78, upgradeLevel('schnellfeuer'));
    this.magnetLevel = upgradeLevel('magnet');

    this.setupBackground(level);
    this.setupWorld(level);
    this.setupEntities(level);
    this.setupPlayer(level);

    this.bossProjectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.playerBullets = this.physics.add.group();

    // Zweiter Boss (Tutorial): erscheint erst, wenn der erste besiegt ist
    this.boss2Def = level.boss2 || null;
    this.boss2Spawned = false;

    if (level.hasBoss) {
      // Boss 1 nutzt den Gunfight-Stil nur, wenn das Level von Anfang an Gunfight ist
      this.boss = this.spawnBoss(level.boss, !!level.isGunfight);
    } else {
      this.boss = null;
    }

    this.physics.add.collider(this.player, this.solidGroup);
    this.physics.add.collider(this.enemiesGroup, this.solidGroup);
    this.movingPlatformList.forEach(mp => {
      this.physics.add.collider(this.player, mp, (pl, plat) => {
        if (pl.body.touching.down || pl.body.blocked.down) {
          pl.x += plat.deltaX;
          pl.y += plat.deltaY;
        }
      });
    });
    this.toggleBarrierList.forEach(b => this.physics.add.collider(this.player, b));
    this.physics.add.collider(this.player, this.gate);

    this.physics.add.overlap(this.player, this.enemiesGroup, (pl, en) => this.onHazardHit(en), undefined, this);
    this.physics.add.overlap(this.player, this.hazardsGroup, (pl, hz) => this.onHazardHit(hz), undefined, this);
    this.physics.add.overlap(this.player, this.bossProjectiles, (pl, proj) => this.onHazardHit(proj), undefined, this);
    this.physics.add.overlap(this.player, this.enemyProjectiles, (pl, proj) => this.onHazardHit(proj), undefined, this);

    this.drawExit(level);
    this.drawSigns(level);
    this.setupCamera(level);
    this.setupHud(level);
    this.setupInput();
    this.setupFx();
    if (typeof startMusic === 'function') startMusic('game');
  }

  setupBackground(level) {
    ensureParticleTextures(this);
    buildLevelBackground(this, level);
  }

  setupFx() {
    this.fxGold = this.add.particles(0, 0, 'fx_spark', {
      speed: { min: 60, max: 200 }, lifespan: 500, scale: { start: 1.1, end: 0 }, tint: 0xffe94a, emitting: false
    }).setDepth(80);
    this.fxPink = this.add.particles(0, 0, 'fx_spark', {
      speed: { min: 60, max: 220 }, lifespan: 450, scale: { start: 1, end: 0 }, tint: 0xff2fd0, emitting: false
    }).setDepth(80);
    this.fxHit = this.add.particles(0, 0, 'fx_square', {
      speed: { min: 80, max: 240 }, lifespan: 400, scale: { start: 1, end: 0 }, tint: 0xff5555, emitting: false
    }).setDepth(80);
    this.fxDust = this.add.particles(0, 0, 'fx_spark', {
      speedX: { min: -60, max: 60 }, speedY: { min: -90, max: -20 }, lifespan: 320,
      scale: { start: 0.9, end: 0 }, alpha: { start: 0.8, end: 0 }, tint: 0x9aa7bd, emitting: false
    }).setDepth(75);
    this.wasOnGround = true;
    this.prevVY = 0;
  }

  setupWorld(level) {
    this.solidGroup = this.physics.add.staticGroup();
    const groundKey = makeGroundTexture(this, level);
    const step = 40;
    for (let x = 0; x < level.worldWidth; x += step) {
      const cx = x + step / 2;
      const inGap = level.floorGaps.some(([a, b]) => x + step > a && x < b);
      if (inGap) continue;
      const block = this.add.image(cx, GROUND_Y + 20, groundKey);
      this.physics.add.existing(block, true);
      this.solidGroup.add(block);
    }

    level.platforms.forEach(p => {
      this.add.rectangle(p.x, p.y + 2, p.w + 10, p.h + 8, p.color, 0.18);
      const block = this.add.rectangle(p.x, p.y, p.w, p.h, p.color);
      this.physics.add.existing(block, true);
      this.add.rectangle(p.x, p.y - p.h / 2 + 2, p.w, 3, 0xffffff, 0.3);
      this.add.circle(p.x - p.w / 2 + 8, p.y, 2, 0xffffff, 0.35);
      this.add.circle(p.x + p.w / 2 - 8, p.y, 2, 0xffffff, 0.35);
      block.isPlatform = true;
      this.solidGroup.add(block);
    });

    this.movingPlatformList = level.movingPlatforms.map(m => createMovingPlatform(this, m));
    this.toggleBarrierList = level.toggleBarriers.map(b => createToggleBarrier(this, b));

    this.gate = this.add.rectangle(level.gateX, GROUND_Y - 100, 14, 200, 0xff2fd0, 0.85);
    this.physics.add.existing(this.gate, true);
    this.tweens.add({ targets: this.gate, alpha: { from: 0.55, to: 0.95 }, yoyo: true, repeat: -1, duration: 600 });
    this.gateLabel = this.add.text(level.gateX - 46, GROUND_Y - 210, 'GESPERRT', {
      fontSize: '11px', color: '#ff2fd0', fontFamily: 'monospace'
    });
    this.gateLabel.setShadow(0, 0, '#ff2fd0', 6, true, true);
  }

  setupEntities(level) {
    const rush = !!this.bossRush;
    this.npcList = (rush ? [] : level.npcs).map(n => createNpc(this, n));
    this.contractList = (rush ? [] : level.contracts).map(c => createContract(this, c));
    this.coinList = (rush ? [] : (level.coins || [])).map(c => createCoin(this, c));
    this.powerupList = (rush ? [] : (level.powerups || [])).map(p => createPowerup(this, p));
    this.checkpointList = (rush ? [] : (level.checkpoints || [])).map(c => createCheckpoint(this, c));

    this.totalCollectibles = this.npcList.length + this.contractList.length;

    this.enemiesGroup = this.physics.add.group();
    if (!rush) {
      level.enemies.forEach(e => {
        let en;
        if (e.type === 'drone') en = createDrone(this, e);
        else if (e.type === 'thrower') en = createThrower(this, e, level.enemyColors);
        else en = createEnemy(this, e, level.enemyColors);
        this.enemiesGroup.add(en);
        if (!en.isDrone && !en.isThrower) {
          en.speed *= this.diff.enemySpeedMult;
          en.body.setVelocityX(en.speed);
        } else if (en.isDrone) {
          en.speed *= this.diff.enemySpeedMult;
          en.body.setVelocityX(en.speed);
        }
      });
    }

    this.hazardsGroup = this.physics.add.staticGroup();
    if (!rush) level.spikes.forEach(s => this.hazardsGroup.add(createSpike(this, s)));
  }

  setupPlayer(level) {
    const skin = (typeof getActiveSkin === 'function') ? getActiveSkin() : null;
    const startX = this.bossRush ? Math.max(60, level.gateX - 60) : 110;
    this.player = createPlayer(this, startX, GROUND_Y - 24, skin);
    this.player.body.setMaxVelocity(430, 900); // erhöht für Dash
    this.lastSafeX = startX; this.lastSafeY = GROUND_Y - 24;
    if (level.isGunfight) this.equipShotgun();
    // Boss-Rush: Tor sofort offen, direkt zum Boss
    if (this.bossRush) {
      this.salesCount = level.requiredSales;
    }
    // Auren für Power-Ups
    this.speedAura = this.add.circle(startX, GROUND_Y - 24, 24, 0xffa040, 0).setDepth(4);
    this.shieldAura = this.add.circle(startX, GROUND_Y - 24, 26, 0x00fff2, 0).setDepth(4);
  }

  // Erzeugt einen Boss; gunfightStyle = hüpfen + 360°-Schüsse (statt Akten/Vertrag)
  spawnBoss(def, gunfightStyle) {
    const boss = createBoss(this, def);
    boss.hitsNeeded = Math.max(1, Math.round(boss.hitsNeeded * this.diff.bossHitsMult));
    boss.gunfightStyle = !!gunfightStyle;
    boss.defColor = def.color;
    boss.defName = def.name;
    this.physics.add.collider(this.player, boss);
    if (gunfightStyle) {
      boss.body.setAllowGravity(true);
      boss.body.setImmovable(false);
      boss.body.setMaxVelocity(450, 900);
      boss.hopTimer = 1.5;
      boss.airborne = false;
      this.physics.add.collider(boss, this.solidGroup, undefined, (bossObj, tile) => {
        if (!tile.isPlatform) return true;
        return bossObj.body.velocity.y > -50;
      }, this);
      this.physics.add.overlap(boss, this.playerBullets, (bossObj, bullet) => this.onPlayerBulletHitBoss(bullet), undefined, this);
    }
    return boss;
  }

  // Koffer wird zur Schrotflinte
  equipShotgun() {
    this.player.bag.setSize(30, 7);
    this.player.bag.setFillStyle(0x2b2b2b);
    this.player.bag.setPosition(20, 4);
  }

  // Hinweistafeln (Tutorial)
  drawSigns(level) {
    (level.signs || []).forEach(sg => {
      const y = sg.y || GROUND_Y - 150;
      const txt = this.add.text(sg.x, y, sg.text, {
        fontSize: '12px', color: '#ffffff', fontFamily: 'monospace',
        align: 'center', lineSpacing: 5
      }).setOrigin(0.5).setDepth(51);
      const w = txt.width + 22, h = txt.height + 14;
      const bg = this.add.rectangle(sg.x, y, w, h, 0x0a0014, 0.88).setDepth(50);
      bg.setStrokeStyle(2, 0x00fff2, 0.9);
      // Pfosten bis zum Boden
      this.add.rectangle(sg.x, y + h / 2 + (GROUND_Y - (y + h / 2)) / 2, 4, GROUND_Y - (y + h / 2), 0x4a5060).setDepth(49);
    });
  }

  setupCamera(level) {
    this.physics.world.setBounds(0, 0, level.worldWidth, 2000);
    this.physics.world.checkCollision.down = false;
    this.cameras.main.setBounds(0, 0, level.worldWidth, 600);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  setupHud(level) {
    this.add.rectangle(500, 26, 1000, 52, 0x05000a, 0.55).setScrollFactor(0).setDepth(98);
    this.add.rectangle(500, 53, 1000, 2, 0x00fff2, 0.5).setScrollFactor(0).setDepth(98);
    const hudTitle = level.isTutorial ? 'TUTORIAL: TRAINING' : `LEVEL ${level.id}: ${level.name}${this.bossRush ? ' (RUSH)' : ''}`;
    this.hudLevel = this.add.text(14, 10, hudTitle, {
      fontSize: '13px', color: '#00fff2', fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(100);
    this.hudLevel.setShadow(0, 0, '#00fff2', 6, true, true);
    this.hudMoney = this.add.text(14, 32, 'KOHLE: $0', {
      fontSize: '13px', color: '#ffe94a', fontFamily: 'monospace'
    }).setScrollFactor(0).setDepth(100);
    this.hudMoney.setShadow(0, 0, '#ffe94a', 6, true, true);
    this.hudLives = this.add.text(986, 32, '', {
      fontSize: '13px', color: '#ff2fd0', fontFamily: 'monospace'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
    this.hudLives.setShadow(0, 0, '#ff2fd0', 6, true, true);
    this.hudObjective = this.add.text(500, 10, '', {
      fontSize: '13px', color: '#39ff88', fontFamily: 'monospace'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
    this.hudObjective.setShadow(0, 0, '#39ff88', 6, true, true);
    this.hudCombo = this.add.text(500, 30, '', {
      fontSize: '13px', color: '#ff2fd0', fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
    this.hudEffects = this.add.text(986, 10, '', {
      fontSize: '11px', color: '#ffa040', fontFamily: 'monospace'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({ left: 'A', right: 'D', jump: 'W', sell: 'E', pause: 'ESC', dash: 'SHIFT' });
    // Gamepad (F16)
    this.pad = null;
    this.padPrev = {};
    if (this.input.gamepad) {
      if (this.input.gamepad.total > 0) this.pad = this.input.gamepad.getPad(0);
      this.input.gamepad.on('connected', pad => { this.pad = pad; });
    }
  }

  // Flanken-Erkennung für Gamepad-Buttons
  padJustDown(index) {
    if (!this.pad) return false;
    const b = this.pad.buttons[index];
    const down = b && b.pressed;
    const was = this.padPrev[index];
    this.padPrev[index] = down;
    return down && !was;
  }

  tryPause() {
    if (this.__pauseScheduled) return false;
    if (document.querySelector('#cheatMenu:not(.hidden), #diffMenu:not(.hidden), #settingsMenu:not(.hidden), #statsMenu:not(.hidden), #skinsMenu:not(.hidden)')) return false;
    if (performance.now() - (window.__overlayEscAt || 0) < 200) return false;
    this.__pauseScheduled = true;
    const mgr = this.scene.manager;
    setTimeout(() => {
      mgr.run('PauseScene', { levelIndex: this.levelIndex, bossRush: this.bossRush });
      mgr.pause('PlayScene');
      this.__pauseScheduled = false;
    }, 0);
    return true;
  }

  drawExit(level) {
    if (level.exitStyle === 'jet') {
      const jx = level.flagX - 100, jy = GROUND_Y - 78;
      this.add.triangle(jx + 12, jy + 16, 0, 48, 34, 48, 34, 0, 0xb8bfcc);
      this.add.rectangle(jx + 80, jy + 40, 170, 34, 0xd7dbe4);
      this.add.triangle(jx + 186, jy + 40, 0, -17, 42, 0, 0, 17, 0xd7dbe4);
      this.add.rectangle(jx + 80, jy + 47, 170, 6, 0xff2fd0, 0.9);
      for (let i = 0; i < 6; i++) this.add.circle(jx + 30 + i * 24, jy + 33, 3.2, 0x0aa8c4);
      this.add.rectangle(jx + 70, jy + 62, 44, 12, 0x9aa2b4);
      const engineGlow = this.add.circle(jx + 44, jy + 62, 7, 0xffa040, 0.85);
      this.tweens.add({ targets: engineGlow, alpha: { from: 0.4, to: 0.95 }, scaleX: { from: 0.8, to: 1.3 }, yoyo: true, repeat: -1, duration: 260 });
      const jetLabel = this.add.text(jx + 34, jy - 20, 'PRIVATE JET', { fontSize: '10px', color: '#00fff2', fontFamily: 'monospace' });
      jetLabel.setShadow(0, 0, '#00fff2', 6, true, true);
    } else {
      this.add.rectangle(level.flagX, GROUND_Y - 60, 6, 120, 0x8a8f9a);
      this.add.circle(level.flagX, GROUND_Y - 120, 4, 0xffe94a);
      const flag = this.add.rectangle(level.flagX + 23, GROUND_Y - 108, 40, 24, 0x39ff88);
      this.tweens.add({ targets: flag, scaleY: { from: 1, to: 0.86 }, yoyo: true, repeat: -1, duration: 420, ease: 'Sine.easeInOut' });
      const zielLabel = this.add.text(level.flagX - 24, GROUND_Y - 148, 'ZIEL', { fontSize: '11px', color: '#39ff88', fontFamily: 'monospace' });
      zielLabel.setShadow(0, 0, '#39ff88', 6, true, true);
    }
  }

  update(time, delta) {
    if (this.levelComplete) return;
    const padPause = this.padJustDown(9); // Start
    if ((Phaser.Input.Keyboard.JustDown(this.keys.pause) || padPause) && this.tryPause()) return;
    const dt = Math.min(0.033, delta / 1000);
    if (typeof addStat === 'function') { STATS.playtimeS += dt; }

    const cam = this.cameras.main;
    if (this.bgFar) this.bgFar.tilePositionX = cam.scrollX * 0.15;
    if (this.bgMid) this.bgMid.tilePositionX = cam.scrollX * 0.45;

    // ----- Bewegung (Tastatur + Gamepad) -----
    const padLeft = this.pad && (this.pad.leftStick.x < -0.3 || (this.pad.left));
    const padRight = this.pad && (this.pad.leftStick.x > 0.3 || (this.pad.right));
    let dir = 0;
    if (this.cursors.left.isDown || this.keys.left.isDown || padLeft) dir = -1;
    if (this.cursors.right.isDown || this.keys.right.isDown || padRight) dir = 1;

    const speedBoost = time < this.activeEffects.speedUntil ? 1.3 : 1;
    let speed = this.runSpeed * speedBoost;

    // Dash (Shift / R1)
    const dashPressed = Phaser.Input.Keyboard.JustDown(this.keys.dash) || this.padJustDown(5);
    if (dashPressed && time > this.dashCooldownUntil && dir !== 0) {
      this.dashUntil = time + 180;
      this.dashCooldownUntil = time + 1200;
      beep(900, 0.05, 'square', 0.05);
    }
    const dashing = time < this.dashUntil;
    if (dashing) speed = 420;

    let vx = dir * speed;
    if (dashing && dir === 0) vx = this.player.facing * 420;
    this.player.body.setVelocityX(vx);
    if (vx !== 0) { this.player.facing = vx > 0 ? 1 : -1; this.player.scaleX = this.player.facing; }
    if (dashing && fxEnabled() && Math.floor(time / 30) !== Math.floor((time - delta) / 30)) {
      this.fxDust.explode(2, this.player.x, this.player.y + 6);
    }

    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.keys.jump) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      this.padJustDown(0); // A
    if (jumpPressed && onGround) {
      this.player.body.setVelocityY(-560);
      if (fxEnabled()) this.fxDust.explode(6, this.player.x, this.player.y + 24);
      if (typeof addStat === 'function') addStat('jumps');
      beep(600, 0.06, 'square', 0.06);
    }

    if (onGround && !this.wasOnGround && this.prevVY > 300) {
      if (fxEnabled()) this.fxDust.explode(10, this.player.x, this.player.y + 24);
    }

    if (onGround && vx !== 0) {
      const t = Math.floor(time / 120) % 2;
      this.player.legL.y = t === 0 ? 22 : 18;
      this.player.legR.y = t === 0 ? 18 : 22;
      this.player.armF.y = t === 0 ? 6 : 2;
      this.player.armB.y = t === 0 ? 2 : 6;
    } else {
      this.player.legL.y = 20; this.player.legR.y = 20;
      this.player.armF.y = 4; this.player.armB.y = 4;
    }

    if (onGround) { this.lastSafeX = this.player.x; this.lastSafeY = this.player.y - 4; }

    this.sellJustPressed = Phaser.Input.Keyboard.JustDown(this.keys.sell) || this.padJustDown(2); // X
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    // Tutorial: ab einer bestimmten Stelle wird der Koffer zur Schrotflinte
    if (!this.gunfightActive && this.level.gunfightFromX && this.player.x > this.level.gunfightFromX) {
      this.gunfightActive = true;
      this.equipShotgun();
      beep(400, 0.15, 'square', 0.07);
      this.floatText(this.player.x, this.player.y - 40, 'SCHROTFLINTE! E = SCHIESSEN', '#ffe94a');
    }
    if (this.gunfightActive && this.sellJustPressed) this.shootBullet();

    // Auren-Position/Sichtbarkeit
    this.speedAura.setPosition(this.player.x, this.player.y);
    this.shieldAura.setPosition(this.player.x, this.player.y);
    this.speedAura.setAlpha(time < this.activeEffects.speedUntil ? 0.18 : 0);
    this.shieldAura.setAlpha(this.activeEffects.shield ? 0.22 : 0);

    // Combo-Timer
    if (this.comboTimer > 0) { this.comboTimer -= dt; if (this.comboTimer <= 0) this.comboCount = 0; }

    this.updateNpcs();
    this.updateContracts();
    this.updateCoins();
    this.updatePowerups(time);
    this.updateCheckpoints();
    this.applyMagnet(time);
    this.updateEnemiesPatrol(dt, time);
    this.updateMovingPlatforms();
    this.updateToggleBarriers(dt);
    this.updateBoss(dt);
    this.cleanupProjectiles();

    if (this.player.y > 680) this.handleFall();

    if (!this.gateOpen && this.salesCount >= this.level.requiredSales) this.openGate();

    if (this.level.hasBoss) this.checkArenaLock();

    if (this.gateOpen) {
      const bossOk = !this.level.hasBoss || (this.boss && this.boss.hits >= this.boss.hitsNeeded);
      if (bossOk && Math.abs(this.player.x - this.level.flagX) < 40) this.completeLevel();
    }

    if (this.invulnTimer > 0) {
      this.invulnTimer -= dt;
      this.player.setAlpha(Math.floor(time / 80) % 2 === 0 ? 0.3 : 1);
    } else {
      this.player.setAlpha(1);
    }

    this.wasOnGround = onGround;
    this.prevVY = this.player.body.velocity.y;

    this.refreshHud(time);
  }

  updateNpcs() {
    let nearest = null, nearestDist = Infinity;
    this.npcList.forEach(npc => {
      npc.prompt.setVisible(false);
      if (npc.sold) return;
      const dx = Math.abs(this.player.x - npc.x), dy = Math.abs(this.player.y - npc.y);
      if (dx < this.sellRadius && dy < 70 && dx < nearestDist) { nearestDist = dx; nearest = npc; }
    });
    if (nearest) {
      nearest.prompt.setVisible(true);
      if (this.sellJustPressed) this.sellNpc(nearest);
    }
  }

  updateContracts() {
    this.contractList.forEach(ct => {
      if (ct.collected) return;
      const dx = Math.abs(this.player.x - ct.x), dy = Math.abs(this.player.y - ct.y);
      if (dx < 24 && dy < 28) this.collectContract(ct);
    });
  }

  updateCoins() {
    this.coinList.forEach(co => {
      if (co.collected) return;
      const dx = Math.abs(this.player.x - co.x), dy = Math.abs(this.player.y - co.y);
      if (dx < 22 && dy < 24) this.collectCoin(co);
    });
  }

  collectCoin(co) {
    co.collected = true;
    co.setVisible(false);
    GameState.money += 25;
    if (typeof addStat === 'function') { addStat('coins'); addStat('totalMoney', 25); }
    if (fxEnabled()) this.fxGold.explode(6, co.x, co.y);
    beep(1200, 0.05, 'square', 0.05);
    this.floatText(co.x, co.y - 16, '+$25', '#ffe94a');
  }

  updatePowerups(time) {
    this.powerupList.forEach(pu => {
      if (pu.collected) return;
      const dx = Math.abs(this.player.x - pu.x), dy = Math.abs(this.player.y - pu.y);
      if (dx < 26 && dy < 30) this.collectPowerup(pu, time);
    });
  }

  collectPowerup(pu, time) {
    pu.collected = true;
    pu.setVisible(false);
    beep(1046, 0.12, 'square', 0.06);
    if (pu.kind === 'coffee') {
      this.activeEffects.speedUntil = time + 8000;
      this.floatText(pu.x, pu.y - 20, '☕ SPEED!', '#ffa040');
    } else if (pu.kind === 'shield') {
      this.activeEffects.shield = true;
      this.floatText(pu.x, pu.y - 20, '🧳 SCHILD!', '#00fff2');
    } else {
      this.activeEffects.magnetUntil = time + 6000;
      this.floatText(pu.x, pu.y - 20, '🧲 MAGNET!', '#ff5555');
    }
  }

  updateCheckpoints() {
    this.checkpointList.forEach(cp => {
      if (cp.activated) return;
      if (Math.abs(this.player.x - cp.x) < 30) {
        cp.activated = true;
        cp.flag.fillColor = 0x39ff88;
        cp.flag.setFillStyle(0x39ff88);
        this.respawnPoint = { x: cp.x, y: GROUND_Y - 30 };
        beep(700, 0.1, 'square', 0.06);
        this.floatText(cp.x, GROUND_Y - 90, 'CHECKPOINT!', '#39ff88');
      }
    });
  }

  applyMagnet(time) {
    // Power-Up zählt wie Magnet-Stufe 1, das Upgrade zieht pro Stufe weiter und stärker
    const lvl = Math.max(this.magnetLevel, time < this.activeEffects.magnetUntil ? 1 : 0);
    if (lvl <= 0) return;
    const radius = 90 + 30 * lvl;
    const kraft = 0.09 + 0.03 * lvl;
    const pull = (obj) => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
      if (d < radius && d > 4) { obj.x += (this.player.x - obj.x) * kraft; obj.y += (this.player.y - obj.y) * kraft; }
    };
    this.contractList.forEach(ct => { if (!ct.collected) pull(ct); });
    this.coinList.forEach(co => { if (!co.collected) pull(co); });
  }

  updateEnemiesPatrol(dt, time) {
    this.enemiesGroup.getChildren().forEach(en => {
      if (en.isDrone) {
        if (en.x <= en.minX) en.body.setVelocityX(en.speed);
        else if (en.x >= en.maxX) en.body.setVelocityX(-en.speed);
        en.y = en.baseY + Math.sin(time / 400 + en.phase) * en.amplitude;
      } else if (en.isThrower) {
        en.throwTimer -= dt;
        if (en.throwTimer <= 0) {
          en.throwTimer = 2.5;
          if (Math.abs(this.player.x - en.x) < 520) this.throwerAttack(en);
        }
      } else {
        if (en.x <= en.minX) en.body.setVelocityX(en.speed);
        else if (en.x >= en.maxX) en.body.setVelocityX(-en.speed);
      }
    });
  }

  throwerAttack(en) {
    const dx = this.player.x - en.x, dy = this.player.y - en.y;
    const g = 900;
    const T = Phaser.Math.Clamp(Math.abs(dx) / 300, 0.6, 1.2);
    const vx = dx / T;
    const vy = (dy - 0.5 * g * T * T) / T;
    const proj = this.add.rectangle(en.x, en.y - 10, 16, 12, 0xe8e0c0);
    proj.setStrokeStyle(1, 0x8a7a5a);
    this.physics.add.existing(proj);
    this.enemyProjectiles.add(proj);
    proj.body.setAllowGravity(true);
    proj.body.setVelocity(vx, vy);
    beep(240, 0.08, 'sawtooth', 0.05);
  }

  updateMovingPlatforms() {
    this.movingPlatformList.forEach(mp => {
      if (mp.axis === 'x') {
        if (mp.x <= mp.minPos) mp.body.setVelocityX(mp.speed);
        else if (mp.x >= mp.maxPos) mp.body.setVelocityX(-mp.speed);
        mp.deltaX = mp.x - mp.prevX; mp.deltaY = 0;
      } else {
        if (mp.y <= mp.minPos) mp.body.setVelocityY(mp.speed);
        else if (mp.y >= mp.maxPos) mp.body.setVelocityY(-mp.speed);
        mp.deltaY = mp.y - mp.prevY; mp.deltaX = 0;
      }
      mp.prevX = mp.x; mp.prevY = mp.y;
    });
  }

  updateToggleBarriers(dt) {
    this.toggleBarrierList.forEach(b => {
      b.timer -= dt;
      if (b.timer <= 0) {
        b.on = !b.on;
        b.timer = b.on ? b.onTime : b.offTime;
        b.body.enable = b.on;
        b.setAlpha(b.on ? 1 : 0.25);
      }
    });
  }

  updateBoss(dt) {
    if (!this.level.hasBoss || !this.boss) return;
    if (this.boss.gunfightStyle) { this.updateGunfightBoss(dt); return; }
    if (this.boss.state === 'DORMANT') {
      if (this.gateOpen && this.player.x > this.level.gateX) {
        this.boss.state = 'IDLE'; this.boss.stateTimer = 1.0;
      }
      return;
    }
    if (this.boss.state === 'DEFEATED') return;

    if (this.level.bossChase) {
      if (this.boss.state === 'IDLE' || this.boss.state === 'TELEGRAPH') this.updateBossFlee(dt);
      else this.boss.body.setVelocityX(0);
    }

    this.boss.stateTimer -= dt;

    if (this.boss.state === 'IDLE') {
      if (this.boss.stateTimer <= 0) {
        this.boss.state = 'TELEGRAPH';
        this.boss.stateTimer = 0.5;
        this.telegraphMarker = this.add.circle(this.player.x, GROUND_Y - 2, 16, 0xff0000, 0.5);
      }
    } else if (this.boss.state === 'TELEGRAPH') {
      if (this.boss.stateTimer <= 0) {
        const tx = this.telegraphMarker ? this.telegraphMarker.x : this.boss.x;
        if (this.telegraphMarker) { this.telegraphMarker.destroy(); this.telegraphMarker = null; }
        const proj = this.add.rectangle(tx, -30, 22, 22, this.boss.defColor);
        proj.setStrokeStyle(2, 0xffffff, 0.35);
        this.physics.add.existing(proj);
        this.bossProjectiles.add(proj);
        proj.body.setAllowGravity(true);
        proj.body.setVelocityY(420 * this.diff.bossSpeedMult);
        beep(300, 0.1, 'sawtooth', 0.06);
        this.boss.attacksInCycle++;
        if (this.boss.attacksInCycle >= 3) {
          this.boss.attacksInCycle = 0;
          this.boss.state = 'VULNERABLE';
          this.boss.stateTimer = 2.2;
          this.bossContract = createContract(this, { x: this.boss.x, y: this.boss.y - 70, value: 0 });
        } else {
          this.boss.state = 'IDLE';
          this.boss.stateTimer = 0.9 / this.diff.bossSpeedMult;
        }
      }
    } else if (this.boss.state === 'VULNERABLE') {
      if (this.bossContract) {
        const dx = Math.abs(this.player.x - this.bossContract.x), dy = Math.abs(this.player.y - this.bossContract.y);
        if (dx < 30 && dy < 40 && this.sellJustPressed) {
          if (fxEnabled()) this.fxPink.explode(14, this.bossContract.x, this.bossContract.y);
          this.bossContract.destroy(); this.bossContract = null;
          this.boss.hits++;
          if (shakeEnabled()) this.cameras.main.shake(90, 0.006);
          beep(1000, 0.1, 'square', 0.07);
          this.floatText(this.boss.x, this.boss.y - 90, `TREFFER! ${this.boss.hits}/${this.boss.hitsNeeded}`, '#39ff88');
          this.boss.bodyRect.setFillStyle(0xffffff);
          this.time.delayedCall(120, () => { if (this.boss && this.boss.bodyRect) this.boss.bodyRect.setFillStyle(this.boss.defColor); });
          if (this.boss.hits >= this.boss.hitsNeeded) { this.defeatBoss(); return; }
          this.boss.state = 'IDLE'; this.boss.stateTimer = 1.0;
        }
      }
      if (this.boss.stateTimer <= 0) {
        if (this.bossContract) { this.bossContract.destroy(); this.bossContract = null; }
        this.boss.state = 'IDLE'; this.boss.stateTimer = 1.0;
      }
    }
  }

  updateBossFlee(dt) {
    const minX = this.level.gateX + 80;
    const maxX = this.level.flagX - 60;
    let dir = this.player.x < this.boss.x ? 1 : -1; // vom Spieler weg
    // An der Wand nicht in den Spieler zurücklaufen, sondern stehenbleiben (kein Gezappel)
    if (dir < 0 && this.boss.x <= minX) dir = 0;
    if (dir > 0 && this.boss.x >= maxX) dir = 0;
    this.boss.body.setVelocityX(dir * 78);
  }

  defeatBoss() {
    this.boss.state = 'DEFEATED';
    this.boss.body.enable = false;
    if (typeof addStat === 'function') addStat('bossKills');
    beep(150, 0.4, 'sawtooth', 0.1);
    if (shakeEnabled()) {
      this.cameras.main.shake(350, 0.012);
      this.cameras.main.flash(250, 255, 47, 208);
    }
    if (fxEnabled()) this.fxGold.explode(40, this.boss.x, this.boss.y);
    this.tweens.add({ targets: this.boss, alpha: 0, scale: 0.5, duration: 500 });
    this.unlockArena();

    // Tutorial: nach Boss 1 folgt Boss 2 (Schrotflinten-Übung)
    if (this.boss2Def && !this.boss2Spawned) {
      this.boss2Spawned = true;
      this.floatText(this.boss.x, this.boss.y - 110, 'GESCHAFFT! Weiter nach rechts →', '#39ff88');
      this.time.delayedCall(700, () => {
        if (this.levelComplete) return;
        this.boss = this.spawnBoss(this.boss2Def, true);
        this.boss.state = 'DORMANT';
        this.floatText(this.boss.x, this.boss.y - 110, 'BOSS 2!', '#ff2fd0');
      });
      return;
    }

    this.floatText(this.boss.x, this.boss.y - 110, 'AUSGANG OFFEN!', '#39ff88');
  }

  updateGunfightBoss(dt) {
    if (this.boss.state === 'DORMANT') {
      if (this.gateOpen && this.player.x > this.level.gateX) {
        this.boss.state = 'IDLE'; this.boss.stateTimer = 0.8;
      }
      return;
    }
    if (this.boss.state === 'DEFEATED') return;

    this.updateBossHopping(dt);

    // Sicherheitsnetz: niemals unter den Boden durchsacken
    if (this.boss.y > GROUND_Y - 36) {
      this.boss.y = GROUND_Y - 40;
      if (this.boss.body.velocity.y > 0) this.boss.body.setVelocityY(0);
    }

    this.boss.stateTimer -= dt;

    if (this.boss.state === 'IDLE') {
      if (this.boss.stateTimer <= 0) {
        this.boss.state = 'FIRE';
        this.boss.stateTimer = 0.25;
        this.boss.attackCount = (this.boss.attackCount || 0) + 1;
        const angle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
        const speed = 560 * this.diff.bossSpeedMult;
        const isBurst = this.boss.attackCount % 3 === 0;
        const angles = isBurst ? [angle - 0.3, angle, angle + 0.3] : [angle];
        angles.forEach(a => {
          const bullet = this.add.rectangle(this.boss.x + Math.cos(a) * 45, this.boss.y + Math.sin(a) * 45, 18, 7, 0xffe94a);
          bullet.rotation = a;
          bullet.setStrokeStyle(2, 0xfff6b0, 0.9);
          this.physics.add.existing(bullet);
          this.bossProjectiles.add(bullet);
          bullet.body.setAllowGravity(false);
          bullet.body.setVelocity(Math.cos(a) * speed, Math.sin(a) * speed);
        });
        const bossFlash = this.add.circle(this.boss.x + Math.cos(angle) * 50, this.boss.y + Math.sin(angle) * 50, 7, 0xfff3a0, 0.9).setDepth(66);
        this.tweens.add({ targets: bossFlash, alpha: 0, scale: 2.2, duration: 120, onComplete: () => bossFlash.destroy() });
        beep(200, 0.08, 'sawtooth', 0.07);
      }
    } else if (this.boss.state === 'FIRE') {
      if (this.boss.stateTimer <= 0) {
        this.boss.state = 'IDLE';
        this.boss.stateTimer = Phaser.Math.FloatBetween(0.4, 0.7) / this.diff.bossSpeedMult;
      }
    }
  }

  updateBossHopping(dt) {
    const onGround = this.boss.body.blocked.down || this.boss.body.touching.down;
    this.boss.hopTimer -= dt;

    if (!onGround) { this.boss.airborne = true; return; }

    if (this.boss.airborne) {
      this.boss.body.setVelocityX(0);
      this.boss.airborne = false;
    }

    if (this.boss.hopTimer <= 0) {
      const perches = this.level.bossPerches || [{ x: this.boss.x, y: this.boss.y }];
      const others = perches.filter(p => Math.abs(p.x - this.boss.x) > 20);
      const target = others.length ? others[Math.floor(Math.random() * others.length)] : perches[0];
      const dx = target.x - this.boss.x;
      const dy = target.y - this.boss.y;
      const g = 900;
      const T = Phaser.Math.Clamp(Math.abs(dx) / 260, 0.5, 1.3);
      const vx = dx / T;
      const vy = (dy - 0.5 * g * T * T) / T;
      this.boss.body.setVelocityX(vx);
      this.boss.body.setVelocityY(vy);
      this.boss.hopTimer = Phaser.Math.FloatBetween(1.4, 2.4);
      this.boss.airborne = true;
      beep(250, 0.1, 'square', 0.05);
    }
  }

  shootBullet() {
    if (this.shootCooldown > 0) return;
    this.shootCooldown = this.shootCd;
    const dir = this.player.facing;
    const bullet = this.add.rectangle(this.player.x + dir * 20, this.player.y - 2, 14, 6, 0x39ff88);
    bullet.setStrokeStyle(2, 0xd6ffe6, 0.9);
    this.physics.add.existing(bullet);
    this.playerBullets.add(bullet);
    bullet.body.setAllowGravity(false);
    bullet.body.setVelocityX(dir * 480);
    const flash = this.add.circle(this.player.x + dir * 28, this.player.y - 2, 6, 0xfff3a0, 0.9).setDepth(66);
    this.tweens.add({ targets: flash, alpha: 0, scale: 2.2, duration: 110, onComplete: () => flash.destroy() });
    beep(700, 0.05, 'square', 0.05);
  }

  onPlayerBulletHitBoss(bullet) {
    bullet.destroy();
    if (!this.boss || this.boss.state === 'DEFEATED' || this.boss.state === 'DORMANT') return;
    this.boss.hits++;
    if (fxEnabled()) this.fxPink.explode(10, this.boss.x, this.boss.y - 10);
    if (shakeEnabled()) this.cameras.main.shake(80, 0.005);
    beep(950, 0.08, 'square', 0.06);
    this.floatText(this.boss.x, this.boss.y - 90, `TREFFER! ${this.boss.hits}/${this.boss.hitsNeeded}`, '#39ff88');
    this.boss.bodyRect.setFillStyle(0xffffff);
    this.time.delayedCall(100, () => { if (this.boss && this.boss.bodyRect) this.boss.bodyRect.setFillStyle(this.boss.defColor); });
    if (this.boss.hits >= this.boss.hitsNeeded) this.defeatBoss();
  }

  cleanupProjectiles() {
    const clean = group => {
      const arr = group.getChildren().slice();
      arr.forEach(p => { if (p.y > 650 || p.y < -100 || p.x < -60 || p.x > this.level.worldWidth + 60) p.destroy(); });
    };
    clean(this.bossProjectiles);
    clean(this.enemyProjectiles);
    clean(this.playerBullets);
  }

  comboMultiplier() { return Math.min(this.comboCount, 5); }

  sellNpc(npc) {
    npc.sold = true;
    npc.setVisible(false);
    this.salesCount++;
    this.comboCount++; this.comboTimer = 5;
    const mult = this.comboMultiplier();
    const gain = npc.value * mult;
    GameState.money += gain;
    if (typeof addStat === 'function') { addStat('sales'); addStat('totalMoney', gain); }
    this.checkAllCollected();
    if (fxEnabled()) this.fxGold.explode(16, npc.x, npc.y - 10);
    beep(880 + this.comboCount * 60, 0.12, 'square', 0.07);
    this.floatText(npc.x, npc.y - 40, mult > 1 ? `+$${gain} (x${mult})` : `VERKAUFT! +$${gain}`, '#39ff88');
  }

  collectContract(ct) {
    ct.collected = true;
    ct.setVisible(false);
    this.salesCount++;
    this.comboCount++; this.comboTimer = 5;
    const mult = this.comboMultiplier();
    const gain = ct.value * mult;
    GameState.money += gain;
    if (typeof addStat === 'function') { addStat('sales'); addStat('totalMoney', gain); }
    this.checkAllCollected();
    if (fxEnabled()) this.fxGold.explode(12, ct.x, ct.y);
    beep(820 + this.comboCount * 60, 0.08, 'square', 0.05);
    this.floatText(ct.x, ct.y - 20, mult > 1 ? `+$${gain} (x${mult})` : `+$${gain}`, '#ffe94a');
  }

  checkAllCollected() {
    if (this.bossRush) return;
    const soldAll = this.npcList.every(n => n.sold) && this.contractList.every(c => c.collected);
    if (soldAll && this.totalCollectibles > 0 && typeof unlockAchievement === 'function') {
      unlockAchievement(this, 'alles');
    }
  }

  floatText(x, y, text, color) {
    const t = this.add.text(x, y, text, {
      fontSize: '14px', color, fontFamily: 'monospace', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(90);
    t.setShadow(0, 0, color, 8, true, true);
    this.tweens.add({ targets: t, y: y - 46, alpha: 0, duration: 950, onComplete: () => t.destroy() });
  }

  onHazardHit(source) {
    if (this.invulnTimer > 0) return;
    if (window.CHEATS && window.CHEATS.invincible) {
      if (source.body) source.destroy();
      return;
    }
    // Schild fängt einen Treffer ab (kein Lebensverlust)
    if (this.activeEffects.shield) {
      this.activeEffects.shield = false;
      this.invulnTimer = 1.0 * this.diff.invulnMult;
      if (fxEnabled()) this.fxHit.explode(8, this.player.x, this.player.y);
      beep(300, 0.12, 'square', 0.06);
      this.floatText(this.player.x, this.player.y - 30, 'SCHILD!', '#00fff2');
      if (source.body) source.destroy();
      return;
    }
    GameState.lives--;
    this.tookDamage = true;
    this.invulnTimer = 1.4 * this.diff.invulnMult;
    const dir = this.player.x < source.x ? -1 : 1;
    this.player.body.setVelocity(dir * 220, -320);
    if (shakeEnabled()) this.cameras.main.shake(140, 0.008);
    if (fxEnabled()) this.fxHit.explode(10, this.player.x, this.player.y);
    beep(120, 0.2, 'sawtooth', 0.08);
    if (source.body) source.destroy();
    if (GameState.lives <= 0) this.endLevelFail();
  }

  handleFall() {
    if (window.CHEATS && window.CHEATS.invincible) {
      this.respawnPlayer();
      return;
    }
    GameState.lives--;
    this.tookDamage = true;
    if (typeof addStat === 'function') addStat('deaths');
    if (GameState.lives <= 0) { this.endLevelFail(); return; }
    this.respawnPlayer();
    this.invulnTimer = 1.0 * this.diff.invulnMult;
    beep(150, 0.2, 'sawtooth', 0.07);
  }

  respawnPlayer() {
    const rp = this.respawnPoint || { x: this.lastSafeX, y: this.lastSafeY };
    this.player.setPosition(rp.x, rp.y);
    this.player.body.setVelocity(0, 0);
  }

  openGate() {
    this.gateOpen = true;
    this.gate.destroy();
    if (this.gateLabel) this.gateLabel.destroy();
    beep(700, 0.15, 'square', 0.08);
    this.floatText(this.level.gateX, GROUND_Y - 160, 'WEG FREI!', '#39ff88');
  }

  checkArenaLock() {
    if (this.arenaLocked || !this.gateOpen) return;
    if (this.boss && this.boss.state === 'DEFEATED') return;
    if (this.player.x > this.level.gateX + 40) this.lockArena();
  }

  lockArena() {
    this.arenaLocked = true;
    this.lockWall = this.add.rectangle(this.level.gateX, GROUND_Y - 100, 14, 200, 0xff2fd0, 0.85);
    this.physics.add.existing(this.lockWall, true);
    this.physics.add.collider(this.player, this.lockWall);
    this.tweens.add({ targets: this.lockWall, alpha: { from: 0.55, to: 0.95 }, yoyo: true, repeat: -1, duration: 500 });
    this.lockWallLabel = this.add.text(this.level.gateX - 60, GROUND_Y - 210, 'VERRIEGELT!', {
      fontSize: '11px', color: '#ff2fd0', fontFamily: 'monospace'
    });
    this.lockWallLabel.setShadow(0, 0, '#ff2fd0', 6, true, true);
    if (shakeEnabled()) this.cameras.main.shake(200, 0.006);
    beep(150, 0.2, 'sawtooth', 0.09);
    this.floatText(this.level.gateX, GROUND_Y - 250, 'Kein Zurück mehr!', '#ff2fd0');
  }

  unlockArena() {
    if (this.lockWall) { this.lockWall.destroy(); this.lockWall = null; }
    if (this.lockWallLabel) { this.lockWallLabel.destroy(); this.lockWallLabel = null; }
  }

  awardOutcome() {
    // Wallet, Bestzeit, Achievements
    const earned = GameState.money - (GameState.levelStartMoney || 0);
    if (earned > 0 && typeof addWallet === 'function') addWallet(earned);
    const secs = (this.time.now - this.levelStartTime) / 1000;
    if (typeof recordBestTime === 'function') recordBestTime(this.level.id, secs);
    if (typeof saveStats === 'function') saveStats();
    if (typeof unlockAchievement === 'function') {
      if (!this.tookDamage) unlockAchievement(this, 'sauber');
      if (secs < 60) unlockAchievement(this, 'flott');
      if (this.diff.key === 'brutal' || (this.diff.lives === 1 && this.diff.bossHitsMult >= 1.6)) unlockAchievement(this, 'brutalo');
      if ((STATS.totalMoney || 0) >= 10000) unlockAchievement(this, 'reich');
    }
  }

  completeLevel() {
    if (this.levelComplete) return;
    this.levelComplete = true;
    this.player.body.setVelocity(0, 0);
    if (typeof stopMusic === 'function') stopMusic();

    // Tutorial: kein Fortschritt/Konto, zurück ins Hauptmenü
    if (this.isTutorial) {
      if (typeof fanfare === 'function') fanfare();
      this.scene.start('MenuScene');
      return;
    }

    // Boss-Rush: nächster Boss oder Sieg
    if (this.bossRush) {
      const seq = BOSS_RUSH_SEQ;
      const nextStep = this.bossRush.step + 1;
      this.bossRush.lives = GameState.lives;
      if (nextStep < seq.length) {
        this.scene.start('PlayScene', {
          levelIndex: seq[nextStep],
          bossRush: { step: nextStep, lives: GameState.lives, maxLives: this.maxLives, startTime: this.bossRush.startTime }
        });
      } else {
        if (typeof unlockAchievement === 'function') unlockAchievement(null, 'rushfertig');
        const rushTime = (performance.now() - this.bossRush.startTime) / 1000;
        this.scene.start('WinScene', { rushTime });
      }
      return;
    }

    this.awardOutcome();
    if (typeof unlockLevel === 'function') unlockLevel(this.levelIndex + 1);

    if (this.level.finalLevel) {
      if (typeof unlockAchievement === 'function') unlockAchievement(null, 'durch');
      this.scene.start('WinScene');
    } else {
      this.scene.start('LevelCompleteScene', { levelIndex: this.levelIndex });
    }
  }

  endLevelFail() {
    if (this.levelComplete) return;
    this.levelComplete = true;
    if (typeof addStat === 'function') { addStat('deaths'); saveStats(); }
    this.player.body.setVelocity(0, 0);
    if (typeof stopMusic === 'function') stopMusic();
    this.scene.start('GameOverScene', { levelIndex: this.levelIndex });
  }

  refreshHud(time) {
    this.hudMoney.setText(`KOHLE: $${GameState.money}`);
    const livesClamped = Phaser.Math.Clamp(GameState.lives, 0, this.maxLives);
    this.hudLives.setText(`NERVEN: ${'♥'.repeat(livesClamped)}${'♡'.repeat(this.maxLives - livesClamped)}`);
    if (!this.gateOpen) {
      this.hudObjective.setText(`Verkäufe: ${this.salesCount}/${this.level.requiredSales}`);
    } else if (this.level.hasBoss && this.boss && this.boss.state !== 'DEFEATED' && this.boss.hits < this.boss.hitsNeeded) {
      const hitsClamped = Phaser.Math.Clamp(this.boss.hits, 0, this.boss.hitsNeeded);
      const bossName = (this.boss.defName || this.level.boss.name);
      this.hudObjective.setText(`${bossName}: ${'●'.repeat(hitsClamped)}${'○'.repeat(this.boss.hitsNeeded - hitsClamped)}`);
    } else {
      this.hudObjective.setText(this.level.exitStyle === 'jet' ? 'ZUM JET!' : 'ZUM AUSGANG!');
    }
    // Combo
    if (this.comboCount >= 2) {
      this.hudCombo.setText(`COMBO x${this.comboMultiplier()}  ${this.comboTimer.toFixed(1)}s`);
    } else {
      this.hudCombo.setText('');
    }
    // Effekte
    const eff = [];
    if (time !== undefined) {
      if (time < this.activeEffects.speedUntil) eff.push(`☕${Math.ceil((this.activeEffects.speedUntil - time) / 1000)}s`);
      if (this.activeEffects.shield) eff.push('🧳');
      if (time < this.activeEffects.magnetUntil) eff.push(`🧲${Math.ceil((this.activeEffects.magnetUntil - time) / 1000)}s`);
    }
    this.hudEffects.setText(eff.join('  '));
  }
}
