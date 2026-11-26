/* ============================================================
   MNEMOGRAM — SCÈNES DU CE1-CE2 (v110) : une fiche par texte.
   Clé : « exercice|titre du texte ». Chaque scène a 1 à 3 moments, lus de gauche à droite.
   Un élément : [nom, x en % de la largeur du moment, y (vide = sur le sol), échelle, options].
   Narrateurs du CE : Léo et Lina, à tour de rôle.
   ------------------------------------------------------------ */
window.MNEMO_SCENES = Object.assign(window.MNEMO_SCENES || {}, {
  /* ---------- Exercice 1 : phrase ou pas phrase ---------- */
  'ce-phr|Au jardin': { alt: 'Le jardin : le chat dort, Maman lit, Léo joue au ballon, les oiseaux chantent', moments: [
    { decor: 'jardin', el: [['soleil', 85, 34, .8], ['niche', 18], ['chien', 18, 204, .7, { c: '#c8874b' }], ['zzz', 26, 160], ['banc', 55], ['maman', 55, null, 1, { bras: 'tend' }], ['livreOuvert', 66, 140]] },
    { decor: 'jardin', el: [['arbre', 30], ['oiseau', 22, 104], ['oiseau', 40, 96, 1, { c: '#e74c3c' }], ['notes', 50, 90], ['leo', 70, null, 1, { bras: 'tend', visage: 'rit' }], ['ballon', 88, 175], ['fleurs', 14]] }] },
  'ce-phr|À l\'école': { alt: 'L\'école : la maîtresse écrit au tableau, Lina saute à la corde dans la cour, la cloche sonne', moments: [
    { decor: 'classe', el: [['tableau', 50], ['maitresse', 22, null, 1, { bras: 'leve' }], ['pupitre', 75], ['tom', 75, null, .9], ['livreOuvert', 75, 172]] },
    { decor: 'parc', el: [['cloche', 85, 40], ['lina', 30, null, 1, { bras: 'deux', visage: 'rit' }], ['corde', 30, 196], ['hugo', 70, null, 1, { bras: 'tend' }], ['billes', 80, 198]] }] },
  'ce-phr|La ferme': { alt: 'La ferme : le fermier, les poules, le coq, la vache, le cheval, le tracteur, la mare aux canards', moments: [
    { decor: 'ferme', el: [['soleil', 15, 30, .7], ['grange', 30], ['coq', 70, 150], ['fermier', 62, null, 1, { bras: 'tend' }], ['poule', 85], ['poule', 92, 210, .8, { c: '#f5e6c8' }]] },
    { decor: 'ferme', el: [['cheval', 30], ['foin', 58], ['tracteur', 80, null, .8], ['mouton', 18, 214, .7]] },
    { decor: 'ferme', el: [['mare', 50, 206], ['canard', 40, 206], ['canard', 62, 210], ['cochon', 20], ['lina', 80, null, .9, { bras: 'tend' }], ['oeufs', 92, 198]] }] },
  'ce-phr|La mer': { alt: 'Le voyage vers la mer : la voiture, la plage et le château de sable, la mouette et le bateau', moments: [
    { decor: 'route', el: [['voiture', 50], ['zzz', 58, 140], ['soleil', 85, 36, .7]] },
    { decor: 'plage', el: [['parasol', 25], ['maman', 25, null, .9], ['leo', 72, null, 1, { bras: 'haut', visage: 'rit' }], ['oiseau', 50, 50, 1, { c: '#ecf0f1' }]] },
    { decor: 'plage', el: [['chateauSable', 40], ['frere', 62, null, 1, { bras: 'tend' }], ['seau', 78], ['bateau', 50, 120, .6]] }] },
  /* ---------- Exercice 2 : la ponctuation ---------- */
  'ce-ponct|Le chien': { alt: 'Rex le chien : il se cache, il court, il dort dans sa niche, il mange sa pâtée', moments: [
    { decor: 'jardin', el: [['buisson', 40], ['chien', 70, null, 1, { c: '#c8874b' }], ['mouvement', 52, 180], ['bulle', 70, 140, 1, { t: '?' }]] },
    { decor: 'jardin', el: [['niche', 40], ['chien', 40, 212, .8], ['zzz', 50, 150], ['os', 80, 200]] },
    { decor: 'maison', el: [['gamelle', 50], ['chien', 30], ['lina', 80, null, 1, { visage: 'rit' }]] }] },
  'ce-ponct|Le goûter': { alt: 'Le goûter : Maman sort les gâteaux, le frère en prend trois, le chat vole un biscuit, tout le monde rit', moments: [
    { decor: 'cuisine', el: [['texte', 18, 40, 1, { t: '4 h', taille: 20 }], ['table', 50], ['assiette', 50, 164], ['biscuit', 46, 160], ['biscuit', 54, 160], ['maman', 22, null, 1, { bras: 'tend' }], ['frere', 80, null, 1, { bras: 'leve' }]] },
    { decor: 'cuisine', el: [['table', 50], ['verre', 40, 164], ['leo', 25, null, 1], ['chat', 65, 164], ['biscuit', 82, 140], ['bulle', 30, 100, 1, { t: '!' }]] },
    { decor: 'cuisine', el: [['maman', 25, null, 1, { visage: 'rit' }], ['frere', 55, null, 1, { visage: 'rit' }], ['leo', 80, null, 1, { visage: 'rit', bras: 'haut' }], ['texte', 50, 50, 1, { t: 'ha ha !', taille: 18 }]] }] },
  'ce-ponct|La forêt': { alt: 'La forêt : le panier, l\'écureuil et sa noisette, Papa cherche des champignons, une biche s\'enfuit', moments: [
    { decor: 'foret', el: [['lina', 35, null, 1, { bras: 'tend' }], ['panier', 50, 178], ['ecureuil', 75, 150]] },
    { decor: 'foret', el: [['papa', 40, null, 1, { bras: 'tend' }], ['champignon', 62], ['champignon', 75, 202, .8], ['bulle', 40, 80, 1, { t: '?' }]] },
    { decor: 'foret', el: [['biche', 55], ['mouvement', 30, 176], ['bulle', 70, 110, 1, { t: 'Oh !' }]] }] },
  'ce-ponct|Le grand jour': { alt: 'La fête de l\'école : costume de pirate, la sœur déguisée en fée cherche sa baguette, les parents prennent des photos', moments: [
    { decor: 'maison', el: [['leo', 30, null, 1, { acc: ['chapeau'], chapeau: '#2b2118', haut: '#e74c3c' }], ['soeur', 70, null, 1, { haut: '#ff9ff3', acc: ['couronne'] }]] },
    { decor: 'maison', el: [['lit', 50], ['baguette', 62, 196], ['soeur', 25, null, 1, { haut: '#ff9ff3', visage: 'rit', bras: 'tend' }]] },
    { decor: 'parc', el: [['papa', 25, null, 1, { bras: 'tend' }], ['appareilPhoto', 40, 128], ['maman', 75, null, 1], ['texte', 50, 50, 1, { t: 'Fête !', taille: 20, c: '#c0392b' }]] }] },
  /* ---------- Exercice 3 : les trois types de phrases ---------- */
  'ce-types|Le lapin': { alt: 'Le lapin Pompon : la cage, la carotte, la feuille de salade, ses longues oreilles', moments: [
    { decor: 'jardin', el: [['cage', 40], ['lapin', 40], ['leo', 80, null, 1, { bras: 'tend' }]] },
    { decor: 'jardin', el: [['lapin', 40, null, 1.3], ['lina', 75, null, 1, { bras: 'tend', visage: 'rit' }], ['coeur', 58, 120]] }] },
  'ce-types|La cuisine': { alt: 'La soupe : on lave les poireaux, on épluche les carottes, la soupe cuit, on met la table', moments: [
    { decor: 'cuisine', el: [['papa', 30, null, 1, { acc: ['tablier'], bras: 'tend' }], ['table', 70], ['radis', 66, 164], ['lina', 85, null, .9]] },
    { decor: 'cuisine', el: [['casserole', 45, 180], ['table', 45], ['bulles', 45, 150], ['bulle', 75, 100, 1, { t: '?' }], ['leo', 75]] },
    { decor: 'cuisine', el: [['table', 50], ['assiette', 36, 164], ['assiette', 64, 164], ['bol', 50, 160], ['leo', 18, null, 1, { visage: 'rit' }], ['lina', 85, null, 1, { visage: 'rit' }]] }] },
  'ce-types|Le musée': { alt: 'Le musée : la maîtresse, le squelette de dinosaure, les vitrines, les enfants dessinent', moments: [
    { decor: 'musee', el: [['maitresse', 25, null, 1, { bras: 'leve' }], ['leo', 55], ['lina', 72], ['tom', 88]] },
    { decor: 'musee', el: [['squelette', 50, null, .9], ['vitrine', 85], ['bulle', 20, 80, 1, { t: '?' }], ['tom', 18, null, .9]] },
    { decor: 'musee', el: [['lina', 30, null, 1, { bras: 'tend' }], ['livreOuvert', 42, 140], ['leo', 70, null, 1, { bras: 'tend' }], ['livreOuvert', 82, 140]] }] },
  'ce-types|Le voyage': { alt: 'Le voyage : la valise et le pyjama, Papa cherche ses lunettes, la voiture vers la maison des vacances', moments: [
    { decor: 'maison', el: [['valise', 35], ['lina', 65, null, 1, { bras: 'tend' }], ['maman', 85, null, 1, { bras: 'leve' }]] },
    { decor: 'maison', el: [['table', 70], ['lunettesSoleil', 70, 162], ['papa', 30, null, 1, { bras: 'deux' }], ['bulle', 30, 70, 1, { t: '?' }]] },
    { decor: 'route', el: [['maison', 82, 150, .5], ['voiture', 40], ['notes', 50, 120]] }] },
  /* ---------- Exercice 4 : transformer en phrase interrogative ---------- */
  'ce-int|Les questions de Léo': { alt: 'Léo pose plein de questions : le parc, les glaces, le chat, le ballon, la pluie', moments: [
    { decor: 'parc', el: [['leo', 30, null, 1, { bras: 'leve' }], ['bulle', 30, 76, 1, { t: '?' }], ['glace', 55, 150], ['ballon', 75], ['chat', 88, 206, .7]] },
    { decor: 'maison', el: [['soeur', 30, null, 1], ['livreOuvert', 42, 140], ['fenetre', 72], ['pluie', 72], ['bulle', 80, 120, 1, { t: '?' }]] }] },
  'ce-int|À la ferme': { alt: 'À la ferme : le fermier trait les vaches, les poules, les canards sur la mare, le cheval qui court', moments: [
    { decor: 'ferme', el: [['vache', 40], ['fermier', 75, null, 1, { bras: 'tend' }], ['seau', 60]] },
    { decor: 'ferme', el: [['poule', 25], ['oeufs', 40], ['cochon', 70], ['lina', 90, null, .9, { bras: 'tend' }]] },
    { decor: 'ferme', el: [['mare', 40, 206], ['canard', 35, 206], ['cheval', 75], ['mouvement', 55, 176]] }] },
  'ce-int|Le pique-nique': { alt: 'Le pique-nique : le panier, la nappe, les sandwichs, les fourmis, la pêche dans la rivière', moments: [
    { decor: 'parc', el: [['maman', 25, null, 1, { bras: 'tend' }], ['panier', 42, 180], ['papa', 70, null, 1, { bras: 'tend' }]] },
    { decor: 'parc', el: [['nappe', 50], ['assiette', 40, 186], ['fourmi', 70], ['fourmi', 76, 200], ['leo', 18, null, .9]] },
    { decor: 'lac', el: [['frere', 30, 168, 1, { bras: 'tend' }], ['poisson', 70, 172]] }] },
  'ce-int|Le spectacle': { alt: 'Le spectacle : le rideau, les violons, le magicien et son lapin, le clown, les enfants applaudissent', moments: [
    { decor: 'theatre', el: [['magicien', 40, 180, 1, { bras: 'leve' }], ['chapeauMagique', 65, 180], ['lapin', 65, 160, .8], ['notes', 80, 80]] },
    { decor: 'theatre', el: [['clown', 50, 180, 1, { visage: 'rit', bras: 'haut' }]] },
    { decor: 'maison', el: [['leo', 30, null, 1, { bras: 'haut', visage: 'rit' }], ['lina', 70, null, 1, { bras: 'haut', visage: 'rit' }], ['texte', 50, 60, 1, { t: 'Bravo !', taille: 18, c: '#c0392b' }]] }] },
  /* ---------- Exercice 5 : transformer en phrase impérative ---------- */
  'ce-imper|Avant de partir': { alt: 'Avant de partir : ranger la chambre, mettre le manteau, prendre le sac, fermer la porte', moments: [
    { decor: 'maison', el: [['lit', 35], ['leo', 75, null, 1, { bras: 'tend' }], ['livre', 55, 198]] },
    { decor: 'maison', el: [['leo', 35, null, 1, { haut: '#c0392b' }], ['sac', 60]] },
    { decor: 'rue', el: [['porte', 18, 186], ['maman', 45], ['leo', 65], ['soeur', 82, null, .9]] }] },
  'ce-imper|En classe': { alt: 'En classe : les cahiers, la date, la poésie, la gomme prêtée à Tom, la récréation', moments: [
    { decor: 'classe', el: [['tableau', 50], ['maitresse', 20, null, 1, { bras: 'leve' }], ['pupitre', 75], ['lina', 75, null, .9, { bras: 'leve' }]] },
    { decor: 'classe', el: [['pupitre', 35], ['lina', 35, null, .9], ['pupitre', 75], ['tom', 75, null, .9], ['bulle', 55, 110, 1, { t: 'Merci !' }]] },
    { decor: 'parc', el: [['cloche', 80, 40], ['tom', 30, null, 1, { bras: 'haut', visage: 'rit' }], ['lina', 65, null, 1, { bras: 'haut', visage: 'rit' }]] }] },
  'ce-imper|La recette des crêpes': { alt: 'Les crêpes : la farine et les œufs dans le saladier, la pâte, la poêle, on retourne la crêpe', moments: [
    { decor: 'cuisine', el: [['table', 50], ['saladier', 50, 164], ['oeufs', 70, 164], ['lina', 20, null, 1, { bras: 'tend' }]] },
    { decor: 'cuisine', el: [['poele', 45, 150], ['crepe', 45, 120], ['papa', 70, null, 1, { bras: 'leve', acc: ['tablier'] }]] },
    { decor: 'cuisine', el: [['table', 50], ['assiette', 50, 164], ['crepe', 50, 190], ['leo', 25, null, 1, { visage: 'rit' }], ['lina', 78, null, 1, { visage: 'rit' }]] }] },
  'ce-imper|Le jeu de piste': { alt: 'Le jeu de piste : la carte, le grand chêne, l\'enveloppe sous la pierre, le petit pont sur le ruisseau, la cabane', moments: [
    { decor: 'foret', el: [['carte', 50, 160], ['leo', 30], ['lina', 70]] },
    { decor: 'parc', el: [['arbre', 30], ['rocher', 70], ['enveloppe', 70, 168], ['tom', 88, null, .9]] },
    { decor: 'foret', el: [['ruisseau', 40, 210], ['pont', 40, 206], ['cabane', 82], ['lina', 40, 186, .8]] }] },
  /* ---------- Exercice 6 : forme affirmative ou négative ---------- */
  'ce-formes|Le dragon': { alt: 'Le dragon dans sa grotte crache du feu, les villageois ont peur, une petite fille lui offre une fleur', moments: [
    { decor: 'grotte', el: [['grotte', 40], ['dragon', 50, 200, .7], ['feu', 78, 170]] },
    { decor: 'rue', el: [['papa', 30, null, 1, { visage: 'peur', bras: 'haut' }], ['maman', 65, null, 1, { visage: 'peur', bras: 'haut' }]] },
    { decor: 'grotte', el: [['dragon', 40, null, .7], ['lina', 80, null, 1, { bras: 'tend' }], ['fleur', 70, 160], ['coeur', 60, 90]] }] },
  'ce-formes|Le chat Minou': { alt: 'Minou le chat paresseux dort toute la journée, boit du lait tiède et ronronne sur les genoux', moments: [
    { decor: 'maison', el: [['lit', 50], ['chat', 50, 170, 1, { c: '#95a5a6' }], ['zzz', 60, 130], ['souris', 85]] },
    { decor: 'maison', el: [['bol', 40], ['chat', 65, null, 1, { c: '#95a5a6' }], ['fenetre', 50], ['pluie', 50]] },
    { decor: 'maison', el: [['lina', 50, null, 1, { visage: 'rit' }], ['chat', 52, 158, .8, { c: '#95a5a6' }], ['maman', 82, null, 1, { visage: 'rit' }]] }] },
  'ce-formes|La sortie au parc': { alt: 'Au parc : le ciel bleu, Papa porte le petit frère, le toboggan, le ballon sous le banc', moments: [
    { decor: 'parc', el: [['soleil', 80, 34, .8], ['papa', 40], ['frere', 40, 104, .7, { bras: 'haut' }]] },
    { decor: 'parc', el: [['toboggan', 50], ['leo', 48, 142, .9, { bras: 'haut', visage: 'rit' }]] },
    { decor: 'parc', el: [['banc', 50], ['ballon', 50, 196, .8], ['soeur', 82, null, 1, { bras: 'deux' }]] }] },
  'ce-formes|Le robot': { alt: 'Bip le robot de Léo : il roule, il range la chambre mais cache les chaussettes sous le lit', moments: [
    { decor: 'maison', el: [['robot', 40], ['leo', 75, null, 1, { visage: 'rit', bras: 'tend' }]] },
    { decor: 'maison', el: [['lit', 50], ['robot', 20], ['chaussures', 50, 198]] },
    { decor: 'maison', el: [['fenetre', 50], ['pluie', 50], ['robot', 40], ['bulle', 50, 120, 1, { t: 'bip ?' }]] }] },
  /* ---------- Exercice 7 : transformer à la forme négative ---------- */
  'ce-neg|Le chat grognon': { alt: 'Le chat grognon ne veut rien : il ne mange pas, il ne dort pas', moments: [
    { decor: 'maison', el: [['gamelle', 30], ['chat', 60, null, 1.2, { c: '#7f8c8d' }], ['bulle', 70, 130, 1, { t: 'Non !' }]] },
    { decor: 'maison', el: [['lit', 50], ['chat', 80, null, 1, { c: '#7f8c8d' }], ['leo', 20, null, 1, { visage: 'triste' }]] }] },
  'ce-neg|La journée de Lou': { alt: 'La journée de Lou : le bol de lait le matin, l\'école, les billes à la récréation', moments: [
    { decor: 'cuisine', el: [['reveil', 80, 120], ['table', 45], ['bol', 45, 164], ['fille', 20, null, 1]] },
    { decor: 'classe', el: [['tableau', 50], ['maitresse', 25], ['fille', 75, null, .9, { bras: 'leve' }]] },
    { decor: 'parc', el: [['billes', 50], ['fille', 30, null, 1, { visage: 'rit', bras: 'haut' }], ['garcon', 75, null, 1]] }] },
  'ce-neg|Au zoo': { alt: 'Au zoo : le lion rugit, les singes, la girafe, l\'ours, les pingouins qui nagent, Papa prend des photos', moments: [
    { decor: 'zoo', el: [['girafe', 30], ['lion', 72], ['bulle', 80, 120, 1, { t: 'Roaar !' }]] },
    { decor: 'zoo', el: [['ours', 40], ['singe', 80, 140], ['cage', 80]] },
    { decor: 'piscine', el: [['pingouin', 25, 160], ['pingouin', 45, 150], ['papa', 78, null, 1, { bras: 'tend' }], ['appareilPhoto', 66, 130]] }] },
  'ce-neg|Un drôle de rêve': { alt: 'Le rêve : Léo vole au-dessus de la ville, il glisse sur un nuage, le réveil sonne', moments: [
    { decor: 'nuit', el: [['lune', 80, 40], ['lit', 50], ['leo', 45, 172, .8, { visage: 'dort' }], ['zzz', 60, 120]] },
    { decor: 'reve', el: [['ville', 50, 240, .8], ['leo', 45, 130, 1, { bras: 'deux', visage: 'rit' }], ['chat', 75, 110, .8]] },
    { decor: 'maison', el: [['reveil', 30, 170], ['texte', 30, 120, 1, { t: 'Dring !', taille: 16 }], ['lit', 60], ['maman', 85]] }] },
  /* ---------- Exercice 8 : les paroles des personnages ---------- */
  'ce-paroles|Le ballon': { alt: 'Le ballon coincé dans l\'arbre : la sœur prend une branche, le ballon tombe, ils jouent ensemble', moments: [
    { decor: 'parc', el: [['arbre', 50], ['ballon', 52, 110], ['leo', 82, null, 1, { bras: 'haut', visage: 'crie' }], ['bulle', 80, 80, 1, { t: 'Oh !' }]] },
    { decor: 'parc', el: [['arbre', 40], ['soeur', 65, null, 1, { bras: 'leve' }], ['ballon', 45, 170], ['mouvement', 48, 140]] },
    { decor: 'parc', el: [['leo', 30, null, 1, { visage: 'rit', bras: 'tend' }], ['ballon', 50, 160], ['soeur', 72, null, 1, { visage: 'rit' }], ['bulle', 50, 80, 1, { t: 'Merci !' }]] }] },
  'ce-paroles|Le marchand de glaces': { alt: 'Le marchand de glaces sur la plage : Lina choisit fraise, son frère chocolat', moments: [
    { decor: 'plage', el: [['chariotGlaces', 40], ['marchand', 72], ['bulle', 72, 80, 1, { t: 'Glaces !' }]] },
    { decor: 'plage', el: [['lina', 40, null, 1, { bras: 'tend' }], ['glace', 52, 140, 1, { c: '#ff6b81' }], ['marchand', 80]] },
    { decor: 'plage', el: [['frere', 40, null, 1, { visage: 'rit' }], ['glace', 52, 150, 1, { c: '#8b4513' }], ['bulle', 40, 100, 1, { t: 'Et moi ?' }]] }] },
  'ce-paroles|La petite poule': { alt: 'La petite poule rousse : personne ne veut l\'aider à semer ni à couper le blé, elle fait seule le pain', moments: [
    { decor: 'ferme', el: [['poule', 25], ['chat', 52], ['chien', 70], ['canard', 90], ['bulle', 55, 140, 1, { t: 'Pas moi !' }]] },
    { decor: 'ferme', el: [['ble', 40], ['ble', 60], ['poule', 80]] },
    { decor: 'cuisine', el: [['table', 45], ['pain', 45, 164], ['poule', 80], ['chat', 15, 204, .8], ['bulle', 25, 140, 1, { t: 'Moi !' }]] }] },
  'ce-paroles|Le loup et le chevreau': { alt: 'Le chevreau seul à la maison, le loup frappe à la porte et montre sa patte noire, le chevreau n\'ouvre pas', moments: [
    { decor: 'jardin', el: [['maison', 40], ['chevreau', 45, null, .8], ['chevreau', 78, null, 1.2]] },
    { decor: 'jardin', el: [['porte', 30, 198], ['loup', 70], ['bulle', 70, 120, 1, { t: 'Ouvre !' }]] },
    { decor: 'maison', el: [['porte', 70], ['chevreau', 35], ['bulle', 30, 130, 1, { t: 'Non !' }]] }] },
  /* ---------- Exercice 9 : sujet, verbe, complément ---------- */
  'ce-svc|Le chat': { alt: 'Le chat attrape une souris, la sœur chante, Papa lave la voiture, bébé dort', moments: [
    { decor: 'jardin', el: [['chat', 40], ['souris', 75]] },
    { decor: 'jardin', el: [['soeur', 30, null, 1, { visage: 'rit' }], ['notes', 42, 110], ['voiture', 75, null, .7], ['papa', 90, null, .8]] },
    { decor: 'maison', el: [['lit', 50], ['bebe', 40, 172, 1, { visage: 'dort' }], ['zzz', 55, 120]] }] },
  'ce-svc|En classe': { alt: 'En classe : la maîtresse lit une histoire, Tom dessine un dragon, la cloche sonne', moments: [
    { decor: 'classe', el: [['maitresse', 35, null, 1, { bras: 'tend' }], ['livreOuvert', 50, 130], ['leo', 75], ['lina', 90, null, .9]] },
    { decor: 'classe', el: [['pupitre', 45], ['tom', 45, null, .9], ['dragon', 80, 130, .35], ['cloche', 85, 40]] }] },
  'ce-svc|Au jardin': { alt: 'Au jardin : le grand-père plante des tomates, le chien creuse un trou, les oiseaux mangent les cerises, la grand-mère cueille des fleurs', moments: [
    { decor: 'jardin', el: [['papi', 30, null, 1, { bras: 'tend' }], ['tomates', 55], ['chien', 82]] },
    { decor: 'jardin', el: [['pommier', 35], ['oiseau', 30, 120, 1, { c: '#e74c3c' }], ['mamie', 72, null, 1, { bras: 'tend' }], ['fleurs', 88], ['soleil', 85, 34, .7], ['notes', 50, 60]] }] },
  'ce-svc|Le cirque': { alt: 'Le cirque : le clown, l\'éléphant qui porte une danseuse, le jongleur, le lion et le dompteur', moments: [
    { decor: 'cirque', el: [['clown', 50, null, 1, { visage: 'rit' }], ['leo', 20, null, .8, { visage: 'rit' }]] },
    { decor: 'cirque', el: [['elephant', 50, null, .9], ['lina', 48, 156, .7, { bras: 'haut', haut: '#ff9ff3' }]] },
    { decor: 'cirque', el: [['lion', 40], ['gardien', 80, null, 1, { bras: 'leve', haut: '#c0392b', chapeau: '#2b2118' }]] }] },
  /* ---------- Exercice 10 : les compléments de phrase ---------- */
  'ce-ccp|Le matin': { alt: 'Le matin : le petit-déjeuner dans la cuisine, la rue froide, la cour de l\'école', moments: [
    { decor: 'cuisine', el: [['reveil', 85, 100], ['table', 45], ['bol', 45, 164], ['maman', 18], ['leo', 70]] },
    { decor: 'rue', el: [['leo', 40, null, 1, { acc: ['bonnet'] }], ['maman', 65], ['texte', 85, 30, 1, { t: '8 h', taille: 18 }]] },
    { decor: 'parc', el: [['leo', 30], ['tom', 60, null, 1, { bras: 'leve' }], ['cloche', 85, 40]] }] },
  'ce-ccp|Le pique-nique': { alt: 'Le pique-nique au bord du lac : la nappe sous le grand arbre, les sandwichs, les canards, le retour le soir', moments: [
    { decor: 'lac', el: [['arbre', 20, 150], ['nappe', 28, 166, .8], ['papa', 52, 150]] },
    { decor: 'lac', el: [['canard', 50, 172], ['canard', 70, 170], ['lina', 20, 160, 1, { bras: 'tend' }]] },
    { decor: 'nuit', el: [['lune', 80, 40], ['voiture', 45], ['maison', 85, null, .6]] }] },
  'ce-ccp|L\'hiver': { alt: 'L\'hiver : la neige sur le village, le bonhomme de neige, Papa déblaie l\'allée, les enfants patinent sur le lac gelé', moments: [
    { decor: 'neige', el: [['chalet', 40, 184, .8], ['bonhommeNeige', 78, 190]] },
    { decor: 'neige', el: [['papa', 40, 188, 1, { acc: ['bonnet'] }], ['pelle', 55, 170], ['leo', 80, 188, 1, { acc: ['bonnet'] }]] },
    { decor: 'neige', el: [['lacGele', 50, 200], ['lina', 35, 190, 1, { bras: 'deux', acc: ['bonnet'] }], ['tom', 70, 196, .9, { acc: ['bonnet'], visage: 'rit' }]] }] },
  'ce-ccp|Le voyage en train': { alt: 'Le voyage en train : la gare, le paysage par la fenêtre, les champs puis la forêt, le bébé qui pleure', moments: [
    { decor: 'gare', el: [['gare', 50, 188, .9], ['valise', 15], ['papa', 28]] },
    { decor: 'route', el: [['rails', 50, 196], ['train', 50, 196, .8], ['sapin', 85, 150, .6]] },
    { decor: 'maison', el: [['fenetre', 50], ['maman', 25, null, 1, { bras: 'tend' }], ['bebe', 34, 160, 1, { visage: 'crie' }], ['lina', 78]] }] },
  /* ---------- Bilan 1 : type et forme ---------- */
  'formes-ce|Le chat': { alt: 'Moustache le chat dort toute la journée et ne mange pas ses croquettes', moments: [
    { decor: 'maison', el: [['lit', 40], ['chat', 40, 170, 1, { c: '#f39c12' }], ['zzz', 52, 130], ['gamelle', 80]] },
    { decor: 'maison', el: [['lina', 40, null, 1, { bras: 'tend' }], ['bulle', 40, 90, 1, { t: 'Viens !' }], ['chat', 80, null, 1, { c: '#f39c12' }]] }] },
  'formes-ce|La récréation': { alt: 'La récréation : la cloche sonne, les enfants courent, Léo range ses billes', moments: [
    { decor: 'parc', el: [['cloche', 80, 40], ['tom', 30, null, 1, { bras: 'haut', visage: 'rit' }], ['ballon', 55], ['lina', 75, null, 1, { bras: 'deux' }]] },
    { decor: 'parc', el: [['leo', 40, null, 1, { bras: 'tend' }], ['billes', 60]] }] },
  'formes-ce|Au zoo': { alt: 'Au zoo : la girafe immense, le lion immobile, les singes drôles', moments: [
    { decor: 'zoo', el: [['girafe', 40], ['leo', 80, null, 1, { bras: 'haut' }]] },
    { decor: 'zoo', el: [['cage', 50], ['lion', 50, null, .9], ['zzz', 60, 130]] },
    { decor: 'zoo', el: [['arbre', 50], ['singe', 40, 130], ['singe', 62, 150], ['lina', 85, null, 1, { visage: 'rit' }]] }] },
  'formes-ce|Le gâteau': { alt: 'Le gâteau au chocolat : on casse les œufs, la farine dans le placard, le gâteau qui sent bon', moments: [
    { decor: 'cuisine', el: [['table', 50], ['saladier', 50, 164], ['oeufs', 68, 164], ['maman', 20, null, 1, { bras: 'tend', acc: ['tablier'] }]] },
    { decor: 'cuisine', el: [['etagere', 50, 160, .6], ['leo', 80, null, 1, { bras: 'leve' }], ['bulle', 80, 80, 1, { t: '?' }]] },
    { decor: 'cuisine', el: [['table', 50], ['gateau', 50, 164, 1, { n: 0 }], ['leo', 85, null, 1, { visage: 'rit' }]] }] },
  'formes-ce|Le vélo': { alt: 'Papa apprend le vélo à Lina : il tient le vélo, puis il le lâche, elle roule toute seule', moments: [
    { decor: 'parc', el: [['velo', 45], ['lina', 45, 160, .8], ['papa', 78, null, 1, { bras: 'tend' }]] },
    { decor: 'parc', el: [['velo', 60], ['lina', 60, 160, .8, { visage: 'rit', bras: 'haut' }], ['mouvement', 30, 170], ['papa', 15, null, 1, { bras: 'haut' }]] }] },
  'formes-ce|La plage': { alt: 'À la mer : la serviette dans le sac, l\'eau froide, les vagues, le château de sable', moments: [
    { decor: 'plage', el: [['sac', 40], ['leo', 70, null, 1, { bras: 'tend' }], ['bulle', 70, 90, 1, { t: '?' }]] },
    { decor: 'mer', el: [['lina', 50, 196, 1, { visage: 'peur', bras: 'haut' }], ['bulle', 70, 100, 1, { t: 'Brr !' }]] },
    { decor: 'plage', el: [['chateauSable', 50], ['seau', 75], ['leo', 25, null, 1, { visage: 'rit' }]] }] },
  'formes-ce|La pluie': { alt: 'Il pleut : on joue aux cartes à la maison, le petit frère gagne toujours', moments: [
    { decor: 'maison', el: [['fenetre', 50], ['pluie', 50], ['leo', 30, null, 1, { visage: 'triste' }]] },
    { decor: 'maison', el: [['table', 50], ['cartes', 50, 164], ['leo', 18], ['frere', 82, null, 1, { visage: 'rit', bras: 'haut' }]] }] },
  'formes-ce|Le marché': { alt: 'Grand-père au marché : les pommes rouges, les fraises, la monnaie', moments: [
    { decor: 'marche', el: [['etal', 50], ['marchand', 50, 168, .8], ['papi', 85]] },
    { decor: 'marche', el: [['papi', 30, null, 1, { bras: 'tend' }], ['panier', 50, 196], ['lina', 75, null, 1, { bras: 'tend' }]] }] },
  'formes-ce|L\'anniversaire': { alt: 'L\'anniversaire de Lina : elle souffle les bougies, ouvre ses cadeaux, une jolie poupée', moments: [
    { decor: 'maison', el: [['table', 50], ['gateau', 50, 164, 1, { n: 7 }], ['lina', 20, null, 1, { visage: 'crie' }], ['ballonFete', 85, 100], ['ballonFete', 92, 110, 1, { c: '#3498db' }]] },
    { decor: 'maison', el: [['cadeau', 30], ['cadeau', 45, null, .8, { c: '#e67e22' }], ['lina', 70, null, 1, { visage: 'rit', bras: 'tend' }], ['poupee', 82, 150]] }] },
  'formes-ce|La forêt la nuit': { alt: 'La forêt la nuit : un bruit, une chouette aux yeux brillants, on allume la lampe', moments: [
    { decor: 'nuit', el: [['sapin', 50, null, 1.2], ['leo', 25, null, 1, { visage: 'peur' }], ['bulle', 25, 90, 1, { t: '?' }]] },
    { decor: 'nuit', el: [['arbre', 50, null, 1, { c: '#1e5631' }], ['chouette', 52, 120]] },
    { decor: 'nuit', el: [['papa', 30], ['lampe', 45, 150], ['lina', 85, null, 1, { visage: 'rit' }]] }] },
  'formes-ce|La classe de mer': { alt: 'La classe de mer : le sac et le bonnet, la mer immense, les rochers, on ramasse des crabes', moments: [
    { decor: 'maison', el: [['valise', 40], ['leo', 70, null, 1, { acc: ['bonnet'] }]] },
    { decor: 'mer', el: [['rocher', 40, 210], ['lina', 70, 204, 1, { bras: 'haut' }]] },
    { decor: 'plage', el: [['crabe', 40], ['crabe', 60, 206, .8], ['tom', 80, null, 1, { visage: 'rit', bras: 'tend' }], ['seau', 25]] }] },
  'formes-ce|Le cirque': { alt: 'Le cirque arrive : le grand chapiteau, le lion qui ne rugit pas, les clowns, le magicien disparu', moments: [
    { decor: 'parc', el: [['chapiteau', 50, null, .9], ['lina', 88, null, .8]] },
    { decor: 'cirque', el: [['lion', 35], ['clown', 75, null, 1, { visage: 'rit' }]] },
    { decor: 'cirque', el: [['chapeauMagique', 50], ['bulle', 50, 140, 1, { t: '?' }], ['leo', 82, null, 1, { visage: 'rit', bras: 'haut' }]] }] },
  /* ---------- Bilan 2 : transformer les phrases ---------- */
  'ce-transfo|Le matin': { alt: 'Le matin : on dort, la fenêtre, le café chaud, les chaussures, l\'autobus', moments: [
    { decor: 'maison', el: [['lit', 50], ['leo', 45, 172, .8, { visage: 'dort' }], ['zzz', 60, 120]] },
    { decor: 'cuisine', el: [['table', 45], ['tasse', 45, 164], ['papa', 80], ['chaussures', 20]] },
    { decor: 'rue', el: [['autobus', 50, null, .8], ['leo', 88, null, .8, { bras: 'leve' }]] }] },
  'ce-transfo|Le jardin': { alt: 'Le jardin : on arrose les fleurs, les tomates rouges, on plante des radis, le chien creuse un trou', moments: [
    { decor: 'jardin', el: [['fleurs', 30], ['lina', 65, null, 1, { bras: 'tend' }], ['seau', 80]] },
    { decor: 'jardin', el: [['tomates', 30], ['radis', 55], ['papi', 80]] },
    { decor: 'jardin', el: [['chien', 40], ['feuilles', 70], ['portail', 85, null, .6]] }] },
  'ce-transfo|La piscine': { alt: 'La piscine : le bonnet, le plongeoir, le maître-nageur surveille, la course dans le grand bassin', moments: [
    { decor: 'piscine', el: [['plongeoir', 30, 150], ['leo', 45, 112, .8, { acc: ['bonnet'], bras: 'haut' }]] },
    { decor: 'piscine', el: [['gardien', 80, 150, 1, { haut: '#e74c3c' }], ['soeur', 40, 186, .9, { visage: 'peur' }]] },
    { decor: 'piscine', el: [['tom', 35, 196, .9, { bras: 'deux', acc: ['bonnet'] }], ['lina', 70, 196, .9, { bras: 'deux', acc: ['bonnet'] }]] }] },
  'ce-transfo|L\'anniversaire': { alt: 'La fête : les ballons, les bougies, le gâteau, les cadeaux, on danse', moments: [
    { decor: 'maison', el: [['ballonFete', 20, 100], ['ballonFete', 30, 110, 1, { c: '#2ecc71' }], ['table', 60], ['gateau', 60, 164, 1, { n: 5 }], ['lina', 88, null, 1, { visage: 'triste' }]] },
    { decor: 'maison', el: [['cadeau', 40], ['tom', 70, null, 1, { bras: 'tend' }]] },
    { decor: 'maison', el: [['leo', 30, null, 1, { bras: 'haut', visage: 'rit' }], ['lina', 65, null, 1, { bras: 'haut', visage: 'rit' }], ['notes', 50, 70]] }] },
  'ce-transfo|La forêt': { alt: 'La forêt : le sentier, le pic-vert, le renard qui dort, le champignon, le ruisseau', moments: [
    { decor: 'foret', el: [['leo', 30], ['papa', 60], ['oiseau', 80, 100, 1, { c: '#27ae60' }]] },
    { decor: 'foret', el: [['renard', 40], ['zzz', 55, 160], ['champignon', 80]] },
    { decor: 'foret', el: [['ruisseau', 50, 210], ['pommeDePin', 30], ['papa', 75, null, 1, { bras: 'deux' }], ['bulle', 75, 80, 1, { t: '?' }]] }] },
  'ce-transfo|À la bibliothèque': { alt: 'La bibliothèque : on choisit un livre, Zoé lit une bande dessinée, on parle tout bas', moments: [
    { decor: 'bibliotheque', el: [['leo', 50, null, 1, { bras: 'tend' }], ['livre', 62, 138]] },
    { decor: 'bibliotheque', el: [['zoe', 40], ['livreOuvert', 52, 140], ['texte', 80, 80, 1, { t: 'chut !', taille: 16 }]] }] },
  'ce-transfo|Le marché': { alt: 'Le marché : les fruits mûrs, le panier, le poisson, le fromage, les olives', moments: [
    { decor: 'marche', el: [['etal', 45], ['marchand', 45, 168, .8], ['maman', 85]] },
    { decor: 'marche', el: [['fromage', 30, 160], ['olives', 55, 160], ['table', 42], ['lina', 85, null, 1, { visage: 'triste' }]] },
    { decor: 'marche', el: [['panier', 40], ['poisson', 40, 170], ['leo', 70, null, 1, { bras: 'tend' }]] }] },
  'ce-transfo|Le bricolage': { alt: 'Le bricolage : les ciseaux, la colle, Papa tient la planche, on peint la boîte en bleu, une cabane', moments: [
    { decor: 'maison', el: [['table', 50], ['ciseaux', 40, 164], ['pinceau', 60, 164], ['boite', 75, 164, .7]] },
    { decor: 'jardin', el: [['planche', 50, 150], ['papa', 25, null, 1, { bras: 'tend' }], ['marteau', 75, 150], ['leo', 85]] },
    { decor: 'jardin', el: [['cabane', 50], ['leo', 85, null, 1, { visage: 'rit' }]] }] },
  'ce-transfo|Au parc': { alt: 'Au parc : les balançoires, le toboggan, le tourniquet, les canards, le marchand de glaces', moments: [
    { decor: 'parc', el: [['balancoire', 35], ['toboggan', 75]] },
    { decor: 'parc', el: [['tourniquet', 40], ['canard', 75], ['canard', 88, 204, .8], ['frere', 20, null, 1, { bras: 'deux' }]] },
    { decor: 'parc', el: [['chariotGlaces', 45], ['marchand', 78], ['ballon', 20]] }] },
  'ce-transfo|La cabane': { alt: 'La cabane : les planches lourdes, les branches, l\'échelle, la corde, le marteau', moments: [
    { decor: 'foret', el: [['planche', 45, 186], ['leo', 25, null, 1, { bras: 'deux' }], ['frere', 70, null, 1, { bras: 'deux' }]] },
    { decor: 'foret', el: [['echelle', 40], ['leo', 40, 160, .8], ['marteau', 70]] },
    { decor: 'foret', el: [['cabane', 50], ['chien', 85]] }] },
  'ce-transfo|La classe verte': { alt: 'La classe verte : le sac de couchage, le car, le chalet, la neige, le ski', moments: [
    { decor: 'maison', el: [['valise', 35], ['sac', 60], ['leo', 82]] },
    { decor: 'route', el: [['autobus', 50, null, .8]] },
    { decor: 'montagne', el: [['chalet', 30, 196, .7], ['skis', 70], ['tom', 70, 196, .9, { acc: ['bonnet'], bras: 'deux' }]] }] },
  'ce-transfo|Le grand voyage': { alt: 'Le grand voyage : la valise, les billets, l\'avion décolle, les nuages', moments: [
    { decor: 'gare', el: [['valise', 30], ['lina', 55], ['papa', 80, null, 1, { bras: 'tend' }]] },
    { decor: 'ciel', el: [['nuage', 25, 60], ['avion', 55, 130], ['nuage', 80, 190]] },
    { decor: 'plage', el: [['soleil', 80, 34, .8], ['lina', 40, null, 1, { visage: 'rit', bras: 'haut' }], ['leo', 65, null, 1, { visage: 'rit' }]] }] },
});
