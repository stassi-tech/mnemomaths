/* ============================================================
   MNEMOMATHS — programme de l'application
   Les mathématiques à travers la mémoire, du CE1 à la 3e.
   Même ossature que MNEMOGRAM (bandeau, ambiances, comptes, scores, bilan),
   mais les exercices sont des questions de mathématiques fabriquées à chaque partie :
   on ne rejoue jamais deux fois exactement la même série.
   ============================================================ */
'use strict';

/* Numéro de version affiché à l'écran (bandeau du haut) : à augmenter à chaque modification. */
const APP_VERSION = 'v1';

const $ = (id) => document.getElementById(id);
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const fmtPts = (n) => String(Math.round((n || 0) * 10) / 10).replace('.', ',');
const capitalize = (t) => t.charAt(0).toUpperCase() + t.slice(1);
/* espaces insécables à la française (guillemets, ! ? : ;) */
const nbspFr = (h) => String(h).replace(/« /g, '« ').replace(/ »/g, ' »').replace(/ ([!?:;])/g, ' $1');

/* ------------------------------------------------------------
   LES QUATRE PERSONNAGES (dessins originaux, dans l'esprit d'une école de sorciers)
   Deux gentils : Maître Compas et Dame Équerre. Deux grincheux : Maître Retenue et Dame Bévue.
   Trois sortes de messages par personnage :
   - « messages » : pour tout le monde (joueur sans compte) ;
   - « perso » : avec le prénom de l'enfant ({E}) ;
   - « famille » : avec un adulte de la fiche ({adulte} = « ton papa Marc », {Adulte} = « Ton papa Marc »,
     {fier} = fier / fière selon l'adulte).
   {rep} = la bonne réponse, dite en mots (« 56 », « un carré »).
   ------------------------------------------------------------ */
const CHARACTERS = {
  compas: {
    nom: 'Maître Compas', camp: 'good', voix: 'homme',
    messages: [
      'Bravo ! C\'est bien {rep} !',
      'Magnifique ! Ton compas magique fait des étincelles !',
      'Exactement ! {Rep}, tu l\'as trouvé !',
      'Quelle mémoire ! Je suis fier de toi.',
      'Parfait ! Le compte est bon !',
    ],
    perso: [
      '{E}, c\'est parfait, tu as réussi !',
      '{E}, tu es un génie des mathématiques !',
      'Bravo {E} ! C\'est bien {rep} !',
      'Bien calculé, {E} !',
    ],
    famille: [
      'Bravo {E} ! {Adulte} sera {fier} de toi !',
      '{Adulte} sera très {fier} de toi, {E} !',
    ],
  },
  equerre: {
    nom: 'Dame Équerre', camp: 'good', voix: 'femme',
    messages: [
      'Bravo ! C\'est bien {rep} !',
      'Formidable ! Tu deviens un vrai petit sorcier des nombres !',
      'Oui ! {Rep} ! Tu as tout compris.',
      'Superbe ! Continue comme ça !',
      'Excellent ! C\'est juste, au millimètre près !',
    ],
    perso: [
      '{E}, c\'est parfait, tu as réussi !',
      'Formidable, {E} ! C\'est bien {rep} !',
      '{E}, tu es un vrai petit sorcier des nombres !',
      'Superbe, {E} ! Continue comme ça !',
    ],
    famille: [
      '{Adulte} sera très {fier} de toi, {E} !',
      'Bravo {E} ! Il faudra raconter ça à {adulte} !',
    ],
  },
  retenue: {
    nom: 'Maître Retenue', camp: 'bad', voix: 'homme',
    messages: [
      'Hum… Ce n\'est pas ça. Refais ton calcul et recommence.',
      'Grrr… Raté ! Mais je suis sûr que tu peux trouver.',
      'Pas tout à fait… Allez, encore un petit effort !',
      'Tss tss… Réfléchis encore un peu, tu vas y arriver.',
    ],
    perso: [
      'Hum… Ce n\'est pas ça, {E}. Refais ton calcul et recommence.',
      'Grrr… Raté, {E} ! Mais je suis sûr que tu peux trouver.',
      'Allez {E}, encore un petit effort !',
    ],
    famille: [
      'Pas tout à fait, {E}… {Adulte} sait que tu peux trouver !',
    ],
  },
  bevue: {
    nom: 'Dame Bévue', camp: 'bad', voix: 'femme',
    messages: [
      'Oh là là… Ce n\'est pas la bonne réponse. Recommence !',
      'Perdu ! Mais ne te décourage pas, essaie encore.',
      'Hmm… Relis bien la question, et réessaie.',
      'Raté ! Courage, la bonne réponse n\'est pas loin.',
    ],
    perso: [
      'Oh là là, {E}… Ce n\'est pas la bonne réponse. Recommence !',
      'Perdu, {E} ! Mais ne te décourage pas, essaie encore.',
      'Courage {E}, la bonne réponse n\'est pas loin !',
    ],
    famille: [
      'Raté, {E}… Mais {adulte} compte sur toi : essaie encore !',
    ],
  },
};

/* Dessins en SVG : un sorcier et une sorcière gentils, un sorcier et une sorcière grincheux.
   Sur leurs robes, des signes de calcul à la place des étoiles. */
function characterSvg(id) {
  const peauClaire = '#f6cfa8', peauPale = '#efe2cf';
  const signe = (x, y, t, s, c) => `<text x="${x}" y="${y}" font-family="Georgia,serif" font-weight="700" font-size="${s}" fill="${c}" text-anchor="middle">${t}</text>`;
  if (id === 'compas') {
    return `<svg class="character" viewBox="0 0 220 320" xmlns="http://www.w3.org/2000/svg" aria-label="Maître Compas">
      <path d="M60 165 Q40 240 34 318 H186 Q180 240 160 165 Z" fill="#284b8f"/>
      <path d="M100 168 L110 318 H120 L114 168Z" fill="#1f3b72"/>
      ${signe(64, 258, '+', 30, '#f2c94c')}${signe(150, 228, '×', 26, '#f2c94c')}${signe(142, 298, 'π', 26, '#f2c94c')}${signe(78, 306, '7', 22, '#f2c94c')}
      <path d="M150 190 Q178 205 186 180" stroke="#284b8f" stroke-width="20" fill="none" stroke-linecap="round"/>
      <circle cx="188" cy="178" r="10" fill="${peauClaire}"/>
      <g stroke-linecap="round"><line x1="204" y1="112" x2="192" y2="176" stroke="#b9bec6" stroke-width="5"/><line x1="204" y1="112" x2="214" y2="174" stroke="#b9bec6" stroke-width="5"/>
      <line x1="214" y1="174" x2="215" y2="184" stroke="#3a2a20" stroke-width="3"/><circle cx="204" cy="110" r="6" fill="#f2c94c" stroke="#8a6d1f" stroke-width="2"/></g>
      <path d="M196 196 A22 22 0 0 0 218 190" fill="none" stroke="#ffe066" stroke-width="2.5" stroke-dasharray="4 4"/>
      <circle cx="110" cy="128" r="34" fill="${peauClaire}"/>
      <path d="M78 132 Q74 210 110 236 Q146 210 142 132 Q132 160 110 160 Q88 160 78 132Z" fill="#fbfbf7" stroke="#e2e2da" stroke-width="2"/>
      <path d="M92 150 Q110 140 128 150 Q118 158 110 152 Q102 158 92 150Z" fill="#fbfbf7" stroke="#e2e2da" stroke-width="1.5"/>
      <path d="M100 163 Q110 170 120 163" stroke="#b5544a" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="97" cy="126" r="11" fill="none" stroke="#c9a227" stroke-width="3"/><circle cx="123" cy="126" r="11" fill="none" stroke="#c9a227" stroke-width="3"/>
      <line x1="108" y1="126" x2="112" y2="126" stroke="#c9a227" stroke-width="3"/>
      <path d="M92 127 Q97 122 102 127" stroke="#3a2a20" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M118 127 Q123 122 128 127" stroke="#3a2a20" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M88 112 Q96 106 104 110" stroke="#e8e8e0" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M116 110 Q124 106 132 112" stroke="#e8e8e0" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="110" cy="138" rx="5" ry="6" fill="#eab08a"/>
      <circle cx="88" cy="142" r="5" fill="#f4a3a3" opacity=".6"/><circle cx="132" cy="142" r="5" fill="#f4a3a3" opacity=".6"/>
      <ellipse cx="110" cy="100" rx="62" ry="12" fill="#1f3b72"/>
      <path d="M68 98 Q90 60 104 20 Q112 2 140 6 Q122 12 120 34 Q132 70 152 98Z" fill="#284b8f"/>
      <path d="M72 92 Q110 82 150 92 L148 99 Q110 89 74 99Z" fill="#f2c94c"/>
      ${signe(110, 70, '∞', 24, '#f2c94c')}${signe(126, 38, '÷', 16, '#f2c94c')}
    </svg>`;
  }
  if (id === 'equerre') {
    return `<svg class="character" viewBox="0 0 220 320" xmlns="http://www.w3.org/2000/svg" aria-label="Dame Équerre">
      <path d="M58 175 Q40 250 30 318 H190 Q180 250 162 175 Z" fill="#8a3f8f"/>
      <path d="M86 175 L110 230 L134 175Z" fill="#f2e6c9"/>
      <path d="M30 318 Q110 300 190 318" stroke="#f2c94c" stroke-width="5" fill="none"/>
      ${signe(62, 268, '½', 24, '#f2c94c')}${signe(152, 280, '=', 26, '#f2c94c')}
      <path d="M150 200 Q180 210 190 184" stroke="#8a3f8f" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M172 104 L172 178 L214 178 Z M180 128 L180 170 L198 170 Z" fill="#f2c94c" fill-rule="evenodd" stroke="#8a6d1f" stroke-width="2" stroke-linejoin="round"/>
      <path d="M172 166 h12 v12" fill="none" stroke="#8a6d1f" stroke-width="1.5"/>
      <circle cx="191" cy="182" r="9" fill="${peauClaire}"/>
      <path d="M72 120 Q66 190 84 200 L136 200 Q154 190 148 120Z" fill="#2b2118"/>
      <circle cx="110" cy="132" r="33" fill="${peauClaire}"/>
      <path d="M78 122 Q90 98 112 104 Q132 100 142 124 Q128 112 110 114 Q92 112 78 122Z" fill="#2b2118"/>
      <path d="M95 130 Q100 124 105 130" stroke="#3a2a20" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M115 130 Q120 124 125 130" stroke="#3a2a20" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M93 125 l-3 -3 M127 125 l3 -3" stroke="#3a2a20" stroke-width="2" stroke-linecap="round"/>
      <path d="M100 148 Q110 158 120 148" stroke="#c0392b" stroke-width="3.5" fill="#e8746a" stroke-linecap="round"/>
      <circle cx="90" cy="142" r="6" fill="#f4a3a3" opacity=".7"/><circle cx="130" cy="142" r="6" fill="#f4a3a3" opacity=".7"/>
      <ellipse cx="110" cy="104" rx="64" ry="12" fill="#5e2a63"/>
      <path d="M70 102 Q92 66 104 28 Q110 10 136 16 Q118 22 120 40 Q130 74 150 102Z" fill="#8a3f8f"/>
      <path d="M74 96 Q110 86 148 96 L147 104 Q110 94 75 104Z" fill="#1f8a7a"/>
      <path d="M104 101 L104 89 L118 101 Z" fill="none" stroke="#f2c94c" stroke-width="2.5" stroke-linejoin="round"/>
      ${signe(122, 66, '+', 20, '#f2c94c')}
    </svg>`;
  }
  if (id === 'retenue') {
    return `<svg class="character" viewBox="0 0 220 320" xmlns="http://www.w3.org/2000/svg" aria-label="Maître Retenue">
      <path d="M62 165 Q44 240 36 318 H184 Q176 240 158 165 Z" fill="#23272d"/>
      <path d="M92 165 L110 200 L128 165Z" fill="#7a2e2e"/>
      <path d="M70 200 Q110 230 150 200 Q140 220 110 226 Q80 220 70 200Z" fill="#1a1d22"/>
      <path d="M150 210 Q120 222 100 214" stroke="#23272d" stroke-width="18" fill="none" stroke-linecap="round"/>
      <path d="M70 210 Q100 222 120 214" stroke="#2b3037" stroke-width="18" fill="none" stroke-linecap="round"/>
      <rect x="128" y="238" width="78" height="52" rx="4" fill="#22352b" stroke="#7a5530" stroke-width="5"/>
      ${signe(167, 270, '9+4=12', 15, '#f4f1e6')}<path d="M136 252 L198 280" stroke="#e74c3c" stroke-width="3" stroke-linecap="round"/>
      <path d="M76 118 Q70 175 80 182 L92 182 L92 130Z M144 118 Q150 175 140 182 L128 182 L128 130Z" fill="#15171a"/>
      <circle cx="110" cy="130" r="32" fill="${peauPale}"/>
      <path d="M78 128 Q80 96 110 96 Q140 96 142 128 Q132 108 110 108 Q88 108 78 128Z" fill="#15171a"/>
      <path d="M92 120 L106 126 M128 120 L114 126" stroke="#15171a" stroke-width="4" stroke-linecap="round"/>
      <circle cx="99" cy="131" r="3.5" fill="#15171a"/><circle cx="121" cy="131" r="3.5" fill="#15171a"/>
      <path d="M110 128 Q118 146 108 150" stroke="#c9b59a" stroke-width="3" fill="#e6d3bb" stroke-linejoin="round"/>
      <path d="M99 160 Q110 153 121 160" stroke="#6b3a34" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="110" cy="100" rx="56" ry="10" fill="#15171a"/>
      <path d="M74 98 Q94 64 106 26 Q112 10 150 30 Q124 28 122 44 Q130 74 146 98Z" fill="#23272d"/>
      <path d="M76 92 Q110 84 144 92 L143 98 Q110 90 77 98Z" fill="#7a2e2e"/>
      ${signe(112, 70, '−1', 16, '#9aa0a6')}
    </svg>`;
  }
  /* bevue */
  return `<svg class="character" viewBox="0 0 220 320" xmlns="http://www.w3.org/2000/svg" aria-label="Dame Bévue">
      <path d="M60 172 Q42 248 32 318 H188 Q178 248 160 172 Z" fill="#3f4a23"/>
      <path d="M88 172 L110 196 L132 172Z" fill="#2a3117"/>
      <path d="M32 318 Q110 304 188 318" stroke="#7a8a3f" stroke-width="5" fill="none"/>
      ${signe(70, 262, '?', 26, '#c9b46a')}${signe(148, 296, '0', 22, '#c9b46a')}
      <path d="M152 200 Q176 196 178 164" stroke="#3f4a23" stroke-width="18" fill="none" stroke-linecap="round"/>
      <g transform="rotate(-20 180 140)"><rect x="174" y="96" width="12" height="38" fill="#f2c94c" stroke="#8a6d1f" stroke-width="1.5"/><path d="M174 104 h5 M174 112 h7 M174 120 h5 M174 128 h7" stroke="#8a6d1f" stroke-width="1.2"/></g>
      <g transform="rotate(25 196 84)"><rect x="190" y="62" width="12" height="30" fill="#f2c94c" stroke="#8a6d1f" stroke-width="1.5"/><path d="M190 70 h5 M190 78 h7 M190 86 h5" stroke="#8a6d1f" stroke-width="1.2"/></g>
      <circle cx="178" cy="160" r="9" fill="${peauPale}"/>
      <path d="M72 128 Q66 176 82 182 L138 182 Q154 176 148 128Z" fill="#9aa0a6"/>
      <circle cx="110" cy="132" r="32" fill="${peauPale}"/>
      <path d="M78 126 Q86 100 110 102 Q134 100 142 126 Q128 112 110 114 Q92 112 78 126Z" fill="#b3b8bd"/>
      <path d="M92 120 L106 124 M128 120 L114 124" stroke="#5e6266" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="99" cy="131" r="3.5" fill="#2a3117"/><circle cx="121" cy="131" r="3.5" fill="#2a3117"/>
      <path d="M110 130 Q126 148 112 152" stroke="#c9b59a" stroke-width="3" fill="#e6d3bb" stroke-linejoin="round"/>
      <circle cx="120" cy="146" r="2.6" fill="#a08a6a"/>
      <path d="M100 162 Q110 156 120 162" stroke="#6b3a54" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="110" cy="104" rx="60" ry="11" fill="#2a3117"/>
      <path d="M72 102 Q90 70 100 40 Q104 24 96 8 Q120 14 120 40 Q128 76 148 102Z" fill="#3f4a23"/>
      <path d="M76 96 Q110 88 146 96 L145 103 Q110 95 77 103Z" fill="#7a8a3f"/>
      ${signe(112, 74, '≠', 18, '#c9b46a')}
    </svg>`;
}

/* ------------------------------------------------------------
   VOIX DE SYNTHÈSE (5 niveaux de volume, 0 = muet), réglage gardé d'une visite à l'autre
   ------------------------------------------------------------ */
let volumeLevel = 3;
try { const v = localStorage.getItem('mnemomaths-volume'); if (v !== null) volumeLevel = Number(v); } catch (e) {}
function refreshVolumeBars() {
  document.querySelectorAll('.volume-bar').forEach((b) => b.classList.toggle('on', Number(b.dataset.level) <= volumeLevel));
}
document.querySelectorAll('.volume-bar').forEach((b) => b.addEventListener('click', () => {
  const lvl = Number(b.dataset.level);
  volumeLevel = (lvl === volumeLevel) ? lvl - 1 : lvl;   /* un clic sur la dernière barre allumée baisse d'un cran (jusqu'à muet) */
  try { localStorage.setItem('mnemomaths-volume', String(volumeLevel)); } catch (e) {}
  refreshVolumeBars();
  if (volumeLevel === 0 && 'speechSynthesis' in window) speechSynthesis.cancel();
}));
refreshVolumeBars();

function pickFrenchVoice(prefer) {
  if (!('speechSynthesis' in window)) return null;
  const voices = speechSynthesis.getVoices().filter((v) => /^fr/i.test(v.lang));
  if (!voices.length) return null;
  const fr = voices.filter((v) => /fr[-_]FR/i.test(v.lang));
  const pool = fr.length ? fr : voices;
  const femmes = /(amélie|amelie|audrey|aurélie|aurelie|julie|marie|denise|hortense|virginie|céline|celine|léa|lea|female|femme)/i;
  const hommes = /(thomas|paul|henri|claude|nicolas|mathieu|daniel|male|homme)/i;
  const re = prefer === 'femme' ? femmes : hommes;
  return pool.find((v) => re.test(v.name)) || pool[0];
}
/* ------------------------------------------------------------
   PRONONCIATION (v6) : même principe que Mnemart et son atelier phonétique.
   PRON_COMMUNE : écritures valables pour toutes les voix (« sœur » → « seur », sinon certaines voix disent « sourd »).
   PRON_PAR_VOIX : écritures propres à une voix, repérée par un morceau de son nom ; '' = lire le mot tel quel.
   Point de départ : les réglages de l'atelier de Mnemart pour les mots que MNEMOGRAM utilise. Les exports de
   l'atelier MNEMOGRAM (bouton « Copier pour Claude ») viendront compléter ces deux tables.
   Un nom commun se dit pareil au singulier et au pluriel : régler « sœur » règle aussi « sœurs ».
   ------------------------------------------------------------ */
const PRON_COMMUNE = {
  'sœur': 'seur',
  'soeur': 'seur',
  'poisson': 'Pouasson',
  'paul': 'pol',
  /* v104 : export de l'atelier de prononciation du 25 novembre */
  'claquaient': 'clakè', 'claquais': 'clakè', 'claquait': 'clakè',
  'colomb': 'colon', 'gizeh': 'guizé', 'juteuses': 'jutt-euse',
  'moyen âge': 'moyen-âge', 'oeuf': 'euf', 'oeufs': 'eux', 'œuf': 'euf', 'œufs': 'eux',
  'sandwich': 'sand-witch', 'semer': 'semé', 'trampoline': 'tranpoline',
  /* v104 : liaisons oubliées ou fautives signalées par Stéphane, et mots mal lus */
  'sommes allés': 'sommes zallés', 'sommes allées': 'sommes zallées',
  "s'est assis": "s'est tassis", "s'est assise": "s'est tassise",
  'vont à': 'von ta', 'fait un': 'fai tun', 'en amérique': 'en nAmérique',
  'nez orange': 'né orange', 'chacun aura': 'chacun, aura',
  'chassent': 'chasse', 'montons': 'mon-tons', 'gelaient': 'jelè', 'levons': 'leuvons',
  'les os': 'lé zo', 'des os': 'dé zo', 'ses os': 'sé zo',
};
const PRON_PAR_VOIX = {
  'français france': { 'paul': '' },
  'français canada': { 'paul': '' },
  'hortense': { 'paul': '', 'sandwich': 'sandwitch' },
  'julie': { 'paul': '', 'sandwich': 'sandwitch' },
  'paul': { 'paul': '', 'sandwich': 'sandwitch' },
  'vivienne': { 'poisson': 'Poisson', 'juteuses': 'juteuse' },
  'rémy': { 'poisson': 'Poisson', 'juteuses': 'juteuse' },
  'jean': { 'juteuses': 'juteuse' }, 'antoine': { 'juteuses': 'juteuse' }, 'thierry': { 'juteuses': 'juteuse' },
  'denise': { 'juteuses': 'juteuse' }, 'henri': { 'juteuses': 'juteuse' }, 'eloise': { 'juteuses': 'juteuse' },
};
const sansAccents = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[()\-_]+/g, ' ').replace(/\s+/g, ' ').trim();
function pronOverrides(voice) {
  const name = sansAccents(voice?.name);
  if (!name) return null;
  const hit = Object.keys(PRON_PAR_VOIX).find((part) => name.includes(sansAccents(part)));
  return hit ? PRON_PAR_VOIX[hit] : null;
}
const reEsc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* v104 : quelques règles générales, valables pour tous les textes, avant la table des mots */
const LETTRE_DITE = { a: 'a', b: 'bé', c: 'cé', d: 'dé', e: 'eu', é: 'é', è: 'è', ê: 'ê', f: 'èf', g: 'jé', h: 'ache', i: 'i', î: 'i', j: 'ji', k: 'ka', l: 'èl', m: 'èm', n: 'èn', o: 'o', ô: 'ô', p: 'pé', q: 'ku', r: 'èr', s: 'èss', t: 'té', u: 'u', û: 'u', v: 'vé', w: 'double vé', x: 'iks', y: 'i grec', z: 'zèd', ç: 'cé cédille', â: 'â' };
const GENT_NOMS = new Set(['argent', 'agent', 'agents', 'urgent', 'sergent', 'régent', 'négligent', 'intelligent', 'diligent', 'indulgent', 'émergent', 'gent', 'entregent', 'contingent', 'tangent', 'convergent', 'divergent']);
function reglesPrononciation(out) {
  /* une terminaison écrite seule (-ez, -ons, -ent, -er) se lit lettre par lettre : « e, z » et non « é » */
  out = out.replace(/(^|[\s«(])-([a-zàâçéèêîôûœ]{1,5})(?=[\s»,.;:)!?]|$)/giu, (m, a, t) => `${a}${[...t.toLowerCase()].map((l) => LETTRE_DITE[l] || l).join(', ')}`);
  /* futur et conditionnel en -rr- (courir, mourir, pouvoir, voir, envoyer, acquérir) : on fait entendre le double r */
  out = out.replace(/(?<![\p{L}])(\p{L}*?(?:cour|mour|pour|ver|enver|acquer))r(ai|as|a|ons|ez|ont|ais|ait|ions|iez|aient)(?![\p{L}])/giu, '$1-r$2');
  /* les verbes en -ger au pluriel (rangent, rechargent) : la voix les lisait comme des participes (« rangeant ») */
  out = out.replace(/(?<![\p{L}])(\p{L}+)gent(?![\p{L}])/giu, (m, b) => (GENT_NOMS.has(m.toLowerCase()) ? m : `${b}ge`));
  /* dix et six : « di » devant une consonne, « diz » devant une voyelle, « disse » en fin de groupe */
  /* MNEMOMATHS : devant « plus, moins, fois, divisé, égale, et demi », on dit « disse », « sisse » (six plus quatre) */
  out = out.replace(/(?<![\p{L}\p{N}-])(dix|six|10|6)(?![\p{L}\p{N},.-])(\s+)?(\p{L})?/giu, (m, n, sp, l, pos, all) => {
    const base = /^(dix|10)$/i.test(n) ? 'di' : 'si';
    if (sp && l && /^(plus|moins|fois|divis|égal|egal|font|fait|et demi)/i.test(all.slice(pos + n.length + sp.length))) return `${base}sse${sp}${l}`;
    if (!sp || !l) return `${base}sse${sp || ''}${l || ''}`;
    if (/[aeiouyéèêàâîôûœh]/i.test(l)) return `${base}z ${l}`;
    return `${base} ${l}`;
  });
  /* sigles des classes */
  out = out.replace(/(?<![\p{L}])(CP|CE1|CE2|CM1|CM2)(?![\p{L}\p{N}])/gu, (m) => ({ CP: 'cé-pé', CE1: 'cé-eu un', CE2: 'cé-eu deux', CM1: 'cé-èm un', CM2: 'cé-èm deux' }[m]));
  /* le point d'interrogation collé au dernier mot : certaines voix montent alors mieux le ton */
  out = out.replace(/\s+([?!])/g, '$1');
  return out;
}
function fixPronunciation(text, voice) {
  let out = reglesPrononciation(String(text || ''));
  const NB = '(?<![\\p{L}\\p{N}])', NA = '(?![\\p{L}\\p{N}])';
  const vo = pronOverrides(voice) || {};
  const keys = [...new Set([...Object.keys(PRON_COMMUNE), ...Object.keys(vo)])].sort((a, b) => b.length - a.length);   /* expressions avant les mots seuls */
  keys.forEach((k) => {
    const right = Object.prototype.hasOwnProperty.call(vo, k) ? vo[k] : PRON_COMMUNE[k];
    if (right === '' || right === undefined) return;
    const pluriel = /\s/.test(k) ? '' : '(?:s|x)?';
    out = out.replace(new RegExp(`${NB}${reEsc(k)}${pluriel}${NA}`, 'giu'), right);
  });
  /* v102 : les sigles se lisent lettre par lettre (COD et non « code », COI et non « quoi ») */
  const SIGLES = { COD: 'cé-o-dé', COI: 'cé-o-i', COS: 'cé-o-èss', CC: 'cé-cé', CCL: 'cé-cé-èl', GN: 'gé-ène', GNS: 'gé-ène-èss', GV: 'gé-vé', CDN: 'cé-dé-ène' };
  out = out.replace(/(?<![\p{L}])(COD|COI|COS|CCL|CC|GNS|GN|GV|CDN)(?![\p{L}])/gu, (m) => SIGLES[m]);
  /* v92 : sujet inversé après un verbe en -t ou -d : on écrit la liaison pour la voix (répondit-elle → répondi-t-elle) */
  out = out.replace(/(\p{L}{2,}?)[td]-(il|elle|on|ils|elles)(?![\p{L}])/giu, '$1-t-$2');
  return out;
}

