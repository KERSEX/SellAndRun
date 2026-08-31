const GROUND_Y = 560; // Oberkante des Bodens

const LEVELS = [
  // ---------------- LEVEL 1: BÜRO ----------------
  {
    id: 1, name: 'BÜRO',
    intro: 'Verkauf deinen Kollegen den letzten Mist,\nbevor der Chef persönlich vorbeikommt.',
    worldWidth: 3100,
    bgTop: 0x0a1420, bgBottom: 0x2c6e8a,
    floorGaps: [[1300, 1380], [2200, 2290]],
    platforms: [
      { x: 280, y: 460, w: 140, h: 20, color: 0x8a7a5a },
      { x: 520, y: 380, w: 120, h: 20, color: 0x8a7a5a },
      { x: 760, y: 460, w: 140, h: 20, color: 0x8a7a5a },
      { x: 1000, y: 340, w: 120, h: 20, color: 0x8a7a5a },
      { x: 1340, y: 430, w: 100, h: 20, color: 0x8a7a5a },
      { x: 1500, y: 460, w: 150, h: 20, color: 0x8a7a5a },
      { x: 1800, y: 380, w: 120, h: 20, color: 0x8a7a5a },
      { x: 2050, y: 460, w: 130, h: 20, color: 0x8a7a5a },
      { x: 2245, y: 420, w: 90, h: 20, color: 0x8a7a5a },
      { x: 2440, y: 380, w: 120, h: 20, color: 0x8a7a5a }
    ],
    movingPlatforms: [],
    toggleBarriers: [],
    npcs: [
      { x: 400, y: GROUND_Y - 23, value: 300 },
      { x: 900, y: GROUND_Y - 23, value: 300 },
      { x: 1600, y: GROUND_Y - 23, value: 300 },
      { x: 1950, y: GROUND_Y - 23, value: 300 },
      { x: 2380, y: GROUND_Y - 23, value: 300 }
    ],
    contracts: [
      { x: 280, y: 420, value: 150 },
      { x: 520, y: 340, value: 150 },
      { x: 1000, y: 300, value: 200 },
      { x: 1500, y: 420, value: 150 },
      { x: 1800, y: 340, value: 200 },
      { x: 2245, y: 380, value: 200 },
      { x: 2440, y: 340, value: 200 }
    ],
    coins: [
      { x: 340, y: 430 }, { x: 460, y: 430 },
      { x: 1000, y: 300 }, { x: 1050, y: 300 },
      { x: 1340, y: 400 }, { x: 1340, y: 300 },
      { x: 1760, y: 350 }, { x: 1840, y: 350 },
      { x: 2245, y: 388 }, { x: 2440, y: 348 },
      { x: 700, y: 520 }, { x: 1180, y: 520 }, { x: 2000, y: 520 }
    ],
    powerups: [],
    checkpoints: [],
    enemies: [
      { x: 650, y: GROUND_Y - 21, range: 90, speed: 55 },
      { x: 1150, y: GROUND_Y - 21, range: 100, speed: 60 },
      { x: 1650, y: GROUND_Y - 21, range: 90, speed: 65 },
      { x: 2000, y: GROUND_Y - 21, range: 90, speed: 60 },
      { x: 2500, y: GROUND_Y - 21, range: 90, speed: 65 }
    ],
    spikes: [],
    enemyColors: { body: 0x33507a, head: 0xe0b98a, name: 'KOLLEGE' },
    gateX: 2680,
    requiredSales: 8,
    hasBoss: true,
    boss: { name: 'DER CHEF', color: 0x902020, hitsNeeded: 3, x: 2880, y: GROUND_Y - 40 },
    flagX: 2980,
    finalLevel: false
  },

  // ---------------- LEVEL 2: INNENSTADT ----------------
  {
    id: 2, name: 'INNENSTADT',
    intro: 'Kunden ohne Ende!\nNach dem letzten Deal heißt es nur noch: LAUFEN\nüber die Dächer.',
    worldWidth: 3700,
    bgTop: 0x1a0b2e, bgBottom: 0xff5da2,
    floorGaps: [[500, 600], [1050, 1140], [1700, 1790], [2500, 3450]],
    platforms: [
      { x: 300, y: 460, w: 120, h: 20, color: 0xe0a020 },
      { x: 560, y: 400, w: 110, h: 20, color: 0xe0a020 },
      { x: 820, y: 460, w: 130, h: 20, color: 0xe0a020 },
      { x: 1100, y: 400, w: 110, h: 20, color: 0xe0a020 },
      { x: 1400, y: 460, w: 140, h: 20, color: 0xe0a020 },
      { x: 1650, y: 380, w: 120, h: 20, color: 0xe0a020 },
      { x: 1745, y: 470, w: 100, h: 20, color: 0xe0a020 },
      { x: 2000, y: 440, w: 130, h: 20, color: 0xe0a020 },
      { x: 2260, y: 380, w: 120, h: 20, color: 0xe0a020 }
    ],
    movingPlatforms: [
      { x: 2560, y: 480, w: 90, h: 20, axis: 'y', range: 60, speed: 60, color: 0x795548 },
      { x: 2720, y: 420, w: 80, h: 20, axis: 'x', range: 70, speed: 80, color: 0x795548 },
      { x: 2900, y: 480, w: 80, h: 20, axis: 'y', range: 70, speed: 70, color: 0x795548 },
      { x: 3080, y: 420, w: 90, h: 20, axis: 'x', range: 80, speed: 90, color: 0x795548 },
      { x: 3260, y: 470, w: 100, h: 20, axis: 'y', range: 50, speed: 60, color: 0x795548 }
    ],
    toggleBarriers: [],
    npcs: [
      { x: 380, y: GROUND_Y - 23, value: 350 },
      { x: 900, y: GROUND_Y - 23, value: 350 },
      { x: 1450, y: GROUND_Y - 23, value: 350 },
      { x: 1900, y: GROUND_Y - 23, value: 350 },
      { x: 2150, y: GROUND_Y - 23, value: 350 },
      { x: 2350, y: GROUND_Y - 23, value: 350 }
    ],
    contracts: [
      { x: 300, y: 420, value: 150 },
      { x: 560, y: 360, value: 150 },
      { x: 1100, y: 360, value: 200 },
      { x: 1400, y: 420, value: 150 },
      { x: 1650, y: 340, value: 200 },
      { x: 2000, y: 400, value: 200 },
      { x: 2260, y: 340, value: 200 }
    ],
    coins: [
      { x: 550, y: 340 }, { x: 550, y: 300 },
      { x: 1090, y: 500 }, { x: 1400, y: 420 }, { x: 1470, y: 420 },
      { x: 1650, y: 340 }, { x: 2000, y: 400 }, { x: 2260, y: 340 },
      { x: 2560, y: 440 }, { x: 2720, y: 380 }, { x: 2900, y: 440 },
      { x: 3080, y: 380 }, { x: 3260, y: 430 },
      { x: 850, y: 520 }, { x: 1250, y: 520 }
    ],
    powerups: [
      { x: 1100, y: 360, kind: 'coffee' },
      { x: 2260, y: 340, kind: 'magnet' }
    ],
    checkpoints: [{ x: 1450 }, { x: 2150 }],
    enemies: [
      { x: 700, y: GROUND_Y - 21, range: 90, speed: 65 },
      { x: 950, y: GROUND_Y - 21, range: 80, speed: 70 },
      { x: 1250, y: GROUND_Y - 21, range: 90, speed: 70 },
      { x: 1550, y: GROUND_Y - 21, range: 90, speed: 75 },
      { x: 2100, y: GROUND_Y - 21, range: 90, speed: 70 },
      { x: 2380, y: GROUND_Y - 21, range: 80, speed: 75 }
    ],
    spikes: [
      { x: 1250, y: GROUND_Y - 9, w: 40, h: 18 },
      { x: 2050, y: GROUND_Y - 9, w: 40, h: 18 }
    ],
    enemyColors: { body: 0xd94a2b, head: 0xe0b98a, name: 'PASSANT' },
    gateX: 2500,
    requiredSales: 10,
    hasBoss: false,
    boss: null,
    flagX: 3620,
    finalLevel: false
  },

  // ---------------- LEVEL 3: MESSEHALLE ----------------
  {
    id: 3, name: 'MESSEHALLE',
    intro: 'Volle Halle, volle Auftragsbücher.\nVerkauf, was das Zeug hält – die Konkurrenz\nwartet schon am Ausgang.',
    worldWidth: 3500,
    bgTop: 0x2a0a10, bgBottom: 0xff8a3d,
    floorGaps: [[700, 780], [1400, 1470], [2250, 2340]],
    platforms: [
      { x: 300, y: 440, w: 130, h: 20, color: 0x3a7ab0 },
      { x: 560, y: 360, w: 110, h: 20, color: 0x3a7ab0 },
      { x: 950, y: 440, w: 140, h: 20, color: 0x3a7ab0 },
      { x: 1200, y: 340, w: 110, h: 20, color: 0x3a7ab0 },
      { x: 1600, y: 440, w: 140, h: 20, color: 0x3a7ab0 },
      { x: 1850, y: 360, w: 120, h: 20, color: 0x3a7ab0 },
      { x: 2100, y: 440, w: 130, h: 20, color: 0x3a7ab0 },
      { x: 2295, y: 420, w: 90, h: 20, color: 0x3a7ab0 },
      { x: 2500, y: 360, w: 120, h: 20, color: 0x3a7ab0 },
      { x: 2780, y: 440, w: 130, h: 20, color: 0x3a7ab0 }
    ],
    movingPlatforms: [
      { x: 2350, y: 500, w: 90, h: 18, axis: 'y', range: 50, speed: 70, color: 0x795548 }
    ],
    toggleBarriers: [],
    npcs: [
      { x: 380, y: GROUND_Y - 23, value: 400 },
      { x: 850, y: GROUND_Y - 23, value: 400 },
      { x: 1250, y: GROUND_Y - 23, value: 400 },
      { x: 1700, y: GROUND_Y - 23, value: 400 },
      { x: 1950, y: GROUND_Y - 23, value: 400 },
      { x: 2600, y: GROUND_Y - 23, value: 400 },
      { x: 2850, y: GROUND_Y - 23, value: 400 }
    ],
    contracts: [
      { x: 300, y: 400, value: 150 },
      { x: 560, y: 320, value: 200 },
      { x: 1200, y: 300, value: 200 },
      { x: 1600, y: 400, value: 150 },
      { x: 1850, y: 320, value: 200 },
      { x: 950, y: 400, value: 150 },
      { x: 2500, y: 320, value: 200 },
      { x: 2780, y: 400, value: 150 }
    ],
    coins: [
      { x: 560, y: 320 }, { x: 1200, y: 300 }, { x: 1250, y: 300 },
      { x: 1600, y: 400 }, { x: 1850, y: 320 }, { x: 2500, y: 320 },
      { x: 2780, y: 400 }, { x: 2295, y: 428 },
      { x: 740, y: 520 }, { x: 1435, y: 520 }, { x: 2295, y: 520 },
      { x: 500, y: 520 }, { x: 3050, y: 520 }
    ],
    powerups: [
      { x: 1200, y: 300, kind: 'shield' },
      { x: 2500, y: 320, kind: 'coffee' }
    ],
    checkpoints: [{ x: 1600 }],
    enemies: [
      { x: 500, y: GROUND_Y - 21, range: 80, speed: 70 },
      { x: 1050, y: GROUND_Y - 21, range: 90, speed: 75 },
      { x: 1550, y: GROUND_Y - 21, range: 90, speed: 80 },
      { x: 2650, y: GROUND_Y - 21, range: 70, speed: 80 },
      { type: 'drone', x: 900, y: 300, range: 130, speed: 70, amplitude: 45 },
      { type: 'drone', x: 1750, y: 300, range: 140, speed: 75, amplitude: 45 },
      { type: 'thrower', x: 2150, y: GROUND_Y - 24 }
    ],
    spikes: [
      { x: 1300, y: GROUND_Y - 9, w: 40, h: 18 },
      { x: 3000, y: GROUND_Y - 9, w: 40, h: 18 }
    ],
    enemyColors: { body: 0xd9702b, head: 0xe0b98a, name: 'RÄMPLER' },
    gateX: 3020,
    requiredSales: 12,
    hasBoss: true,
    boss: { name: 'DIE KONKURRENZ', color: 0x7a2ba0, hitsNeeded: 4, x: 3260, y: GROUND_Y - 40 },
    flagX: 3420,
    finalLevel: false
  },

  // ---------------- LEVEL 4: FLUGHAFEN ----------------
  {
    id: 4, name: 'FLUGHAFEN',
    intro: 'Steuerfahnder UND Ex-Kunden warten am Gate.\nDer Jet ist deine letzte Chance.',
    worldWidth: 3850,
    bgTop: 0x04060f, bgBottom: 0x1c3a6b,
    floorGaps: [[400, 470], [750, 830], [1100, 1180], [1500, 1600], [1950, 2050], [2500, 2590]],
    platforms: [
      { x: 300, y: 460, w: 110, h: 20, color: 0x8a8f9a },
      { x: 600, y: 400, w: 100, h: 20, color: 0x8a8f9a },
      { x: 900, y: 460, w: 110, h: 20, color: 0x8a8f9a },
      { x: 1300, y: 400, w: 110, h: 20, color: 0x8a8f9a },
      { x: 1750, y: 460, w: 120, h: 20, color: 0x8a8f9a },
      { x: 2250, y: 420, w: 120, h: 20, color: 0x8a8f9a },
      { x: 2700, y: 440, w: 130, h: 20, color: 0x8a8f9a }
    ],
    movingPlatforms: [
      { x: 435, y: 500, w: 80, h: 18, axis: 'y', range: 40, speed: 60, color: 0x555b6e },
      { x: 790, y: 500, w: 90, h: 18, axis: 'x', range: 60, speed: 90, color: 0x555b6e },
      { x: 1140, y: 500, w: 90, h: 18, axis: 'y', range: 50, speed: 70, color: 0x555b6e },
      { x: 1550, y: 500, w: 90, h: 18, axis: 'x', range: 70, speed: 100, color: 0x555b6e },
      { x: 2000, y: 500, w: 90, h: 18, axis: 'y', range: 60, speed: 80, color: 0x555b6e },
      { x: 2545, y: 500, w: 90, h: 18, axis: 'x', range: 70, speed: 95, color: 0x555b6e }
    ],
    toggleBarriers: [
      { x: 3150, y: GROUND_Y - 45, w: 20, h: 90, onTime: 1.3, offTime: 1.1, startOn: true },
      { x: 3300, y: GROUND_Y - 45, w: 20, h: 90, onTime: 1.1, offTime: 1.3, startOn: false }
    ],
    npcs: [
      { x: 300, y: GROUND_Y - 23, value: 500 },
      { x: 1300, y: GROUND_Y - 23, value: 500 },
      { x: 1750, y: GROUND_Y - 23, value: 500 },
      { x: 2250, y: GROUND_Y - 23, value: 500 },
      { x: 2700, y: GROUND_Y - 23, value: 500 }
    ],
    contracts: [
      { x: 300, y: 420, value: 200 },
      { x: 600, y: 360, value: 250 },
      { x: 900, y: 420, value: 200 },
      { x: 1300, y: 360, value: 250 },
      { x: 1750, y: 420, value: 200 },
      { x: 2250, y: 380, value: 250 },
      { x: 2700, y: 400, value: 200 }
    ],
    coins: [
      { x: 600, y: 360 }, { x: 1300, y: 360 }, { x: 1350, y: 360 },
      { x: 1750, y: 420 }, { x: 2250, y: 380 }, { x: 2700, y: 400 },
      { x: 435, y: 470 }, { x: 1140, y: 470 }, { x: 2000, y: 470 },
      { x: 1050, y: 520 }, { x: 1450, y: 520 }, { x: 2400, y: 520 }
    ],
    powerups: [
      { x: 1300, y: 360, kind: 'shield' },
      { x: 2250, y: 380, kind: 'coffee' },
      { x: 2700, y: 400, kind: 'magnet' }
    ],
    checkpoints: [{ x: 1300 }, { x: 2250 }],
    enemies: [
      { x: 950, y: GROUND_Y - 21, range: 80, speed: 90 },
      { x: 1350, y: GROUND_Y - 21, range: 70, speed: 90 },
      { x: 1800, y: GROUND_Y - 21, range: 80, speed: 95 },
      { x: 2320, y: GROUND_Y - 21, range: 70, speed: 95 },
      { x: 3225, y: GROUND_Y - 21, range: 55, speed: 100 },
      { type: 'drone', x: 700, y: 300, range: 140, speed: 85, amplitude: 50 },
      { type: 'drone', x: 2100, y: 300, range: 150, speed: 90, amplitude: 50 },
      { type: 'thrower', x: 1600, y: GROUND_Y - 24 }
    ],
    spikes: [
      { x: 3210, y: GROUND_Y - 9, w: 36, h: 18 },
      { x: 3360, y: GROUND_Y - 9, w: 36, h: 18 }
    ],
    enemyColors: { body: 0x555b6e, head: 0xe0b98a, name: 'KOFFERROLLER' },
    gateX: 3420,
    requiredSales: 9,
    hasBoss: true,
    boss: { name: 'STEUERFAHNDER', color: 0x3a4a7a, hitsNeeded: 5, x: 3630, y: GROUND_Y - 40 },
    bossChase: true,
    flagX: 3720,
    exitStyle: 'jet',
    finalLevel: false
  },

  // ---------------- LEVEL 5: IM FRACHTRAUM (Gunfight) ----------------
  {
    id: 5, name: 'IM FRACHTRAUM',
    intro: 'Der Steuerfahnder hat sich im Frachtraum des Jets versteckt.\nDein Koffer klickt auf – zum Vorschein kommt eine Schrotflinte.\nZeit für die letzte Verhandlung.',
    worldWidth: 1200,
    bgTop: 0x0a0f2e, bgBottom: 0xd9534f,
    floorGaps: [],
    platforms: [
      { x: 300, y: 480, w: 100, h: 20, color: 0x555b6e },
      { x: 460, y: 380, w: 100, h: 20, color: 0x555b6e },
      { x: 620, y: 480, w: 100, h: 20, color: 0x555b6e },
      { x: 780, y: 380, w: 100, h: 20, color: 0x555b6e },
      { x: 950, y: 470, w: 110, h: 20, color: 0x555b6e }
    ],
    movingPlatforms: [],
    toggleBarriers: [],
    npcs: [],
    contracts: [],
    coins: [],
    powerups: [],
    checkpoints: [],
    enemies: [],
    spikes: [],
    enemyColors: { body: 0x555b6e, head: 0xe0b98a, name: 'GEGNER' },
    gateX: 150,
    requiredSales: 0,
    hasBoss: true,
    boss: { name: 'STEUERFAHNDER – LETZTES GEFECHT', color: 0x3a4a7a, hitsNeeded: 9, x: 700, y: GROUND_Y - 40 },
    bossPerches: [
      { x: 220, y: GROUND_Y - 40 },
      { x: 300, y: 430 },
      { x: 460, y: 330 },
      { x: 620, y: 430 },
      { x: 700, y: GROUND_Y - 40 },
      { x: 780, y: 330 },
      { x: 950, y: 420 },
      { x: 1050, y: GROUND_Y - 40 }
    ],
    flagX: 1120,
    exitStyle: 'flag',
    isGunfight: true,
    finalLevel: false
  },

  // ---------------- LEVEL 6: STEUERPARADIES (Finale) ----------------
  {
    id: 6, name: 'STEUERPARADIES',
    intro: 'Sand, Sonne, Cocktails – und Interpol am Strand.\nEin letzter Deal trennt dich vom perfekten Ruhestand.\nHol die Schrotflinte raus.',
    worldWidth: 2900,
    bgTop: 0x0a2a4a, bgBottom: 0x2ac9c9,
    floorGaps: [[900, 1000], [1750, 1860]],
    platforms: [
      { x: 320, y: 460, w: 120, h: 20, color: 0x8a6a3a },
      { x: 580, y: 380, w: 110, h: 20, color: 0x8a6a3a },
      { x: 950, y: 470, w: 110, h: 20, color: 0x8a6a3a },
      { x: 1200, y: 380, w: 110, h: 20, color: 0x8a6a3a },
      { x: 1500, y: 440, w: 130, h: 20, color: 0x8a6a3a },
      { x: 1805, y: 470, w: 110, h: 20, color: 0x8a6a3a },
      { x: 2050, y: 380, w: 120, h: 20, color: 0x8a6a3a }
    ],
    movingPlatforms: [
      { x: 950, y: 500, w: 90, h: 18, axis: 'x', range: 60, speed: 80, color: 0x6a4a2a }
    ],
    toggleBarriers: [],
    npcs: [
      { x: 400, y: GROUND_Y - 23, value: 500 },
      { x: 750, y: GROUND_Y - 23, value: 500 },
      { x: 1350, y: GROUND_Y - 23, value: 500 },
      { x: 1650, y: GROUND_Y - 23, value: 500 }
    ],
    contracts: [
      { x: 320, y: 420, value: 200 },
      { x: 580, y: 340, value: 250 },
      { x: 1200, y: 340, value: 250 },
      { x: 1500, y: 400, value: 200 },
      { x: 2050, y: 340, value: 250 }
    ],
    coins: [
      { x: 580, y: 340 }, { x: 1200, y: 340 }, { x: 1250, y: 340 },
      { x: 1500, y: 400 }, { x: 2050, y: 340 },
      { x: 500, y: 520 }, { x: 1350, y: 520 }, { x: 2200, y: 520 }
    ],
    powerups: [
      { x: 580, y: 340, kind: 'shield' },
      { x: 1500, y: 400, kind: 'coffee' }
    ],
    checkpoints: [{ x: 1350 }],
    enemies: [
      { x: 650, y: GROUND_Y - 21, range: 90, speed: 85 },
      { x: 1420, y: GROUND_Y - 21, range: 90, speed: 90 },
      { type: 'drone', x: 1100, y: 300, range: 150, speed: 90, amplitude: 50 },
      { type: 'thrower', x: 1650, y: GROUND_Y - 24 }
    ],
    spikes: [
      { x: 1600, y: GROUND_Y - 9, w: 40, h: 18 }
    ],
    enemyColors: { body: 0x2a4a6a, head: 0xe0b98a, name: 'ANWALT' },
    gateX: 2150,
    requiredSales: 9,
    hasBoss: true,
    boss: { name: 'INTERPOL-AGENT', color: 0x1a3a8a, hitsNeeded: 10, x: 2400, y: GROUND_Y - 40 },
    bossPerches: [
      { x: 2230, y: GROUND_Y - 40 },
      { x: 2320, y: 440 },
      { x: 2450, y: 400 },
      { x: 2400, y: GROUND_Y - 40 },
      { x: 2560, y: 440 },
      { x: 2650, y: GROUND_Y - 40 }
    ],
    flagX: 2800,
    exitStyle: 'flag',
    isGunfight: true,
    finalLevel: true
  }
];

