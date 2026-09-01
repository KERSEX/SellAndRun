# Sell and Run — Feature-Backlog & Implementierungsplan

> **Für die umsetzende Session (Opus 4.8):** Dieses Dokument ist die vollständige Arbeitsgrundlage.
> Fabian sagt explizit, WELCHE Features gebaut werden — nicht ungefragt alles auf einmal umsetzen.
> Erst Abschnitt 1 + 2 lesen (Architektur & Fallstricke), dann das beauftragte Feature aus Abschnitt 3.

---

## 1. Architektur-Überblick (Stand: 2026-07-08, v=7)

**Spiel:** Phaser-3-Jump'n'Run im Synthwave-Look. Vertriebler verkauft sich durch 5 Level
(Büro → Innenstadt → Messehalle → Flughafen → Frachtraum), Bosse bzw. Parkour am Levelende,
Gunfight-Finale in Level 5. Sprache: Deutsch. Canvas 1000×600, Arcade-Physik, Gravity 900.

**Testen:** Preview-Server-Eintrag `sell-and-run` (python http.server, Port 5510) in der
`.claude/launch.json` des Second-Brain-Ordners. Achtung: Der Preview-Tab drosselt bei langen
rAF-Warteschleifen und Screenshots hängen manchmal am animierten Menü → lieber kurze
`preview_eval`-Zustandschecks als lange Echtzeit-Loops; Handler notfalls direkt aufrufen.

### Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Script-Tags mit Cache-Buster `?v=N`, HTML-Overlays: `#cheatMenu`, `#diffMenu`, `#settingsMenu` |
| `style.css` | Neon-Styles; Body nutzt `safe center` + `overflow:auto` (Anzeige-Skalierung) |
| `main.js` | `GameState` (levelIndex, money, lives, bestMoney), `saveBest()`, Phaser-Config, Scene-Liste |
| `js/audio.js` | `beep(freq,dur,type,vol,delay)` (respektiert `getVolume()`), `fanfare()`, `sadTune()` |
| `js/settings.js` | `SETTINGS` {particles, shake, volume, scale}, `fxEnabled()`, `shakeEnabled()`, `getVolume()`, `applyDisplayScale()`, `saveSettings()`; localStorage `sar_settings` |
| `js/settings-ui.js` | `window.openSettingsMenu(onClose)` — HTML-Panel |
| `js/difficulty.js` | `DIFFICULTY_PRESETS` (leicht/normal/schwer/brutal), `getDifficulty()`, `setDifficulty(key)`, Custom-Werte; localStorage `sar_difficulty`, `sar_custom_diff` |
| `js/difficulty-ui.js` | `window.openDiffMenu(onClose)` — HTML-Panel mit Presets + Slidern |
| `js/fx.js` | `colorToCss`, `fxDarken`, `fxRand(seed)`, `FX_THEME{1..5}`, `ensureParticleTextures` (Keys `fx_spark`, `fx_square`), `makeStarsTexture`, `makeGroundTexture`, `makeMenuGridTexture`, `addScreenBackdrop(scene,tint)`, `buildLevelBackground(scene,level)` → setzt `scene.bgFar`/`scene.bgMid` (TileSprites, Parallax-Faktoren 0.15/0.45 in PlayScene.update), Maler-Funktionen `fxFar*`/`fxMid*` pro Level-ID |
| `js/data/levels.js` | `GROUND_Y = 560`; `LEVELS[]` — Felder siehe unten |
| `js/entities.js` | `createPlayer/Npc/Contract/Enemy/Spike/MovingPlatform/ToggleBarrier/Boss` — alle als Container mit Physik-Body |
| `js/scenes/PlayScene.js` | Kern-Gameplay (~700 Zeilen), Details unten |
| `js/scenes/MenuScene.js` | Hauptmenü: Buttons y=440/478/510/542 (`STARTEN`, `SCHWIERIGKEIT`, `EINSTELLUNGEN`, `TUTORIAL`), Sternen-Drift, Deko-Läufer |
| `js/scenes/…` | TutorialScene, LevelIntroScene, LevelCompleteScene, WinScene (Konfetti), GameOverScene (rote Vignette) |
| `js/cheat.js` | `CHEATS` {invincible, extraLives}; KAOS-Tippsequenz öffnet `#cheatMenu` (Teleport zu jedem Level, Unverwundbarkeit, +0..4 Leben, Schwierigkeits-Button) |

### LEVELS[]-Felder (levels.js)

`id, name, intro, worldWidth, bgTop, bgBottom, floorGaps[[a,b]], platforms[{x,y,w,h,color}],
movingPlatforms[{x,y,w,h,axis,range,speed,color}], toggleBarriers[{x,y,w,h,onTime,offTime,startOn}],
npcs[{x,y,value}], contracts[{x,y,value}], enemies[{x,y,range,speed}], spikes[{x,y,w,h}],
enemyColors{body,head,name}, gateX, requiredSales, hasBoss, boss{name,color,hitsNeeded,x,y},
bossPerches[] (nur L5: Sprungziele), bossChase (nur L4: Boss flieht), flagX,
exitStyle ('jet'|'flag'), isGunfight (nur L5), finalLevel (nur L5)`

### PlayScene-Kernablauf

- `create()`: liest `getDifficulty()` → `this.diff` {lives, bossHitsMult, bossSpeedMult, enemySpeedMult, invulnMult}.
  `maxLives = diff.lives + CHEATS.extraLives`. Boss: `hitsNeeded = round(base * bossHitsMult)`.
  Gegner: `speed *= enemySpeedMult`.
- **Spielablauf:** Verkäufe sammeln (`salesCount` via `sellNpc()` [E-Taste, Radius dx<55/dy<70] und
  `collectContract()` [Berührung]) → bei `requiredSales` → `openGate()` → Spieler läuft > `gateX+40`
  → `lockArena()` (pinke Wand hinter ihm) → Boss besiegen → `unlockArena()` → `flagX` erreichen
  → `completeLevel()` → LevelCompleteScene bzw. WinScene (finalLevel).
