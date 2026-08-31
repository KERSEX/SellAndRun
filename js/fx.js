// ---------- Grafik & Effekte: Texturen, Partikel, Parallax-Hintergruende ----------

function colorToCss(hex) { return '#' + hex.toString(16).padStart(6, '0'); }

function fxDarken(hex, f) {
  const r = ((hex >> 16) & 255) * f | 0, g = ((hex >> 8) & 255) * f | 0, b = (hex & 255) * f | 0;
  return (r << 16) | (g << 8) | b;
}

function fxRand(seed) {
  let s = seed > 0 ? seed : 1234;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

const FX_THEME = {
  1: { ground: '#08111c', groundLine: '#00fff2', groundLineSoft: 'rgba(0,255,242,0.25)' },
  2: { ground: '#0d0418', groundLine: '#ff2fd0', groundLineSoft: 'rgba(255,47,208,0.25)' },
  3: { ground: '#160806', groundLine: '#ffe94a', groundLineSoft: 'rgba(255,233,74,0.22)' },
  4: { ground: '#03040a', groundLine: '#8fd0ff', groundLineSoft: 'rgba(143,208,255,0.22)' },
  5: { ground: '#0c0e18', groundLine: '#ff5555', groundLineSoft: 'rgba(255,85,85,0.22)' },
  6: { ground: '#c9b06a', groundLine: '#2affd8', groundLineSoft: 'rgba(42,255,216,0.25)' }
};

function ensureParticleTextures(scene) {
  if (!scene.textures.exists('fx_spark')) {
    const g = scene.make.graphics({ add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(3, 3, 3);
    g.generateTexture('fx_spark', 6, 6);
    g.destroy();
  }
  if (!scene.textures.exists('fx_square')) {
    const g = scene.make.graphics({ add: false });
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 5, 5);
    g.generateTexture('fx_square', 5, 5);
    g.destroy();
  }
}

function makeStarsTexture(scene, key, w, h, count, seed) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.context;
  const r = fxRand(seed || 12345);
  for (let i = 0; i < count; i++) {
    const x = r() * w, y = r() * h, roll = r();
    ctx.fillStyle = roll > 0.88 ? 'rgba(255,233,74,0.9)'
      : (roll > 0.72 ? 'rgba(0,255,242,0.8)' : 'rgba(255,255,255,' + (0.3 + roll * 0.5).toFixed(2) + ')');
    const size = roll > 0.9 ? 2.5 : (roll > 0.6 ? 1.8 : 1.2);
    ctx.fillRect(x, y, size, size);
  }
  tex.refresh();
}

function makeGroundTexture(scene, level) {
  const key = 'fx_ground_' + level.id;
  if (scene.textures.exists(key)) return key;
  const theme = FX_THEME[level.id] || FX_THEME[1];
  const tex = scene.textures.createCanvas(key, 40, 40);
  const ctx = tex.context;
  ctx.fillStyle = theme.ground; ctx.fillRect(0, 0, 40, 40);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(0, 0, 1, 40);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(5, 15, 10, 3); ctx.fillRect(22, 27, 12, 3); ctx.fillRect(12, 34, 8, 2);
  ctx.fillStyle = theme.groundLineSoft; ctx.fillRect(0, 3, 40, 5);
  ctx.fillStyle = theme.groundLine; ctx.fillRect(0, 0, 40, 3);
  tex.refresh();
  return key;
}

function makeMenuGridTexture(scene) {
  if (scene.textures.exists('fx_menugrid')) return;
  const tex = scene.textures.createCanvas('fx_menugrid', 1000, 200);
  const ctx = tex.context;
  ctx.strokeStyle = 'rgba(255,47,208,0.55)';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ff2fd0';
  ctx.shadowBlur = 6;
  for (let i = -12; i <= 12; i++) {
    ctx.beginPath();
    ctx.moveTo(500 + i * 26, 0);
    ctx.lineTo(500 + i * 130, 200);
    ctx.stroke();
  }
  [8, 22, 42, 70, 108, 156].forEach(y => {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1000, y); ctx.stroke();
  });
  tex.refresh();
}