/* v5 : voix plus dynamiques. Les sorciers parlent vite et avec entrain (débit 1,25 ; voix un peu plus aiguë
   pour les gentils, un peu plus grave pour les grincheux). La phrase de l'exercice, elle, reste lue à un débit
   normal (1,05), pour que l'enfant ait le temps de suivre les mots. */
const VOICE_STYLES = {
  good: { rate: 1.25, pitch: 1.2 },
  bad: { rate: 1.2, pitch: 0.9 },
  phrase: { rate: 1.05, pitch: 1 },
};
function speak(text, prefer, style = 'good', enchaine = false) {
  if (!volumeLevel || !('speechSynthesis' in window)) return;
  if (!enchaine) speechSynthesis.cancel();   /* enchaine = true : se dit après la phrase en cours, sans la couper */
  const v = pickFrenchVoice(prefer);
  const u = new SpeechSynthesisUtterance(fixPronunciation(text, v).replace(/…/g, ', '));
  u.lang = 'fr-FR';
  if (v) u.voice = v;
  const st = VOICE_STYLES[style] || VOICE_STYLES.good;
  u.volume = volumeLevel / 5;
  u.rate = st.rate;
  u.pitch = st.pitch;
  speechSynthesis.speak(u);
}
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};


/* ------------------------------------------------------------
   LA VOIX ET LES MATHÉMATIQUES
   La voix lit mal les signes et les abréviations : on les écrit en toutes lettres avant de la faire parler.
   « 7 × 8 = ? » → « 7 fois 8 égale combien ? » ; « 3 cm » → « 3 centimètres » ; « 3 h 15 » → « 3 heures 15 ».
   ------------------------------------------------------------ */
const UNITES_DITES = { mm: 'millimètres', cm: 'centimètres', dm: 'décimètres', m: 'mètres', km: 'kilomètres', g: 'grammes', kg: 'kilogrammes', L: 'litres', cL: 'centilitres', mL: 'millilitres', min: 'minutes', s: 'secondes' };
function voixMaths(t) {
  let s = String(t || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[  ]/g, ' ');
  s = s.replace(/(\d) (?=\d{3}\b)/g, '$1');                     /* 3 452 → 3452 : la voix lit le nombre entier */
  s = s.replace(/(\d+)\s*\/\s*(\d+)/g, (m, a, b) => fracMots(Number(a), Number(b)));
  const nb = (n, mot) => `${n} ${n === '1' ? mot.replace(/s$/, '') : mot}`;
  s = s.replace(/(\d+) h (\d+)/g, (m, h, mi) => `${nb(h, 'heures')} ${mi}`).replace(/(\d+) h\b/g, (m, h) => nb(h, 'heures'));
  s = s.replace(/(\d+(?:,\d+)?) ?€/g, (m, n) => nb(n, 'euros')).replace(/(\d+) c\b/g, (m, n) => nb(n, 'centimes'));
  s = s.replace(/(\d+(?:,\d+)?) ?(mm|cm|dm|km|kg|cL|mL|min|m|g|L|s)\b/g, (m, n, u) => nb(n, UNITES_DITES[u]));
  s = s.replace(/…\s*(mm|cm|dm|km|kg|cL|mL|min|m|g|L|s)\b/g, (m, u) => `combien de ${UNITES_DITES[u]}`);
  s = s.replace(/…\s*(?=[a-zàâéèêîôûç])(?!de\b)/gi, 'combien de ');
  s = s.replace(/×/g, ' fois ').replace(/÷/g, ' divisé par ').replace(/\+/g, ' plus ').replace(/−/g, ' moins ').replace(/ - /g, ' moins ');
  s = s.replace(/= ?\?/g, ' égale combien ?').replace(/=/g, ' égale ').replace(/</g, ' est plus petit que ').replace(/>/g, ' est plus grand que ');
  s = s.replace(/…/g, ' combien ').replace(/\?/g, ' ?').replace(/\s+/g, ' ').trim();
  return s;
}

/* ------------------------------------------------------------
   LES NOMBRES EN LETTRES (orthographe traditionnelle, celle des manuels de CE)
   ------------------------------------------------------------ */
const U_MOTS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
const D_MOTS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
function moins100(n) {
  if (n < 17) return U_MOTS[n];
  if (n < 20) return `dix-${U_MOTS[n - 10]}`;
  const d = Math.floor(n / 10), u = n % 10;
  if (d === 7) return u === 1 ? 'soixante et onze' : `soixante-${moins100(10 + u)}`;
  if (d === 8) return u === 0 ? 'quatre-vingts' : `quatre-vingt-${U_MOTS[u]}`;
  if (d === 9) return `quatre-vingt-${moins100(10 + u)}`;
  return D_MOTS[d] + (u === 0 ? '' : u === 1 ? ' et un' : `-${U_MOTS[u]}`);
}
function moins1000(n, devantMille) {
  const c = Math.floor(n / 100), r = n % 100;
  let s = '';
  if (c) s = (c > 1 ? `${U_MOTS[c]} ` : '') + 'cent' + (c > 1 && r === 0 && !devantMille ? 's' : '');
  if (r) {
    let m = moins100(r);
    if (devantMille && m === 'quatre-vingts') m = 'quatre-vingt';
    s += (s ? ' ' : '') + m;
  }
  return s;
}
function enLettres(n) {
  if (n === 0) return 'zéro';
  const mi = Math.floor(n / 1000), r = n % 1000;
  return [mi ? (mi === 1 ? 'mille' : `${moins1000(mi, true)} mille`) : '', r ? moins1000(r, false) : ''].filter(Boolean).join(' ');
}
/* les fractions en mots : « un quart », « trois cinquièmes » */
const FRAC_NOMS = { 2: 'demi', 3: 'tiers', 4: 'quart', 5: 'cinquième', 6: 'sixième', 7: 'septième', 8: 'huitième', 9: 'neuvième', 10: 'dixième', 12: 'douzième' };
function fracMots(n, d) {
  const nom = FRAC_NOMS[d] || `${enLettres(d)}ième`;
  return `${n === 1 ? 'un' : enLettres(n)} ${nom}${n > 1 && !/s$/.test(nom) ? 's' : ''}`;
}
const fracHtml = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;

/* ------------------------------------------------------------
   ÉCRIRE ET LIRE LES NOMBRES
   À l'écran : espace fine entre les classes (3 452), virgule pour les décimaux (4,50).
   L'élève peut écrire « 3452 », « 3 452 », « 4.5 » ou « 4,50 » : on compare la valeur.
   ------------------------------------------------------------ */
const NNBSP = ' ';
function fmtN(x, dec) {
  let s = dec != null ? Number(x).toFixed(dec) : String(Math.round(x * 1000) / 1000);
  let [ent, frac] = s.split('.');
  const neg = ent.startsWith('-'); if (neg) ent = ent.slice(1);
  if (ent.length > 3) ent = ent.replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP);
  return (neg ? '−' : '') + ent + (frac ? `,${frac}` : '');
}
const fmtEuros = (c) => (c % 100 ? `${fmtN(c / 100, 2)} €` : `${fmtN(c / 100)} €`);
const fmtHeure = (min) => { const h = Math.floor(min / 60) % 24, m = min % 60; return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`; };
const fmtDuree = (min) => { const h = Math.floor(min / 60), m = min % 60; return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`; };
function lisNombre(s) {
  const t = String(s || '').replace(/[\s  ]/g, '').replace(',', '.').replace(/(€|[a-zA-Zé²³]+)$/, '');
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}
/* une heure ou une durée écrite par l'élève : « 15 h 45 », « 15h45 », « 15:45 », « 1 h 15 min », « 90 min » */
function lisMinutes(s) {
  const t = String(s || '').toLowerCase().replace(/[\s  ]/g, '');
  let m = t.match(/^(\d{1,2})(?:h|:)(\d{1,2})?(?:min)?$/); if (m) return Number(m[1]) * 60 + Number(m[2] || 0);
  m = t.match(/^(\d+)min$/); if (m) return Number(m[1]);
  return NaN;
}
const normTexte = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[\s  ]/g, '');

/* ------------------------------------------------------------
   LE PORTAIL DES NIVEAUX (comme dans MNEMOGRAM)
   Quatre onglets au-dessus des trois parties. Les trois parties suivent les trois domaines du programme officiel.
   « avenir » : un exercice prévu dans la progression, pas encore construit (bouton grisé « bientôt »).
   gen : le nom du fabricant de questions (voir GEN plus bas) ; n : le nombre de questions d'une partie.
   ------------------------------------------------------------ */
