/* ============================================================
   MNEMOGRAM — ILLUSTRATIONS (v110)
   Une scène fixe par texte, dessinée à partir d'une petite bibliothèque
   (personnages, animaux, objets, décors). Une scène peut avoir 1 à 3 « moments »
   qui se lisent de gauche à droite, comme un chemin d'images.
   Les scènes elles-mêmes sont décrites dans illus-ce.js (une fiche par texte).
   Style CE : trait sombre un peu épais, aplats de couleurs vives.
   ------------------------------------------------------------ */
(function () {
  const K = '#2b2118';                      /* couleur du trait */
  const ST = `stroke="${K}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
  const H = 240, SOL = 198;                 /* hauteur d'un moment, ligne du sol */
  const PEAUX = { c: '#ffd9b8', m: '#e8b48a', f: '#b77b4f', t: '#8a5a3a' };

  /* ---------- PERSONNAGES ---------- */
  /* p : { peau, ch (court, long, tresses, chignon, boucle, chauve, couettes), cc, haut, bas, jupe, taille (1 enfant, 1.3 adulte, .7 bébé),
          bras (bas, haut, tend, deux), visage (sourit, rit, peur, triste, dort, crie), acc : [lunettes, chapeau, tablier, casquette, toque, nez, barbe, moustache, bonnet] } */
  function personne(p) {
    const t = p.taille || 1, peau = PEAUX[p.peau || 'c'] || p.peau, cc = p.cc || '#6b3a1e';
    const jambe = 24 * t, corps = 28 * t, r = 11 + (t > 1.1 ? 1 : 0), yc = -jambe - corps - r + 2;
    let s = '';
    /* jambes */
    s += `<path d="M-6 ${-jambe} L-7 -2 M6 ${-jambe} L7 -2" fill="none" ${ST} stroke-width="5" stroke="${p.bas || '#3b4a6b'}"/>`;
    s += `<path d="M-11 -1 L-3 -1 M3 -1 L11 -1" fill="none" ${ST} stroke-width="4"/>`;
    /* corps */
    if (p.jupe) s += `<path d="M-10 ${-jambe - corps} Q0 ${-jambe - corps - 3} 10 ${-jambe - corps} L16 ${-jambe + 2} Q0 ${-jambe + 6} -16 ${-jambe + 2} Z" fill="${p.haut || '#ff8fd0'}" ${ST}/>`;
    else s += `<path d="M-11 ${-jambe - corps} Q0 ${-jambe - corps - 3} 11 ${-jambe - corps} L12 ${-jambe + 1} Q0 ${-jambe + 4} -12 ${-jambe + 1} Z" fill="${p.haut || '#3a7bd5'}" ${ST}/>`;
    if ((p.acc || []).includes('tablier')) s += `<path d="M-7 ${-jambe - corps + 8} L7 ${-jambe - corps + 8} L8 ${-jambe} L-8 ${-jambe} Z" fill="#fff" ${ST}/>`;
    /* bras */
    const ya = -jambe - corps + 5, b = p.bras || 'bas';
    const bras = {
      bas: `M-11 ${ya} L-17 ${ya + 22} M11 ${ya} L17 ${ya + 22}`,
      haut: `M-11 ${ya} L-20 ${ya - 20} M11 ${ya} L20 ${ya - 20}`,
      tend: `M-11 ${ya} L-17 ${ya + 22} M11 ${ya} L30 ${ya + 4}`,
      deux: `M-11 ${ya} L-28 ${ya + 4} M11 ${ya} L28 ${ya + 4}`,
      leve: `M-11 ${ya} L-17 ${ya + 22} M11 ${ya} L18 ${ya - 22}`,
    }[b] || '';
    s += `<path d="${bras}" fill="none" ${ST} stroke-width="5" stroke="${p.haut || '#3a7bd5'}"/>`;
    /* tête */
    const ch = p.ch || 'court';
    if (ch === 'long' || ch === 'tresses' || ch === 'couettes') s += `<path d="M-13 ${yc} Q-15 ${yc + 18} -10 ${yc + 20} L10 ${yc + 20} Q15 ${yc + 18} 13 ${yc} Z" fill="${cc}" ${ST}/>`;
    s += `<circle cx="0" cy="${yc}" r="${r}" fill="${peau}" ${ST}/>`;
    if (ch !== 'chauve') {
      const top = {
        court: `M-${r} ${yc - 1} Q-${r} ${yc - r - 6} 0 ${yc - r - 3} Q${r} ${yc - r - 6} ${r} ${yc - 1} Q${r - 2} ${yc - 7} 2 ${yc - 8} Q-${r - 2} ${yc - 8} -${r} ${yc - 1} Z`,
        long: `M-${r + 1} ${yc + 2} Q-${r + 2} ${yc - r - 5} 0 ${yc - r - 3} Q${r + 2} ${yc - r - 5} ${r + 1} ${yc + 2} Q${r - 3} ${yc - 8} 0 ${yc - 7} Q-${r - 3} ${yc - 8} -${r + 1} ${yc + 2} Z`,
        boucle: `M-${r + 2} ${yc} q-3 -8 3 -12 q0 -7 8 -6 q4 -6 10 -1 q7 -1 7 6 q5 4 1 12 q-6 -7 -14 -7 q-9 0 -15 8 Z`,
        chignon: `M-${r} ${yc - 1} Q-${r} ${yc - r - 5} 0 ${yc - r - 3} Q${r} ${yc - r - 5} ${r} ${yc - 1} Q0 ${yc - 9} -${r} ${yc - 1} Z`,
      };
      const d = top[ch === 'tresses' || ch === 'couettes' ? 'long' : ch] || top.court;
      s += `<path d="${d}" fill="${cc}" ${ST}/>`;
      if (ch === 'chignon') s += `<circle cx="0" cy="${yc - r - 6}" r="6" fill="${cc}" ${ST}/>`;
      if (ch === 'couettes') s += `<circle cx="-${r + 5}" cy="${yc - 2}" r="5" fill="${cc}" ${ST}/><circle cx="${r + 5}" cy="${yc - 2}" r="5" fill="${cc}" ${ST}/>`;
      if (ch === 'tresses') s += `<path d="M-${r} ${yc + 6} l-3 16 M${r} ${yc + 6} l3 16" fill="none" ${ST} stroke-width="5" stroke="${cc}"/>`;
    }
    /* visage */
    const v = p.visage || 'sourit';
    if (v === 'dort') s += `<path d="M-6 ${yc} q2 2 4 0 M2 ${yc} q2 2 4 0" fill="none" ${ST} stroke-width="1.5"/>`;
    else s += `<circle cx="-4" cy="${yc - 1}" r="1.6" fill="${K}"/><circle cx="4" cy="${yc - 1}" r="1.6" fill="${K}"/>`;
    const bouche = { sourit: `M-4 ${yc + 5} Q0 ${yc + 8} 4 ${yc + 5}`, rit: `M-5 ${yc + 4} Q0 ${yc + 11} 5 ${yc + 4} Z`, triste: `M-4 ${yc + 7} Q0 ${yc + 4} 4 ${yc + 7}`, dort: `M-2 ${yc + 6} L2 ${yc + 6}` }[v];
    if (v === 'peur' || v === 'crie') s += `<ellipse cx="0" cy="${yc + 6}" rx="2.5" ry="${v === 'crie' ? 4 : 3}" fill="${K}"/>`;
    else s += `<path d="${bouche}" fill="${v === 'rit' ? '#c0392b' : 'none'}" ${ST} stroke-width="1.5"/>`;
    /* accessoires */
    const A = p.acc || [];
    if (A.includes('lunettes')) s += `<circle cx="-4" cy="${yc - 1}" r="3.5" fill="none" ${ST} stroke-width="1.2"/><circle cx="4" cy="${yc - 1}" r="3.5" fill="none" ${ST} stroke-width="1.2"/>`;
    if (A.includes('moustache')) s += `<path d="M-5 ${yc + 3} Q0 ${yc + 1} 5 ${yc + 3}" fill="none" ${ST} stroke-width="2.5" stroke="${cc}"/>`;
    if (A.includes('barbe')) s += `<path d="M-${r} ${yc + 2} Q0 ${yc + r + 10} ${r} ${yc + 2} Q0 ${yc + 9} -${r} ${yc + 2} Z" fill="${cc}" ${ST}/>`;
    if (A.includes('nez')) s += `<circle cx="0" cy="${yc + 2}" r="3.5" fill="#ff3b3b" ${ST} stroke-width="1"/>`;
    if (A.includes('chapeau')) s += `<path d="M-${r + 7} ${yc - r + 1} L${r + 7} ${yc - r + 1} M-8 ${yc - r + 1} L-7 ${yc - r - 12} L7 ${yc - r - 12} L8 ${yc - r + 1}" fill="${p.chapeau || '#2b2118'}" ${ST}/>`;
    if (A.includes('casquette')) s += `<path d="M-${r} ${yc - 4} Q0 ${yc - r - 8} ${r} ${yc - 4} Z M${r - 2} ${yc - 5} L${r + 9} ${yc - 3}" fill="${p.chapeau || '#e74c3c'}" ${ST}/>`;
    if (A.includes('bonnet')) s += `<path d="M-${r} ${yc - 3} Q0 ${yc - r - 12} ${r} ${yc - 3} Z" fill="${p.chapeau || '#e74c3c'}" ${ST}/><circle cx="0" cy="${yc - r - 8}" r="3.5" fill="#fff" ${ST} stroke-width="1"/>`;
    if (A.includes('toque')) s += `<path d="M-8 ${yc - r + 2} L-8 ${yc - r - 6} q-6 -10 4 -10 q4 -6 8 0 q10 0 4 10 L8 ${yc - r + 2} Z" fill="#fff" ${ST}/>`;
    if (A.includes('couronne')) s += `<path d="M-8 ${yc - r} L-8 ${yc - r - 9} L-4 ${yc - r - 4} L0 ${yc - r - 10} L4 ${yc - r - 4} L8 ${yc - r - 9} L8 ${yc - r} Z" fill="#ffd23f" ${ST}/>`;
    return s;
  }
  /* personnages récurrents */
  const PERSOS = {
    leo: { peau: 'c', ch: 'court', cc: '#6b3a1e', haut: '#3a7bd5', bas: '#2b3a55' },
    lina: { peau: 'm', ch: 'couettes', cc: '#2b2118', haut: '#ff7eb6', jupe: true, bas: '#7a4fa0' },
    maman: { peau: 'c', ch: 'long', cc: '#e0a52a', haut: '#2fb67c', jupe: true, taille: 1.3, bas: '#2f6f5a' },
    papa: { peau: 'c', ch: 'court', cc: '#2b2118', haut: '#e85d3a', taille: 1.35, bas: '#3b4a6b' },
    mamie: { peau: 'c', ch: 'chignon', cc: '#d9d9d9', haut: '#9b59b6', jupe: true, taille: 1.25, acc: ['lunettes'] },
    papi: { peau: 'c', ch: 'chauve', cc: '#d9d9d9', haut: '#8d6e63', taille: 1.3, acc: ['moustache', 'lunettes'] },
    maitresse: { peau: 'f', ch: 'chignon', cc: '#2b2118', haut: '#f39c12', jupe: true, taille: 1.3, acc: ['lunettes'] },
    tom: { peau: 'f', ch: 'boucle', cc: '#2b2118', haut: '#27ae60', bas: '#34495e' },
    hugo: { peau: 'c', ch: 'court', cc: '#e0a52a', haut: '#c0392b', bas: '#2c3e50' },
    soeur: { peau: 'c', ch: 'tresses', cc: '#c0702a', haut: '#9b59b6', jupe: true, taille: .9 },
    frere: { peau: 'c', ch: 'court', cc: '#c0702a', haut: '#f1c40f', bas: '#2980b9', taille: .85 },
    bebe: { peau: 'c', ch: 'chauve', haut: '#f9e79f', taille: .6 },
    fermier: { peau: 'm', ch: 'court', cc: '#6b3a1e', haut: '#2980b9', taille: 1.35, acc: ['chapeau'], chapeau: '#d4a24c', bas: '#5d4037' },
    clown: { peau: 'c', ch: 'boucle', cc: '#ff6b00', haut: '#f1c40f', taille: 1.3, acc: ['nez'], bas: '#e74c3c' },
    magicien: { peau: 'c', ch: 'court', cc: '#2b2118', haut: '#2c3e50', taille: 1.35, acc: ['chapeau', 'moustache'] },
    marchand: { peau: 'f', ch: 'court', cc: '#2b2118', haut: '#ecf0f1', taille: 1.35, acc: ['casquette', 'tablier'], chapeau: '#3498db' },
    gardien: { peau: 't', ch: 'court', cc: '#2b2118', haut: '#6d8b3a', taille: 1.35, acc: ['casquette'], chapeau: '#556b2f' },
    cuisinier: { peau: 'c', ch: 'court', cc: '#6b3a1e', haut: '#fff', taille: 1.35, acc: ['toque'] },
    fille: { peau: 'f', ch: 'long', cc: '#2b2118', haut: '#e67e22', jupe: true },
    garcon: { peau: 't', ch: 'court', cc: '#2b2118', haut: '#16a085', bas: '#2c3e50' },
    zoe: { peau: 'c', ch: 'long', cc: '#c0392b', haut: '#1abc9c', jupe: true },
  };

  /* ---------- ANIMAUX (tournés vers la droite, pieds au point d'origine) ---------- */
  const oeil = (x, y) => `<circle cx="${x}" cy="${y}" r="1.8" fill="${K}"/>`;
  const quad = (c, l, h, tete, queue) => `<path d="M${-l / 2} ${-6} L${-l / 2} -2 M${-l / 2 + 8} -6 L${-l / 2 + 8} -2 M${l / 2 - 8} -6 L${l / 2 - 8} -2 M${l / 2} -6 L${l / 2} -2" fill="none" ${ST} stroke-width="4"/><ellipse cx="0" cy="${-6 - h / 2}" rx="${l / 2 + 4}" ry="${h / 2}" fill="${c}" ${ST}/>${queue || ''}${tete}`;
  const ANIMAUX = {
    chat: (c = '#f39c12') => quad(c, 30, 14, `<circle cx="20" cy="-24" r="9" fill="${c}" ${ST}/><path d="M14 -30 l2 -9 l5 6 M22 -32 l4 -8 l3 8" fill="${c}" ${ST}/>${oeil(23, -25)}<path d="M28 -22 l8 -1 M28 -20 l8 2" fill="none" ${ST} stroke-width="1"/>`, `<path d="M-19 -14 Q-32 -22 -26 -36" fill="none" ${ST} stroke-width="4" stroke="${c}"/>`),
    chien: (c = '#c8874b') => quad(c, 36, 16, `<circle cx="24" cy="-28" r="10" fill="${c}" ${ST}/><path d="M18 -34 q-6 4 -4 14" fill="#8a5a2e" ${ST}/>${oeil(27, -30)}<circle cx="34" cy="-27" r="2.5" fill="${K}"/>`, `<path d="M-22 -16 Q-30 -26 -26 -32" fill="none" ${ST} stroke-width="4" stroke="${c}"/>`),
    lapin: (c = '#ecf0f1') => `<ellipse cx="0" cy="-12" rx="14" ry="11" fill="${c}" ${ST}/><circle cx="12" cy="-24" r="8" fill="${c}" ${ST}/><path d="M9 -30 q-2 -18 3 -18 q4 2 1 18 M14 -30 q4 -16 8 -14 q2 4 -4 15" fill="${c}" ${ST}/>${oeil(15, -25)}<circle cx="-14" cy="-14" r="4" fill="#fff" ${ST}/>`,
    vache: () => quad('#fff', 50, 24, `<path d="M26 -36 q8 -4 16 4 q2 12 -6 14 q-8 0 -12 -6 Z" fill="#fff" ${ST}/><path d="M28 -38 l-4 -6 M38 -36 l4 -6" fill="none" ${ST}/><ellipse cx="40" cy="-21" rx="5" ry="4" fill="#f5b7b1" ${ST}/>${oeil(32, -31)}`, `<circle cx="-8" cy="-22" r="5" fill="${K}"/><circle cx="8" cy="-14" r="4" fill="${K}"/><path d="M-27 -24 Q-34 -14 -30 -6" fill="none" ${ST}/>`),
    cochon: () => quad('#f8b6c4', 36, 18, `<circle cx="22" cy="-22" r="10" fill="#f8b6c4" ${ST}/><ellipse cx="31" cy="-20" rx="4" ry="5" fill="#f19cb0" ${ST}/>${oeil(22, -25)}<path d="M16 -30 l3 -6 l4 5" fill="#f8b6c4" ${ST}/>`, `<path d="M-22 -18 q-6 -2 -4 -8 q4 0 2 4" fill="none" ${ST} stroke-width="1.5"/>`),
    poule: (c = '#c0703a') => `<path d="M-4 -2 L-4 -8 M4 -2 L4 -8" fill="none" ${ST} stroke-width="2"/><ellipse cx="0" cy="-16" rx="13" ry="10" fill="${c}" ${ST}/><circle cx="10" cy="-26" r="6" fill="${c}" ${ST}/><path d="M8 -32 l2 -4 l2 4 l2 -3 l1 4" fill="#e74c3c" ${ST} stroke-width="1"/><path d="M16 -26 l5 2 l-5 2 Z" fill="#f1c40f" ${ST} stroke-width="1"/>${oeil(11, -27)}`,
    coq: () => `<path d="M-4 -2 L-4 -10 M4 -2 L4 -10" fill="none" ${ST} stroke-width="2"/><path d="M-12 -18 Q-26 -34 -18 -44 Q-12 -30 -6 -26" fill="#1e8449" ${ST}/><ellipse cx="0" cy="-18" rx="13" ry="10" fill="#d35400" ${ST}/><circle cx="10" cy="-30" r="7" fill="#d35400" ${ST}/><path d="M6 -37 l3 -6 l3 5 l3 -5 l1 6" fill="#e74c3c" ${ST} stroke-width="1"/><path d="M17 -30 l6 2 l-6 2 Z" fill="#f1c40f" ${ST} stroke-width="1"/>${oeil(11, -31)}`,
    canard: () => `<ellipse cx="0" cy="-8" rx="14" ry="8" fill="#fff" ${ST}/><circle cx="10" cy="-20" r="7" fill="#27ae60" ${ST}/><path d="M16 -20 l8 1 l-8 3 Z" fill="#f39c12" ${ST} stroke-width="1"/>${oeil(11, -22)}`,
    mouton: () => quad('#fdfefe', 34, 20, `<ellipse cx="22" cy="-22" rx="7" ry="9" fill="#2b2118" ${ST}/>${'<circle cx="24" cy="-24" r="1.5" fill="#fff"/>'}`, `<path d="M-18 -26 q4 -8 10 -4 q4 -8 10 -2 q6 -6 10 2" fill="#fdfefe" ${ST}/>`),
    cheval: () => quad('#a0522d', 50, 20, `<path d="M20 -24 L30 -52 Q40 -56 46 -46 L38 -40 L32 -28 Z" fill="#a0522d" ${ST}/><path d="M28 -50 Q20 -40 22 -28" fill="none" ${ST} stroke-width="5" stroke="#2b2118"/>${oeil(36, -48)}`, `<path d="M-28 -24 Q-38 -16 -34 -4" fill="none" ${ST} stroke-width="5" stroke="#2b2118"/>`),
    oiseau: (c = '#3498db') => `<ellipse cx="0" cy="-6" rx="8" ry="6" fill="${c}" ${ST}/><circle cx="7" cy="-11" r="4.5" fill="${c}" ${ST}/><path d="M11 -11 l5 1 l-5 2 Z" fill="#f39c12" stroke="${K}" stroke-width="1"/><path d="M-4 -8 q-2 -8 6 -6" fill="none" ${ST} stroke-width="1.5"/>${oeil(8, -12)}`,
    lion: () => quad('#e6a23c', 44, 20, `<circle cx="28" cy="-34" r="16" fill="#a0521d" ${ST}/><circle cx="30" cy="-33" r="10" fill="#f0b858" ${ST}/>${oeil(33, -35)}<path d="M33 -28 q3 2 6 0" fill="none" ${ST} stroke-width="1.5"/>`, `<path d="M-26 -18 Q-36 -10 -34 -2" fill="none" ${ST} stroke-width="3"/>`),
    singe: () => `<path d="M-6 -2 L-6 -14 M6 -2 L6 -14 M-10 -26 L-20 -14 M10 -26 L20 -36" fill="none" ${ST} stroke-width="5" stroke="#8d5524"/><ellipse cx="0" cy="-22" rx="11" ry="12" fill="#8d5524" ${ST}/><circle cx="0" cy="-42" r="10" fill="#8d5524" ${ST}/><ellipse cx="1" cy="-40" rx="7" ry="6" fill="#e0ac69" ${ST}/>${oeil(-2, -42)}${oeil(4, -42)}<path d="M-4 -37 q4 3 8 0" fill="none" ${ST} stroke-width="1.5"/><path d="M-12 -10 Q-28 -4 -24 -26" fill="none" ${ST} stroke-width="3" stroke="#8d5524"/>`,
    girafe: () => `<path d="M-14 -2 L-14 -30 M-6 -2 L-6 -30 M10 -2 L10 -30 M18 -2 L18 -30" fill="none" ${ST} stroke-width="4" stroke="#f4c542"/><ellipse cx="2" cy="-36" rx="22" ry="11" fill="#f4c542" ${ST}/><path d="M14 -40 L26 -96 L34 -94 L24 -38 Z" fill="#f4c542" ${ST}/><ellipse cx="34" cy="-98" rx="11" ry="7" fill="#f4c542" ${ST}/><path d="M28 -104 l-2 -8 M34 -104 l1 -8" fill="none" ${ST}/>${oeil(34, -100)}<circle cx="-6" cy="-38" r="4" fill="#a0522d"/><circle cx="8" cy="-34" r="3.5" fill="#a0522d"/><circle cx="21" cy="-62" r="3" fill="#a0522d"/><circle cx="25" cy="-82" r="3" fill="#a0522d"/>`,
    elephant: () => quad('#95a5a6', 56, 32, `<circle cx="30" cy="-40" r="16" fill="#95a5a6" ${ST}/><path d="M42 -34 Q52 -20 46 -6" fill="none" ${ST} stroke-width="7" stroke="#95a5a6"/><ellipse cx="22" cy="-40" rx="9" ry="13" fill="#7f8c8d" ${ST}/>${oeil(36, -45)}`, ''),
    ours: () => quad('#6e4b2a', 46, 26, `<circle cx="28" cy="-36" r="13" fill="#6e4b2a" ${ST}/><circle cx="22" cy="-48" r="5" fill="#6e4b2a" ${ST}/><circle cx="34" cy="-48" r="5" fill="#6e4b2a" ${ST}/><ellipse cx="35" cy="-32" rx="5" ry="4" fill="#c69c6d" ${ST}/>${oeil(30, -39)}`, ''),
    serpent: () => `<path d="M-30 -6 Q-20 -18 -8 -6 Q4 6 14 -6 Q20 -14 26 -14" fill="none" ${ST} stroke-width="9" stroke="#27ae60"/><path d="M-30 -6 Q-20 -18 -8 -6 Q4 6 14 -6 Q20 -14 26 -14" fill="none" stroke="#2b2118" stroke-width="1" stroke-dasharray="2 6"/><circle cx="28" cy="-15" r="6" fill="#27ae60" ${ST}/>${oeil(30, -17)}<path d="M33 -14 l6 0 l3 -2 M39 -14 l3 2" fill="none" stroke="#e74c3c" stroke-width="1.5"/>`,
    pingouin: () => `<ellipse cx="0" cy="-18" rx="11" ry="17" fill="#2b2118" ${ST}/><ellipse cx="2" cy="-16" rx="7" ry="12" fill="#fff"/><circle cx="2" cy="-36" r="8" fill="#2b2118" ${ST}/><circle cx="4" cy="-37" r="2" fill="#fff"/><path d="M9 -35 l6 2 l-6 2 Z" fill="#f39c12"/><path d="M-6 -1 l5 0 M3 -1 l6 0" fill="none" stroke="#f39c12" stroke-width="3"/>`,
    ecureuil: () => `<path d="M-6 -6 Q-26 -14 -18 -34 Q-10 -46 -4 -34 Q-12 -24 -4 -14" fill="#d35400" ${ST}/><ellipse cx="4" cy="-12" rx="8" ry="10" fill="#e67e22" ${ST}/><circle cx="8" cy="-26" r="6" fill="#e67e22" ${ST}/><path d="M6 -31 l1 -5 l3 4" fill="#e67e22" ${ST} stroke-width="1"/>${oeil(10, -27)}`,
    biche: () => quad('#c68642', 38, 16, `<path d="M16 -18 L24 -40 L30 -40 L26 -18 Z" fill="#c68642" ${ST}/><ellipse cx="30" cy="-42" rx="8" ry="6" fill="#c68642" ${ST}/><path d="M24 -46 l-4 -7 M28 -47 l0 -8" fill="none" ${ST}/>${oeil(31, -44)}`, `<circle cx="-14" cy="-20" r="2" fill="#fff"/><circle cx="-4" cy="-24" r="2" fill="#fff"/>`),
    souris: () => `<ellipse cx="0" cy="-6" rx="9" ry="6" fill="#bdc3c7" ${ST}/><circle cx="7" cy="-10" r="4" fill="#bdc3c7" ${ST}/><circle cx="5" cy="-15" r="3" fill="#f5b7b1" ${ST} stroke-width="1"/>${oeil(9, -10)}<path d="M-9 -5 Q-18 -2 -20 -10" fill="none" ${ST} stroke-width="1.5"/>`,
    renard: () => quad('#e67e22', 36, 14, `<path d="M16 -22 L34 -22 L22 -36 Z M18 -30 l1 -10 l6 6 M24 -32 l5 -8 l2 9" fill="#e67e22" ${ST}/>${oeil(24, -27)}`, `<path d="M-20 -12 Q-38 -14 -34 -28 Q-26 -18 -20 -16" fill="#e67e22" ${ST}/><path d="M-34 -28 l-2 4 l4 0 Z" fill="#fff"/>`),
    chouette: () => `<ellipse cx="0" cy="-16" rx="12" ry="16" fill="#8e6e53" ${ST}/><circle cx="-5" cy="-24" r="6" fill="#fff36b" ${ST}/><circle cx="5" cy="-24" r="6" fill="#fff36b" ${ST}/>${oeil(-5, -24)}${oeil(5, -24)}<path d="M-2 -19 l2 4 l2 -4 Z" fill="#f39c12" stroke="${K}" stroke-width="1"/><path d="M-10 -32 l-2 -6 l6 3 M10 -32 l2 -6 l-6 3" fill="#8e6e53" ${ST}/>`,
    poisson: (c = '#ff8a1f') => `<path d="M-14 -8 Q0 -20 12 -8 Q0 4 -14 -8 Z M-14 -8 l-8 -6 l0 12 Z" fill="${c}" ${ST}/>${oeil(5, -10)}`,
    crabe: () => `<ellipse cx="0" cy="-8" rx="12" ry="7" fill="#e74c3c" ${ST}/><path d="M-10 -12 l-8 -8 M10 -12 l8 -8 M-8 -4 l-6 4 M8 -4 l6 4" fill="none" ${ST} stroke-width="2"/><circle cx="-18" cy="-22" r="4" fill="#e74c3c" ${ST}/><circle cx="18" cy="-22" r="4" fill="#e74c3c" ${ST}/>${oeil(-3, -12)}${oeil(3, -12)}`,
    dragon: () => `<path d="M-40 -10 Q-60 -20 -54 -40 Q-44 -24 -32 -22" fill="#2ecc71" ${ST}/><ellipse cx="-6" cy="-24" rx="32" ry="18" fill="#2ecc71" ${ST}/><path d="M-14 -38 Q-30 -76 4 -64 Q-6 -52 -2 -40 Z" fill="#27ae60" ${ST}/><path d="M-20 -6 L-20 -2 M10 -6 L10 -2" fill="none" ${ST} stroke-width="6"/><path d="M18 -30 L34 -54 Q52 -60 58 -48 L50 -40 L36 -36 Z" fill="#2ecc71" ${ST}/>${oeil(46, -50)}<path d="M38 -58 l-2 -8 l6 4" fill="#f1c40f" ${ST} stroke-width="1"/><path d="M-30 -42 l4 -8 l4 8 M-16 -44 l4 -8 l4 8 M-2 -42 l4 -8 l4 8" fill="#f1c40f" ${ST} stroke-width="1"/>`,
    chevreau: () => quad('#fdfefe', 30, 14, `<path d="M16 -18 L22 -32 L30 -30 L26 -18 Z" fill="#fdfefe" ${ST}/><path d="M22 -34 l-2 -6 M26 -34 l2 -6" fill="none" ${ST}/>${oeil(26, -28)}`, ''),
    loup: () => quad('#7f8c8d', 44, 18, `<path d="M20 -26 L46 -24 L28 -40 Z M22 -36 l0 -10 l7 6 M28 -38 l5 -8 l2 9" fill="#7f8c8d" ${ST}/>${oeil(30, -32)}<path d="M38 -24 l2 3 l2 -3 l2 3" fill="none" ${ST} stroke-width="1" stroke="#fff"/>`, `<path d="M-26 -18 Q-40 -16 -38 -30" fill="none" ${ST} stroke-width="5" stroke="#7f8c8d"/>`),
    fourmi: () => `<circle cx="-6" cy="-4" r="3" fill="${K}"/><circle cx="0" cy="-4" r="2.5" fill="${K}"/><circle cx="5" cy="-5" r="2.5" fill="${K}"/><path d="M-4 -2 l-3 3 M0 -2 l0 3 M3 -2 l3 3" stroke="${K}" stroke-width="1"/>`,
  };

  /* ---------- OBJETS ---------- */
  const OBJETS = {
    arbre: (c = '#2fb46a') => `<path d="M-6 0 L-5 -50 L5 -50 L6 0 Z" fill="#8a5a2e" ${ST}/><path d="M-36 -54 Q-44 -86 -16 -92 Q-6 -112 16 -98 Q42 -100 38 -72 Q48 -50 22 -46 Q0 -38 -18 -46 Q-38 -42 -36 -54 Z" fill="${c}" ${ST}/>`,
    pommier: () => OBJETS.arbre() + '<circle cx="-18" cy="-66" r="4" fill="#e74c3c" stroke="#2b2118"/><circle cx="12" cy="-80" r="4" fill="#e74c3c" stroke="#2b2118"/><circle cx="20" cy="-58" r="4" fill="#e74c3c" stroke="#2b2118"/>',
    sapin: () => `<path d="M-4 0 L-4 -12 L4 -12 L4 0 Z" fill="#8a5a2e" ${ST}/><path d="M0 -80 L-22 -44 L-12 -44 L-28 -12 L28 -12 L12 -44 L22 -44 Z" fill="#1e7a46" ${ST}/>`,
    buisson: () => `<path d="M-24 0 Q-30 -20 -12 -22 Q-4 -34 10 -24 Q28 -24 24 0 Z" fill="#3cb371" ${ST}/>`,
    fleur: (c = '#ff5a8a') => `<path d="M0 0 L0 -18" fill="none" ${ST} stroke="#2e8b57"/><circle cx="-4" cy="-22" r="4" fill="${c}" ${ST} stroke-width="1.2"/><circle cx="4" cy="-22" r="4" fill="${c}" ${ST} stroke-width="1.2"/><circle cx="0" cy="-26" r="4" fill="${c}" ${ST} stroke-width="1.2"/><circle cx="0" cy="-18" r="4" fill="${c}" ${ST} stroke-width="1.2"/><circle cx="0" cy="-22" r="2.5" fill="#ffd23f"/>`,
    fleurs: () => [-14, 0, 14].map((x, i) => `<g transform="translate(${x} 0)">${OBJETS.fleur(['#ff5a8a', '#ffd23f', '#9b59b6'][i])}</g>`).join(''),
    maison: (c = '#fff1d6') => `<path d="M-40 0 L-40 -50 L40 -50 L40 0 Z" fill="${c}" ${ST}/><path d="M-48 -48 L0 -86 L48 -48 Z" fill="#e74c3c" ${ST}/><path d="M-10 0 L-10 -28 L10 -28 L10 0" fill="#8a4b20" ${ST}/><path d="M-32 -40 L-18 -40 L-18 -26 L-32 -26 Z M18 -40 L32 -40 L32 -26 L18 -26 Z" fill="#7ad0ff" ${ST}/>`,
    grange: () => `<path d="M-46 0 L-46 -56 L0 -84 L46 -56 L46 0 Z" fill="#c0392b" ${ST}/><path d="M-16 0 L-16 -36 L16 -36 L16 0 Z" fill="#7b241c" ${ST}/><path d="M-16 -36 L16 0 M16 -36 L-16 0" stroke="#f5e6c8" stroke-width="2"/><path d="M-8 -64 L8 -64 L8 -50 L-8 -50 Z" fill="#f5e6c8" ${ST}/>`,
    niche: () => `<path d="M-20 0 L-20 -24 L0 -40 L20 -24 L20 0 Z" fill="#d68910" ${ST}/><path d="M-8 0 Q-8 -16 0 -16 Q8 -16 8 0 Z" fill="${K}"/>`,
    cage: () => `<path d="M-34 0 L-34 -60 L34 -60 L34 0 Z" fill="none" ${ST}/>` + [-22, -11, 0, 11, 22].map((x) => `<path d="M${x} 0 L${x} -60" ${ST}/>`).join(''),
    table: (c = '#c98a4b') => `<path d="M-40 -34 L40 -34 L40 -28 L-40 -28 Z" fill="${c}" ${ST}/><path d="M-34 -28 L-34 0 M34 -28 L34 0" ${ST} stroke-width="4"/>`,
    lit: () => `<path d="M-44 -8 L-44 -40 M44 -8 L44 -24" ${ST} stroke-width="5"/><path d="M-44 -24 L44 -24 L44 -10 L-44 -10 Z" fill="#7ad0ff" ${ST}/><ellipse cx="-30" cy="-28" rx="11" ry="6" fill="#fff" ${ST}/>`,
    tableau: () => `<path d="M-60 -50 L60 -50 L60 -110 L-60 -110 Z" fill="#1f4d3a" stroke="#8a5a2e" stroke-width="6"/><path d="M-46 -92 l30 0 M-46 -80 l50 0 M-46 -68 l40 0" stroke="#fff" stroke-width="2"/>`,
    pupitre: () => `<path d="M-22 -26 L22 -26 L22 -20 L-22 -20 Z" fill="#c98a4b" ${ST}/><path d="M-18 -20 L-18 0 M18 -20 L18 0" ${ST} stroke-width="3"/>`,
    livre: (c = '#e74c3c') => `<path d="M-12 0 L12 0 L12 -8 L-12 -8 Z" fill="${c}" ${ST}/><path d="M-10 -8 L-10 -1 L10 -1" fill="#fff" stroke="none"/>`,
    livreOuvert: () => `<path d="M-14 -4 Q-7 -9 0 -6 Q7 -9 14 -4 L14 4 Q7 0 0 3 Q-7 0 -14 4 Z" fill="#fff" ${ST}/><path d="M0 -6 L0 3" ${ST} stroke-width="1"/>`,
    ballon: (c = '#e74c3c') => `<circle cx="0" cy="-9" r="9" fill="${c}" ${ST}/><path d="M-9 -9 Q0 -14 9 -9 M0 -18 Q-4 -9 0 0" fill="none" stroke="#fff" stroke-width="2"/>`,
    ballonFete: (c = '#e74c3c') => `<ellipse cx="0" cy="-40" rx="10" ry="12" fill="${c}" ${ST}/><path d="M0 -28 Q4 -14 0 0" fill="none" ${ST} stroke-width="1"/>`,
    valise: (c = '#ff5a5a') => `<path d="M-20 0 L20 0 L20 -28 L-20 -28 Z" fill="${c}" ${ST}/><path d="M-6 -28 Q0 -38 6 -28" fill="none" ${ST}/>`,
    voiture: (c = '#ff8a1f') => `<path d="M-44 -10 L-40 -26 Q-30 -28 -20 -40 L16 -40 L28 -26 L44 -22 L46 -10 Z" fill="${c}" ${ST}/><path d="M-16 -36 L-2 -36 L-2 -26 L-26 -26 Z M4 -36 L14 -36 L22 -26 L4 -26 Z" fill="#cfefff" ${ST}/><circle cx="-26" cy="-8" r="9" fill="${K}"/><circle cx="-26" cy="-8" r="3" fill="#ccc"/><circle cx="28" cy="-8" r="9" fill="${K}"/><circle cx="28" cy="-8" r="3" fill="#ccc"/>`,
    autobus: () => `<path d="M-56 -8 L-56 -50 L52 -50 L58 -30 L58 -8 Z" fill="#f1c40f" ${ST}/>` + [-48, -26, -4, 18].map((x) => `<path d="M${x} -44 L${x + 18} -44 L${x + 18} -30 L${x} -30 Z" fill="#cfefff" ${ST} stroke-width="1.5"/>`).join('') + `<circle cx="-34" cy="-8" r="9" fill="${K}"/><circle cx="36" cy="-8" r="9" fill="${K}"/>`,
    train: () => `<path d="M-70 -10 L-70 -50 L-10 -50 L-10 -10 Z M-4 -10 L-4 -50 L56 -50 L66 -30 L66 -10 Z" fill="#2e86de" ${ST}/>` + [-62, -38, 4, 28].map((x) => `<path d="M${x} -44 L${x + 18} -44 L${x + 18} -30 L${x} -30 Z" fill="#cfefff" ${ST} stroke-width="1.5"/>`).join('') + [-58, -22, 8, 50].map((x) => `<circle cx="${x}" cy="-8" r="7" fill="${K}"/>`).join(''),
    avion: () => `<path d="M-50 -20 Q-50 -32 -30 -32 L40 -32 Q56 -30 58 -22 Q56 -16 40 -14 L-30 -14 Q-46 -14 -50 -20 Z" fill="#ecf0f1" ${ST}/><path d="M-6 -22 L-22 4 L-8 4 L14 -22 Z M-40 -30 L-52 -48 L-42 -48 L-28 -30 Z" fill="#3498db" ${ST}/>` + [10, 22, 34].map((x) => `<circle cx="${x}" cy="-24" r="3" fill="#7ad0ff" stroke="${K}"/>`).join(''),
    bateau: (c = '#fff8e6') => `<path d="M-30 -8 Q0 4 30 -8 L24 4 Q0 12 -24 4 Z" fill="#8a4b20" ${ST}/><path d="M0 -8 L0 -52" ${ST}/><path d="M2 -50 Q24 -30 2 -12 Z" fill="${c}" ${ST}/>`,
    caravelle: () => OBJETS.bateau(),
    parasol: () => `<path d="M0 0 L0 -52" ${ST} stroke-width="3"/><path d="M-30 -48 Q0 -76 30 -48 Z" fill="#ff5a5a" ${ST}/><path d="M-10 -66 L-6 -48 M10 -66 L6 -48" stroke="#fff" stroke-width="5"/>`,
    chateauSable: () => `<path d="M-22 0 L-22 -24 L-14 -24 L-14 -30 L-8 -30 L-8 -24 L8 -24 L8 -30 L14 -30 L14 -24 L22 -24 L22 0 Z" fill="#f5cd79" ${ST}/><path d="M-4 0 Q-4 -10 0 -10 Q4 -10 4 0" fill="#c8a25a"/><path d="M0 -30 L0 -42 L8 -38 L0 -36" fill="#e74c3c" ${ST} stroke-width="1"/>`,
    gateau: (n = 4) => `<path d="M-26 0 L-26 -20 L26 -20 L26 0 Z" fill="#8b4513" ${ST}/><path d="M-26 -20 Q-20 -14 -13 -20 Q-6 -14 0 -20 Q7 -14 13 -20 Q20 -14 26 -20" fill="#fff" ${ST}/>` + Array.from({ length: n }, (_, i) => { const x = -18 + i * 36 / Math.max(1, n - 1); return `<path d="M${x} -20 L${x} -32" stroke="#3498db" stroke-width="3"/><path d="M${x} -33 q-3 -4 0 -8 q3 4 0 8" fill="#f39c12"/>`; }).join(''),
    cadeau: (c = '#9b59b6') => `<path d="M-14 0 L14 0 L14 -22 L-14 -22 Z" fill="${c}" ${ST}/><path d="M0 0 L0 -22 M-14 -11 L14 -11" stroke="#ffd23f" stroke-width="3"/><path d="M0 -22 q-10 -10 -10 0 Z M0 -22 q10 -10 10 0 Z" fill="#ffd23f" ${ST} stroke-width="1"/>`,
    panier: () => `<path d="M-18 -14 L18 -14 L14 0 L-14 0 Z" fill="#d4a24c" ${ST}/><path d="M-14 -14 Q0 -34 14 -14" fill="none" ${ST}/>`,
    nappe: () => `<path d="M-50 0 L50 0 L40 -14 L-40 -14 Z" fill="#ff6b6b" ${ST}/><path d="M-30 -14 L-36 0 M-10 -14 L-12 0 M10 -14 L12 0 M30 -14 L36 0" stroke="#fff" stroke-width="2"/>`,
    casserole: () => `<path d="M-18 0 L18 0 L18 -20 L-18 -20 Z" fill="#7f8c8d" ${ST}/><path d="M18 -16 L40 -18" ${ST} stroke-width="4"/><path d="M-10 -24 q2 -8 0 -14 M0 -24 q2 -8 0 -14 M10 -24 q2 -8 0 -14" fill="none" stroke="#bdc3c7" stroke-width="2"/>`,
    poele: () => `<ellipse cx="0" cy="-4" rx="22" ry="6" fill="#34495e" ${ST}/><ellipse cx="0" cy="-6" rx="16" ry="4" fill="#f5cd79"/><path d="M20 -6 L44 -12" ${ST} stroke-width="4"/>`,
    crepe: () => `<ellipse cx="0" cy="-30" rx="14" ry="5" fill="#f5cd79" ${ST}/>`,
    saladier: () => `<path d="M-22 -18 Q0 6 22 -18 Z" fill="#7ad0ff" ${ST}/>`,
    oeufs: () => `<ellipse cx="-8" cy="-6" rx="5" ry="6" fill="#fff8e6" ${ST} stroke-width="1.5"/><ellipse cx="4" cy="-6" rx="5" ry="6" fill="#fff8e6" ${ST} stroke-width="1.5"/>`,
    carte: () => `<path d="M-18 -4 L-6 -8 L6 -4 L18 -8 L18 8 L6 12 L-6 8 L-18 12 Z" fill="#f9e79f" ${ST}/><path d="M-10 4 Q0 -2 8 2" fill="none" stroke="#e74c3c" stroke-width="2" stroke-dasharray="3 2"/><path d="M8 -1 l4 4 M12 -1 l-4 4" stroke="#e74c3c" stroke-width="2"/>`,
    enveloppe: () => `<path d="M-14 -2 L14 -2 L14 16 L-14 16 Z" fill="#fff" ${ST}/><path d="M-14 -2 L0 8 L14 -2" fill="none" ${ST}/>`,
    pont: () => `<path d="M-40 -12 Q0 -34 40 -12 L40 -6 Q0 -28 -40 -6 Z" fill="#a0522d" ${ST}/><path d="M-30 -18 L-30 -30 M0 -26 L0 -38 M30 -18 L30 -30 M-30 -30 Q0 -44 30 -30" fill="none" ${ST}/>`,
    ruisseau: () => `<path d="M-80 0 Q-40 -10 0 -2 Q40 6 80 -4 L80 10 Q40 18 0 10 Q-40 2 -80 12 Z" fill="#5dade2" ${ST}/>`,
    cabane: () => `<path d="M-30 0 L-30 -40 L30 -40 L30 0 Z" fill="#c98a4b" ${ST}/><path d="M-38 -38 L0 -64 L38 -38 Z" fill="#8a5a2e" ${ST}/><path d="M-30 -28 L30 -28 M-30 -14 L30 -14" stroke="${K}" stroke-width="1"/><path d="M-8 0 L-8 -24 L8 -24 L8 0" fill="#5d4037" ${ST}/>`,
    echelle: () => `<path d="M-8 0 L-8 -60 M8 0 L8 -60 M-8 -10 L8 -10 M-8 -22 L8 -22 M-8 -34 L8 -34 M-8 -46 L8 -46" fill="none" ${ST} stroke="#8a5a2e" stroke-width="3"/>`,
    marteau: () => `<path d="M0 0 L0 -20" ${ST} stroke="#8a5a2e" stroke-width="4"/><path d="M-8 -24 L8 -24 L8 -18 L-8 -18 Z" fill="#7f8c8d" ${ST}/>`,
    pinceau: () => `<path d="M0 0 L0 -18" ${ST} stroke="#c98a4b" stroke-width="4"/><path d="M-4 -18 L4 -18 L2 -26 L-2 -26 Z" fill="#3498db" ${ST} stroke-width="1"/>`,
    boite: (c = '#3498db') => `<path d="M-16 0 L16 0 L16 -20 L-16 -20 Z" fill="${c}" ${ST}/>`,
    balancoire: () => `<path d="M-30 0 L-20 -70 L20 -70 L30 0" fill="none" ${ST} stroke="#c0392b" stroke-width="4"/><path d="M-6 -70 L-6 -24 M6 -70 L6 -24" ${ST} stroke-width="1.5"/><path d="M-10 -24 L10 -24" ${ST} stroke-width="4"/>`,
    toboggan: () => `<path d="M-30 0 L-30 -56 L-18 -56 M-30 -20 L-18 -20 M-30 -38 L-18 -38 M-18 0 L-18 -56" fill="none" ${ST} stroke-width="3"/><path d="M-18 -56 Q10 -40 30 0 L20 0 Q4 -34 -18 -46 Z" fill="#f1c40f" ${ST}/>`,
    robot: () => `<path d="M-14 -10 L14 -10 L14 -36 L-14 -36 Z" fill="#bdc3c7" ${ST}/><path d="M-10 -36 L10 -36 L10 -54 L-10 -54 Z" fill="#d5dbdb" ${ST}/><circle cx="-4" cy="-46" r="2.5" fill="#3498db"/><circle cx="4" cy="-46" r="2.5" fill="#3498db"/><path d="M0 -54 L0 -60" ${ST}/><circle cx="0" cy="-62" r="3" fill="#e74c3c" ${ST} stroke-width="1"/><circle cx="-8" cy="-5" r="5" fill="${K}"/><circle cx="8" cy="-5" r="5" fill="${K}"/>`,
    glace: (c = '#ff9ff3') => `<path d="M-7 -14 L0 4 L7 -14 Z" fill="#f5cd79" ${ST}/><circle cx="0" cy="-18" r="7" fill="${c}" ${ST}/>`,
    chariotGlaces: () => `<path d="M-30 -14 L30 -14 L30 -46 L-30 -46 Z" fill="#fff" ${ST}/><path d="M-34 -46 Q0 -70 34 -46 Z" fill="#ff9ff3" ${ST}/><circle cx="-18" cy="-8" r="7" fill="${K}"/><circle cx="18" cy="-8" r="7" fill="${K}"/><path d="M-18 -30 l10 0 M2 -30 l14 0" stroke="#e74c3c" stroke-width="3"/>`,
    bonhommeNeige: () => `<circle cx="0" cy="-14" r="15" fill="#fff" ${ST}/><circle cx="0" cy="-38" r="10" fill="#fff" ${ST}/>${oeil(-3, -40)}${oeil(3, -40)}<path d="M0 -37 l8 2 l-8 1 Z" fill="#f39c12"/><path d="M-8 -48 L8 -48 L6 -62 L-6 -62 Z" fill="${K}"/>`,
    chapiteau: () => `<path d="M-60 0 L-60 -40 L60 -40 L60 0 Z" fill="#fff" ${ST}/><path d="M-36 0 L-36 -40 M-12 0 L-12 -40 M12 0 L12 -40 M36 0 L36 -40" stroke="#e74c3c" stroke-width="10"/><path d="M-66 -38 L0 -86 L66 -38 Z" fill="#e74c3c" ${ST}/><path d="M0 -86 L0 -98 L12 -94 L0 -90" fill="#f1c40f" ${ST} stroke-width="1"/><path d="M-12 0 Q0 -24 12 0" fill="${K}"/>`,
    rideau: () => `<path d="M-80 0 L-80 -150 L-40 -150 Q-50 -80 -60 0 Z M80 0 L80 -150 L40 -150 Q50 -80 60 0 Z" fill="#c0392b" ${ST}/><path d="M-80 -150 L80 -150 L80 -136 Q0 -126 -80 -136 Z" fill="#922b21" ${ST}/>`,
    scene: () => `<path d="M-90 0 L90 0 L90 -14 L-90 -14 Z" fill="#8a5a2e" ${ST}/>`,
    chapeauMagique: () => `<path d="M-12 0 L-10 -24 L10 -24 L12 0 Z M-18 0 L18 0" fill="${K}" ${ST}/><path d="M-4 -24 q-4 -14 0 -16 q4 2 2 16 M2 -24 q4 -14 8 -12 q0 4 -6 13" fill="#fff" ${ST} stroke-width="1"/>`,
    squelette: () => `<g fill="none" ${ST} stroke="#efe6cf" stroke-width="5"><path d="M-60 -40 Q-20 -80 30 -60 Q50 -54 60 -76"/><path d="M-30 -56 L-30 0 M-14 -64 L-14 0 M10 -64 L10 0 M24 -60 L24 0"/><path d="M-54 -46 l-6 12 M-44 -52 l-6 12 M-4 -66 l-2 12 M16 -64 l0 12"/></g><g fill="none" ${ST} stroke-width="1.6"><path d="M-60 -40 Q-20 -80 30 -60 Q50 -54 60 -76"/><path d="M-30 -56 L-30 0 M-14 -64 L-14 0 M10 -64 L10 0 M24 -60 L24 0"/></g><path d="M56 -78 L74 -82 L76 -70 L60 -68 Z" fill="#efe6cf" ${ST}/><path d="M64 -70 l2 4 l2 -4 l2 4" stroke="${K}" fill="none" stroke-width="1"/>`,
    vitrine: () => `<path d="M-22 0 L-22 -40 L22 -40 L22 0 Z" fill="#d6eaf8" ${ST}/><path d="M-14 -34 L-4 -24" stroke="#fff" stroke-width="3"/>`,
    banc: () => `<path d="M-30 -14 L30 -14 L30 -10 L-30 -10 Z M-30 -26 L30 -26 L30 -22 L-30 -22 Z" fill="#a0522d" ${ST}/><path d="M-24 -10 L-24 0 M24 -10 L24 0" ${ST} stroke-width="3"/>`,
    etagere: () => `<path d="M-40 0 L-40 -90 L40 -90 L40 0 Z" fill="#a0522d" ${ST}/><path d="M-40 -30 L40 -30 M-40 -60 L40 -60" ${ST}/>` + [[-34, -60, '#e74c3c'], [-26, -60, '#3498db'], [-18, -60, '#f1c40f'], [-8, -60, '#27ae60'], [10, -30, '#9b59b6'], [18, -30, '#e67e22'], [26, -30, '#3498db'], [-30, -30, '#1abc9c'], [8, -60, '#e74c3c'], [16, -60, '#f39c12']].map(([x, y, c]) => `<path d="M${x} ${y} L${x + 7} ${y} L${x + 7} ${y - 22} L${x} ${y - 22} Z" fill="${c}" stroke="${K}" stroke-width="1"/>`).join(''),
    etal: () => `<path d="M-50 -30 L50 -30 L50 0 L-50 0 Z" fill="#c98a4b" ${ST}/><path d="M-56 -60 L56 -60 L50 -46 L-50 -46 Z" fill="#e74c3c" ${ST}/><path d="M-36 -60 L-32 -46 M-12 -60 L-10 -46 M12 -60 L10 -46 M36 -60 L32 -46" stroke="#fff" stroke-width="6"/><path d="M-50 -46 L-50 -30 M50 -46 L50 -30" ${ST}/>` + [-38, -28, -18].map((x) => `<circle cx="${x}" cy="-35" r="6" fill="#e74c3c" ${ST} stroke-width="1"/>`).join('') + [0, 10, 20].map((x) => `<path d="M${x} -40 q4 -2 6 2 q-2 6 -6 6 q-4 -2 0 -8 Z" fill="#e74c3c" ${ST} stroke-width="1"/>`).join('') + `<path d="M28 -30 L46 -30 L46 -40 Z" fill="#f4d03f" ${ST} stroke-width="1"/>`,
    champignon: () => `<path d="M-4 0 L-4 -10 L4 -10 L4 0 Z" fill="#fff" ${ST}/><path d="M-14 -10 Q0 -30 14 -10 Z" fill="#e74c3c" ${ST}/><circle cx="-4" cy="-17" r="2" fill="#fff"/><circle cx="5" cy="-15" r="2" fill="#fff"/>`,
    lampe: () => `<path d="M-6 0 L6 0 L6 -16 L-6 -16 Z" fill="#7f8c8d" ${ST}/><path d="M-8 -16 L8 -16 L4 -24 L-4 -24 Z" fill="#f1c40f" ${ST}/><path d="M10 -20 L60 -40 L60 0 Z" fill="#fff36b" opacity=".45"/>`,
    cartes: () => `<path d="M-12 -2 L0 -2 L0 -18 L-12 -18 Z" fill="#fff" ${ST} stroke-width="1.5" transform="rotate(-12)"/><path d="M0 -2 L12 -2 L12 -18 L0 -18 Z" fill="#fff" ${ST} stroke-width="1.5" transform="rotate(10)"/><path d="M-6 -12 l2 -3 l2 3 l-2 3 Z" fill="#e74c3c"/><path d="M5 -9 l2 -3 l2 3 l-2 3 Z" fill="#e74c3c" transform="rotate(10)"/>`,
    velo: () => `<circle cx="-22" cy="-14" r="14" fill="none" ${ST}/><circle cx="22" cy="-14" r="14" fill="none" ${ST}/><path d="M-22 -14 L-4 -38 L16 -38 L22 -14 M-4 -38 L0 -14 L16 -38 M-8 -42 L2 -42 M16 -38 L14 -48 L22 -50" fill="none" ${ST} stroke="#e74c3c" stroke-width="3"/>`,
    poupee: () => `<path d="M-8 0 L-10 -16 L10 -16 L8 0 Z" fill="#ff7eb6" ${ST}/><circle cx="0" cy="-22" r="6" fill="#ffd9b8" ${ST}/><path d="M-6 -24 q6 -10 12 0" fill="#f1c40f" ${ST} stroke-width="1"/>`,
    rocher: () => `<path d="M-30 0 Q-34 -20 -14 -26 Q4 -34 20 -22 Q34 -14 30 0 Z" fill="#95a5a6" ${ST}/>`,
    grotte: () => `<path d="M-70 0 Q-74 -70 0 -76 Q70 -70 70 0 Z" fill="#7f8c8d" ${ST}/><path d="M-30 0 Q-30 -44 0 -44 Q30 -44 30 0 Z" fill="${K}"/>`,
    nuage: () => `<path d="M-30 0 Q-34 -14 -18 -16 Q-12 -30 4 -24 Q16 -32 26 -20 Q38 -18 32 0 Z" fill="#fff" ${ST}/>`,
    soleil: () => `<circle cx="0" cy="0" r="16" fill="#ffd23f" ${ST}/>` + [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<path d="M0 -22 L0 -30" ${ST} transform="rotate(${a})"/>`).join(''),
    lune: () => `<path d="M0 -18 A18 18 0 1 0 0 18 A11 18 0 1 1 0 -18 Z" fill="#fff36b" ${ST}/>`,
    reveil: () => `<circle cx="0" cy="-12" r="11" fill="#e74c3c" ${ST}/><circle cx="0" cy="-12" r="8" fill="#fff"/><path d="M0 -12 L0 -18 M0 -12 L4 -10" ${ST} stroke-width="1.5"/><path d="M-12 -20 l4 -4 M12 -20 l-4 -4" ${ST}/>`,
    cloche: () => `<path d="M-12 0 Q-12 -22 0 -24 Q12 -22 12 0 Z" fill="#f1c40f" ${ST}/><circle cx="0" cy="2" r="3" fill="${K}"/>`,
    billes: () => ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'].map((c, i) => `<circle cx="${-12 + i * 8}" cy="-4" r="3.5" fill="${c}" ${ST} stroke-width="1"/>`).join(''),
    corde: () => `<path d="M-22 -2 Q0 30 22 -2" fill="none" stroke="#e74c3c" stroke-width="2.5"/>`,
    tracteur: () => `<path d="M-30 -14 L-30 -34 L4 -34 L4 -50 L24 -50 L24 -14 Z" fill="#27ae60" ${ST}/><path d="M8 -46 L20 -46 L20 -34 L8 -34 Z" fill="#cfefff" ${ST}/><circle cx="12" cy="-14" r="16" fill="${K}"/><circle cx="12" cy="-14" r="6" fill="#f1c40f"/><circle cx="-22" cy="-10" r="10" fill="${K}"/><circle cx="-22" cy="-10" r="4" fill="#f1c40f"/>`,
    foin: () => `<path d="M-22 0 Q-24 -26 0 -28 Q24 -26 22 0 Z" fill="#f4d03f" ${ST}/><path d="M-12 -6 l4 -12 M0 -4 l0 -16 M10 -6 l-2 -14" stroke="#c9a227" stroke-width="1.5"/>`,
    mare: () => `<ellipse cx="0" cy="-2" rx="54" ry="10" fill="#5dade2" ${ST}/>`,
    seau: () => `<path d="M-10 -18 L10 -18 L8 0 L-8 0 Z" fill="#3498db" ${ST}/><path d="M-10 -18 Q0 -30 10 -18" fill="none" ${ST} stroke-width="1.5"/>`,
    ble: () => [-12, -4, 4, 12].map((x) => `<path d="M${x} 0 L${x} -26" stroke="#c9a227" stroke-width="2"/><ellipse cx="${x}" cy="-30" rx="3" ry="6" fill="#f4d03f" ${ST} stroke-width="1"/>`).join(''),
    pain: () => `<ellipse cx="0" cy="-8" rx="20" ry="9" fill="#d4a24c" ${ST}/><path d="M-10 -12 l4 6 M0 -14 l4 6 M10 -12 l4 6" stroke="${K}" stroke-width="1.5"/>`,
    porte: () => `<path d="M-18 0 L-18 -70 L18 -70 L18 0 Z" fill="#8a4b20" ${ST}/><circle cx="10" cy="-34" r="2.5" fill="#f1c40f"/>`,
    fenetre: () => `<path d="M-24 -50 L24 -50 L24 -90 L-24 -90 Z" fill="#7ad0ff" ${ST}/><path d="M0 -50 L0 -90 M-24 -70 L24 -70" ${ST} stroke-width="2"/>`,
    tele: () => `<path d="M-24 -20 L24 -20 L24 -52 L-24 -52 Z" fill="#34495e" ${ST}/><path d="M-20 -24 L20 -24 L20 -48 L-20 -48 Z" fill="#85c1e9"/><path d="M-10 -20 L-14 0 M10 -20 L14 0" ${ST}/>`,
    saut: () => `<path d="M-6 0 Q0 -20 6 0" fill="none" ${ST} stroke-dasharray="3 3"/>`,
    bougie: () => `<path d="M-3 0 L3 0 L3 -14 L-3 -14 Z" fill="#fff" ${ST}/><path d="M0 -15 q-3 -4 0 -8 q3 4 0 8" fill="#f39c12"/>`,
    pommeDePin: () => `<ellipse cx="0" cy="-8" rx="6" ry="9" fill="#8a5a2e" ${ST}/><path d="M-5 -10 l10 0 M-5 -5 l10 0" stroke="#5d4037"/>`,
    olives: () => `<path d="M-14 0 L14 0 L12 -10 L-12 -10 Z" fill="#fff" ${ST}/>` + [-8, 0, 8].map((x) => `<ellipse cx="${x}" cy="-13" rx="4" ry="3" fill="#556b2f" stroke="${K}" stroke-width="1"/>`).join(''),
    fromage: () => `<path d="M-16 0 L16 0 L16 -12 L-16 -2 Z" fill="#f4d03f" ${ST}/><circle cx="-2" cy="-4" r="2" fill="#c9a227"/><circle cx="8" cy="-6" r="1.8" fill="#c9a227"/>`,
    pastille: (c = '#f1c40f') => `<circle cx="0" cy="-6" r="6" fill="${c}" ${ST} stroke-width="1"/>`,
    sac: (c = '#2980b9') => `<path d="M-12 0 L12 0 L12 -22 Q0 -28 -12 -22 Z" fill="${c}" ${ST}/><path d="M-6 -14 L6 -14 L6 -6 L-6 -6 Z" fill="none" ${ST} stroke-width="1"/>`,
    manteau: () => `<path d="M-12 0 L-14 -30 L-6 -34 L0 -30 L6 -34 L14 -30 L12 0 Z" fill="#c0392b" ${ST}/>`,
    chaussures: () => `<path d="M-14 0 L-14 -6 Q-8 -10 -2 -6 L-2 0 Z M2 0 L2 -6 Q8 -10 14 -6 L14 0 Z" fill="#6e4b2a" ${ST}/>`,
    tasse: () => `<path d="M-8 0 L8 0 L10 -14 L-10 -14 Z" fill="#fff" ${ST}/><path d="M10 -12 q8 2 0 8" fill="none" ${ST}/><path d="M-4 -18 q2 -4 0 -8 M4 -18 q2 -4 0 -8" stroke="#bdc3c7" fill="none" stroke-width="2"/>`,
    bol: () => `<path d="M-12 -12 Q0 8 12 -12 Z" fill="#3498db" ${ST}/>`,
    skis: () => `<path d="M-30 -2 L30 -6 M-30 4 L30 0" ${ST} stroke="#e74c3c" stroke-width="4"/>`,
    chalet: () => `<path d="M-40 0 L-40 -40 L40 -40 L40 0 Z" fill="#a0522d" ${ST}/><path d="M-50 -38 L0 -76 L50 -38 Z" fill="#fff" ${ST}/><path d="M-26 -30 L-10 -30 L-10 -16 L-26 -16 Z M10 -30 L26 -30 L26 -16 L10 -16 Z" fill="#f9e79f" ${ST}/>`,
    tourniquet: () => `<ellipse cx="0" cy="-8" rx="30" ry="7" fill="#e74c3c" ${ST}/><path d="M0 -8 L0 -30 M-20 -24 L20 -24" ${ST} stroke-width="3"/>`,
    pelle: () => `<path d="M0 0 L0 -36" ${ST} stroke="#8a5a2e" stroke-width="3"/><path d="M-6 0 L6 0 L4 10 L-4 10 Z" fill="#7f8c8d" ${ST}/>`,
    radis: () => [-10, 0, 10].map((x) => `<circle cx="${x}" cy="-4" r="4" fill="#e74c3c" ${ST} stroke-width="1"/><path d="M${x} -8 l-3 -8 M${x} -8 l3 -8" stroke="#27ae60" stroke-width="2"/>`).join(''),
    tomates: () => `<path d="M0 0 L0 -50" stroke="#8a5a2e" stroke-width="2"/><path d="M0 -10 l-10 -6 M0 -26 l10 -6 M0 -40 l-8 -6" stroke="#27ae60" stroke-width="2"/>` + [[-10, -14], [10, -30], [-8, -44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#e74c3c" ${ST} stroke-width="1"/>`).join(''),
    feuilles: () => [[-12, -2, '#e67e22'], [0, -6, '#d35400'], [12, -2, '#f1c40f']].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3" fill="${c}" ${ST} stroke-width="1"/>`).join(''),
    portail: () => `<path d="M-30 0 L-30 -40 M30 0 L30 -40 M-30 -36 L30 -36 M-30 -8 L30 -8" fill="none" ${ST} stroke-width="3"/>` + [-18, -6, 6, 18].map((x) => `<path d="M${x} -8 L${x} -36" ${ST} stroke-width="2"/>`).join(''),
    ciseaux: () => `<circle cx="-6" cy="-4" r="4" fill="none" ${ST} stroke="#e74c3c"/><circle cx="6" cy="-4" r="4" fill="none" ${ST} stroke="#e74c3c"/><path d="M-4 -7 L8 -24 M4 -7 L-8 -24" ${ST} stroke-width="2"/>`,
    planche: () => `<path d="M-40 -6 L40 -10 L40 -2 L-40 2 Z" fill="#d4a24c" ${ST}/>`,
    bouteille: () => `<path d="M-5 0 L5 0 L5 -16 L2 -20 L2 -26 L-2 -26 L-2 -20 L-5 -16 Z" fill="#f39c12" ${ST}/>`,
    boussole: () => `<circle cx="0" cy="-8" r="8" fill="#fff" ${ST}/><path d="M0 -14 l2 6 l-2 6 l-2 -6 Z" fill="#e74c3c"/>`,
    lac: () => `<ellipse cx="0" cy="-4" rx="80" ry="14" fill="#5dade2" ${ST}/>`,
    lacGele: () => `<ellipse cx="0" cy="-4" rx="70" ry="12" fill="#d6eaf8" ${ST}/><path d="M-30 -6 l16 -2 M10 -4 l20 -2" stroke="#fff" stroke-width="2"/>`,
    rails: () => `<path d="M-100 0 L100 0 M-100 -4 L100 -4" stroke="#7f8c8d" stroke-width="2"/>`,
    tableauNoir: () => OBJETS.tableau(),
    nid: () => `<path d="M-12 0 Q0 8 12 0 Q10 -8 0 -6 Q-10 -8 -12 0 Z" fill="#8a5a2e" ${ST}/>`,
    os: () => `<path d="M-10 -4 L10 -4" stroke="#fff" stroke-width="5"/><circle cx="-11" cy="-6" r="3" fill="#fff" ${ST} stroke-width="1"/><circle cx="-11" cy="-2" r="3" fill="#fff" ${ST} stroke-width="1"/><circle cx="11" cy="-6" r="3" fill="#fff" ${ST} stroke-width="1"/><circle cx="11" cy="-2" r="3" fill="#fff" ${ST} stroke-width="1"/>`,
    gamelle: () => `<path d="M-12 0 L12 0 L10 -8 L-10 -8 Z" fill="#e74c3c" ${ST}/><path d="M-8 -8 q8 -6 16 0" fill="#8a5a2e"/>`,
    biscuit: () => `<circle cx="0" cy="-5" r="5" fill="#d4a24c" ${ST} stroke-width="1"/>`,
    assiette: () => `<ellipse cx="0" cy="-2" rx="14" ry="4" fill="#fff" ${ST}/>`,
    verre: () => `<path d="M-5 0 L5 0 L6 -14 L-6 -14 Z" fill="#fff" ${ST} stroke-width="1.5"/>`,
    baguette: () => `<path d="M0 0 L14 -24" stroke="${K}" stroke-width="2.5"/><path d="M14 -24 l2 -6 l2 6 l6 0 l-5 4 l2 6 l-5 -4 l-5 4 l2 -6 l-5 -4 Z" fill="#ffd23f" ${ST} stroke-width="1"/>`,
    appareilPhoto: () => `<path d="M-10 0 L10 0 L10 -12 L-10 -12 Z" fill="#34495e" ${ST}/><circle cx="0" cy="-6" r="4" fill="#85c1e9" ${ST} stroke-width="1"/>`,
    bulles: () => `<circle cx="0" cy="-6" r="3" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="6" cy="-14" r="2.5" fill="none" stroke="#fff" stroke-width="1.5"/>`,
    ville: () => [[-90, 60, '#f5b7b1'], [-50, 90, '#aed6f1'], [-10, 70, '#f9e79f'], [30, 100, '#d7bde2'], [70, 66, '#a9dfbf']].map(([x, h, c]) => `<path d="M${x} 0 L${x + 36} 0 L${x + 36} -${h} L${x} -${h} Z" fill="${c}" ${ST}/>` + `<path d="M${x + 8} -${h - 12} l8 0 l0 10 l-8 0 Z M${x + 20} -${h - 12} l8 0 l0 10 l-8 0 Z" fill="#fff" stroke="${K}" stroke-width="1"/>`).join(''),
    gare: () => `<path d="M-70 0 L-70 -60 L70 -60 L70 0 Z" fill="#f5e6c8" ${ST}/><path d="M-78 -58 L0 -86 L78 -58 Z" fill="#7f8c8d" ${ST}/><circle cx="0" cy="-70" r="8" fill="#fff" ${ST}/><path d="M0 -70 L0 -76 M0 -70 L4 -68" stroke="${K}" stroke-width="1.5"/>`,
    piscine: () => `<path d="M-100 0 L100 0 L100 -30 L-100 -30 Z" fill="#48c9f0" ${ST}/><path d="M-90 -20 q10 -4 20 0 t20 0 M10 -14 q10 -4 20 0 t20 0" fill="none" stroke="#fff" stroke-width="2"/><path d="M-100 -30 L100 -30" stroke="#fff" stroke-width="4"/>`,
    lunettesSoleil: () => `<circle cx="-7" cy="-5" r="5" fill="${K}"/><circle cx="7" cy="-5" r="5" fill="${K}"/><path d="M-2 -6 L2 -6" stroke="${K}" stroke-width="2"/>`,
    plongeoir: () => `<path d="M-4 0 L-4 -40 L4 -40 L4 0 Z" fill="#bdc3c7" ${ST}/><path d="M-4 -40 L40 -42 L40 -38 L-4 -36 Z" fill="#3498db" ${ST}/>`,
  };

  /* ---------- DÉCORS (fond d'un moment, largeur w) ---------- */
  const DECORS = {
    jardin: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#9fdcff"/><path d="M0 ${SOL - 10} Q${w / 2} ${SOL - 24} ${w} ${SOL - 10} L${w} ${H} L0 ${H} Z" fill="#7ccf5b" ${ST}/>`,
    parc: (w) => DECORS.jardin(w),
    ferme: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#b8e6ff"/><path d="M0 ${SOL - 30} Q${w / 3} ${SOL - 60} ${w * .7} ${SOL - 36} Q${w * .9} ${SOL - 30} ${w} ${SOL - 40} L${w} ${H} L0 ${H} Z" fill="#a9d86e" ${ST}/><path d="M0 ${SOL - 8} L${w} ${SOL - 8} L${w} ${H} L0 ${H} Z" fill="#8bc34a"/>`,
    maison: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#fff1c9"/><path d="M0 ${SOL - 6} L${w} ${SOL - 6} L${w} ${H} L0 ${H} Z" fill="#c98a4b" ${ST}/><path d="M0 ${SOL - 70} L${w} ${SOL - 70}" stroke="#f5d79e" stroke-width="3"/>`,
    cuisine: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#e8f8f5"/>` + Array.from({ length: Math.ceil(w / 20) }, (_, i) => `<path d="M${i * 20} 90 L${i * 20} ${SOL - 6}" stroke="#d1f2eb" stroke-width="1"/>`).join('') + `<path d="M0 90 L${w} 90" stroke="#a3e4d7" stroke-width="2"/><path d="M0 ${SOL - 6} L${w} ${SOL - 6} L${w} ${H} L0 ${H} Z" fill="#d7ccc8" ${ST}/>`,
    classe: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#fdebd0"/><path d="M0 ${SOL - 6} L${w} ${SOL - 6} L${w} ${H} L0 ${H} Z" fill="#b9770e" ${ST}/>`,
    plage: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#87d5ff"/><path d="M0 120 L${w} 120 L${w} ${SOL - 16} L0 ${SOL - 16} Z" fill="#2e86de"/><path d="M0 130 q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke="#fff" stroke-width="2"/><path d="M0 ${SOL - 20} Q${w / 2} ${SOL - 30} ${w} ${SOL - 18} L${w} ${H} L0 ${H} Z" fill="#f7dc8f" ${ST}/>`,
    mer: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#87d5ff"/><path d="M0 110 L${w} 110 L${w} ${H} L0 ${H} Z" fill="#2e86de" ${ST}/><path d="M0 140 q12 -6 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke="#fff" stroke-width="2"/>`,
    foret: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#cdeccd"/><path d="M0 ${SOL - 10} L${w} ${SOL - 10} L${w} ${H} L0 ${H} Z" fill="#6fae4b" ${ST}/>` + [.12, .45, .8].map((f) => `<g transform="translate(${w * f} ${SOL - 40}) scale(.8)">${OBJETS.sapin()}</g>`).join(''),
    nuit: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#1b2a49"/><path d="M0 ${SOL - 10} L${w} ${SOL - 10} L${w} ${H} L0 ${H} Z" fill="#24452e" ${ST}/>` + [[.1, 20], [.3, 40], [.55, 18], [.75, 50], [.9, 26]].map(([f, y]) => `<circle cx="${w * f}" cy="${y}" r="1.8" fill="#fff"/>`).join(''),
    neige: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#cfe6f5"/><path d="M0 ${SOL - 20} Q${w / 2} ${SOL - 40} ${w} ${SOL - 18} L${w} ${H} L0 ${H} Z" fill="#fff" ${ST}/>` + [[.1, 30], [.25, 70], [.4, 20], [.6, 60], [.75, 30], [.9, 80], [.5, 110], [.15, 120]].map(([f, y]) => `<circle cx="${w * f}" cy="${y}" r="3" fill="#fff" stroke="#9fb8c8" stroke-width=".8"/>`).join(''),
    cirque: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#3b1f4a"/><path d="M0 0 L${w / 2} 60 L${w} 0" fill="#e74c3c" opacity=".55"/><path d="M0 ${SOL - 6} L${w} ${SOL - 6} L${w} ${H} L0 ${H} Z" fill="#d68910" ${ST}/><ellipse cx="${w / 2}" cy="${SOL}" rx="${w * .42}" ry="14" fill="#f5cba7" ${ST}/>`,
    theatre: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#2c1a35"/><path d="M0 ${SOL - 20} L${w} ${SOL - 20} L${w} ${H} L0 ${H} Z" fill="#8a5a2e" ${ST}/><path d="M0 0 L${w * .2} 0 Q${w * .14} 90 ${w * .06} ${SOL - 20} L0 ${SOL - 20} Z M${w} 0 L${w * .8} 0 Q${w * .86} 90 ${w * .94} ${SOL - 20} L${w} ${SOL - 20} Z" fill="#c0392b" ${ST}/>`,
    zoo: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#b8e6ff"/><path d="M0 ${SOL - 10} L${w} ${SOL - 10} L${w} ${H} L0 ${H} Z" fill="#d4b483" ${ST}/>`,
    musee: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#efe6d4"/><path d="M0 ${SOL - 6} L${w} ${SOL - 6} L${w} ${H} L0 ${H} Z" fill="#b89b72" ${ST}/><path d="M${w * .1} 30 L${w * .3} 30 L${w * .3} 70 L${w * .1} 70 Z" fill="#fff" stroke="#8a6d3b" stroke-width="3"/><circle cx="${w * .2}" cy="50" r="9" fill="#7fb3d5"/>`,
    rue: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#aee1ff"/><g transform="translate(${w / 2} ${SOL - 12})">${OBJETS.ville()}</g><path d="M0 ${SOL - 12} L${w} ${SOL - 12} L${w} ${H} L0 ${H} Z" fill="#95a5a6" ${ST}/>`,
    route: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#aee1ff"/><path d="M0 ${SOL - 40} Q${w / 2} ${SOL - 70} ${w} ${SOL - 44} L${w} ${H} L0 ${H} Z" fill="#7ccf5b" ${ST}/><path d="M0 ${SOL - 14} L${w} ${SOL - 14} L${w} ${SOL + 14} L0 ${SOL + 14} Z" fill="#7f8c8d" ${ST}/><path d="M6 ${SOL} L${w} ${SOL}" stroke="#fff" stroke-width="3" stroke-dasharray="14 10"/>`,
    piscine: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#e8f8f5"/><path d="M0 ${SOL - 50} L${w} ${SOL - 50} L${w} ${H} L0 ${H} Z" fill="#48c9f0" ${ST}/><path d="M10 ${SOL - 30} q10 -4 20 0 t20 0 t20 0 M${w / 2} ${SOL - 10} q10 -4 20 0 t20 0" fill="none" stroke="#fff" stroke-width="2"/>`,
    bibliotheque: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#fbeee6"/><g transform="translate(${w * .25} ${SOL - 6})">${OBJETS.etagere()}</g><g transform="translate(${w * .78} ${SOL - 6})">${OBJETS.etagere()}</g><path d="M0 ${SOL - 6} L${w} ${SOL - 6} L${w} ${H} L0 ${H} Z" fill="#a04000" ${ST}/>`,
    marche: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#aee1ff"/><path d="M0 ${SOL - 10} L${w} ${SOL - 10} L${w} ${H} L0 ${H} Z" fill="#d5d8dc" ${ST}/>`,
    montagne: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#b8e6ff"/><path d="M0 ${SOL - 40} L${w * .3} 50 L${w * .55} ${SOL - 60} L${w * .8} 40 L${w} ${SOL - 50} L${w} ${H} L0 ${H} Z" fill="#fff" ${ST}/><path d="M${w * .22} 80 L${w * .3} 50 L${w * .38} 80 M${w * .72} 70 L${w * .8} 40 L${w * .88} 70" fill="none" stroke="#9fb8c8" stroke-width="2"/>`,
    ciel: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#9fdcff"/>`,
    gare: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#d6eaf8"/><path d="M0 ${SOL - 10} L${w} ${SOL - 10} L${w} ${H} L0 ${H} Z" fill="#bfc9ca" ${ST}/>`,
    grotte: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#b8e6ff"/><path d="M0 ${SOL - 10} L${w} ${SOL - 10} L${w} ${H} L0 ${H} Z" fill="#a9d86e" ${ST}/>`,
    lac: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#b8e6ff"/><path d="M0 ${SOL - 50} L${w} ${SOL - 50} L${w} ${H} L0 ${H} Z" fill="#7ccf5b" ${ST}/><ellipse cx="${w * .6}" cy="${SOL - 30}" rx="${w * .38}" ry="16" fill="#5dade2" ${ST}/>`,
    reve: (w) => `<rect x="0" y="0" width="${w}" height="${H}" fill="#c9b8ff"/>` + [[.15, 40], [.5, 26], [.85, 50]].map(([f, y]) => `<g transform="translate(${w * f} ${y})">${OBJETS.nuage()}</g>`).join(''),
  };

  /* ---------- BULLES ---------- */
  function bulle(txt, o = {}) {
    const n = String(txt).length, w = Math.max(22, n * 7.5 + 14), h = 22, dx = o.gauche ? -w + 6 : -6;
    return `<path d="M${dx} ${-h} L${dx + w} ${-h} L${dx + w} 0 L${o.gauche ? -2 : 10} 0 L${o.gauche ? -8 : 2} 8 L${o.gauche ? -10 : 4} 0 L${dx} 0 Z" fill="#fff" ${ST} stroke-width="1.6"/><text x="${dx + w / 2}" y="-6" text-anchor="middle" font-family="Comic Sans MS, Chalkboard SE, cursive" font-size="14" font-weight="bold" fill="${K}">${String(txt).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`;
  }

  /* ---------- UN ÉLÉMENT ---------- */
  /* [nom, x (0..100 % de la largeur du moment), y (px, défaut : le sol), échelle, options] */
  function element(it, w) {
    const [nom, xp, y0, s0, o0] = it, x = (xp / 100) * w, y = y0 == null ? SOL : y0, s = s0 || 1, o = o0 || {};
    let corps = '';
    if (PERSOS[nom] || nom === 'perso') corps = personne(Object.assign({}, PERSOS[nom] || {}, o));
    else if (ANIMAUX[nom]) corps = ANIMAUX[nom](o.c);
    else if (OBJETS[nom]) corps = OBJETS[nom](o.c != null ? o.c : o.n);
    else if (nom === 'bulle') return `<g transform="translate(${x} ${y})">${bulle(o.t, o)}</g>`;
    else if (nom === 'texte') return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Comic Sans MS, Chalkboard SE, cursive" font-size="${o.taille || 22}" font-weight="bold" fill="${o.c || K}">${o.t}</text>`;
    else if (nom === 'pluie') {
      if (!xp) return Array.from({ length: 14 }, (_, i) => `<path d="M${(i * 37) % w} ${(i * 53) % 150} l-4 12" stroke="#5dade2" stroke-width="2"/>`).join('');
      /* la pluie vue par la fenêtre (posée au même x que la fenêtre) */
      return [[-14, -84], [4, -80], [-6, -68], [14, -66], [-16, -60], [8, -56]].map(([dx, dy]) => `<path d="M${x + dx} ${SOL + dy} l-3 8" stroke="#1f5fa8" stroke-width="2"/>`).join('');
    }
    else if (nom === 'notes') return `<g transform="translate(${x} ${y})"><path d="M0 0 l0 -16 l8 -2 l0 16" fill="none" ${ST}/><circle cx="-2" cy="0" r="3" fill="${K}"/><circle cx="6" cy="-2" r="3" fill="${K}"/><path d="M18 -10 l0 -14" ${ST}/><circle cx="16" cy="-10" r="3" fill="${K}"/></g>`;
    else if (nom === 'zzz') return `<text x="${x}" y="${y}" font-family="Comic Sans MS, cursive" font-size="16" font-weight="bold" fill="#5d6d7e">z z z</text>`;
    else if (nom === 'mouvement') return `<path d="M${x} ${y} l-18 0 M${x} ${y + 8} l-12 0 M${x} ${y - 8} l-12 0" stroke="${K}" stroke-width="2"/>`;
    else if (nom === 'eclairs') return `<path d="M${x} ${y} l-8 18 l8 0 l-8 18" fill="none" stroke="#f1c40f" stroke-width="4"/>`;
    else if (nom === 'feu') return `<g transform="translate(${x} ${y})"><path d="M0 0 Q20 -14 44 -6 Q30 0 44 8 Q20 14 0 0 Z" fill="#ff6b00" ${ST}/><path d="M4 0 Q18 -6 30 -2 Q20 2 30 4 Q16 6 4 0 Z" fill="#ffd23f"/></g>`;
    else if (nom === 'coeur') return `<path d="M${x} ${y} c-6 -8 -16 -2 -8 6 l8 8 l8 -8 c8 -8 -2 -14 -8 -6 Z" fill="#e74c3c" ${ST} stroke-width="1"/>`;
    else return '';
    const flip = o.flip ? ' scale(-1 1)' : '';
    return `<g transform="translate(${x} ${y}) scale(${s})${flip}">${corps}</g>`;
  }

  /* ---------- UNE SCÈNE : 1 à 3 moments ---------- */
  /* scene = { moments: [ { decor, el: [...], titre } ] } */
  function svgScene(scene) {
    const M = scene.moments || [scene], n = M.length, W = 600, G = 8, w = (W - G * (n - 1)) / n;
    let s = '';
    M.forEach((m, i) => {
      const x0 = i * (w + G), id = `c${Math.random().toString(36).slice(2, 7)}`;
      s += `<clipPath id="${id}"><rect x="0" y="0" width="${w}" height="${H}" rx="10"/></clipPath><g transform="translate(${x0} 0)"><g clip-path="url(#${id})">${(DECORS[m.decor] || DECORS.jardin)(w)}${(m.el || []).map((it) => element(it, w)).join('')}</g><rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="10" fill="none" ${ST} stroke-width="3"/>${n > 1 ? `<circle cx="18" cy="${H - 18}" r="12" fill="#fff" ${ST}/><text x="18" y="${H - 13}" text-anchor="middle" font-family="Comic Sans MS, cursive" font-size="14" font-weight="bold" fill="${K}">${i + 1}</text>` : ''}</g>`;
      if (i < n - 1) s += `<path d="M${x0 + w - 6} ${H / 2} l${G + 10} 0" stroke="${K}" stroke-width="3" marker-end="url(#fl)"/>`;
    });
    return `<svg class="illus-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${(scene.alt || '').replace(/"/g, '&quot;')}"><defs><marker id="fl" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="${K}"/></marker></defs>${s}</svg>`;
  }

  window.MNEMO_ILLUS_LIB = { svgScene, PERSOS, ANIMAUX, OBJETS, DECORS };

  /* ---------- AFFICHAGE DANS LE JEU ----------
     On regarde le titre du texte affiché sur l'ardoise (« Texte n° 2 : « À la ferme » ») et l'exercice en cours ;
     si une scène existe pour ce texte, on la dessine à côté de l'ardoise (au-dessus sur téléphone). */
  function cleJeu() {
    const G = window.currentGame || (typeof currentGame !== 'undefined' ? currentGame : null);
    if (!G) return null;
    return (G.sxTF ? 'formes-' + G.tfNiv : null) || G.tv || G.tf || G.tmNiv || null;
  }
  let derniere = '';
  function majIllus() {
    const zone = document.getElementById('nat-illus'), zoneM = document.getElementById('nat-illus-m');
    if (!zone) return;
    const h = document.querySelector('#nat-sentence .tm-titre');
    const m = h && h.textContent.match(/«\s*(.+?)\s*»\s*$/);
    const cle = cleJeu(), sc = m && cle && (window.MNEMO_SCENES || {})[cle + '|' + m[1]];
    const id = sc ? cle + '|' + m[1] : '';
    if (id === derniere) return;
    derniere = id;
    if (!sc) { zone.innerHTML = ''; zone.classList.add('hidden'); if (zoneM) { zoneM.innerHTML = ''; zoneM.classList.add('hidden'); } return; }
    const svg = svgScene(sc);
    zone.innerHTML = svg; zone.classList.remove('hidden');
    if (zoneM) { zoneM.innerHTML = svg; zoneM.classList.remove('hidden'); }
  }
  function branche() {
    const cible = document.getElementById('nat-sentence');
    if (!cible) return;
    new MutationObserver(() => majIllus()).observe(cible, { childList: true, subtree: false });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', branche); else branche();
  window.majIllus = majIllus;
})();