function addScreenBackdrop(scene, tint) {
  makeStarsTexture(scene, 'fx_stars', 1000, 600, 110, 4242);
  const stars = scene.add.tileSprite(500, 300, 1000, 600, 'fx_stars').setDepth(-10);
  if (tint !== undefined) scene.add.rectangle(500, 300, 1000, 600, tint, 0.12).setDepth(-9);
  return stars;
}

// ---------- Parallax-Hintergruende pro Level ----------

function buildLevelBackground(scene, level) {
  const farKey = 'fx_far_' + level.id, midKey = 'fx_mid_' + level.id;
  if (!scene.textures.exists(farKey)) {
    const t = scene.textures.createCanvas(farKey, 1000, 600);
    fxPaintFar(t.context, level);
    t.refresh();
  }
  if (!scene.textures.exists(midKey)) {
    const t = scene.textures.createCanvas(midKey, 1000, 600);
    fxPaintMid(t.context, level);
    t.refresh();
  }
  scene.bgFar = scene.add.tileSprite(500, 300, 1000, 600, farKey).setScrollFactor(0).setDepth(-20);
  scene.bgMid = scene.add.tileSprite(500, 300, 1000, 600, midKey).setScrollFactor(0).setDepth(-15);
}

function fxPaintFar(ctx, level) {
  const grad = ctx.createLinearGradient(0, 0, 0, 600);
  grad.addColorStop(0, colorToCss(level.bgTop));
  grad.addColorStop(1, colorToCss(level.bgBottom));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1000, 600);
  if (level.id === 1) fxFarBuero(ctx);
  else if (level.id === 2) fxFarStadt(ctx, grad);
  else if (level.id === 3) fxFarMesse(ctx);
  else if (level.id === 4) fxFarFlughafen(ctx, level);
  else if (level.id === 5) fxFarFracht(ctx);
  else if (level.id === 6) fxFarInsel(ctx);
}

function fxPaintMid(ctx, level) {
  if (level.id === 1) fxMidBuero(ctx);
  else if (level.id === 2) fxMidStadt(ctx);
  else if (level.id === 3) fxMidMesse(ctx);
  else if (level.id === 4) fxMidFlughafen(ctx);
  else if (level.id === 5) fxMidFracht(ctx);
  else if (level.id === 6) fxMidInsel(ctx);
}