// ---------------- TUTORIAL-LEVEL (Übungsparcours, außerhalb der Story) ----------------
// Bewusst NICHT in LEVELS, damit Level-Nummern und Fortschritt unberührt bleiben.
const TUTORIAL_LEVEL = {
  id: 0, name: 'TRAINING', isTutorial: true,
  intro: 'Übungsparcours: Hier probierst du einmal alles aus.',
  // Jede Lern-Station hat ihren eigenen, großzügigen Abschnitt (~400–500px Abstand)
  worldWidth: 8800,
  fixedLives: 9,             // im Training viele Leben zum Ausprobieren
  bgTop: 0x0a1420, bgBottom: 0x2c6e8a,
  floorGaps: [[3230, 3320], [5100, 5300]],
  platforms: [
    { x: 760, y: 470, w: 130, h: 20, color: 0x8a7a5a },   // Sprung-Übung
    { x: 1820, y: 470, w: 140, h: 20, color: 0x8a7a5a },  // Vertrag
    { x: 4680, y: 520, w: 120, h: 20, color: 0x8a7a5a },  // Kaffee
    { x: 5630, y: 520, w: 120, h: 20, color: 0x8a7a5a },  // Schild
    { x: 6790, y: 520, w: 120, h: 20, color: 0x8a7a5a },  // Magnet
    { x: 8250, y: 470, w: 120, h: 20, color: 0x8a7a5a }   // Boss-2-Arena
  ],
  movingPlatforms: [
    { x: 7080, y: 480, w: 110, h: 20, axis: 'y', range: 55, speed: 60, color: 0x795548 }
  ],
  toggleBarriers: [
    { x: 7290, y: GROUND_Y - 45, w: 20, h: 90, onTime: 1.2, offTime: 1.4, startOn: true }
  ],
  npcs: [
    { x: 2340, y: GROUND_Y - 23, value: 300 },
    { x: 2780, y: GROUND_Y - 23, value: 300 }
  ],
  contracts: [
    { x: 1820, y: 430, value: 150 },
    { x: 2900, y: 500, value: 150 }
  ],
  coins: [
    { x: 760, y: 430 },
    { x: 1250, y: 520 }, { x: 1310, y: 520 }, { x: 1370, y: 520 },
    { x: 1310, y: 450 },
    { x: 3900, y: 470 },
    { x: 6850, y: 460 }, { x: 6910, y: 460 }, { x: 6970, y: 430 },
    { x: 7080, y: 420 }
  ],
  powerups: [
    { x: 4680, y: 480, kind: 'coffee' },
    { x: 5630, y: 480, kind: 'shield' },
    { x: 6790, y: 480, kind: 'magnet' }
  ],
  checkpoints: [{ x: 3500 }],
  enemies: [
    { x: 3900, y: GROUND_Y - 21, range: 70, speed: 50 },
    { type: 'drone', x: 6020, y: 330, range: 110, speed: 60, amplitude: 40 },
    { type: 'thrower', x: 6420, y: GROUND_Y - 24 }
  ],
  spikes: [
    { x: 4300, y: GROUND_Y - 9, w: 40, h: 18 }
  ],
  signs: [
    { x: 240, text: 'WILLKOMMEN IM TRAINING!\nLaufen: A / D · Stick / D-Pad  →' },
    { x: 700, text: 'SPRINGEN: W oder LEERTASTE\nXbox: A   ·   PlayStation: ✕ (Kreuz)' },
    { x: 1200, text: 'MÜNZEN: +$25\nEinfach drüberlaufen' },
    { x: 1750, text: 'VERTRÄGE ($) zählen\nals Verkauf – einsammeln!' },
    { x: 2250, text: 'KUNDE (?): hingehen, VERKAUFEN: E\nXbox: X   ·   PlayStation: □ (Viereck)' },
    { x: 2700, text: 'COMBO: schnell hintereinander\nverkaufen = mehr Kohle!' },
    { x: 3150, text: 'LOCH!\nDrüberspringen' },
    { x: 3500, text: 'CHECKPOINT: Ab hier geht es\nnach einem Sturz weiter' },
    { x: 3800, text: 'GEGNER: einfach\ndrüberspringen' },
    { x: 4200, text: 'STACHELN:\nnicht reintreten!' },
    { x: 4600, text: '☕ KAFFEE:\n8 Sekunden Speed-Boost' },
    { x: 5000, text: 'SPRINT (Dash): SHIFT\nXbox: RB   ·   PlayStation: R1' },
    { x: 5550, text: '🧳 SCHILD: fängt genau\neinen Treffer ab' },
    { x: 5900, text: 'DROHNE: fliegt in Wellen –\nabpassen und durchlaufen' },
    { x: 6300, text: 'WERFER: wirft Akten\nim Bogen – ausweichen!' },
    { x: 6700, text: '🧲 MAGNET: zieht Verträge\nund Münzen zu dir' },
    { x: 7080, y: 300, text: 'BEWEGLICHE PLATTFORM\nträgt dich mit' },
    { x: 7290, y: 200, text: 'SCHRANKE: blinkt an und aus\nTiming abpassen!' },
    { x: 7450, text: 'Genug verkauft? Tor auf!\nPAUSE: ESC · Xbox: START · PS: OPTIONS' },
    { x: 7750, y: 300, text: 'BOSS 1 – DER CHEF:\nWeich den Akten aus! Wenn der Vertrag\nblinkt: E drücken (Xbox X / PS □)' },
    { x: 8080, y: 210, text: 'Jetzt wird der Koffer zur SCHROTFLINTE:\nSCHIESSEN mit E (Xbox X / PS □)' },
    { x: 8420, y: 300, text: 'BOSS 2: einfach abschießen!\nDanach ab zum ZIEL →' }
  ],
  enemyColors: { body: 0x33507a, head: 0xe0b98a, name: 'TRAINER' },
  gateX: 7520,
  requiredSales: 4,
  gunfightFromX: 8000,
  hasBoss: true,
  // Boss 1: wie Level 1 (Akten ausweichen, Vertrag mit E treffen)
  boss: { name: 'DER CHEF (ÜBUNG)', color: 0x902020, hitsNeeded: 2, x: 7800, y: GROUND_Y - 40 },
  // Boss 2: erscheint nach Boss 1 – Schrotflinten-Übung
  boss2: { name: 'ÜBUNGS-BOSS', color: 0x557a55, hitsNeeded: 2, x: 8350, y: GROUND_Y - 40 },
  bossPerches: [
    { x: 8180, y: GROUND_Y - 40 },
    { x: 8250, y: 420 },
    { x: 8350, y: GROUND_Y - 40 },
    { x: 8480, y: GROUND_Y - 40 }
  ],
  flagX: 8680,
  exitStyle: 'flag',
  finalLevel: false
};