const CLASSES = [
  { id: 'ce', nom: 'CE1 – CE2', cycle: 'cycle 2' },
  { id: 'cm', nom: 'CM1 – CM2', cycle: 'cycle 3' },
  { id: '65', nom: '6e – 5e', cycle: 'fin du cycle 3, début du cycle 4' },
  { id: '43', nom: '4e – 3e', cycle: 'cycle 4' },
];
const PARTIES = ['nombres', 'grandeurs', 'geometrie'];
const PARTIES_NOM = { nombres: 'Nombres et calculs', grandeurs: 'Grandeurs et mesures', geometrie: 'Espace et géométrie' };
const regle = '<strong>Si tu te trompes, tu as droit à un deuxième essai.</strong> Chaque bonne réponse du premier coup vaut 1 point.';
const PARCOURS = {
  nombres: [
    { jeu: 'ce-num', gen: 'num', titre: 'Lire et écrire les nombres', classes: ['ce'],
      consigne: `Écris des nombres en chiffres, trouve le chiffre des unités, des dizaines, des centaines ou des milliers, et recompose des nombres. On commence avec les nombres jusqu'à 1 000, puis on va jusqu'à 10 000. ${regle}` },
    { jeu: 'ce-comp', gen: 'comp', titre: 'Comparer les nombres', classes: ['ce'],
      consigne: `Compare deux nombres avec les signes <strong>&lt;</strong> (plus petit que), <strong>&gt;</strong> (plus grand que) ou <strong>=</strong> (égal à), et trouve le plus grand nombre d'une liste. Astuce : on compare d'abord le nombre de chiffres, puis les chiffres un par un, en partant de la gauche. ${regle}` },
    { jeu: 'ce-addsous', gen: 'addsous', titre: 'Additions et soustractions', classes: ['ce'],
      consigne: `Calcule des additions et des soustractions, d'abord de tête, puis en posant l'opération (sur ton ardoise ou sur une feuille). Après chaque réponse, tu verras comment faire le calcul. ${regle}` },
    { jeu: 'ce-tables', gen: 'tables', titre: 'Les tables de multiplication', classes: ['ce'],
      consigne: `Des questions sur les tables de multiplication, à savoir <strong>par cœur</strong> : d'abord les tables de 2, 3, 4 et 5 (CE1), puis celles de 6, 7, 8 et 9 (CE2). Après chaque réponse, une astuce t'aide à t'en souvenir. ${regle}` },
    { jeu: 'ce-mult', gen: 'mult', titre: 'Multiplier et partager', classes: ['ce'],
      consigne: `Multiplie par 10 et par 100, cherche le double et la moitié, calcule des multiplications posées, et partage en parts égales. ${regle}` },
    { jeu: 'ce-frac', gen: 'frac', titre: 'Les fractions', classes: ['ce'],
      consigne: `Une figure est partagée en <strong>parts égales</strong>, et certaines parts sont coloriées. Choisis la fraction qui correspond : le nombre du bas dit en combien de parts on a partagé, le nombre du haut dit combien de parts on a prises. ${regle}` },
    { jeu: 'ce-pb', gen: 'pb', titre: 'Résoudre des problèmes', classes: ['ce'],
      consigne: `Lis bien chaque petit problème. Demande-toi : est-ce qu'on ajoute, est-ce qu'on enlève, est-ce qu'on cherche ce qui manque, est-ce qu'il y a plusieurs fois la même quantité, ou est-ce qu'on partage ? Puis calcule et écris la réponse. ${regle}` },
    { jeu: 'ce-bilan-nb', mix: ['num', 'comp', 'addsous', 'tables', 'mult', 'frac', 'pb'], n: 14, titre: 'Tout sur les nombres et les calculs', classes: ['ce'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris sur les nombres et les calculs, mélangé. Quatorze questions, de plus en plus difficiles. ${regle}` },
    { titre: 'Les grands nombres (jusqu\'au milliard)', classes: ['cm'], avenir: true },
    { titre: 'Les nombres décimaux', classes: ['cm'], avenir: true },
    { titre: 'Les fractions et les décimaux', classes: ['cm'], avenir: true },
    { titre: 'Calculer avec les décimaux', classes: ['cm'], avenir: true },
    { titre: 'La division euclidienne', classes: ['cm'], avenir: true },
    { titre: 'La priorité des opérations', classes: ['65'], avenir: true },
    { titre: 'Les critères de divisibilité', classes: ['65'], avenir: true },
    { titre: 'Les nombres relatifs : comparer, additionner, soustraire', classes: ['65'], avenir: true },
    { titre: 'Les fractions : comparer, additionner, soustraire', classes: ['65'], avenir: true },
    { titre: 'Le calcul littéral : la lettre dans les calculs', classes: ['65'], avenir: true },
    { titre: 'Multiplier et diviser les relatifs et les fractions', classes: ['43'], avenir: true },
    { titre: 'Les puissances et la notation scientifique', classes: ['43'], avenir: true },
    { titre: 'Développer, factoriser, les identités remarquables', classes: ['43'], avenir: true },
    { titre: 'Les équations et les inéquations', classes: ['43'], avenir: true },
    { titre: 'Les nombres premiers', classes: ['43'], avenir: true },
    { titre: 'Les fonctions linéaires et affines', classes: ['43'], avenir: true },
  ],
  grandeurs: [
    { jeu: 'ce-heure', gen: 'heure', titre: 'Lire l\'heure', classes: ['ce'],
      consigne: `Regarde l'horloge et choisis l'heure qu'elle indique. La <strong>petite aiguille</strong> montre les heures, la <strong>grande aiguille</strong> montre les minutes. On commence par les heures et les demi-heures, puis les quarts d'heure, puis les minutes. ${regle}` },
    { jeu: 'ce-durees', gen: 'durees', titre: 'Les durées et le calendrier', classes: ['ce'],
      consigne: `Combien de minutes dans une heure ? À quelle heure finit le film ? Quel jour serons-nous dans trois jours ? Pour écrire une heure, tape par exemple <strong>15 h 45</strong> (la touche « h » est sur le clavier). ${regle}` },
    { jeu: 'ce-long', gen: 'long', titre: 'Les longueurs', classes: ['ce'],
      consigne: `Choisis la bonne unité (millimètre, centimètre, mètre, kilomètre), convertis des longueurs et compare-les. Retiens bien : <strong>1 m = 100 cm</strong>, <strong>1 km = 1 000 m</strong>, <strong>1 cm = 10 mm</strong>. ${regle}` },
    { jeu: 'ce-masse', gen: 'masse', titre: 'Les masses et les contenances', classes: ['ce'],
      consigne: `Choisis la bonne unité pour peser (gramme, kilogramme) ou pour dire ce que contient un récipient (litre, centilitre), et convertis. Retiens bien : <strong>1 kg = 1 000 g</strong> et <strong>1 L = 100 cL</strong>. ${regle}` },
    { jeu: 'ce-monnaie', gen: 'monnaie', titre: 'La monnaie', classes: ['ce'],
      consigne: `Compte les billets et les pièces, puis calcule combien on te rend. Commence toujours par les billets, puis les grosses pièces. Retiens bien : <strong>1 € = 100 centimes</strong>. Pour écrire 4 euros 50, tape <strong>4,50</strong>. ${regle}` },
    { jeu: 'ce-perim', gen: 'perim', titre: 'Le périmètre', classes: ['ce'],
      consigne: `Le <strong>périmètre</strong> d'une figure, c'est la longueur de son tour. Pour le calculer, on additionne les longueurs de tous ses côtés. ${regle}` },
    { jeu: 'ce-bilan-gr', mix: ['heure', 'durees', 'long', 'masse', 'monnaie', 'perim'], n: 12, titre: 'Tout sur les grandeurs et les mesures', classes: ['ce'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris sur les grandeurs et les mesures, mélangé. Douze questions, de plus en plus difficiles. ${regle}` },
    { titre: 'Aire et périmètre', classes: ['cm'], avenir: true },
    { titre: 'Comparer et mesurer les angles', classes: ['cm'], avenir: true },
    { titre: 'Les situations de proportionnalité', classes: ['cm'], avenir: true },
    { titre: 'Les formules d\'aire du carré et du rectangle', classes: ['cm'], avenir: true },
    { titre: 'Les pourcentages, les échelles, les vitesses', classes: ['cm'], avenir: true },
    { titre: 'Longueur du cercle et aire du disque', classes: ['65'], avenir: true },
    { titre: 'Les volumes du cube et du pavé droit', classes: ['65'], avenir: true },
    { titre: 'Le coefficient de proportionnalité', classes: ['65'], avenir: true },
    { titre: 'Statistiques : effectifs, fréquences, moyenne', classes: ['65'], avenir: true },
    { titre: 'Les probabilités', classes: ['65', '43'], avenir: true },
    { titre: 'Médiane et étendue', classes: ['43'], avenir: true },
    { titre: 'Les grandeurs composées : vitesse, débit, masse volumique', classes: ['43'], avenir: true },
    { titre: 'Volumes de la pyramide, du cône et de la boule', classes: ['43'], avenir: true },
  ],
  geometrie: [
    { jeu: 'ce-figures', gen: 'figures', titre: 'Reconnaître les figures planes', classes: ['ce'],
      consigne: `Regarde la figure dessinée sur l'ardoise et choisis son nom. Compte ses côtés, regarde s'ils ont la même longueur et si ses angles sont droits. Choisis toujours le <strong>nom le plus précis</strong> : un carré est aussi un rectangle, mais on l'appelle carré ! ${regle}` },
    { jeu: 'ce-solides', gen: 'solides', titre: 'Les solides', classes: ['ce'],
      consigne: `Reconnais le cube, le pavé droit, la boule, le cylindre, le cône et la pyramide, et compte leurs faces et leurs sommets. Les traits en pointillés sont les arêtes cachées, celles qu'on ne verrait pas. ${regle}` },
    { jeu: 'ce-angle', gen: 'angle', titre: 'L\'angle droit', classes: ['ce'],
      consigne: `Est-ce un <strong>angle droit</strong> ? Imagine que tu poses le coin de ton équerre sur le sommet de l'angle. Si l'angle est plus fermé que l'équerre, il est plus petit qu'un angle droit ; s'il est plus ouvert, il est plus grand. ${regle}` },
    { jeu: 'ce-sym', gen: 'sym', titre: 'La symétrie', classes: ['ce'],
      consigne: `Une figure est dessinée sur un quadrillage, avec une droite en pointillés. Imagine que tu plies la feuille le long de cette droite : si les deux moitiés se recouvrent exactement, case par case, la droite est un <strong>axe de symétrie</strong>. ${regle}` },
    { jeu: 'ce-cercle', gen: 'cercle', titre: 'Le cercle et les instruments', classes: ['ce'],
      consigne: `Reconnais le <strong>centre</strong>, un <strong>rayon</strong> et un <strong>diamètre</strong> du cercle, et choisis le bon instrument : la règle, l'équerre ou le compas. ${regle}` },
    { jeu: 'ce-repere', gen: 'repere', titre: 'Se repérer sur un quadrillage', classes: ['ce'],
      consigne: `Pour nommer une case, on donne d'abord la <strong>lettre de sa colonne</strong>, puis le <strong>numéro de sa ligne</strong> : B3, c'est la colonne B et la ligne 3. Ensuite, suis les déplacements du robot. ${regle}` },
    { jeu: 'ce-bilan-geo', mix: ['figures', 'solides', 'angle', 'sym', 'cercle', 'repere'], n: 12, titre: 'Tout sur l\'espace et la géométrie', classes: ['ce'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris sur l'espace et la géométrie, mélangé. Douze questions. ${regle}` },
    { titre: 'Droites perpendiculaires et parallèles', classes: ['cm'], avenir: true },
    { titre: 'Les quadrilatères et les triangles particuliers', classes: ['cm'], avenir: true },
    { titre: 'Les patrons du cube et du pavé droit', classes: ['cm'], avenir: true },
    { titre: 'Les programmes de construction', classes: ['cm'], avenir: true },
    { titre: 'Programmer les déplacements d\'un lutin', classes: ['cm'], avenir: true },
    { titre: 'Segment, droite, demi-droite : les notations', classes: ['65'], avenir: true },
    { titre: 'La médiatrice d\'un segment', classes: ['65'], avenir: true },
    { titre: 'La symétrie centrale', classes: ['65'], avenir: true },
    { titre: 'Les angles et les droites parallèles', classes: ['65'], avenir: true },
    { titre: 'Les parallélogrammes', classes: ['65'], avenir: true },
    { titre: 'Le théorème de Pythagore', classes: ['43'], avenir: true },
    { titre: 'Translations et rotations', classes: ['43'], avenir: true },
    { titre: 'Le théorème de Thalès', classes: ['43'], avenir: true },
    { titre: 'La trigonométrie dans le triangle rectangle', classes: ['43'], avenir: true },
    { titre: 'Homothéties, agrandissements et réductions', classes: ['43'], avenir: true },
  ],
};


/* ------------------------------------------------------------
   LES FIGURES, DESSINÉES À LA CRAIE SUR L'ARDOISE
   Craie blanche pour les traits, craies de couleur pour ce qu'on regarde.
   ------------------------------------------------------------ */
const CRAIE = '#f4f1e6', JAUNE = '#ffe066', ROSE = '#ff9ec7', BLEU = '#8fd3ff', VERT = '#9be59b', ROUGE = '#ff7a6b';
const svgArdoise = (w, h, corps, label) => `<svg class="mm-svg" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label || ''}">${corps}</svg>`;
const txt = (x, y, t, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.ancre || 'middle'}" dominant-baseline="middle" font-family="Comic Sans MS, Chalkboard SE, cursive" font-size="${o.taille || 16}" font-weight="${o.gras ? 700 : 400}" fill="${o.c || CRAIE}">${t}</text>`;
const pts = (P) => P.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
function tourne(P, deg, cx, cy) {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return P.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
}
/* une marque d'angle droit (petit carré) au sommet B, entre les côtés BA et BC */
function marqueDroit(A, B, C, t = 12, c = JAUNE) {
  const u = (P) => { const dx = P[0] - B[0], dy = P[1] - B[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
  const [ax, ay] = u(A), [cx, cy] = u(C);
  return `<path d="M${B[0] + ax * t} ${B[1] + ay * t} L${B[0] + (ax + cx) * t} ${B[1] + (ay + cy) * t} L${B[0] + cx * t} ${B[1] + cy * t}" fill="none" stroke="${c}" stroke-width="2"/>`;
}

/* --- l'horloge : la petite aiguille avance aussi avec les minutes --- */
function figHorloge(h, m) {
  const cx = 110, cy = 110, R = 92;
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="rgba(255,255,255,.06)" stroke="${CRAIE}" stroke-width="4"/>`;
  for (let i = 0; i < 60; i += 1) {
    const a = (i * 6 * Math.PI) / 180, l = i % 5 ? 5 : 11;
    s += `<line x1="${cx + Math.sin(a) * (R - 3)}" y1="${cy - Math.cos(a) * (R - 3)}" x2="${cx + Math.sin(a) * (R - 3 - l)}" y2="${cy - Math.cos(a) * (R - 3 - l)}" stroke="${CRAIE}" stroke-width="${i % 5 ? 1.2 : 2.5}"/>`;
  }
  for (let k = 1; k <= 12; k += 1) { const a = (k * 30 * Math.PI) / 180; s += txt(cx + Math.sin(a) * (R - 26), cy - Math.cos(a) * (R - 26) + 1, k, { taille: 18, gras: true }); }
  const ah = (((h % 12) + m / 60) * 30 * Math.PI) / 180, am = (m * 6 * Math.PI) / 180;
  s += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.sin(ah) * 50}" y2="${cy - Math.cos(ah) * 50}" stroke="${ROSE}" stroke-width="8" stroke-linecap="round"/>`;
  s += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.sin(am) * 76}" y2="${cy - Math.cos(am) * 76}" stroke="${BLEU}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="6" fill="${CRAIE}"/>`;
  return svgArdoise(220, 220, s, 'Une horloge à aiguilles');
}

/* --- une fraction : disque en secteurs, ou bande en parts --- */
function figFraction(n, d, forme) {
  let s = '';
  if (forme === 'disque') {
    const cx = 110, cy = 100, R = 80;
    for (let i = 0; i < d; i += 1) {
      const a0 = (i / d) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2;
      const p0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
      s += `<path d="M${cx} ${cy} L${p0[0]} ${p0[1]} A${R} ${R} 0 ${1 / d > 0.5 ? 1 : 0} 1 ${p1[0]} ${p1[1]} Z" fill="${i < n ? JAUNE : 'rgba(255,255,255,.05)'}" fill-opacity="${i < n ? 0.92 : 1}" stroke="${CRAIE}" stroke-width="3"/>`;
    }
    return svgArdoise(220, 200, s, 'Un disque partagé en parts égales');
  }
  const W = 300, x0 = 10, h = 70, y0 = 40, w = W / d;
  for (let i = 0; i < d; i += 1) s += `<rect x="${x0 + i * w}" y="${y0}" width="${w}" height="${h}" fill="${i < n ? JAUNE : 'rgba(255,255,255,.05)'}" fill-opacity="${i < n ? 0.92 : 1}" stroke="${CRAIE}" stroke-width="3"/>`;
  return svgArdoise(320, 150, s, 'Une bande partagée en parts égales');
}

/* --- les billets et les pièces --- */
function figMonnaie(valeurs) {
  let s = '', x = 14, y = 16, hLigne = 0;
  const W = 340;
  valeurs.forEach((v) => {
    if (v >= 500) {
      const w = 96, h = 52; if (x + w > W) { x = 14; y += hLigne + 12; hLigne = 0; }
      const c = { 500: '#9aa7b1', 1000: '#e8908a', 2000: '#7fa6d8', 5000: '#e3a35f' }[v];
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${c}" stroke="${CRAIE}" stroke-width="2.5"/><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" rx="3" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.2"/>${txt(x + w / 2, y + h / 2 + 1, `${v / 100} €`, { taille: 20, gras: true, c: '#1b2a22' })}`;
      x += w + 10; hLigne = Math.max(hLigne, h);
    } else {
      const r = { 1: 13, 2: 14, 5: 16, 10: 15, 20: 17, 50: 19, 100: 21, 200: 23 }[v];
      if (x + 2 * r > W) { x = 14; y += hLigne + 12; hLigne = 0; }
      const cuivre = v < 10, euro = v >= 100;
      const fond = cuivre ? '#c8774a' : euro ? '#d9c37a' : '#e2c24f';
      s += `<circle cx="${x + r}" cy="${y + r}" r="${r}" fill="${fond}" stroke="${CRAIE}" stroke-width="2"/>${euro ? `<circle cx="${x + r}" cy="${y + r}" r="${r - 6}" fill="${v === 100 ? '#c9cfd4' : '#d9c37a'}" stroke="${v === 100 ? '#d9c37a' : '#c9cfd4'}" stroke-width="3"/>` : ''}${txt(x + r, y + r + 1, euro ? `${v / 100} €` : `${v} c`, { taille: euro ? 13 : 11, gras: true, c: '#2b2118' })}`;
      x += 2 * r + 10; hLigne = Math.max(hLigne, 2 * r);
    }
  });
  return svgArdoise(W + 14, y + hLigne + 16, s, 'Des billets et des pièces');
}

/* --- un polygone avec la longueur de ses côtés --- */
function figPolygone(P, longueurs, o = {}) {
  const cx = P.reduce((t, p) => t + p[0], 0) / P.length, cy = P.reduce((t, p) => t + p[1], 0) / P.length;
  let s = `<polygon points="${pts(P)}" fill="rgba(255,255,255,.06)" stroke="${CRAIE}" stroke-width="3.5" stroke-linejoin="round"/>`;
  if (longueurs) P.forEach((A, i) => {
    const B = P[(i + 1) % P.length], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
    const dx = mx - cx, dy = my - cy, l = Math.hypot(dx, dy) || 1;
    if (longueurs[i] != null) s += txt(mx + (dx / l) * 22, my + (dy / l) * 16, longueurs[i], { taille: 16, gras: true, c: JAUNE });
  });
  (o.droits || []).forEach((k) => { s += marqueDroit(P[(k + P.length - 1) % P.length], P[k], P[(k + 1) % P.length], 12, o.couleurDroit || CRAIE); });
  return svgArdoise(o.w || 320, o.h || 240, s, o.label || 'Une figure');
}
/* un triangle dont les côtés mesurent a, b, c (en cm), dessiné à l'échelle */
function pointsTriangle(a, b, c, echelle) {
  /* A en (0,0), B en (c,0), C trouvé par la loi des cosinus */
  const x = (b * b + c * c - a * a) / (2 * c), y = Math.sqrt(Math.max(0, b * b - x * x));
  return [[0, 0], [c * echelle, 0], [x * echelle, -y * echelle]];
}
function centre(P, W, H) {
  const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
  const dx = (W - (Math.max(...xs) + Math.min(...xs))) / 2, dy = (H - (Math.max(...ys) + Math.min(...ys))) / 2;
  return P.map(([x, y]) => [x + dx, y + dy]);
}

/* --- les solides, en perspective (les arêtes cachées en pointillés) --- */
function figSolide(type) {
  const cache = `stroke="${CRAIE}" stroke-width="2" stroke-dasharray="6 6" fill="none"`;
  const vu = `stroke="${CRAIE}" stroke-width="3.5" fill="rgba(255,255,255,.07)" stroke-linejoin="round"`;
  let s = '';
  if (type === 'cube' || type === 'pave') {
    const w = type === 'cube' ? 110 : 170, h = 110, p = type === 'cube' ? 110 : 70, dx = p * 0.45, dy = p * 0.4;
    const x0 = 160 - (w + dx) / 2, y0 = 70 + (110 - h) / 2 + dy / 2 - 20;
    const A = [x0, y0 + dy], B = [x0 + w, y0 + dy], C = [x0 + w, y0 + dy + h], D = [x0, y0 + dy + h];
    const E = [x0 + dx, y0], F = [x0 + w + dx, y0], G = [x0 + w + dx, y0 + h], Hh = [x0 + dx, y0 + h];
    s += `<path d="M${Hh} L${E} M${Hh} L${G} M${Hh} L${D}" ${cache}/>`;
    s += `<polygon points="${pts([A, B, C, D])}" ${vu}/><polygon points="${pts([A, E, F, B])}" ${vu}/><polygon points="${pts([B, F, G, C])}" ${vu}/>`;
  } else if (type === 'boule') {
    s += `<circle cx="160" cy="110" r="80" ${vu}/><path d="M80 110 A80 24 0 0 0 240 110" stroke="${CRAIE}" stroke-width="2.5" fill="none"/><path d="M80 110 A80 24 0 0 1 240 110" ${cache}/>`;
    s += `<ellipse cx="128" cy="78" rx="18" ry="10" fill="rgba(255,255,255,.25)" transform="rotate(-30 128 78)"/>`;
  } else if (type === 'cylindre') {
    s += `<path d="M95 50 L95 170 A65 20 0 0 0 225 170 L225 50" ${vu}/><ellipse cx="160" cy="50" rx="65" ry="20" ${vu}/><path d="M95 170 A65 20 0 0 1 225 170" ${cache}/>`;
  } else if (type === 'cone') {
    s += `<path d="M160 30 L92 170 A68 20 0 0 0 228 170 Z" ${vu}/><path d="M92 170 A68 20 0 0 1 228 170" ${cache}/>`;
  } else if (type === 'pyramide') {
    const S = [160, 28], A = [90, 175], B = [205, 185], C = [240, 150], D = [125, 140];
    s += `<path d="M${D} L${A} M${D} L${C} M${D} L${S}" ${cache}/>`;
    s += `<polygon points="${pts([S, A, B])}" ${vu}/><polygon points="${pts([S, B, C])}" ${vu}/>`;
  }
  return svgArdoise(320, 220, s, 'Un solide');
}

/* --- un angle : deux demi-droites de même origine ; avec l'équerre en pointillés pour la correction --- */
function figAngle(deg, rot, avecEquerre) {
  const O = [130, 165], L = 150;
  const bout = (a) => [O[0] + L * Math.cos((a * Math.PI) / 180), O[1] - L * Math.sin((a * Math.PI) / 180)];
  const A = bout(rot), B = bout(rot + deg);
  let s = `<path d="M${A[0]} ${A[1]} L${O[0]} ${O[1]} L${B[0]} ${B[1]}" fill="none" stroke="${CRAIE}" stroke-width="4" stroke-linecap="round"/>`;
  const r = 30, a0 = (rot * Math.PI) / 180, a1 = ((rot + deg) * Math.PI) / 180;
  s += `<path d="M${O[0] + r * Math.cos(a0)} ${O[1] - r * Math.sin(a0)} A${r} ${r} 0 0 0 ${O[0] + r * Math.cos(a1)} ${O[1] - r * Math.sin(a1)}" fill="none" stroke="${JAUNE}" stroke-width="3"/>`;
  s += `<circle cx="${O[0]}" cy="${O[1]}" r="4" fill="${CRAIE}"/>`;
  if (avecEquerre) {
    const E1 = [O[0] + 95 * Math.cos(a0), O[1] - 95 * Math.sin(a0)], E2 = [O[0] + 95 * Math.cos(a0 + Math.PI / 2), O[1] - 95 * Math.sin(a0 + Math.PI / 2)];
    s += `<polygon points="${pts([O, E1, E2])}" fill="rgba(143,211,255,.18)" stroke="${BLEU}" stroke-width="2.5" stroke-dasharray="7 5"/>${marqueDroit(E1, O, E2, 14, BLEU)}`;
  }
  return svgArdoise(300, 200, s, 'Un angle');
}

/* --- le quadrillage : cases coloriées et axe en pointillés --- */
function figQuadrillage(nc, nl, cases, o = {}) {
  const t = Math.min(34, Math.floor(300 / nc)), W = nc * t + 2 * 30, H = nl * t + 2 * 30, x0 = 30, y0 = 24;
  let s = '';
  for (let i = 0; i <= nc; i += 1) s += `<line x1="${x0 + i * t}" y1="${y0}" x2="${x0 + i * t}" y2="${y0 + nl * t}" stroke="rgba(244,241,230,.35)" stroke-width="1.2"/>`;
  for (let j = 0; j <= nl; j += 1) s += `<line x1="${x0}" y1="${y0 + j * t}" x2="${x0 + nc * t}" y2="${y0 + j * t}" stroke="rgba(244,241,230,.35)" stroke-width="1.2"/>`;
  cases.forEach(([c, l, coul]) => { s += `<rect x="${x0 + c * t + 2}" y="${y0 + l * t + 2}" width="${t - 4}" height="${t - 4}" rx="3" fill="${coul || JAUNE}" fill-opacity=".8"/>`; });
  (o.erreurs || []).forEach(([c, l]) => { s += `<rect x="${x0 + c * t + 1}" y="${y0 + l * t + 1}" width="${t - 2}" height="${t - 2}" rx="3" fill="none" stroke="${ROUGE}" stroke-width="3.5"/>`; });
  if (o.axeV != null) s += `<line x1="${x0 + o.axeV * t}" y1="${y0 - 14}" x2="${x0 + o.axeV * t}" y2="${y0 + nl * t + 14}" stroke="${ROSE}" stroke-width="3.5" stroke-dasharray="9 6"/>`;
  if (o.axeH != null) s += `<line x1="${x0 - 14}" y1="${y0 + o.axeH * t}" x2="${x0 + nc * t + 14}" y2="${y0 + o.axeH * t}" stroke="${ROSE}" stroke-width="3.5" stroke-dasharray="9 6"/>`;
  if (o.reperes) {
    for (let i = 0; i < nc; i += 1) s += txt(x0 + i * t + t / 2, y0 + nl * t + 15, 'ABCDEFGH'[i], { taille: 15, gras: true, c: JAUNE });
    for (let j = 0; j < nl; j += 1) s += txt(x0 - 14, y0 + j * t + t / 2, nl - j, { taille: 15, gras: true, c: JAUNE });
  }
  (o.icones || []).forEach(([c, l, ic]) => { s += txt(x0 + c * t + t / 2, y0 + l * t + t / 2 + 1, ic, { taille: t * 0.62 }); });
  (o.chemin || []).length > 1 && (s += `<polyline points="${o.chemin.map(([c, l]) => `${x0 + c * t + t / 2},${y0 + l * t + t / 2}`).join(' ')}" fill="none" stroke="${VERT}" stroke-width="3.5" stroke-dasharray="6 5" stroke-linecap="round"/>`);
  return svgArdoise(W, H + 6, s, 'Un quadrillage');
}

/* --- le cercle : centre, rayon, diamètre --- */
function figCercle(element, rot) {
  const cx = 150, cy = 110, R = 85, a = (rot * Math.PI) / 180;
  const P = [cx + R * Math.cos(a), cy - R * Math.sin(a)], Q = [cx - R * Math.cos(a), cy + R * Math.sin(a)];
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="rgba(255,255,255,.05)" stroke="${CRAIE}" stroke-width="3.5"/>`;
  if (element === 'rayon') s += `<line x1="${cx}" y1="${cy}" x2="${P[0]}" y2="${P[1]}" stroke="${JAUNE}" stroke-width="5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="3" fill="${CRAIE}"/>`;
  if (element === 'diametre') s += `<line x1="${Q[0]}" y1="${Q[1]}" x2="${P[0]}" y2="${P[1]}" stroke="${JAUNE}" stroke-width="5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="3" fill="${CRAIE}"/>`;
  if (element === 'centre') s += `<circle cx="${cx}" cy="${cy}" r="8" fill="${JAUNE}"/><path d="M${cx - 16} ${cy - 16} l-14 -14" stroke="${JAUNE}" stroke-width="3" stroke-linecap="round"/>`;
  return svgArdoise(300, 220, s, 'Un cercle');
}

/* --- les instruments de géométrie (pour les choix) --- */
const INSTRUMENTS = {
  'la règle': `<svg class="mm-ico" viewBox="0 0 120 40"><rect x="4" y="10" width="112" height="22" rx="3" fill="#f2c94c" stroke="#8a6d1f" stroke-width="2"/>${[...Array(11)].map((_, i) => `<line x1="${10 + i * 10}" y1="10" x2="${10 + i * 10}" y2="${i % 5 ? 17 : 21}" stroke="#8a6d1f" stroke-width="1.5"/>`).join('')}</svg>`,
  'l\'équerre': `<svg class="mm-ico" viewBox="0 0 60 60"><path d="M6 6 L6 54 L54 54 Z M14 24 L14 46 L36 46 Z" fill="#8fd3ff" fill-rule="evenodd" stroke="#2c6f96" stroke-width="2" stroke-linejoin="round"/></svg>`,
  'le compas': `<svg class="mm-ico" viewBox="0 0 60 60"><line x1="30" y1="10" x2="16" y2="54" stroke="#7f8a94" stroke-width="4" stroke-linecap="round"/><line x1="30" y1="10" x2="44" y2="54" stroke="#7f8a94" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="9" r="5" fill="#f2c94c" stroke="#8a6d1f" stroke-width="1.5"/></svg>`,
};

/* --- une petite opération posée, pour les explications --- */
function opPosee(a, b, signe, res, retenues) {
  const L = Math.max(String(a).length, String(b).length + 1, String(res).length);
  const ligne = (s, pre = '') => `<tr><td class="op-signe">${pre}</td>${String(s).padStart(L, ' ').split('').map((c) => `<td>${c.trim()}</td>`).join('')}</tr>`;
  const ret = retenues ? `<tr class="op-ret"><td></td>${retenues.padStart(L, ' ').split('').map((c) => `<td>${c.trim()}</td>`).join('')}</tr>` : '';
  return `<table class="op-posee">${ret}${ligne(a)}${ligne(b, signe)}<tr class="op-trait"><td colspan="${L + 1}"></td></tr>${ligne(res)}</table>`;
}
/* --- le tableau des milliers, centaines, dizaines, unités --- */
function tableauNum(x, surligne) {
  const ch = String(x).padStart(4, '0').split(''), noms = ['milliers', 'centaines', 'dizaines', 'unités'];
  const debut = String(x).length >= 4 ? 0 : 4 - String(x).length;
  return `<table class="tab-num"><tr>${noms.slice(debut).map((n, i) => `<th class="${surligne === i + debut ? 'on' : ''}">${n}</th>`).join('')}</tr><tr>${ch.slice(debut).map((c, i) => `<td class="${surligne === i + debut ? 'on' : ''}">${c}</td>`).join('')}</tr></table>`;
}


/* ------------------------------------------------------------
   LES FABRICANTS DE QUESTIONS
   Chaque fabricant reçoit p, qui va de 0 (première question) à 1 (dernière) : les questions deviennent
   plus difficiles au fil de la partie (CE1 au début, CE2 à la fin).
   Une question = {
     enonce   : ce qui s'écrit sur l'ardoise (HTML) ;
     figure   : un dessin à la craie (facultatif) ;
     saisie   : { type: 'nombre' | 'minutes', bonne, unite } pour une réponse à écrire ;
     choix    : [{ v, html }] et bonne : v, pour une réponse à choisir ;
     aussi    : des réponses vraies mais moins précises (pas d'erreur comptée, on demande le nom le plus précis) ;
     explication : ce qui s'affiche après la réponse, et que la voix lit ;
     rep      : la bonne réponse, dite par le sorcier (« C'est bien 56 ! ») ;
     notion   : pour le bilan de progression.
   }
   ------------------------------------------------------------ */
const GEN = {};
const PRENOMS = ['Léo', 'Lina', 'Tom', 'Inès', 'Hugo', 'Zoé', 'Sacha', 'Nina', 'Malik', 'Jade', 'Noah', 'Chloé'];
const FILLES = new Set(['Lina', 'Inès', 'Zoé', 'Nina', 'Jade', 'Chloé']);
const il = (P) => (FILLES.has(P) ? 'elle' : 'il');
const RANGS = ['milliers', 'centaines', 'dizaines', 'unités'];
const RANG_SING = { milliers: 'millier', centaines: 'centaine', dizaines: 'dizaine', unités: 'unité' };
const plur = (n, mot) => `${fmtN(n)} ${mot}${n > 1 ? 's' : ''}`;
const choixNombres = (L) => L.map((v) => ({ v: String(v), html: fmtN(v) }));
/* trois mauvaises réponses plausibles autour d'un nombre */
function voisins(x, ecarts) {
  const s = new Set();
  shuffle(ecarts).forEach((e) => { if (s.size < 3 && x + e > 0 && x + e !== x) s.add(x + e); });
  while (s.size < 3) { const v = x + rnd(-9, 9); if (v > 0 && v !== x) s.add(v); }
  return [...s];
}

/* --- Lire et écrire les nombres --- */
GEN.num = (p) => {
  const grand = p >= 0.4, x = grand ? rnd(1001, 9999) : rnd(101, 999);
  const ch = String(x).split(''), off = 4 - ch.length;
  const type = pick(p < 0.15 ? [0] : [0, 1, 2]);
  const notion = 'Lire et écrire les nombres';
  if (type === 0) return {
    enonce: `Écris ce nombre en chiffres :<br><span class="mm-lettres">${enLettres(x)}</span>`,
    saisie: { type: 'nombre', bonne: x }, rep: fmtN(x), notion,
    explication: `On l'écrit <strong>${fmtN(x)}</strong>.${tableauNum(x)}Quand un rang est vide, on écrit un <strong>0</strong> : il ne faut pas l'oublier !`,
    voix: `Écris ce nombre en chiffres : ${enLettres(x)}.`,
  };
  if (type === 1) {
    const choixRangs = RANGS.slice(off).filter((r) => r !== 'unités' || p < 0.3);
    const r = pick(choixRangs), k = RANGS.indexOf(r), c = Number(ch[k - off]);
    return {
      enonce: `Dans le nombre <strong>${fmtN(x)}</strong>, quel est le <strong>chiffre des ${r}</strong> ?`,
      saisie: { type: 'nombre', bonne: c }, rep: String(c), notion,
      explication: `Le chiffre des ${r} de ${fmtN(x)} est <strong>${c}</strong>.${tableauNum(x, k)}Les rangs se lisent de droite à gauche : les unités, puis les dizaines, les centaines, les milliers.`,
    };
  }
  /* type 2 : décomposer, puis recomposer */
  const parts = ch.map((c, i) => Number(c) * 10 ** (ch.length - 1 - i)).filter(Boolean);
  const enMots = p >= 0.7;
  const dec = enMots
    ? ch.map((c, i) => (Number(c) ? plur(Number(c), RANG_SING[RANGS[i + off]]) : null)).filter(Boolean).join(' + ')
    : shuffle(parts).map((v) => fmtN(v)).join(' + ');
  return {
    enonce: `Quel nombre fait :<br><strong>${dec}</strong> ?`, saisie: { type: 'nombre', bonne: x }, rep: fmtN(x), notion,
    explication: `${dec} = <strong>${fmtN(x)}</strong>.${tableauNum(x)}On range chaque chiffre dans sa colonne ; s'il manque un rang, on écrit 0.`,
  };
};

/* --- Comparer les nombres --- */
function expliqueComparaison(a, b) {
  const sa = String(a), sb = String(b);
  if (a === b) return `Les deux nombres sont <strong>égaux</strong> : ${fmtN(a)} = ${fmtN(b)}.`;
  const g = a > b ? a : b, pt = a > b ? b : a;
  if (sa.length !== sb.length) return `${fmtN(g)} a ${String(g).length} chiffres et ${fmtN(pt)} n'en a que ${String(pt).length} : c'est donc ${fmtN(g)} le plus grand.`;
  const off = 4 - sa.length;
  let i = 0; while (sa[i] === sb[i]) i += 1;
  const egaux = RANGS.slice(off, off + i);
  return `Les deux nombres ont ${sa.length} chiffres. On compare chiffre par chiffre, en partant de la gauche${egaux.length ? ` : les ${egaux.join(', les ')} sont les mêmes ; mais` : ' :'} pour les ${RANGS[off + i]}, ${String(g)[i]} est plus grand que ${String(pt)[i]}. Donc <strong>${fmtN(g)}</strong> est le plus grand.`;
}
GEN.comp = (p) => {
  const notion = 'Comparer les nombres';
  const taille = p < 0.35 ? [10, 99] : p < 0.7 ? [100, 999] : [1000, 9999];
  const a = rnd(...taille);
  if (p >= 0.5 && Math.random() < 0.4) {
    /* le plus grand d'une liste de quatre nombres qui se ressemblent */
    const s = String(a).split('');
    const L = new Set([a]);
    while (L.size < 4) { const t = s.slice(); const i = rnd(0, t.length - 1), j = rnd(0, t.length - 1); [t[i], t[j]] = [t[j], t[i]]; if (Math.random() < 0.5) t[rnd(1, t.length - 1)] = String(rnd(0, 9)); const v = Number(t.join('')); if (v >= taille[0] && v <= taille[1]) L.add(v); else L.add(rnd(...taille)); }
    const liste = shuffle([...L]), g = Math.max(...liste), second = liste.filter((x) => x !== g).sort((u, v) => v - u)[0];
    return {
      enonce: 'Quel est le <strong>plus grand</strong> de ces nombres ?', choix: choixNombres(liste), bonne: String(g), rep: fmtN(g), notion,
      explication: `${expliqueComparaison(g, second)}`,
    };
  }
  let b;
  const r = Math.random();
  if (r < 0.12) b = a;
  else if (r < 0.55) { const t = String(a).split(''); const i = rnd(0, t.length - 1); let c; do { c = rnd(i === 0 ? 1 : 0, 9); } while (String(c) === t[i]); t[i] = String(c); b = Number(t.join('')); }
  else if (r < 0.8) { const t = String(a).split(''); const i = rnd(0, t.length - 2); [t[i], t[i + 1]] = [t[i + 1], t[i]]; b = Number(t.join('')); if (b === a || String(b).length !== t.length) b = a + rnd(1, 9) * pick([1, -1]); }
  else b = Math.random() < 0.5 ? Math.floor(a / 10) : a + rnd(1, 20);
  const signe = a < b ? '<' : a > b ? '>' : '=';
  const mots = { '<': 'plus petit que', '>': 'plus grand que', '=': 'égal à' };
  return {
    enonce: `Compare ces deux nombres :<br><strong>${fmtN(a)}</strong> <span class="mm-trou">…</span> <strong>${fmtN(b)}</strong>`,
    choix: ['<', '>', '='].map((v) => ({ v, html: `<span class="mm-signe">${v.replace('<', '&lt;').replace('>', '&gt;')}</span> ${mots[v]}` })),
    bonne: signe, rep: `« ${mots[signe]} »`, notion,
    explication: `${expliqueComparaison(a, b)}<br>On écrit : <strong>${fmtN(a)} ${signe.replace('<', '&lt;').replace('>', '&gt;')} ${fmtN(b)}</strong>. Astuce : la pointe du signe montre toujours le plus petit nombre.`,
    voix: `Compare ces deux nombres : ${a} et ${b}.`,
  };
};

/* --- Additions et soustractions --- */
function retenuesAddition(a, b) {
  const A = String(a).split('').reverse(), B = String(b).split('').reverse(); let r = 0, ret = '', etapes = [];
  const noms = ['unités', 'dizaines', 'centaines', 'milliers'];
  for (let i = 0; i < Math.max(A.length, B.length); i += 1) {
    const x = Number(A[i] || 0), y = Number(B[i] || 0), s = x + y + r;
    etapes.push(`${noms[i]} : ${x} + ${y}${r ? ' + 1 (la retenue)' : ''} = ${s}${s >= 10 ? ` : j'écris ${s % 10} et je retiens 1` : ''}`);
    ret = (r ? '1' : ' ') + ret; r = s >= 10 ? 1 : 0;
  }
  return { ret: (r ? '1' : ' ') + ret, etapes };
}
GEN.addsous = (p) => {
  const notion = 'Additions et soustractions';
  const plus = Math.random() < 0.55;
  let a, b;
  if (p < 0.3) { /* de tête, sans retenue */
    if (plus) do { a = rnd(11, 80); b = rnd(1, 9) + (Math.random() < 0.4 ? 10 : 0); } while (a % 10 + b % 10 > 9);
    else do { a = rnd(25, 99); b = rnd(1, 9) + (Math.random() < 0.4 ? 10 : 0); } while (b % 10 > a % 10 || b >= a);
  } else if (p < 0.6) { /* de tête, avec passage de la dizaine */
    if (plus) do { a = rnd(15, 68); b = rnd(3, 9) + 10 * rnd(0, 2); } while (a % 10 + b % 10 < 10);
    else do { a = rnd(31, 95); b = rnd(2, 9) + 10 * rnd(0, 2); } while (b % 10 <= a % 10 || b >= a);
  } else if (p < 0.85) { a = rnd(120, 680); b = rnd(110, 320); if (!plus && b >= a) [a, b] = [b + 150, a]; }
  else { a = rnd(1200, 6800); b = rnd(350, 2900); if (!plus && b >= a) [a, b] = [b + 900, a]; }
  const r = plus ? a + b : a - b;
  let exp;
  if (p < 0.6) {
    const d = Math.floor(b / 10) * 10, u = b % 10;
    exp = d && u
      ? `${a} ${plus ? '+' : '−'} ${b} = ${a} ${plus ? '+' : '−'} ${d} ${plus ? '+' : '−'} ${u}. On fait d'abord les dizaines : ${a} ${plus ? '+' : '−'} ${d} = ${plus ? a + d : a - d}, puis les unités : ${plus ? a + d : a - d} ${plus ? '+' : '−'} ${u} = <strong>${r}</strong>.`
      : `${a} ${plus ? '+' : '−'} ${b} = <strong>${r}</strong>.`;
    if (p >= 0.3 && u && plus) exp += ` On passe la dizaine : ${a % 10} + ${u} = ${(a % 10) + u}, cela fait une dizaine de plus.`;
  } else if (plus) {
    const R = retenuesAddition(a, b);
    exp = `On pose l'addition en alignant les unités sous les unités :${opPosee(a, b, '+', r, R.ret.replace(/^ /, ' '))}${R.etapes.map((e) => `• ${e}`).join('<br>')}<br>Résultat : <strong>${fmtN(r)}</strong>.`;
  } else {
    exp = `On pose la soustraction en alignant les unités sous les unités :${opPosee(a, b, '−', r)}Résultat : <strong>${fmtN(r)}</strong>. Pour vérifier, on fait l'addition : ${fmtN(r)} + ${fmtN(b)} = ${fmtN(a)}.`;
  }
  return { enonce: `Calcule :<br><strong>${fmtN(a)} ${plus ? '+' : '−'} ${fmtN(b)} = ?</strong>`, saisie: { type: 'nombre', bonne: r }, rep: fmtN(r), notion, explication: exp, court: `${fmtN(a)} ${plus ? '+' : '−'} ${fmtN(b)}` };
};

/* --- Les tables de multiplication (à savoir par cœur) --- */
function astuceTable(a, b) {
  const g = Math.max(a, b), q = Math.min(a, b), r = a * b;
  if (q === 1) return `Multiplier par 1 ne change rien : ${g} × 1 = ${g}.`;
  if (q === 10 || g === 10) return `Multiplier par 10 : on écrit un 0 à droite. ${q === 10 ? g : q} × 10 = ${r}.`;
  if (q === 2) return `Multiplier par 2, c'est prendre le double : ${g} + ${g} = ${r}.`;
  if (q === 5) return `Multiplier par 5, c'est la moitié de multiplier par 10 : ${g} × 10 = ${g * 10}, et la moitié de ${g * 10}, c'est ${r}.`;
  if (q === 4) return `Multiplier par 4, c'est doubler deux fois : ${g} × 2 = ${g * 2}, puis ${g * 2} × 2 = ${r}.`;
  if (g === 9) return `Multiplier par 9, c'est multiplier par 10, puis enlever une fois le nombre : ${q} × 10 = ${q * 10}, et ${q * 10} − ${q} = ${r}.`;
  if (q === 3) return `Multiplier par 3 : on prend le double, puis on ajoute le nombre encore une fois : ${g} × 2 = ${g * 2}, et ${g * 2} + ${g} = ${r}.`;
  if (a === 7 && b === 8 || a === 8 && b === 7) return 'Une petite comptine pour s\'en souvenir : « 5, 6, 7, 8 » : 56 = 7 × 8 !';
  if (g % 2 === 0) return `${q} × ${g}, c'est le double de ${q} × ${g / 2} : ${q} × ${g / 2} = ${q * g / 2}, et le double de ${q * g / 2}, c'est ${r}.`;
  return `${q} × ${g}, c'est ${q} × ${g - 1} plus encore ${q} : ${q * (g - 1)} + ${q} = ${r}.`;
}
GEN.tables = (p) => {
  const notion = 'Les tables de multiplication';
  const table = pick(p < 0.5 ? [2, 3, 4, 5] : [6, 7, 8, 9]), autre = rnd(p < 0.2 ? 1 : 2, 10);
  const [a, b] = Math.random() < 0.5 ? [table, autre] : [autre, table];
  const r = a * b;
  const rappel = `${astuceTable(a, b)}<br>N'oublie pas : ${a} × ${b} = ${b} × ${a}. On peut retourner la multiplication.`;
  if (p >= 0.7 && Math.random() < 0.5) return {
    enonce: `Complète :<br><strong>${a} × <span class="mm-trou">…</span> = ${r}</strong>`, saisie: { type: 'nombre', bonne: b }, rep: String(b), notion,
    explication: `${a} × <strong>${b}</strong> = ${r}. ${rappel}`, court: `${a} × … = ${r}`, voix: `Complète : ${a} fois combien égale ${r} ?`,
  };
  return { enonce: `<strong>${a} × ${b} = ?</strong>`, saisie: { type: 'nombre', bonne: r }, rep: String(r), notion, explication: `${a} × ${b} = <strong>${r}</strong>. ${rappel}`, court: `${a} × ${b}` };
};

/* --- Multiplier et partager --- */
GEN.mult = (p) => {
  const notion = 'Multiplier et partager';
  const type = p < 0.25 ? pick([0, 1]) : p < 0.55 ? pick([1, 3]) : pick([2, 3, 4]);
  if (type === 0) {
    const n = rnd(2, 99), k = p < 0.12 || n > 50 ? 10 : pick([10, 100]);
    return { enonce: `<strong>${n} × ${k} = ?</strong>`, saisie: { type: 'nombre', bonne: n * k }, rep: fmtN(n * k), notion, court: `${n} × ${k}`,
      explication: `${n} × ${k} = <strong>${fmtN(n * k)}</strong>. Multiplier par ${k}, c'est écrire ${k === 10 ? 'un zéro' : 'deux zéros'} à droite du nombre : les unités deviennent des ${k === 10 ? 'dizaines' : 'centaines'}.` };
  }
  if (type === 1) {
    const double = Math.random() < 0.5, n = double ? rnd(6, 49) : 2 * rnd(4, 49);
    const r = double ? 2 * n : n / 2, d = Math.floor(n / 10) * 10, u = n % 10;
    return { enonce: `Quel est ${double ? 'le <strong>double</strong>' : 'la <strong>moitié</strong>'} de <strong>${n}</strong> ?`, saisie: { type: 'nombre', bonne: r }, rep: String(r), notion,
      explication: double
        ? `Le double de ${n}, c'est ${n} + ${n} = <strong>${r}</strong>.${d && u ? ` On peut doubler les dizaines puis les unités : le double de ${d}, c'est ${2 * d} ; le double de ${u}, c'est ${2 * u} ; ${2 * d} + ${2 * u} = ${r}.` : ''}`
        : `La moitié de ${n}, c'est <strong>${r}</strong>, car ${r} + ${r} = ${n}. Prendre la moitié, c'est partager en deux parts égales.` };
  }
  if (type === 2) {
    const a = rnd(12, 89), b = rnd(3, 9), r = a * b, d = Math.floor(a / 10) * 10, u = a % 10;
    return { enonce: `Calcule :<br><strong>${a} × ${b} = ?</strong>`, saisie: { type: 'nombre', bonne: r }, rep: fmtN(r), notion, court: `${a} × ${b}`,
      explication: `On multiplie les dizaines, puis les unités : ${a} × ${b} = ${d} × ${b} + ${u} × ${b} = ${d * b} + ${u * b} = <strong>${fmtN(r)}</strong>.${opPosee(a, b, '×', r)}` };
  }
  const nb = rnd(2, p < 0.7 ? 5 : 9), chacun = rnd(2, p < 0.7 ? 6 : 9), total = nb * chacun, P = pick(PRENOMS);
  if (type === 3) {
    const obj = pick([['bonbons', 'enfants'], ['images', 'amis'], ['billes', 'copains'], ['crayons', 'pots']]);
    return { enonce: `${P} partage <strong>${total} ${obj[0]}</strong> en parts égales entre <strong>${nb} ${obj[1]}</strong>. Combien chacun en reçoit-il ?`, saisie: { type: 'nombre', bonne: chacun, unite: obj[0] }, rep: String(chacun), notion,
      explication: `On cherche combien de fois ${nb} dans ${total} : ${nb} × ${chacun} = ${total}. Donc chacun reçoit <strong>${chacun} ${obj[0]}</strong>. On écrit aussi : ${total} ÷ ${nb} = ${chacun}.` };
  }
  return { enonce: `On range <strong>${total} œufs</strong> dans des boîtes de <strong>${chacun}</strong>. Combien de boîtes remplit-on ?`, saisie: { type: 'nombre', bonne: nb, unite: 'boîtes' }, rep: String(nb), notion,
    explication: `On cherche combien de paquets de ${chacun} il y a dans ${total} : ${nb} × ${chacun} = ${total}. On remplit donc <strong>${nb} boîtes</strong>.` };
};

/* --- Les fractions --- */
GEN.frac = (p) => {
  const notion = 'Les fractions';
  const d = pick(p < 0.35 ? [2, 3, 4] : p < 0.7 ? [3, 4, 5, 6, 8] : [5, 6, 8, 10]), n = d === 2 ? 1 : rnd(1, d - 1);
  const candidats = [[n, d], [d - n, d], [n, d + 1], [n, d - 1], [n + 1, d], [d, n]].filter(([x, y]) => x >= 1 && y >= 2 && x < y && !(x === n && y === d));
  const vus = new Set([`${n}/${d}`]), choix = [[n, d]];
  shuffle(candidats).forEach(([x, y]) => { const k = `${x}/${y}`; if (choix.length < 4 && !vus.has(k)) { vus.add(k); choix.push([x, y]); } });
  const options = shuffle(choix).map(([x, y]) => ({ v: `${x}/${y}`, html: `${fracHtml(x, y)} <span class="mm-petit">${fracMots(x, y)}</span>` }));
  if (p >= 0.6 && Math.random() < 0.35) {
    const P = pick(PRENOMS), obj = pick(['une pizza', 'une tarte', 'un gâteau', 'une tablette de chocolat']);
    return { enonce: `On coupe ${obj} en <strong>${d} parts égales</strong>. ${P} en mange <strong>${n}</strong>. Quelle fraction ${obj.startsWith('un ') ? 'du' : 'de la'} ${obj.replace(/^une? /, '')} a-t-${il(P)} mangée ?`,
      choix: options, bonne: `${n}/${d}`, rep: fracMots(n, d), notion,
      explication: `Il y a ${d} parts égales : ce sont des <strong>${FRAC_NOMS[d]}${/s$/.test(FRAC_NOMS[d]) ? '' : 's'}</strong>. ${P} en mange ${n} : ${fracHtml(n, d)}, ${fracMots(n, d)}.` };
  }
  const forme = d <= 8 && Math.random() < 0.6 ? 'disque' : 'bande';
  return {
    enonce: 'Quelle fraction de la figure est <strong>coloriée</strong> ?', figure: figFraction(n, d, forme), choix: options, bonne: `${n}/${d}`, rep: fracMots(n, d), notion,
    explication: `La figure est partagée en <strong>${d} parts égales</strong> : le nombre du bas est ${d}. <strong>${n}</strong> part${n > 1 ? 's sont coloriées' : ' est coloriée'} : le nombre du haut est ${n}. C'est ${fracHtml(n, d)}, <strong>${fracMots(n, d)}</strong>.`,
  };
};

/* --- Les problèmes (du plus simple au plus long) --- */
const PROBLEMES = [
  { niv: 0, f: () => { const P = pick(PRENOMS), a = rnd(12, 45), b = rnd(5, 30); return { t: `${P} a <strong>${a} billes</strong>. À la récréation, ${il(P)} en gagne <strong>${b}</strong>. Combien de billes a-t-${il(P)} maintenant ?`, r: a + b, u: 'billes', e: `${capitalize(il(P))} gagne des billes : il en a plus qu'avant. On ajoute : ${a} + ${b} = <strong>${a + b}</strong>. ${P} a maintenant ${a + b} billes.` }; } },
  { niv: 0, f: () => { const P = pick(PRENOMS), a = rnd(15, 40), b = rnd(3, a - 5); return { t: `${P} a <strong>${a} €</strong>. ${capitalize(il(P))} achète un livre qui coûte <strong>${b} €</strong>. Combien d'argent lui reste-t-il ?`, r: a - b, u: '€', e: `${capitalize(il(P))} dépense de l'argent : il lui en reste moins. On enlève : ${a} − ${b} = <strong>${a - b}</strong>. Il lui reste ${a - b} €.` }; } },
  { niv: 0, f: () => { const P = pick(PRENOMS), a = rnd(12, 60), b = rnd(10, 45); return { t: `Le matin, ${P} fait <strong>${a} km</strong> à vélo. L'après-midi, ${il(P)} en fait <strong>${b}</strong>. Combien de kilomètres a-t-${il(P)} faits dans la journée ?`, r: a + b, u: 'km', e: `On cherche le total de la journée : on ajoute les deux distances. ${a} + ${b} = <strong>${a + b}</strong>. ${capitalize(il(P))} a fait ${a + b} km.` }; } },
  { niv: 0, f: () => { const P = pick(PRENOMS), a = rnd(6, 10), b = rnd(2, 6); return { t: `${P} a <strong>${a} ans</strong>. Sa sœur a <strong>${b} ans de plus</strong> ${FILLES.has(P) ? 'qu\'elle' : 'que lui'}. Quel âge a-t-elle ?`, r: a + b, u: 'ans', e: `Elle a ${b} ans de plus : on ajoute. ${a} + ${b} = <strong>${a + b}</strong>. Sa sœur a ${a + b} ans.` }; } },
  { niv: 1, f: () => { const a = rnd(20, 45), b = rnd(5, 15), c = rnd(3, 12); return { t: `Dans l'autobus, il y a <strong>${a} passagers</strong>. À l'arrêt, <strong>${b}</strong> descendent et <strong>${c}</strong> montent. Combien y a-t-il de passagers maintenant ?`, r: a - b + c, u: 'passagers', e: `Deux étapes. D'abord, ${b} descendent : ${a} − ${b} = ${a - b}. Ensuite, ${c} montent : ${a - b} + ${c} = <strong>${a - b + c}</strong>.` }; } },
  { niv: 1, f: () => { const P = pick(PRENOMS), a = rnd(15, 60), t = a + rnd(8, 40); return { t: `${P} a <strong>${a} images</strong> dans son album. L'album complet en contient <strong>${t}</strong>. Combien d'images lui manque-t-il ?`, r: t - a, u: 'images', e: `On cherche ce qu'il faut ajouter à ${a} pour arriver à ${t} : ${t} − ${a} = <strong>${t - a}</strong>. Vérifie : ${a} + ${t - a} = ${t}.` }; } },
  { niv: 1, f: () => { const a = rnd(3, 9), b = pick([6, 10, 12]); return { t: `Une boîte contient <strong>${b} œufs</strong>. Combien y a-t-il d'œufs dans <strong>${a} boîtes</strong> ?`, r: a * b, u: 'œufs', e: `Il y a ${a} fois la même quantité : on multiplie. ${a} × ${b} = <strong>${a * b}</strong>. Il y a ${a * b} œufs.` }; } },
  { niv: 1, f: () => { const a = rnd(3, 8), b = rnd(3, 9); return { t: `Un ticket de manège coûte <strong>${b} €</strong>. Combien coûtent <strong>${a} tickets</strong> ?`, r: a * b, u: '€', e: `${a} tickets à ${b} € : on multiplie. ${a} × ${b} = <strong>${a * b}</strong>. Ils coûtent ${a * b} €.` }; } },
  { niv: 1, f: () => { const a = rnd(4, 9), b = rnd(5, 10); return { t: `Dans la salle, il y a <strong>${a} rangées</strong> de <strong>${b} chaises</strong>. Combien y a-t-il de chaises ?`, r: a * b, u: 'chaises', e: `${a} rangées de ${b} chaises : ${a} × ${b} = <strong>${a * b}</strong> chaises.` }; } },
  { niv: 2, f: () => { const a = rnd(3, 6), c = rnd(4, 9), t = a * c; return { t: `La maîtresse range <strong>${t} livres</strong> en <strong>${a} piles</strong> égales. Combien de livres y a-t-il dans chaque pile ?`, r: c, u: 'livres', e: `On partage en ${a} parts égales. On cherche ${a} × … = ${t} : ${a} × ${c} = ${t}. Chaque pile a <strong>${c} livres</strong>.` }; } },
  { niv: 2, f: () => { const P = pick(PRENOMS), n = rnd(2, 4), b = rnd(5, 10), e = rnd(2, 6); return { t: `${P} a <strong>${n} paquets de ${b} cartes</strong> et encore <strong>${e} cartes</strong> en plus. Combien de cartes a-t-${il(P)} en tout ?`, r: n * b + e, u: 'cartes', e: `Deux étapes. D'abord les paquets : ${n} × ${b} = ${n * b}. Puis on ajoute les cartes en plus : ${n * b} + ${e} = <strong>${n * b + e}</strong>.` }; } },
  { niv: 2, f: () => { const a = rnd(80, 150), b = rnd(20, a - 30); return { t: `Une ficelle mesure <strong>${a} cm</strong>. On en coupe un morceau de <strong>${b} cm</strong>. Quelle longueur reste-t-il ?`, r: a - b, u: 'cm', e: `On enlève le morceau coupé : ${a} − ${b} = <strong>${a - b}</strong>. Il reste ${a - b} cm.` }; } },
  { niv: 2, f: () => { const P = pick(PRENOMS), prix = rnd(3, 8), n = rnd(2, 4), tot = prix * n, billet = tot < 20 ? 20 : 50; return { t: `${P} achète <strong>${n} cahiers</strong> à <strong>${prix} €</strong> l'un. ${capitalize(il(P))} paie avec un billet de <strong>${billet} €</strong>. Combien lui rend-on ?`, r: billet - tot, u: '€', e: `Deux étapes. Le prix des cahiers : ${n} × ${prix} = ${tot} €. La monnaie rendue : ${billet} − ${tot} = <strong>${billet - tot}</strong> €.` }; } },
];
GEN.pb = (p) => {
  const niv = p < 0.3 ? 0 : p < 0.65 ? 1 : 2;
  const P = pick(PROBLEMES.filter((x) => x.niv === niv)).f();
  return { enonce: `<span class="mm-pb">${P.t}</span>`, saisie: { type: 'nombre', bonne: P.r, unite: P.u }, rep: `${fmtN(P.r)} ${P.u}`, notion: 'Résoudre des problèmes', explication: P.e, court: P.t.replace(/<[^>]+>/g, '').slice(0, 60) + '…' };
};


/* --- Lire l'heure --- */
function heureDite(h, m) { return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`; }
GEN.heure = (p) => {
  const notion = 'Lire l\'heure';
  const h = rnd(1, 12), m = p < 0.3 ? pick([0, 0, 30]) : p < 0.6 ? pick([0, 15, 30, 45]) : 5 * rnd(1, 11);
  const bonne = heureDite(h, m), opts = new Set([bonne]);
  const h2 = m ? (m / 5) % 12 || 12 : null;
  if (h2 && (h * 5) % 60 !== m) opts.add(heureDite(h2, (h * 5) % 60));      /* les aiguilles inversées */
  const essais = [heureDite(h % 12 + 1, m), heureDite(h === 1 ? 12 : h - 1, m), heureDite(h, (m + 30) % 60), heureDite(h, m === 0 ? 30 : m === 30 ? 0 : (m + 15) % 60), heureDite(h, (m + 5) % 60)];
  shuffle(essais).forEach((x) => { if (opts.size < 4) opts.add(x); });
  const pAig = m === 0 ? `elle est <strong>sur le ${h}</strong>` : m === 30 ? `elle est <strong>à mi-chemin entre le ${h} et le ${h % 12 + 1}</strong> : il est ${h} heures passées` : `elle a dépassé le ${h}, mais elle n'est pas encore sur le ${h % 12 + 1} : il est ${h} heures passées`;
  const gAig = m === 0 ? 'elle est <strong>sur le 12</strong> : 0 minute, l\'heure est pile' : `elle est <strong>sur le ${m / 5}</strong> : ${m / 5} × 5 = <strong>${m} minutes</strong>${m === 15 ? ' (un quart d\'heure)' : m === 30 ? ' (une demi-heure)' : m === 45 ? ' (trois quarts d\'heure)' : ''}`;
  return {
    enonce: 'Quelle heure indique l\'horloge ?', figure: figHorloge(h, m), choix: shuffle([...opts]).map((v) => ({ v, html: v })), bonne, rep: bonne, notion,
    explication: `La <strong style="color:#c2185b">petite aiguille</strong> montre les heures : ${pAig}. La <strong style="color:#1f6fa8">grande aiguille</strong> montre les minutes : ${gAig}. Il est <strong>${bonne}</strong>.`,
  };
};

/* --- Les durées et le calendrier --- */
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
GEN.durees = (p) => {
  const notion = 'Les durées et le calendrier';
  const type = p < 0.3 ? pick([0, 3]) : p < 0.6 ? pick([0, 1, 3]) : pick([1, 2]);
  if (type === 0) {
    const F = pick([
      { q: '1 heure = … minutes', r: 60, u: 'min', e: 'Une heure dure <strong>60 minutes</strong> : la grande aiguille fait un tour complet du cadran.' },
      { q: '1 jour = … heures', r: 24, u: 'h', e: 'Un jour dure <strong>24 heures</strong> : la petite aiguille fait deux fois le tour du cadran.' },
      { q: '1 semaine = … jours', r: 7, u: 'jours', e: 'Une semaine a <strong>7 jours</strong> : lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche.' },
      { q: '1 année = … mois', r: 12, u: 'mois', e: 'Une année a <strong>12 mois</strong>, de janvier à décembre.' },
      { q: '1 minute = … secondes', r: 60, u: 's', e: 'Une minute dure <strong>60 secondes</strong>.' },
      { q: '1 h 30 min = … minutes', r: 90, u: 'min', e: '1 h = 60 min, donc 1 h 30 min = 60 + 30 = <strong>90 minutes</strong>.' },
      { q: '2 heures = … minutes', r: 120, u: 'min', e: '1 h = 60 min, donc 2 h = 60 + 60 = <strong>120 minutes</strong>.' },
      { q: 'Une demi-heure = … minutes', r: 30, u: 'min', e: 'Une heure = 60 minutes, et la moitié de 60, c\'est <strong>30</strong>.' },
      { q: 'Un quart d\'heure = … minutes', r: 15, u: 'min', e: 'On partage l\'heure en 4 : 60 = 15 + 15 + 15 + 15. Un quart d\'heure dure <strong>15 minutes</strong>.' },
      { q: '2 semaines = … jours', r: 14, u: 'jours', e: '1 semaine = 7 jours, donc 2 semaines = 7 + 7 = <strong>14 jours</strong>.' },
    ]);
    return { enonce: `Complète :<br><strong>${F.q.replace('…', '<span class="mm-trou">…</span>')}</strong>`, saisie: { type: 'nombre', bonne: F.r, unite: F.u }, rep: String(F.r), notion, explication: F.e, court: F.q };
  }
  if (type === 1) {
    const debut = rnd(8, 17) * 60 + pick(p < 0.8 ? [0, 15, 30, 45] : [0, 10, 20, 30, 40, 50]), duree = p < 0.8 ? pick([15, 30, 45, 60, 75, 90]) : pick([20, 35, 40, 50, 70, 85]);
    const fin = debut + duree, ev = pick(['Le film', 'Le match', 'La séance de piscine', 'Le spectacle', 'La leçon de musique']);
    const dh = Math.floor(duree / 60), dm = duree % 60;
    let e = `${fmtHeure(debut)}`;
    if (dh) e += ` + ${dh} h → ${fmtHeure(debut + 60 * dh)}`;
    if (dm) { const avant = debut + 60 * dh, jusqua = 60 - (avant % 60); e += (avant % 60) + dm >= 60 && avant % 60 ? `, puis ${jusqua} min pour arriver à ${fmtHeure(avant + jusqua)}, et encore ${dm - jusqua} min → ${fmtHeure(fin)}` : ` + ${dm} min → ${fmtHeure(fin)}`; }
    return { enonce: `${ev} commence à <strong>${fmtHeure(debut)}</strong> et dure <strong>${fmtDuree(duree)}</strong>. À quelle heure finit-il ?`, saisie: { type: 'minutes', bonne: fin, h: true }, rep: fmtHeure(fin), notion,
      explication: `On avance d'abord les heures, puis les minutes : ${e}. Il finit à <strong>${fmtHeure(fin)}</strong>.` };
  }
  if (type === 2) {
    const debut = rnd(8, 16) * 60 + pick([0, 15, 30]), duree = pick([15, 20, 30, 40, 45, 50, 60, 75, 90]), fin = debut + duree;
    return { enonce: `La récréation des grands commence à <strong>${fmtHeure(debut)}</strong> et finit à <strong>${fmtHeure(fin)}</strong>. Combien de <strong>minutes</strong> dure-t-elle ?`.replace('La récréation des grands', pick(['La récréation', 'L\'atelier de peinture', 'La sortie au parc', 'Le goûter'])),
      saisie: { type: 'nombre', bonne: duree, unite: 'min' }, rep: `${duree} minutes`, notion,
      explication: `On compte de ${fmtHeure(debut)} à ${fmtHeure(fin)} : ${duree >= 60 ? `1 heure (60 min)${duree > 60 ? ` et encore ${duree - 60} min` : ''}` : `${duree} minutes`}. Cela dure <strong>${duree} minutes</strong>.` };
  }
  if (Math.random() < 0.55) {
    const j = rnd(0, 6), k = rnd(1, 6), r = JOURS[(j + k) % 7];
    return { enonce: `Aujourd'hui, nous sommes <strong>${JOURS[j]}</strong>. Quel jour serons-nous dans <strong>${k} jour${k > 1 ? 's' : ''}</strong> ?`,
      choix: shuffle([r, JOURS[(j + k + 1) % 7], JOURS[(j + k + 6) % 7], JOURS[(j + k + 2) % 7]]).map((v) => ({ v, html: v })), bonne: r, rep: r, notion,
      explication: `On compte ${k} jour${k > 1 ? 's' : ''} après ${JOURS[j]} : ${Array.from({ length: k }, (_, i) => JOURS[(j + i + 1) % 7]).join(', ')}. Nous serons <strong>${r}</strong>.` };
  }
  const mi = rnd(0, 11), apres = Math.random() < 0.6, r = MOIS[(mi + (apres ? 1 : 11)) % 12];
  return { enonce: `Quel mois vient juste <strong>${apres ? 'après' : 'avant'}</strong> ${MOIS[mi]} ?`, choix: shuffle([r, MOIS[(mi + (apres ? 2 : 10)) % 12], MOIS[(mi + (apres ? 11 : 1)) % 12], MOIS[(mi + 6) % 12]]).map((v) => ({ v, html: v })), bonne: r, rep: r, notion,
    explication: `Les douze mois de l'année : ${MOIS.join(', ')}. ${capitalize(apres ? `après ${MOIS[mi]} vient` : `avant ${MOIS[mi]} vient`)} <strong>${r}</strong>.` };
};

/* --- Choisir la bonne unité, et convertir (longueurs, masses, contenances) --- */
function questionUnite(liste, unites, notion) {
  const o = pick(liste);
  return { enonce: `${o[0].replace('…', '<span class="mm-trou">…</span>')}<br>Quelle est la bonne unité ?`, choix: unites.map((u) => ({ v: u, html: `${u} <span class="mm-petit">(${UNITES_DITES[u].replace(/s$/, '')})</span>` })), bonne: o[1], rep: UNITES_DITES[o[1]], notion, voix: `${o[0].replace(/\s*…/, ', quelque chose,')} Quelle est la bonne unité ?`,
    explication: `${o[0].replace('…', `<strong>${o[1]}</strong>`)} ${o[2]}`, court: o[0] };
}
function questionConversion(F, notion) {
  return { enonce: `Complète :<br><strong>${F.q.replace('…', '<span class="mm-trou">…</span>')}</strong>`, saisie: { type: 'nombre', bonne: F.r, unite: F.u }, rep: `${fmtN(F.r)} ${UNITES_DITES[F.u] || F.u}`, notion, explication: F.e, court: F.q };
}
const OBJETS_LONG = [
  ['Un crayon mesure 15 …', 'cm', 'On mesure les petits objets en centimètres.'],
  ['Une porte mesure 2 … de haut.', 'm', 'Une porte est plus haute qu\'un adulte : on la mesure en mètres.'],
  ['De Paris à Lyon, il y a 465 …', 'km', 'Pour les grandes distances, entre deux villes, on utilise le kilomètre.'],
  ['Une fourmi mesure 5 …', 'mm', 'Une fourmi est toute petite : on la mesure en millimètres.'],
  ['Un cahier mesure 30 … de long.', 'cm', 'On mesure un cahier en centimètres, avec la règle.'],
  ['La piscine mesure 25 … de long.', 'm', 'Une piscine est grande : on la mesure en mètres.'],
  ['Pour aller à l\'école, je marche 2 …', 'km', 'Pour un trajet, on compte en kilomètres : 1 km = 1 000 m.'],
  ['Une gomme mesure 4 …', 'cm', 'Une gomme tient dans la main : on la mesure en centimètres.'],
  ['Un grain de riz mesure 6 …', 'mm', 'Un grain de riz est minuscule : on le mesure en millimètres.'],
  ['Un arbre du jardin mesure 8 … de haut.', 'm', 'Un arbre est bien plus haut qu\'un enfant : on le mesure en mètres.'],
  ['Le marathon est une course de 42 …', 'km', 'C\'est une très longue course : on compte en kilomètres.'],
];
GEN.long = (p) => {
  const notion = 'Les longueurs';
  const type = p < 0.3 ? 0 : p < 0.75 ? pick([0, 1, 1]) : pick([1, 2]);
  if (type === 0) return questionUnite(OBJETS_LONG.filter((o) => p >= 0.3 || o[1] !== 'mm'), p < 0.3 ? ['cm', 'm', 'km'] : ['mm', 'cm', 'm', 'km'], notion);
  if (type === 1) {
    const a = rnd(2, 9), b = rnd(2, 9), c = rnd(10, 95);
    return questionConversion(pick([
      { q: `${a} m = … cm`, r: a * 100, u: 'cm', e: `1 m = 100 cm, donc ${a} m = ${a} × 100 cm = <strong>${a * 100} cm</strong>.` },
      { q: `${a * 100} cm = … m`, r: a, u: 'm', e: `100 cm = 1 m, donc ${a * 100} cm = <strong>${a} m</strong>.` },
      { q: `${a} km = … m`, r: a * 1000, u: 'm', e: `1 km = 1 000 m, donc ${a} km = ${a} × 1 000 m = <strong>${fmtN(a * 1000)} m</strong>.` },
      { q: `${b} cm = … mm`, r: b * 10, u: 'mm', e: `1 cm = 10 mm, donc ${b} cm = ${b} × 10 mm = <strong>${b * 10} mm</strong>.` },
      { q: `${b * 10} mm = … cm`, r: b, u: 'cm', e: `10 mm = 1 cm, donc ${b * 10} mm = <strong>${b} cm</strong>.` },
      { q: `1 m ${c} cm = … cm`, r: 100 + c, u: 'cm', e: `1 m = 100 cm, donc 1 m ${c} cm = 100 + ${c} = <strong>${100 + c} cm</strong>.` },
      { q: `${a} m ${c} cm = … cm`, r: a * 100 + c, u: 'cm', e: `${a} m = ${a * 100} cm, donc ${a} m ${c} cm = ${a * 100} + ${c} = <strong>${a * 100 + c} cm</strong>.` },
    ].filter((F, i) => p >= 0.5 || i < 3)), notion);
  }
  const a = rnd(1, 4), x = a * 100 + pick([-30, -10, 20, 40, 50]);
  const r = x > a * 100 ? `${x} cm` : `${a} m`;
  return { enonce: `Qu'est-ce qui est le <strong>plus long</strong> ?`, choix: shuffle([`${a} m`, `${x} cm`]).map((v) => ({ v, html: v })), bonne: r, rep: r, notion,
    explication: `On convertit dans la même unité : ${a} m = ${a * 100} cm. On compare ${a * 100} cm et ${x} cm : le plus long, c'est <strong>${r}</strong>.` };
};
const OBJETS_MASSE = [
  ['Une pomme pèse 150 …', 'g', 'Une pomme est légère : on la pèse en grammes.'],
  ['Un sac de pommes de terre pèse 5 …', 'kg', 'Un gros sac est lourd : on le pèse en kilogrammes.'],
  ['Un bébé qui vient de naître pèse 3 …', 'kg', 'Un bébé se pèse en kilogrammes.'],
  ['Une tablette de chocolat pèse 100 …', 'g', 'Une tablette est légère : on la pèse en grammes.'],
  ['Un éléphant pèse 5 000 …', 'kg', 'Un éléphant est très lourd : on le pèse en kilogrammes (5 000 kg, c\'est 5 tonnes !).'],
  ['Une lettre pèse 20 …', 'g', 'Une lettre est très légère : on la pèse en grammes.'],
  ['Un chat pèse 4 …', 'kg', 'On pèse un chat en kilogrammes.'],
];
const OBJETS_CONT = [
  ['Une bouteille d\'eau contient 1 …', 'L', 'Une grande bouteille contient un litre.'],
  ['Une baignoire contient 150 …', 'L', 'Une baignoire contient beaucoup d\'eau : on compte en litres.'],
  ['Un verre contient 20 …', 'cL', 'Un verre contient peu d\'eau : on compte en centilitres (100 cL = 1 L).'],
  ['Une canette contient 33 …', 'cL', 'Une canette contient 33 centilitres, un tiers de litre.'],
  ['Un seau contient 10 …', 'L', 'Un seau contient plusieurs litres.'],
  ['Une petite bouteille de jus de fruits contient 25 …', 'cL', 'Une petite bouteille contient 25 centilitres, un quart de litre.'],
];
GEN.masse = (p) => {
  const notion = 'Les masses et les contenances';
  const type = p < 0.5 ? pick([0, 1]) : pick([0, 1, 2, 2]);
  if (type === 0) return questionUnite(OBJETS_MASSE, ['g', 'kg'], notion);
  if (type === 1) return questionUnite(OBJETS_CONT, p < 0.3 ? ['L', 'cL'] : ['L', 'cL'], notion);
  const a = rnd(2, 9), c = pick([100, 250, 500, 750]);
  if (Math.random() < 0.08) return { enonce: 'Qu\'est-ce qui est le <strong>plus lourd</strong> : 1 kg de plumes ou 1 kg de pierres ?', choix: ['1 kg de plumes', '1 kg de pierres', 'les deux pèsent autant'].map((v) => ({ v, html: v })), bonne: 'les deux pèsent autant', rep: 'ils pèsent autant', notion,
    explication: 'Attention au piège ! 1 kg, c\'est toujours 1 kg : <strong>les deux pèsent autant</strong>. Il faut seulement beaucoup plus de plumes que de pierres pour faire 1 kg.' };
  return questionConversion(pick([
    { q: `${a} kg = … g`, r: a * 1000, u: 'g', e: `1 kg = 1 000 g, donc ${a} kg = ${a} × 1 000 g = <strong>${fmtN(a * 1000)} g</strong>.` },
    { q: `${fmtN(a * 1000)} g = … kg`, r: a, u: 'kg', e: `1 000 g = 1 kg, donc ${fmtN(a * 1000)} g = <strong>${a} kg</strong>.` },
    { q: `1 kg ${c} g = … g`, r: 1000 + c, u: 'g', e: `1 kg = 1 000 g, donc 1 kg ${c} g = 1 000 + ${c} = <strong>${fmtN(1000 + c)} g</strong>.` },
    { q: `${a} L = … cL`, r: a * 100, u: 'cL', e: `1 L = 100 cL, donc ${a} L = ${a} × 100 cL = <strong>${a * 100} cL</strong>.` },
    { q: `${a * 100} cL = … L`, r: a, u: 'L', e: `100 cL = 1 L, donc ${a * 100} cL = <strong>${a} L</strong>.` },
  ]), notion);
};

/* --- La monnaie --- */
GEN.monnaie = (p) => {
  const notion = 'La monnaie';
  if (p >= 0.65 && Math.random() < 0.5) {
    const prix = p < 0.85 ? rnd(2, 18) * 100 : rnd(4, 35) * 100 + pick([20, 50, 80]), billet = prix < 500 ? 500 : prix < 1000 ? 1000 : prix < 2000 ? 2000 : 5000, r = billet - prix;
    const obj = pick(['un livre', 'un ballon', 'une boîte de crayons', 'un jeu de cartes', 'un cerf-volant']);
    return { enonce: `${capitalize(obj)} coûte <strong>${fmtEuros(prix)}</strong>. Tu paies avec un billet de <strong>${billet / 100} €</strong>. Combien te rend-on ?`, saisie: { type: 'nombre', bonne: r / 100, unite: '€' }, rep: fmtEuros(r), notion,
      explication: `On cherche ce qui manque pour aller de ${fmtEuros(prix)} à ${billet / 100} € : ${billet / 100} − ${fmtN(prix / 100, prix % 100 ? 2 : undefined)} = ${fmtN(r / 100, r % 100 ? 2 : undefined)}. On te rend <strong>${fmtEuros(r)}</strong>.${prix % 100 ? ` Astuce : on complète d'abord jusqu'à l'euro suivant (${100 - (prix % 100)} c), puis jusqu'au billet.` : ''}` };
  }
  const avecCentimes = p >= 0.45;
  const billets = [], pieces = [];
  const nb = p < 0.25 ? rnd(2, 3) : rnd(3, 5);
  for (let i = 0; i < nb; i += 1) {
    if (Math.random() < 0.4) billets.push(pick([500, 1000, 2000])); else pieces.push(pick(avecCentimes ? [100, 200, 50, 20, 10, 5] : [100, 200]));
  }
  if (!billets.length && !pieces.length) pieces.push(200);
  billets.sort((a, b) => b - a); pieces.sort((a, b) => b - a);
  const tous = [...billets, ...pieces], total = tous.reduce((t, v) => t + v, 0);
  const tb = billets.reduce((t, v) => t + v, 0), te = pieces.filter((v) => v >= 100).reduce((t, v) => t + v, 0), tc = pieces.filter((v) => v < 100).reduce((t, v) => t + v, 0);
  const etapes = [];
  if (billets.length) etapes.push(`les billets : ${billets.map((v) => v / 100).join(' + ')} = ${tb / 100} €`);
  if (te) etapes.push(`les pièces en euros : ${pieces.filter((v) => v >= 100).map((v) => v / 100).join(' + ')} = ${te / 100} €`);
  if (tc) etapes.push(`les centimes : ${pieces.filter((v) => v < 100).join(' + ')} = ${tc} c${tc >= 100 ? `, c'est-à-dire ${fmtEuros(tc)}` : ''}`);
  return { enonce: 'Combien d\'argent y a-t-il en tout ?', figure: figMonnaie(tous), saisie: { type: 'nombre', bonne: total / 100, unite: '€' }, rep: fmtEuros(total), notion,
    explication: `On compte d'abord ${etapes.join(' ; puis ')}. En tout : <strong>${fmtEuros(total)}</strong>.${tc ? ' Souviens-toi : 100 centimes font 1 euro.' : ''}` };
};

/* --- Le périmètre --- */
GEN.perim = (p) => {
  const notion = 'Le périmètre';
  const type = p < 0.3 ? pick(['carre', 'rectangle']) : p < 0.7 ? pick(['rectangle', 'triangle', 'carre', 'polygone']) : pick(['triangle', 'L', 'polygone', 'inverse']);
  let P, L;
  if (type === 'carre' || type === 'inverse') {
    const c = rnd(2, 9), k = 150; P = centre([[0, 0], [k, 0], [k, k], [0, k]], 320, 240);
    if (type === 'inverse') return { enonce: `Un carré a un périmètre de <strong>${4 * c} cm</strong>. Combien mesure un de ses côtés ?`, figure: figPolygone(P, [null, null, null, null], { droits: [0, 1, 2, 3] }), saisie: { type: 'nombre', bonne: c, unite: 'cm' }, rep: `${c} centimètres`, notion,
      explication: `Les 4 côtés d'un carré ont la même longueur. On cherche 4 × … = ${4 * c} : 4 × ${c} = ${4 * c}. Un côté mesure <strong>${c} cm</strong>.` };
    return { enonce: 'Quel est le <strong>périmètre</strong> de ce carré ?', figure: figPolygone(P, [`${c} cm`, null, null, null], { droits: [0, 1, 2, 3] }), saisie: { type: 'nombre', bonne: 4 * c, unite: 'cm' }, rep: `${4 * c} centimètres`, notion,
      explication: `Les 4 côtés d'un carré ont la même longueur, ${c} cm. Le périmètre : ${c} + ${c} + ${c} + ${c} = <strong>${4 * c} cm</strong>. On peut aussi calculer 4 × ${c} = ${4 * c}.` };
  }
  if (type === 'rectangle') {
    const a = rnd(4, 10), b = rnd(2, a - 1), k = Math.min(240 / a, 160 / b); P = centre([[0, 0], [a * k, 0], [a * k, b * k], [0, b * k]], 320, 240);
    return { enonce: 'Quel est le <strong>périmètre</strong> de ce rectangle ?', figure: figPolygone(P, [`${a} cm`, `${b} cm`, null, null], { droits: [0, 1, 2, 3] }), saisie: { type: 'nombre', bonne: 2 * (a + b), unite: 'cm' }, rep: `${2 * (a + b)} centimètres`, notion,
      explication: `Un rectangle a deux longueurs de ${a} cm et deux largeurs de ${b} cm. Le périmètre : ${a} + ${b} + ${a} + ${b} = <strong>${2 * (a + b)} cm</strong>.` };
  }
  if (type === 'triangle') {
    let a, b, c; do { a = rnd(3, 9); b = rnd(3, 9); c = rnd(4, 9); } while (a + b <= c + 1 || a + c <= b + 1 || b + c <= a + 1);
    P = centre(pointsTriangle(a, b, c, 230 / Math.max(a, b, c)), 320, 240); L = [`${c} cm`, `${a} cm`, `${b} cm`];
    return { enonce: 'Quel est le <strong>périmètre</strong> de ce triangle ?', figure: figPolygone(P, L), saisie: { type: 'nombre', bonne: a + b + c, unite: 'cm' }, rep: `${a + b + c} centimètres`, notion,
      explication: `On additionne les longueurs des 3 côtés : ${c} + ${a} + ${b} = <strong>${a + b + c} cm</strong>.` };
  }
  if (type === 'polygone') {
    const n = pick([5, 6]), c = rnd(2, 6), R = 85;
    P = Array.from({ length: n }, (_, i) => [160 + R * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), 120 + R * Math.sin((2 * Math.PI * i) / n - Math.PI / 2)]);
    return { enonce: `Les ${n} côtés de ce polygone ont tous la même longueur. Quel est son <strong>périmètre</strong> ?`, figure: figPolygone(P, [`${c} cm`, ...Array(n - 1).fill(null)]), saisie: { type: 'nombre', bonne: n * c, unite: 'cm' }, rep: `${n * c} centimètres`, notion,
      explication: `Il a ${n} côtés de ${c} cm : ${Array(n).fill(c).join(' + ')} = <strong>${n * c} cm</strong>, c'est-à-dire ${n} × ${c}.` };
  }
  /* une figure en L : six côtés */
  const a = rnd(5, 8), b = rnd(4, 6), c = rnd(2, a - 2), d = rnd(2, b - 2), e = Math.min(240 / a, 170 / b);
  P = centre([[0, 0], [c * e, 0], [c * e, (b - d) * e], [a * e, (b - d) * e], [a * e, b * e], [0, b * e]], 320, 240);
  L = [`${c} cm`, `${b - d} cm`, `${a - c} cm`, `${d} cm`, `${a} cm`, `${b} cm`];
  const t = c + (b - d) + (a - c) + d + a + b;
  return { enonce: 'Quel est le <strong>périmètre</strong> de cette figure ?', figure: figPolygone(P, L, { droits: [0, 1, 3, 4, 5] }), saisie: { type: 'nombre', bonne: t, unite: 'cm' }, rep: `${t} centimètres`, notion,
    explication: `On fait le tour de la figure en additionnant ses 6 côtés : ${c} + ${b - d} + ${a - c} + ${d} + ${a} + ${b} = <strong>${t} cm</strong>. Astuce : coche chaque côté au crayon quand tu l'as compté.` };
};


/* --- Reconnaître les figures planes --- */
const FIGURES = {
  'un carré': '4 côtés de <strong>même longueur</strong> et 4 <strong>angles droits</strong>',
  'un rectangle': '4 côtés, 4 <strong>angles droits</strong>, et les côtés opposés de même longueur (deux longueurs et deux largeurs)',
  'un losange': '4 côtés de <strong>même longueur</strong>, mais ses angles ne sont pas droits',
  'un triangle': '3 côtés et 3 sommets',
  'un triangle rectangle': '3 côtés, dont deux forment un <strong>angle droit</strong>',
  'un cercle': 'une ligne courbe et fermée ; tous ses points sont à la même distance du centre',
  'un pentagone': '5 côtés',
  'un hexagone': '6 côtés',
};
GEN.figures = (p) => {
  const notion = 'Les figures planes';
  const noms = p < 0.4 ? ['un carré', 'un rectangle', 'un triangle', 'un cercle'] : p < 0.75 ? ['un carré', 'un rectangle', 'un losange', 'un triangle', 'un triangle rectangle', 'un cercle'] : Object.keys(FIGURES);
  const nom = pick(noms), rot = rnd(-14, 14), W = 320, H = 240;
  let P, droits = [], dessin;
  if (nom === 'un carré') { const c = rnd(90, 140); P = [[0, 0], [c, 0], [c, c], [0, c]]; }
  else if (nom === 'un rectangle') { const a = rnd(160, 220), b = Math.round(a / (1.7 + Math.random())); P = [[0, 0], [a, 0], [a, b], [0, b]]; }
  else if (nom === 'un losange') { const d1 = rnd(170, 220), d2 = Math.round(d1 * (0.45 + Math.random() * 0.2)); P = [[d1 / 2, 0], [d1, d2 / 2], [d1 / 2, d2], [0, d2 / 2]]; if (Math.random() < 0.5) P = P.map(([x, y]) => [y, x]); }
  else if (nom === 'un triangle') { let a, b, c; do { a = rnd(5, 9); b = rnd(5, 9); c = rnd(6, 10); } while (a + b <= c + 2 || Math.abs(a * a + b * b - c * c) < 10 || Math.abs(a * a + c * c - b * b) < 10 || Math.abs(b * b + c * c - a * a) < 10); P = pointsTriangle(a, b, c, 20); }
  else if (nom === 'un triangle rectangle') { const a = rnd(120, 200), b = rnd(90, 150); P = [[0, 0], [0, b], [a, b]]; if (Math.random() < 0.5) P = [[a, 0], [a, b], [0, b]]; droits = [1]; }
  else if (nom === 'un pentagone' || nom === 'un hexagone') { const n = nom === 'un pentagone' ? 5 : 6, R = 90; P = Array.from({ length: n }, (_, i) => { const r = R * (0.85 + Math.random() * 0.25); return [r * Math.cos((2 * Math.PI * i) / n), r * Math.sin((2 * Math.PI * i) / n)]; }); }
  if (nom === 'un cercle') dessin = svgArdoise(W, H, `<circle cx="160" cy="120" r="${rnd(70, 95)}" fill="rgba(255,255,255,.06)" stroke="${CRAIE}" stroke-width="3.5"/>`, 'Une figure');
  else { P = centre(tourne(P, rot, 0, 0), W, H); dessin = figPolygone(P, null, { droits }); }
  const aussi = nom === 'un carré' ? ['un rectangle', 'un losange'] : nom === 'un triangle rectangle' ? ['un triangle'] : [];
  let options = [nom, ...aussi.filter((x) => noms.includes(x))];
  shuffle(noms).forEach((x) => { if (options.length < 4 && !options.includes(x)) options.push(x); });
  const precis = nom === 'un carré' ? ' Un carré est aussi un rectangle (il a 4 angles droits) et un losange (il a 4 côtés égaux) : c\'est un rectangle et un losange <em>particulier</em>, alors on dit « carré », le nom le plus précis.'
    : nom === 'un triangle rectangle' ? ' C\'est bien un triangle, mais un triangle particulier : il a un angle droit. On dit « triangle rectangle », le nom le plus précis.' : '';
  return { enonce: 'Quel est le nom de cette figure ?', figure: dessin, choix: shuffle(options).map((v) => ({ v, html: capitalize(v) })), bonne: nom, aussi: aussi.filter((x) => noms.includes(x)), rep: nom, notion,
    explication: `C'est <strong>${nom}</strong> : ${FIGURES[nom]}.${precis}` };
};

/* --- Les solides --- */
const SOLIDES = {
  cube: { nom: 'un cube', e: '6 faces, qui sont toutes des <strong>carrés</strong> de même taille, 8 sommets et 12 arêtes', faces: 6, sommets: 8, roule: false },
  pave: { nom: 'un pavé droit', e: '6 faces, qui sont des <strong>rectangles</strong> (comme une boîte à chaussures), 8 sommets et 12 arêtes', faces: 6, sommets: 8, roule: false },
  boule: { nom: 'une boule', e: 'elle est toute ronde, sans face plate ni sommet', roule: true },
  cylindre: { nom: 'un cylindre', e: 'deux faces plates qui sont des <strong>disques</strong>, et une face courbe (comme une boîte de conserve)', roule: true },
  cone: { nom: 'un cône', e: 'une face plate qui est un <strong>disque</strong>, une face courbe et une pointe (comme un cornet de glace)', roule: true },
  pyramide: { nom: 'une pyramide', e: 'une base (ici un carré), des faces <strong>triangulaires</strong> qui se rejoignent en un sommet ; celle-ci a 5 faces et 5 sommets', faces: 5, sommets: 5, roule: false },
};
GEN.solides = (p) => {
  const notion = 'Les solides';
  const k = pick(Object.keys(SOLIDES)), S = SOLIDES[k];
  if (p >= 0.55 && Math.random() < 0.55) {
    if (S.faces && Math.random() < 0.6) {
      const quoi = Math.random() < 0.6 ? 'faces' : 'sommets', r = S[quoi];
      return { enonce: `Combien ce solide a-t-il de <strong>${quoi}</strong> ?`, figure: figSolide(k), saisie: { type: 'nombre', bonne: r, unite: quoi }, rep: `${r} ${quoi}`, notion,
        explication: `C'est ${S.nom} : ${S.e}. Il a donc <strong>${r} ${quoi}</strong>. N'oublie pas les ${quoi} cachés derrière (les traits en pointillés).` };
    }
    return { enonce: 'Ce solide peut-il <strong>rouler</strong> ?', figure: figSolide(k), choix: [{ v: 'oui', html: 'Oui, il peut rouler' }, { v: 'non', html: 'Non, il ne peut pas rouler' }], bonne: S.roule ? 'oui' : 'non', rep: S.roule ? 'oui' : 'non', notion,
      explication: `C'est ${S.nom} : ${S.e}. ${S.roule ? 'Il a une face <strong>courbe</strong> : il <strong>peut rouler</strong>.' : 'Toutes ses faces sont <strong>plates</strong> : il <strong>ne peut pas rouler</strong>, il glisse.'}` };
  }
  return { enonce: 'Quel est le nom de ce solide ?', figure: figSolide(k), choix: Object.values(SOLIDES).map((x) => ({ v: x.nom, html: capitalize(x.nom) })), bonne: S.nom, rep: S.nom, notion,
    explication: `C'est <strong>${S.nom}</strong> : ${S.e}.` };
};

/* --- L'angle droit --- */
GEN.angle = (p) => {
  const notion = 'L\'angle droit';
  const rot = rnd(0, 359);
  if (p >= 0.7 && Math.random() < 0.4) {
    const F = pick([['un carré', 4], ['un rectangle', 4], ['un triangle rectangle', 1]]);
    return { enonce: `Combien d'<strong>angles droits</strong> a ${F[0]} ?`, saisie: { type: 'nombre', bonne: F[1], unite: `angle${F[1] > 1 ? 's' : ''} droit${F[1] > 1 ? 's' : ''}` }, rep: String(F[1]), notion,
      explication: F[1] === 4 ? `${capitalize(F[0])} a <strong>4 angles droits</strong>, un à chaque coin : on peut y poser le coin de l'équerre.` : 'Un triangle rectangle a <strong>1 angle droit</strong> : c\'est ce qui lui donne son nom.' };
  }
  const trois = p >= 0.35;
  const r = Math.random();
  const deg = r < 0.4 ? 90 : r < 0.7 ? (trois ? rnd(35, 72) : rnd(25, 55)) : (trois ? rnd(110, 150) : rnd(125, 160));
  const v = deg === 90 ? 'droit' : deg < 90 ? 'petit' : 'grand';
  const choix = trois ? [{ v: 'droit', html: 'C\'est un angle droit' }, { v: 'petit', html: 'Il est plus petit qu\'un angle droit' }, { v: 'grand', html: 'Il est plus grand qu\'un angle droit' }]
    : [{ v: 'droit', html: 'C\'est un angle droit' }, { v: 'pas', html: 'Ce n\'est pas un angle droit' }];
  const bonne = trois || v === 'droit' ? v : 'pas';
  return { enonce: 'Est-ce un <strong>angle droit</strong> ?', figure: figAngle(deg, rot, false), choix, bonne, rep: v === 'droit' ? 'un angle droit' : v === 'petit' ? 'plus petit qu\'un angle droit' : 'plus grand qu\'un angle droit', notion,
    figureCorrection: figAngle(deg, rot, true),
    explication: `On pose le coin de l'équerre (en bleu) sur le sommet de l'angle, un côté le long d'un des traits. ${v === 'droit' ? 'L\'autre trait suit exactement l\'équerre : c\'est un <strong>angle droit</strong>.' : v === 'petit' ? 'L\'autre trait passe à l\'intérieur de l\'équerre : l\'angle est plus fermé, il est <strong>plus petit qu\'un angle droit</strong>.' : 'L\'autre trait passe à l\'extérieur de l\'équerre : l\'angle est plus ouvert, il est <strong>plus grand qu\'un angle droit</strong>.'}` };
};

/* --- La symétrie : la droite est-elle un axe de symétrie ? --- */
GEN.sym = (p) => {
  const notion = 'La symétrie';
  const horiz = p >= 0.5 && Math.random() < 0.4;
  const nc = horiz ? 7 : 8, nl = horiz ? 8 : 6, demi = horiz ? nl / 2 : nc / 2;
  const cases = new Set(), nbCases = p < 0.4 ? rnd(4, 5) : rnd(6, 8);
  /* une forme d'un seul tenant, collée à l'axe */
  let c0 = horiz ? [rnd(1, nc - 2), demi - 1] : [demi - 1, rnd(1, nl - 2)];
  cases.add(c0.join(','));
  while (cases.size < nbCases) {
    const [c, l] = pick([...cases]).split(',').map(Number), [dc, dl] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    const C = c + dc, L = l + dl;
    if (C >= 0 && L >= 0 && (horiz ? L < demi && C < nc : C < demi && L < nl)) cases.add(`${C},${L}`);
  }
  const gauche = [...cases].map((k) => k.split(',').map(Number));
  let droite = gauche.map(([c, l]) => (horiz ? [c, nl - 1 - l] : [nc - 1 - c, l]));
  const oui = Math.random() < 0.5;
  let erreurs = [];
  if (!oui) {
    const k = rnd(0, droite.length - 1), [c, l] = droite[k];
    const autour = (horiz ? [[c + 1, l], [c - 1, l], [c, l + 1]] : [[c, l + 1], [c, l - 1], [c + 1, l]]).filter(([x, y]) => x >= 0 && y >= 0 && x < nc && y < nl && (horiz ? y >= demi : x >= demi) && !droite.some(([u, v]) => u === x && v === y));
    if (autour.length) { droite[k] = pick(autour); erreurs = [droite[k], horiz ? [c, l] : [c, l]]; }
    else { droite.splice(k, 1); erreurs = [[c, l]]; }
  }
  const toutes = [...gauche.map(([c, l]) => [c, l, JAUNE]), ...droite.map(([c, l]) => [c, l, JAUNE])];
  const o = horiz ? { axeH: demi } : { axeV: demi };
  return { enonce: 'La droite en pointillés est-elle un <strong>axe de symétrie</strong> de cette figure ?', figure: figQuadrillage(nc, nl, toutes, o),
    choix: [{ v: 'oui', html: 'Oui, c\'est un axe de symétrie' }, { v: 'non', html: 'Non, ce n\'est pas un axe de symétrie' }], bonne: oui ? 'oui' : 'non', rep: oui ? 'oui' : 'non', notion,
    figureCorrection: oui ? null : figQuadrillage(nc, nl, toutes, { ...o, erreurs }),
    explication: oui ? 'Si l\'on plie le long de la droite, chaque case coloriée retombe exactement sur une case coloriée de l\'autre côté, à la même distance de l\'axe : <strong>c\'est un axe de symétrie</strong>.'
      : 'Si l\'on plie le long de la droite, les deux moitiés ne se recouvrent pas : les cases entourées en rouge montrent où se trouve l\'erreur : une case n\'a pas sa jumelle de l\'autre côté. <strong>Ce n\'est pas un axe de symétrie</strong>. Compte les cases de chaque côté de l\'axe pour vérifier.' };
};

/* --- Le cercle et les instruments --- */
GEN.cercle = (p) => {
  const notion = 'Le cercle et les instruments';
  const type = p < 0.35 ? pick([0, 2]) : pick([0, 1, 1, 2]);
  if (type === 0) {
    const el = pick(['centre', 'rayon', 'diametre']), noms = { centre: 'le centre', rayon: 'un rayon', diametre: 'un diamètre' };
    return { enonce: 'Comment s\'appelle ce qui est dessiné en <strong style="color:#c79a00">jaune</strong> ?', figure: figCercle(el, rnd(0, 179)), choix: Object.entries(noms).map(([v, h]) => ({ v, html: capitalize(h) })), bonne: el, rep: noms[el], notion,
      explication: { centre: 'C\'est <strong>le centre</strong> du cercle : la pointe du compas s\'y pose, et tous les points du cercle sont à la même distance de lui.', rayon: 'C\'est <strong>un rayon</strong> : un segment qui va du centre jusqu\'au cercle. C\'est l\'écartement du compas.', diametre: 'C\'est <strong>un diamètre</strong> : un segment qui traverse le cercle en passant par le centre. Il mesure deux rayons.' }[el] };
  }
  if (type === 1) {
    const r = rnd(2, 9), versD = Math.random() < 0.6;
    return { enonce: versD ? `Le <strong>rayon</strong> d'un cercle mesure <strong>${r} cm</strong>. Combien mesure son <strong>diamètre</strong> ?` : `Le <strong>diamètre</strong> d'un cercle mesure <strong>${2 * r} cm</strong>. Combien mesure son <strong>rayon</strong> ?`,
      figure: figCercle(versD ? 'rayon' : 'diametre', 20), saisie: { type: 'nombre', bonne: versD ? 2 * r : r, unite: 'cm' }, rep: `${versD ? 2 * r : r} centimètres`, notion,
      explication: versD ? `Le diamètre mesure deux rayons : ${r} + ${r} = <strong>${2 * r} cm</strong>.` : `Le rayon est la moitié du diamètre : la moitié de ${2 * r}, c'est <strong>${r} cm</strong>.` };
  }
  const F = pick([
    ['tracer un cercle', 'le compas', 'On trace un cercle avec <strong>le compas</strong> : la pointe se pose au centre, la mine trace le cercle.'],
    ['vérifier qu\'un angle est droit', 'l\'équerre', 'On vérifie un angle droit avec <strong>l\'équerre</strong> : on pose son coin sur le sommet de l\'angle.'],
    ['tracer un trait droit et le mesurer', 'la règle', 'On trace et on mesure un trait droit avec <strong>la règle graduée</strong>.'],
    ['tracer un carré, avec ses angles droits', 'l\'équerre', 'Pour les angles droits du carré, il faut <strong>l\'équerre</strong> (et la règle pour mesurer les côtés).'],
    ['reporter une longueur sans la mesurer', 'le compas', 'On reporte une longueur avec <strong>le compas</strong>, en gardant le même écartement.'],
  ]);
  return { enonce: `Quel instrument faut-il pour <strong>${F[0]}</strong> ?`, choix: Object.keys(INSTRUMENTS).map((v) => ({ v, html: `${INSTRUMENTS[v]} ${capitalize(v)}` })), bonne: F[1], rep: F[1], notion, explication: F[2] };
};

/* --- Se repérer sur un quadrillage --- */
const nomCase = (c, l, nl) => `${'ABCDEFGH'[c]}${nl - l}`;
GEN.repere = (p) => {
  const notion = 'Se repérer sur un quadrillage';
  const n = 5;
  if (p < 0.5 || Math.random() < 0.3) {
    const c = rnd(0, n - 1), l = rnd(0, n - 1), ic = pick(['★', '♥', '☀', '♣']), bonne = nomCase(c, l, n);
    const opts = new Set([bonne]);
    [[c + 1, l], [c - 1, l], [c, l + 1], [c, l - 1], [l, c]].forEach(([x, y]) => { if (opts.size < 4 && x >= 0 && y >= 0 && x < n && y < n) opts.add(nomCase(x, y, n)); });
    while (opts.size < 4) opts.add(nomCase(rnd(0, n - 1), rnd(0, n - 1), n));
    return { enonce: `Dans quelle case est le dessin <span class="mm-ico-txt">${ic}</span> ?`, figure: figQuadrillage(n, n, [], { reperes: true, icones: [[c, l, ic]] }), choix: shuffle([...opts]).map((v) => ({ v, html: v })), bonne, rep: bonne, notion,
      explication: `On descend jusqu'aux lettres : le dessin est dans la colonne <strong>${'ABCDE'[c]}</strong>. On va vers la gauche jusqu'aux nombres : il est sur la ligne <strong>${n - l}</strong>. Sa case est <strong>${bonne}</strong> : d'abord la lettre, puis le nombre.` };
  }
  /* les déplacements du robot */
  let c = rnd(0, n - 1), l = rnd(0, n - 1);
  const depart = nomCase(c, l, n), chemin = [[c, l]], fleches = [], mots = [];
  const nb = p < 0.8 ? 2 : 3;
  const DIR = { '→': [1, 0, 'vers la droite'], '←': [-1, 0, 'vers la gauche'], '↑': [0, -1, 'vers le haut'], '↓': [0, 1, 'vers le bas'] };
  for (let i = 0; i < nb; i += 1) {
    const poss = Object.entries(DIR).filter(([f, [dc, dl]]) => c + dc >= 0 && c + dc < n && l + dl >= 0 && l + dl < n && !fleches.slice(-1).includes({ '→': '←', '←': '→', '↑': '↓', '↓': '↑' }[f]));
    const [f, [dc, dl, m]] = pick(poss); let k = 1;
    while (k < 3 && c + dc * (k + 1) >= 0 && c + dc * (k + 1) < n && l + dl * (k + 1) >= 0 && l + dl * (k + 1) < n && Math.random() < 0.5) k += 1;
    for (let j = 0; j < k; j += 1) { c += dc; l += dl; chemin.push([c, l]); fleches.push(f); }
    mots.push(`${k} case${k > 1 ? 's' : ''} ${m}`);
  }
  const arrivee = nomCase(c, l, n), opts = new Set([arrivee]);
  [[c + 1, l], [c - 1, l], [c, l + 1], [c, l - 1], [chemin[0][0], chemin[0][1]]].forEach(([x, y]) => { if (opts.size < 4 && x >= 0 && y >= 0 && x < n && y < n) opts.add(nomCase(x, y, n)); });
  while (opts.size < 4) opts.add(nomCase(rnd(0, n - 1), rnd(0, n - 1), n));
  return { enonce: `Le robot 🤖 part de la case <strong>${depart}</strong>. Il suit le chemin : <span class="mm-fleches">${fleches.join(' ')}</span>. Sur quelle case arrive-t-il ?`,
    voix: `Le robot part de la case ${depart}. Il avance de ${mots.join(', puis de ')}. Sur quelle case arrive-t-il ?`,
    figure: figQuadrillage(n, n, [], { reperes: true, icones: [[chemin[0][0], chemin[0][1], '🤖']] }), figureCorrection: figQuadrillage(n, n, [], { reperes: true, icones: [[chemin[0][0], chemin[0][1], '🤖'], [c, l, '🏁']], chemin }),
    choix: shuffle([...opts]).map((v) => ({ v, html: v })), bonne: arrivee, rep: arrivee, notion,
    explication: `Chaque flèche fait avancer le robot d'une case : ${mots.join(', puis ')}. Il arrive sur la case <strong>${arrivee}</strong>.` };
};


/* ------------------------------------------------------------
   L'ACCUEIL : les quatre onglets de niveau, les trois parties, la liste des exercices
   ------------------------------------------------------------ */
let classeAccueil = (() => { try { return localStorage.getItem('mnemomaths-classe') || 'ce'; } catch (e) { return 'ce'; } })();
if (!CLASSES.some((c) => c.id === classeAccueil)) classeAccueil = 'ce';
function dessinePortail() {
  const C = CLASSES.find((c) => c.id === classeAccueil);
  $('home-classes').innerHTML = CLASSES.map((c) => `<button type="button" class="classe-onglet${c.id === classeAccueil ? ' on' : ''}" data-classe="${c.id}" role="tab" aria-selected="${c.id === classeAccueil}">${c.nom}</button>`).join('');
  $('home-classes-note').textContent = `Exercices pour le ${C.cycle}. Les autres onglets restent ouverts : tu peux aller voir plus facile ou plus difficile.`;
  PARTIES.forEach((partie) => {
    let n = 0, nb = 0;
    const L0 = PARCOURS[partie].map((e, k) => ({ e, k })).filter(({ e }) => e.classes.includes(classeAccueil));
    const L = [...L0.filter(({ e }) => !e.bilan && !e.avenir), ...L0.filter(({ e }) => e.bilan), ...L0.filter(({ e }) => e.avenir)];
    const nEx = L.filter(({ e }) => !e.bilan && !e.avenir).length, premierBilan = L.findIndex(({ e }) => e.bilan), premierAvenir = L.findIndex(({ e }) => e.avenir);
    const titreEx = nEx ? `<p class="home-etape"><strong>Apprendre pas à pas</strong> : ${nEx} exercices, une notion à la fois, avec des questions de plus en plus difficiles. Les questions changent à chaque partie.</p>` : '';
    const titreBilan = '<p class="home-etape"><strong>Faire le bilan</strong> : toutes les notions de la partie, mélangées.</p>';
    const titreAvenir = '<p class="home-etape"><strong>Bientôt</strong> : les exercices prévus par le programme, qui arrivent.</p>';
    document.querySelector(`[data-liste="${partie}"]`).innerHTML = titreEx + L.map(({ e, k }, idx) => {
      const nom = e.bilan ? `Bilan ${++nb}` : e.avenir ? '' : `Exercice ${++n}`;
      const avant = (idx === premierBilan ? titreBilan : '') + (idx === premierAvenir ? titreAvenir : '');
      return avant + (e.avenir
        ? `<button type="button" class="home-mode-button avenir" disabled><span class="label">${e.titre}</span><span class="desc">bientôt</span></button>`
        : `<button type="button" class="home-mode-button${e.bilan ? ' bilan' : ''}" data-partie-ex="${partie}" data-k="${k}" data-nom="${nom}"><span class="label"><strong>${nom}</strong><br>${e.titre}</span></button>`);
    }).join('') || '<p class="sous">Pas encore d\'exercice à ce niveau.</p>';
  });
  document.querySelectorAll('[data-classe]').forEach((b) => b.addEventListener('click', () => {
    classeAccueil = b.dataset.classe;
    try { localStorage.setItem('mnemomaths-classe', classeAccueil); } catch (e) {}
    dessinePortail();
  }));
  document.querySelectorAll('[data-partie-ex]').forEach((b) => b.addEventListener('click', () => {
    const p = b.dataset.partieEx, e = PARCOURS[p][Number(b.dataset.k)], C = CLASSES.find((c) => c.id === classeAccueil);
    openGame({ ...e, partie: p, titreComplet: `${C.nom} · ${PARTIES_NOM[p]} · ${b.dataset.nom.toLowerCase()} : ${e.titre}` });
  }));
}
let partieAccueil = '';
function montrePartie(p) {
  partieAccueil = p || '';
  $('home-parties').classList.toggle('choisie', !!partieAccueil);
  document.querySelectorAll('#home-parties .home-partie').forEach((b) => { const on = b.dataset.partie === partieAccueil; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'true' : 'false'); });
  PARTIES.forEach((k) => $(`home-${k}`).classList.toggle('hidden', partieAccueil !== k));
  window.scrollTo(0, partieAccueil ? $('home-classes').getBoundingClientRect().top + window.scrollY - 70 : 0);
}
document.querySelectorAll('[data-partie]').forEach((b) => b.addEventListener('click', () => montrePartie(b.dataset.partie)));
function showPanel(name) {
  $('welcome-panel').classList.toggle('hidden', name !== 'welcome');
  $('natures-panel').classList.toggle('hidden', name !== 'natures');
  $('results-panel').classList.toggle('hidden', name !== 'results');
  $('bg-mosaic').classList.toggle('hidden', name !== 'welcome');
  document.body.classList.toggle('in-exercise', name !== 'welcome');
  window.scrollTo(0, 0);
}

/* Mosaïque de l'accueil : les images du dossier « Allégorie maths » (assets/mosaique), floutées et pâlies,
   nettes au survol, comme dans Mnemart. Au centre, sur deux cases, le portrait de Luca Pacioli
   (Jacopo de' Barbari, 1495) ; deux images reviennent une seconde fois, loin de leur double, pour remplir la grille. */
const BG_MOSAIC_CENTRE = 'luca-pacioli.jpg';
const BG_MOSAIC_FILES = [
  'arithmetique-la-hyre.jpg', 'tableau-noir.jpg', 'homme-de-vitruve.jpg', 'pentagramme.jpg',
  'signes-calcul.jpg', 'margarita-philosophica.jpg', 'cmap-polytechnique.jpg', 'pourcent.jpg',
  'homme-de-vitruve.jpg', 'arithmetique-la-hyre.jpg',
];
function initMosaic() {
  const c = $('bg-mosaic');
  const tuile = (f, cl) => `<div class="bg-tile${cl ? ` ${cl}` : ''}"><img src="assets/mosaique/${f}" alt="" loading="lazy" draggable="false" onerror="this.style.visibility='hidden'" /></div>`;
  c.innerHTML = tuile(BG_MOSAIC_CENTRE, 'bg-centre') + BG_MOSAIC_FILES.map((f) => tuile(f)).join('');
  c.querySelectorAll('.bg-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
      const was = tile.classList.contains('touched');
      c.querySelectorAll('.bg-tile.touched').forEach((t) => t.classList.remove('touched'));
      if (!was) tile.classList.add('touched');
    });
    tile.addEventListener('mouseenter', () => tile.classList.add('touched'));
    tile.addEventListener('mouseleave', () => tile.classList.remove('touched'));
  });
}