// --- Level 6: Steuerparadies (Strand-Insel) ---
function fxFarInsel(ctx) {
  // Sonne
  const sun = ctx.createRadialGradient(760, 150, 20, 760, 150, 90);
  sun.addColorStop(0, '#fff6c0');
  sun.addColorStop(1, 'rgba(255,220,120,0)');
  ctx.fillStyle = sun;
  ctx.beginPath(); ctx.arc(760, 150, 90, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff0b0';
  ctx.beginPath(); ctx.arc(760, 150, 40, 0, Math.PI * 2); ctx.fill();
  // Wolken
  const cloud = (cx, cy, s) => {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath(); ctx.arc(cx, cy, 18 * s, 0, Math.PI * 2);
    ctx.arc(cx + 22 * s, cy + 4 * s, 22 * s, 0, Math.PI * 2);
    ctx.arc(cx + 48 * s, cy, 16 * s, 0, Math.PI * 2);
    ctx.fill();
  };
  cloud(180, 90, 1); cloud(480, 130, 0.8); cloud(920, 80, 0.9);
  // ferne Insel-Silhouette
  ctx.fillStyle = 'rgba(20,60,70,0.5)';
  ctx.beginPath();
  ctx.moveTo(300, 300); ctx.quadraticCurveTo(360, 250, 430, 300); ctx.closePath(); ctx.fill();
  // Meer-Band mit Wellenlinien
  const sea = ctx.createLinearGradient(0, 300, 0, 560);
  sea.addColorStop(0, 'rgba(42,201,201,0.35)');
  sea.addColorStop(1, 'rgba(20,120,150,0.5)');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 300, 1000, 260);
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  for (let y = 330; y < 540; y += 34) {
    ctx.beginPath();
    for (let x = 0; x <= 1000; x += 40) {
      const yy = y + Math.sin(x / 60) * 5;
      x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
}

function fxMidInsel(ctx) {
  // Palmen
  const palm = (px) => {
    ctx.strokeStyle = '#6a4a2a';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(px, 560); ctx.quadraticCurveTo(px - 14, 440, px + 6, 380);
    ctx.stroke();
    ctx.fillStyle = '#1f9a4a';
    for (let a = 0; a < 5; a++) {
      const ang = -Math.PI / 2 + (a - 2) * 0.5;
      const ex = px + 6 + Math.cos(ang) * 60, ey = 380 + Math.sin(ang) * 40;
      ctx.beginPath();
      ctx.moveTo(px + 6, 380);
      ctx.quadraticCurveTo((px + 6 + ex) / 2, ey - 20, ex, ey);
      ctx.quadraticCurveTo((px + 6 + ex) / 2, ey + 4, px + 6, 384);
      ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#8a5a2a';
    ctx.beginPath(); ctx.arc(px + 2, 384, 5, 0, Math.PI * 2);
    ctx.arc(px + 12, 386, 5, 0, Math.PI * 2); ctx.fill();
  };
  palm(120); palm(560); palm(880);
  // Strandbar-Hütte
  ctx.fillStyle = '#7a4a1a';
  ctx.fillRect(340, 470, 120, 90);
  ctx.fillStyle = '#c8902a';
  ctx.beginPath();
  ctx.moveTo(320, 470); ctx.lineTo(480, 470); ctx.lineTo(400, 430); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(360, 500, 40, 60);
  ctx.fillStyle = '#2affd8'; ctx.font = '12px monospace';
  ctx.fillText('BAR', 405, 495);
  // Sonnenschirm + Liegestuhl
  ctx.strokeStyle = '#888'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(720, 560); ctx.lineTo(720, 470); ctx.stroke();
  ctx.fillStyle = '#ff5da2';
  ctx.beginPath(); ctx.arc(720, 470, 46, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8e8e8';
  ctx.fillRect(690, 520, 60, 8);
}

// --- Level 1: Buero ---
function fxFarBuero(ctx) {
  ctx.fillStyle = 'rgba(3,8,14,0.9)';
  ctx.fillRect(0, 0, 1000, 34);
  for (let x = 90; x < 1000; x += 200) {
    ctx.fillStyle = '#bffcf7';
    ctx.fillRect(x, 26, 64, 6);
    const lg = ctx.createLinearGradient(0, 32, 0, 190);
    lg.addColorStop(0, 'rgba(190,255,250,0.10)');
    lg.addColorStop(1, 'rgba(190,255,250,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(x + 4, 32); ctx.lineTo(x + 60, 32); ctx.lineTo(x + 92, 190); ctx.lineTo(x - 28, 190);
    ctx.closePath(); ctx.fill();
  }
  const r = fxRand(41);
  for (let x = 50; x <= 770; x += 240) {
    ctx.fillStyle = 'rgba(6,16,28,0.85)';
    ctx.fillRect(x, 80, 170, 220);
    ctx.strokeStyle = 'rgba(0,255,242,0.30)';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, 80, 170, 220);
    ctx.beginPath();
    ctx.moveTo(x + 85, 80); ctx.lineTo(x + 85, 300);
    ctx.moveTo(x, 190); ctx.lineTo(x + 170, 190);
    ctx.stroke();
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = r() > 0.5 ? 'rgba(255,233,74,0.5)' : 'rgba(0,255,242,0.45)';
      ctx.fillRect(x + 8 + r() * 154, 150 + r() * 140, 2.5, 2.5);
    }
  }
}

function fxMidBuero(ctx) {
  for (const bx of [70, 380, 690]) {
    ctx.fillStyle = '#071120';
    ctx.fillRect(bx, 470, 150, 10);
    ctx.fillRect(bx + 8, 480, 8, 80);
    ctx.fillRect(bx + 134, 480, 8, 80);
    ctx.fillRect(bx + 50, 432, 46, 34);
    ctx.fillStyle = 'rgba(0,255,242,0.16)';
    ctx.fillRect(bx + 54, 436, 38, 24);
    ctx.fillStyle = '#071120';
    ctx.fillRect(bx + 68, 466, 10, 6);
    ctx.fillStyle = '#0a1424';
    ctx.fillRect(bx + 190, 508, 26, 52);
    ctx.fillStyle = '#06301f';
    ctx.beginPath(); ctx.arc(bx + 203, 496, 20, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(bx + 188, 506, 13, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(bx + 218, 506, 13, 0, Math.PI * 2); ctx.fill();
  }
}

// --- Level 2: Innenstadt ---
function fxFarStadt(ctx, grad) {
  const r = fxRand(77);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 60; i++) ctx.fillRect(r() * 1000, r() * 260, 1.6, 1.6);
  const sun = ctx.createLinearGradient(0, 90, 0, 300);
  sun.addColorStop(0, '#ffe94a');
  sun.addColorStop(1, '#ff2fd0');
  ctx.fillStyle = sun;
  ctx.beginPath(); ctx.arc(700, 195, 105, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = grad;
  [210, 235, 258, 279].forEach((y, i) => ctx.fillRect(560, y, 280, 6 + i * 3));
  ctx.fillStyle = '#160a2a';
  let x = 0;
  const rr = fxRand(88);
  while (x < 920) {
    const w = 60 + rr() * 70, h = 90 + rr() * 110;
    ctx.fillRect(x, 560 - h, w, h);
    x += w + 14;
  }
}

function fxMidStadt(ctx) {
  const r = fxRand(99);
  const palette = ['rgba(255,233,74,0.75)', 'rgba(255,47,208,0.7)', 'rgba(0,255,242,0.7)'];
  let x = 30;
  while (x < 880) {
    const w = 80 + r() * 80, h = 160 + r() * 180;
    const top = 560 - h;
    ctx.fillStyle = '#0c0518';
    ctx.fillRect(x, top, w, h);
    ctx.strokeStyle = 'rgba(255,47,208,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + w, top); ctx.stroke();
    if (r() > 0.6) { ctx.fillStyle = '#0c0518'; ctx.fillRect(x + w / 2 - 2, top - 26, 4, 26); }
    const cols = Math.floor(w / 18), rows = Math.floor(h / 26);
    for (let c = 0; c < cols; c++) {
      for (let ry = 0; ry < rows; ry++) {
        if (r() > 0.45) continue;
        ctx.fillStyle = palette[Math.floor(r() * 3)];
        ctx.fillRect(x + 8 + c * 18, top + 10 + ry * 26, 6, 10);
      }
    }
    x += w + 26;
  }
}

// --- Level 3: Messehalle ---
function fxFarMesse(ctx) {
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= 1000; x += 125) {
    ctx.moveTo(x, 18); ctx.lineTo(x + 62, 78);
    ctx.moveTo(x + 125, 18); ctx.lineTo(x + 62, 78);
  }
  ctx.moveTo(0, 18); ctx.lineTo(1000, 18);
  ctx.moveTo(0, 78); ctx.lineTo(1000, 78);
  ctx.stroke();
  for (const sx of [160, 500, 840]) {
    ctx.fillStyle = '#20242e';
    ctx.fillRect(sx - 12, 78, 24, 14);
    const lg = ctx.createLinearGradient(0, 92, 0, 470);
    lg.addColorStop(0, 'rgba(255,233,74,0.20)');
    lg.addColorStop(1, 'rgba(255,233,74,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(sx - 10, 92); ctx.lineTo(sx + 10, 92); ctx.lineTo(sx + 95, 470); ctx.lineTo(sx - 95, 470);
    ctx.closePath(); ctx.fill();
  }
}

function fxMidMesse(ctx) {
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 120);
  ctx.quadraticCurveTo(250, 170, 500, 120);
  ctx.quadraticCurveTo(750, 170, 1000, 120);
  ctx.stroke();
  const flagCols = ['#ffe94a', '#ff2fd0', '#00fff2', '#39ff88'];
  for (let i = 0; i < 20; i++) {
    const t = i / 19, fx2 = 25 + t * 950;
    const fy = 122 + Math.abs(Math.sin(t * Math.PI * 2)) * 24;
    ctx.fillStyle = flagCols[i % 4];
    ctx.beginPath();
    ctx.moveTo(fx2 - 7, fy); ctx.lineTo(fx2 + 7, fy); ctx.lineTo(fx2, fy + 14);
    ctx.closePath(); ctx.fill();
  }
  for (const bx of [70, 420, 740]) {
    ctx.fillStyle = '#190a06';
    ctx.fillRect(bx, 460, 190, 100);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? '#7a1f10' : '#c0452a';
      ctx.fillRect(bx - 6 + i * 25, 440, 25, 22);
    }
    ctx.fillStyle = 'rgba(255,233,74,0.85)';
    ctx.fillRect(bx + 55, 472, 80, 16);
  }
  const r = fxRand(55);
  ctx.fillStyle = '#0e0503';
  for (let i = 0; i < 70; i++) {
    ctx.beginPath();
    ctx.arc(r() * 1000, 525 + r() * 30, 6 + r() * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// --- Level 4: Flughafen ---
function fxFarFlughafen(ctx, level) {
  const r = fxRand(21);
  for (let i = 0; i < 90; i++) {
    ctx.globalAlpha = 0.35 + r() * 0.6;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(r() * 1000, r() * 300, 1.8, 1.8);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#e8ecf4';
  ctx.beginPath(); ctx.arc(170, 95, 34, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = colorToCss(level.bgTop);
  ctx.beginPath(); ctx.arc(184, 86, 30, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#070b16';
  ctx.fillRect(880, 300, 26, 260);
  ctx.fillRect(858, 268, 70, 40);
  ctx.fillStyle = 'rgba(0,255,242,0.5)';
  ctx.fillRect(864, 278, 58, 10);
  ctx.fillStyle = '#ff4040';
  ctx.fillRect(890, 258, 5, 5);
  ctx.fillStyle = '#0a1020';
  ctx.fillRect(360, 150, 130, 12);
  ctx.beginPath(); ctx.moveTo(360, 150); ctx.lineTo(340, 132); ctx.lineTo(360, 162); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(420, 158); ctx.lineTo(452, 178); ctx.lineTo(462, 158); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,233,74,0.8)';
  for (let i = 0; i < 9; i++) ctx.fillRect(372 + i * 12, 154, 3, 3);
}

function fxMidFlughafen(ctx) {
  ctx.fillStyle = '#060a14';
  ctx.fillRect(90, 470, 230, 34);
  ctx.beginPath(); ctx.moveTo(320, 470); ctx.lineTo(372, 487); ctx.lineTo(320, 504); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(96, 470); ctx.lineTo(60, 420); ctx.lineTo(96, 436); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(170, 504); ctx.lineTo(120, 548); ctx.lineTo(196, 504); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,255,242,0.45)';
  for (let i = 0; i < 10; i++) ctx.fillRect(120 + i * 18, 480, 5, 5);
  ctx.fillStyle = '#060a14';
  ctx.fillRect(600, 470, 10, 90);
  ctx.beginPath(); ctx.arc(605, 466, 26, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#080d1a';
  ctx.fillRect(760, 512, 120, 30);
  ctx.fillRect(864, 500, 34, 42);
  ctx.fillStyle = '#0e1526';
  [778, 812, 846, 878].forEach(wx => {
    ctx.beginPath(); ctx.arc(wx, 546, 9, 0, Math.PI * 2); ctx.fill();
  });
  for (let x = 20; x < 1000; x += 90) {
    ctx.fillStyle = '#141a28';
    ctx.fillRect(x, 540, 4, 18);
    const isCyan = Math.floor(x / 90) % 2 === 0;
    ctx.fillStyle = isCyan ? 'rgba(0,255,242,0.9)' : 'rgba(255,150,60,0.9)';
    ctx.beginPath(); ctx.arc(x + 2, 538, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = isCyan ? 'rgba(0,255,242,0.18)' : 'rgba(255,150,60,0.18)';
    ctx.beginPath(); ctx.arc(x + 2, 538, 11, 0, Math.PI * 2); ctx.fill();
  }
}

// --- Level 5: Frachtraum ---
function fxFarFracht(ctx) {
  ctx.strokeStyle = 'rgba(170,185,215,0.13)';
  ctx.lineWidth = 10;
  for (let x = 60; x < 1000; x += 160) {
    ctx.beginPath();
    ctx.moveTo(x, 600); ctx.lineTo(x, 120);
    ctx.quadraticCurveTo(x, 60, x + 60, 48);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(200,210,230,0.10)';
  for (let x = 20; x < 1000; x += 40) {
    for (let y = 90; y < 560; y += 90) ctx.fillRect(x, y, 3, 3);
  }
  for (const wx of [200, 520, 840]) {
    ctx.fillStyle = '#2a3448';
    ctx.beginPath(); ctx.arc(wx, 150, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#03050d';
    ctx.beginPath(); ctx.arc(wx, 150, 19, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(wx - 8, 145, 2, 2);
    ctx.fillRect(wx + 5, 152, 1.6, 1.6);
  }
  for (const lx of [330, 660]) {
    ctx.fillStyle = '#3a0e0e';
    ctx.fillRect(lx - 8, 26, 16, 10);
    const lg = ctx.createRadialGradient(lx, 40, 4, lx, 40, 90);
    lg.addColorStop(0, 'rgba(255,70,70,0.30)');
    lg.addColorStop(1, 'rgba(255,70,70,0)');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(lx, 40, 90, 0, Math.PI * 2); ctx.fill();
  }
}

function fxMidFracht(ctx) {
  const crate = (x, y, s) => {
    ctx.fillStyle = '#241a10';
    ctx.fillRect(x, y, s, s);
    ctx.strokeStyle = '#3d2c17';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 1, y + 1, s - 2, s - 2);
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + s, y + s);
    ctx.moveTo(x + s, y); ctx.lineTo(x, y + s);
    ctx.stroke();
  };
  crate(60, 490, 70); crate(132, 490, 70); crate(96, 420, 70);
  crate(430, 490, 70); crate(430, 420, 70);
  crate(760, 490, 70); crate(832, 490, 70); crate(796, 420, 70); crate(796, 350, 70);
  ctx.strokeStyle = 'rgba(200,210,230,0.18)';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 5]);
  [260, 620, 940].forEach(cx => {
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, 210); ctx.stroke();
  });
  ctx.setLineDash([]);
  ctx.fillStyle = '#10141f';
  ctx.fillRect(488, 200, 24, 12);
  const lg = ctx.createLinearGradient(0, 212, 0, 520);
  lg.addColorStop(0, 'rgba(255,240,200,0.16)');
  lg.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.moveTo(492, 212); ctx.lineTo(508, 212); ctx.lineTo(560, 520); ctx.lineTo(440, 520);
  ctx.closePath(); ctx.fill();
}