- **Bosse:** `updateBoss` (Telegraph-Kreis → fallendes Projektil ×3 → VULNERABLE mit Vertrag, E in
  Reichweite = Treffer), `updateBossFlee` (L4, flieht mit 78 px/s zwischen gateX+80 und flagX−60),
  `updateGunfightBoss` (L5: zielt 360° auf Spieler, 560 px/s ×bossSpeedMult, Cooldown 0.4–0.7s ÷mult,
  jede 3. Attacke = 3er-Fächer ±0.3 rad; `updateBossHopping` springt via Wurfparabel gezielt auf
  `bossPerches`, hopTimer 1.4–2.4s), Spieler schießt mit E (`shootBullet`, Cooldown 0.35s, 480 px/s,
  nur horizontal).
- **Schaden:** `onHazardHit` (Leben−1, invuln 1.4s ×invulnMult, Rückstoß, Quelle mit body wird
  zerstört), `handleFall` (y>680 → Respawn bei `lastSafeX/Y` = letzter Bodenkontakt).
  Beide respektieren `CHEATS.invincible`.
- **Effekte:** `setupFx()` erstellt Emitter `fxGold/fxPink/fxHit/fxDust`; ALLE explode/shake/flash-Aufrufe
  sind mit `fxEnabled()` / `shakeEnabled()` gegated — bei neuen Effekten genauso machen!
- **HUD:** Panel oben (Depth 98–100, scrollFactor 0), `refreshHud()` mit Herzen ♥/♡ und Objective-Text.

---

## 2. Bekannte Fallstricke (alle in dieser Codebasis real passiert!)

1. **`physics.add.group().add(obj)` nullt die Velocity.** Immer: erst zur Gruppe hinzufügen,
   DANN `setVelocity` (siehe Gegner-Spawn und alle Bullet-Erzeugungen).
2. **Overlap-Reihenfolge:** `physics.add.overlap(container, group, cb)` — Container als object1,
   Gruppe als object2. Umgekehrt feuerte der Callback nicht (Boss vs. playerBullets).
3. **Beweglicher Boss:** `setImmovable(true)` + Gravity → fällt durch Static-Boden.
   Für bewegliche Bosse `setImmovable(false)` (Gunfight-Boss macht das).
4. **`blocked.down` bleibt 1–2 Frames nach Absprung true** → beim Springen-dann-Landen das
   `airborne`-Flag-Muster aus `updateBossHopping` übernehmen, sonst wird vx sofort genullt.
5. **Cache:** python http.server sendet keine Cache-Header, Browser cached JS hartnäckig.
   **Bei JEDER JS-Änderung `?v=N` in index.html hochzählen** (aktuell v=7). Neue Skripte ebenfalls
   mit `?v=N` einbinden.