/* ------------------------------------------------------------
   LE JEU
   Une partie = 10 questions (12 ou 14 pour un bilan), fabriquées au moment où l'on appuie sur « Démarrer ».
   Erreur : un sorcier grincheux encourage à recommencer (2e essai) ; après deux erreurs, la bonne réponse
   s'affiche. Le score compte les réponses trouvées du premier coup.
   ------------------------------------------------------------ */
let currentGame = null;
const game = { questions: [], index: 0, score: 0, essais: 0, fini: false, repondu: false, erreurs: [], parNotion: {} };
function fabriqueQuestions(e) {
  const n = e.n || 10, ordre = e.mix ? shuffle(e.mix) : [e.gen], vus = new Set(), L = [];
  for (let k = 0; k < n; k += 1) {
    const p = n > 1 ? k / (n - 1) : 0, g = ordre[k % ordre.length];
    let q, cle, essai = 0;
    do { q = GEN[g](p); cle = `${q.enonce}|${q.rep}`; essai += 1; } while (vus.has(cle) && essai < 30);
    vus.add(cle); L.push(q);
  }
  return L;
}
function openGame(e) {
  currentGame = e;
  $('nat-ready-explanation').innerHTML = e.consigne || '';
  $('nat-game-title').textContent = e.titreComplet || e.titre;
  showPanel('natures');
  $('nat-ready-screen').classList.remove('hidden');
  $('nat-quiz-grid').classList.add('hidden');
  $('nat-progress-label').textContent = `Question 1 / ${e.n || 10}`;
  $('nat-score-label').textContent = scoreLabel(0);
  $('nat-progress-bar').style.width = '0';
}
const scoreLabel = (n) => `${fmtPts(n)} bonne${n > 1 ? 's' : ''} réponse${n > 1 ? 's' : ''}`;
function startGame() {
  if (!currentGame) return;
  game.questions = fabriqueQuestions(currentGame);
  game.index = 0; game.score = 0; game.fini = false; game.erreurs = []; game.parNotion = {};
  showPanel('natures');
  $('nat-ready-screen').classList.add('hidden');
  $('nat-quiz-grid').classList.remove('hidden');
  showQuestion();
}
function updateProgress() {
  $('nat-progress-label').textContent = `Question ${game.index + 1} / ${game.questions.length}`;
  $('nat-score-label').textContent = scoreLabel(game.score);
  $('nat-progress-bar').style.width = `${(game.index / game.questions.length) * 100}%`;
}
const touchesClavier = (h) => ['7', '8', '9', '4', '5', '6', '1', '2', '3', ',', '0', '⌫', ...(h ? ['h'] : [])];
function showQuestion() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  const q = game.questions[game.index];
  game.essais = 0; game.repondu = false;
  $('nat-sentence').innerHTML = `<span class="mm-enonce">${nbspFr(q.enonce)}</span>${q.figure ? `<span class="mm-figure">${q.figure}</span>` : ''}`;
  $('nat-character-stage').innerHTML = '';
  $('nat-correction').classList.add('hidden');
  $('nat-verdict-square').className = 'verdict-square';
  $('nat-instruction').textContent = q.saisie ? 'Écris ta réponse :' : 'Choisis la bonne réponse :';
  const z = $('mm-zone');
  if (q.saisie) {
    z.innerHTML = `<div class="mm-saisie"><input id="mm-input" type="text" inputmode="${q.saisie.h ? 'text' : 'decimal'}" autocomplete="off" spellcheck="false" aria-label="Ta réponse" placeholder="${q.saisie.h ? '15 h 45' : '?'}" />${q.saisie.unite ? `<span class="mm-unite">${q.saisie.unite}</span>` : ''}</div>
      <p id="mm-indice" class="mm-indice hidden" aria-live="polite"></p>
      <div class="mm-clavier${q.saisie.h ? ' avec-h' : ''}">${touchesClavier(q.saisie.h).map((t) => `<button type="button" class="mm-touche" data-t="${t}">${t}</button>`).join('')}</div>
      <button type="button" class="primary-button mm-valider" id="mm-valider">Valider ✓</button>`;
    const inp = $('mm-input');
    z.querySelectorAll('.mm-touche').forEach((b) => b.addEventListener('click', () => {
      if (game.repondu) return;
      const t = b.dataset.t;
      if (t === '⌫') inp.value = inp.value.slice(0, -1);
      else if (t === 'h') inp.value = `${inp.value.trim()} h `;
      else inp.value += t;
    }));
    inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); valideSaisie(); } });
    $('mm-valider').addEventListener('click', valideSaisie);
    if (window.matchMedia('(hover:hover)').matches) setTimeout(() => inp.focus(), 50);
  } else {
    z.innerHTML = `<p id="mm-indice" class="mm-indice hidden" aria-live="polite"></p><div class="nature-buttons mm-choix${q.choix.length > 3 && q.choix.every((c) => c.html.length < 40) ? ' deux' : ''}">${q.choix.map((c) => `<button type="button" class="nature-button" data-v="${String(c.v).replace(/"/g, '&quot;')}">${c.html}</button>`).join('')}</div>`;
    z.querySelectorAll('.nature-button').forEach((b) => b.addEventListener('click', () => valideChoix(b.dataset.v, b)));
  }
  updateProgress();
}
function montreIndice(t) { const el = $('mm-indice'); if (!el) return; el.innerHTML = t; el.classList.remove('hidden'); }
function valideSaisie() {
  if (game.repondu || game.fini) return;
  const q = game.questions[game.index], inp = $('mm-input'), brut = inp.value.trim();
  if (!brut) { montreIndice('Écris d\'abord ta réponse.'); return; }
  const val = q.saisie.type === 'minutes' ? lisMinutes(brut) : lisNombre(brut);
  if (Number.isNaN(val)) { montreIndice(q.saisie.type === 'minutes' ? 'Écris une heure, par exemple <strong>15 h 45</strong>.' : 'Écris seulement un nombre, par exemple <strong>56</strong> ou <strong>4,50</strong>.'); return; }
  const juste = Math.abs(val - q.saisie.bonne) < 1e-9;
  const montre = (v) => (q.saisie.type === 'minutes' ? fmtHeure(v) : fmtN(v));
  if (juste) { inp.value = montre(val); repondu(true); return; }
  erreur(montre(val));
  inp.classList.remove('secoue'); void inp.offsetWidth; inp.classList.add('secoue');
  if (game.essais >= 2) { inp.value = montre(q.saisie.bonne); inp.classList.add('montree'); repondu(false); }
  else { montreIndice(`Ce n'est pas <strong>${montre(val)}</strong>${q.saisie.unite ? ` ${q.saisie.unite}` : ''}. Réfléchis encore, et réessaie !`); inp.select(); }
}
function valideChoix(v, btn) {
  if (game.repondu || game.fini) return;
  const q = game.questions[game.index];
  if (v === String(q.bonne)) { btn.classList.add('correct'); repondu(true); return; }
  if ((q.aussi || []).includes(v)) {
    btn.classList.add('faded'); btn.disabled = true;
    const t = 'C\'est vrai, mais il existe un nom <strong>plus précis</strong> ! Cherche encore.';
    montreIndice(t); speak(voixMaths(t), 'femme', 'good');
    return;
  }
  erreur(btn.textContent.trim());
  btn.classList.add('wrong'); btn.disabled = true;
  if (game.essais >= 2) { document.querySelector(`#mm-zone .nature-button[data-v="${String(q.bonne).replace(/"/g, '\\"')}"]`)?.classList.add('correct'); repondu(false); }
  else montreIndice('Ce n\'est pas la bonne réponse. Réfléchis encore, et réessaie !');
}
function erreur(choisie) {
  const q = game.questions[game.index];
  if (game.essais === 0) game.erreurs.push({ question: q.court || voixMaths(q.voix || q.enonce).slice(0, 90), bonne: q.rep, choisie, notion: q.notion });
  game.essais += 1;
  if (game.essais < 2) showCharacter('bad');
}
function repondu(juste) {
  const q = game.questions[game.index];
  game.repondu = true;
  if (juste && game.essais === 0) game.score += 1;
  const t = game.parNotion[q.notion] || (game.parNotion[q.notion] = { c: 0, p: 0 });
  t.p += 1; if (juste && game.essais === 0) t.c += 1;
  document.querySelectorAll('#mm-zone button').forEach((b) => { b.disabled = true; if (!b.classList.contains('correct') && !b.classList.contains('wrong') && b.classList.contains('nature-button')) b.classList.add('faded'); });
  const inp = $('mm-input'); if (inp) { inp.readOnly = true; inp.classList.add(juste ? 'juste' : 'montree'); }
  $('mm-indice')?.classList.add('hidden');
  if (q.figureCorrection) { const f = document.querySelector('#nat-sentence .mm-figure'); if (f) f.innerHTML = q.figureCorrection; }
  $('nat-correction-details').innerHTML = nbspFr(q.explication);
  $('nat-correction').classList.remove('hidden');
  $('nat-verdict-square').className = `verdict-square ${juste ? (game.essais === 0 ? 'correct' : 'half') : 'wrong'}`;
  $('nat-score-label').textContent = scoreLabel(game.score);
  $('nat-next-button').textContent = game.index + 1 < game.questions.length ? 'Suivant →' : 'Voir mon score →';
  showCharacter(juste ? 'good' : 'bad');
  setTimeout(() => $('nat-next-button').focus({ preventScroll: true }), 60);
}
function nextQuestion() {
  if (!game.repondu) return;
  if (game.index + 1 < game.questions.length) { game.index += 1; showQuestion(); }
  else showResults();
}

