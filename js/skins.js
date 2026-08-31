// ---------- Skins & Wallet (F15) ----------
// Wallet = levelübergreifendes Konto (Kohle aus abgeschlossenen Leveln).
// Shop-Kohle (F5) ist getrennt (GameState.money pro Run).
const SKINS = [
  { id: 'classic', name: 'Der Klassiker', preis: 0, suit: 0x1b2a6b, suitDark: 0x14204f, suitLight: 0x22337f, tie: 0xff2fd0, hair: 0x241505 },
  { id: 'hai', name: 'Der Hai', preis: 2000, suit: 0x1a1a1a, suitDark: 0x0d0d0d, suitLight: 0x2a2a2a, tie: 0xffe94a, hair: 0x1a1a1a },
  { id: 'miami', name: 'Miami', preis: 3500, suit: 0xf0f0f0, suitDark: 0xc8c8c8, suitLight: 0xffffff, tie: 0x00fff2, hair: 0x3a2a10 },
  { id: 'baron', name: 'Roter Baron', preis: 5000, suit: 0x9a1020, suitDark: 0x6a0a16, suitLight: 0xc0303a, tie: 0xffe94a, hair: 0x241505 },
  { id: 'casual', name: 'Casual Friday', preis: 1500, suit: 0x2a6a4a, suitDark: 0x1a4a32, suitLight: 0x3a8a5a, tie: 0xffa040, hair: 0x4a2a10 }
];

window.WALLET = 0;
window.SKINS_OWNED = { classic: true };
window.SKIN_ACTIVE = 'classic';

(function loadSkins() {
  try {
    WALLET = parseInt(localStorage.getItem('sar_wallet') || '0', 10) || 0;
    const owned = localStorage.getItem('sar_skins');
    if (owned) window.SKINS_OWNED = Object.assign({ classic: true }, JSON.parse(owned));
    const active = localStorage.getItem('sar_skin');
    if (active && SKINS.some(s => s.id === active)) window.SKIN_ACTIVE = active;
  } catch (e) { /* kein localStorage */ }
})();

function getActiveSkin() { return SKINS.find(s => s.id === SKIN_ACTIVE) || SKINS[0]; }
function ownsSkin(id) { return !!SKINS_OWNED[id]; }
function getWallet() { return WALLET; }

function addWallet(n) {
  WALLET += n;
  try { localStorage.setItem('sar_wallet', String(WALLET)); } catch (e) { /* egal */ }
}

function buySkin(id) {
  const skin = SKINS.find(s => s.id === id);
  if (!skin || ownsSkin(id) || WALLET < skin.preis) return false;
  WALLET -= skin.preis;
  SKINS_OWNED[id] = true;
  try {
    localStorage.setItem('sar_wallet', String(WALLET));
    localStorage.setItem('sar_skins', JSON.stringify(SKINS_OWNED));
  } catch (e) { /* egal */ }
  return true;
}

function setActiveSkin(id) {
  if (!ownsSkin(id)) return false;
  SKIN_ACTIVE = id;
  try { localStorage.setItem('sar_skin', id); } catch (e) { /* egal */ }
  return true;
}