6. **Bodenlücken:** Block-Auslassung per Segment-Überlappung `x + step > a && x < b`
   (Center-Check war zu schmal — Spieler lief über „Lücken").
7. **Einweg-Plattformen:** Collider-processCallback prüft `tile.isPlatform` und
   `body.velocity.y > -50` (von unten durchspringen, von oben landen) — Muster vom Gunfight-Boss.
8. **UI mit Formularelementen als HTML-Overlay** bauen (wie cheat/diff/settings), nicht in Phaser.
   Panels: `.cheatPanel`-Klasse wiederverwenden, z-index 999/1000, `hidden`-Klasse togglen.
9. **localStorage immer in try/catch** (Muster in settings.js/difficulty.js/main.js).
10. **Szenenwechsel aus HTML-UI:** erst ALLE aktiven Szenen stoppen
    (`game.scene.getScenes(true).forEach(s => game.scene.stop(s.scene.key))`), dann starten —
    sonst laufen Szenen doppelt (cheat.js `goToLevel` macht es vor).
11. **`this.player.bag`** wird im Gunfight zur Schrotflinte umgebaut (setSize/setPosition/setFillStyle) —
    bei Player-Redesigns diese Referenz erhalten. Ebenso `legL/legR/armF/armB` (Laufanimation
    in PlayScene.update) und `boss.bodyRect` (Treffer-Blitzen).
12. **Neue Level-Hintergründe:** `fxPaintFar`/`fxPaintMid` in fx.js switchen auf `level.id` —
    neue ID = neue Maler-Funktion + `FX_THEME[id]`-Eintrag. Texturen sind pro Key gecacht
    (`textures.exists`-Guard beibehalten). Mid-Layer muss kachelbar sein (Ränder freihalten).
13. **Szenen pausieren (Phaser 3.90):** `this.scene.pause()`/`.resume()`/`.launch()` über den
    ScenePlugin greifen hier NICHT zuverlässig — stattdessen den SceneManager nutzen:
    `this.scene.manager.run(key,data)` / `.pause(key)` / `.resume(key)` / `.stop(key)`.
    Außerdem: eine Scene NICHT aus ihrem eigenen `update()`-Tick starten/pausieren
    (bleibt sonst bei Status INIT hängen) → per `setTimeout(()=>{…},0)` aus dem Game-Loop lösen.
    Vorbild: `PlayScene.tryPause()` + `PauseScene`. (`this.scene.start(key)` für reine Wechsel
    funktioniert dagegen normal.)
14. **Synthetische `KeyboardEvent`s testen Phaser-Input NICHT** — Phasers KeyboardManager reagiert
    nicht auf `window.dispatchEvent(new KeyboardEvent(...))` (keyCode wird ignoriert). Tastenpfade
    daher über direkten Handler-Aufruf verifizieren (z. B. `scene.tryPause()`), nicht per Event-Dispatch.
15. **Bewegte Plattformen NICHT selbst mitschieben.** Die Arcade-Physik nimmt den Spieler beim
    Auflösen der Kollision schon mit. Ein zusätzliches `pl.x += plat.deltaX` im Collider-Callback
    verschiebt doppelt — und zwar mit einem Delta *pro Renderframe*, während Phaser mit
    `fixedStep` mehrere Physikschritte pro Frame rechnen kann (niedrige FPS → mehrfach
    verschoben, Spieler wird durch die Plattform gedrückt) oder gar keinen (hohe FPS →
    Spieler rutscht herunter). Genau das war der „Plattform-Bug".
16. **Alles, was zur Plattformbewegung gehört, im `worldstep`-Event rechnen**, nicht in
    `update()`: `mp.x` hinkt dort einen Frame nach (`body.postUpdate` schreibt die
    GameObject-Position erst nach `update()`), und Umkehrpunkte greifen sonst zu spät.
    `mp.body.center` ist der aktuelle Stand. Beim Abmelden die `world`-Referenz vorher merken —
    in `shutdown` ist `this.physics.world` schon weg.
17. **Bodenkontakt flackert** (bewegte Plattformen, Kanten der 40px-Bodenkacheln): Sprung nie
    direkt an `blocked.down` hängen, sondern über Coyote-Time (`COYOTE_MS`) und Eingabepuffer
    (`JUMP_BUFFER_MS`) in PlayScene — sonst werden Sprünge verschluckt.

---

## 3. Features

Empfohlene Reihenfolge: **Phase A** (F1→F4) → **Phase B** (F5→F8) → **Phase C** (F9→F12) → **Phase D** (F13→F16).
Innerhalb einer Phase unabhängig, Abhängigkeiten sind je Feature notiert.

---

### F1 · Pause-Menü (ESC) — ✅ FERTIG (2026-07-08, v=11) — `PauseScene.js`, ESC in PlayScene

**Ziel:** ESC pausiert das Spiel; Overlay mit WEITER / LEVEL NEU STARTEN / HAUPTMENÜ.

**Umsetzung:**
- Neue Phaser-Scene `PauseScene` (js/scenes/PauseScene.js, in main.js-Scene-Liste + index.html).
- In PlayScene `setupInput()`: ESC-Key registrieren. Bei JustDown:
  `this.scene.launch('PauseScene'); this.scene.pause();` — Tweens/Timer/Physik pausieren automatisch mit.
- PauseScene: halbtransparentes Rect (0x05000a, 0.75) über alles, Titel „PAUSE", drei Text-Buttons
  im Stil der MenuScene (Hover-Invert). WEITER = `this.scene.stop(); this.scene.resume('PlayScene');`
  NEUSTART = beide stoppen, `scene.start('PlayScene', {levelIndex})` (levelIndex via `init(data)`
  von PlayScene durchreichen: `this.scene.launch('PauseScene', { levelIndex: this.levelIndex })`).
  HAUPTMENÜ = beide stoppen, MenuScene starten.
- ESC in PauseScene = WEITER. **Konflikt beachten:** die HTML-Overlays (cheat/diff/settings) nutzen
  ESC zum Schließen — in PlayScene vor dem Pausieren prüfen, dass kein Overlay offen ist:
  `document.querySelector('#cheatMenu:not(.hidden), #diffMenu:not(.hidden), #settingsMenu:not(.hidden))'` → dann nicht pausieren.
- Hinweis „ESC = Pause" in TutorialScene-Text ergänzen.

**Test:** ESC in Level 1 → Gegner stehen, Boss-Timer eingefroren; WEITER läuft nahtlos weiter;
NEUSTART setzt salesCount/lives zurück; ESC während KAOS-Menü offen pausiert NICHT.

---

### F2 · Fortschritt speichern + Weiterspielen — ✅ FERTIG (2026-07-08, v=11) — `progress.js`, MenuScene-Button

**Ziel:** Erreichtes Level bleibt gespeichert; Hauptmenü bietet „WEITERSPIELEN (LEVEL X)".

**Umsetzung:**
- Neues `js/progress.js` (Muster settings.js): `PROGRESS = { unlocked: 0 }`
  (= höchster freigeschalteter levelIndex), localStorage `sar_progress`,
  `saveProgress()`, `unlockLevel(idx)` (nur erhöhen, nie senken).
- PlayScene `completeLevel()`: `unlockLevel(this.levelIndex + 1)` vor dem Szenenwechsel.
- MenuScene: Wenn `PROGRESS.unlocked > 0`, zusätzlichen Button
  `[ WEITERSPIELEN: LEVEL {id} ]` (über SPIEL STARTEN, Buttons zusammenrücken —
  aktuelle y-Werte 440/478/510/542, neuer Raster z. B. 425/458/488/516/544).
  Klick → `LevelIntroScene { levelIndex: PROGRESS.unlocked }`.
  „SPIEL STARTEN" bleibt Neustart bei 0 (setzt GameState.money = 0 — bereits in MenuScene.create).
- **Entscheidung (mit Fabian abgestimmt = so bauen):** Kohle wird beim Weiterspielen NICHT
  wiederhergestellt, nur das Level. (Einfach; Shop-Feature F5 ändert das ggf. später.)
- Optional-Ausbau: Level-Select-Panel statt einzelnem Button (HTML-Overlay wie diffMenu,
  Buttons nur für freigeschaltete Level) — nur bauen wenn explizit gewünscht.

**Test:** Level 1 schaffen → Reload → Menü zeigt „WEITERSPIELEN: LEVEL 2"; Klick startet Intro
Level 2; „SPIEL STARTEN" beginnt weiter bei Level 1.

---

### F3 · Münzen (Streu-Collectibles) — Aufwand S — KEINE Abhängigkeiten

**Ziel:** Geldscheine/Münzen auf dem Weg, geben nur Kohle (zählen NICHT als Verkauf).

**Umsetzung:**
- levels.js: pro Level neues Feld `coins: [{x, y}]` — 10–15 Stück pro Level platzieren:
  Reihen auf Plattformen (y = Plattform-y − 30), Bögen über Bodenlücken (3–5 Coins im Sprungbogen),
  ein paar in Ecken als Belohnung fürs Erkunden. Wert einheitlich **$25**.
- entities.js: `createCoin(scene, def)` — kleiner Container: Kreis r=7 gold (0xffe94a) mit
  dunkler `$`-Text-Mitte + Glow-Kreis dahinter (alpha 0.2, r=11); Dreh-Illusion via
  `scaleX`-Tween 1→0.2→1 (yoyo, repeat -1, duration 500). Flag `isCoin`.
- PlayScene: `this.coinList = level.coins.map(...)` in setupEntities (Guard: `level.coins || []`
  — Robustheit für Endless/alte Daten). `updateCoins()` analog `updateContracts()`
  (Radius dx<20/dy<24): `GameState.money += 25`, `fxGold.explode(6)` (mit fxEnabled-Gate!),
  `beep(1200, 0.06, 'square', 0.05)`, floatText `+$25`. **salesCount NICHT erhöhen.**
- HUD unverändert (Kohle zählt hoch).

**Test:** Coin einsammeln → +$25, „Verkäufe: n/m" bleibt gleich; Tor öffnet NICHT durch Coins.

---

### F4 · Combo-System — Aufwand M — sinnvoll NACH F3

**Ziel:** Verkäufe/Verträge schnell hintereinander = Multiplikator, belohnt flüssiges Spielen.

**Umsetzung:**
- PlayScene: `this.comboCount = 0; this.comboTimer = 0;` in create().
- In `sellNpc()` UND `collectContract()` (Coins zählen NICHT):
  `comboCount++; comboTimer = 5;` (Sekunden). Multiplikator `mult = Math.min(comboCount, 5)`,
  Kohle-Gutschrift `value * mult` statt `value`. floatText zeigt bei mult>1: `+$X (COMBO x3)`.
- update(): `comboTimer -= dt; if (comboTimer <= 0) comboCount = 0;`
- HUD: unter dem Objective-Text zentriertes Combo-Label (nur sichtbar bei comboCount ≥ 2):
  `COMBO x3 — 2.4s`, Farbe #ff2fd0, Scale-Puls-Tween bei jedem Anstieg. Depth 100, scrollFactor 0.
- Audio: Tonhöhe steigt mit Combo (`beep(880 + comboCount * 80, ...)`).
- **Balance-Hinweis für F5:** Combo erhöht die Kohle-Ausbeute deutlich (~1.5–2× pro Level) —
  Shop-Preise sind darauf ausgelegt.

**Test:** 2 Verkäufe binnen 5s → zweiter gibt ×2; 6s warten → Combo-Anzeige weg, nächster ×1.

---

### F5 · Shop zwischen Leveln — Aufwand M — NACH F3/F4 (Kohle-Balance), unabhängig von F1/F2

**Ziel:** Kohle des Durchlaufs für Run-Upgrades ausgeben. Thematisch: „Investier in dich selbst!"

**Umsetzung:**
- `GameState.upgrades = {}` in main.js initialisieren; in MenuScene.create() (= neuer Run)
  auf `{}` zurücksetzen. Upgrades gelten für den laufenden Durchlauf.
- Neue Phaser-Scene `ShopScene` (Scene-Liste + index.html + main.js). LevelCompleteScene-„WEITER"
  → `ShopScene { levelIndex }` → deren „WEITER ZUM NÄCHSTEN LEVEL" → LevelIntroScene wie bisher.
  Nach dem letzten Level (finalLevel) KEIN Shop (WinScene direkt — Ablauf unverändert).
- Items sind **gestuft** kaufbar: max. 3 Stufen pro Item (`UPGRADE_MAX_LEVEL` in main.js),
  jede Stufe kostet deutlich mehr als die vorige. `GameState.upgrades[id]` ist die Stufe 0..3;
  `upgradeLevel(id)` (main.js) liest sie (alte boolesche Werte zählen als Stufe 1).
  Button zeigt „[ STUFE n · $x ]", auf Maximalstufe „MAX ✓"; daneben Stufen-Pips ●●○.
  Preise sind bewusst hoch: alles auf Max = $25.100, ein Run finanziert nur einen Teil davon —
  das ist der taktische Kern (breit streuen vs. ein Item hochziehen).

| Item | Effekt pro Stufe (n = 1..3) | Preise Stufe 1/2/3 | Anwendung in PlayScene |
|---|---|---|---|
| ☕ Espresso-Abo | Lauftempo `200 * (1 + 0.12n)` → 224/248/272 | $750/1350/2400 | vx-Konstante in update() |
| ❤ Stressball | maxLives + n | $900/1700/3000 | in create() auf maxLives addieren |
| ⚡ Schnellfeuer-Pitch | Schuss-Cooldown `0.35 * 0.78^n` → 0.27/0.21/0.17 (nur L5) | $850/1500/2600 | shootBullet() |
| 🤝 Charisma-Seminar | Verkaufsradius `55 + 22n` → 77/99/121 px | $700/1250/2200 | updateNpcs()-Radius |
| 🧲 Klammer-Magnet | Radius `90 + 30n` (120/150/180), Zugkraft `0.09 + 0.03n` | $1000/1800/3100 | `applyMagnet()`; F6-Power-Up zählt als Stufe 1 |

- Layout: `addScreenBackdrop(this, 0xffe94a)`, Titel „💼 ZWISCHENHÄNDLER", Kohle-Anzeige oben,
  Items als Textzeilen `[ KAUFEN ]`-Button rechts (Phaser-Text-Buttons, Muster MenuScene).
  Zu teuer → Button grau (alpha 0.4, kein Handler).
- Kauf: `GameState.money -= preis; GameState.upgrades[id] = upgradeLevel(id) + 1;` beep-Kassenklang
  (`beep(1000,...)` + `beep(1400,...,60)`). Auf Maximalstufe oder bei zu wenig Kohle: Fehl-Beep.
- **bewusste Design-Entscheidung:** Ausgegebene Kohle senkt den Endscore — Abwägung Score vs.
  Erleichterung ist gewollt. In WinScene-Text keine Änderung nötig.

**Test:** Level 1 schaffen mit ≥$750 → Espresso kaufen → Level 2: Tempo spürbar höher, Kohle
reduziert; zweite Stufe kostet $1350, nach der dritten steht „MAX ✓" und weitere Klicks tun nichts;
neuer Run (Hauptmenü→Starten) = Upgrades weg.

---

### F6 · Power-Ups (in den Leveln) — Aufwand M — unabhängig; NICHT mit F5-Items verwechseln

**Ziel:** Temporäre Pickups, die in den Leveln schweben.

**Umsetzung:**
- levels.js: Feld `powerups: [{x, y, kind}]` — kind: `'coffee' | 'shield' | 'magnet'`.
  2–3 pro Level ab Level 2, an schwerer erreichbaren Stellen.
- entities.js: `createPowerup(scene, def)` — Container: Icon-Symbolik aus Shapes
  (coffee = brauner Becher-Rect + Dampf-Linien; shield = Koffer-Rect mit Glanz; magnet = U-Form
  aus 3 Rects rot), Glow-Kreis, Bob-Tween. Flag `kind`.
- PlayScene: `this.activeEffects = { speedUntil: 0, shield: false, magnetUntil: 0 }`.
  Aufsammeln (Radius wie Coins):
  - **coffee:** `speedUntil = time + 8000` → in update(): vx = 260 statt 200 solange aktiv;
    Spieler bekommt gelben Glow-Kreis (alpha 0.2) als Kind? Nein — separates Follower-Image
    ist einfacher: `this.speedAura = add.circle(...)`, Position in update() = player.x/y,
    visible = aktiv. HUD-Mini-Icon „☕ 8s" unter der Kohle.
  - **shield:** `shield = true` — in `onHazardHit()` VOR Lebensabzug: wenn shield → shield = false,
    Aura zerstören, beep, invuln 1.0s, return (kein Lebensverlust). Cyan-Aura um Spieler.
  - **magnet:** `magnetUntil = time + 6000` — Anzieh-Logik wie F5-Klammer-Magnet (Radius 120).
- Alle Effekte enden bei Levelwechsel automatisch (Scene-Neustart).

**Test:** Kaffee → schneller + Aura, nach 8s normal; Schild → erster Gegner-Kontakt kostet KEIN
Leben, zweiter schon; Magnet zieht Verträge über 100px heran.

---

### F7 · Dash-Move — Aufwand S — unabhängig

**Ziel:** SHIFT = kurzer Spurt mit Cooldown, für Parkour und Boss-Ausweichen.

**Umsetzung:**
- setupInput(): `dash: 'SHIFT'` zu addKeys.
- create(): `this.dashUntil = 0; this.dashCooldownUntil = 0;`
- update(), nach der vx-Berechnung: bei JustDown(dash) && time > dashCooldownUntil && vx ≠ 0:
  `dashUntil = time + 180; dashCooldownUntil = time + 1200;` beep(900, 0.05).
  Solange `time < dashUntil`: `vx = 420 * this.player.facing` (überschreibt normale 200),
  UND `player.body.setVelocityY(Math.min(velocity.y, 0))` NICHT anfassen — Dash ist rein horizontal.
  **Achtung maxVelocity:** createPlayer setzt `setMaxVelocity(260, 900)` → auf **(430, 900)** erhöhen,
  sonst wird der Dash gekappt (das ist der eine nicht-offensichtliche Stolperstein).
- Nachzieh-Effekt: alle 30ms während Dash ein `fx_spark`-Partikel-Explode(2) an Spielerposition
  (tint 0x00fff2, fxEnabled-Gate) — oder einfacher: fxDust.explode(3, x, y+10) pro Frame.
- HUD: kleiner Cooldown-Balken unter den Herzen (Rect, width = Restzeit-Anteil × 60px) oder
  simpler: „⚡" Text der bei Cooldown alpha 0.3 hat. Simpel starten.
- Tutorial-Text ergänzen („SHIFT = Vertriebler-Sprint").

**Test:** Dash überquert die 80px-Lücke in Level 1 ohne Sprung nicht ganz (Balance ok), mit Sprung
kombinierbar; Cooldown verhindert Dauerspam; Dash im Stand (vx=0) macht nichts.

---

### F8 · Checkpoints — Aufwand S — unabhängig

**Ziel:** Kleine Fahnen in langen Leveln; Sturz-Respawn dort statt beim letzten Bodenkontakt
(verhindert Respawn direkt an der Absturzkante mit 0 Momentum) — UND definierter Anker.

**Umsetzung:**
- levels.js: `checkpoints: [{x}]` — Level 2: [1400], Level 4: [1300, 2100] (die langen Level).
  y ist immer GROUND_Y.
- entities.js: `createCheckpoint(scene, def)` — Mini-Flagge (Mast 4×60, Fahne 24×14 grau),
  Flag `activated = false`.
- PlayScene: Liste + in update() Nähe-Check (dx<30): einmalig `activated = true`,
  Fahne wird grün (setFillStyle), beep, floatText „CHECKPOINT!",
  `this.respawnPoint = { x: def.x, y: GROUND_Y - 30 }`.
- `handleFall()`: respawnt bei `this.respawnPoint || {lastSafeX, lastSafeY}` — lastSafe bleibt
  Fallback vor dem ersten Checkpoint. (lastSafe-Logik NICHT entfernen — sie ist das
  Sicherheitsnetz gegen Respawn-in-der-Lücke.)
  **Wichtig:** respawnPoint nur bei Stürzen nutzen, wenn er HINTER dem Spieler liegt macht’s nichts —
  einfach immer zum letzten aktivierten Checkpoint.

**Test:** Level 2: Checkpoint aktivieren, in die 1900er-Lücke fallen → Respawn an der Fahne;
vor dem Checkpoint fallen → alter lastSafe-Respawn.

---

### F9 · Neue Gegnertypen: Drohne + Werfer — Aufwand M — unabhängig

**Ziel:** Mehr Abwechslung ab Level 3.

**Umsetzung:**
- levels.js: enemies-Einträge bekommen optionales `type`-Feld:
  `{type:'drone', x, y: 420, range: 120, speed: 70, amplitude: 40}` bzw.
  `{type:'thrower', x, y: GROUND_Y-21}`. Ohne type = bisheriger Patrouillen-Gegner
  (**Rückwärtskompatibilität!** createEnemy-Aufrufe dürfen nicht brechen).
- entities.js:
  - `createDrone`: Container (Rotor-Rect oben mit scaleX-Flacker-Tween, Körper, 2 Augen),
    Physik OHNE Gravity (`setAllowGravity(false)`), Flags `isDrone`, `baseY`, `phase = random`.
  - `createThrower`: stationär (immovable, kein Patrol), Wurfarm-Rect, Flag `isThrower`,
    `throwTimer = 2.5`.
- PlayScene `updateEnemiesPatrol()` erweitern (alle in derselben enemiesGroup):
  - Drone: x-Umkehr wie bisher; zusätzlich `en.y = en.baseY + Math.sin(time/400 + en.phase) * en.amplitude`
    (Body folgt Container bei direkter y-Setzung — funktioniert, weil kein Gravity/keine y-Velocity).
  - Thrower: `throwTimer -= dt`; bei 0 und Spieler-Distanz < 500: Wurfparabel Richtung Spieler
    (Formel aus `updateBossHopping` wiederverwenden: T = clamp(|dx|/300, 0.6, 1.2),
    vx = dx/T, vy = (dy − 0.5·900·T²)/T), Projektil = kleines braunes Akten-Rect,
    **eigene Gruppe `this.enemyProjectiles`** (physics group, Overlap mit Spieler → onHazardHit,
    in cleanupProjectiles mit aufnehmen). Erst zur Gruppe adden, dann Velocity (Fallstrick 1)!
    throwTimer = 2.5 zurücksetzen. Gravity AN für Projektil.
- Platzierung: Level 3: 2 Drohnen (über den Plattformen bei x 560/1200), 1 Werfer (x 1450);
  Level 4: 2 Drohnen, 1 Werfer; Level 5: keine (Boss-Fokus).
- Drohnen sterben wie alle per onHazardHit-Kollision (source.destroy) — kein Extra-Code nötig.

**Test:** Drohne wellt vertikal & patrouilliert; Ducken drunter durch? (Es gibt kein Ducken —
Amplitude so wählen, dass man drunter durchlaufen kann: Tiefpunkt ≥ GROUND_Y−80.)
Werfer-Projektil fliegt im Bogen und trifft (Leben −1); alte Gegner unverändert.

---

### F10 · Level 6: Steuerparadies — Aufwand M — NACH F9 (nutzt neue Gegner), Story-Anpassung!

**Ziel:** Neues Finale nach dem Frachtraum: tropische Insel, letzter Kampf gegen INTERPOL.

**Umsetzung:**
- **Story-Umbau:** L5 `finalLevel: false` setzen, `exitStyle: 'flag'` bleibt. L5-Outro-Gefühl
  übernimmt LevelComplete. WinScene-Texte anpassen: neuer Siegtext („Cocktail an der Bar,
  Interpol im Sand. Du bist WIRKLICH raus.").
- levels.js, neues Objekt `id: 6, name: 'STEUERPARADIES'`:
  worldWidth ~2600, bgTop 0x0a2a4a, bgBottom 0x2ac9c9, kein floorGaps-Übermaß (Strand),
  stattdessen Wasser-Lücken [[900,1000],[1700,1820]], Plattformen = Holzstege (0x8a6a3a),
  npcs = 4 („Insulaner" verkaufen), contracts 5, coins großzügig,
  enemies: Mix aus Patrouille (`ANWALT`, body 0x2a4a6a), 2 Drohnen, 1 Werfer,
  gateX ~2100, requiredSales 10,
  boss: `{ name: 'INTERPOL-AGENT', color: 0x1a3a8a, hitsNeeded: 8, x: 2320, y: GROUND_Y-40 }`,
  `isGunfight: true` + `bossPerches` (Boden + 2 Steg-Plattformen in der Arena),
  flagX 2500, exitStyle 'flag', `finalLevel: true`.
- fx.js: `FX_THEME[6]` = { ground: '#c9b06a' (Sand), groundLine: '#2affd8', soft-Variante };
  `fxFarInsel(ctx)`: Sonne (einfacher Kreis gelb-weiß), Meer-Horizont (Gradient-Band y 300–560
  mit helleren Wellenlinien-Strichen), 2–3 Wolken (weiße Ellipsen-Gruppen alpha 0.7),
  ferne Insel-Silhouette. `fxMidInsel(ctx)`: Palmen (brauner Stamm-Bogen + 5 grüne
  Wedel-Dreiecke), Liegestuhl, Strandbar-Hütte mit Schild, Sonnenschirm. In
  `fxPaintFar`/`fxPaintMid` die id-6-Zweige ergänzen.
- Gunfight-Verhalten kommt gratis über `isGunfight` (Koffer→Schrotflinte, Hüpfen, 360°-Schüsse).
  Härter machen: hitsNeeded 8 (×Difficulty) reicht; KEINE neuen Boss-Mechaniken nötig.
- KAOS-Menü zeigt Level 6 automatisch (buildLevelButtons iteriert LEVELS).
- MenuScene-Untertitel „fünf Level" → „sechs Level"; Tutorial-Text prüfen.

**Test:** L5 endet mit „LEVEL 5 GESCHAFFT" (nicht Win); L6 lädt mit Insel-Grafik fehlerfrei
(Konsole!), Boss springt auf Stege, Sieg → WinScene mit neuem Text; KAOS-Teleport zu L6 geht.

---

### F11 · Boss-Rush-Modus — Aufwand M — NACH F2 (Menü-Struktur), profitiert von F10

**Ziel:** Alle Bosse hintereinander, ein Lebens-Pool, Bestzeit.

**Umsetzung:**
- Sequenz: `const BOSS_RUSH = [0, 2, 3, 4]` (+5 wenn F10 da; Level-Indizes mit hasBoss).
- PlayScene versteht `data.bossRush = { step: n, startTime, pool }`:
  - create(): wenn bossRush — `salesCount = requiredSales` setzen (Tor sofort offen),
    Spieler direkt bei `gateX - 60` spawnen, **GameState.lives NICHT zurücksetzen** außer step 0
    (`if (!data.bossRush || data.bossRush.step === 0) GameState.lives = maxLives`? — Vorsicht:
    aktuelle Zeile setzt immer; bedingt machen). NPCs/Contracts/Coins nicht spawnen (Guard).
  - completeLevel(): wenn bossRush — statt LevelComplete direkt nächster Schritt:
    `scene.start('PlayScene', { levelIndex: BOSS_RUSH[step+1], bossRush: {step: step+1, ...} })`;
    nach letztem → eigene kleine `BossRushWinScene` ODER WinScene mit Zeit-Parameter
    (einfacher: WinScene versteht optionales `data.rushTime` und zeigt es an).
- Bestzeit: localStorage `sar_bossrush_best` (Sekunden), Anzeige im Win.
- Einstieg: Button im KAOS-Menü („BOSS-RUSH") + optional Hauptmenü. KAOS reicht für V1.
- GameOver: normaler GameOverScene, Text passt schon („Erreicht: Level X").

**Test:** Rush startet vor Boss 1 mit offenem Tor; Sieg über Chef → direkt Flughafen-Arena;
Lebens-Pool trägt sich durch; Zeit läuft über alle Kämpfe; Bestzeit speichert.

---

### F12 · Hintergrundmusik (Chiptune) — Aufwand M — unabhängig

**Ziel:** Dezenter Synthwave-Loop, getrennt regelbar, passend zum WebAudio-Beep-Stil.

**Umsetzung:**
- audio.js erweitern: kleiner Step-Sequencer mit **Lookahead-Scheduler** (Standard-Pattern:
  setInterval 25ms prüft, ob Noten innerhalb der nächsten 0.1s anstehen, plant sie mit
  actx-Zeit exakt — NICHT setTimeout pro Note, das driftet).
  `startMusic(kind)`, `stopMusic()`; ein GainNode `musicGain` für alles.
- Zwei Loops als Notendaten (Frequenz-Arrays, 8tel bei 112 BPM):
  `menu` (ruhig: Triangle-Bass A1-Pattern + spärliche Square-Melodie) und
  `game` (treibend: Bass 8tel A-A-C-C-D-D-E-E + Lead-Hook). Boss-Variante = game mit +20 BPM
  (V2, nur wenn gewünscht).
- Lautstärke: `musicGain.gain = 0.35 × getVolume() × (SETTINGS.music ? 1 : 0)` — bei
  Settings-Änderung live aktualisieren (`updateMusicVolume()` aus settings-ui aufrufen).
- settings.js: `SETTINGS.music = true` + Settings-Panel: Zeile „MUSIK AN/AUS" (buildGroup-Muster).
- Szenen-Hooks: MenuScene.create → startMusic('menu'); PlayScene.create → startMusic('game');
  Win/GameOver → stopMusic() (Fanfare/sadTune bleiben). Doppelstart-Guard in startMusic
  (gleicher kind läuft schon → nichts tun).
- **Browser-Autoplay:** AudioContext startet erst nach User-Geste — beim ersten Klick/Keydown
  `actx.resume()` (einmaliger Listener in audio.js).

**Test:** Menümusik startet nach erstem Klick; Levelmusik wechselt; MUSIK AUS stoppt sofort,
Beeps bleiben; LAUTSTÄRKE AUS stummt beides; kein Tempo-Drift nach 2 Minuten.

---

### F13 · Statistiken — Aufwand M — Grundlage für F14

**Ziel:** Laufende Zähler + Anzeige.

**Umsetzung:**
- Neues `js/stats.js`: `STATS = { deaths: 0, jumps: 0, sales: 0, coins: 0, bossKills: 0,
  playtimeS: 0, bestTimes: {} }` (bestTimes[levelId] = Sekunden), localStorage `sar_stats`,
  `addStat(key, n=1)`, `saveStats()` (throttled: nur alle ~5s oder bei Szenenwechsel schreiben).
- Hooks in PlayScene: Sprung (jumps), sellNpc/collectContract (sales), Coin (coins),
  defeatBoss (bossKills), onHazardHit-Lebensverlust + handleFall (deaths),
  completeLevel (Levelzeit: `this.levelStartTime = time` in create; bestTimes-Vergleich),
  update (playtimeS += dt).
- Anzeige: LevelCompleteScene bekommt Zeile „Zeit: 43.2s (Best: 39.1s)";
  Hauptmenü-Button `[ STATISTIK ]` → HTML-Overlay (cheatPanel-Muster) mit allen Werten
  + „ZURÜCKSETZEN"-Button (mit confirm-Abfrage im Panel, nicht window.confirm).

**Test:** Werte zählen über Reloads hinweg weiter; Bestzeit aktualisiert nur bei Verbesserung.

---

### F14 · Achievements — Aufwand M — BRAUCHT F13 (Hooks/Speicher-Muster)

**Ziel:** Erfolge mit Toast-Einblendung.

**Umsetzung:**
- `js/achievements.js`: `ACHIEVEMENTS = [{ id, name, desc, hidden? }]`, Freischalt-Set in
  localStorage `sar_achievements`, `unlock(id)` → wenn neu: speichern + Toast.
- Startliste: `sauber` „Sauberer Deal" (Level ohne Lebensverlust — Flag `tookDamage` in PlayScene),
  `alles` „Vollverkäufer" (alle NPCs+Verträge eines Levels), `flott` „Quartalsziel" (Level < 60s),
  `sparfuchs` „Sparfuchs" (Shop-Item gekauft — nur mit F5), `rushfertig` (Boss-Rush geschafft — F11),
  `brutal1` „Überlebenskünstler" (irgendein Level auf BRUTAL).
- Toast: HUD-fixiertes Panel oben-mittig unterhalb der HUD-Leiste (Rect + Text „🏆 ERFOLG: …"),
  slide-in per Tween y −20→+64, 3s, slide-out, dann destroy. Queue falls mehrere gleichzeitig
  (Array + nacheinander abspielen).
- Anzeige aller Erfolge im Statistik-Panel (F13) mit ✓/✗.

**Test:** Level 1 ohne Treffer → Toast erscheint einmalig; Reload → bleibt freigeschaltet,
kein zweiter Toast.

---

### F15 · Skins — Aufwand M — Wallet-Frage klären (siehe unten)

**Ziel:** Anzugfarben freischalten & auswählen.

**Umsetzung:**
- entities.js: `createPlayer(scene, x, y, skin)` — skin = `{ suit, suitDark, tie, hair }`,
  Defaults = heutige Werte (0x1b2a6b, 0x14204f/0x22337f, 0xff2fd0, 0x241505). Alle
  hartkodierten Farben im Player durch skin-Felder ersetzen (auch legRect!).
  **Referenzen legL/legR/armF/armB/bag beibehalten** (Fallstrick 11).
- `js/skins.js`: `SKINS = [{id:'classic', name:'Der Klassiker', preis:0, suit:…}, …]` —
  z. B. Schwarz/Gold „Der Hai" ($2000), Weiß/Cyan „Miami" ($3500), Rot „Roter Baron" ($5000),
  Trainingsanzug „Casual Friday" ($1500). localStorage `sar_skins` (gekauft) + `sar_skin` (aktiv).
- **Währung:** Skins brauchen levelübergreifende Kohle. Neues `WALLET`-Konzept:
  `sar_wallet` — bei completeLevel/WinScene wird `GameState.money`-Zuwachs des Levels
  gutgeschrieben (einfachste Regel: bei WinScene += GameState.money; **mit Fabian klären,
  ob pro Level oder pro Run**). Shop (F5) bleibt Run-Kohle — zwei getrennte Töpfe, im UI klar
  beschriften („RUN-KOHLE" vs. „KONTO").
- Auswahl: Hauptmenü-Button `[ SKINS ]` → HTML-Overlay: Liste mit Farbvorschau
  (CSS-Quadrate), KAUFEN/ANLEGEN-Buttons. MenuScene-Deko-Läufer + PlayScene nutzen aktiven Skin.

**Test:** Skin kaufen (Wallet sinkt), anlegen → Spieler & Menü-Läufer umgefärbt, nach Reload aktiv;
Gunfight-Schrotflinte funktioniert mit jedem Skin.

---

### F16 · Gamepad-Support — Aufwand S — unabhängig

**Ziel:** Xbox-/Standard-Controller.

**Umsetzung:**
- main.js-Config: `input: { gamepad: true }` ergänzen (**ohne das feuert nichts!**).
- PlayScene setupInput: `this.pad = null;` + `this.input.gamepad.once('connected', pad => this.pad = pad);`
  (und `.on('disconnected')` → null). Falls schon verbunden: `if (this.input.gamepad.total) pad = getPad(0)`.
- update(): Wenn pad — `padLeft = pad.leftStick.x < -0.3 || pad.left; padRight = … > 0.3 || pad.right;`
  in die vx-Bedingungen ODER-verknüpfen. Sprung = `pad.A` (JustDown-Äquivalent selbst bauen:
  `padAPressed && !this.padAWas` Flanken-Merker), Verkaufen/Schießen = `pad.X`, Dash (F7) = `pad.R1`,
  Pause (F1) = `pad.start`... Phaser-Button-Objekte: `pad.buttons[idx].pressed` — A=0, X=2, R1=5, Start=9.
- Menü-Szenen: A = Start-Button-Aktion (nur MenuScene, simpel halten; HTML-Overlays bleiben Maus).
- Tutorial-Text um Controller-Zeile ergänzen.

**Test:** Controller anschließen → laufen/springen/verkaufen ohne Tastatur; Tastatur parallel weiter ok.

---

## 4. Balance-Referenz (aktuelle Kernwerte)

| Wert | Aktuell |
|---|---|
| Lauftempo / Sprungkraft | 200 px/s / −560 |
| Coyote-Time / Sprungpuffer | 120 ms / 130 ms |
| maxVelocity Spieler | 260, 900 (F7 erhöht auf 430!) |
| Schuss (L5): Cooldown / Tempo | 0.35s / 480 px/s |
| Gunfight-Boss: Schuss / Cooldown / Salve | 560×mult / 0.4–0.7s÷mult / jede 3. ±0.3rad |
| NPC-Werte / Verträge / geplante Coins | $300–500 / $150–250 / $25 |
| invuln nach Treffer | 1.4s × invulnMult |
| Difficulty-Presets | leicht 5♥/0.6/0.8/0.8/1.4 · normal 3♥/1/1/1/1 · schwer 2♥/1.3/1.3/1.2/0.8 · brutal 1♥/1.6/1.5/1.4/0.6 |

## 5. Arbeitsregeln

1. Pro Feature: bauen → **`?v=N` hochzählen** → im Preview testen (Konsole auf Fehler!) → kurz melden.
2. Neue Effekte immer über `fxEnabled()`/`shakeEnabled()` gaten, neue Sounds über `beep()`.
3. Neue localStorage-Keys mit Präfix `sar_`, immer try/catch.
4. Bestehende Referenzen (player.bag/legL/…, boss.bodyRect, LEVELS-Feldnamen) nicht umbenennen.
5. Deutsch im UI, Neon-Farbwelt: pink #ff2fd0, cyan #00fff2, gelb #ffe94a, grün #39ff88.
6. Bei Unklarheit (z. B. Wallet-Regel F15): Fabian fragen statt raten — kurz & direkt.