/* Les sorciers : un message tiré au hasard, personnalisé avec le prénom et les proches quand il y a un compte */
const recentMessages = [];
function chooseMessage(ch) {
  const enfant = playerProfile?.enfant?.prenom;
  const adultes = (playerProfile?.adultes || []).filter((a) => a.lien);
  const r = Math.random();
  if (enfant && adultes.length && r < 0.3) { const a = pick(adultes); return { tpl: pick(ch.famille), adulte: a, photo: a.photo || playerProfile.enfant.photo }; }
  if (enfant && r < 0.75) return { tpl: pick(ch.perso), photo: playerProfile.enfant.photo };
  return { tpl: pick(ch.messages) };
}
function fillMessage(tpl, rep, adulte) {
  let msg = tpl;
  if (rep) msg = msg.replace('{rep}', rep).replace('{Rep}', capitalize(rep));
  msg = msg.replace(/\{E\}/g, playerProfile?.enfant?.prenom || '');
  if (adulte) {
    const l = LIENS[adulte.lien] || LIENS.papa;
    const ga = adulte.prenom ? `${l.ton} ${adulte.prenom}` : l.ton;
    msg = msg.replace('{adulte}', ga).replace('{Adulte}', capitalize(ga)).replace('{fier}', l.f ? 'fière' : 'fier');
  }
  return msg;
}
const explicationDite = () => voixMaths(String(game.questions[game.index]?.explication || '').replace(/<table[\s\S]*?<\/table>/g, ' ').replace(/•/g, ''));
function showCharacter(camp) {
  const corr = !$('nat-correction').classList.contains('hidden');
  if (!optSorciers(playerProfile)) {
    $('nat-character-stage').innerHTML = '';
    if (corr) speak(explicationDite(), 'femme', 'phrase');
    return;
  }
  const id = pick(Object.keys(CHARACTERS).filter((k) => CHARACTERS[k].camp === camp)), ch = CHARACTERS[id];
  const rep = camp === 'good' ? game.questions[game.index]?.rep : '';
  let msg = '', photo = '';
  for (let essai = 0; essai < 8; essai += 1) {
    const choix = chooseMessage(ch);
    msg = fillMessage(choix.tpl, rep, choix.adulte); photo = choix.photo || '';
    if (/\{[rR]ep\}/.test(msg)) continue;
    if (!recentMessages.includes(msg)) break;
  }
  if (/\{[rR]ep\}/.test(msg)) msg = pick(ch.messages.filter((m) => !/\{[rR]ep\}/.test(m)));
  recentMessages.push(msg); if (recentMessages.length > 4) recentMessages.shift();
  const stage = $('nat-character-stage');
  stage.className = `character-stage ${camp}`;
  stage.innerHTML = `<div class="bubble${photo ? ' has-photo' : ''}">${photo ? `<img class="bubble-photo" src="${photo}" alt="" />` : ''}<div><span class="who">${ch.nom}</span>${nbspFr(msg)}</div></div>${characterSvg(id)}`;
  speak(voixMaths(msg), ch.voix, camp);
  if (corr) speak(explicationDite(), 'femme', 'phrase', true);
}

