/* ============================================================
   MNEMOMATHS — programme de l'application
   Les mathématiques à travers la mémoire, du CE1 à la 3e.
   Même ossature que MNEMOGRAM (bandeau, ambiances, comptes, scores, bilan),
   mais les exercices sont des questions de mathématiques fabriquées à chaque partie :
   on ne rejoue jamais deux fois exactement la même série.
   ============================================================ */
'use strict';

/* Numéro de version affiché à l'écran (bandeau du haut) : à augmenter à chaque modification. */
const APP_VERSION = 'v6';
/* v2 à v4 : la case « Écris ta réponse » n'est plus prise pour un identifiant par le navigateur.
   v5 : les exercices du CM1 – CM2, et un quiz de cours à la fin de chaque domaine (CE et CM).
   v6 : les exercices et les quiz de cours du 6e – 5e (relatifs, calcul littéral, π, statistiques, probabilités, symétrie centrale…). */

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
const UNITES_DITES = { mm: 'millimètres', cm: 'centimètres', dm: 'décimètres', m: 'mètres', dam: 'décamètres', hm: 'hectomètres', km: 'kilomètres', mg: 'milligrammes', cg: 'centigrammes', dg: 'décigrammes', g: 'grammes', dag: 'décagrammes', hg: 'hectogrammes', kg: 'kilogrammes', mL: 'millilitres', cL: 'centilitres', dL: 'décilitres', L: 'litres', daL: 'décalitres', hL: 'hectolitres', kL: 'kilolitres', min: 'minutes', s: 'secondes' };
const UNITES_RE = '(?:dam|daL|dag|hm|hg|hL|kL|km|kg|mm|mg|mL|cm|cg|cL|dm|dg|dL|min|m|g|L|s)';
function voixMaths(t) {
  let s = String(t || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/[  ]/g, ' ');
  s = s.replace(/(\d) (?=\d{3}\b)/g, '$1');                     /* 3 452 → 3452 : la voix lit le nombre entier */
  s = s.replace(/(\d+)\s*\/\s*(\d+)/g, (m, a, b) => fracMots(Number(a), Number(b)));
  const nb = (n, mot) => `${n} ${n === '1' ? mot.replace(/s$/, '') : mot}`;
  s = s.replace(/(\d+) h (\d+)/g, (m, h, mi) => `${nb(h, 'heures')} ${mi}`).replace(/(\d+) h\b/g, (m, h) => nb(h, 'heures'));
  s = s.replace(/(\d+(?:,\d+)?) ?€/g, (m, n) => nb(n, 'euros')).replace(/(\d+) c\b/g, (m, n) => nb(n, 'centimes'));
  s = s.replace(/(\d+(?:,\d+)?) ?(cm|dm|m)²/g, (m, n, u) => `${nb(n, UNITES_DITES[u])} carrés`).replace(/(\d+(?:,\d+)?) ?(cm|dm|m)³/g, (m, n, u) => `${nb(n, UNITES_DITES[u])} cubes`);
  s = s.replace(/(?<![\p{L}])(cm|dm|m)²/gu, (m, u) => `${UNITES_DITES[u]} carrés`).replace(/(?<![\p{L}])(cm|dm|m)³/gu, (m, u) => `${UNITES_DITES[u]} cubes`).replace(/km\/h/g, 'kilomètres par heure').replace(/(\d+) %/g, '$1 pour cent');
  /* une abréviation n'est remplacée que si elle est isolée : pas de lettre juste après (le « m » de « mètres » reste tel quel) */
  const fin = '(?![\\p{L}\\p{N}])';
  s = s.replace(new RegExp(`(\\d+(?:,\\d+)?) ?(${UNITES_RE})${fin}`, 'gu'), (m, n, u) => nb(n, UNITES_DITES[u]));
  s = s.replace(new RegExp(`…\\s*(${UNITES_RE})${fin}`, 'gu'), (m, u) => `combien de ${UNITES_DITES[u]}`);
  s = s.replace(new RegExp(`combien de (${UNITES_RE})${fin}`, 'gu'), (m, u) => `combien de ${UNITES_DITES[u]}`);
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
  /* v6 : le signe moins peut être tapé « - » ou « − » (touche du clavier de l'écran) */
  const t = String(s || '').replace(/[\s\u202f\u00a0]/g, '').replace(/[−–]/g, '-').replace(',', '.').replace(/(€|°|[a-zA-Zé²³]+)$/, '');
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
    { jeu: 'ce-quiz-nb', quiz: 'ce-nombres', n: 12, titre: 'Quiz de cours : nombres et calculs', classes: ['ce'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions, les propriétés et les égalités à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { jeu: 'cm-grands', gen: 'cmgrands', titre: 'Les grands nombres', classes: ['cm'],
      consigne: `Lis et écris des nombres jusqu'aux milliards. On les écrit par <strong>classes de trois chiffres</strong> : les unités, les mille, les millions, les milliards. Attention à ne pas confondre le <strong>chiffre</strong> des milliers et le <strong>nombre</strong> de milliers ! ${regle}` },
    { jeu: 'cm-dec', gen: 'cmdec', titre: 'Les nombres décimaux', classes: ['cm'],
      consigne: `Après la virgule viennent les <strong>dixièmes</strong>, les <strong>centièmes</strong>, puis les <strong>millièmes</strong>. Trouve un chiffre, écris une fraction décimale sous forme de nombre décimal, encadre et compare. ${regle}` },
    { jeu: 'cm-frac', gen: 'cmfrac', titre: 'Les fractions', classes: ['cm'],
      consigne: `Compare une fraction à 1, complète des égalités de fractions, calcule la fraction d'une quantité, et passe d'une fraction à un nombre décimal. ${regle}` },
    { jeu: 'cm-calc', gen: 'cmcalc', titre: 'Calculer avec les décimaux', classes: ['cm'],
      consigne: `Additionne et soustrais des décimaux (en alignant les virgules), multiplie et divise par 10, 100, 1 000, multiplie un décimal par un entier, puis deux décimaux entre eux. ${regle}` },
    { jeu: 'cm-div', gen: 'cmdiv', titre: 'La division euclidienne', classes: ['cm'],
      consigne: `Trouve le <strong>quotient</strong> et le <strong>reste</strong> d'une division, puis résous des problèmes de partage et de groupement. Rappel : dividende = diviseur × quotient + reste, et le reste est plus petit que le diviseur. ${regle}` },
    { jeu: 'cm-pb', gen: 'cmpb', titre: 'Résoudre des problèmes', classes: ['cm'],
      consigne: `Des problèmes en une ou plusieurs étapes, avec des nombres entiers et décimaux. Lis bien, cherche les étapes, puis calcule. ${regle}` },
    { jeu: 'cm-bilan-nb', mix: ['cmgrands', 'cmdec', 'cmfrac', 'cmcalc', 'cmdiv', 'cmpb'], n: 14, titre: 'Tout sur les nombres et les calculs', classes: ['cm'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris au CM sur les nombres et les calculs, mélangé. Quatorze questions. ${regle}` },
    { jeu: 'cm-quiz-nb', quiz: 'cm-nombres', n: 12, titre: 'Quiz de cours : nombres et calculs', classes: ['cm'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions, les propriétés et les égalités à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { jeu: '65-prio', gen: 'prio', titre: 'La priorité des opérations', classes: ['65'],
      consigne: `D'abord les <strong>parenthèses</strong>, puis les <strong>multiplications et divisions</strong>, enfin les <strong>additions et soustractions</strong>. Calcule sans te laisser piéger par l'ordre d'écriture ! ${regle}` },
    { jeu: '65-divis', gen: 'divis', titre: 'Les critères de divisibilité', classes: ['65'],
      consigne: `Divisible par 2, 5, 10 : regarde le chiffre des unités. Par 3 ou 9 : additionne les chiffres. Par 4 : regarde les deux derniers chiffres. ${regle}` },
    { jeu: '65-frac', gen: 'frac65', titre: 'Les fractions', classes: ['65'],
      consigne: `La fraction comme quotient (3/4 = 3 ÷ 4), les fractions égales, la simplification, puis (en 5e) la comparaison et l'addition de fractions. ${regle}` },
    { jeu: '65-rel', gen: 'rel', titre: 'Les nombres relatifs (5e)', classes: ['65'],
      consigne: `Compare, additionne et soustrais des nombres positifs et négatifs. Pour écrire un nombre négatif, utilise la touche <strong>−</strong> du clavier. ${regle}` },
    { jeu: '65-litt', gen: 'litt', titre: 'Le calcul littéral (5e)', classes: ['65'],
      consigne: `Une lettre remplace un nombre : calcule une expression pour une valeur donnée, teste une égalité, réduis une expression. Rappel : 3x veut dire 3 × x. ${regle}` },
    { jeu: '65-bilan-nb', mix: ['prio', 'divis', 'frac65', 'rel', 'litt'], n: 12, titre: 'Tout sur les nombres et les calculs', classes: ['65'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris en 6e et en 5e sur les nombres et les calculs, mélangé. ${regle}` },
    { jeu: '65-quiz-nb', quiz: '65-nombres', n: 12, titre: 'Quiz de cours : nombres et calculs', classes: ['65'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions, les propriétés et les formules à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
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
    { jeu: 'ce-quiz-gr', quiz: 'ce-grandeurs', n: 12, titre: 'Quiz de cours : grandeurs et mesures', classes: ['ce'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions, les propriétés et les égalités à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { jeu: 'cm-aire', gen: 'cmaire', titre: 'Aire et périmètre', classes: ['cm'],
      consigne: `L'<strong>aire</strong>, c'est la place occupée par une figure ; le <strong>périmètre</strong>, c'est la longueur de son tour. Compte des carreaux, calcule l'aire du carré et du rectangle, et ne confonds plus les deux ! ${regle}` },
    { jeu: 'cm-angle', gen: 'cmangle', titre: 'Les angles', classes: ['cm'],
      consigne: `Un angle est <strong>aigu</strong> (plus petit qu'un angle droit), <strong>droit</strong> (90°), <strong>obtus</strong> (entre 90° et 180°) ou <strong>plat</strong> (180°). Reconnais-les, puis estime leur mesure en degrés. ${regle}` },
    { jeu: 'cm-prop', gen: 'cmprop', titre: 'La proportionnalité', classes: ['cm'],
      consigne: `Reconnais une situation de <strong>proportionnalité</strong>, calcule en passant par l'unité, et complète des tableaux. ${regle}` },
    { jeu: 'cm-pct', gen: 'cmpct', titre: 'Pourcentages, échelles et vitesses', classes: ['cm'],
      consigne: `50 % c'est la moitié, 25 % le quart, 10 % le dixième. Sur un plan, 1 cm représente une longueur réelle. À 60 km/h, on parcourt 60 km en 1 heure. ${regle}` },
    { jeu: 'cm-conv', gen: 'cmconv', titre: 'Les conversions', classes: ['cm'],
      consigne: `Convertis des longueurs (km, hm, dam, m, dm, cm, mm), des masses (kg… mg), des contenances (kL… mL) et des durées. Dans le tableau de conversion, chaque colonne, c'est 10 fois plus ou 10 fois moins. ${regle}` },
    { jeu: 'cm-vol', gen: 'cmvol', titre: 'Le volume du pavé droit', classes: ['cm'],
      consigne: `Compte les petits cubes d'un pavé droit, étage par étage, puis utilise la formule : volume = longueur × largeur × hauteur. Le volume s'exprime en <strong>cm³</strong>. ${regle}` },
    { jeu: 'cm-bilan-gr', mix: ['cmaire', 'cmangle', 'cmprop', 'cmpct', 'cmconv', 'cmvol'], n: 12, titre: 'Tout sur les grandeurs et les mesures', classes: ['cm'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris au CM sur les grandeurs et les mesures, mélangé. Douze questions. ${regle}` },
    { jeu: 'cm-quiz-gr', quiz: 'cm-grandeurs', n: 12, titre: 'Quiz de cours : grandeurs et mesures', classes: ['cm'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions, les propriétés et les égalités à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { jeu: '65-cercle', gen: 'cercle65', titre: 'Longueur du cercle et aire du disque', classes: ['65'],
      consigne: `Longueur du cercle = 2 × π × R ; aire du disque = π × R × R. Prends π ≈ 3,14 ; tu peux utiliser la calculatrice, et arrondir au dixième. ${regle}` },
    { jeu: '65-aires', gen: 'aires65', titre: 'L\'aire du triangle et du parallélogramme', classes: ['65'],
      consigne: `Triangle : base × hauteur ÷ 2. Parallélogramme (5e) : base × hauteur. La hauteur est toujours perpendiculaire à la base. ${regle}` },
    { jeu: '65-vol', gen: 'vol65', titre: 'Les volumes', classes: ['65'],
      consigne: `Cube, pavé droit, puis (en 5e) prisme droit et cylindre : volume = aire de la base × hauteur. Et retiens : 1 L = 1 dm³, 1 mL = 1 cm³. ${regle}` },
    { jeu: '65-prop', gen: 'prop65', titre: 'Proportionnalité et pourcentages', classes: ['65'],
      consigne: `Coefficient de proportionnalité, pourcentages, réductions, quatrième proportionnelle et ratios. ${regle}` },
    { jeu: '65-stat', gen: 'stat', titre: 'Les statistiques', classes: ['65'],
      consigne: `Lis un tableau de données : effectif total, fréquence en pourcentage, moyenne. ${regle}` },
    { jeu: '65-proba', gen: 'proba', titre: 'Les probabilités (5e)', classes: ['65'],
      consigne: `Une probabilité est entre 0 (impossible) et 1 (certain). Quand toutes les issues ont la même chance : probabilité = cas favorables ÷ cas possibles. ${regle}` },
    { jeu: '65-bilan-gr', mix: ['cercle65', 'aires65', 'vol65', 'prop65', 'stat', 'proba'], n: 12, titre: 'Tout sur les grandeurs et les mesures', classes: ['65'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris en 6e et en 5e sur les grandeurs et les mesures, mélangé. ${regle}` },
    { jeu: '65-quiz-gr', quiz: '65-grandeurs', n: 12, titre: 'Quiz de cours : grandeurs et mesures', classes: ['65'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions, les propriétés et les formules à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { titre: 'Les probabilités', classes: ['43'], avenir: true },
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
    { jeu: 'ce-quiz-geo', quiz: 'ce-geometrie', n: 12, titre: 'Quiz de cours : espace et géométrie', classes: ['ce'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions, les propriétés et les égalités à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { jeu: 'cm-droites', gen: 'cmdroites', titre: 'Droites perpendiculaires et parallèles', classes: ['cm'],
      consigne: `Deux droites <strong>perpendiculaires</strong> se coupent en formant un angle droit ; deux droites <strong>parallèles</strong> ne se coupent jamais ; deux droites <strong>sécantes</strong> se coupent. ${regle}` },
    { jeu: 'cm-poly', gen: 'cmpoly', titre: 'Triangles et quadrilatères', classes: ['cm'],
      consigne: `Lis le <strong>codage</strong> : les petits traits montrent les côtés de même longueur, le petit carré montre un angle droit. Puis nomme la figure : triangle équilatéral, isocèle, rectangle, carré, rectangle, losange. ${regle}` },
    { jeu: 'cm-patron', gen: 'cmpatron', titre: 'Les patrons du cube', classes: ['cm'],
      consigne: `Un <strong>patron</strong> est une figure qu'on peut découper et plier pour fabriquer un solide. Imagine le pliage : ces six carrés forment-ils un cube ? ${regle}` },
    { jeu: 'cm-sym', gen: 'cmsym', titre: 'Les axes de symétrie', classes: ['cm'],
      consigne: `Combien d'<strong>axes de symétrie</strong> a cette figure ? Imagine tous les pliages possibles qui font se superposer les deux moitiés. ${regle}` },
    { jeu: 'cm-solides', gen: 'cmsolides', titre: 'Les solides : faces, arêtes, sommets', classes: ['cm'],
      consigne: `Compte les <strong>faces</strong> (surfaces planes), les <strong>arêtes</strong> (les segments où deux faces se rencontrent) et les <strong>sommets</strong> (les pointes) du cube, du pavé, de la pyramide et du prisme. ${regle}` },
    { jeu: 'cm-prog', gen: 'cmprog', titre: 'Programmer les déplacements d\'un lutin', classes: ['cm'],
      consigne: `Le lutin suit un <strong>programme</strong> : « avancer de 2 », « tourner à droite »… Attention : il tourne par rapport à <strong>sa</strong> direction. Mets-toi à sa place ! ${regle}` },
    { jeu: 'cm-bilan-geo', mix: ['cmdroites', 'cmpoly', 'cmpatron', 'cmsym', 'cmsolides', 'cmprog'], n: 12, titre: 'Tout sur l\'espace et la géométrie', classes: ['cm'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris au CM sur l'espace et la géométrie, mélangé. Douze questions. ${regle}` },
    { jeu: 'cm-quiz-geo', quiz: 'cm-geometrie', n: 12, titre: 'Quiz de cours : espace et géométrie', classes: ['cm'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions, les propriétés et les égalités à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
    { jeu: '65-nota', gen: 'nota', titre: 'Les notations', classes: ['65'],
      consigne: `[AB] le segment, (AB) la droite, [AB) la demi-droite, AB la longueur, ∈ « appartient à ». ${regle}` },
    { jeu: '65-medi', gen: 'medi', titre: 'La médiatrice', classes: ['65'],
      consigne: `La médiatrice d'un segment est la droite perpendiculaire à ce segment en son milieu ; chacun de ses points est à égale distance des deux extrémités. ${regle}` },
    { jeu: '65-sym', gen: 'symc', titre: 'Les symétries', classes: ['65'],
      consigne: `Symétrie axiale et symétrie centrale (5e) : elles conservent les longueurs, les angles et les aires. Dans la symétrie de centre O, O est le milieu entre un point et son symétrique. ${regle}` },
    { jeu: '65-angles', gen: 'angles65', titre: 'Les angles', classes: ['65'],
      consigne: `La somme des angles d'un triangle vaut 180°. Avec deux droites parallèles, les angles alternes-internes et correspondants sont égaux (5e). ${regle}` },
    { jeu: '65-para', gen: 'para', titre: 'Les parallélogrammes (5e)', classes: ['65'],
      consigne: `Côtés opposés parallèles et de même longueur, diagonales qui se coupent en leur milieu, angles opposés égaux. ${regle}` },
    { jeu: '65-bilan-geo', mix: ['nota', 'medi', 'symc', 'angles65', 'para'], n: 12, titre: 'Tout sur l\'espace et la géométrie', classes: ['65'], bilan: true,
      consigne: `<strong>Bilan</strong> : tout ce que tu as appris en 6e et en 5e sur l'espace et la géométrie, mélangé. ${regle}` },
    { jeu: '65-quiz-geo', quiz: '65-geometrie', n: 12, titre: 'Quiz de cours : espace et géométrie', classes: ['65'], quizCours: true, consigne: `<strong>Quiz de cours</strong> : 12 questions tirées au hasard parmi les définitions, les propriétés et les formules à savoir par cœur. Ce sont toujours les mêmes questions qui reviennent : rejoue jusqu'à toutes les connaître ! ${regle}` },
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


/* ============================================================
   CM1 – CM2 : NOMBRES ET CALCULS
   p va de 0 (niveau CM1) à 1 (niveau CM2).
   Les décimaux sont calculés en nombres entiers (millièmes), pour éviter les erreurs d'arrondi de l'ordinateur.
   ============================================================ */
/* les grands nombres en lettres : million et milliard sont des noms, ils prennent un s */
function grandEnLettres(n) {
  if (n < 1e6) return enLettres(n);
  const mds = Math.floor(n / 1e9), mns = Math.floor((n % 1e9) / 1e6), reste = n % 1e6;
  const bout = (k, mot) => (k ? `${k === 1 ? 'un' : moins1000(k, false)} ${mot}${k > 1 ? 's' : ''}` : '');
  return [bout(mds, 'milliard'), bout(mns, 'million'), reste ? enLettres(reste) : ''].filter(Boolean).join(' ');
}
const CLASSES_NUM = ['unités', 'dizaines', 'centaines', 'unités de mille', 'dizaines de mille', 'centaines de mille', 'unités de millions', 'dizaines de millions', 'centaines de millions', 'unités de milliards'];
/* un décimal donné en millièmes (entier) → texte « 3,47 » avec le nombre de décimales voulu */
const dec = (milli, places) => fmtN(milli / 1000, places);
const RANG_DEC = ['dixièmes', 'centièmes', 'millièmes'];
function tableauDec(entier, chiffresDec, surligne) {
  const e = String(entier).split(''), noms = ['unités'];
  if (e.length > 1) noms.unshift('dizaines'); if (e.length > 2) noms.unshift('centaines');
  const titres = [...noms, ...RANG_DEC.slice(0, chiffresDec.length)], cases = [...e.slice(-noms.length), ...chiffresDec];
  return `<table class="tab-num"><tr>${titres.map((t, i) => `<th class="${surligne === i ? 'on' : ''}${i === noms.length ? ' virg' : ''}">${t}</th>`).join('')}</tr><tr>${cases.map((c, i) => `<td class="${surligne === i ? 'on' : ''}${i === noms.length ? ' virg' : ''}">${c}</td>`).join('')}</tr></table>`;
}

/* --- Les grands nombres --- */
GEN.cmgrands = (p) => {
  const notion = 'Les grands nombres';
  const grand = p >= 0.5;
  const x = grand ? rnd(1, 9) * 1e9 * (Math.random() < 0.4 ? 1 : 0) + rnd(1000000, 999999999) : rnd(10000, 9999999);
  const type = pick([0, 1, 2]);
  const s = String(x), L = s.length;
  if (type === 0) return { enonce: `Écris ce nombre en chiffres :<br><span class="mm-lettres">${grandEnLettres(x)}</span>`, saisie: { type: 'nombre', bonne: x }, rep: fmtN(x), notion,
    explication: `On l'écrit <strong>${fmtN(x)}</strong>. On écrit les nombres par <strong>classes de trois chiffres</strong> (milliards, millions, mille, unités), séparées par un espace ; une classe incomplète se complète par des 0.`, voix: `Écris ce nombre en chiffres : ${grandEnLettres(x)}.` };
  if (type === 1) {
    const k = rnd(Math.min(3, L - 1), L - 1), c = Number(s[L - 1 - k]);
    return { enonce: `Dans le nombre <strong>${fmtN(x)}</strong>, quel est le <strong>chiffre des ${CLASSES_NUM[k]}</strong> ?`, saisie: { type: 'nombre', bonne: c }, rep: String(c), notion,
      explication: `On compte les rangs à partir de la droite : unités, dizaines, centaines, puis la classe des mille, puis celle des millions. Le chiffre des ${CLASSES_NUM[k]} de ${fmtN(x)} est <strong>${c}</strong>.` };
  }
  /* combien de milliers / de millions en tout (le nombre de…, à ne pas confondre avec le chiffre des…) */
  const unite = x >= 1e7 && Math.random() < 0.5 ? [1e6, 'millions'] : [1000, 'milliers'], r = Math.floor(x / unite[0]);
  return { enonce: `Combien y a-t-il de <strong>${unite[1]}</strong> en tout dans <strong>${fmtN(x)}</strong> ?`, saisie: { type: 'nombre', bonne: r }, rep: fmtN(r), notion,
    explication: `Attention : on ne demande pas le chiffre des ${unite[1]}, mais le <strong>nombre</strong> de ${unite[1]}. On prend tout ce qui est écrit à gauche du rang des ${unite[1] === 'milliers' ? 'unités de mille' : 'unités de millions'}, ce rang compris : il y a <strong>${fmtN(r)} ${unite[1]}</strong> dans ${fmtN(x)}.` };
};

/* --- Les nombres décimaux --- */
GEN.cmdec = (p) => {
  const notion = 'Les nombres décimaux';
  const places = p < 0.4 ? 2 : pick([2, 3]);
  const ent = rnd(0, p < 0.4 ? 20 : 99), decs = Array.from({ length: places }, () => String(rnd(0, 9)));
  if (decs[places - 1] === '0') decs[places - 1] = String(rnd(1, 9));
  const milli = ent * 1000 + Number(decs.join('').padEnd(3, '0')), txtN = dec(milli, places);
  const type = pick(p < 0.3 ? [0, 1, 3] : [0, 1, 2, 3, 4]);
  if (type === 0) {
    const k = rnd(0, places - 1), c = Number(decs[k]);
    return { enonce: `Dans <strong>${txtN}</strong>, quel est le chiffre des <strong>${RANG_DEC[k]}</strong> ?`, saisie: { type: 'nombre', bonne: c }, rep: String(c), notion,
      explication: `Après la virgule viennent les dixièmes, puis les centièmes, puis les millièmes. Dans ${txtN}, le chiffre des ${RANG_DEC[k]} est <strong>${c}</strong>.${tableauDec(ent, decs, String(ent).length > 2 ? 3 + k : String(ent).length + k)}` };
  }
  if (type === 1) {
    /* fraction décimale → nombre décimal */
    const d = places === 2 ? 100 : 1000, num = milli / (1000 / d);
    return { enonce: `Écris sous forme d'un nombre décimal :<br><strong>${fracHtml(fmtN(num), fmtN(d))}</strong>`, saisie: { type: 'nombre', bonne: milli / 1000 }, rep: txtN, notion, voix: `Écris sous forme d'un nombre décimal : ${num} ${d === 100 ? 'centièmes' : 'millièmes'}.`,
      explication: `${fmtN(num)} ${d === 100 ? 'centièmes' : 'millièmes'} : le dernier chiffre est celui des ${d === 100 ? 'centièmes' : 'millièmes'}, donc il y a ${places} chiffres après la virgule : <strong>${txtN}</strong>.` };
  }
  if (type === 2) {
    /* encadrer entre deux entiers */
    return { enonce: `Entre quels nombres entiers consécutifs se trouve <strong>${txtN}</strong> ?`, choix: shuffle([[ent, ent + 1], [ent - 1, ent], [ent + 1, ent + 2], [Number(decs[0]), Number(decs[0]) + 1]].filter(([a], i, T) => a >= 0 && T.findIndex(([b]) => b === a) === i)).map(([a, b]) => ({ v: `${a}-${b}`, html: `entre ${a} et ${b}` })),
      bonne: `${ent}-${ent + 1}`, rep: `entre ${ent} et ${ent + 1}`, notion,
      explication: `La partie entière de ${txtN} est ${ent} (ce qui est avant la virgule). Donc ${ent} &lt; ${txtN} &lt; ${ent + 1}.` };
  }
  /* comparer deux décimaux : le piège « plus de chiffres = plus grand » */
  const piege = Math.random() < 0.6;
  let b;
  if (piege) { const autreDec = String(rnd(10, 99)); b = ent * 1000 + Number(autreDec.padEnd(3, '0')); if (b === milli) b += 10; }
  else b = milli + pick([-1, 1]) * pick([100, 10, 1]) * rnd(1, 3);
  if (b < 0) b = milli + 5;
  const signe = milli < b ? '<' : milli > b ? '>' : '=', placesB = String(b % 1000).padStart(3, '0').replace(/0+$/, '').length || 1;
  const tb = dec(b, Math.max(1, placesB));
  const mots = { '<': 'plus petit que', '>': 'plus grand que', '=': 'égal à' };
  const pa = String(milli % 1000).padStart(3, '0'), pb = String(b % 1000).padStart(3, '0');
  let i = 0; while (pa[i] === pb[i] && i < 2) i += 1;
  return { enonce: `Compare :<br><strong>${txtN}</strong> <span class="mm-trou">…</span> <strong>${tb}</strong>`, choix: ['<', '>', '='].map((v) => ({ v, html: `<span class="mm-signe">${v.replace('<', '&lt;').replace('>', '&gt;')}</span> ${mots[v]}` })), bonne: signe, rep: `« ${mots[signe]} »`, notion,
    voix: `Compare ${txtN} et ${tb}.`,
    explication: Math.floor(milli / 1000) !== Math.floor(b / 1000) ? `On compare d'abord les parties entières : ${Math.floor(milli / 1000)} et ${Math.floor(b / 1000)}. Donc <strong>${txtN} ${signe.replace('<', '&lt;').replace('>', '&gt;')} ${tb}</strong>.`
      : `Les parties entières sont égales (${ent}). On compare ensuite chiffre après chiffre, après la virgule : dixièmes, puis centièmes, puis millièmes. ${signe === '=' ? '' : `Pour les ${RANG_DEC[i]}, ${pa[i]} et ${pb[i]} : `}<strong>${txtN} ${signe.replace('<', '&lt;').replace('>', '&gt;')} ${tb}</strong>.${piege ? ' Attention : ce n\'est pas le nombre qui a le plus de chiffres après la virgule qui est le plus grand ! Astuce : écris les deux nombres avec autant de chiffres après la virgule (on peut ajouter des 0 à droite).' : ''}` };
};

/* --- Les fractions --- */
GEN.cmfrac = (p) => {
  const notion = 'Les fractions';
  const type = pick(p < 0.4 ? [0, 2] : [0, 1, 2, 3]);
  if (type === 0) {
    const d = rnd(2, 10), n = pick([rnd(1, d - 1), d, rnd(d + 1, 3 * d)]);
    const v = n < d ? 'inf' : n === d ? 'egal' : 'sup';
    return { enonce: `La fraction ${fracHtml(n, d)} est-elle plus petite, égale ou plus grande que <strong>1</strong> ?`, choix: [{ v: 'inf', html: 'plus petite que 1' }, { v: 'egal', html: 'égale à 1' }, { v: 'sup', html: 'plus grande que 1' }], bonne: v, rep: { inf: 'plus petite que 1', egal: 'égale à 1', sup: 'plus grande que 1' }[v], notion, voix: `La fraction ${n} sur ${d} est-elle plus petite, égale ou plus grande que 1 ?`,
      explication: `On compare le numérateur (en haut, ${n}) et le dénominateur (en bas, ${d}). ${v === 'inf' ? `${n} &lt; ${d} : on prend moins de parts qu'il n'y en a dans l'unité, la fraction est <strong>plus petite que 1</strong>.` : v === 'egal' ? `${n} = ${d} : on prend toutes les parts de l'unité, la fraction est <strong>égale à 1</strong>.` : `${n} &gt; ${d} : on prend plus de parts qu'il n'y en a dans une unité, la fraction est <strong>plus grande que 1</strong>.`}` };
  }
  if (type === 1) {
    const d = pick([2, 3, 4, 5]), n = rnd(1, d - 1), k = pick([2, 3, 4, 5]);
    return { enonce: `Complète l'égalité :<br><strong>${fracHtml(n, d)} = ${fracHtml('…', d * k)}</strong>`, saisie: { type: 'nombre', bonne: n * k }, rep: String(n * k), notion, voix: `Complète : ${n} sur ${d} égale combien sur ${d * k} ?`,
      explication: `Pour passer de ${d} à ${d * k} parts, on a partagé chaque part en ${k} : on multiplie le dénominateur par ${k}, donc on multiplie aussi le numérateur par ${k}. ${n} × ${k} = <strong>${n * k}</strong> : ${fracHtml(n, d)} = ${fracHtml(n * k, d * k)}.` };
  }
  if (type === 2) {
    const d = pick([2, 3, 4, 5, 10]), n = d === 2 ? 1 : rnd(1, d - 1), q = d * rnd(2, p < 0.4 ? 6 : 12), r = (q / d) * n;
    return { enonce: `Combien font ${fracHtml(n, d)} de <strong>${q}</strong> ?`, saisie: { type: 'nombre', bonne: r }, rep: String(r), notion, voix: `Combien font ${fracMots(n, d)} de ${q} ?`,
      explication: `On partage ${q} en ${d} parts égales : ${q} ÷ ${d} = ${q / d}. Puis on prend ${n} part${n > 1 ? 's' : ''} : ${q / d} × ${n} = <strong>${r}</strong>.` };
  }
  /* fraction décimale ↔ décimal simple */
  const F = pick([[1, 2, 0.5], [1, 4, 0.25], [3, 4, 0.75], [1, 10, 0.1], [1, 5, 0.2], [3, 10, 0.3], [7, 100, 0.07], [3, 2, 1.5], [5, 2, 2.5]]);
  return { enonce: `Écris ${fracHtml(F[0], F[1])} sous forme d'un nombre décimal.`, saisie: { type: 'nombre', bonne: F[2] }, rep: fmtN(F[2]), notion, voix: `Écris ${fracMots(F[0], F[1])} sous forme d'un nombre décimal.`,
    explication: `${fracHtml(F[0], F[1])} = ${F[0]} ÷ ${F[1]} = <strong>${fmtN(F[2])}</strong>.${F[1] === 2 || F[1] === 4 || F[1] === 5 ? ` Astuce : ${fracHtml(F[0], F[1])} = ${fracHtml(F[0] * (100 / F[1]), 100)}, c'est-à-dire ${fmtN(F[2])}.` : ''}` };
};

/* --- Calculer avec les décimaux --- */
GEN.cmcalc = (p) => {
  const notion = 'Calculer avec les décimaux';
  const type = pick(p < 0.35 ? [0, 1, 3] : p < 0.7 ? [0, 1, 2, 3] : [1, 2, 3, 4]);
  if (type === 0 || type === 1) {
    const plus = type === 0;
    /* un décimal avec 1 ou 2 chiffres après la virgule, dont le dernier chiffre n'est pas 0 */
    const tire = (min, max, pl) => { let v = rnd(min, max); if (v % 10 === 0) v += rnd(1, 9); return v * (pl === 1 ? 100 : 10); };
    let pa = pick([1, 2]), pb = pick([1, 2]), a = tire(10, 999, pa), b = tire(10, 899, pb);
    if (!plus && b >= a) { [a, b] = [b, a]; [pa, pb] = [pb, pa]; }
    if (!plus && a === b) a += pa === 1 ? 100 : 10;
    const r = plus ? a + b : a - b, pl = Math.max(pa, pb);
    return { enonce: `Calcule :<br><strong>${dec(a, pa)} ${plus ? '+' : '−'} ${dec(b, pb)} = ?</strong>`, saisie: { type: 'nombre', bonne: r / 1000 }, rep: dec(r, pl), notion, court: `${dec(a, pa)} ${plus ? '+' : '−'} ${dec(b, pb)}`,
      explication: `On pose l'opération en <strong>alignant les virgules</strong> (les unités sous les unités, les dixièmes sous les dixièmes)${pa !== pb ? `, et on complète avec un 0 : ${dec(pa < pb ? a : b, pl)}` : ''}. On calcule comme avec des nombres entiers, puis on place la virgule du résultat sous les autres : <strong>${dec(r, pl)}</strong>.` };
  }
  if (type === 2) {
    const a = rnd(11, 999) * (Math.random() < 0.5 ? 10 : 100), pa = a % 100 ? 2 : 1, k = rnd(2, 9), r = a * k;
    return { enonce: `Calcule :<br><strong>${dec(a, pa)} × ${k} = ?</strong>`, saisie: { type: 'nombre', bonne: r / 1000 }, rep: dec(r, undefined), notion, court: `${dec(a, pa)} × ${k}`,
      explication: `On calcule d'abord sans la virgule : ${fmtN(a / (pa === 2 ? 10 : 100))} × ${k} = ${fmtN(r / (pa === 2 ? 10 : 100))}. ${dec(a, pa)} a ${pa} chiffre${pa > 1 ? 's' : ''} après la virgule, donc le résultat aussi : <strong>${dec(r, undefined)}</strong>.` };
  }
  if (type === 3) {
    const k = pick([10, 100, 1000]), fois = p < 0.4 || Math.random() < 0.55;
    /* pour une division, on part d'un nombre qui garde au plus trois chiffres après la virgule */
    const a = fois ? rnd(11, 9999) * pick([1, 10, 100]) : rnd(11, 9999) * k, pa = a % 1000 ? (a % 100 ? (a % 10 ? 3 : 2) : 1) : 0;
    const r = fois ? a * k : a / k, zeros = String(k).length - 1;
    return { enonce: `Calcule :<br><strong>${dec(a, pa || undefined)} ${fois ? '×' : '÷'} ${fmtN(k)} = ?</strong>`, saisie: { type: 'nombre', bonne: r / 1000 }, rep: fmtN(r / 1000), notion, court: `${dec(a, pa || undefined)} ${fois ? '×' : '÷'} ${k}`,
      explication: `${fois ? 'Multiplier' : 'Diviser'} par ${fmtN(k)}, c'est déplacer chaque chiffre de <strong>${zeros} rang${zeros > 1 ? 's' : ''} vers la ${fois ? 'gauche' : 'droite'}</strong> : on dit souvent que la virgule « se déplace » de ${zeros} rang${zeros > 1 ? 's' : ''} vers la ${fois ? 'droite' : 'gauche'}. ${dec(a, pa || undefined)} ${fois ? '×' : '÷'} ${fmtN(k)} = <strong>${fmtN(r / 1000)}</strong>.` };
  }
  /* CM2 : décimal × décimal */
  const a = rnd(11, 99), b = rnd(2, 99), pa = 1, pb = pick([1, 2]);
  const r = a * b, pr = pa + pb;
  const ta = fmtN(a / 10, 1), tb = fmtN(b / 10 ** pb, pb), tr = fmtN(r / 10 ** pr);
  return { enonce: `Calcule :<br><strong>${ta} × ${tb} = ?</strong>`, saisie: { type: 'nombre', bonne: r / 10 ** pr }, rep: tr, notion, court: `${ta} × ${tb}`,
    explication: `On calcule sans les virgules : ${a} × ${b} = ${r}. On compte les chiffres après la virgule dans les deux nombres : ${pa} + ${pb} = ${pr}. Le résultat en a donc ${pr} : <strong>${tr}</strong>.` };
};

/* --- La division euclidienne --- */
GEN.cmdiv = (p) => {
  const notion = 'La division euclidienne';
  const d = rnd(p < 0.5 ? 3 : 6, p < 0.5 ? 9 : 25), q = rnd(p < 0.5 ? 4 : 12, p < 0.5 ? 25 : 99), r = rnd(0, d - 1), a = d * q + r;
  const type = pick(p < 0.6 ? [0, 1, 2] : [0, 1, 2, 3]);
  const preuve = `${fmtN(a)} = ${d} × ${q} + ${r}, et le reste ${r} est bien plus petit que le diviseur ${d}`;
  if (type === 0) return { enonce: `Dans la division de <strong>${fmtN(a)}</strong> par <strong>${d}</strong>, quel est le <strong>quotient</strong> ?`, saisie: { type: 'nombre', bonne: q }, rep: String(q), notion,
    explication: `On cherche combien de fois ${d} dans ${fmtN(a)} : ${d} × ${q} = ${fmtN(d * q)}, et ${d} × ${q + 1} = ${fmtN(d * (q + 1))} est trop grand. Le quotient est <strong>${q}</strong> : ${preuve}.` };
  if (type === 1) return { enonce: `Dans la division de <strong>${fmtN(a)}</strong> par <strong>${d}</strong>, quel est le <strong>reste</strong> ?`, saisie: { type: 'nombre', bonne: r }, rep: String(r), notion,
    explication: `${d} × ${q} = ${fmtN(d * q)}, et ${fmtN(a)} − ${fmtN(d * q)} = <strong>${r}</strong>. ${capitalize(preuve)}.` };
  if (type === 2) {
    const obj = pick([['œufs', 'boîtes de', 'boîtes pleines'], ['élèves', 'équipes de', 'équipes complètes'], ['bonbons', 'sachets de', 'sachets pleins'], ['photos', 'pages de', 'pages pleines']]);
    return { enonce: `On a <strong>${fmtN(a)} ${obj[0]}</strong>. On fait des ${obj[1]} <strong>${d}</strong>. Combien de ${obj[2]} obtient-on ?`, saisie: { type: 'nombre', bonne: q, unite: obj[2].split(' ')[0] }, rep: String(q), notion,
      explication: `C'est une division euclidienne : ${preuve}. On obtient <strong>${q} ${obj[2]}</strong>${r ? `, et il reste ${r} ${obj[0]}` : ''}.` };
  }
  /* combien de voyages / de tables faut-il : on arrondit au-dessus quand il reste quelque chose */
  const R = r || 1, A = d * q + R;
  return { enonce: `<strong>${fmtN(A)} personnes</strong> doivent traverser le lac. Une barque transporte <strong>${d} personnes</strong>. Combien de voyages faut-il au minimum ?`, saisie: { type: 'nombre', bonne: q + 1, unite: 'voyages' }, rep: String(q + 1), notion,
    explication: `${fmtN(A)} = ${d} × ${q} + ${R} : ${q} voyages pleins, mais il reste ${R} personne${R > 1 ? 's' : ''} sur la rive ! Il faut un voyage de plus : <strong>${q + 1} voyages</strong>. Dans un problème, il faut toujours se demander ce que veut dire le reste.` };
};

/* --- Problèmes du CM --- */
const PROBLEMES_CM = [
  { niv: 0, f: () => { const P = pick(PRENOMS), prix = rnd(12, 45) * 10 + 5, n = rnd(2, 5); return { t: `${P} achète <strong>${n} livres</strong> à <strong>${dec(prix * 10, 2)} €</strong> chacun. Combien paie-t-${il(P)} ?`, r: (prix * n) / 100, u: '€', e: `${n} fois le même prix : ${dec(prix * 10, 2)} × ${n} = <strong>${dec(prix * n * 10, 2)} €</strong>.` }; } },
  { niv: 0, f: () => { const a = rnd(120, 480) * 10, b = rnd(50, 110) * 10; return { t: `Un rouleau contient <strong>${dec(a * 10, 1)} m</strong> de tissu. La couturière en coupe <strong>${dec(b * 10, 1)} m</strong>. Combien en reste-t-il ?`, r: (a - b) / 100, u: 'm', e: `On enlève : ${dec(a * 10, 1)} − ${dec(b * 10, 1)} = <strong>${dec((a - b) * 10, 1)} m</strong>. On aligne bien les virgules.` }; } },
  { niv: 1, f: () => { const n = rnd(3, 8), billet = rnd(4, 9) * 100 + pick([0, 50]); const tot = n * billet; return { t: `Une famille de <strong>${n} personnes</strong> va au cinéma. Une place coûte <strong>${fmtEuros(billet)}</strong>. Elle paie avec un billet de <strong>${tot <= 5000 ? 50 : 100} €</strong>. Combien lui rend-on ?`, r: ((tot <= 5000 ? 5000 : 10000) - tot) / 100, u: '€', e: `Deux étapes. Le prix total : ${n} × ${fmtEuros(billet)} = ${fmtEuros(tot)}. La monnaie : ${tot <= 5000 ? 50 : 100} − ${fmtN(tot / 100, tot % 100 ? 2 : undefined)} = <strong>${fmtEuros((tot <= 5000 ? 5000 : 10000) - tot)}</strong>.` }; } },
  { niv: 1, f: () => { const j = rnd(3, 7), k = rnd(12, 35); return { t: `Un cycliste parcourt <strong>${k} km</strong> par jour pendant <strong>${j} jours</strong>, puis encore <strong>${k + 8} km</strong> le dernier jour. Quelle distance a-t-il parcourue en tout ?`, r: j * k + k + 8, u: 'km', e: `${j} × ${k} = ${j * k} km, puis ${j * k} + ${k + 8} = <strong>${j * k + k + 8} km</strong>.` }; } },
  { niv: 1, f: () => { const pers = rnd(4, 9), part = rnd(6, 15), tot = pers * part; return { t: `<strong>${pers} amis</strong> partagent équitablement une addition de <strong>${tot} €</strong>. Combien paie chacun ?`, r: part, u: '€', e: `On partage en ${pers} parts égales : ${tot} ÷ ${pers} = <strong>${part} €</strong>, car ${pers} × ${part} = ${tot}.` }; } },
  { niv: 2, f: () => { const l = rnd(8, 20), L = l + rnd(3, 12); return { t: `Un jardin rectangulaire mesure <strong>${L} m</strong> de long et <strong>${l} m</strong> de large. On veut l'entourer d'un grillage. Quelle longueur de grillage faut-il ?`, r: 2 * (L + l), u: 'm', e: `Le grillage fait le tour : c'est le périmètre. (${L} + ${l}) × 2 = <strong>${2 * (L + l)} m</strong>.` }; } },
  { niv: 2, f: () => { const prix = rnd(3, 9) * 100 + pick([20, 50, 80]), n = rnd(2, 5), m = rnd(2, 4), prix2 = rnd(1, 4) * 100 + 50; const tot = n * prix + m * prix2; return { t: `Au marché, on achète <strong>${n} kg de cerises</strong> à <strong>${fmtEuros(prix)}</strong> le kilo et <strong>${m} melons</strong> à <strong>${fmtEuros(prix2)}</strong> pièce. Combien paie-t-on ?`, r: tot / 100, u: '€', e: `Cerises : ${n} × ${fmtEuros(prix)} = ${fmtEuros(n * prix)}. Melons : ${m} × ${fmtEuros(prix2)} = ${fmtEuros(m * prix2)}. Total : <strong>${fmtEuros(tot)}</strong>.` }; } },
  { niv: 2, f: () => ({ t: 'Léonard de Vinci est né le 15 avril 1452 et il est mort le 2 mai 1519. À quel âge est-il mort ?', r: 67, u: 'ans', e: 'On cherche l\'écart entre les deux années : 1519 − 1452 = <strong>67</strong>. Il est mort en mai, après son anniversaire d\'avril : il avait donc bien <strong>67 ans</strong>.' }) },
];
GEN.cmpb = (p) => {
  const niv = p < 0.3 ? 0 : p < 0.65 ? 1 : 2;
  const P = pick(PROBLEMES_CM.filter((x) => x.niv === niv)).f();
  return { enonce: `<span class="mm-pb">${P.t}</span>`, saisie: { type: 'nombre', bonne: P.r, unite: P.u }, rep: `${fmtN(P.r)} ${P.u}`, notion: 'Résoudre des problèmes', explication: P.e, court: P.t.replace(/<[^>]+>/g, '').slice(0, 60) + '…' };
};


/* ============================================================
   CM1 – CM2 : GRANDEURS ET MESURES
   ============================================================ */
/* un pavé droit fait de petits cubes, en perspective (pour compter le volume) */
function figCubes(l, w, h) {
  const a = Math.min(34, Math.floor(190 / (l + w * 0.5)), Math.floor(150 / (h + w * 0.4))), dx = a * 0.5, dy = a * 0.4;
  const W = (l + w * 0.5) * a + 40, H = (h + w * 0.4) * a + 40, x0 = 20, y0 = 20 + w * dy;
  let s = '';
  const face = (P, c) => `<polygon points="${pts(P)}" fill="${c}" stroke="${CRAIE}" stroke-width="1.6" stroke-linejoin="round"/>`;
  /* face de devant */
  for (let k = 0; k < h; k += 1) for (let i = 0; i < l; i += 1) { const x = x0 + i * a, y = y0 + (h - 1 - k) * a; s += face([[x, y], [x + a, y], [x + a, y + a], [x, y + a]], 'rgba(255,224,102,.55)'); }
  /* dessus */
  for (let j = 0; j < w; j += 1) for (let i = 0; i < l; i += 1) { const x = x0 + i * a + j * dx, y = y0 - j * dy; s += face([[x, y], [x + a, y], [x + a + dx, y - dy], [x + dx, y - dy]], 'rgba(255,224,102,.85)'); }
  /* côté droit */
  for (let j = 0; j < w; j += 1) for (let k = 0; k < h; k += 1) { const x = x0 + l * a + j * dx, y = y0 + (h - 1 - k) * a - j * dy; s += face([[x, y], [x + dx, y - dy], [x + dx, y - dy + a], [x, y + a]], 'rgba(255,224,102,.35)'); }
  return svgArdoise(Math.max(W, 220), Math.max(H, 160), s, 'Un pavé droit fait de petits cubes');
}
/* une forme d'un seul tenant sur un quadrillage (pour l'aire par pavage) */
function formePavage(nc, nl, n) {
  const C = new Set([`${rnd(2, nc - 3)},${rnd(2, nl - 3)}`]);
  while (C.size < n) { const [c, l] = pick([...C]).split(',').map(Number), [dc, dl] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]); const x = c + dc, y = l + dl; if (x >= 0 && y >= 0 && x < nc && y < nl) C.add(`${x},${y}`); }
  const cases = [...C].map((k) => k.split(',').map(Number));
  let per = 0; cases.forEach(([c, l]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dc, dl]) => { if (!C.has(`${c + dc},${l + dl}`)) per += 1; }));
  return { cases, per };
}

/* --- Aire et périmètre --- */
GEN.cmaire = (p) => {
  const notion = 'Aire et périmètre';
  const type = pick(p < 0.4 ? [0, 0, 1, 3] : [0, 1, 2, 3, 4]);
  if (type === 0 || type === 1) {
    const F = formePavage(9, 6, rnd(5, p < 0.4 ? 9 : 13)), aire = type === 0;
    return { enonce: aire ? 'Quelle est l\'<strong>aire</strong> de cette figure, en carreaux ?' : 'Quel est le <strong>périmètre</strong> de cette figure, en côtés de carreau ?', figure: figQuadrillage(9, 6, F.cases.map(([c, l]) => [c, l, JAUNE])),
      saisie: { type: 'nombre', bonne: aire ? F.cases.length : F.per, unite: aire ? 'carreaux' : 'côtés' }, rep: String(aire ? F.cases.length : F.per), notion,
      explication: aire ? `L'<strong>aire</strong>, c'est la place occupée par la figure : on compte les carreaux à l'intérieur. Il y en a <strong>${F.cases.length}</strong>.` : `Le <strong>périmètre</strong>, c'est la longueur du tour : on compte les côtés de carreau sur le bord de la figure, en faisant tout le tour. Il y en a <strong>${F.per}</strong>. Attention : ne confonds pas avec l'aire (${F.cases.length} carreaux).` };
  }
  if (type === 2) {
    const carre = Math.random() < 0.35, a = rnd(3, 12), b = carre ? a : rnd(2, a - 1), k = Math.min(240 / a, 160 / b);
    const P = centre([[0, 0], [a * k, 0], [a * k, b * k], [0, b * k]], 320, 240);
    return { enonce: `Quelle est l'<strong>aire</strong> de ce ${carre ? 'carré' : 'rectangle'} ?`, figure: figPolygone(P, [`${a} cm`, carre ? null : `${b} cm`, null, null], { droits: [0, 1, 2, 3] }), saisie: { type: 'nombre', bonne: a * b, unite: 'cm²' }, rep: `${a * b} centimètres carrés`, notion,
      explication: carre ? `Aire du carré = côté × côté = ${a} × ${a} = <strong>${a * a} cm²</strong>. On peut y ranger ${a * a} carrés de 1 cm de côté.` : `Aire du rectangle = longueur × largeur = ${a} × ${b} = <strong>${a * b} cm²</strong> : ${b} rangées de ${a} carrés de 1 cm de côté.` };
  }
  if (type === 3) {
    const S = pick([
      ['On veut poser une clôture autour du champ.', 'perimetre', 'La clôture fait le tour du champ : c\'est le <strong>périmètre</strong>.'],
      ['On veut savoir combien de carrelage il faut pour couvrir le sol de la cuisine.', 'aire', 'Le carrelage couvre toute la surface du sol : c\'est l\'<strong>aire</strong>.'],
      ['On veut coudre un ruban tout autour d\'une nappe.', 'perimetre', 'Le ruban suit le bord de la nappe : c\'est le <strong>périmètre</strong>.'],
      ['On veut peindre un mur.', 'aire', 'La peinture couvre toute la surface du mur : c\'est l\'<strong>aire</strong>.'],
      ['On veut semer du gazon sur tout le jardin.', 'aire', 'Le gazon couvre toute la surface : c\'est l\'<strong>aire</strong>.'],
      ['On fait le tour du stade en courant.', 'perimetre', 'Faire le tour, c\'est parcourir le <strong>périmètre</strong>.'],
    ]);
    return { enonce: `${S[0]}<br>Faut-il calculer l'<strong>aire</strong> ou le <strong>périmètre</strong> ?`, choix: [{ v: 'aire', html: 'L\'aire (la surface)' }, { v: 'perimetre', html: 'Le périmètre (le tour)' }], bonne: S[1], rep: S[1] === 'aire' ? 'l\'aire' : 'le périmètre', notion, explication: S[2] };
  }
  const F = pick([
    { q: '1 m² = … dm²', r: 100, u: 'dm²', e: 'Un carré de 1 m de côté mesure 10 dm sur 10 dm : on y range 10 × 10 = <strong>100 dm²</strong>.' },
    { q: '1 dm² = … cm²', r: 100, u: 'cm²', e: 'Un carré de 1 dm de côté mesure 10 cm sur 10 cm : 10 × 10 = <strong>100 cm²</strong>.' },
    { q: '3 m² = … dm²', r: 300, u: 'dm²', e: '1 m² = 100 dm², donc 3 m² = <strong>300 dm²</strong>.' },
    { q: '500 cm² = … dm²', r: 5, u: 'dm²', e: '100 cm² = 1 dm², donc 500 cm² = <strong>5 dm²</strong>.' },
  ]);
  return { enonce: `Complète :<br><strong>${F.q.replace('…', '<span class="mm-trou">…</span>')}</strong>`, saisie: { type: 'nombre', bonne: F.r, unite: F.u }, rep: String(F.r), notion, explication: `${F.e} Pour les aires, on passe d'une unité à la suivante en multipliant par 100, et non par 10.`, court: F.q };
};

/* --- Les angles --- */
GEN.cmangle = (p) => {
  const notion = 'Les angles';
  const rot = rnd(0, 300);
  if (p < 0.5 || Math.random() < 0.4) {
    const t = pick(['aigu', 'droit', 'obtus', 'aigu', 'obtus', ...(p >= 0.3 ? ['plat'] : [])]);
    const deg = { aigu: rnd(20, 75), droit: 90, obtus: rnd(105, 165), plat: 180 }[t];
    const choix = ['aigu', 'droit', 'obtus', ...(p >= 0.3 ? ['plat'] : [])];
    return { enonce: 'Quelle est la nature de cet angle ?', figure: figAngle(deg, rot, false), figureCorrection: figAngle(deg, rot, t !== 'plat'), choix: choix.map((v) => ({ v, html: `un angle ${v}` })), bonne: t, rep: `un angle ${t}`, notion,
      explication: { aigu: 'Il est plus fermé que l\'angle droit de l\'équerre (en bleu) : c\'est un <strong>angle aigu</strong> (moins de 90°).', droit: 'Il épouse exactement le coin de l\'équerre : c\'est un <strong>angle droit</strong> (90°).', obtus: 'Il est plus ouvert que l\'angle droit, mais ses côtés ne sont pas dans le prolongement l\'un de l\'autre : c\'est un <strong>angle obtus</strong> (entre 90° et 180°).', plat: 'Ses deux côtés sont dans le prolongement l\'un de l\'autre, comme une ligne droite : c\'est un <strong>angle plat</strong> (180°).' }[t] };
  }
  const deg = pick([30, 45, 60, 90, 120, 135, 150]), opts = new Set([deg]);
  shuffle([30, 45, 60, 90, 120, 135, 150, 180].filter((x) => Math.abs(x - deg) >= 30)).forEach((x) => { if (opts.size < 4) opts.add(x); });
  return { enonce: 'Environ combien de <strong>degrés</strong> mesure cet angle ?', figure: figAngle(deg, rot, false), figureCorrection: figAngle(deg, rot, true), choix: [...opts].sort((a, b) => a - b).map((x) => ({ v: String(x), html: `${x}°` })), bonne: String(deg), rep: `${deg} degrés`, notion,
    explication: `On compare à l'angle droit de l'équerre (en bleu), qui mesure 90°. ${deg < 90 ? `L'angle est plus petit : ${deg === 45 ? 'c\'est la moitié d\'un angle droit' : deg === 30 ? 'c\'est le tiers d\'un angle droit' : 'il fait les deux tiers d\'un angle droit'}, soit <strong>${deg}°</strong>.` : deg === 90 ? 'C\'est exactement un angle droit : <strong>90°</strong>.' : `L'angle dépasse l'angle droit de ${deg - 90}° : il mesure <strong>${deg}°</strong>.`} Pour mesurer précisément, on utilise le <strong>rapporteur</strong>.`, voix: 'Environ combien de degrés mesure cet angle ?' };
};

/* --- La proportionnalité --- */
GEN.cmprop = (p) => {
  const notion = 'La proportionnalité';
  const type = pick(p < 0.4 ? [0, 1] : [0, 1, 2]);
  if (type === 0) {
    const n1 = rnd(2, 5), pu = rnd(2, 9), n2 = n1 + rnd(1, 6), obj = pick([['cahiers', '€', '1 cahier coûte'], ['baguettes', '€', '1 baguette coûte'], ['kg de pommes', '€', '1 kg de pommes coûte'], ['places de cinéma', '€', '1 place de cinéma coûte']]);
    return { enonce: `<span class="mm-pb"><strong>${n1} ${obj[0]}</strong> coûtent <strong>${n1 * pu} ${obj[1]}</strong>. Combien coûtent <strong>${n2} ${obj[0]}</strong> ?</span>`, saisie: { type: 'nombre', bonne: n2 * pu, unite: obj[1] }, rep: `${n2 * pu} euros`, notion,
      explication: `On passe par l'unité : ${obj[2]} ${n1 * pu} ÷ ${n1} = ${pu} €. Donc ${n2} ${obj[0]} coûtent ${n2} × ${pu} = <strong>${n2 * pu} €</strong>.` };
  }
  if (type === 1) {
    const S = pick([
      ['Le prix payé et le nombre de croissants achetés (tous au même prix).', true, 'Deux fois plus de croissants, c\'est deux fois plus cher : c\'est une situation de <strong>proportionnalité</strong>.'],
      ['L\'âge d\'un enfant et sa taille.', false, 'À 2 ans, on ne mesure pas la moitié de sa taille de 4 ans : la taille ne double pas quand l\'âge double. Ce n\'est <strong>pas</strong> une situation de proportionnalité.'],
      ['La quantité de farine et le nombre de crêpes, en suivant la même recette.', true, 'Pour deux fois plus de crêpes, il faut deux fois plus de farine : c\'est de la <strong>proportionnalité</strong>.'],
      ['Le nombre de tours de piste et la distance parcourue.', true, 'Chaque tour fait la même longueur : 3 tours, c\'est 3 fois plus de distance. C\'est de la <strong>proportionnalité</strong>.'],
      ['La pointure de chaussures et l\'âge d\'une personne.', false, 'La pointure ne double pas quand l\'âge double, et elle s\'arrête de grandir : ce n\'est <strong>pas</strong> de la proportionnalité.'],
      ['Le prix d\'un taxi avec une prise en charge de 4 € et la distance.', false, 'À cause des 4 € payés au départ, 2 km ne coûtent pas le double de 1 km : ce n\'est <strong>pas</strong> de la proportionnalité.'],
    ]);
    return { enonce: `Est-ce une situation de <strong>proportionnalité</strong> ?<br><span class="mm-pb">${S[0]}</span>`, choix: [{ v: 'oui', html: 'Oui' }, { v: 'non', html: 'Non' }], bonne: S[1] ? 'oui' : 'non', rep: S[1] ? 'oui' : 'non', notion, explication: S[2] };
  }
  const k = rnd(2, 9), a = rnd(2, 6), b = a + rnd(1, 5), c = b + rnd(2, 6);
  const trou = pick([1, 2]);
  const vals = [a, b, c].map((x) => x * k);
  return { enonce: `Ce tableau est un tableau de <strong>proportionnalité</strong>. Quel nombre manque ?<table class="mm-tab"><tr><td>${a}</td><td>${b}</td><td>${c}</td></tr><tr><td>${vals[0]}</td><td>${trou === 1 ? '<span class="mm-trou">?</span>' : vals[1]}</td><td>${trou === 2 ? '<span class="mm-trou">?</span>' : vals[2]}</td></tr></table>`,
    saisie: { type: 'nombre', bonne: vals[trou] }, rep: String(vals[trou]), notion, voix: `Dans ce tableau de proportionnalité, on passe de la première ligne à la deuxième en multipliant toujours par le même nombre. Quel nombre manque ?`,
    explication: `On passe de la 1re ligne à la 2e en multipliant toujours par le même nombre : ${vals[0]} ÷ ${a} = <strong>${k}</strong>. Donc ${[a, b, c][trou]} × ${k} = <strong>${vals[trou]}</strong>.` };
};

/* --- Pourcentages, échelles, vitesses (CM2) --- */
GEN.cmpct = (p) => {
  const notion = 'Pourcentages, échelles, vitesses';
  const type = pick(p < 0.4 ? [0, 0, 1] : [0, 1, 2]);
  if (type === 0) {
    const pc = pick([50, 25, 10, 75, 20]), base = pc === 25 || pc === 75 ? 4 * rnd(3, 30) : pc === 20 ? 5 * rnd(3, 30) : 10 * rnd(2, 30);
    const r = (base * pc) / 100, mot = { 50: 'la moitié', 25: 'le quart', 10: 'le dixième', 75: 'les trois quarts', 20: 'le cinquième' }[pc];
    return { enonce: `Combien font <strong>${pc} %</strong> de <strong>${base}</strong> ?`, saisie: { type: 'nombre', bonne: r }, rep: fmtN(r), notion, voix: `Combien font ${pc} pour cent de ${base} ?`,
      explication: `${pc} %, c'est ${pc} sur 100, c'est-à-dire <strong>${mot}</strong>. ${capitalize(mot)} de ${base}, c'est <strong>${fmtN(r)}</strong>.` };
  }
  if (type === 1) {
    const ech = pick([[1, 'm', 100], [2, 'm', 200], [1, 'km', 100000]]), cm = rnd(2, 15), r = cm * (ech[1] === 'km' ? 1 : ech[0]);
    return { enonce: `<span class="mm-pb">Sur un plan, <strong>1 cm</strong> représente <strong>${ech[0]} ${ech[1]}</strong> en réalité. Un chemin mesure <strong>${cm} cm</strong> sur le plan. Quelle est sa longueur réelle ?</span>`, saisie: { type: 'nombre', bonne: r, unite: ech[1] }, rep: `${r} ${UNITES_DITES[ech[1]]}`, notion,
      explication: `C'est de la proportionnalité : 1 cm sur le plan pour ${ech[0]} ${ech[1]} en vrai. ${cm} cm sur le plan, c'est ${cm} fois plus : ${cm} × ${ech[0]} = <strong>${r} ${ech[1]}</strong>.` };
  }
  const v = pick([40, 50, 60, 80, 90, 100]), h = pick([2, 3, 4]), demi = Math.random() < 0.4;
  const d = demi ? v / 2 : v * h;
  return { enonce: `<span class="mm-pb">Une voiture roule à la vitesse constante de <strong>${v} km/h</strong>. Quelle distance parcourt-elle en <strong>${demi ? 'une demi-heure' : `${h} heures`}</strong> ?</span>`, saisie: { type: 'nombre', bonne: d, unite: 'km' }, rep: `${d} kilomètres`, notion, voix: `Une voiture roule à ${v} kilomètres par heure. Quelle distance parcourt-elle en ${demi ? 'une demi-heure' : `${h} heures`} ?`,
    explication: `${v} km/h, cela veut dire ${v} km en <strong>1 heure</strong>. ${demi ? `En une demi-heure, c'est la moitié : ${v} ÷ 2 = <strong>${d} km</strong>.` : `En ${h} heures, c'est ${h} fois plus : ${h} × ${v} = <strong>${d} km</strong>.`}` };
};

/* --- Les conversions (toutes les unités) --- */
GEN.cmconv = (p) => {
  const notion = 'Les conversions';
  const fam = pick(['long', 'masse', 'cont', 'duree']);
  const U = { long: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'], masse: ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'], cont: ['kL', 'hL', 'daL', 'L', 'dL', 'cL', 'mL'] };
  if (fam === 'duree') {
    const F = pick([
      { q: '2 h 15 min = … min', r: 135, u: 'min', e: '2 h = 120 min, et 120 + 15 = <strong>135 min</strong>.' },
      { q: '1 h = … s', r: 3600, u: 's', e: '1 h = 60 min et 1 min = 60 s, donc 1 h = 60 × 60 = <strong>3 600 s</strong>.' },
      { q: '2 h 30 min = … min', r: 150, u: 'min', e: '2 h = 120 min, et 120 + 30 = <strong>150 min</strong>.' },
      { q: '1 siècle = … ans', r: 100, u: 'ans', e: 'Un siècle dure <strong>100 ans</strong>.' },
      { q: '3 jours = … h', r: 72, u: 'h', e: '1 jour = 24 h, donc 3 jours = 3 × 24 = <strong>72 h</strong>.' },
    ]);
    return { enonce: `Complète :<br><strong>${F.q.replace('…', '<span class="mm-trou">…</span>')}</strong>`, saisie: { type: 'nombre', bonne: F.r, unite: F.u }, rep: fmtN(F.r), notion, explication: F.e, court: F.q };
  }
  const L = U[fam], i = rnd(0, 5), j = Math.min(6, i + rnd(1, p < 0.5 ? 2 : 3)), versPetit = Math.random() < 0.55;
  const [de, vers] = versPetit ? [i, j] : [j, i];
  const ecart = Math.abs(j - i), facteur = 10 ** ecart;
  let x, r;
  if (versPetit) { x = p < 0.5 ? rnd(2, 40) : rnd(12, 95) / 10; r = Math.round(x * facteur * 1000) / 1000; }
  else { r = p < 0.5 ? rnd(2, 40) : rnd(12, 95) / 10; x = Math.round(r * facteur * 1000) / 1000; }
  return { enonce: `Complète :<br><strong>${fmtN(x)} ${L[de]} = <span class="mm-trou">…</span> ${L[vers]}</strong>`, saisie: { type: 'nombre', bonne: r, unite: L[vers] }, rep: `${fmtN(r)}`, notion, court: `${fmtN(x)} ${L[de]} = … ${L[vers]}`,
    voix: `Complète : ${fmtN(x)} ${L[de]} égale combien de ${L[vers]} ?`,
    explication: `Dans le tableau de conversion, de ${L[de]} à ${L[vers]}, il y a ${ecart} colonne${ecart > 1 ? 's' : ''} : on ${versPetit ? 'multiplie' : 'divise'} par ${fmtN(facteur)}. ${fmtN(x)} ${versPetit ? '×' : '÷'} ${fmtN(facteur)} = <strong>${fmtN(r)} ${L[vers]}</strong>.<table class="tab-num"><tr>${L.map((u, k) => `<th class="${k === de || k === vers ? 'on' : ''}">${u}</th>`).join('')}</tr></table>` };
};

/* --- Le volume du pavé droit (CM2) --- */
GEN.cmvol = (p) => {
  const notion = 'Le volume';
  const l = rnd(2, p < 0.5 ? 4 : 6), w = rnd(1, p < 0.5 ? 3 : 4), h = rnd(1, p < 0.5 ? 3 : 4), V = l * w * h;
  if (p >= 0.6 && Math.random() < 0.4) return { enonce: `Un pavé droit mesure <strong>${l} cm</strong> de long, <strong>${w} cm</strong> de large et <strong>${h} cm</strong> de haut. Quel est son <strong>volume</strong> ?`, saisie: { type: 'nombre', bonne: V, unite: 'cm³' }, rep: `${V} centimètres cubes`, notion,
    explication: `Volume du pavé droit = longueur × largeur × hauteur = ${l} × ${w} × ${h} = <strong>${V} cm³</strong>. On pourrait y ranger ${V} petits cubes de 1 cm de côté.` };
  return { enonce: 'Ce pavé est fait de petits cubes de 1 cm de côté. Quel est son <strong>volume</strong>, en cm³ ?', figure: figCubes(l, w, h), saisie: { type: 'nombre', bonne: V, unite: 'cm³' }, rep: `${V} centimètres cubes`, notion,
    explication: `On compte par étages. Un étage : ${l} cubes sur la longueur et ${w} rangée${w > 1 ? 's' : ''} vers l'arrière, soit ${l} × ${w} = ${l * w} cubes. Il y a ${h} étage${h > 1 ? 's' : ''} : ${l * w} × ${h} = <strong>${V} cm³</strong>. N'oublie pas les cubes cachés !` };
};


/* ============================================================
   CM1 – CM2 : ESPACE ET GÉOMÉTRIE
   ============================================================ */
/* petits traits de codage sur un côté (côtés de même longueur) */
function codage(A, B, n = 1, c = ROSE) {
  const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
  let s = '';
  for (let i = 0; i < n; i += 1) { const o = (i - (n - 1) / 2) * 6; s += `<line x1="${mx + ux * o - nx * 8}" y1="${my + uy * o - ny * 8}" x2="${mx + ux * o + nx * 8}" y2="${my + uy * o + ny * 8}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`; }
  return s;
}
/* deux droites : perpendiculaires, parallèles ou sécantes */
function figDroites(type, rot) {
  const C = [160, 115], L = 150, d = (a, o = [0, 0]) => { const r = (a * Math.PI) / 180; return [[C[0] + o[0] - L * Math.cos(r), C[1] + o[1] + L * Math.sin(r)], [C[0] + o[0] + L * Math.cos(r), C[1] + o[1] - L * Math.sin(r)]]; };
  let D1, D2, extra = '';
  if (type === 'paralleles') { const r = ((rot + 90) * Math.PI) / 180, e = 42; D1 = d(rot, [Math.cos(r) * e, -Math.sin(r) * e]); D2 = d(rot, [-Math.cos(r) * e, Math.sin(r) * e]); }
  else {
    const ang = type === 'perpendiculaires' ? 90 : pick([35, 55, 65, 120, 140]);
    D1 = d(rot); D2 = d(rot + ang);
    if (type === 'perpendiculaires') extra = marqueDroit(D1[1], C, D2[1], 14, JAUNE);
  }
  const ligne = (D, c) => `<line x1="${D[0][0]}" y1="${D[0][1]}" x2="${D[1][0]}" y2="${D[1][1]}" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>`;
  return svgArdoise(320, 230, `<clipPath id="cl-d"><rect x="6" y="6" width="308" height="218" rx="8"/></clipPath><g clip-path="url(#cl-d)">${ligne(D1, CRAIE)}${ligne(D2, BLEU)}${extra}</g>`, 'Deux droites');
}

/* --- Droites perpendiculaires et parallèles --- */
GEN.cmdroites = (p) => {
  const notion = 'Droites perpendiculaires et parallèles';
  if (p >= 0.6 && Math.random() < 0.4) {
    const F = pick([
      ['Pour tracer une droite <strong>perpendiculaire</strong> à une autre, j\'utilise…', 'l\'équerre', 'On pose un côté de l\'angle droit de <strong>l\'équerre</strong> sur la droite, et on trace le long de l\'autre côté.'],
      ['Pour vérifier que deux droites sont <strong>parallèles</strong>, je peux utiliser…', 'l\'équerre', 'Avec <strong>l\'équerre</strong> (et la règle), on vérifie que l\'écart entre les deux droites reste le même : elles sont perpendiculaires à une même troisième droite.'],
      ['Pour reporter une longueur sans la mesurer, j\'utilise…', 'le compas', 'On prend la longueur avec l\'écartement du <strong>compas</strong>, et on la reporte ailleurs.'],
    ]);
    return { enonce: F[0], choix: Object.keys(INSTRUMENTS).map((v) => ({ v, html: `${INSTRUMENTS[v]} ${capitalize(v)}` })), bonne: F[1], rep: F[1], notion, explication: F[2] };
  }
  const type = pick(['perpendiculaires', 'paralleles', 'secantes']), rot = rnd(-40, 40);
  const noms = { perpendiculaires: 'Elles sont perpendiculaires', paralleles: 'Elles sont parallèles', secantes: 'Elles sont sécantes, mais pas perpendiculaires' };
  return { enonce: 'Comment sont ces deux droites ?', figure: figDroites(type, rot), choix: Object.entries(noms).map(([v, html]) => ({ v, html })), bonne: type, rep: { perpendiculaires: 'perpendiculaires', paralleles: 'parallèles', secantes: 'sécantes' }[type], notion,
    explication: { perpendiculaires: 'Elles se coupent en formant un <strong>angle droit</strong> (le petit carré jaune) : elles sont <strong>perpendiculaires</strong>.', paralleles: 'Elles ne se coupent jamais, même si on les prolonge : l\'écart entre elles reste toujours le même. Elles sont <strong>parallèles</strong>.', secantes: 'Elles se coupent, mais l\'angle n\'est pas droit : elles sont <strong>sécantes</strong> (sécant veut dire « qui coupe »), sans être perpendiculaires.' }[type] };
};

/* --- Triangles et quadrilatères particuliers, avec leur codage --- */
const POLY_CM = {
  'un triangle équilatéral': '3 côtés de même longueur (trois traits de codage identiques)',
  'un triangle isocèle': '2 côtés de même longueur',
  'un triangle rectangle': 'un angle droit',
  'un triangle quelconque': 'ni côtés égaux, ni angle droit',
  'un carré': '4 côtés de même longueur et 4 angles droits',
  'un rectangle': '4 angles droits, et ses côtés opposés de même longueur',
  'un losange': '4 côtés de même longueur, sans angle droit',
};
GEN.cmpoly = (p) => {
  const notion = 'Triangles et quadrilatères';
  const tri = Math.random() < 0.55, nom = tri ? pick(['un triangle équilatéral', 'un triangle isocèle', 'un triangle rectangle', 'un triangle quelconque']) : pick(['un carré', 'un rectangle', 'un losange']);
  let P, cod = '', droits = [];
  if (nom === 'un triangle équilatéral') { P = pointsTriangle(6, 6, 6, 30); }
  else if (nom === 'un triangle isocèle') { const b = rnd(4, 6), c = rnd(7, 9); P = pointsTriangle(c, c, b, 24); }
  else if (nom === 'un triangle rectangle') { P = [[0, 0], [0, -rnd(110, 160)], [rnd(140, 200), 0]]; droits = [0]; }
  else if (nom === 'un triangle quelconque') { let a, b, c; do { a = rnd(5, 9); b = rnd(5, 9); c = rnd(6, 10); } while (a === b || b === c || a === c || a + b <= c + 2 || Math.abs(a * a + b * b - c * c) < 12 || Math.abs(a * a + c * c - b * b) < 12 || Math.abs(b * b + c * c - a * a) < 12); P = pointsTriangle(a, b, c, 22); }
  else if (nom === 'un carré') { const c = rnd(110, 150); P = [[0, 0], [c, 0], [c, c], [0, c]]; droits = [0, 1, 2, 3]; }
  else if (nom === 'un rectangle') { const a = rnd(170, 220), b = rnd(90, 120); P = [[0, 0], [a, 0], [a, b], [0, b]]; droits = [0, 1, 2, 3]; }
  else { const d1 = rnd(190, 230), d2 = Math.round(d1 * 0.55); P = [[d1 / 2, 0], [d1, d2 / 2], [d1 / 2, d2], [0, d2 / 2]]; }
  P = centre(tourne(P, rnd(-15, 15), 0, 0), 320, 240);
  const n = P.length, cote = (i) => [P[i], P[(i + 1) % n]];
  if (nom === 'un triangle équilatéral' || nom === 'un losange' || nom === 'un carré') for (let i = 0; i < n; i += 1) cod += codage(...cote(i), 1);
  if (nom === 'un triangle isocèle') { cod += codage(...cote(1), 1) + codage(...cote(2), 1); }
  if (nom === 'un rectangle') { cod += codage(...cote(0), 2) + codage(...cote(2), 2) + codage(...cote(1), 1) + codage(...cote(3), 1); }
  const dessin = figPolygone(P, null, { droits, couleurDroit: JAUNE }).replace('</svg>', `${cod}</svg>`);
  const noms = tri ? ['un triangle équilatéral', 'un triangle isocèle', 'un triangle rectangle', 'un triangle quelconque'] : ['un carré', 'un rectangle', 'un losange', 'un triangle isocèle'];
  return { enonce: 'Lis le <strong>codage</strong> de la figure (les traits roses sur des côtés de même longueur, les petits carrés jaunes sur les angles droits). Comment s\'appelle-t-elle ?', figure: dessin,
    choix: noms.map((v) => ({ v, html: capitalize(v) })), bonne: nom, aussi: nom === 'un carré' ? ['un rectangle', 'un losange'] : [], rep: nom, notion, voix: 'Lis le codage de la figure. Comment s\'appelle-t-elle ?',
    explication: `C'est <strong>${nom}</strong> : ${POLY_CM[nom]}. ${nom === 'un carré' ? 'Un carré est aussi un rectangle et un losange particulier, mais on donne le nom le plus précis.' : ''}` };
};

/* --- Les patrons du cube --- */
const PATRONS_OK = [
  [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]],
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [2, 2]],
  [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [3, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]], [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 1], [3, 1], [2, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [2, 2], [3, 2]],
];
const PATRONS_KO = [  /* vérifiés par un pliage simulé : aucun ne donne un cube */
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]], [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [3, 1]],
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]], [[0, 0], [1, 0], [2, 0], [3, 0], [1, 1], [2, 1]], [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1]],
  [[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [2, 0]], [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [2, 3]],
];
GEN.cmpatron = (p) => {
  const notion = 'Les patrons du cube';
  const ok = Math.random() < 0.5, P = pick(ok ? PATRONS_OK : PATRONS_KO);
  const flip = Math.random() < 0.5, mx = Math.max(...P.map((c) => c[0]));
  const cases = P.map(([x, y]) => [(flip ? mx - x : x) + 1, y + 1, JAUNE]);
  return { enonce: 'En pliant cette figure le long des traits, peut-on fabriquer un <strong>cube</strong> ?', figure: figQuadrillage(7, 5, cases), choix: [{ v: 'oui', html: 'Oui, c\'est un patron de cube' }, { v: 'non', html: 'Non, ce n\'est pas un patron de cube' }], bonne: ok ? 'oui' : 'non', rep: ok ? 'oui' : 'non', notion,
    explication: ok ? 'Oui : les 6 carrés se replient sans se chevaucher, et chaque face du cube est recouverte une seule fois. C\'est un <strong>patron du cube</strong> (il en existe 11 différents).'
      : 'Non : en pliant, deux carrés viendraient se superposer, et une face du cube resterait ouverte. Pour un patron de cube, il faut 6 carrés, jamais plus de 4 en ligne, et pas de bloc de 2 × 2 carrés.' };
};

/* --- Les axes de symétrie des figures --- */
GEN.cmsym = (p) => {
  const notion = 'Les axes de symétrie';
  const F = pick([
    ['un carré', 4, '2 axes qui passent par les milieux des côtés, et 2 axes qui sont les diagonales'],
    ['un rectangle (qui n\'est pas un carré)', 2, 'les 2 axes qui passent par les milieux des côtés opposés ; ses diagonales ne sont pas des axes'],
    ['un losange (qui n\'est pas un carré)', 2, 'ses 2 diagonales'],
    ['un triangle équilatéral', 3, 'un axe par sommet, qui passe par le milieu du côté opposé'],
    ['un triangle isocèle (qui n\'est pas équilatéral)', 1, 'l\'axe qui passe par le sommet principal et le milieu de la base'],
    ['un triangle quelconque', 0, 'aucun : on ne peut le plier nulle part pour que les deux moitiés se superposent'],
    ['un hexagone régulier', 6, '3 axes qui joignent des sommets opposés, et 3 qui joignent les milieux de côtés opposés'],
  ]);
  return { enonce: `Combien d'<strong>axes de symétrie</strong> a ${F[0]} ?`, saisie: { type: 'nombre', bonne: F[1], unite: 'axes' }, rep: String(F[1]), notion,
    explication: `${capitalize(F[0].replace(/ \(.*\)/, ''))} a <strong>${F[1]} axe${F[1] > 1 ? 's' : ''} de symétrie</strong> : ${F[2]}.` };
};

/* --- Les solides : faces, arêtes, sommets --- */
const SOLIDES_CM = {
  'un cube': { f: 6, a: 12, s: 8, d: 'cube' },
  'un pavé droit': { f: 6, a: 12, s: 8, d: 'pave' },
  'une pyramide à base carrée': { f: 5, a: 8, s: 5, d: 'pyramide' },
  'un prisme droit à base triangulaire': { f: 5, a: 9, s: 6, d: 'prisme' },
};
GEN.cmsolides = (p) => {
  const notion = 'Les solides';
  if (Math.random() < 0.3) {
    const F = pick([
      ['Les deux bases d\'un cylindre sont des…', 'disques', ['disques', 'carrés', 'triangles'], 'Le cylindre a deux bases qui sont des <strong>disques</strong>, reliées par une face courbe.'],
      ['Les faces latérales d\'un prisme droit sont des…', 'rectangles', ['rectangles', 'triangles', 'disques'], 'Les faces latérales d\'un prisme droit sont des <strong>rectangles</strong> ; ses deux bases sont des polygones identiques.'],
      ['Les faces latérales d\'une pyramide sont des…', 'triangles', ['triangles', 'rectangles', 'carrés'], 'Les faces latérales d\'une pyramide sont des <strong>triangles</strong>, qui se rejoignent au sommet.'],
    ]);
    return { enonce: F[0], choix: F[2].map((v) => ({ v, html: capitalize(v) })), bonne: F[1], rep: F[1], notion, explication: F[3] };
  }
  const nom = pick(Object.keys(SOLIDES_CM)), S = SOLIDES_CM[nom], quoi = pick(['faces', 'arêtes', 'sommets']), r = S[quoi[0] === 'a' ? 'a' : quoi[0]];
  const prisme = () => {
    const F1 = [70, 185], F2 = [170, 185], F3 = [120, 95], B1 = [160, 140], B2 = [260, 140], B3 = [210, 50];
    const vu = `stroke="${CRAIE}" stroke-width="3.5" fill="rgba(255,255,255,.07)" stroke-linejoin="round"`, cache = `stroke="${CRAIE}" stroke-width="2" stroke-dasharray="6 6" fill="none"`;
    return svgArdoise(320, 220, `<path d="M${F1} L${B1} L${B2} M${B1} L${B3}" ${cache}/><polygon points="${pts([F3, B3, B2, F2])}" ${vu}/><polygon points="${pts([F1, F2, F3])}" ${vu}/>`, 'Un prisme droit');
  };
  const fig = S.d === 'prisme'
    ? prisme()
    : figSolide(S.d);
  return { enonce: `Ce solide est <strong>${nom}</strong>. Combien a-t-il d'<strong>${quoi}</strong> ?`, figure: fig, saisie: { type: 'nombre', bonne: r, unite: quoi }, rep: `${r} ${quoi}`, notion,
    explication: `${capitalize(nom)} a ${S.f} faces, ${S.a} arêtes et ${S.s} sommets. Il a donc <strong>${r} ${quoi}</strong>. Les <strong>faces</strong> sont les surfaces planes, les <strong>arêtes</strong> les segments où deux faces se rencontrent, les <strong>sommets</strong> les pointes. Pense aux éléments cachés (en pointillés) !` };
};

/* --- Programmer les déplacements d'un lutin --- */
GEN.cmprog = (p) => {
  const notion = 'Programmer des déplacements';
  const n = 6, DIRS = [[1, 0, '→'], [0, 1, '↓'], [-1, 0, '←'], [0, -1, '↑']];
  let c, l, o, chemin, instr, ok;
  do {
    c = rnd(0, n - 1); l = rnd(0, n - 1); o = 0; chemin = [[c, l]]; instr = []; ok = true;
    const nb = p < 0.5 ? 2 : 3;
    for (let i = 0; i < nb && ok; i += 1) {
      if (i > 0) { const t = pick(['droite', 'gauche']); o = (o + (t === 'droite' ? 1 : 3)) % 4; instr.push(`tourner à ${t}`); }
      const k = rnd(1, 3);
      for (let j = 0; j < k; j += 1) { c += DIRS[o][0]; l += DIRS[o][1]; if (c < 0 || l < 0 || c >= n || l >= n) { ok = false; break; } chemin.push([c, l]); }
      instr.push(`avancer de ${k}`);
    }
  } while (!ok);
  const bonne = nomCase(c, l, n), opts = new Set([bonne]);
  [[c + 1, l], [c - 1, l], [c, l + 1], [c, l - 1], [c + 2, l], [c, l - 2]].forEach(([x, y]) => { if (opts.size < 4 && x >= 0 && y >= 0 && x < n && y < n) opts.add(nomCase(x, y, n)); });
  while (opts.size < 4) opts.add(nomCase(rnd(0, n - 1), rnd(0, n - 1), n));
  const depart = chemin[0];
  return { enonce: `Le lutin 🐱 est en <strong>${nomCase(depart[0], depart[1], n)}</strong> et regarde vers la <strong>droite</strong> →. Il suit le programme :<ol class="mm-prog">${instr.map((x) => `<li>${x}</li>`).join('')}</ol>Sur quelle case arrive-t-il ?`,
    voix: `Le lutin est en ${nomCase(depart[0], depart[1], n)} et regarde vers la droite. Il suit le programme : ${instr.join(', puis ')}. Sur quelle case arrive-t-il ?`,
    figure: figQuadrillage(n, n, [], { reperes: true, icones: [[depart[0], depart[1], '🐱']] }), figureCorrection: figQuadrillage(n, n, [], { reperes: true, icones: [[depart[0], depart[1], '🐱'], [c, l, '🏁']], chemin }),
    choix: shuffle([...opts]).map((v) => ({ v, html: v })), bonne, rep: bonne, notion,
    explication: `On suit le programme pas à pas, en se mettant à la place du lutin : « tourner à droite » ou « à gauche », c'est par rapport à <strong>sa</strong> direction, pas à la nôtre. Le lutin arrive en <strong>${bonne}</strong> (le chemin est tracé en vert).` };
};


/* ============================================================
   6e – 5e : NOMBRES ET CALCULS
   p va de 0 (niveau 6e) à 1 (niveau 5e).
   ============================================================ */
const fmtR = (x) => (x < 0 ? `(−${fmtN(-x)})` : fmtN(x));          /* un relatif dans un calcul : (−5) */
const fmtRs = (x) => (x < 0 ? `−${fmtN(-x)}` : x > 0 ? `+${fmtN(x)}` : '0');  /* avec son signe : +5, −5 */
const pgcd = (a, b) => (b ? pgcd(b, a % b) : Math.abs(a));

/* --- La priorité des opérations --- */
GEN.prio = (p) => {
  const notion = 'La priorité des opérations';
  const a = rnd(2, 12), b = rnd(2, 9), c = rnd(2, 9), d = rnd(2, 6);
  const F = pick(p < 0.4 ? [0, 1, 2] : [0, 1, 2, 3, 4, 5]);
  const modeles = [
    { e: `${a} + ${b} × ${c}`, r: a + b * c, x: `La multiplication est prioritaire : on calcule d'abord ${b} × ${c} = ${b * c}, puis ${a} + ${b * c} = <strong>${a + b * c}</strong>. (Et non ${a} + ${b} = ${a + b}, puis × ${c} !)` },
    { e: `${a * c + b} − ${a} × ${c}`, r: b, x: `D'abord la multiplication : ${a} × ${c} = ${a * c}. Puis ${a * c + b} − ${a * c} = <strong>${b}</strong>.` },
    { e: `(${a} + ${b}) × ${c}`, r: (a + b) * c, x: `Les parenthèses passent en premier : ${a} + ${b} = ${a + b}, puis ${a + b} × ${c} = <strong>${(a + b) * c}</strong>.` },
    { e: `${a * d} ÷ ${d} + ${b} × ${c}`, r: a + b * c, x: `D'abord la division et la multiplication : ${a * d} ÷ ${d} = ${a} et ${b} × ${c} = ${b * c}. Puis ${a} + ${b * c} = <strong>${a + b * c}</strong>.` },
    { e: `${a + 40} − (${b} + ${c}) × 2`, r: a + 40 - (b + c) * 2, x: `D'abord les parenthèses : ${b} + ${c} = ${b + c}. Puis la multiplication : ${b + c} × 2 = ${(b + c) * 2}. Enfin ${a + 40} − ${(b + c) * 2} = <strong>${a + 40 - (b + c) * 2}</strong>.` },
    { e: `${b} × [${c} + ${d} × (${a} − 1)]`, r: b * (c + d * (a - 1)), x: `On commence par les parenthèses les plus intérieures : ${a} − 1 = ${a - 1}. Puis dans les crochets, la multiplication d'abord : ${d} × ${a - 1} = ${d * (a - 1)}, et ${c} + ${d * (a - 1)} = ${c + d * (a - 1)}. Enfin ${b} × ${c + d * (a - 1)} = <strong>${b * (c + d * (a - 1))}</strong>.` },
  ];
  const M = modeles[F];
  return { enonce: `Calcule :<br><strong>${M.e} = ?</strong>`, saisie: { type: 'nombre', bonne: M.r, neg: M.r < 0 }, rep: fmtN(M.r), notion, court: M.e,
    explication: `${M.x}<br>L'ordre : d'abord les <strong>parenthèses</strong>, puis les <strong>multiplications et divisions</strong>, enfin les <strong>additions et soustractions</strong> (de gauche à droite).` };
};

/* --- Les critères de divisibilité --- */
GEN.divis = (p) => {
  const notion = 'Les critères de divisibilité';
  const d = pick(p < 0.4 ? [2, 5, 10, 3] : [2, 3, 5, 9, 10, 4]);
  let n = rnd(100, p < 0.5 ? 999 : 99999);
  if (Math.random() < 0.5) n = n - (n % d) || d * 37;
  const oui = n % d === 0, s = String(n).split('').map(Number), som = s.reduce((t, x) => t + x, 0), u = s[s.length - 1];
  const regle = {
    2: `Un nombre est divisible par 2 si son chiffre des unités est 0, 2, 4, 6 ou 8 (s'il est pair). Ici, le chiffre des unités est ${u}.`,
    5: `Un nombre est divisible par 5 si son chiffre des unités est 0 ou 5. Ici, c'est ${u}.`,
    10: `Un nombre est divisible par 10 si son chiffre des unités est 0. Ici, c'est ${u}.`,
    3: `Un nombre est divisible par 3 si la somme de ses chiffres est dans la table de 3. Ici : ${s.join(' + ')} = ${som}, ${som % 3 ? 'qui n\'est pas' : 'qui est'} dans la table de 3.`,
    9: `Un nombre est divisible par 9 si la somme de ses chiffres est dans la table de 9. Ici : ${s.join(' + ')} = ${som}, ${som % 9 ? 'qui n\'est pas' : 'qui est'} dans la table de 9.`,
    4: `Un nombre est divisible par 4 si le nombre formé par ses deux derniers chiffres est dans la table de 4. Ici : ${String(n).slice(-2)}, ${Number(String(n).slice(-2)) % 4 ? 'qui n\'est pas' : 'qui est'} dans la table de 4.`,
  }[d];
  return { enonce: `Le nombre <strong>${fmtN(n)}</strong> est-il <strong>divisible par ${d}</strong> ?`, choix: [{ v: 'oui', html: 'Oui' }, { v: 'non', html: 'Non' }], bonne: oui ? 'oui' : 'non', rep: oui ? 'oui' : 'non', notion,
    explication: `${regle} Donc ${fmtN(n)} <strong>${oui ? 'est' : 'n\'est pas'} divisible par ${d}</strong>${oui ? ` : ${fmtN(n)} = ${d} × ${fmtN(n / d)}` : ''}.` };
};

/* --- Les fractions (6e : quotient, fractions égales ; 5e : comparer, additionner) --- */
GEN.frac65 = (p) => {
  const notion = 'Les fractions';
  const type = pick(p < 0.4 ? [0, 1, 2] : [1, 2, 3, 4, 5]);
  if (type === 0) {
    const b = pick([2, 4, 5, 8, 10]), a = rnd(1, 4 * b);
    return { enonce: `Écris le quotient ${fracHtml(a, b)} sous forme décimale.`, saisie: { type: 'nombre', bonne: a / b }, rep: fmtN(a / b), notion, voix: `Écris le quotient ${a} sur ${b} sous forme décimale.`,
      explication: `La fraction ${fracHtml(a, b)} est le <strong>quotient</strong> de ${a} par ${b} : ${a} ÷ ${b} = <strong>${fmtN(a / b)}</strong>. C'est le nombre qui, multiplié par ${b}, donne ${a}.` };
  }
  if (type === 1) {
    const k = rnd(2, 6), a = rnd(1, 9), b = a + rnd(1, 9), g = pgcd(a, b), A = a / g, B = b / g;
    return { enonce: `Simplifie la fraction ${fracHtml(A * k, B * k)}. Quel est le numérateur de la fraction simplifiée au maximum (son dénominateur sera ${B}) ?`, saisie: { type: 'nombre', bonne: A }, rep: String(A), notion, voix: `Simplifie la fraction ${A * k} sur ${B * k}. Quel est le numérateur de la fraction simplifiée, dont le dénominateur sera ${B} ?`,
      explication: `${A * k} et ${B * k} sont tous les deux dans la table de ${k} : on divise le numérateur et le dénominateur par ${k}. ${fracHtml(A * k, B * k)} = ${fracHtml(A, B)}. Le numérateur est <strong>${A}</strong>.` };
  }
  if (type === 2) {
    const b = rnd(3, 12), a1 = rnd(1, 2 * b), a2 = rnd(1, 2 * b);
    const s = a1 < a2 ? '<' : a1 > a2 ? '>' : '=';
    const mots = { '<': 'plus petite que', '>': 'plus grande que', '=': 'égale à' };
    return { enonce: `Compare :<br>${fracHtml(a1, b)} <span class="mm-trou">…</span> ${fracHtml(a2, b)}`, choix: ['<', '>', '='].map((v) => ({ v, html: `<span class="mm-signe">${v.replace('<', '&lt;').replace('>', '&gt;')}</span> ${mots[v]}` })), bonne: s, rep: `« ${mots[s]} »`, notion, voix: `Compare ${a1} sur ${b} et ${a2} sur ${b}.`,
      explication: `Les deux fractions ont le <strong>même dénominateur</strong> (${b}) : on compare simplement les numérateurs, ${a1} et ${a2}. Donc ${fracHtml(a1, b)} ${s.replace('<', '&lt;').replace('>', '&gt;')} ${fracHtml(a2, b)}.` };
  }
  if (type === 3) {
    const b = rnd(3, 12), a1 = rnd(1, b), a2 = rnd(1, b), plus = Math.random() < 0.6 || a1 <= a2;
    const r = plus ? a1 + a2 : a1 - a2;
    return { enonce: `Calcule : ${fracHtml(a1, b)} ${plus ? '+' : '−'} ${fracHtml(a2, b)} = ${fracHtml('?', b)}<br>Quel est le numérateur ?`, saisie: { type: 'nombre', bonne: r }, rep: String(r), notion, voix: `Calcule ${a1} sur ${b} ${plus ? 'plus' : 'moins'} ${a2} sur ${b}. Quel est le numérateur du résultat, sur ${b} ?`,
      explication: `Même dénominateur : on ${plus ? 'additionne' : 'soustrait'} les numérateurs et on garde le dénominateur. ${fracHtml(a1, b)} ${plus ? '+' : '−'} ${fracHtml(a2, b)} = ${fracHtml(`${a1} ${plus ? '+' : '−'} ${a2}`, b)} = ${fracHtml(r, b)}. Le numérateur est <strong>${r}</strong>.` };
  }
  if (type === 4) {
    const b = pick([2, 3, 4, 5]), k = pick([2, 3]), B = b * k, a1 = rnd(1, b), a2 = rnd(1, B), r = a1 * k + a2;
    return { enonce: `Calcule : ${fracHtml(a1, b)} + ${fracHtml(a2, B)} = ${fracHtml('?', B)}<br>Quel est le numérateur ?`, saisie: { type: 'nombre', bonne: r }, rep: String(r), notion, voix: `Calcule ${a1} sur ${b} plus ${a2} sur ${B}. Quel est le numérateur du résultat, sur ${B} ?`,
      explication: `Les dénominateurs sont différents : on écrit d'abord ${fracHtml(a1, b)} avec le dénominateur ${B}, en multipliant en haut et en bas par ${k} : ${fracHtml(a1, b)} = ${fracHtml(a1 * k, B)}. Puis ${fracHtml(a1 * k, B)} + ${fracHtml(a2, B)} = ${fracHtml(r, B)}. Le numérateur est <strong>${r}</strong>.` };
  }
  const d = pick([3, 4, 5, 6, 8, 10]), n = rnd(1, d - 1), q = d * rnd(2, 15);
  return { enonce: `Calcule ${fracHtml(n, d)} de <strong>${q}</strong>.`, saisie: { type: 'nombre', bonne: (q / d) * n }, rep: fmtN((q / d) * n), notion, voix: `Calcule ${fracMots(n, d)} de ${q}.`,
    explication: `Prendre ${fracHtml(n, d)} de ${q}, c'est multiplier : ${fracHtml(n, d)} × ${q} = ${q} ÷ ${d} × ${n} = ${q / d} × ${n} = <strong>${fmtN((q / d) * n)}</strong>.` };
};

/* --- Les nombres relatifs (5e) --- */
GEN.rel = (p) => {
  const notion = 'Les nombres relatifs';
  const a = rnd(-15, 15) || 3, b = rnd(-15, 15) || -4;
  const type = pick(p < 0.3 ? [0, 0, 1] : [0, 1, 2, 3]);
  if (type === 0) {
    const s = a < b ? '<' : a > b ? '>' : '=';
    const mots = { '<': 'plus petit que', '>': 'plus grand que', '=': 'égal à' };
    return { enonce: `Compare :<br><strong>${fmtRs(a).replace('+', '')}</strong> <span class="mm-trou">…</span> <strong>${fmtRs(b).replace('+', '')}</strong>`, choix: ['<', '>', '='].map((v) => ({ v, html: `<span class="mm-signe">${v.replace('<', '&lt;').replace('>', '&gt;')}</span> ${mots[v]}` })), bonne: s, rep: `« ${mots[s]} »`, notion,
      voix: `Compare ${a < 0 ? 'moins ' + -a : a} et ${b < 0 ? 'moins ' + -b : b}.`,
      explication: `Sur une droite graduée, le plus petit est le plus à gauche. ${a < 0 && b < 0 ? `Les deux sont négatifs : le plus petit est celui qui est le plus loin de zéro. ` : a * b < 0 ? 'Un nombre négatif est toujours plus petit qu\'un nombre positif. ' : ''}Donc <strong>${fmtRs(a).replace('+', '')} ${s.replace('<', '&lt;').replace('>', '&gt;')} ${fmtRs(b).replace('+', '')}</strong>.` };
  }
  if (type === 1) {
    const r = a + b;
    let x;
    if (a * b > 0) x = `Les deux nombres ont le même signe (${a > 0 ? 'positifs' : 'négatifs'}) : on additionne les distances à zéro (${Math.abs(a)} + ${Math.abs(b)} = ${Math.abs(r)}) et on garde le signe : <strong>${fmtN(r)}</strong>.`;
    else x = `Les deux nombres ont des signes contraires : on soustrait les distances à zéro (${Math.max(Math.abs(a), Math.abs(b))} − ${Math.min(Math.abs(a), Math.abs(b))} = ${Math.abs(r)}) et on prend le signe de celui qui est le plus loin de zéro : <strong>${fmtN(r)}</strong>.`;
    return { enonce: `Calcule :<br><strong>${fmtR(a)} + ${fmtR(b)} = ?</strong>`, saisie: { type: 'nombre', bonne: r, neg: true }, rep: fmtN(r), notion, court: `${fmtR(a)} + ${fmtR(b)}`, voix: `Calcule ${a < 0 ? 'moins ' + -a : a} plus ${b < 0 ? 'moins ' + -b : b}.`, explication: x };
  }
  if (type === 2) {
    const r = a - b;
    return { enonce: `Calcule :<br><strong>${fmtR(a)} − ${fmtR(b)} = ?</strong>`, saisie: { type: 'nombre', bonne: r, neg: true }, rep: fmtN(r), notion, court: `${fmtR(a)} − ${fmtR(b)}`, voix: `Calcule ${a < 0 ? 'moins ' + -a : a} moins ${b < 0 ? 'moins ' + -b : b}.`,
      explication: `Soustraire un nombre, c'est <strong>ajouter son opposé</strong> : ${fmtR(a)} − ${fmtR(b)} = ${fmtR(a)} + ${fmtR(-b)} = <strong>${fmtN(r)}</strong>.` };
  }
  const t1 = rnd(-12, 8), dt = rnd(3, 15), monte = Math.random() < 0.5, t2 = monte ? t1 + dt : t1 - dt;
  return { enonce: `<span class="mm-pb">Le matin, il fait <strong>${fmtN(t1)} °C</strong>. Dans la journée, la température ${monte ? 'monte' : 'baisse'} de <strong>${dt} °C</strong>. Quelle température fait-il alors ?</span>`, saisie: { type: 'nombre', bonne: t2, unite: '°C', neg: true }, rep: `${fmtN(t2)} degrés`, notion,
    voix: `Le matin, il fait ${t1 < 0 ? 'moins ' + -t1 : t1} degrés. La température ${monte ? 'monte' : 'baisse'} de ${dt} degrés. Quelle température fait-il alors ?`,
    explication: `${fmtR(t1)} ${monte ? '+' : '−'} ${dt} = <strong>${fmtN(t2)} °C</strong>. Sur le thermomètre, on ${monte ? 'monte' : 'descend'} de ${dt} graduations à partir de ${fmtN(t1)}.` };
};

/* --- Le calcul littéral (5e) --- */
GEN.litt = (p) => {
  const notion = 'Le calcul littéral';
  const type = pick(p < 0.4 ? [0, 0, 1] : [0, 1, 2, 3]);
  const x = rnd(1, 9), a = rnd(2, 9), b = rnd(1, 12);
  if (type === 0) {
    const M = pick([
      { e: `${a}x + ${b}`, r: a * x + b, x: `${a} × ${x} + ${b} = ${a * x} + ${b}` },
      { e: `${a}(x + ${b})`, r: a * (x + b), x: `${a} × (${x} + ${b}) = ${a} × ${x + b}` },
      { e: `x² + ${b}`, r: x * x + b, x: `${x} × ${x} + ${b} = ${x * x} + ${b}` },
      { e: `${a * 10} − ${a}x`, r: a * 10 - a * x, x: `${a * 10} − ${a} × ${x} = ${a * 10} − ${a * x}` },
    ]);
    return { enonce: `Calcule l'expression <strong>${M.e}</strong> pour <strong>x = ${x}</strong>.`, saisie: { type: 'nombre', bonne: M.r, neg: M.r < 0 }, rep: fmtN(M.r), notion, court: `${M.e} pour x = ${x}`,
      voix: `Calcule l'expression ${M.e.replace(/(\d)x/g, '$1 x').replace('x²', 'x au carré')} pour x égale ${x}.`,
      explication: `On <strong>remplace</strong> x par ${x}. Attention : ${a}x veut dire ${a} × x. ${M.x} = <strong>${fmtN(M.r)}</strong>.` };
  }
  if (type === 1) {
    const vrai = Math.random() < 0.5, y = vrai ? x : x + pick([1, -1, 2]);
    const g = a * y + b, d = a * x + b;
    return { enonce: `L'égalité <strong>${a}x + ${b} = ${d}</strong> est-elle vraie pour <strong>x = ${y}</strong> ?`, choix: [{ v: 'oui', html: 'Oui, elle est vraie' }, { v: 'non', html: 'Non, elle est fausse' }], bonne: g === d ? 'oui' : 'non', rep: g === d ? 'oui' : 'non', notion,
      voix: `L'égalité ${a} x plus ${b} égale ${d} est-elle vraie pour x égale ${y} ?`,
      explication: `On calcule le membre de gauche pour x = ${y} : ${a} × ${y} + ${b} = ${g}. ${g === d ? `On trouve bien ${d} : l'égalité est <strong>vraie</strong>.` : `On trouve ${g}, et non ${d} : l'égalité est <strong>fausse</strong> pour x = ${y}.`}` };
  }
  if (type === 2) {
    const c = rnd(2, 9), s = Math.random() < 0.6;
    const r = s ? a + c : a - c;
    return { enonce: `Réduis l'expression <strong>${a}x ${s ? '+' : '−'} ${c}x</strong>. Combien de x obtient-on ?`, saisie: { type: 'nombre', bonne: r, unite: 'x', neg: true }, rep: `${fmtN(r)} x`, notion, voix: `Réduis l'expression ${a} x ${s ? 'plus' : 'moins'} ${c} x.`,
      explication: `${a}x ${s ? '+' : '−'} ${c}x, c'est ${a} fois x ${s ? 'plus' : 'moins'} ${c} fois x : (${a} ${s ? '+' : '−'} ${c}) × x = <strong>${fmtN(r)}x</strong>. On ne peut réduire que les termes de même nature (des x avec des x).` };
  }
  const k = rnd(2, 9);
  return { enonce: `Quelle expression est égale à <strong>${k} × x</strong> ?`, choix: shuffle([`${k}x`, `${k} + x`, `${k}x²`, `${k + 1}x`]).map((v) => ({ v, html: v })), bonne: `${k}x`, rep: `${k} x`, notion, voix: `Quelle expression est égale à ${k} fois x ?`,
    explication: `On peut supprimer le signe × entre un nombre et une lettre : ${k} × x s'écrit <strong>${k}x</strong>. Attention : ${k}x² veut dire ${k} × x × x, et ce n'est pas la même chose.` };
};


/* ============================================================
   6e – 5e : GRANDEURS ET MESURES
   Pour π, on prend 3,14 ; une réponse arrondie au dixième est acceptée (saisie.tol).
   ============================================================ */
const arr1 = (x) => Math.round(x * 10) / 10;

/* --- Le cercle : longueur et aire --- */
GEN.cercle65 = (p) => {
  const notion = 'Le cercle et le disque';
  const R = rnd(1, 10), diam = Math.random() < 0.3;
  const type = pick(p < 0.5 ? [0, 0, 1] : [0, 1, 1]);
  const donnee = diam ? `de <strong>diamètre ${2 * R} cm</strong>` : `de <strong>rayon ${R} cm</strong>`;
  if (type === 0) {
    const L = 2 * 3.14 * R;
    return { enonce: `Quelle est la <strong>longueur</strong> (le périmètre) d'un cercle ${donnee} ? Prends π ≈ 3,14.`, figure: figCercle(diam ? 'diametre' : 'rayon', 20), saisie: { type: 'nombre', bonne: arr1(L), unite: 'cm', tol: 0.051 }, rep: `${fmtN(arr1(L))} centimètres`, notion,
      voix: `Quelle est la longueur d'un cercle de ${diam ? 'diamètre' : 'rayon'} ${diam ? 2 * R : R} centimètres ? Prends pi environ égal à 3,14.`,
      explication: `Longueur du cercle = <strong>2 × π × R</strong> (ou π × diamètre). ${diam ? `Le rayon est la moitié du diamètre : R = ${R} cm. ` : ''}2 × 3,14 × ${R} = <strong>${fmtN(arr1(L))} cm</strong> environ.` };
  }
  const A = 3.14 * R * R;
  return { enonce: `Quelle est l'<strong>aire</strong> d'un disque ${donnee} ? Prends π ≈ 3,14.`, figure: figCercle(diam ? 'diametre' : 'rayon', 20), saisie: { type: 'nombre', bonne: arr1(A), unite: 'cm²', tol: 0.051 }, rep: `${fmtN(arr1(A))} centimètres carrés`, notion,
    voix: `Quelle est l'aire d'un disque de ${diam ? 'diamètre' : 'rayon'} ${diam ? 2 * R : R} centimètres ? Prends pi environ égal à 3,14.`,
    explication: `Aire du disque = <strong>π × R × R</strong> (π × R²). ${diam ? `Attention, on utilise le rayon : R = ${2 * R} ÷ 2 = ${R} cm. ` : ''}3,14 × ${R} × ${R} = 3,14 × ${R * R} = <strong>${fmtN(arr1(A))} cm²</strong> environ.` };
};

/* --- Les aires : triangle, parallélogramme --- */
GEN.aires65 = (p) => {
  const notion = 'Les aires';
  const type = pick(p < 0.4 ? ['tr', 'trq'] : ['tr', 'trq', 'para', 'para']);
  if (type === 'tr') {
    const a = rnd(3, 12), b = rnd(2, 10), k = Math.min(230 / a, 160 / b);
    const P = centre([[0, 0], [a * k, 0], [0, -b * k]], 320, 240);
    return { enonce: 'Quelle est l\'<strong>aire</strong> de ce triangle rectangle ?', figure: figPolygone(P, [`${a} cm`, null, `${b} cm`], { droits: [0] }), saisie: { type: 'nombre', bonne: (a * b) / 2, unite: 'cm²' }, rep: `${fmtN((a * b) / 2)} centimètres carrés`, notion,
      explication: `Un triangle rectangle est la moitié d'un rectangle de ${a} cm sur ${b} cm. Aire = ${a} × ${b} ÷ 2 = ${a * b} ÷ 2 = <strong>${fmtN((a * b) / 2)} cm²</strong>.` };
  }
  if (type === 'trq') {
    const base = rnd(4, 12), h = rnd(3, 9), dec = rnd(1, base - 1), k = Math.min(230 / base, 150 / h);
    const P = centre([[0, 0], [base * k, 0], [dec * k, -h * k]], 320, 240), H = [dec * k + P[0][0], P[0][1]];
    const fig = figPolygone(P, [`${base} cm`, null, null]).replace('</svg>', `<line x1="${P[2][0]}" y1="${P[2][1]}" x2="${H[0]}" y2="${H[1]}" stroke="${BLEU}" stroke-width="2.5" stroke-dasharray="6 5"/>${marqueDroit([H[0] + 20, H[1]], H, P[2], 10, BLEU)}${txt((P[2][0] + H[0]) / 2 + 26, (P[2][1] + H[1]) / 2, `${h} cm`, { taille: 15, gras: true, c: BLEU })}</svg>`);
    return { enonce: 'Quelle est l\'<strong>aire</strong> de ce triangle ? La hauteur est en pointillés bleus.', figure: fig, saisie: { type: 'nombre', bonne: (base * h) / 2, unite: 'cm²' }, rep: `${fmtN((base * h) / 2)} centimètres carrés`, notion,
      explication: `Aire du triangle = <strong>base × hauteur ÷ 2</strong> = ${base} × ${h} ÷ 2 = ${base * h} ÷ 2 = <strong>${fmtN((base * h) / 2)} cm²</strong>. La hauteur est perpendiculaire à la base.` };
  }
  const base = rnd(4, 10), h = rnd(3, 7), dec = rnd(2, 4), k = Math.min(200 / (base + dec), 150 / h);
  const P = centre([[0, 0], [base * k, 0], [(base + dec) * k, -h * k], [dec * k, -h * k]], 320, 240), H = [P[3][0], P[0][1]];
  const fig = figPolygone(P, [`${base} cm`, null, null, null]).replace('</svg>', `<line x1="${P[3][0]}" y1="${P[3][1]}" x2="${H[0]}" y2="${H[1]}" stroke="${BLEU}" stroke-width="2.5" stroke-dasharray="6 5"/>${txt(H[0] - 26, (P[3][1] + H[1]) / 2, `${h} cm`, { taille: 15, gras: true, c: BLEU })}</svg>`);
  return { enonce: 'Quelle est l\'<strong>aire</strong> de ce parallélogramme ? La hauteur est en pointillés bleus.', figure: fig, saisie: { type: 'nombre', bonne: base * h, unite: 'cm²' }, rep: `${base * h} centimètres carrés`, notion,
    explication: `Aire du parallélogramme = <strong>base × hauteur</strong> = ${base} × ${h} = <strong>${base * h} cm²</strong>. Si l'on découpe le triangle d'un côté pour le recoller de l'autre, on obtient un rectangle de ${base} cm sur ${h} cm.` };
};

/* --- Les volumes --- */
GEN.vol65 = (p) => {
  const notion = 'Les volumes';
  const type = pick(p < 0.4 ? [0, 1, 2] : [1, 2, 3, 4]);
  if (type === 0) {
    const c = rnd(2, 10);
    return { enonce: `Quel est le volume d'un <strong>cube</strong> de <strong>${c} cm</strong> d'arête ?`, saisie: { type: 'nombre', bonne: c ** 3, unite: 'cm³' }, rep: `${fmtN(c ** 3)} centimètres cubes`, notion,
      explication: `Volume du cube = arête × arête × arête = ${c} × ${c} × ${c} = <strong>${fmtN(c ** 3)} cm³</strong>.` };
  }
  if (type === 1) {
    const l = rnd(2, 12), w = rnd(2, 8), h = rnd(2, 10);
    return { enonce: `Quel est le volume d'un <strong>pavé droit</strong> de ${l} cm sur ${w} cm sur ${h} cm ?`, figure: figSolide('pave'), saisie: { type: 'nombre', bonne: l * w * h, unite: 'cm³' }, rep: `${fmtN(l * w * h)} centimètres cubes`, notion,
      explication: `Volume du pavé droit = longueur × largeur × hauteur = ${l} × ${w} × ${h} = <strong>${fmtN(l * w * h)} cm³</strong>.` };
  }
  if (type === 2) {
    const F = pick([
      { q: '1 L = … dm³', r: 1, u: 'dm³', e: '<strong>1 L = 1 dm³</strong> : un litre remplit exactement un cube de 10 cm d\'arête.' },
      { q: '1 dm³ = … cm³', r: 1000, u: 'cm³', e: 'Un cube de 1 dm d\'arête mesure 10 cm × 10 cm × 10 cm = <strong>1 000 cm³</strong>.' },
      { q: '1 cm³ = … mL', r: 1, u: 'mL', e: '<strong>1 cm³ = 1 mL</strong> (car 1 L = 1 dm³ = 1 000 cm³ = 1 000 mL).' },
      { q: '1 m³ = … L', r: 1000, u: 'L', e: '1 m³ = 1 000 dm³ = <strong>1 000 L</strong>.' },
      { q: '2,5 L = … cm³', r: 2500, u: 'cm³', e: '1 L = 1 dm³ = 1 000 cm³, donc 2,5 L = <strong>2 500 cm³</strong>.' },
    ]);
    return { enonce: `Complète :<br><strong>${F.q.replace('…', '<span class="mm-trou">…</span>')}</strong>`, saisie: { type: 'nombre', bonne: F.r, unite: F.u }, rep: fmtN(F.r), notion, explication: F.e, court: F.q };
  }
  if (type === 3) {
    const b = rnd(2, 8), hb = rnd(2, 6), H = rnd(3, 12), Ab = (b * hb) / 2;
    return { enonce: `Un <strong>prisme droit</strong> a pour base un triangle d'aire <strong>${fmtN(Ab)} cm²</strong> et pour hauteur <strong>${H} cm</strong>. Quel est son volume ?`, saisie: { type: 'nombre', bonne: Ab * H, unite: 'cm³' }, rep: `${fmtN(Ab * H)} centimètres cubes`, notion,
      explication: `Volume d'un prisme droit = <strong>aire de la base × hauteur</strong> = ${fmtN(Ab)} × ${H} = <strong>${fmtN(Ab * H)} cm³</strong>.` };
  }
  const R = rnd(1, 5), H = rnd(2, 10), V = arr1(3.14 * R * R * H);
  return { enonce: `Quel est le volume d'un <strong>cylindre</strong> de rayon <strong>${R} cm</strong> et de hauteur <strong>${H} cm</strong> ? Prends π ≈ 3,14.`, figure: figSolide('cylindre'), saisie: { type: 'nombre', bonne: V, unite: 'cm³', tol: 0.051 }, rep: `${fmtN(V)} centimètres cubes`, notion,
    explication: `Volume du cylindre = aire de la base × hauteur = π × R × R × H = 3,14 × ${R} × ${R} × ${H} = <strong>${fmtN(V)} cm³</strong> environ.` };
};

/* --- Proportionnalité et pourcentages --- */
GEN.prop65 = (p) => {
  const notion = 'Proportionnalité et pourcentages';
  const type = pick(p < 0.4 ? [0, 1, 2] : [1, 2, 3, 4]);
  if (type === 0) {
    const k = pick([1.5, 2, 2.5, 3, 4, 0.5]), a = rnd(2, 8) * 2;
    return { enonce: `Dans ce tableau de proportionnalité, par quel nombre multiplie-t-on la 1re ligne pour obtenir la 2e ? (C'est le <strong>coefficient de proportionnalité</strong>.)<table class="mm-tab"><tr><td>${a}</td><td>${a + 2}</td><td>${a + 6}</td></tr><tr><td>${fmtN(a * k)}</td><td>${fmtN((a + 2) * k)}</td><td>${fmtN((a + 6) * k)}</td></tr></table>`,
      saisie: { type: 'nombre', bonne: k }, rep: fmtN(k), notion, voix: 'Dans ce tableau de proportionnalité, par quel nombre multiplie-t-on la première ligne pour obtenir la deuxième ?',
      explication: `On divise un nombre de la 2e ligne par celui qui est au-dessus : ${fmtN(a * k)} ÷ ${a} = <strong>${fmtN(k)}</strong>. Vérification : ${a + 2} × ${fmtN(k)} = ${fmtN((a + 2) * k)}.` };
  }
  if (type === 1) {
    const pc = pick([10, 20, 15, 30, 5, 40]), prix = 10 * rnd(2, 30), r = (prix * pc) / 100;
    return { enonce: `Combien font <strong>${pc} %</strong> de <strong>${prix} €</strong> ?`, saisie: { type: 'nombre', bonne: r, unite: '€' }, rep: fmtEuros(Math.round(r * 100)), notion, voix: `Combien font ${pc} pour cent de ${prix} euros ?`,
      explication: `${pc} % de ${prix}, c'est ${prix} × ${pc} ÷ 100 = <strong>${fmtN(r)} €</strong>. Astuce : 10 % de ${prix}, c'est ${fmtN(prix / 10)} ; ${pc === 5 ? '5 %, c\'en est la moitié' : `${pc} %, c'est ${fmtN(pc / 10)} fois plus`}.` };
  }
  if (type === 2) {
    const pc = pick([10, 20, 25, 50]), prix = 4 * 10 * rnd(2, 15), rem = (prix * pc) / 100;
    return { enonce: `<span class="mm-pb">Un jeu coûte <strong>${prix} €</strong>. Pendant les soldes, il est réduit de <strong>${pc} %</strong>. Quel est son nouveau prix ?</span>`, saisie: { type: 'nombre', bonne: prix - rem, unite: '€' }, rep: fmtEuros(Math.round((prix - rem) * 100)), notion, voix: `Un jeu coûte ${prix} euros. Il est réduit de ${pc} pour cent. Quel est son nouveau prix ?`,
      explication: `La réduction : ${pc} % de ${prix} = ${prix} × ${pc} ÷ 100 = ${fmtN(rem)} €. Le nouveau prix : ${prix} − ${fmtN(rem)} = <strong>${fmtN(prix - rem)} €</strong>.` };
  }
  if (type === 3) {
    /* quatrième proportionnelle */
    const a = rnd(2, 9), k = rnd(2, 9), c = a * rnd(2, 5), b = a * k, r = c * k;
    return { enonce: `<span class="mm-pb">Pour <strong>${a} personnes</strong>, il faut <strong>${b} g</strong> de chocolat. Combien en faut-il pour <strong>${c} personnes</strong> ?</span>`, saisie: { type: 'nombre', bonne: r, unite: 'g' }, rep: `${r} grammes`, notion,
      explication: `C'est une situation de proportionnalité. ${c} personnes, c'est ${c / a} fois plus que ${a} : ${b} × ${c / a} = <strong>${r} g</strong>. On peut aussi faire le produit en croix : ${b} × ${c} ÷ ${a} = ${r}.` };
  }
  const g = rnd(2, 5), f = rnd(1, 5) || 1, tot = (g + f) * rnd(2, 6), parts = tot / (g + f);
  return { enonce: `<span class="mm-pb">Dans une classe de <strong>${tot} élèves</strong>, le ratio garçons : filles est de <strong>${g} : ${f}</strong>. Combien y a-t-il de garçons ?</span>`, saisie: { type: 'nombre', bonne: g * parts, unite: 'garçons' }, rep: String(g * parts), notion, voix: `Dans une classe de ${tot} élèves, il y a ${g} garçons pour ${f} filles. Combien y a-t-il de garçons ?`,
    explication: `Le ratio ${g} : ${f} veut dire ${g} garçons pour ${f} filles, soit des groupes de ${g + f} élèves. Il y a ${tot} ÷ ${g + f} = ${parts} groupes, donc ${g} × ${parts} = <strong>${g * parts} garçons</strong>.` };
};

/* --- Statistiques --- */
GEN.stat = (p) => {
  const notion = 'Les statistiques';
  const n = rnd(5, 7), notes = Array.from({ length: n }, () => rnd(6, 18));
  const reste = notes.reduce((t, x) => t + x, 0) % n; if (reste) notes[0] += n - reste;   /* la moyenne tombe juste */
  if (notes[0] > 20) notes[0] -= n;
  const moy = notes.reduce((t, x) => t + x, 0) / n;
  const type = pick(p < 0.4 ? [0, 1] : [0, 1, 2]);
  const tab = `<table class="mm-tab"><tr>${notes.map((_, i) => `<td>${['Ali', 'Bea', 'Cléo', 'Dan', 'Eva', 'Félix', 'Gina'][i]}</td>`).join('')}</tr><tr>${notes.map((x) => `<td>${x}</td>`).join('')}</tr></table>`;
  if (type === 0) return { enonce: `Voici les notes de ${n} élèves.${tab}Quelle est la <strong>moyenne</strong> de ces notes ?`, saisie: { type: 'nombre', bonne: moy }, rep: fmtN(moy), notion, voix: `Voici les notes de ${n} élèves : ${notes.join(', ')}. Quelle est la moyenne de ces notes ?`,
    explication: `Moyenne = <strong>somme des valeurs ÷ nombre de valeurs</strong>. Somme : ${notes.join(' + ')} = ${moy * n}. Moyenne : ${moy * n} ÷ ${n} = <strong>${fmtN(moy)}</strong>.` };
  const couleurs = ['rouge', 'bleu', 'vert', 'jaune'], eff = couleurs.map(() => rnd(1, 9)), tot = eff.reduce((t, x) => t + x, 0);
  const tab2 = `<table class="mm-tab"><tr><td>couleur préférée</td>${couleurs.map((c) => `<td>${c}</td>`).join('')}</tr><tr><td>effectif</td>${eff.map((x) => `<td>${x}</td>`).join('')}</tr></table>`;
  const i = rnd(0, 3);
  if (type === 1) return { enonce: `On a demandé leur couleur préférée à des élèves.${tab2}Combien d'élèves ont été interrogés en tout (l'<strong>effectif total</strong>) ?`, saisie: { type: 'nombre', bonne: tot, unite: 'élèves' }, rep: String(tot), notion, voix: `On a demandé leur couleur préférée à des élèves. Rouge : ${eff[0]}, bleu : ${eff[1]}, vert : ${eff[2]}, jaune : ${eff[3]}. Combien d'élèves ont été interrogés en tout ?`,
    explication: `L'effectif total est la somme des effectifs : ${eff.join(' + ')} = <strong>${tot}</strong>.` };
  /* fréquence : on choisit un total de 20, 25 ou 50 pour un pourcentage juste */
  const T = pick([20, 25, 50]), e2 = [rnd(2, T / 3), rnd(2, T / 3), rnd(2, T / 4)]; e2.push(T - e2.reduce((t, x) => t + x, 0));
  const tab3 = `<table class="mm-tab"><tr><td>couleur préférée</td>${couleurs.map((c) => `<td>${c}</td>`).join('')}</tr><tr><td>effectif</td>${e2.map((x) => `<td>${x}</td>`).join('')}</tr></table>`;
  const f = (e2[i] / T) * 100;
  return { enonce: `${tab3}Quelle est la <strong>fréquence</strong> de la couleur ${couleurs[i]}, en pourcentage ?`, saisie: { type: 'nombre', bonne: f, unite: '%' }, rep: `${fmtN(f)} pour cent`, notion, voix: `Rouge : ${e2[0]}, bleu : ${e2[1]}, vert : ${e2[2]}, jaune : ${e2[3]}. Quelle est la fréquence de la couleur ${couleurs[i]}, en pourcentage ?`,
    explication: `Fréquence = effectif ÷ effectif total = ${e2[i]} ÷ ${T} = ${fmtN(e2[i] / T)}, c'est-à-dire <strong>${fmtN(f)} %</strong> (on multiplie par 100).` };
};

/* --- Les probabilités --- */
function figUrne(boules) {
  const cs = { rouge: ROUGE, bleue: BLEU, verte: VERT, jaune: JAUNE };
  let s = `<path d="M60 40 Q40 200 160 205 Q280 200 260 40" fill="rgba(255,255,255,.05)" stroke="${CRAIE}" stroke-width="3.5"/><line x1="50" y1="40" x2="270" y2="40" stroke="${CRAIE}" stroke-width="3.5"/>`;
  const L = []; Object.entries(boules).forEach(([c, n]) => { for (let i = 0; i < n; i += 1) L.push(c); });
  shuffle(L).forEach((c, i) => { const col = i % 6, lig = Math.floor(i / 6); s += `<circle cx="${95 + col * 27 + (lig % 2) * 12}" cy="${180 - lig * 26}" r="12" fill="${cs[c]}" stroke="${CRAIE}" stroke-width="1.5"/>`; });
  return svgArdoise(320, 220, s, 'Une urne avec des boules');
}
GEN.proba = (p) => {
  const notion = 'Les probabilités';
  if (Math.random() < 0.3) {
    const E = pick([
      ['Obtenir 7 en lançant un dé ordinaire à 6 faces.', 'impossible', 'Un dé ordinaire a les faces 1 à 6 : obtenir 7 est <strong>impossible</strong>, sa probabilité est 0.'],
      ['Obtenir un nombre plus petit que 10 en lançant un dé à 6 faces.', 'certain', 'Toutes les faces (1 à 6) sont plus petites que 10 : c\'est <strong>certain</strong>, la probabilité est 1.'],
      ['Obtenir « pile » en lançant une pièce.', 'une chance sur deux', 'Deux issues, pile ou face, aussi probables l\'une que l\'autre : <strong>une chance sur deux</strong>, 1/2.'],
      ['Obtenir 6 en lançant un dé à 6 faces.', 'peu probable', 'Une seule face sur six : c\'est <strong>peu probable</strong> (1/6), mais possible.'],
      ['Tirer une boule rouge dans un sac qui contient 9 boules rouges et 1 bleue.', 'très probable', 'Neuf boules sur dix sont rouges : c\'est <strong>très probable</strong> (9/10).'],
    ]);
    return { enonce: `<span class="mm-pb">${E[0]}</span>Cet événement est…`, choix: ['impossible', 'peu probable', 'une chance sur deux', 'très probable', 'certain'].map((v) => ({ v, html: capitalize(v) })), bonne: E[1], rep: E[1], notion, explication: E[2] };
  }
  const b = { rouge: rnd(1, 5), bleue: rnd(1, 5), verte: rnd(0, 4) };
  if (!b.verte) delete b.verte;
  const tot = Object.values(b).reduce((t, x) => t + x, 0), c = pick(Object.keys(b)), n = b[c];
  const opts = new Set([`${n}/${tot}`]);
  [[n, tot - n], [1, tot], [n, Object.keys(b).length], [tot - n, tot]].forEach(([x, y]) => { if (opts.size < 4 && y > 0 && x > 0 && !(x === n && y === tot)) opts.add(`${x}/${y}`); });
  while (opts.size < 4) opts.add(`${rnd(1, tot)}/${tot + rnd(1, 3)}`);
  const g = pgcd(n, tot);
  return { enonce: `On tire une boule au hasard dans ce sac. Quelle est la probabilité de tirer une boule <strong>${c}</strong> ?`, figure: figUrne(b),
    choix: shuffle([...opts]).map((v) => ({ v, html: fracHtml(...v.split('/')) })), bonne: `${n}/${tot}`, rep: `${n} sur ${tot}`, notion,
    explication: `Il y a ${tot} boules en tout, dont ${n} ${c}${n > 1 ? 's' : ''}. Chaque boule a la même chance d'être tirée : la probabilité est ${fracHtml(n, tot)}${g > 1 ? ` = ${fracHtml(n / g, tot / g)}` : ''}, c'est-à-dire <strong>nombre de cas favorables ÷ nombre de cas possibles</strong>.` };
};


/* ============================================================
   6e – 5e : ESPACE ET GÉOMÉTRIE
   ============================================================ */
/* segment [AB], droite (AB) ou demi-droite [AB) */
function figNotation(type) {
  const A = [100, 140], B = [220, 90], dx = B[0] - A[0], dy = B[1] - A[1];
  const P = (t) => [A[0] + dx * t, A[1] + dy * t];
  const [d, f] = type === 'segment' ? [0, 1] : type === 'droite' ? [-0.8, 1.8] : [0, 1.8];
  const D = P(d), F = P(f);
  let s = `<line x1="${D[0]}" y1="${D[1]}" x2="${F[0]}" y2="${F[1]}" stroke="${CRAIE}" stroke-width="3.5" stroke-linecap="round"/>`;
  [[A, 'A'], [B, 'B']].forEach(([Q, n]) => { s += `<path d="M${Q[0] - 6} ${Q[1] - 6} l12 12 M${Q[0] + 6} ${Q[1] - 6} l-12 12" stroke="${JAUNE}" stroke-width="3"/>${txt(Q[0] - 4, Q[1] + 22, n, { taille: 20, gras: true, c: JAUNE })}`; });
  return svgArdoise(320, 220, s, 'Deux points et un trait');
}
/* un triangle à l'échelle d'après ses angles, avec deux angles connus et le troisième à trouver */
function figTriangleAngles(al, be) {
  const ga = 180 - al - be, r = Math.PI / 180, c = 230, b = (c * Math.sin(be * r)) / Math.sin(ga * r);
  let P = [[0, 0], [c, 0], [b * Math.cos(al * r), -b * Math.sin(al * r)]];
  P = centre(P, 320, 230);
  const lab = (i, t, col) => { const Q = P[i], cx = (P[0][0] + P[1][0] + P[2][0]) / 3, cy = (P[0][1] + P[1][1] + P[2][1]) / 3, dx = cx - Q[0], dy = cy - Q[1], l = Math.hypot(dx, dy); return txt(Q[0] + (dx / l) * 34, Q[1] + (dy / l) * 30, t, { taille: 16, gras: true, c: col }); };
  return figPolygone(P, null, { w: 320, h: 230 }).replace('</svg>', `${lab(0, `${al}°`, JAUNE)}${lab(1, `${be}°`, JAUNE)}${lab(2, '?', ROSE)}</svg>`);
}

/* --- Les notations --- */
GEN.nota = (p) => {
  const notion = 'Les notations';
  if (Math.random() < 0.35) {
    const F = pick([
      ['Le point M appartient à la droite (d). On écrit…', 'M ∈ (d)', ['M ∉ (d)', 'M = (d)', '(d) ∈ M'], 'Le symbole <strong>∈</strong> veut dire « appartient à » : <strong>M ∈ (d)</strong>. Le symbole ∉ veut dire « n\'appartient pas à ».'],
      ['La longueur du segment [AB] s\'écrit…', 'AB', ['[AB]', '(AB)', '[AB)'], 'La <strong>longueur</strong> s\'écrit sans crochets : <strong>AB</strong> = 5 cm. [AB] désigne le segment lui-même.'],
      ['Le milieu d\'un segment [AB] est le point qui…', 'est sur [AB], à égale distance de A et de B', ['est à égale distance de A et de B, n\'importe où', 'est l\'une des extrémités'], 'Le milieu I de [AB] est <strong>sur le segment</strong> et vérifie <strong>IA = IB</strong>.'],
    ]);
    return { enonce: F[0], choix: shuffle([F[1], ...F[2]]).map((v) => ({ v, html: v })), bonne: F[1], rep: F[1], notion, explication: F[3] };
  }
  const t = pick(['segment', 'droite', 'demi']);
  const noms = { segment: '[AB]', droite: '(AB)', demi: '[AB)' };
  return { enonce: 'Quelle est la bonne notation pour ce qui est tracé ?', figure: figNotation(t), choix: Object.entries(noms).map(([v, h]) => ({ v, html: `${h} : ${{ segment: 'le segment', droite: 'la droite', demi: 'la demi-droite' }[v]}` })), bonne: t, rep: { segment: 'le segment A B', droite: 'la droite A B', demi: 'la demi-droite A B' }[t], notion,
    explication: { segment: 'Le trait s\'arrête en A et en B : c\'est le <strong>segment [AB]</strong>. Les crochets « ferment » le trait des deux côtés.', droite: 'Le trait continue au-delà de A et de B, sans fin : c\'est la <strong>droite (AB)</strong>. Les parenthèses montrent qu\'elle est « ouverte » des deux côtés.', demi: 'Le trait commence en A et continue sans fin après B : c\'est la <strong>demi-droite [AB)</strong>. Le crochet est du côté de A, où elle commence.' }[t] };
};

/* --- La médiatrice et la distance d'un point à une droite --- */
GEN.medi = (p) => {
  const notion = 'La médiatrice';
  const type = pick([0, 0, 1, 2]);
  if (type === 0) {
    const d = rnd(3, 12);
    return { enonce: `Le point M est sur la <strong>médiatrice</strong> du segment [AB], et <strong>MA = ${d} cm</strong>. Combien mesure MB ?`, saisie: { type: 'nombre', bonne: d, unite: 'cm' }, rep: `${d} centimètres`, notion,
      explication: `Tout point de la médiatrice de [AB] est <strong>à égale distance</strong> de A et de B : MB = MA = <strong>${d} cm</strong>.` };
  }
  if (type === 1) {
    const F = pick([
      ['La médiatrice d\'un segment est la droite…', 'perpendiculaire au segment en son milieu', ['parallèle au segment', 'qui passe par une extrémité du segment'], 'La médiatrice de [AB] est la droite <strong>perpendiculaire à [AB] en son milieu</strong>.'],
      ['Pour tracer la médiatrice d\'un segment avec le compas, on trace…', 'deux arcs de même rayon, centrés en A et en B', ['un cercle de centre le milieu', 'un seul arc centré en A'], 'On trace <strong>deux arcs de même rayon</strong>, centrés en A et en B ; leurs deux points d\'intersection sont sur la médiatrice.'],
      ['La distance d\'un point à une droite se mesure…', 'perpendiculairement à la droite', ['parallèlement à la droite', 'jusqu\'à n\'importe quel point de la droite'], 'C\'est la plus courte distance : on la mesure <strong>perpendiculairement</strong> à la droite, avec l\'équerre.'],
    ]);
    return { enonce: F[0], choix: shuffle([F[1], ...F[2]]).map((v) => ({ v, html: capitalize(v) })), bonne: F[1], rep: F[1], notion, explication: F[3] };
  }
  const ab = 2 * rnd(2, 8);
  return { enonce: `La médiatrice de [AB] coupe ce segment en I. <strong>AB = ${ab} cm</strong>. Combien mesure AI ?`, saisie: { type: 'nombre', bonne: ab / 2, unite: 'cm' }, rep: `${ab / 2} centimètres`, notion,
    explication: `La médiatrice passe par le <strong>milieu</strong> de [AB] : I est le milieu, donc AI = ${ab} ÷ 2 = <strong>${ab / 2} cm</strong>.` };
};

/* --- Les symétries : centrale (5e) et axiale (6e, propriétés) --- */
GEN.symc = (p) => {
  const notion = 'Les symétries';
  if (p < 0.35 || Math.random() < 0.3) {
    const F = pick([
      ['Le symétrique d\'un segment de 5 cm par une symétrie mesure…', '5 cm', ['10 cm', '2,5 cm', 'cela dépend de l\'axe'], 'Une symétrie (axiale ou centrale) <strong>conserve les longueurs</strong> : le symétrique mesure aussi <strong>5 cm</strong>.'],
      ['Le symétrique d\'un angle de 40° mesure…', '40°', ['140°', '80°', '50°'], 'Une symétrie <strong>conserve les angles</strong> : l\'angle symétrique mesure aussi <strong>40°</strong>.'],
      ['Une figure et sa symétrique ont…', 'la même aire', ['des aires différentes', 'une aire double'], 'Une symétrie <strong>conserve les aires</strong> : la figure n\'est ni agrandie ni réduite.'],
      ['Dans la symétrie de centre O, le point O est…', 'le milieu du segment qui joint un point et son symétrique', ['sur la médiatrice de ce segment', 'toujours sur la figure'], 'A\' est le symétrique de A par rapport à O quand <strong>O est le milieu de [AA\']</strong>.'],
      ['La symétrie centrale revient à faire tourner la figure…', 'd\'un demi-tour autour du centre', ['d\'un quart de tour', 'autour d\'un axe'], 'La symétrie centrale, c\'est un <strong>demi-tour</strong> (180°) autour du centre O.'],
    ]);
    return { enonce: F[0], choix: shuffle([F[1], ...F[2]]).map((v) => ({ v, html: capitalize(v) })), bonne: F[1], rep: F[1], notion, explication: F[3] };
  }
  const n = 7, O = [3, 3];
  let A; do { A = [rnd(0, n - 1), rnd(0, n - 1)]; } while (A[0] === O[0] && A[1] === O[1]);
  const S = [2 * O[0] - A[0], 2 * O[1] - A[1]], bonne = nomCase(S[0], S[1], n);
  const opts = new Set([bonne]);
  [[A[0], 2 * O[1] - A[1]], [2 * O[0] - A[0], A[1]], [S[0] + 1, S[1]], [S[0], S[1] - 1]].forEach(([x, y]) => { if (opts.size < 4 && x >= 0 && y >= 0 && x < n && y < n && !(x === A[0] && y === A[1])) opts.add(nomCase(x, y, n)); });
  while (opts.size < 4) opts.add(nomCase(rnd(0, n - 1), rnd(0, n - 1), n));
  return { enonce: `Le point ★ est en <strong>${nomCase(A[0], A[1], n)}</strong>. Où se trouve son symétrique par rapport au point <strong>O</strong> (en ${nomCase(O[0], O[1], n)}) ?`, figure: figQuadrillage(n, n, [], { reperes: true, icones: [[A[0], A[1], '★'], [O[0], O[1], 'O']] }),
    figureCorrection: figQuadrillage(n, n, [], { reperes: true, icones: [[A[0], A[1], '★'], [O[0], O[1], 'O'], [S[0], S[1], '☆']], chemin: [A, O, S] }),
    choix: shuffle([...opts]).map((v) => ({ v, html: v })), bonne, rep: bonne, notion,
    explication: `Pour aller de ★ à O, on se déplace de ${Math.abs(O[0] - A[0])} case${Math.abs(O[0] - A[0]) > 1 ? 's' : ''} ${O[0] >= A[0] ? 'vers la droite' : 'vers la gauche'} et de ${Math.abs(O[1] - A[1])} case${Math.abs(O[1] - A[1]) > 1 ? 's' : ''} ${O[1] >= A[1] ? 'vers le bas' : 'vers le haut'}. On refait le même déplacement à partir de O : on arrive en <strong>${bonne}</strong>. O est le milieu du segment qui joint les deux points.` };
};

/* --- Les angles : somme dans un triangle, angles et parallèles (5e) --- */
GEN.angles65 = (p) => {
  const notion = 'Les angles';
  const type = pick(p < 0.4 ? [0, 0, 1] : [0, 1, 2, 3]);
  if (type === 0) {
    const al = rnd(30, 90), be = rnd(25, 150 - al), ga = 180 - al - be;
    return { enonce: 'Combien mesure l\'angle marqué <strong style="color:#ff9ec7">?</strong> dans ce triangle ?', figure: figTriangleAngles(al, be), saisie: { type: 'nombre', bonne: ga, unite: '°' }, rep: `${ga} degrés`, notion, voix: `Dans ce triangle, deux angles mesurent ${al} et ${be} degrés. Combien mesure le troisième ?`,
      explication: `La <strong>somme des angles d'un triangle vaut 180°</strong>. ${al} + ${be} = ${al + be}, et 180 − ${al + be} = <strong>${ga}°</strong>.` };
  }
  if (type === 1) {
    const base = rnd(30, 75), sommet = 180 - 2 * base, versSommet = Math.random() < 0.5;
    return { enonce: versSommet ? `Un triangle <strong>isocèle</strong> a deux angles à la base de <strong>${base}°</strong>. Combien mesure l'angle au sommet principal ?` : `Dans un triangle <strong>isocèle</strong>, l'angle au sommet principal mesure <strong>${sommet}°</strong>. Combien mesure chacun des deux angles à la base ?`,
      saisie: { type: 'nombre', bonne: versSommet ? sommet : base, unite: '°' }, rep: `${versSommet ? sommet : base} degrés`, notion,
      explication: versSommet ? `Les deux angles à la base sont égaux : ${base} + ${base} = ${2 * base}. Le troisième : 180 − ${2 * base} = <strong>${sommet}°</strong>.` : `Il reste 180 − ${sommet} = ${2 * base}° pour les deux angles à la base, qui sont égaux : ${2 * base} ÷ 2 = <strong>${base}°</strong>.` };
  }
  if (type === 2) {
    const a = rnd(35, 145), sorte = pick(['alternes-internes', 'correspondants']);
    return { enonce: `Deux droites <strong>parallèles</strong> sont coupées par une sécante. Deux angles <strong>${sorte}</strong> sont formés ; l'un mesure <strong>${a}°</strong>. Combien mesure l'autre ?`, saisie: { type: 'nombre', bonne: a, unite: '°' }, rep: `${a} degrés`, notion,
      explication: `Quand deux droites sont <strong>parallèles</strong>, les angles ${sorte} qu'elles forment avec une sécante sont <strong>égaux</strong> : l'autre mesure aussi <strong>${a}°</strong>. (Et réciproquement : si ces angles sont égaux, les droites sont parallèles.)` };
  }
  const a = rnd(20, 160), sorte = pick(['adjacents supplémentaires', 'opposés par le sommet']);
  const r = sorte.startsWith('opposés') ? a : 180 - a;
  return { enonce: `Deux droites se coupent. Un angle mesure <strong>${a}°</strong>. Combien mesure l'angle qui lui est <strong>${sorte.startsWith('opposés') ? 'opposé par le sommet' : 'adjacent'}</strong> (sur la même droite) ?`, saisie: { type: 'nombre', bonne: r, unite: '°' }, rep: `${r} degrés`, notion,
    explication: sorte.startsWith('opposés') ? `Deux angles <strong>opposés par le sommet</strong> sont égaux : <strong>${a}°</strong>.` : `Ensemble, ces deux angles forment un angle plat (180°) : 180 − ${a} = <strong>${r}°</strong>. On dit qu'ils sont supplémentaires.` };
};

/* --- Les parallélogrammes (5e) --- */
GEN.para = (p) => {
  const notion = 'Les parallélogrammes';
  const type = pick([0, 1, 2, 3]);
  if (type === 0) {
    const L = rnd(3, 12);
    return { enonce: `ABCD est un <strong>parallélogramme</strong> et <strong>AB = ${L} cm</strong>. Combien mesure CD ?`, saisie: { type: 'nombre', bonne: L, unite: 'cm' }, rep: `${L} centimètres`, notion,
      explication: `Dans un parallélogramme, les <strong>côtés opposés ont la même longueur</strong> : CD = AB = <strong>${L} cm</strong>.` };
  }
  if (type === 1) {
    const o = rnd(2, 9);
    return { enonce: `ABCD est un <strong>parallélogramme</strong> de centre O, et <strong>OA = ${o} cm</strong>. Combien mesure la diagonale AC ?`, saisie: { type: 'nombre', bonne: 2 * o, unite: 'cm' }, rep: `${2 * o} centimètres`, notion,
      explication: `Les <strong>diagonales d'un parallélogramme se coupent en leur milieu</strong> : O est le milieu de [AC], donc AC = 2 × ${o} = <strong>${2 * o} cm</strong>.` };
  }
  if (type === 2) {
    const a = rnd(40, 140), opp = Math.random() < 0.5;
    return { enonce: `Dans le parallélogramme ABCD, l'angle en A mesure <strong>${a}°</strong>. Combien mesure l'angle en <strong>${opp ? 'C' : 'B'}</strong> ?`, saisie: { type: 'nombre', bonne: opp ? a : 180 - a, unite: '°' }, rep: `${opp ? a : 180 - a} degrés`, notion,
      explication: opp ? `Les <strong>angles opposés</strong> d'un parallélogramme sont égaux : l'angle en C mesure <strong>${a}°</strong>.` : `Deux angles <strong>consécutifs</strong> d'un parallélogramme sont supplémentaires (leur somme fait 180°) : 180 − ${a} = <strong>${180 - a}°</strong>.` };
  }
  const F = pick([
    ['Un parallélogramme dont les diagonales ont la même longueur est…', 'un rectangle', ['un losange', 'un trapèze'], 'Un parallélogramme aux <strong>diagonales de même longueur</strong> est un <strong>rectangle</strong>.'],
    ['Un parallélogramme dont les diagonales sont perpendiculaires est…', 'un losange', ['un rectangle', 'un trapèze'], 'Un parallélogramme aux <strong>diagonales perpendiculaires</strong> est un <strong>losange</strong>.'],
    ['Un parallélogramme qui a un angle droit est…', 'un rectangle', ['un losange', 'un carré, toujours'], 'Avec un angle droit, tous ses angles sont droits : c\'est un <strong>rectangle</strong> (un carré seulement si, en plus, ses côtés sont égaux).'],
    ['Un parallélogramme est un quadrilatère dont…', 'les côtés opposés sont parallèles deux à deux', ['tous les côtés sont égaux', 'les diagonales sont perpendiculaires'], 'Définition : un parallélogramme a ses <strong>côtés opposés parallèles deux à deux</strong>.'],
  ]);
  return { enonce: F[0], choix: shuffle([F[1], ...F[2]]).map((v) => ({ v, html: capitalize(v) })), bonne: F[1], rep: F[1], notion, explication: F[3] };
};


/* ============================================================
   LES QUIZ DE COURS
   À la fin de chaque domaine et de chaque niveau : des questions de cours, toujours les mêmes,
   tirées au hasard dans la banque (12 par partie). Elles reviennent d'une partie à l'autre,
   pour être apprises par cœur.
   Une question : { q, r, f, e } pour un choix (r = la bonne réponse, f = les fausses),
                  { q, r, u, e } pour une réponse à écrire (r est un nombre, u l'unité).
   Pour modifier un quiz : on ajoute, retire ou corrige une ligne ici, rien d'autre à toucher.
   ============================================================ */
const QUIZ = {
  'ce-nombres': [
    { q: 'Le résultat d\'une addition s\'appelle…', r: 'la somme', f: ['la différence', 'le produit'], e: 'Le résultat d\'une addition est <strong>la somme</strong> : 3 + 4 = 7, 7 est la somme de 3 et 4.' },
    { q: 'Le résultat d\'une soustraction s\'appelle…', r: 'la différence', f: ['la somme', 'le produit'], e: 'Le résultat d\'une soustraction est <strong>la différence</strong> : 9 − 4 = 5.' },
    { q: 'Le résultat d\'une multiplication s\'appelle…', r: 'le produit', f: ['la somme', 'la différence'], e: 'Le résultat d\'une multiplication est <strong>le produit</strong> : 6 × 7 = 42.' },
    { q: 'Combien d\'unités dans une dizaine ?', r: 10, u: 'unités', e: '1 dizaine = <strong>10 unités</strong>.' },
    { q: 'Combien de dizaines dans une centaine ?', r: 10, u: 'dizaines', e: '1 centaine = <strong>10 dizaines</strong> = 100 unités.' },
    { q: 'Combien d\'unités dans un millier ?', r: 1000, u: 'unités', e: '1 millier = 10 centaines = <strong>1 000 unités</strong>.' },
    { q: 'Quel nombre vient juste après 999 ?', r: 1000, e: '999 + 1 = <strong>1 000</strong> (mille).' },
    { v: 'Que veut dire le signe en forme de pointe tournée vers la gauche ?', q: 'Le signe &lt; veut dire…', r: 'plus petit que', f: ['plus grand que', 'égal à'], e: '&lt; veut dire <strong>plus petit que</strong> : la pointe montre le plus petit nombre (3 &lt; 8).' },
    { v: 'Que veut dire le signe en forme de pointe tournée vers la droite ?', q: 'Le signe &gt; veut dire…', r: 'plus grand que', f: ['plus petit que', 'égal à'], e: '&gt; veut dire <strong>plus grand que</strong> : l\'ouverture est du côté du plus grand nombre (8 &gt; 3).' },
    { q: 'Multiplier un nombre par 10, c\'est…', r: 'écrire un 0 à sa droite', f: ['ajouter 10', 'enlever un 0'], e: 'Multiplier par 10, c\'est <strong>écrire un 0 à droite</strong> : les unités deviennent des dizaines (23 × 10 = 230).' },
    { q: 'Le double d\'un nombre, c\'est…', r: 'ce nombre ajouté à lui-même', f: ['ce nombre multiplié par 10', 'la moitié de ce nombre'], e: 'Le double, c\'est le nombre <strong>ajouté à lui-même</strong>, ou multiplié par 2 : le double de 7 est 14.' },
    { q: 'La moitié d\'un nombre, c\'est…', r: 'ce nombre partagé en 2 parts égales', f: ['ce nombre multiplié par 2', 'ce nombre moins 2'], e: 'La moitié, c\'est une des <strong>2 parts égales</strong> : la moitié de 14 est 7.' },
    { q: 'Est-ce que 3 × 8 = 8 × 3 ?', r: 'oui, toujours', f: ['non, jamais', 'seulement pour les petits nombres'], e: '<strong>Oui</strong> : on peut toujours retourner une multiplication, le résultat ne change pas. 3 × 8 = 8 × 3 = 24.' },
    { q: 'Pour vérifier une soustraction, on peut faire…', r: 'une addition', f: ['une multiplication', 'une autre soustraction'], e: 'On vérifie avec <strong>une addition</strong> : si 52 − 17 = 35, alors 35 + 17 = 52.' },
    { q: 'Partager 12 en 3 parts égales s\'écrit…', r: '12 ÷ 3', f: ['12 − 3', '12 × 3'], e: 'Partager en parts égales, c\'est <strong>diviser</strong> : 12 ÷ 3 = 4.' },
    { q: 'Dans une fraction, le nombre du bas indique…', r: 'en combien de parts égales on partage', f: ['combien de parts on prend', 'la taille de chaque part'], e: 'Le nombre du bas dit <strong>en combien de parts égales</strong> on partage l\'unité ; le nombre du haut dit combien on en prend.' },
    { q: 'Un quart s\'écrit…', r: '1/4', f: ['1/3', '4/1'], e: 'Un quart, c\'est une part sur quatre : <strong>1/4</strong>.' },
    { q: 'Combien de quarts faut-il pour faire une unité ?', r: 4, u: 'quarts', e: '<strong>4 quarts</strong> font une unité entière : 4/4 = 1.' },
    { q: 'Quand on gagne, on reçoit, on ajoute, on fait…', r: 'une addition', f: ['une soustraction', 'une division'], e: 'Gagner, recevoir, réunir : on fait <strong>une addition</strong>.' },
    { q: 'Quand il y a plusieurs fois la même quantité, on fait…', r: 'une multiplication', f: ['une addition de deux nombres', 'une soustraction'], e: 'Plusieurs fois la même quantité : c\'est <strong>une multiplication</strong> (5 paquets de 6, c\'est 5 × 6).' },
  ],
  'ce-grandeurs': [
    { q: '1 m = … cm', r: 100, u: 'cm', e: '1 mètre = <strong>100 centimètres</strong>.' },
    { q: '1 km = … m', r: 1000, u: 'm', e: '1 kilomètre = <strong>1 000 mètres</strong>.' },
    { q: '1 cm = … mm', r: 10, u: 'mm', e: '1 centimètre = <strong>10 millimètres</strong>.' },
    { q: '1 kg = … g', r: 1000, u: 'g', e: '1 kilogramme = <strong>1 000 grammes</strong>.' },
    { q: '1 L = … cL', r: 100, u: 'cL', e: '1 litre = <strong>100 centilitres</strong>.' },
    { q: '1 heure = … minutes', r: 60, u: 'min', e: '1 heure = <strong>60 minutes</strong>.' },
    { q: '1 minute = … secondes', r: 60, u: 's', e: '1 minute = <strong>60 secondes</strong>.' },
    { q: '1 jour = … heures', r: 24, u: 'h', e: '1 jour = <strong>24 heures</strong>.' },
    { q: '1 semaine = … jours', r: 7, u: 'jours', e: '1 semaine = <strong>7 jours</strong>.' },
    { q: '1 année = … mois', r: 12, u: 'mois', e: '1 année = <strong>12 mois</strong>.' },
    { q: '1 euro = … centimes', r: 100, u: 'centimes', e: '1 euro = <strong>100 centimes</strong>.' },
    { q: 'Sur une horloge, la petite aiguille indique…', r: 'les heures', f: ['les minutes', 'les secondes'], e: 'La petite aiguille indique <strong>les heures</strong> ; la grande, les minutes.' },
    { q: 'Une demi-heure dure…', r: '30 minutes', f: ['15 minutes', '50 minutes'], e: 'La moitié de 60 minutes : <strong>30 minutes</strong>.' },
    { q: 'Un quart d\'heure dure…', r: '15 minutes', f: ['25 minutes', '4 minutes'], e: '60 ÷ 4 = <strong>15 minutes</strong>.' },
    { q: 'Le périmètre d\'une figure, c\'est…', r: 'la longueur de son tour', f: ['la place qu\'elle occupe', 'la longueur de son plus grand côté'], e: 'Le périmètre est <strong>la longueur du tour</strong> de la figure : on additionne tous ses côtés.' },
    { q: 'Pour mesurer la longueur d\'un cahier, j\'utilise…', r: 'la règle graduée', f: ['la balance', 'le compas'], e: 'On mesure une longueur avec <strong>la règle graduée</strong>.' },
    { q: 'Pour peser des pommes, j\'utilise…', r: 'une balance', f: ['une règle', 'un verre doseur'], e: 'On pèse avec <strong>une balance</strong> ; la masse se mesure en grammes ou en kilogrammes.' },
    { q: 'Combien de jours a le mois de février, une année ordinaire ?', r: 28, u: 'jours', e: 'Février a <strong>28 jours</strong> (et 29 les années bissextiles, tous les 4 ans).' },
    { q: 'Quelle unité pour la longueur d\'un trajet entre deux villes ?', r: 'le kilomètre', f: ['le centimètre', 'le mètre'], e: 'Pour les grandes distances : <strong>le kilomètre</strong>.' },
  ],
  'ce-geometrie': [
    { q: 'Combien de côtés a un triangle ?', r: 3, u: 'côtés', e: 'Un triangle a <strong>3 côtés</strong> et 3 sommets.' },
    { q: 'Un carré a…', r: '4 côtés égaux et 4 angles droits', f: ['4 côtés égaux, sans angle droit', '2 longueurs et 2 largeurs'], e: 'Un carré a <strong>4 côtés de même longueur et 4 angles droits</strong>.' },
    { q: 'Combien d\'angles droits a un rectangle ?', r: 4, u: 'angles droits', e: 'Un rectangle a <strong>4 angles droits</strong>.' },
    { q: 'Un losange a…', r: '4 côtés de même longueur', f: ['4 angles droits', '3 côtés égaux'], e: 'Un losange a <strong>4 côtés de même longueur</strong>.' },
    { q: 'Un triangle rectangle a…', r: 'un angle droit', f: ['trois côtés égaux', 'quatre côtés'], e: 'Un triangle rectangle a <strong>un angle droit</strong>.' },
    { q: 'Pour vérifier qu\'un angle est droit, j\'utilise…', r: 'l\'équerre', f: ['le compas', 'la règle'], e: 'On vérifie un angle droit avec <strong>l\'équerre</strong>.' },
    { q: 'Pour tracer un cercle, j\'utilise…', r: 'le compas', f: ['l\'équerre', 'la règle'], e: 'On trace un cercle avec <strong>le compas</strong>.' },
    { q: 'Un segment qui va du centre jusqu\'au cercle s\'appelle…', r: 'un rayon', f: ['un diamètre', 'un côté'], e: 'C\'est <strong>un rayon</strong>.' },
    { q: 'Un segment qui traverse le cercle en passant par le centre s\'appelle…', r: 'un diamètre', f: ['un rayon', 'un axe'], e: 'C\'est <strong>un diamètre</strong> ; il mesure deux rayons.' },
    { q: 'Le diamètre d\'un cercle mesure combien de rayons ?', r: 2, u: 'rayons', e: 'Le diamètre mesure <strong>2 rayons</strong>.' },
    { q: 'Combien de faces a un cube ?', r: 6, u: 'faces', e: 'Un cube a <strong>6 faces</strong>, qui sont des carrés.' },
    { q: 'Les faces d\'un cube sont des…', r: 'carrés', f: ['rectangles', 'triangles'], e: 'Les 6 faces du cube sont des <strong>carrés</strong> identiques.' },
    { q: 'Les faces d\'un pavé droit sont des…', r: 'rectangles', f: ['triangles', 'disques'], e: 'Les faces d\'un pavé droit sont des <strong>rectangles</strong> (comme une boîte à chaussures).' },
    { q: 'Combien de sommets a un cube ?', r: 8, u: 'sommets', e: 'Un cube a <strong>8 sommets</strong> : 4 en haut, 4 en bas.' },
    { q: 'Quel solide peut rouler dans toutes les directions ?', r: 'la boule', f: ['le cube', 'la pyramide'], e: '<strong>La boule</strong> est toute ronde : elle roule dans tous les sens.' },
    { q: 'Quel solide a une pointe et une base en forme de disque ?', r: 'le cône', f: ['le cylindre', 'la pyramide'], e: 'C\'est <strong>le cône</strong>, comme un cornet de glace.' },
    { q: 'Un axe de symétrie partage une figure en deux moitiés…', r: 'qui se superposent quand on plie', f: ['de couleurs différentes', 'de formes différentes'], e: 'En pliant le long de l\'axe, les deux moitiés <strong>se superposent exactement</strong>.' },
    { q: 'Pour nommer la case B3 d\'un quadrillage, on donne d\'abord…', r: 'la lettre de la colonne', f: ['le numéro de la ligne', 'le nombre de cases'], e: 'D\'abord <strong>la lettre de la colonne</strong>, puis le numéro de la ligne.' },
  ],
  'cm-nombres': [
    { q: 'Un million, c\'est combien de milliers ?', r: 1000, u: 'milliers', e: '1 million = <strong>1 000 milliers</strong> = 1 000 000.' },
    { q: 'Combien de zéros s\'écrivent dans un milliard ?', r: 9, u: 'zéros', e: '1 milliard = 1 000 000 000 : <strong>9 zéros</strong>.' },
    { q: 'Dans 3,47, le chiffre 4 est le chiffre des…', r: 'dixièmes', f: ['centièmes', 'dizaines'], e: 'Juste après la virgule : <strong>les dixièmes</strong> ; ensuite les centièmes (7).' },
    { q: '1 dixième = … centièmes', r: 10, u: 'centièmes', e: '1 dixième = <strong>10 centièmes</strong> (0,1 = 0,10).' },
    { q: '1 unité = … dixièmes', r: 10, u: 'dixièmes', e: '1 unité = <strong>10 dixièmes</strong>.' },
    { q: 'Quel est le plus grand : 2,9 ou 2,15 ?', r: '2,9', f: ['2,15', 'ils sont égaux'], e: '2,9 = 2,90 et 90 centièmes &gt; 15 centièmes : <strong>2,9</strong> est le plus grand. Ce n\'est pas le nombre de chiffres qui compte !' },
    { q: '3,5 et 3,50, c\'est…', r: 'le même nombre', f: ['deux nombres différents', '3,50 est plus grand'], e: 'Un 0 à la fin de la partie décimale ne change rien : 3,5 = 3,50, <strong>le même nombre</strong>.' },
    { q: 'Écris 1/2 sous forme décimale.', r: 0.5, e: '1/2 = 1 ÷ 2 = <strong>0,5</strong>.' },
    { q: 'Écris 1/4 sous forme décimale.', r: 0.25, e: '1/4 = 25/100 = <strong>0,25</strong>.' },
    { q: 'Écris 1/10 sous forme décimale.', r: 0.1, e: '1/10, un dixième = <strong>0,1</strong>.' },
    { q: 'Dans une fraction, le nombre du haut s\'appelle…', r: 'le numérateur', f: ['le dénominateur', 'le quotient'], e: 'En haut, <strong>le numérateur</strong> (combien de parts on prend) ; en bas, le dénominateur.' },
    { q: 'Dans une fraction, le nombre du bas s\'appelle…', r: 'le dénominateur', f: ['le numérateur', 'le diviseur'], e: 'En bas, <strong>le dénominateur</strong> : en combien de parts on partage.' },
    { q: 'Une fraction est plus grande que 1 quand…', r: 'le numérateur est plus grand que le dénominateur', f: ['le dénominateur est plus grand que le numérateur', 'les deux nombres sont pairs'], e: 'Plus grande que 1 quand <strong>le numérateur est plus grand que le dénominateur</strong> : 7/4 &gt; 1.' },
    { q: 'Le résultat d\'une division s\'appelle…', r: 'le quotient', f: ['le produit', 'le reste'], e: 'Le résultat d\'une division est <strong>le quotient</strong>.' },
    { q: 'Dans une division euclidienne, le reste est toujours…', r: 'plus petit que le diviseur', f: ['plus grand que le diviseur', 'égal à zéro'], e: 'Le reste est toujours <strong>plus petit que le diviseur</strong> ; sinon, on pourrait encore faire un paquet.' },
    { q: 'Multiplier un nombre décimal par 100, c\'est déplacer ses chiffres de…', r: '2 rangs vers la gauche', f: ['2 rangs vers la droite', '1 rang vers la gauche'], e: 'Chaque chiffre monte de <strong>2 rangs vers la gauche</strong> (la virgule semble aller de 2 rangs vers la droite) : 3,47 × 100 = 347.' },
    { q: 'Diviser par 10, c\'est rendre le nombre…', r: '10 fois plus petit', f: ['10 fois plus grand', '10 de moins'], e: 'Diviser par 10, c\'est rendre le nombre <strong>10 fois plus petit</strong> : 45 ÷ 10 = 4,5.' },
    { q: 'Pour additionner deux nombres décimaux posés, on aligne…', r: 'les virgules', f: ['les derniers chiffres à droite', 'les premiers chiffres à gauche'], e: 'On aligne <strong>les virgules</strong>, donc les unités sous les unités, les dixièmes sous les dixièmes.' },
    { q: 'Est-ce que 1/2 = 2/4 ?', r: 'oui', f: ['non'], e: '<strong>Oui</strong> : si on partage chaque moitié en 2, on obtient 2 quarts.' },
    { q: 'Combien de chiffres après la virgule dans le résultat de 1,2 × 0,3 ?', r: 2, u: 'chiffres', e: '1 chiffre + 1 chiffre = <strong>2 chiffres</strong> après la virgule : 1,2 × 0,3 = 0,36.' },
  ],
  'cm-grandeurs': [
    { q: 'L\'aire d\'un rectangle se calcule avec…', r: 'longueur × largeur', f: ['(longueur + largeur) × 2', 'longueur + largeur'], e: 'Aire du rectangle = <strong>longueur × largeur</strong>.' },
    { q: 'Le périmètre d\'un rectangle se calcule avec…', r: '(longueur + largeur) × 2', f: ['longueur × largeur', 'longueur × 4'], e: 'Périmètre du rectangle = <strong>(longueur + largeur) × 2</strong>.' },
    { q: 'L\'aire d\'un carré de côté c se calcule avec…', r: 'c × c', f: ['c × 4', 'c + c'], e: 'Aire du carré = <strong>côté × côté</strong>. (Le périmètre, lui, est c × 4.)' },
    { q: 'Une aire se mesure en…', r: 'cm², m²…', f: ['cm, m…', 'cm³, m³…'], e: 'Une aire se mesure en unités « carrées » : <strong>cm², m²</strong>.' },
    { q: 'Un volume se mesure en…', r: 'cm³, m³…', f: ['cm², m²…', 'cm, m…'], e: 'Un volume se mesure en unités « cubes » : <strong>cm³, m³</strong> (et en litres pour les contenances).' },
    { q: 'Le volume d\'un pavé droit se calcule avec…', r: 'longueur × largeur × hauteur', f: ['longueur + largeur + hauteur', 'longueur × largeur'], e: 'Volume du pavé droit = <strong>longueur × largeur × hauteur</strong>.' },
    { q: 'Un angle droit mesure… (en degrés)', r: 90, u: '°', e: 'Un angle droit mesure <strong>90°</strong>.' },
    { q: 'Un angle plat mesure… (en degrés)', r: 180, u: '°', e: 'Un angle plat mesure <strong>180°</strong> : ses côtés forment une ligne droite.' },
    { q: 'Un angle aigu est…', r: 'plus petit qu\'un angle droit', f: ['plus grand qu\'un angle droit', 'égal à un angle droit'], e: 'Un angle aigu est <strong>plus petit qu\'un angle droit</strong> (moins de 90°).' },
    { q: 'Un angle obtus est…', r: 'plus grand qu\'un angle droit', f: ['plus petit qu\'un angle droit', 'égal à 180°'], e: 'Un angle obtus est <strong>plus grand qu\'un angle droit</strong> (entre 90° et 180°).' },
    { q: 'Pour mesurer un angle en degrés, on utilise…', r: 'le rapporteur', f: ['l\'équerre', 'le compas'], e: 'On mesure un angle avec <strong>le rapporteur</strong>.' },
    { q: '50 %, c\'est…', r: 'la moitié', f: ['le quart', 'le dixième'], e: '50 % = 50/100 = <strong>la moitié</strong>.' },
    { q: '25 %, c\'est…', r: 'le quart', f: ['la moitié', 'le cinquième'], e: '25 % = 25/100 = <strong>le quart</strong>.' },
    { q: '10 %, c\'est…', r: 'le dixième', f: ['la moitié', 'le centième'], e: '10 % = 10/100 = <strong>le dixième</strong>.' },
    { q: '1 m = … dm', r: 10, u: 'dm', e: '1 mètre = <strong>10 décimètres</strong>.' },
    { q: '1 L = … mL', r: 1000, u: 'mL', e: '1 litre = <strong>1 000 millilitres</strong>.' },
    { q: '1 tonne = … kg', r: 1000, u: 'kg', e: '1 tonne = <strong>1 000 kilogrammes</strong>.' },
    { q: '1 m² = … dm²', r: 100, u: 'dm²', e: '1 m² = 10 dm × 10 dm = <strong>100 dm²</strong>.' },
    { q: 'Dans une situation de proportionnalité, si une quantité double, l\'autre…', r: 'double aussi', f: ['reste la même', 'diminue de moitié'], e: 'En proportionnalité, l\'autre quantité <strong>double aussi</strong>.' },
    { q: 'Une vitesse de 60 km/h signifie…', r: '60 km parcourus en 1 heure', f: ['60 km parcourus en 1 minute', '1 km parcouru en 60 heures'], e: '60 km/h : <strong>60 kilomètres en 1 heure</strong>.' },
    { q: 'Combien de secondes dans une heure ?', r: 3600, u: 's', e: '60 × 60 = <strong>3 600 secondes</strong>.' },
  ],
  'cm-geometrie': [
    { q: 'Deux droites perpendiculaires se coupent en formant…', r: 'un angle droit', f: ['un angle aigu', 'un angle plat'], e: 'Deux droites perpendiculaires se coupent en formant <strong>un angle droit</strong>.' },
    { q: 'Deux droites parallèles…', r: 'ne se coupent jamais', f: ['se coupent à angle droit', 'se coupent une fois'], e: 'Deux droites parallèles <strong>ne se coupent jamais</strong> : l\'écart entre elles reste le même.' },
    { q: 'Pour tracer une perpendiculaire, j\'utilise…', r: 'l\'équerre', f: ['le compas', 'le rapporteur'], e: 'On trace une perpendiculaire avec <strong>l\'équerre</strong>.' },
    { q: 'Un triangle isocèle a…', r: '2 côtés de même longueur', f: ['3 côtés de même longueur', 'un angle droit'], e: 'Un triangle isocèle a <strong>2 côtés de même longueur</strong>.' },
    { q: 'Un triangle équilatéral a…', r: '3 côtés de même longueur', f: ['2 côtés de même longueur', 'un angle droit'], e: 'Un triangle équilatéral a <strong>3 côtés de même longueur</strong>.' },
    { q: 'Les diagonales d\'un rectangle…', r: 'ont la même longueur', f: ['sont perpendiculaires', 'n\'ont rien de particulier'], e: 'Les diagonales d\'un rectangle <strong>ont la même longueur</strong> et se coupent en leur milieu.' },
    { q: 'Les diagonales d\'un losange…', r: 'sont perpendiculaires', f: ['ont toujours la même longueur', 'sont parallèles'], e: 'Les diagonales d\'un losange <strong>sont perpendiculaires</strong> et se coupent en leur milieu.' },
    { q: 'Combien d\'arêtes a un cube ?', r: 12, u: 'arêtes', e: 'Un cube a <strong>12 arêtes</strong> : 4 en haut, 4 en bas, 4 verticales.' },
    { q: 'Combien de sommets a un pavé droit ?', r: 8, u: 'sommets', e: 'Un pavé droit a <strong>8 sommets</strong>, comme le cube.' },
    { q: 'Un patron de cube est formé de combien de carrés ?', r: 6, u: 'carrés', e: '<strong>6 carrés</strong>, un pour chaque face.' },
    { q: 'Combien d\'axes de symétrie a un carré ?', r: 4, u: 'axes', e: 'Un carré a <strong>4 axes</strong> : 2 diagonales et 2 médianes.' },
    { q: 'Combien d\'axes de symétrie a un rectangle (qui n\'est pas un carré) ?', r: 2, u: 'axes', e: 'Un rectangle a <strong>2 axes</strong> de symétrie.' },
    { q: 'Combien d\'axes de symétrie a un triangle équilatéral ?', r: 3, u: 'axes', e: 'Un triangle équilatéral a <strong>3 axes</strong>.' },
    { q: 'Un cercle a…', r: 'une infinité d\'axes de symétrie', f: ['un seul axe de symétrie', 'aucun axe de symétrie'], e: 'Toute droite qui passe par le centre est un axe : un cercle a <strong>une infinité d\'axes</strong>.' },
    { q: 'Les bases d\'un cylindre sont des…', r: 'disques', f: ['rectangles', 'triangles'], e: 'Les deux bases d\'un cylindre sont des <strong>disques</strong>.' },
    { q: 'Les faces latérales d\'un prisme droit sont des…', r: 'rectangles', f: ['triangles', 'disques'], e: 'Les faces latérales d\'un prisme droit sont des <strong>rectangles</strong>.' },
    { q: 'Les faces latérales d\'une pyramide sont des…', r: 'triangles', f: ['rectangles', 'carrés'], e: 'Les faces latérales d\'une pyramide sont des <strong>triangles</strong>.' },
    { q: 'Dans un programme, « tourner à droite » fait pivoter le lutin…', r: 'd\'un quart de tour, vers sa droite à lui', f: ['d\'un demi-tour', 'vers la droite de l\'écran, toujours'], e: 'Le lutin pivote d\'<strong>un quart de tour vers sa propre droite</strong> : il faut se mettre à sa place.' },
  ],
};
/* les quiz deviennent des questions comme les autres (même affichage, même score) */
const NOTION_QUIZ = { 'ce-nombres': 'Cours : nombres et calculs', 'ce-grandeurs': 'Cours : grandeurs et mesures', 'ce-geometrie': 'Cours : espace et géométrie', 'cm-nombres': 'Cours : nombres et calculs', 'cm-grandeurs': 'Cours : grandeurs et mesures', 'cm-geometrie': 'Cours : espace et géométrie' };
function questionsQuiz(cle, n) {
  return shuffle(QUIZ[cle]).slice(0, n).map((x) => {
    const base = { enonce: `<span class="mm-cours">Question de cours</span>${x.q.replace(/…/, '<span class="mm-trou">…</span>')}`, voix: x.v || (typeof x.r === 'number' ? x.q : x.q.replace(/…/g, '')), explication: x.e, notion: NOTION_QUIZ[cle], court: x.q.replace(/<[^>]+>/g, '') };
    if (typeof x.r === 'number') return { ...base, saisie: { type: 'nombre', bonne: x.r, unite: x.u, neg: x.r < 0 }, rep: fmtN(x.r) };
    return { ...base, choix: shuffle([x.r, ...x.f]).map((v) => ({ v, html: v })), bonne: x.r, rep: x.r };
  });
}


/* --- Les quiz de cours du 6e – 5e (même principe que ceux du CE et du CM) --- */
Object.assign(QUIZ, {
  '65-nombres': [
    { q: 'Dans un calcul sans parenthèses, on effectue d\'abord…', r: 'les multiplications et les divisions', f: ['les additions et les soustractions', 'les calculs de gauche à droite, dans l\'ordre'], e: 'Priorité : <strong>× et ÷ avant + et −</strong>. 2 + 3 × 4 = 2 + 12 = 14.' },
    { q: 'Dans un calcul avec des parenthèses, on commence par…', r: 'les calculs entre parenthèses', f: ['les multiplications', 'le calcul le plus à gauche'], e: 'On commence toujours par <strong>les parenthèses</strong>.' },
    { q: 'Un nombre est divisible par 3 quand…', r: 'la somme de ses chiffres est dans la table de 3', f: ['il se termine par 3', 'son chiffre des unités est pair'], e: 'Divisible par 3 : <strong>la somme de ses chiffres est dans la table de 3</strong> (471 : 4 + 7 + 1 = 12).' },
    { q: 'Un nombre est divisible par 9 quand…', r: 'la somme de ses chiffres est dans la table de 9', f: ['il se termine par 9', 'il est divisible par 3'], e: 'Divisible par 9 : <strong>la somme de ses chiffres est dans la table de 9</strong>.' },
    { q: 'Un nombre est divisible par 5 quand…', r: 'il se termine par 0 ou 5', f: ['il se termine par 5 seulement', 'la somme de ses chiffres vaut 5'], e: 'Divisible par 5 : son chiffre des unités est <strong>0 ou 5</strong>.' },
    { q: 'Un nombre est divisible par 2 quand…', r: 'il est pair', f: ['il se termine par 2', 'il est plus grand que 2'], e: 'Divisible par 2 : <strong>il est pair</strong> (unités 0, 2, 4, 6 ou 8).' },
    { q: 'La fraction a/b est égale au quotient…', r: 'a ÷ b', f: ['b ÷ a', 'a × b'], e: 'a/b = <strong>a ÷ b</strong> : 3/4 = 3 ÷ 4 = 0,75.' },
    { q: 'Pour simplifier une fraction, on…', r: 'divise le numérateur et le dénominateur par un même nombre', f: ['soustrait le même nombre en haut et en bas', 'divise seulement le numérateur'], e: 'On <strong>divise le numérateur et le dénominateur par le même nombre</strong> : 6/8 = 3/4.' },
    { q: 'Pour additionner deux fractions de même dénominateur, on…', r: 'additionne les numérateurs et garde le dénominateur', f: ['additionne les numérateurs et les dénominateurs', 'multiplie les numérateurs'], e: '2/7 + 3/7 = <strong>5/7</strong> : on additionne les numérateurs, le dénominateur reste le même.' },
    { q: 'Calcule 2/5 + 1/5. Quel est le numérateur, sur 5 ?', r: 3, e: '2/5 + 1/5 = <strong>3/5</strong>.' },
    { q: 'Un nombre négatif est toujours…', r: 'plus petit qu\'un nombre positif', f: ['plus grand qu\'un nombre positif', 'plus petit que −10'], e: 'Un négatif est toujours <strong>plus petit qu\'un positif</strong> : il est à gauche de zéro.' },
    { q: 'Entre −8 et −3, le plus petit est…', r: '−8', f: ['−3', 'ils sont égaux'], e: '<strong>−8</strong> est plus loin à gauche de zéro que −3, donc il est plus petit.' },
    { q: 'L\'opposé de −6 est…', r: '6', f: ['−6', '1/6'], e: 'L\'opposé de −6 est <strong>6</strong> : même distance à zéro, signe contraire.' },
    { q: 'Soustraire un nombre relatif, c\'est…', r: 'ajouter son opposé', f: ['ajouter ce nombre', 'changer le signe du résultat'], e: 'Soustraire, c\'est <strong>ajouter l\'opposé</strong> : 3 − (−5) = 3 + 5 = 8.' },
    { q: 'Calcule (−4) + (−3).', r: -7, e: 'Même signe : on additionne les distances à zéro et on garde le signe : <strong>−7</strong>.' },
    { q: 'Calcule 5 + (−9).', r: -4, e: 'Signes contraires : 9 − 5 = 4, signe de −9 (le plus loin de zéro) : <strong>−4</strong>.' },
    { q: '3x veut dire…', r: '3 × x', f: ['3 + x', 'x × x × x'], e: '<strong>3x = 3 × x</strong> : on peut supprimer le signe × devant une lettre.' },
    { q: 'x² veut dire…', r: 'x × x', f: ['2 × x', 'x + 2'], e: '<strong>x² = x × x</strong> (x au carré).' },
    { q: 'Réduire 4x + 3x donne…', r: '7x', f: ['7x²', '12x'], e: '4x + 3x = (4 + 3)x = <strong>7x</strong>.' },
    { q: 'Calcule 2x + 5 pour x = 3.', r: 11, e: '2 × 3 + 5 = 6 + 5 = <strong>11</strong>.' },
  ],
  '65-grandeurs': [
    { q: 'La longueur d\'un cercle de rayon R se calcule avec…', r: '2 × π × R', f: ['π × R × R', '2 × R'], e: 'Longueur du cercle = <strong>2 × π × R</strong> (ou π × diamètre).' },
    { q: 'L\'aire d\'un disque de rayon R se calcule avec…', r: 'π × R × R', f: ['2 × π × R', 'π × 2 × R'], e: 'Aire du disque = <strong>π × R²</strong>.' },
    { q: 'Quelle valeur approchée de π utilise-t-on souvent ?', r: '3,14', f: ['3,41', '1,414'], e: 'π ≈ <strong>3,14</strong> (π = 3,14159…).' },
    { q: 'L\'aire d\'un triangle se calcule avec…', r: 'base × hauteur ÷ 2', f: ['base × hauteur', 'somme des trois côtés'], e: 'Aire du triangle = <strong>base × hauteur ÷ 2</strong>.' },
    { q: 'L\'aire d\'un parallélogramme se calcule avec…', r: 'base × hauteur', f: ['base × hauteur ÷ 2', 'côté × côté'], e: 'Aire du parallélogramme = <strong>base × hauteur</strong>.' },
    { q: 'Le volume d\'un cube d\'arête c se calcule avec…', r: 'c × c × c', f: ['c × c', '6 × c'], e: 'Volume du cube = <strong>c × c × c</strong> (c³).' },
    { q: 'Le volume d\'un prisme droit ou d\'un cylindre se calcule avec…', r: 'aire de la base × hauteur', f: ['aire de la base × hauteur ÷ 3', 'périmètre de la base × hauteur'], e: 'Prisme droit et cylindre : <strong>aire de la base × hauteur</strong>.' },
    { q: '1 L = … dm³', r: 1, u: 'dm³', e: '<strong>1 L = 1 dm³</strong>.' },
    { q: '1 dm³ = … cm³', r: 1000, u: 'cm³', e: '1 dm³ = <strong>1 000 cm³</strong>.' },
    { q: '1 cm³ = … mL', r: 1, u: 'mL', e: '<strong>1 cm³ = 1 mL</strong>.' },
    { q: 'Dans un tableau de proportionnalité, le nombre par lequel on multiplie s\'appelle…', r: 'le coefficient de proportionnalité', f: ['le quotient', 'le pourcentage'], e: 'C\'est <strong>le coefficient de proportionnalité</strong>.' },
    { q: 'Prendre 20 % d\'un nombre, c\'est le multiplier par…', r: '20/100', f: ['20', '100/20'], e: '20 % = <strong>20/100</strong> = 0,2.' },
    { q: 'Combien font 10 % de 350 ?', r: 35, e: '10 %, c\'est le dixième : 350 ÷ 10 = <strong>35</strong>.' },
    { q: 'La moyenne d\'une série se calcule avec…', r: 'somme des valeurs ÷ nombre de valeurs', f: ['plus grande valeur − plus petite valeur', 'valeur du milieu'], e: 'Moyenne = <strong>somme des valeurs ÷ nombre de valeurs</strong>.' },
    { q: 'La fréquence d\'une valeur se calcule avec…', r: 'effectif ÷ effectif total', f: ['effectif × effectif total', 'effectif total ÷ effectif'], e: 'Fréquence = <strong>effectif ÷ effectif total</strong> (×100 pour un pourcentage).' },
    { q: 'Une probabilité est toujours comprise entre…', r: '0 et 1', f: ['0 et 100', '−1 et 1'], e: 'Une probabilité est entre <strong>0 (impossible) et 1 (certain)</strong>.' },
    { q: 'La probabilité d\'un événement impossible est…', r: 0, e: 'Un événement impossible a une probabilité de <strong>0</strong>.' },
    { q: 'La probabilité d\'un événement certain est…', r: 1, e: 'Un événement certain a une probabilité de <strong>1</strong>.' },
    { q: 'La probabilité d\'obtenir 3 en lançant un dé à 6 faces est…', r: '1/6', f: ['1/3', '3/6'], e: 'Une face favorable sur 6 : <strong>1/6</strong>.' },
    { q: 'Un ratio de 2 : 3 entre garçons et filles veut dire…', r: '2 garçons pour 3 filles', f: ['2 garçons et 3 filles en tout', '2 filles pour 3 garçons'], e: '<strong>2 garçons pour 3 filles</strong>, à chaque fois.' },
  ],
  '65-geometrie': [
    { q: '[AB] désigne…', r: 'le segment d\'extrémités A et B', f: ['la droite passant par A et B', 'la longueur du segment'], e: '[AB] est <strong>le segment</strong> ; (AB) la droite ; [AB) la demi-droite ; AB la longueur.' },
    { q: '(AB) désigne…', r: 'la droite passant par A et B', f: ['le segment d\'extrémités A et B', 'la demi-droite d\'origine A'], e: '(AB) est <strong>la droite</strong>, illimitée des deux côtés.' },
    { q: '[AB) désigne…', r: 'la demi-droite d\'origine A passant par B', f: ['la demi-droite d\'origine B passant par A', 'le segment [AB]'], e: '[AB) est <strong>la demi-droite d\'origine A</strong>, qui passe par B.' },
    { q: 'Le symbole ∈ veut dire…', r: 'appartient à', f: ['est égal à', 'est parallèle à'], e: '∈ veut dire <strong>« appartient à »</strong>.' },
    { q: 'La médiatrice d\'un segment est…', r: 'la droite perpendiculaire au segment en son milieu', f: ['la droite parallèle au segment', 'le milieu du segment'], e: 'La médiatrice est <strong>perpendiculaire au segment en son milieu</strong>.' },
    { q: 'Un point de la médiatrice de [AB] est…', r: 'à égale distance de A et de B', f: ['plus près de A que de B', 'toujours le milieu de [AB]'], e: 'Tout point de la médiatrice est <strong>à égale distance de A et de B</strong>.' },
    { q: 'La symétrie axiale et la symétrie centrale conservent…', r: 'les longueurs, les angles et les aires', f: ['seulement les longueurs', 'seulement les aires'], e: 'Elles conservent <strong>les longueurs, les angles et les aires</strong>.' },
    { q: 'La symétrie centrale de centre O, c\'est…', r: 'un demi-tour autour de O', f: ['un quart de tour autour de O', 'un pliage le long d\'une droite'], e: 'La symétrie centrale est <strong>un demi-tour autour de O</strong>.' },
    { q: 'Si A\' est le symétrique de A par rapport à O, alors O est…', r: 'le milieu de [AA\']', f: ['sur la médiatrice de [AA\'], loin du segment', 'confondu avec A'], e: 'O est <strong>le milieu de [AA\']</strong>.' },
    { q: 'La somme des angles d\'un triangle vaut… (en degrés)', r: 180, u: '°', e: 'La somme des angles d\'un triangle vaut <strong>180°</strong>.' },
    { q: 'Dans un triangle équilatéral, chaque angle mesure… (en degrés)', r: 60, u: '°', e: '180 ÷ 3 = <strong>60°</strong>.' },
    { q: 'Les angles à la base d\'un triangle isocèle sont…', r: 'égaux', f: ['supplémentaires', 'droits'], e: 'Dans un triangle isocèle, les deux angles à la base sont <strong>égaux</strong>.' },
    { q: 'Deux angles opposés par le sommet sont…', r: 'égaux', f: ['supplémentaires', 'complémentaires'], e: 'Deux angles opposés par le sommet sont <strong>égaux</strong>.' },
    { q: 'Deux angles alternes-internes formés par deux droites parallèles sont…', r: 'égaux', f: ['supplémentaires', 'droits'], e: 'Avec des droites parallèles, les angles alternes-internes sont <strong>égaux</strong> (et les correspondants aussi).' },
    { q: 'Dans un parallélogramme, les diagonales…', r: 'se coupent en leur milieu', f: ['sont toujours perpendiculaires', 'ont toujours la même longueur'], e: 'Les diagonales d\'un parallélogramme <strong>se coupent en leur milieu</strong>.' },
    { q: 'Dans un parallélogramme, les côtés opposés…', r: 'sont parallèles et de même longueur', f: ['sont perpendiculaires', 'sont de longueurs différentes'], e: 'Les côtés opposés sont <strong>parallèles et de même longueur</strong>.' },
    { q: 'Dans un parallélogramme, deux angles consécutifs ont pour somme… (en degrés)', r: 180, u: '°', e: 'Deux angles consécutifs sont supplémentaires : <strong>180°</strong>.' },
    { q: 'Un parallélogramme dont les diagonales sont perpendiculaires est…', r: 'un losange', f: ['un rectangle', 'un trapèze'], e: 'Diagonales perpendiculaires : c\'est <strong>un losange</strong>.' },
    { q: 'Un parallélogramme dont les diagonales ont la même longueur est…', r: 'un rectangle', f: ['un losange', 'un trapèze'], e: 'Diagonales de même longueur : c\'est <strong>un rectangle</strong>.' },
  ],
});
Object.assign(NOTION_QUIZ, { '65-nombres': 'Cours : nombres et calculs', '65-grandeurs': 'Cours : grandeurs et mesures', '65-geometrie': 'Cours : espace et géométrie' });


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
    const L = [...L0.filter(({ e }) => !e.bilan && !e.avenir && !e.quizCours), ...L0.filter(({ e }) => e.bilan), ...L0.filter(({ e }) => e.quizCours), ...L0.filter(({ e }) => e.avenir)];
    const nEx = L.filter(({ e }) => !e.bilan && !e.avenir && !e.quizCours).length, premierBilan = L.findIndex(({ e }) => e.bilan), premierQuiz = L.findIndex(({ e }) => e.quizCours), premierAvenir = L.findIndex(({ e }) => e.avenir);
    let nq = 0;
    const titreEx = nEx ? `<p class="home-etape"><strong>Apprendre pas à pas</strong> : ${nEx} exercices, une notion à la fois, avec des questions de plus en plus difficiles. Les questions changent à chaque partie.</p>` : '';
    const titreBilan = '<p class="home-etape"><strong>Faire le bilan</strong> : toutes les notions de la partie, mélangées.</p>';
    const titreQuiz = '<p class="home-etape"><strong>Retenir le cours</strong> : les questions de cours à savoir par cœur. Ce sont toujours les mêmes qui reviennent.</p>';
    const titreAvenir = '<p class="home-etape"><strong>Bientôt</strong> : les exercices prévus par le programme, qui arrivent.</p>';
    document.querySelector(`[data-liste="${partie}"]`).innerHTML = titreEx + L.map(({ e, k }, idx) => {
      const nom = e.bilan ? `Bilan ${++nb}` : e.quizCours ? `Quiz ${++nq}` : e.avenir ? '' : `Exercice ${++n}`;
      const avant = (idx === premierBilan ? titreBilan : '') + (idx === premierQuiz ? titreQuiz : '') + (idx === premierAvenir ? titreAvenir : '');
      return avant + (e.avenir
        ? `<button type="button" class="home-mode-button avenir" disabled><span class="label">${e.titre}</span><span class="desc">bientôt</span></button>`
        : `<button type="button" class="home-mode-button${e.bilan ? ' bilan' : ''}${e.quizCours ? ' bilan quiz' : ''}" data-partie-ex="${partie}" data-k="${k}" data-nom="${nom}"><span class="label"><strong>${nom}</strong><br>${e.titre}</span></button>`);
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
  if (e.quiz) return questionsQuiz(e.quiz, e.n || 12);
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
const touchesClavier = (h, neg) => ['7', '8', '9', '4', '5', '6', '1', '2', '3', ',', '0', '⌫', ...(h ? ['h'] : []), ...(neg ? ['−'] : [])];
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
    z.innerHTML = `<form class="mm-saisie" id="mm-form" autocomplete="off"><input id="mm-input" name="mm-reponse-calcul" type="text" inputmode="${q.saisie.h || q.saisie.neg ? 'text' : 'decimal'}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" data-form-type="other" aria-label="Ta réponse" placeholder="${q.saisie.h ? '15 h 45' : '?'}" />${q.saisie.unite ? `<span class="mm-unite">${q.saisie.unite}</span>` : ''}</form>
      <p id="mm-indice" class="mm-indice hidden" aria-live="polite"></p>
      <div class="mm-clavier${q.saisie.h || q.saisie.neg ? ' avec-h' : ''}">${touchesClavier(q.saisie.h, q.saisie.neg).map((t) => `<button type="button" class="mm-touche" data-t="${t}">${t}</button>`).join('')}</div>
      <button type="button" class="primary-button mm-valider" id="mm-valider">Valider ✓</button>`;
    const inp = $('mm-input');
    z.querySelectorAll('.mm-touche').forEach((b) => b.addEventListener('click', () => {
      if (game.repondu) return;
      const t = b.dataset.t;
      if (t === '⌫') inp.value = inp.value.slice(0, -1);
      else if (t === 'h') inp.value = `${inp.value.trim()} h `;
      else if (t === '−') inp.value = inp.value.startsWith('−') ? inp.value.slice(1) : `−${inp.value}`; /* v6 : change le signe */
      else inp.value += t;
    }));
    /* v4 : comme dans MNEMOGRAM, la case est dans son propre petit formulaire, sans aucun champ de mot de passe :
       Chrome ne la rattache donc plus au formulaire de connexion et n'y propose plus l'identifiant enregistré. */
    inp.value = '';
    inp.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); valideSaisie(); } });
    $('mm-form').addEventListener('submit', (ev) => { ev.preventDefault(); valideSaisie(); });
    /* au cas où un navigateur forcerait malgré tout un remplissage : on efface ce qui ressemble à un identifiant
       (un @, ou un mot de 4 lettres ou plus). v5 : « 4,50 € », « 12 cm », « 15 h 45 », « 90 min » restent permis. */
    const nettoie = () => { if (/@/.test(inp.value) || /\p{L}{4,}/u.test(inp.value)) inp.value = ''; };
    inp.addEventListener('input', nettoie);
    inp.addEventListener('change', nettoie);
    setTimeout(nettoie, 300);
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
  /* v6 : q.saisie.tol = l'écart permis (pour les calculs avec π arrondis) */
  const juste = Math.abs(val - q.saisie.bonne) <= (q.saisie.tol || 1e-9);
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
