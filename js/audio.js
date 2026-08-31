let actx;
function beep(freq = 440, dur = 0.08, type = 'square', vol = 0.05, delay = 0) {
  try {
    const volMult = (typeof getVolume === 'function') ? getVolume() : 1;
    const finalVol = vol * volMult;
    if (finalVol <= 0) return;
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    setTimeout(() => {
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type; o.frequency.value = freq; g.gain.value = finalVol;
      o.connect(g); g.connect(actx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
      o.stop(actx.currentTime + dur);
    }, delay);
  } catch (e) { /* audio not available */ }
}
function fanfare() {
  [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.15, 'square', 0.06, i * 120));
}
function sadTune() {
  [400, 300, 200].forEach((f, i) => beep(f, 0.25, 'sawtooth', 0.08, i * 150));
}

// ---------- Hintergrundmusik (F12): Lookahead-Sequencer ----------
let musicGain = null;
let musicTimer = null;
let musicKind = null;
let musicStep = 0;
let musicNextTime = 0;

const MUSIC_TRACKS = {
  // 8tel-Pattern, Frequenzen; bass = Triangle, lead = Square
  menu: {
    bpm: 100,
    bass: [110, 0, 110, 0, 146.8, 0, 146.8, 0, 130.8, 0, 130.8, 0, 98, 0, 98, 0],
    lead: [0, 0, 440, 0, 0, 0, 587.3, 0, 0, 0, 523.3, 0, 0, 0, 392, 0]
  },
  game: {
    bpm: 132,
    bass: [110, 110, 130.8, 130.8, 146.8, 146.8, 164.8, 164.8, 110, 110, 130.8, 130.8, 98, 98, 123.5, 123.5],
    lead: [440, 0, 0, 523.3, 0, 587.3, 0, 0, 659.3, 0, 0, 587.3, 0, 523.3, 0, 440]
  }
};

function musicVolume() {
  const v = (typeof getVolume === 'function') ? getVolume() : 1;
  const on = !window.SETTINGS || SETTINGS.music !== false;
  return on ? 0.14 * v : 0;
}

function updateMusicVolume() {
  if (musicGain && actx) musicGain.gain.setValueAtTime(musicVolume(), actx.currentTime);
}

function playNote(freq, type, time, dur, vol) {
  if (!freq) return;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = type; o.frequency.value = freq;
  o.connect(g); g.connect(musicGain);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(vol, time + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  o.start(time); o.stop(time + dur + 0.02);
}

function musicScheduler() {
  if (!actx || !musicKind) return;
  const track = MUSIC_TRACKS[musicKind];
  const stepDur = 60 / track.bpm / 2; // 8tel
  while (musicNextTime < actx.currentTime + 0.12) {
    const i = musicStep % 16;
    playNote(track.bass[i], 'triangle', musicNextTime, stepDur * 0.9, 0.5);
    playNote(track.lead[i], 'square', musicNextTime, stepDur * 0.8, 0.3);
    musicNextTime += stepDur;
    musicStep++;
  }
}

function startMusic(kind) {
  try {
    if (musicKind === kind) return;
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (!musicGain) { musicGain = actx.createGain(); musicGain.connect(actx.destination); }
    musicGain.gain.value = musicVolume();
    musicKind = kind;
    musicStep = 0;
    musicNextTime = actx.currentTime + 0.05;
    if (musicTimer) clearInterval(musicTimer);
    musicTimer = setInterval(musicScheduler, 25);
  } catch (e) { /* audio not available */ }
}

function stopMusic() {
  musicKind = null;
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
}

// AudioContext nach erster Nutzergeste aktivieren (Autoplay-Sperre)
window.addEventListener('pointerdown', () => { try { if (actx && actx.state === 'suspended') actx.resume(); } catch (e) {} });
window.addEventListener('keydown', () => { try { if (actx && actx.state === 'suspended') actx.resume(); } catch (e) {} });