/* La fin de la partie */
function showResults() {
  game.fini = true;
  const n = game.questions.length, s = game.score, content = s >= Math.ceil(n * 0.6);
  const id = content ? pick(['compas', 'equerre']) : pick(['retenue', 'bevue']);
  const pe = playerProfile?.enfant?.photo;
  $('results-character').innerHTML = characterSvg(id) + (pe ? `<img class="results-photo" src="${pe}" alt="" />` : '');
  $('results-title').textContent = `${s} bonne${s > 1 ? 's' : ''} réponse${s > 1 ? 's' : ''} sur ${n}`;
  const E = playerProfile?.enfant?.prenom;
  const adultes = (playerProfile?.adultes || []).filter((a) => a.lien);
  const a = adultes.length ? pick(adultes) : null;
  const famille = a ? ` ${fillMessage('{Adulte} sera très {fier} de toi !', null, a)}` : '';
  const parole = s === n ? (E ? `Un sans-faute, ${E} ! Tu es un génie des mathématiques !${famille}` : 'Un sans-faute ! Tu es un grand sorcier des mathématiques !')
    : content ? (E ? `Très bien, ${E} ! Encore une partie, et tu sauras tout par cœur.${famille}` : 'Très bien ! Encore une partie, et tu sauras tout par cœur.')
    : (E ? `Hum… Ce n'est pas encore ça, ${E}. Mais si tu rejoues, je suis sûr que tu feras mieux !` : 'Hum… Ce n\'est pas encore ça. Mais si tu rejoues, je suis sûr que tu feras mieux !');
  const sorciers = optSorciers(playerProfile);
  if (!sorciers) $('results-character').innerHTML = pe ? `<img class="results-photo" src="${pe}" alt="" />` : '';
  const texte = sorciers ? `${CHARACTERS[id].nom} : « ${parole} »` : (s === n ? 'Un sans-faute : bravo !' : content ? 'Très bien : encore une partie, et vous saurez tout par cœur.' : 'Rejouez : chaque partie aide à mieux retenir.');
  $('results-text').textContent = texte;
  lastResult = { jeu: currentGame.titreComplet || currentGame.titre, exercice: currentGame.jeu, score: s, total: n, erreurs: game.erreurs.slice(), parNotion: game.parNotion, date: new Date().toISOString() };
  saveScore(lastResult);
  renderSendBox();
  showPanel('results');
  if (sorciers) speak(texte.replace(/^[^:]+: /, '').replace(/[«»]/g, ''), CHARACTERS[id].voix, content ? 'good' : 'bad');
}


/* ------------------------------------------------------------
   SCORES : enregistrés dans le compte (users/{identifiant}/mnemomaths), et envoyés par e-mail à la famille
   (par la messagerie de l'appareil : le site n'a pas de serveur, il ne peut pas expédier un e-mail tout seul).
   ------------------------------------------------------------ */
const SITE_URL = 'https://stassi-tech.github.io/mnemomaths/';
let lastResult = null;
async function saveScore(r) {
  if (!currentUser || !db) return;
  const id = `score-${Date.now()}`;
  try {
    await db.collection('users').doc(currentUser.uid).collection('mnemomaths').doc(id)
      .set({ type: 'score', ...r, creeLe: firebase.firestore.FieldValue.serverTimestamp() });
  } catch (e) { console.warn('Enregistrement du score', e); }
}
async function loadScores() {
  if (!currentUser || !db) return [];
  try {
    const snap = await db.collection('users').doc(currentUser.uid).collection('mnemomaths').where('type', '==', 'score').get();
    return snap.docs.map((d) => ({ ...d.data(), _id: d.id })).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  } catch (e) { console.warn('Lecture des scores', e); return []; }
}
const ligneErreur = (e) => `- ${e.question} : c'était ${e.bonne}, et j'avais répondu ${e.choisie}.`;
function scoreMessage(r) {
  const E = playerProfile?.enfant?.prenom || '';
  const l = [`J'ai fait l'exercice « ${r.jeu} » sur MNEMOMATHS.`, `Mon score : ${r.score} bonne${r.score > 1 ? 's' : ''} réponse${r.score > 1 ? 's' : ''} du premier coup sur ${r.total}.`];
  if ((r.erreurs || []).length) { l.push('', 'Mes erreurs :'); r.erreurs.forEach((e) => l.push(ligneErreur(e))); } else l.push('', 'Aucune erreur !');
  l.push('', E, SITE_URL);
  return l.join('\n');
}
function renderSendBox() {
  const box = $('results-send');
  if (!currentUser) { box.innerHTML = '<p class="send-hint">Avec un compte, tu pourras envoyer ton score à ta famille.</p>'; return; }
  if (!optEnvoi(playerProfile)) { box.innerHTML = ''; return; }
  box.innerHTML = sendBoxHtml('esend', 'Envoyer mon score à :').replace('dans ta fiche (ci-dessus)', 'dans « Mon compte » 👤');
  const E = playerProfile?.enfant?.prenom;
  wireSendBox('esend', () => `${E ? E + ' : ' : ''}mon score sur MNEMOMATHS (${fmtPts(lastResult.score)}/${lastResult.total})`, async () => scoreMessage(lastResult));
}

/* ------------------------------------------------------------
   LES FICHES (bouton 📖) : trois aide-mémoire, un par domaine, dans des fichiers à part (fiche-nombres.html,
   fiche-grandeurs.html, fiche-geometrie.html) que Stéphane peut modifier librement.
   Pendant un exercice, la fiche de sa partie s'ouvre d'abord.
   ------------------------------------------------------------ */
function showFiche(nom) {
  $('fiche-frame').src = `${nom}?v=${Date.now()}`;
  document.querySelectorAll('.fiche-tab').forEach((b) => b.classList.toggle('on', b.dataset.fiche === nom));
}
function openFiche() {
  const enJeu = currentGame && $('welcome-panel').classList.contains('hidden');
  const p = enJeu ? currentGame.partie : partieAccueil;
  showFiche(`fiche-${p || 'nombres'}.html`);
  $('fiche-modal').classList.remove('hidden');
}
document.querySelectorAll('.fiche-tab').forEach((b) => b.addEventListener('click', () => showFiche(b.dataset.fiche)));

/* ------------------------------------------------------------
   COMPTES (Firebase, le même service que Mnemart)
   Pourquoi le même : la connexion par e-mail fonctionne déjà pour Mnemart, il n'y a rien de nouveau
   à configurer. Les données de MNEMOMATHS sont rangées à part, dans
   users/{identifiant}/mnemomaths/profil : elles ne se mélangent pas aux scores de Mnemart.
   Le compte est créé par un adulte (son e-mail), pour un enfant : la fiche contient le prénom et le nom
   de l'enfant, et un ou deux adultes (lien, prénom, nom) dont les prénoms servent aux encouragements.
   Une copie de la fiche est gardée dans le navigateur, au cas où le service serait momentanément injoignable.
   ------------------------------------------------------------ */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCIc15-0fy_OziKdcOHAv-CYxOku9iFX94",
  authDomain: "quiz-art-7378d.firebaseapp.com",
  projectId: "quiz-art-7378d",
  storageBucket: "quiz-art-7378d.firebasestorage.app",
  messagingSenderId: "489975323244",
  appId: "1:489975323244:web:d7070100f3a0e63cec9649",
};
/* Lien de l'adulte avec l'enfant : « ton / ta » et accord de « fier / fière ». */
const LIENS = {
  papa: { label: 'Papa', ton: 'ton papa', f: false },
  maman: { label: 'Maman', ton: 'ta maman', f: true },
  papi: { label: 'Papi', ton: 'ton papi', f: false },
  mamie: { label: 'Mamie', ton: 'ta mamie', f: true },
  grandpere: { label: 'Grand-père', ton: 'ton grand-père', f: false },
  grandmere: { label: 'Grand-mère', ton: 'ta grand-mère', f: true },
  parrain: { label: 'Parrain', ton: 'ton parrain', f: false },
  marraine: { label: 'Marraine', ton: 'ta marraine', f: true },
  tonton: { label: 'Tonton', ton: 'ton tonton', f: false },
  tata: { label: 'Tata', ton: 'ta tata', f: true },
  oncle: { label: 'Oncle', ton: 'ton oncle', f: false },
  tante: { label: 'Tante', ton: 'ta tante', f: true },
  frere: { label: 'Frère', ton: 'ton frère', f: false },
  soeur: { label: 'Sœur', ton: 'ta sœur', f: true },
  cousin: { label: 'Cousin', ton: 'ton cousin', f: false },
  cousine: { label: 'Cousine', ton: 'ta cousine', f: true },
  ami: { label: 'Ami', ton: 'ton ami', f: false },
  amie: { label: 'Amie', ton: 'ton amie', f: true },
};
let auth = null, db = null, currentUser = null, playerProfile = null, accountMode = 'login';
const firebaseReady = typeof firebase !== 'undefined';
if (firebaseReady) {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    db = firebase.firestore();
    try { db.settings({ experimentalAutoDetectLongPolling: true }); } catch (e) {}
  } catch (e) { console.warn('Firebase', e); }
}

/* Champs de la fiche (servent à l'inscription ET à « Mon compte ») */
function lienOptions(sel) {
  return '<option value="">— lien —</option>' + Object.entries(LIENS).map(([k, l]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${l.label}</option>`).join('');
}
const esc = (t) => String(t || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/* v5 : la famille est une liste ouverte. Chaque proche a un lien, un prénom, un nom et, s'il le veut,
   une adresse e-mail : c'est à ces adresses que l'enfant peut envoyer ses scores. */
/* v7 : une photo par personne (le joueur et chacun de ses proches). La photo est réduite sur l'appareil
   (carré de 240 pixels) avant d'être rangée dans la fiche du compte : elle reste privée, visible seulement
   quand on est connecté à ce compte. */
function photoSlotHtml(photo) {
  return `<div class="photo-slot">
      <span class="photo-thumb">${photo ? `<img src="${photo}" alt="" />` : '<span class="photo-empty">🙂</span>'}</span>
      <input type="hidden" class="f-photo" value="${photo ? esc(photo) : ''}" />
      <label class="photo-pick secondary-button">📷 ${photo ? 'Changer la photo' : 'Ajouter une photo'}<input type="file" accept="image/*" class="f-photo-file" /></label>
      <button type="button" class="photo-del link-label${photo ? '' : ' hidden'}">Retirer</button>
    </div>`;
}
function resizePhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const T = 240, c = document.createElement('canvas'); c.width = T; c.height = T;
      const side = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, T, T);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')); };
    img.src = url;
  });
}
/* Boutons photo d'un formulaire (inscription ou Mon compte), branchés une fois sur le conteneur. */
function wirePhotos(container) {
  if (container.dataset.photosWired) return;
  container.dataset.photosWired = '1';
  container.addEventListener('change', async (e) => {
    const input = e.target.closest('.f-photo-file'); if (!input || !input.files[0]) return;
    const slot = input.closest('.photo-slot');
    try {
      const data = await resizePhoto(input.files[0]);
      slot.querySelector('.f-photo').value = data;
      slot.querySelector('.photo-thumb').innerHTML = `<img src="${data}" alt="" />`;
      slot.querySelector('.photo-pick').firstChild.textContent = '📷 Changer la photo';
      slot.querySelector('.photo-del').classList.remove('hidden');
    } catch (ex) { alert('Cette image ne peut pas être lue. Essayez une photo au format JPEG ou PNG.'); }
    input.value = '';
  });
  container.addEventListener('click', (e) => {
    const del = e.target.closest('.photo-del'); if (!del) return;
    const slot = del.closest('.photo-slot');
    slot.querySelector('.f-photo').value = '';
    slot.querySelector('.photo-thumb').innerHTML = '<span class="photo-empty">🙂</span>';
    slot.querySelector('.photo-pick').firstChild.textContent = '📷 Ajouter une photo';
    del.classList.add('hidden');
  });
}
function adulteRowHtml(a, n) {
  return `
    <fieldset class="account-fieldset adulte-row" data-adulte-row>
      <legend>${n === 1 ? 'Un parent ou un proche (facultatif)' : 'Un autre proche'}</legend>
      <button type="button" class="adulte-remove" title="Retirer ce proche" aria-label="Retirer ce proche">✕</button>
      ${photoSlotHtml(a?.photo)}
      <div class="account-row-3">
        <label>Lien<select class="f-lien">${lienOptions(a?.lien)}</select></label>
        <label>Prénom (facultatif)<input type="text" class="f-prenom" value="${esc(a?.prenom)}" autocomplete="off" /></label>
        <label>Nom<input type="text" class="f-nom" value="${esc(a?.nom)}" autocomplete="off" /></label>
      </div>
      <label class="f-email-label">E-mail (pour recevoir les résultats, facultatif)<input type="email" class="f-email" value="${esc(a?.email)}" autocomplete="off" /></label>
    </fieldset>`;
}
function profileFieldsHtml(prefix, p, withConsent) {
  const adultes = (p?.adultes && p.adultes.length) ? p.adultes : [null];
  return `
    <fieldset class="account-fieldset" id="${prefix}-enfant-box">
      <legend>Le joueur</legend>
      ${photoSlotHtml(p?.enfant?.photo)}
      <div class="account-row">
        <label>Prénom<input type="text" id="${prefix}-enfant-prenom" value="${esc(p?.enfant?.prenom)}" autocomplete="off" required /></label>
        <label>Nom<input type="text" id="${prefix}-enfant-nom" value="${esc(p?.enfant?.nom)}" autocomplete="off" /></label>
      </div>
    </fieldset>
    <div class="adultes-list" id="${prefix}-adultes">${adultes.map((a, i) => adulteRowHtml(a, i + 1)).join('')}</div>
    <button type="button" class="secondary-button add-adulte" id="${prefix}-add-adulte">+ Ajouter un proche (papi, mamie, tonton…)</button>
    <!-- v12 : deux options à cocher -->
    <label class="account-option"><input type="checkbox" id="${prefix}-opt-sorciers"${optSorciers(p) ? ' checked' : ''} />
      <span><b>Les sorciers encouragent le joueur</b> (option plutôt réservée aux enfants).<br>Après chaque réponse, un sorcier apparaît ; les prénoms servent à personnaliser ses encouragements (« Joseph, tu es un génie de la grammaire ! », « Ton papa Marc sera fier de toi ! »).</span></label>
    <label class="account-option"><input type="checkbox" id="${prefix}-opt-envoi"${optEnvoi(p) ? ' checked' : ''} />
      <span><b>Envoyer les résultats par e-mail</b>.<br>Les adresses e-mail des proches servent seulement à leur envoyer les scores et le bilan de progression.</span></label>
    ${withConsent ? `<label class="account-consent"><input type="checkbox" id="${prefix}-consent" required /><span>Je suis le parent ou l'adulte responsable de cet enfant, et je crée ce compte pour lui.</span></label>` : ''}`;
}
/* v12 : options du compte. Sans compte, ou pour une fiche plus ancienne, les deux sont actives. */
function optSorciers(p) { return p?.options?.sorciers !== false; }
function optEnvoi(p) { return p?.options?.envoi !== false; }
/* Boutons « + Ajouter un proche » et « ✕ » (au moins un proche reste toujours). */
function wireAdultes(prefix) {
  const list = $(`${prefix}-adultes`);
  /* v12 : sans l'option « Envoyer les résultats par e-mail », les cases e-mail des proches sont masquées. */
  const opt = $(`${prefix}-opt-envoi`);
  const syncMail = () => list.classList.toggle('no-envoi', !!opt && !opt.checked);
  opt?.addEventListener('change', syncMail); syncMail();
  const renumber = () => list.querySelectorAll('[data-adulte-row]').forEach((row, i) => {
    row.querySelector('legend').textContent = i === 0 ? 'Un parent ou un proche (facultatif)' : 'Un autre proche';
    row.querySelector('.adulte-remove').classList.toggle('hidden', list.children.length === 1);
  });
  $(`${prefix}-add-adulte`).addEventListener('click', () => {
    list.insertAdjacentHTML('beforeend', adulteRowHtml(null, 2));
    renumber();
    list.lastElementChild.querySelector('.f-lien').focus();
  });
  list.addEventListener('click', (e) => {
    const b = e.target.closest('.adulte-remove'); if (!b) return;
    if (list.children.length > 1) b.closest('[data-adulte-row]').remove();
    renumber();
  });
  renumber();
}
function readProfileFields(prefix) {
  const v = (id) => ($(`${prefix}-${id}`)?.value || '').trim();
  const adultes = [...$(`${prefix}-adultes`).querySelectorAll('[data-adulte-row]')].map((row) => ({
    lien: row.querySelector('.f-lien').value,
    prenom: row.querySelector('.f-prenom').value.trim(),
    nom: row.querySelector('.f-nom').value.trim(),
    email: row.querySelector('.f-email').value.trim(),
    photo: row.querySelector('.f-photo').value || '',
  })).filter((a) => a.prenom || a.lien || a.email);
  const photoEnfant = $(`${prefix}-enfant-box`)?.querySelector('.f-photo').value || '';
  return { enfant: { prenom: v('enfant-prenom'), nom: v('enfant-nom'), photo: photoEnfant }, adultes,
    options: { sorciers: !!$(`${prefix}-opt-sorciers`)?.checked, envoi: !!$(`${prefix}-opt-envoi`)?.checked } };
}
function checkProfile(p) {
  if (!p.enfant.prenom) return 'Indiquez le prénom du joueur.';
  /* v8 : les proches sont facultatifs, leur prénom aussi (« Ton papa sera fier de toi » marche sans prénom). */
  if (p.adultes.some((a) => a.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email))) return 'Une des adresses e-mail n\'est pas valide.';
  return '';
}

const localKey = (uid) => `mnemomaths-profil-${uid}`;
async function loadProfile(uid) {
  let p = null;
  try { const snap = await db.collection('users').doc(uid).collection('mnemomaths').doc('profil').get(); if (snap.exists) p = snap.data(); } catch (e) { console.warn('Lecture de la fiche', e); }
  if (!p) { try { p = JSON.parse(localStorage.getItem(localKey(uid)) || 'null'); } catch (e) {} }
  return p;
}
async function saveProfile(uid, p) {
  try { localStorage.setItem(localKey(uid), JSON.stringify(p)); } catch (e) {}
  await db.collection('users').doc(uid).collection('mnemomaths').doc('profil')
    .set({ ...p, misAJour: firebase.firestore.FieldValue.serverTimestamp() });
}

function updateAccountBar() {
  const slot = $('home-account-slot'), label = $('home-account-label'), mail = $('home-account-email'), sw = $('home-account-switch');
  if (!auth) {
    label.textContent = 'Comptes indisponibles pour l\'instant';
    slot.classList.add('is-disabled'); sw.classList.add('hidden'); mail.classList.add('hidden');
    return;
  }
  slot.classList.remove('is-disabled'); sw.classList.remove('hidden');
  if (currentUser) {
    label.textContent = playerProfile?.enfant?.prenom ? `Compte de ${playerProfile.enfant.prenom}` : 'Mon compte';
    const ph = playerProfile?.enfant?.photo;
    $('home-account-photo').innerHTML = ph ? `<img src="${ph}" alt="" />` : '';
    $('home-account-photo').classList.toggle('hidden', !ph);
    mail.textContent = currentUser.email; mail.classList.remove('hidden');
    sw.classList.add('is-connected'); sw.setAttribute('aria-checked', 'true'); sw.title = 'Se déconnecter';
  } else {
    label.textContent = 'Se connecter / Créer un compte';
    $('home-account-photo').classList.add('hidden');
    mail.classList.add('hidden');
    sw.classList.remove('is-connected'); sw.setAttribute('aria-checked', 'false'); sw.title = 'Se connecter';
  }
}

function setAccountMode(mode) {
  accountMode = mode;
  $('account-modal-title').textContent = mode === 'login' ? 'Se connecter' : 'Créer un compte';
  $('account-submit-button').textContent = mode === 'login' ? 'Se connecter' : 'Créer le compte';
  $('account-toggle-mode').textContent = mode === 'login' ? 'Pas encore de compte ? Créez-en un' : 'Déjà un compte ? Connectez-vous';
  $('account-forgot-row').classList.toggle('hidden', mode !== 'login');
  $('account-password').setAttribute('autocomplete', mode === 'login' ? 'current-password' : 'new-password');
  const reg = $('account-register-fields');
  if (mode === 'register') { reg.innerHTML = profileFieldsHtml('reg', null, true); reg.classList.remove('hidden'); reg.style.display = 'grid'; reg.style.gap = '12px'; wireAdultes('reg'); wirePhotos(reg); }
  else { reg.innerHTML = ''; reg.classList.add('hidden'); }
  $('account-error').classList.add('hidden'); $('account-notice').classList.add('hidden');
}
function openAccount() {
  if (!auth) return;
  if (currentUser) openProfile(false);
  else { setAccountMode('login'); $('account-modal').classList.remove('hidden'); }
}
/* « Mon compte » : la fiche de l'enfant, modifiable. first = true juste après une connexion sans fiche
   (par exemple un parent qui avait déjà un compte Mnemart avec la même adresse). */
function openProfile(first) {
  $('profile-modal-title').textContent = first ? 'La fiche du joueur' : 'Mon compte';
  $('profile-intro').textContent = first ? 'Votre compte est prêt. Complétez la fiche du joueur pour que les sorciers puissent l\'encourager par son prénom.' : '';
  $('profile-intro').classList.toggle('hidden', !first);
  $('profile-fields').innerHTML = profileFieldsHtml('pro', playerProfile, false);
  $('profile-fields').style.display = 'grid'; $('profile-fields').style.gap = '12px';
  wireAdultes('pro');
  wirePhotos($('profile-fields'));
  renderScoreHistory();
  $('profile-email-row').textContent = currentUser ? `Connecté avec l'adresse ${currentUser.email}` : '';
  $('profile-error').classList.add('hidden'); $('profile-notice').classList.add('hidden');
  $('profile-modal').classList.remove('hidden');
}

/* le nom de l'exercice, tel qu'il est enregistré avec le score */
function scoreType(jeu) { return jeu || 'Exercice'; }
/* Mes derniers scores, dans la fenêtre Mon compte */
async function renderScoreHistory() {
  const box = $('profile-scores');
  if (!box) return;
  box.innerHTML = '';
  const scores = await loadScores();
  if (!scores.length) { box.innerHTML = '<p class="send-hint">Pas encore de score enregistré.</p>'; $('profile-send').innerHTML = ''; return; }
  /* v12 : bilan de progression, puis (si l'option est cochée) deux envois bien distincts :
     l'envoi des scores (la liste des dernières parties) et l'envoi du bilan de progression (le résumé). */
  const avecMail = (playerProfile?.adultes || []).filter((a) => a.email);
  let h = `<div class="send-block"><p class="send-title">🏅 Bilan de progression</p><button type="button" class="primary-button bilan-button" id="open-bilan">Voir mon bilan de progression</button></div>`;
  if (optEnvoi(playerProfile)) {
    h += !avecMail.length ? '<p class="send-hint">Pour envoyer tes résultats, ajoute l\'adresse e-mail d\'un proche dans ta fiche (ci-dessus).</p>' : `
      <div class="send-block"><p class="send-title">✉️ Envoi par e-mail à :</p>
        <p class="send-hint send-howto">Le message s'ouvre déjà écrit, avec les adresses : il ne reste qu'à cliquer sur « Envoyer ».</p>
        <div class="send-list" id="psend-list">${avecMail.map((a) => `<label class="send-person"><input type="checkbox" value="${esc(a.email)}" checked />${a.photo ? `<img class="send-photo" src="${a.photo}" alt="" />` : ''}<span>${esc(LIENS[a.lien]?.label || a.email)}${a.prenom ? ' ' + esc(a.prenom) : ''}</span></label>`).join('')}</div>
        <div class="send-row"><span>Envoi des scores</span><button type="button" class="primary-button" id="pscore-gmail">✉️ Gmail</button><button type="button" class="secondary-button" id="pscore-mail">Autre messagerie</button></div>
        <div class="send-row"><span>Envoi du bilan de progression</span><button type="button" class="primary-button" id="pbilan-gmail">✉️ Gmail</button><button type="button" class="secondary-button" id="pbilan-mail">Autre messagerie</button></div>
      </div>`;
  }
  $('profile-send').innerHTML = h;
  $('open-bilan').addEventListener('click', openBilan);
  if (optEnvoi(playerProfile) && avecMail.length) {
    const E = playerProfile?.enfant?.prenom;
    wireSendButtons('psend-list', 'pscore', () => `${E ? E + ' : ' : ''}mes scores sur MNEMOMATHS`, async () => scoresMessage(await loadScores()));
    wireSendButtons('psend-list', 'pbilan', bilanSubject, async () => bilanMessage(await loadScores()));
  }
  box.innerHTML = '<p class="send-title">Derniers scores</p><ul class="score-list">' + scores.slice(0, 10).map((r) => {
    const d = new Date(r.date);
    const quand = isNaN(d) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + ', ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return `<li><span>${esc(scoreType(r.jeu))}</span><span>${quand}</span><strong>${fmtPts(r.score)} / ${r.total}</strong><button type="button" class="score-del" data-id="${esc(r._id)}" title="Effacer ce score" aria-label="Effacer ce score">✕</button></li>`;
  }).join('') + '</ul>';
  /* v8 : chaque score peut être effacé (après confirmation). */
  box.querySelectorAll('.score-del').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('Effacer ce score ?')) return;
    try { await db.collection('users').doc(currentUser.uid).collection('mnemomaths').doc(b.dataset.id).delete(); }
    catch (e) { alert('Le score n\'a pas pu être effacé. Réessayez.'); return; }
    renderScoreHistory();
  }));
}

function bilanEmblem() {
  const leaves = [];
  for (let i = 0; i < 10; i++) {
    const th = 105 + i * (150 / 9), rad = th * Math.PI / 180;
    const x = 60 + 45 * Math.cos(rad), y = 60 + 45 * Math.sin(rad), rot = th + (i % 2 ? 28 : -28);
    leaves.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3" ry="7.5" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="url(#rpg)"/>`);
    leaves.push(`<ellipse cx="${(120 - x).toFixed(1)}" cy="${y.toFixed(1)}" rx="3" ry="7.5" transform="rotate(${(-rot).toFixed(0)} ${(120 - x).toFixed(1)} ${y.toFixed(1)})" fill="url(#rpg)"/>`);
  }
  return `<svg class="rp-emblem" viewBox="0 0 120 120" aria-hidden="true">
    <defs><linearGradient id="rpg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e6c978"/><stop offset=".5" stop-color="#b08d4c"/><stop offset="1" stop-color="#7a5c35"/></linearGradient></defs>
    ${leaves.join('')}
    <circle cx="60" cy="60" r="31" fill="#fffaf0" stroke="url(#rpg)" stroke-width="3"/>
    <circle cx="60" cy="60" r="26" fill="none" stroke="#c9a85c" stroke-width=".8"/>
    <text x="60" y="70" text-anchor="middle" font-family="Georgia,serif" font-size="28" font-weight="700" fill="#7a5c35">M</text>
  </svg>`;
}
function bilanCorners() {
  const c = `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M2 58 V2 H58" fill="none" stroke="#b08d4c" stroke-width="2.2"/><path d="M9 58 V9 H58" fill="none" stroke="#d9c08a" stroke-width="1"/><path d="M2 2 C20 6 28 14 30 30 C14 28 6 20 2 2 Z" fill="#b08d4c" opacity=".85"/><circle cx="36" cy="36" r="2.4" fill="#b08d4c"/></svg>`;
  return ['tl', 'tr', 'bl', 'br'].map((p) => `<span class="rp-corner rp-${p}">${c}</span>`).join('');
}
function bilanSeal() {
  return `<svg class="rp-seal" viewBox="0 0 80 80" aria-hidden="true">
    <defs><radialGradient id="rps" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#f0d98f"/><stop offset=".6" stop-color="#b08d4c"/><stop offset="1" stop-color="#7a5c35"/></radialGradient></defs>
    <path d="M26 56 L18 78 L30 72 L36 78 L40 58 Z" fill="#8a5449"/><path d="M54 56 L62 78 L50 72 L44 78 L40 58 Z" fill="#a8665a"/>
    <path d="M40 4 l5 5 7-2 3 7 7 2-1 7 6 4-4 6 3 7-7 3-1 7-7-1-5 6-5-5-7 1-1-7-7-3 3-7-4-6 6-4-1-7 7-2 3-7 7 2z" fill="url(#rps)" transform="translate(0,2)"/>
    <circle cx="40" cy="38" r="19" fill="none" stroke="#fff3cf" stroke-width="1.2" opacity=".8"/>
    <text x="40" y="46" text-anchor="middle" font-family="Georgia,serif" font-size="24" font-weight="700" fill="#fff3cf">M</text>
  </svg>`;
}
/* Analyse des scores : réussite par niveau (et progrès), par nature, confusions les plus fréquentes. */

/* ------------------------------------------------------------
   BILAN DE PROGRESSION (le « diplôme », comme dans MNEMOGRAM) : réussite par exercice (et progrès),
   notions bien connues et notions à revoir.
   ------------------------------------------------------------ */
const pctOf = (r) => (r.total ? (r.score / r.total) * 100 : 0);
const avg = (l) => (l.length ? l.reduce((t, r) => t + pctOf(r), 0) / l.length : 0);
const fmtDate = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
function analyseScores(scores) {
  const list = scores.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const dates = list.map((r) => new Date(r.date)).filter((d) => !isNaN(d));
  const parJeu = {};
  list.forEach((r) => { (parJeu[r.jeu] || (parJeu[r.jeu] = [])).push(r); });
  const exercices = Object.entries(parJeu).map(([jeu, l]) => {
    const res = { jeu, count: l.length, avg: Math.round(avg(l)) };
    if (l.length >= 4) { const k = Math.min(5, Math.floor(l.length / 2)); res.early = Math.round(avg(l.slice(0, k))); res.recent = Math.round(avg(l.slice(-k))); res.diff = res.recent - res.early; }
    return res;
  });
  const nat = {};
  list.forEach((r) => Object.entries(r.parNotion || {}).forEach(([k, v]) => { const t = nat[k] || (nat[k] = { c: 0, p: 0 }); t.c += v.c || 0; t.p += v.p || 0; }));
  const parNotion = Object.entries(nat).filter(([, v]) => v.p >= 2).map(([nom, v]) => ({ nom, pct: Math.round((v.c / v.p) * 100), p: v.p })).sort((a, b) => b.pct - a.pct);
  return {
    list, exercices, parNotion, first: dates[0], last: dates[dates.length - 1],
    jours: new Set(dates.map((d) => d.toDateString())).size,
    questions: list.reduce((t, r) => t + (r.total || 0), 0),
    bonnes: list.reduce((t, r) => t + (r.score || 0), 0),
  };
}
function buildBilan(scores) {
  const A = analyseScores(scores);
  const E = playerProfile?.enfant || {};
  const nom = [E.prenom, E.nom].filter(Boolean).join(' ');
  const taux = A.questions ? Math.round((A.bonnes / A.questions) * 100) : 0;
  const bar = (pct) => `<span class="rp-bar"><span style="width:${Math.max(2, Math.min(100, pct))}%"></span></span>`;
  const line = (label, pct) => `<div class="rp-line"><span class="rp-line-label">${esc(label)}</span>${bar(pct)}<span class="rp-line-pct">${pct} %</span></div>`;
  const cards = A.exercices.map((r) => `
    <div class="rp-card">
      <div class="rp-card-title">${esc(r.jeu)}</div>
      <div class="rp-card-big">${r.avg} %</div>
      <div class="rp-card-sub">moyenne sur ${r.count} partie${r.count > 1 ? 's' : ''}</div>
      ${r.diff !== undefined ? `<div class="rp-card-trend ${r.diff > 0 ? 'up' : r.diff < 0 ? 'down' : ''}">${r.diff > 0 ? '▲ +' + r.diff : r.diff < 0 ? '▼ ' + r.diff : '= stable'} pts<br><span>${r.early} % au début → ${r.recent} % récemment</span></div>` : ''}
    </div>`).join('');
  const reussies = A.parNotion.filter((x) => x.pct >= 75), aRevoir = A.parNotion.filter((x) => x.pct < 75).sort((a, b) => a.pct - b.pct);
  const defis = aRevoir.slice(0, 3).map((x) => `Revoir « ${x.nom} » (${x.pct} %) : relis la fiche 📖, puis rejoue.`);
  if (!defis.length) defis.push('Essayer un bilan, ou passer à l\'onglet du niveau suivant !');
  const intro = taux >= 80 ? `Bravo ! Tu as trouvé ${taux} % des réponses du premier coup : tu connais très bien tes leçons de mathématiques.`
    : taux >= 60 ? `Tu as trouvé ${taux} % des réponses du premier coup : c'est un beau travail. Continue, les calculs deviennent de plus en plus faciles.`
    : `Tu as trouvé ${taux} % des réponses du premier coup. Chaque partie t'aide à mieux retenir : l'important est de continuer.`;
  const notionsHtml = A.parNotion.length ? `<div class="rp-cols">
      <div class="rp-col"><h3>Ce que tu connais bien</h3>${reussies.length ? reussies.slice(0, 8).map((x) => line(x.nom, x.pct)).join('') : '<p class="rp-empty">Bientôt !</p>'}</div>
      <div class="rp-col"><h3>Ce qu'il faut revoir</h3>${aRevoir.length ? aRevoir.slice(0, 8).map((x) => line(x.nom, x.pct)).join('') : '<p class="rp-empty">Rien : bravo !</p>'}</div>
    </div>` : '';
  return `${bilanCorners()}
    <div class="rp-frame"></div>
    <div class="rp-inner">
      <div class="rp-header">
        ${bilanEmblem()}
        <div class="rp-eyebrow">MNEMOMATHS</div>
        <h2>Bilan de progression</h2>
        <div class="rp-decor"><span></span><i>❖</i><span></span></div>
        <div class="rp-award">${nom ? 'est décerné avec félicitations à' : 'est décerné avec félicitations'}</div>
        ${nom ? `<div class="rp-name">${esc(nom)}</div>` : ''}
        ${A.first ? `<div class="rp-period">${fmtDate(A.first) === fmtDate(A.last) ? 'le ' + esc(fmtDate(A.first)) : `du ${esc(fmtDate(A.first))} au ${esc(fmtDate(A.last))}`}</div>` : ''}
      </div>
      <p class="rp-intro">${esc(intro)}</p>
      <div class="rp-figures">
        <div><strong>${A.list.length}</strong><span>partie${A.list.length > 1 ? 's' : ''}</span></div>
        <div><strong>${A.jours}</strong><span>jour${A.jours > 1 ? 's' : ''} de pratique</span></div>
        <div><strong>${A.questions}</strong><span>questions</span></div>
        <div><strong>${taux} %</strong><span>trouvées du premier coup</span></div>
      </div>
      <div class="rp-cards">${cards}</div>
      ${notionsHtml}
      <section class="rp-section rp-next"><h3>Ton prochain défi</h3><ul class="rp-list">${defis.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>
      <p class="rp-closing">${E.prenom ? esc(E.prenom) + ', continue' : 'Continue'} à compter, à mesurer et à observer : chaque partie rend ta mémoire plus forte.</p>
      <div class="rp-bottom">
        <span class="rp-foot">Établi le ${esc(fmtDate(new Date()))}<br>d'après les scores de ton compte</span>
        ${bilanSeal()}
        <span class="rp-foot rp-sign">Les mathématiques à travers la mémoire<br><strong>MNEMOMATHS</strong></span>
      </div>
    </div>`;
}
function bilanMessage(scores) {
  const A = analyseScores(scores);
  const E = playerProfile?.enfant?.prenom || '';
  const taux = A.questions ? Math.round((A.bonnes / A.questions) * 100) : 0;
  const l = [`Mon bilan sur MNEMOMATHS : ${A.list.length} partie${A.list.length > 1 ? 's' : ''}, ${taux} % des réponses trouvées du premier coup.`, ''];
  A.exercices.forEach((r) => l.push(`- ${r.jeu} : ${r.avg} % en moyenne sur ${r.count} partie${r.count > 1 ? 's' : ''}${r.diff !== undefined ? ` (${r.early} % au début, ${r.recent} % récemment)` : ''}.`));
  const aRevoir = A.parNotion.filter((x) => x.pct < 75).sort((a, b) => a.pct - b.pct).slice(0, 4);
  if (aRevoir.length) { l.push('', 'À revoir :'); aRevoir.forEach((x) => l.push(`- ${x.nom} : ${x.pct} %`)); }
  l.push('', 'Mes dernières parties :');
  A.list.slice(-10).reverse().forEach((r) => { const d = new Date(r.date); l.push(`- ${isNaN(d) ? '' : d.toLocaleDateString('fr-FR') + ' : '}${scoreType(r.jeu)}, ${fmtPts(r.score)} / ${r.total}`); });
  l.push('', E, SITE_URL);
  return l.join('\n');
}
function sendBoxHtml(idPrefix, intro) {
  const avecMail = (playerProfile?.adultes || []).filter((a) => a.email);
  if (!avecMail.length) return '<p class="send-hint">Pour envoyer tes scores, ajoute l\'adresse e-mail d\'un proche dans ta fiche (ci-dessus).</p>';
  return `<p class="send-title">${intro}</p>
    <p class="send-hint send-howto">Le message s'ouvre déjà écrit, avec les adresses : il ne reste qu'à cliquer sur « Envoyer ».</p>
    <div class="send-list" id="${idPrefix}-list">${avecMail.map((a) => `<label class="send-person"><input type="checkbox" value="${esc(a.email)}" checked />${a.photo ? `<img class="send-photo" src="${a.photo}" alt="" />` : ''}<span>${esc(LIENS[a.lien]?.label || '')} ${esc(a.prenom || '')}</span></label>`).join('')}</div>
    <div class="send-buttons">
      <button type="button" class="primary-button" id="${idPrefix}-gmail">✉️ Envoyer avec Gmail</button>
      <button type="button" class="secondary-button" id="${idPrefix}-mail">Autre messagerie</button>
    </div>`;
}
function scoresMessage(scores) {
  const E = playerProfile?.enfant?.prenom || '';
  const list = scores.slice(0, 10);
  const l = ['Mes derniers scores sur MNEMOMATHS :', ''];
  list.forEach((r) => { const d = new Date(r.date); l.push(`- ${isNaN(d) ? '' : d.toLocaleDateString('fr-FR') + ' : '}${scoreType(r.jeu)}, ${r.score} bonne${r.score > 1 ? 's' : ''} réponse${r.score > 1 ? 's' : ''} sur ${r.total}`); });
  const last = list[0];
  if (last && (last.erreurs || []).length) { l.push('', 'Mes erreurs à la dernière partie :'); last.erreurs.forEach((e) => l.push(ligneErreur(e))); }
  l.push('', E, SITE_URL);
  return l.join('\n');
}
function ouvreMail(to, sujet, corps, gmail) {
  if (!to.length) return;
  if (gmail) window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to.join(','))}&su=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`, '_blank', 'noopener');
  else location.href = `mailto:${to.join(',')}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
}
function wireSendButtons(listId, idPrefix, getSubject, getBody) {
  const to = () => [...document.querySelectorAll(`#${listId} input:checked`)].map((c) => c.value);
  $(`${idPrefix}-gmail`)?.addEventListener('click', async () => ouvreMail(to(), getSubject(), await getBody(), true));
  $(`${idPrefix}-mail`)?.addEventListener('click', async () => ouvreMail(to(), getSubject(), await getBody(), false));
}
const wireSendBox = (idPrefix, getSubject, getBody) => wireSendButtons(`${idPrefix}-list`, idPrefix, getSubject, getBody);
const bilanSubject = () => `${playerProfile?.enfant?.prenom ? playerProfile.enfant.prenom + ' : ' : ''}mon bilan sur MNEMOMATHS`;
async function openBilan() {
  const overlay = $('report-overlay'), sheet = $('report-sheet');
  sheet.innerHTML = '<p class="rp-loading">Préparation de ton bilan…</p>';
  $('report-send').innerHTML = '';
  overlay.classList.remove('hidden');
  const scores = await loadScores();
  if (!scores.length) { sheet.innerHTML = '<p class="rp-loading">Pas encore de score enregistré : termine une partie, et ton bilan apparaîtra ici.</p>'; return; }
  sheet.innerHTML = buildBilan(scores);
  if (optEnvoi(playerProfile)) {
    $('report-send').innerHTML = sendBoxHtml('rsend', 'Envoi du bilan de progression à :');
    wireSendBox('rsend', bilanSubject, async () => bilanMessage(scores));
  }
}

/* ------------------------------------------------------------
   v13 : « MES DONNÉES » — chacun efface lui-même ses scores, ses données MNEMOMATHS, ou son compte entier,
   sans avoir à écrire au contact.
   Le compte est commun avec MNEMOGRAM et MNEMART (même service Firebase) : le supprimer efface aussi leurs données
   (scores et atelier) et l'accès aux deux sites. Par sécurité, Firebase demande alors le mot de passe.
   ------------------------------------------------------------ */
async function deleteCollection(name, filtre) {
  const snap = await db.collection('users').doc(currentUser.uid).collection(name).get();
  const docs = filtre ? snap.docs.filter((d) => filtre(d.data(), d.id)) : snap.docs;
  for (const d of docs) await d.ref.delete();
  return docs.length;
}
function setDataMsg(kind, t) { const el = $('data-msg'); el.className = kind === 'ok' ? 'account-notice' : 'account-error'; el.textContent = t; el.classList.remove('hidden'); }
function wireMesDonnees() {
  $('data-del-scores').addEventListener('click', async () => {
    if (!currentUser || !confirm('Effacer tous les scores MNEMOMATHS de ce compte ? Le bilan de progression repartira de zéro.')) return;
    try { const n = await deleteCollection('mnemomaths', (d) => d.type === 'score'); setDataMsg('ok', `${n} score${n > 1 ? 's' : ''} effacé${n > 1 ? 's' : ''}.`); renderScoreHistory(); }
    catch (e) { setDataMsg('err', 'Les scores n\'ont pas pu être effacés. Réessayez.'); }
  });
  $('data-del-mnemomaths').addEventListener('click', async () => {
    if (!currentUser || !confirm('Effacer toutes vos données MNEMOMATHS : la fiche du joueur, les photos, les proches et tous les scores ?\n\nLe compte lui-même est gardé (vous pourrez toujours vous connecter, ici, sur MNEMOGRAM et sur MNEMART).')) return;
    try {
      await deleteCollection('mnemomaths');
      try { localStorage.removeItem(localKey(currentUser.uid)); } catch (e) {}
      playerProfile = null; updateAccountBar();
      $('profile-modal').classList.add('hidden');
      openProfile(true);
    } catch (e) { setDataMsg('err', 'Les données n\'ont pas pu être effacées. Réessayez.'); }
  });
  $('data-del-account').addEventListener('click', () => { $('data-del-account-box').classList.toggle('hidden'); $('data-password').focus(); });
  $('data-del-account-confirm').addEventListener('click', async () => {
    const pw = $('data-password').value;
    if (!pw) { setDataMsg('err', 'Écrivez votre mot de passe pour confirmer.'); return; }
    if (!confirm('Dernière vérification : supprimer définitivement ce compte, pour MNEMOMATHS, MNEMOGRAM ET MNEMART ? Cette action ne peut pas être annulée.')) return;
    try {
      const cred = firebase.auth.EmailAuthProvider.credential(currentUser.email, pw);
      await currentUser.reauthenticateWithCredential(cred);
      for (const c of ['mnemomaths', 'mnemogram', 'scores', 'atelier']) { try { await deleteCollection(c); } catch (e) { console.warn('Effacement', c, e); } }
      try { localStorage.removeItem(localKey(currentUser.uid)); } catch (e) {}
      await currentUser.delete();
      $('profile-modal').classList.add('hidden');
      alert('Votre compte a été supprimé. Merci d\'avoir joué avec MNEMOMATHS !');
    } catch (e) {
      setDataMsg('err', e?.code === 'auth/wrong-password' || e?.code === 'auth/invalid-credential' ? 'Mot de passe incorrect : le compte n\'a pas été supprimé.' : 'Le compte n\'a pas pu être supprimé. Réessayez.');
    }
  });
}

function authErrorMessage(error) {
  const map = {
    'auth/email-already-in-use': 'Un compte existe déjà avec cette adresse e-mail (peut-être un compte Mnemart : c\'est le même). Connectez-vous avec, puis complétez la fiche du joueur.',
    'auth/invalid-email': 'Adresse e-mail invalide.',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/user-not-found': 'Aucun compte ne correspond à cette adresse e-mail.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
    'auth/operation-not-supported-in-this-environment': 'Les comptes ne fonctionnent que sur le site en ligne (pas en ouvrant le fichier directement sur l\'ordinateur).',
    'auth/network-request-failed': 'Pas de connexion à Internet. Réessayez.',
  };
  return map[error?.code] || 'Une erreur est survenue. Réessayez.';
}

function wireAccount() {
  $('home-account-slot').addEventListener('click', openAccount);
  $('home-account-slot').addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAccount(); } });
  $('global-account-button').addEventListener('click', openAccount);
  $('home-account-switch').addEventListener('click', (e) => {
    e.stopPropagation();
    if (!auth) return;
    if (currentUser) auth.signOut(); else openAccount();
  });
  document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => $(b.dataset.close).classList.add('hidden')));
  $('account-toggle-mode').addEventListener('click', () => setAccountMode(accountMode === 'login' ? 'register' : 'login'));
  $('account-forgot-button').addEventListener('click', async () => {
    const email = $('account-email').value.trim();
    const err = $('account-error'), ok = $('account-notice');
    err.classList.add('hidden'); ok.classList.add('hidden');
    if (!email) { err.textContent = 'Écrivez d\'abord votre adresse e-mail ci-dessus, puis recliquez sur « Mot de passe oublié ? ».'; err.classList.remove('hidden'); return; }
    try { await auth.sendPasswordResetEmail(email); ok.textContent = `Un e-mail de réinitialisation a été envoyé à ${email} (pensez à regarder dans les spams).`; ok.classList.remove('hidden'); }
    catch (e) { err.textContent = authErrorMessage(e); err.classList.remove('hidden'); }
  });
  $('account-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('account-error');
    err.classList.add('hidden');
    const email = $('account-email').value.trim(), password = $('account-password').value;
    try {
      if (accountMode === 'login') {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        const p = readProfileFields('reg');
        const pb = checkProfile(p); if (pb) { err.textContent = pb; err.classList.remove('hidden'); return; }
        pendingProfile = p;   /* enregistrée dès que la connexion est établie (voir onAuthStateChanged) */
        await auth.createUserWithEmailAndPassword(email, password);
      }
      $('account-modal').classList.add('hidden');
      $('account-form').reset();
    } catch (ex) { pendingProfile = null; err.textContent = authErrorMessage(ex); err.classList.remove('hidden'); }
  });
  $('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const err = $('profile-error'), ok = $('profile-notice');
    err.classList.add('hidden'); ok.classList.add('hidden');
    const p = readProfileFields('pro');
    const pb = checkProfile(p); if (pb) { err.textContent = pb; err.classList.remove('hidden'); return; }
    playerProfile = p; updateAccountBar();
    try { await saveProfile(currentUser.uid, p); ok.textContent = 'Fiche enregistrée.'; ok.classList.remove('hidden'); setTimeout(() => $('profile-modal').classList.add('hidden'), 900); }
    catch (ex) { console.warn(ex); ok.textContent = 'Fiche gardée sur cet appareil (l\'enregistrement en ligne a échoué, il sera retenté à la prochaine modification).'; ok.classList.remove('hidden'); }
  });
  $('profile-logout-button').addEventListener('click', () => { $('profile-modal').classList.add('hidden'); auth.signOut(); });
  wireMesDonnees();
  auth.onAuthStateChanged(async (user) => {
    currentUser = user;
    playerProfile = null;
    if (user) {
      if (pendingProfile) {
        playerProfile = pendingProfile; pendingProfile = null;
        try { await saveProfile(user.uid, playerProfile); } catch (ex) { console.warn('Enregistrement de la fiche', ex); }
      } else {
        playerProfile = await loadProfile(user.uid);
        if (!playerProfile) openProfile(true);
      }
    }
    updateAccountBar();
  });
}
let pendingProfile = null;

/* ------------------------------------------------------------
   DÉMARRAGE
   ------------------------------------------------------------ */
$('global-version-badge').textContent = APP_VERSION;
initMosaic();
dessinePortail();
$('nat-start-button').addEventListener('click', startGame);
$('nat-next-button').addEventListener('click', nextQuestion);
/* Entrée : passer à la question suivante quand la correction est affichée */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && game.repondu && !$('nat-correction').classList.contains('hidden') && !$('natures-panel').classList.contains('hidden') && document.activeElement?.id !== 'mm-input') { e.preventDefault(); nextQuestion(); }
});
/* le bouton de la voix lit la question (avec ses nombres et ses signes dits en mots) */
$('nat-listen-button').addEventListener('click', () => {
  const q = game.questions[game.index]; if (!q) return;
  const prev = volumeLevel; if (!volumeLevel) volumeLevel = 3;
  speak(voixMaths(q.voix || q.enonce), 'femme', 'phrase');
  volumeLevel = prev;
});
$('results-replay').addEventListener('click', startGame);
$('results-home').addEventListener('click', () => { showPanel('welcome'); montrePartie(currentGame?.partie || ''); });
/* la flèche ← du bandeau revient à la page précédente : elle ferme d'abord une fenêtre ouverte ;
   sinon partie en cours → écran « Démarrer le jeu », écran « Démarrer » → page de la partie, partie → accueil. */
function goBack() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  if (!$('report-overlay').classList.contains('hidden')) { $('report-overlay').classList.add('hidden'); return; }
  if (!$('ambiance-picker').classList.contains('hidden')) { $('ambiance-picker').classList.add('hidden'); return; }
  const ouvertes = [...document.querySelectorAll('.modal-backdrop:not(.hidden)')];
  if (ouvertes.length) { ouvertes[ouvertes.length - 1].classList.add('hidden'); return; }
  if (!$('natures-panel').classList.contains('hidden') && $('nat-ready-screen').classList.contains('hidden')) { openGame(currentGame); return; }
  if (!$('welcome-panel').classList.contains('hidden') && partieAccueil) { montrePartie(''); return; }
  showPanel('welcome');
  if (currentGame && !partieAccueil) montrePartie(currentGame.partie || '');
}
$('global-back-button').addEventListener('click', goBack);
function majHauteurBandeau() { const t = document.querySelector('.topbar-banner'); if (t) document.documentElement.style.setProperty('--topbar-h', `${t.offsetHeight}px`); }
window.addEventListener('resize', majHauteurBandeau); majHauteurBandeau();
$('global-home-button').addEventListener('click', () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); showPanel('welcome'); montrePartie(''); });
$('global-fullscreen-button').addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen?.(); else document.documentElement.requestFullscreen?.(); });
$('global-fiche-button').addEventListener('click', openFiche);
$('report-close').addEventListener('click', () => $('report-overlay').classList.add('hidden'));
$('open-mentions-legales').addEventListener('click', () => $('mentions-modal').classList.remove('hidden'));
$('open-contact').addEventListener('click', () => $('contact-modal').classList.remove('hidden'));
$('global-info-button').addEventListener('click', () => $('info-modal').classList.remove('hidden'));
$('global-contact-button').addEventListener('click', () => $('contact-modal').classList.remove('hidden'));
$('global-quit-button').addEventListener('click', () => {
  if (!confirm(currentUser ? 'Quitter la session ? La partie en cours s\'arrête et le compte se déconnecte.' : 'Quitter la session ? La partie en cours s\'arrête.')) return;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  game.fini = true;
  if (auth && currentUser) auth.signOut();
  showPanel('welcome'); montrePartie('');
});
/* les ambiances de Mnemart (les couleurs du site), gardées sur l'appareil */
function applyAmbiance(v) { if (v) document.body.setAttribute('data-ambiance', v); else document.body.removeAttribute('data-ambiance'); }
let ambiance = ''; try { ambiance = localStorage.getItem('mnemomaths-ambiance') || ''; } catch (e) {}
applyAmbiance(ambiance);
$('global-ambiance-button').addEventListener('click', (e) => {
  e.stopPropagation();
  const p = $('ambiance-picker');
  if (p.classList.contains('hidden')) { const r = document.querySelector(`input[name="ambiance"][value="${ambiance}"]`); if (r) r.checked = true; }
  p.classList.toggle('hidden');
});
document.querySelectorAll('input[name="ambiance"]').forEach((r) => r.addEventListener('change', () => {
  if (!r.checked) return;
  ambiance = r.value; applyAmbiance(ambiance);
  try { localStorage.setItem('mnemomaths-ambiance', ambiance); } catch (e) {}
}));
document.addEventListener('click', (e) => { const p = $('ambiance-picker'); if (!p.classList.contains('hidden') && !p.contains(e.target) && e.target.id !== 'global-ambiance-button') p.classList.add('hidden'); });
['mentions-modal', 'contact-modal', 'info-modal'].forEach((id) => {
  $(id).addEventListener('click', (e) => { if (e.target.id === id || e.target.closest('[data-close]')) $(id).classList.add('hidden'); });
});
$('report-print').addEventListener('click', () => window.print());
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('report-overlay').classList.add('hidden'); });
$('fiche-close').addEventListener('click', () => $('fiche-modal').classList.add('hidden'));
$('fiche-modal').addEventListener('click', (e) => { if (e.target.id === 'fiche-modal') $('fiche-modal').classList.add('hidden'); });
if (auth) wireAccount();
updateAccountBar();
showPanel('welcome');
