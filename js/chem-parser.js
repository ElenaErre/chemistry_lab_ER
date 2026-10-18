/**
 * chem-parser.js
 * Modulo per il parsing di formule chimiche, calcolo stechiometrico,
 * determinazione dei numeri di ossidazione e formattazione grafica.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ChemParser = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // Tabella degli elementi chimici conosciuti
  const ELEMENTS = {
    H: { name: 'Idrogeno', z: 1, metal: false },
    He: { name: 'Elio', z: 2, metal: false },
    Li: { name: 'Litio', z: 3, metal: true, fixedOx: 1 },
    Be: { name: 'Berillio', z: 4, metal: true, fixedOx: 2 },
    B: { name: 'Boro', z: 5, metal: false },
    C: { name: 'Carbonio', z: 6, metal: false },
    N: { name: 'Azoto', z: 7, metal: false },
    O: { name: 'Ossigeno', z: 8, metal: false },
    F: { name: 'Fluoro', z: 9, metal: false, fixedOx: -1 },
    Ne: { name: 'Neon', z: 10, metal: false },
    Na: { name: 'Sodio', z: 11, metal: true, fixedOx: 1 },
    Mg: { name: 'Magnesio', z: 12, metal: true, fixedOx: 2 },
    Al: { name: 'Alluminio', z: 13, metal: true, fixedOx: 3 },
    Si: { name: 'Silicio', z: 14, metal: false },
    P: { name: 'Fosforo', z: 15, metal: false },
    S: { name: 'Zolfo', z: 16, metal: false },
    Cl: { name: 'Cloro', z: 17, metal: false },
    Ar: { name: 'Argon', z: 18, metal: false },
    K: { name: 'Potassio', z: 19, metal: true, fixedOx: 1 },
    Ca: { name: 'Calcio', z: 20, metal: true, fixedOx: 2 },
    Sc: { name: 'Scandio', z: 21, metal: true, fixedOx: 3 },
    Ti: { name: 'Titanio', z: 22, metal: true },
    V: { name: 'Vanadio', z: 23, metal: true },
    Cr: { name: 'Cromo', z: 24, metal: true },
    Mn: { name: 'Manganese', z: 25, metal: true },
    Fe: { name: 'Ferro', z: 26, metal: true },
    Co: { name: 'Cobalto', z: 27, metal: true },
    Ni: { name: 'Nichel', z: 28, metal: true },
    Cu: { name: 'Rame', z: 29, metal: true },
    Zn: { name: 'Zinco', z: 30, metal: true, fixedOx: 2 },
    Ga: { name: 'Gallio', z: 31, metal: true },
    Ge: { name: 'Germanio', z: 32, metal: false },
    As: { name: 'Arsenico', z: 33, metal: false },
    Se: { name: 'Selenio', z: 34, metal: false },
    Br: { name: 'Bromo', z: 35, metal: false },
    Kr: { name: 'Kripton', z: 36, metal: false },
    Rb: { name: 'Rubidio', z: 37, metal: true, fixedOx: 1 },
    Sr: { name: 'Stronzio', z: 38, metal: true, fixedOx: 2 },
    Y: { name: 'Ittrio', z: 39, metal: true },
    Zr: { name: 'Zirconio', z: 40, metal: true },
    Nb: { name: 'Niobio', z: 41, metal: true },
    Mo: { name: 'Molibdeno', z: 42, metal: true },
    Tc: { name: 'Tecnezio', z: 43, metal: true },
    Ru: { name: 'Rutenio', z: 44, metal: true },
    Rh: { name: 'Rodio', z: 45, metal: true },
    Pd: { name: 'Palladio', z: 46, metal: true },
    Ag: { name: 'Argento', z: 47, metal: true, fixedOx: 1 },
    Cd: { name: 'Cadmio', z: 48, metal: true, fixedOx: 2 },
    In: { name: 'Indio', z: 49, metal: true },
    Sn: { name: 'Stagno', z: 50, metal: true },
    Sb: { name: 'Antimonio', z: 51, metal: false },
    Te: { name: 'Tellurio', z: 52, metal: false },
    I: { name: 'Iodio', z: 53, metal: false },
    Xe: { name: 'Xenon', z: 54, metal: false },
    Cs: { name: 'Cesio', z: 55, metal: true, fixedOx: 1 },
    Ba: { name: 'Bario', z: 56, metal: true, fixedOx: 2 },
    La: { name: 'Lantanio', z: 57, metal: true },
    Ce: { name: 'Cerio', z: 58, metal: true },
    W: { name: 'Tungsteno', z: 74, metal: true },
    Pt: { name: 'Platino', z: 78, metal: true },
    Au: { name: 'Oro', z: 79, metal: true },
    Hg: { name: 'Mercurio', z: 80, metal: true },
    Tl: { name: 'Tallio', z: 81, metal: true },
    Pb: { name: 'Piombo', z: 82, metal: true },
    Bi: { name: 'Bismuto', z: 83, metal: true },
    U: { name: 'Uranio', z: 92, metal: true }
  };

  // Elementi mancanti (completamento tavola periodica, per validazione simboli)
  const EXTRA_ELEMENTS = {
    Pr: ['Praseodimio', 59, true], Nd: ['Neodimio', 60, true], Pm: ['Promezio', 61, true],
    Sm: ['Samario', 62, true], Eu: ['Europio', 63, true], Gd: ['Gadolinio', 64, true],
    Tb: ['Terbio', 65, true], Dy: ['Disprosio', 66, true], Ho: ['Olmio', 67, true],
    Er: ['Erbio', 68, true], Tm: ['Tulio', 69, true], Yb: ['Itterbio', 70, true],
    Lu: ['Lutezio', 71, true], Hf: ['Afnio', 72, true], Ta: ['Tantalio', 73, true],
    Re: ['Renio', 75, true], Os: ['Osmio', 76, true], Ir: ['Iridio', 77, true],
    Po: ['Polonio', 84, true], At: ['Astato', 85, false], Rn: ['Radon', 86, false],
    Fr: ['Francio', 87, true], Ra: ['Radio', 88, true], Ac: ['Attinio', 89, true],
    Th: ['Torio', 90, true], Pa: ['Protoattinio', 91, true], Np: ['Nettunio', 93, true],
    Pu: ['Plutonio', 94, true], Am: ['Americio', 95, true], Cm: ['Curio', 96, true],
    Bk: ['Berkelio', 97, true], Cf: ['Californio', 98, true], Es: ['Einsteinio', 99, true],
    Fm: ['Fermio', 100, true], Md: ['Mendelevio', 101, true], No: ['Nobelio', 102, true],
    Lr: ['Laurenzio', 103, true], Rf: ['Rutherfordio', 104, true], Db: ['Dubnio', 105, true],
    Sg: ['Seaborgio', 106, true], Bh: ['Bohrio', 107, true], Hs: ['Hassio', 108, true],
    Mt: ['Meitnerio', 109, true], Ds: ['Darmstadtio', 110, true], Rg: ['Roentgenio', 111, true],
    Cn: ['Copernicio', 112, true], Nh: ['Nihonio', 113, true], Fl: ['Flerovio', 114, true],
    Mc: ['Moscovio', 115, true], Lv: ['Livermorio', 116, true], Ts: ['Tennesso', 117, false],
    Og: ['Oganesson', 118, false]
  };
  Object.keys(EXTRA_ELEMENTS).forEach(sym => {
    const [name, z, metal] = EXTRA_ELEMENTS[sym];
    if (!ELEMENTS[sym]) ELEMENTS[sym] = { name, z, metal };
  });

  // ---------------------------------------------------------------------
  // NORMALIZZAZIONE DELL'INPUT
  // ---------------------------------------------------------------------
  const SUB_DIGITS = '₀₁₂₃₄₅₆₇₈₉';
  const SUP_DIGITS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const ARROW_RE = /<=>|<->|<-->|-->|->|=>|=|→|⟶|➔|➜|➝|⇒|⟹|⇌|⇄|↔|⟷|⇋/g;

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /**
   * Converte tutte le varianti tipografiche in una sintassi unica:
   * pedici/apici Unicode (H₂O, Fe²⁺), segni meno tipografici, '+' a tutta larghezza,
   * punto dei sali idrati, frecce di ogni tipo (→ diventa sempre " -> ").
   */
  function normalizeText(str) {
    if (str == null) return '';
    let s = String(str)
      .replace(/[\u2212\u2010\u2011\u2012\u2013\u2014\uFE63\uFF0D]/g, '-')
      .replace(/[\uFF0B\u207A\u208A]/g, m => (m === '\u207A' ? '⁺' : '+'))
      .replace(/[\u00A0\u2009\u202F]/g, ' ')
      .replace(/[•∙⋅]/g, '·');
    // Pedici Unicode -> cifre normali
    s = s.replace(/[₀-₉]/g, d => String(SUB_DIGITS.indexOf(d)));
    // Apici numerici seguiti da segno ASCII (es. "Fe²+" durante la digitazione) -> ^2+
    s = s.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]+)(\d*)([+-])(?=$|[\s+\-)\]])/g, (m, sup, dig, sign) =>
      '^' + sup.split('').map(d => SUP_DIGITS.indexOf(d)).join('') + dig + sign);
    // Apici Unicode (cifre + segno) -> notazione ^n±
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]*[⁺⁻]|[⁺⁻][⁰¹²³⁴⁵⁶⁷⁸⁹]*/g, m => {
      const digits = m.replace(/[⁺⁻]/g, '').split('').map(d => SUP_DIGITS.indexOf(d)).join('');
      const sign = m.includes('⁺') ? '+' : '-';
      return '^' + digits + sign;
    });
    s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, d => String(SUP_DIGITS.indexOf(d)));
    // Frecce
    s = s.replace(ARROW_RE, ' -> ');
    return s;
  }

  /**
   * Pulisce una singola formula (senza spazi, apici uniformati).
   */
  function cleanFormula(str) {
    if (!str) return '';
    return normalizeText(str)
      .trim()
      .replace(/\s+/g, '')
      .replace(/\{(\d*[+-]|[+-]\d*)\}$/g, '^$1')   // Fe{2+} -> Fe^2+
      .replace(/\^\{(\d*[+-]|[+-]\d*)\}$/g, '^$1') // Fe^{2+} -> Fe^2+
      .replace(/\^\((\d*[+-]|[+-]\d*)\)$/g, '^$1') // Fe^(2+) -> Fe^2+
      .replace(/\*/g, '·');                         // CuSO4*5H2O -> CuSO4·5H2O
  }

  function chargeToString(charge) {
    if (!charge) return '';
    const mag = Math.abs(charge);
    return (mag === 1 ? '' : String(mag)) + (charge > 0 ? '+' : '-');
  }

  function isLoneElement(body) {
    return /^[A-Z][a-z]?$/.test(body) && !!ELEMENTS[body];
  }

  /**
   * Estrae carica e corpo della formula, segnalando le interpretazioni ambigue.
   * Notazioni supportate:
   *   MnO4^-  Fe^2+  Fe^+2  Fe{3+}  Fe^{3+}  SO4(2-)  Fe²⁺  MnO₄⁻
   *   senza ^: Fe2+ (Fe²⁺), Cu++ (Cu²⁺), MnO4- (MnO₄⁻), SO42- (SO₄²⁻), Cr2O72- (Cr₂O₇²⁻)
   */
  function extractCharge(formulaStr) {
    const clean = cleanFormula(formulaStr);
    const res = (body, charge, note) => ({ body, charge, ambiguous: !!note, note: note || null });

    // 1) Esplicita con ^
    let m = clean.match(/\^([+-])\1+$/);
    if (m) {
      const mag = m[0].length - 1;
      return res(clean.slice(0, m.index), m[1] === '+' ? mag : -mag);
    }
    m = clean.match(/\^(\d*)([+-])$/);
    if (m) {
      const mag = m[1] ? parseInt(m[1], 10) : 1;
      return res(clean.slice(0, m.index), m[2] === '+' ? mag : -mag);
    }
    m = clean.match(/\^([+-])(\d+)$/);
    if (m) {
      const mag = parseInt(m[2], 10);
      return res(clean.slice(0, m.index), m[1] === '+' ? mag : -mag);
    }
    // 2) Tra parentesi alla fine: SO4(2-), Cl(-)
    m = clean.match(/\((\d*)([+-])\)$/);
    if (m) {
      const mag = m[1] ? parseInt(m[1], 10) : 1;
      return res(clean.slice(0, m.index), m[2] === '+' ? mag : -mag);
    }
    // 3) Segni ripetuti: Cu++, Fe+++, O--
    m = clean.match(/([+-])\1+$/);
    if (m && m.index > 0) {
      const mag = m[0].length;
      return res(clean.slice(0, m.index), m[1] === '+' ? mag : -mag);
    }
    // 4) Segno finale senza ^ (notazione "veloce")
    m = clean.match(/(\d*)([+-])$/);
    if (m && m.index > 0) {
      const sign = m[2] === '+' ? 1 : -1;
      const digits = m[1];
      const before = clean.slice(0, m.index);
      if (!digits) return res(before, sign);

      const endsWithGroup = /[\)\]]$/.test(before);
      if (isLoneElement(before) || endsWithGroup) {
        // Fe2+, S2-, [Fe(CN)6]3- : le cifre sono la carica
        if (digits.length === 1 || parseInt(digits, 10) <= 8) {
          return res(before, sign * parseInt(digits, 10));
        }
        // Hg22+ -> Hg2 con carica 2+
        return res(before + digits.slice(0, -1), sign * parseInt(digits.slice(-1), 10), 'ambiguous');
      }
      if (digits.length >= 2) {
        // SO42-, Cr2O72-, PO43- : ultima cifra = carica, il resto è pedice
        return res(before + digits.slice(0, -1), sign * parseInt(digits.slice(-1), 10), 'ambiguous');
      }
      // MnO4-, NO3-, NH4+ : la cifra è un pedice, carica ±1
      return res(before + digits, sign, 'ambiguous');
    }
    return res(clean, 0);
  }

  /**
   * Parsing della composizione atomica con validazione rigorosa.
   * Gestisce () [] annidate e sali idrati (CuSO4·5H2O).
   * Lancia errori comprensibili per simboli inesistenti, minuscole, parentesi errate.
   */
  function parseComposition(formulaBody) {
    const body = String(formulaBody || '');
    if (!body) throw new Error('Formula vuota.');
    const counts = {};

    const add = (el, n) => { counts[el] = (counts[el] || 0) + n; };

    function parseSegment(str, multiplier, offset) {
      let i = 0;
      if (!str.length) throw new Error('Parentesi vuote nella formula.');
      while (i < str.length) {
        const ch = str[i];
        if (ch === '(' || ch === '[') {
          const close = ch === '(' ? ')' : ']';
          let depth = 1, j = i + 1;
          while (j < str.length && depth > 0) {
            if (str[j] === ch) depth++;
            else if (str[j] === close) depth--;
            j++;
          }
          if (depth !== 0) throw new Error(`Manca la parentesi di chiusura «${close}».`);
          const inner = str.substring(i + 1, j - 1);
          let k = j;
          while (k < str.length && /\d/.test(str[k])) k++;
          const sub = k > j ? parseInt(str.substring(j, k), 10) : 1;
          if (sub === 0) throw new Error('Un pedice non può essere 0.');
          parseSegment(inner, multiplier * sub, offset + i + 1);
          i = k;
        } else if (ch === ')' || ch === ']') {
          throw new Error(`Parentesi «${ch}» chiusa senza essere stata aperta.`);
        } else if (/[A-Z]/.test(ch)) {
          let sym = ch;
          if (str[i + 1] && /[a-z]/.test(str[i + 1]) && ELEMENTS[ch + str[i + 1]]) sym = ch + str[i + 1];
          if (!ELEMENTS[sym]) {
            const two = str[i + 1] && /[a-z]/.test(str[i + 1]) ? ch + str[i + 1] : ch;
            throw new Error(`«${two}» non è un elemento chimico.`);
          }
          i += sym.length;
          if (str[i] && /[a-z]/.test(str[i])) {
            throw new Error(`«${sym}${str[i]}» non è un elemento chimico (dopo «${sym}» c'è una minuscola di troppo).`);
          }
          let num = '';
          while (i < str.length && /\d/.test(str[i])) num += str[i++];
          const n = num ? parseInt(num, 10) : 1;
          if (n === 0) throw new Error(`Pedice 0 dopo «${sym}».`);
          add(sym, n * multiplier);
        } else if (/[a-z]/.test(ch)) {
          const word = str.slice(i).match(/^[a-z]+/)[0];
          const guess = word[0].toUpperCase() + word.slice(1, 2);
          const hint = ELEMENTS[guess] ? ` Forse intendevi «${guess}»?` : '';
          throw new Error(`«${word}»: i simboli degli elementi iniziano con la maiuscola (es. H2O, NaCl, Fe).${hint}`);
        } else if (/\d/.test(ch)) {
          throw new Error('Un numero non può stare all\'inizio di una formula o di un gruppo (scrivi il coefficiente separato, es. "2 H2O").');
        } else if (ch === '^') {
          throw new Error('La carica (^) va scritta solo alla fine della formula, es. Fe^3+.');
        } else if (ch === '+' || ch === '-') {
          throw new Error('Segno di carica in posizione non valida: scrivi la carica alla fine, es. SO4^2-.');
        } else {
          throw new Error(`Carattere non riconosciuto «${ch}».`);
        }
      }
    }

    // Sali idrati: CuSO4·5H2O
    const parts = body.split('·');
    parts.forEach((part, idx) => {
      if (!part) throw new Error('Punto «·» senza formula su un lato.');
      let mult = 1, rest = part;
      if (idx > 0) {
        const mm = part.match(/^(\d+)(.*)$/);
        if (mm) { mult = parseInt(mm[1], 10); rest = mm[2]; }
      }
      parseSegment(rest, mult, 0);
    });
    return counts;
  }

  /**
   * Analizza una singola specie (eventualmente con coefficiente) senza lanciare eccezioni.
   */
  function parseSpecies(raw) {
    const original = String(raw || '').trim();
    let text = normalizeText(original).trim();
    let coeff = null;
    const cm = text.match(/^(\d+)\s*(?=[A-Z(\[])/);
    if (cm) { coeff = parseInt(cm[1], 10); text = text.slice(cm[0].length); }
    const out = { raw: original, coeff, body: '', charge: 0, canonical: '', composition: null, error: null, note: null, ambiguous: false };
    try {
      if (!text) throw new Error('Specie vuota (c\'è un «+» di troppo?).');
      if (/^e\^?-?$/.test(cleanFormula(text)) || /^e-$/.test(cleanFormula(text))) {
        throw new Error('Non inserire gli elettroni (e⁻): li aggiunge il risolutore.');
      }
      const ex = extractCharge(text);
      out.body = ex.body;
      out.charge = ex.charge;
      out.ambiguous = ex.ambiguous;
      if (!ex.body) throw new Error('Manca la formula prima della carica.');
      out.composition = parseComposition(ex.body);
      out.canonical = ex.body + (ex.charge ? '^' + chargeToString(ex.charge) : '');
      const exotic = Object.keys(out.composition).filter(el => ELEMENTS[el].z > 94);
      if (exotic.length) {
        const el = exotic[0];
        out.note = `«${el}» è ${ELEMENTS[el].name} (Z=${ELEMENTS[el].z}): se intendevi ${el[0]} + ${el[1].toUpperCase()} scrivi ${el[0]}${el[1].toUpperCase()}.`;
      }
    } catch (e) {
      out.error = e.message;
    }
    return out;
  }

  /**
   * Divide un membro dell'equazione nelle singole specie, distinguendo il '+'
   * separatore dal '+' di carica (Fe^2+ + Cu, Fe2+ + Cu, H2+O2, Fe^3++Cu).
   */
  function splitSide(side) {
    const out = [];
    let buf = '';
    for (let i = 0; i < side.length; i++) {
      const ch = side[i];
      if (ch !== '+') { buf += ch; continue; }
      const prevRaw = side[i - 1] || '';
      let j = i + 1;
      while (j < side.length && /\s/.test(side[j])) j++;
      const nextNonSpace = side[j] || '';
      const spaceAfter = /\s/.test(side[i + 1] || '');
      const spaceBefore = /\s/.test(prevRaw);
      const afterCaret = /\^\d*$/.test(buf);

      let isCharge;
      if (afterCaret && !spaceBefore) isCharge = true;                 // Fe^2+  Fe^+
      else if (spaceBefore || buf.trim() === '') isCharge = false;     // " + "
      else if (nextNonSpace === '' || nextNonSpace === '+' || nextNonSpace === ')') isCharge = true; // fine o "++"
      else if (spaceAfter) isCharge = true;                            // "Fe2+ Cu"... trattato come carica
      else isCharge = false;                                            // H2+O2
      // caso "Fe2+ + Cu": il primo + ha dopo spazio e poi '+': coperto da nextNonSpace === '+'
      if (isCharge) buf += ch;
      else { out.push(buf); buf = ''; }
    }
    out.push(buf);
    return out.map(s => s.trim());
  }

  /**
   * Analisi completa (non lancia eccezioni): usata per anteprima live e validazione.
   * Ritorna { ok, reactants[], products[], errors[], notes[] }
   */
  function analyzeEquation(eqStr) {
    const norm = normalizeText(eqStr || '').trim();
    const result = { ok: false, reactants: [], products: [], errors: [], notes: [], ambiguous: [], hasArrow: false };
    if (!norm) { result.errors.push('Inserisci un\'equazione.'); return result; }
    const sides = norm.split(' -> ');
    if (sides.length === 1) {
      result.errors.push('Manca la freccia di reazione: separa reagenti e prodotti con -> (oppure = o →).');
    } else if (sides.length > 2) {
      result.errors.push('C\'è più di una freccia di reazione.');
    }
    result.hasArrow = sides.length >= 2;
    const parseSide = (txt, label) => {
      const parts = splitSide(txt);
      if (parts.length === 1 && parts[0] === '') {
        if (result.hasArrow) result.errors.push(`Mancano i ${label}.`);
        return [];
      }
      return parts.map(p => {
        const sp = parseSpecies(p);
        if (sp.error) {
          const tag = p ? '«' + p + '»' : '';
          result.errors.push(!tag || sp.error.startsWith(tag) ? sp.error : `${tag}: ${sp.error}`);
        }
        if (sp.note) result.notes.push(sp.note);
        if (sp.ambiguous && !sp.error) result.ambiguous.push(sp);
        return sp;
      });
    };
    result.reactants = parseSide(sides[0] || '', 'reagenti');
    result.products = sides.length >= 2 ? parseSide(sides.slice(1).join(' '), 'prodotti') : [];

    // Bilancio elementi: un elemento presente da un solo lato rende impossibile il bilanciamento
    if (result.hasArrow && result.errors.length === 0) {
      const elsOf = list => new Set(list.flatMap(s => Object.keys(s.composition || {})));
      const L = elsOf(result.reactants), R = elsOf(result.products);
      const aux = new Set(['H', 'O']); // compensabili con H2O / H+ / OH-
      const onlyL = [...L].filter(e => !R.has(e) && !aux.has(e));
      const onlyR = [...R].filter(e => !L.has(e) && !aux.has(e));
      if (onlyL.length) result.errors.push(`L'elemento ${onlyL.join(', ')} compare solo tra i reagenti.`);
      if (onlyR.length) result.errors.push(`L'elemento ${onlyR.join(', ')} compare solo tra i prodotti.`);
    }
    result.ok = result.hasArrow && sides.length === 2 && result.errors.length === 0;
    return result;
  }

  /**
   * Versione "rigida" per il risolutore: lancia il primo errore.
   */
  function parseEquation(eqStr) {
    const a = analyzeEquation(eqStr);
    if (!a.ok) throw new Error(a.errors[0] || 'Equazione non valida.');
    return a;
  }

  /** Forma canonica dell'equazione (senza coefficienti) per confronti */
  function canonicalEquation(eqStr) {
    const a = analyzeEquation(eqStr);
    if (!a.hasArrow) return '';
    return a.reactants.map(s => s.canonical || s.raw).join(' + ') + ' -> ' + a.products.map(s => s.canonical || s.raw).join(' + ');
  }

  // ---------------------------------------------------------------------
  // FORMATTAZIONE "DAL VIVO" DEL TESTO DIGITATO (pedici/apici Unicode)
  // ---------------------------------------------------------------------
  const toSub = str => String(str).replace(/\d/g, d => SUB_DIGITS[d]);
  const toSup = str => String(str).replace(/\d/g, d => SUP_DIGITS[d]).replace(/\+/g, '⁺').replace(/-/g, '⁻');
  const prettyBody = body => body.replace(/([A-Za-z\)\]])(\d+)/g, (m, a, d) => a + toSub(d));
  const prettyCharge = c => (c ? toSup((Math.abs(c) === 1 ? '' : Math.abs(c)) + (c > 0 ? '+' : '-')) : '');
  const lightFormat = t => normalizeText(t).replace(/([A-Za-z\)\]])(\d+)/g, (m, a, d) => a + toSub(d))
                                           .replace(/\^(\d*[+-])$/, (m, c) => toSup(c));

  /** Una singola specie in forma tipografica: "Fe2+" -> "Fe²⁺", "2H2O" -> "2 H₂O" */
  function prettySpecies(raw) {
    const t = String(raw || '').trim();
    if (!t) return '';
    const sp = parseSpecies(t);
    if (sp.error) return lightFormat(t);
    return (sp.coeff ? sp.coeff + ' ' : '') + prettyBody(sp.body) + prettyCharge(sp.charge);
  }

  /**
   * Riscrive il testo di un campo mentre l'utente digita.
   * Gestisce gli stati intermedi: carica in corso ("Fe^", "Fe^2" -> "Fe²"),
   * freccia in corso ("A -", "A <", "A ="), separatori "+" e spazi finali.
   * mode: 'equation' oppure 'species'.
   */
  function prettyText(raw, mode = 'equation') {
    let work = String(raw || '');
    if (!work.trim()) return work;
    if (mode === 'equation') {
      work = work.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]*)⁺(?=[A-Z(\[0-9])/g, (m, d) =>
        d.replace(/./g, c => SUB_DIGITS[SUP_DIGITS.indexOf(c)]) + ' + ');
      // "O₂⁻" + ">" : il meno era l'inizio della freccia, non una carica
      work = work.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹]*)⁻>/g, (m, d) =>
        d.replace(/./g, c => SUB_DIGITS[SUP_DIGITS.indexOf(c)]) + ' -> ');
    }
    let tail = '';

    if (mode === 'equation') {
      // freccia non ancora completata: "A -", "A <", "A =", oppure "MnO₄⁻-" (meno dopo una carica già scritta)
      const pend = work.match(/(^|\s|[⁺⁻])(-|<|<-|<=|=|--)$/);
      if (pend) { tail = ' ' + pend[2]; work = work.slice(0, pend.index + pend[1].length); }
    }
    if (!tail) {
      const pc = work.match(/(\^)([0-9⁰¹²³⁴⁵⁶⁷⁸⁹]*)$|([⁰¹²³⁴⁵⁶⁷⁸⁹]+)([0-9]*)$/); // carica non ancora completata
      if (pc && pc.index > 0 && /[A-Za-z0-9₀-₉\)\]]$/.test(work.slice(0, pc.index))) {
        const digits = (pc[2] || pc[3] || '') + (pc[4] || '');
        const flat = digits.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, d => String(SUP_DIGITS.indexOf(d)));
        tail = flat ? toSup(flat) : '^';
        work = work.slice(0, pc.index);
      }
    }
    const trailingSpace = !tail && /\s$/.test(work);

    let out;
    if (mode === 'species') {
      out = prettySpecies(work);
    } else {
      const norm = normalizeText(work);
      const sides = norm.split(' -> ');
      out = sides.map(side => {
        const parts = splitSide(side);
        if (parts.length === 1 && parts[0] === '') return '';
        return parts.map(prettySpecies).join(' + ');
      }).join(' → ').replace(/^ +/, '');
      if (/->\s*$/.test(norm) || /→\s*$/.test(work)) out = out.replace(/\s*$/, ' ');
    }
    if (tail) out = out.replace(/\s+$/, tail.startsWith(' ') ? '' : '') + tail;
    else if (trailingSpace && !/\s$/.test(out)) out += ' ';
    return out;
  }

  /** Peso di un carattere per riallineare il cursore tra testo grezzo e formattato */
  function caretWeight(c) {
    if (/\s/.test(c) || c === '^') return 0;
    if (c === '→') return 2;
    return 1;
  }

  /** Posizione del cursore nel testo formattato corrispondente a quella nel testo grezzo */
  function mapCaret(raw, caret, pretty) {
    if (caret >= raw.length) return pretty.length;
    let target = 0;
    for (let i = 0; i < caret; i++) target += caretWeight(raw[i]);
    const afterSpace = caret > 0 && /\s/.test(raw[caret - 1]);
    let acc = 0, i = 0;
    while (i < pretty.length && acc < target) acc += caretWeight(pretty[i++]);
    if (afterSpace) while (i < pretty.length && /\s/.test(pretty[i])) i++;
    return Math.min(i, pretty.length);
  }

  /** Formatta il corpo (senza carica) con pedici HTML. */
  function formatBodyHTML(body) {
    return escapeHTML(body)
      .replace(/([A-Za-z\)\]])(\d+)/g, '$1<sub>$2</sub>')
      .replace(/·(\d+)/g, '·$1');
  }

  function formatChargeHTML(charge) {
    if (!charge) return '';
    const mag = Math.abs(charge);
    return `<sup>${mag === 1 ? '' : mag}${charge > 0 ? '+' : '−'}</sup>`;
  }

  /**
   * Converte una formula (o un'intera equazione) in HTML con apici e pedici.
   * Es. "Cr2O7^2-" -> "Cr<sub>2</sub>O<sub>7</sub><sup>2−</sup>"
   */
  function formatFormulaHTML(formulaStr) {
    if (!formulaStr) return '';
    const norm = normalizeText(formulaStr).trim();
    if (norm.includes(' -> ') || /\s\+\s/.test(norm)) return formatEquationHTML(formulaStr);
    let text = norm;
    let coeffHTML = '';
    const cm = text.match(/^(\d+)\s+(?=[A-Z(\[])/);
    if (cm) { coeffHTML = `<b>${cm[1]}</b> `; text = text.slice(cm[0].length); }
    const { body, charge } = extractCharge(text);
    return coeffHTML + formatBodyHTML(body) + formatChargeHTML(charge);
  }

  /** Formatta un'equazione completa; le specie errate vengono evidenziate. */
  function formatEquationHTML(eqStr) {
    const a = analyzeEquation(eqStr);
    const fmt = sp => {
      const c = sp.coeff && sp.coeff !== 1 ? `<b>${sp.coeff}</b> ` : '';
      if (sp.error) return `${c}<span class="species-error" title="${escapeHTML(sp.error)}">${escapeHTML(sp.raw || '?')}</span>`;
      return c + formatBodyHTML(sp.body) + formatChargeHTML(sp.charge);
    };
    const left = a.reactants.map(fmt).join(' + ');
    if (!a.hasArrow) return left;
    return `${left} &rarr; ${a.products.map(fmt).join(' + ')}`;
  }

  /**
   * Determina i numeri di ossidazione degli elementi presenti in una specie chimica.
   * Restituisce un oggetto con:
   * - oxidationStates: { [element]: number }
   * - steps: array di spiegazioni testuali passo-passo
   * - equation: stringa che mostra la formula di bilancio algebrico dei n.o.
   */
  function calculateOxidationNumbers(formulaStr) {
    const { body, charge } = extractCharge(formulaStr);
    const composition = parseComposition(body);
    const elements = Object.keys(composition);
    const steps = [];
    const oxidationStates = {};

    // CASO 1: Sostanza pura elementare (es. O2, Cl2, Fe, Cu, S8, P4)
    if (elements.length === 1 && charge === 0) {
      const el = elements[0];
      oxidationStates[el] = 0;
      steps.push({
        rule: 'Sostanza elementare',
        text: `La specie <b>${formatFormulaHTML(formulaStr)}</b> è una sostanza elementare allo stato fondamentale. Per definizione, il numero di ossidazione di <b>${el}</b> è <b>0</b>.`
      });
      return {
        formula: formulaStr,
        composition,
        charge,
        oxidationStates,
        steps,
        equation: `n.o.(${el}) = 0`
      };
    }

    // CASO 2: Ione monoatomico (es. Fe2+, Fe3+, Cl-, Na+, S2-)
    if (elements.length === 1 && charge !== 0) {
      const el = elements[0];
      const ox = charge / composition[el];
      oxidationStates[el] = ox;
      steps.push({
        rule: 'Ione monoatomico',
        text: `La specie <b>${formatFormulaHTML(formulaStr)}</b> è uno ione monoatomico con carica ${charge > 0 ? '+' + charge : charge}. Il numero di ossidazione di <b>${el}</b> coincide con la sua carica: <b>${ox > 0 ? '+' + ox : ox}</b>.`
      });
      return {
        formula: formulaStr,
        composition,
        charge,
        oxidationStates,
        steps,
        equation: `n.o.(${el}) = ${ox > 0 ? '+' + ox : ox}`
      };
    }

    // CASO 3: Composti o ioni poliatomici
    // Applicazione sistematica delle regole gerarchiche IUPAC:
    // 1. Fluoro è sempre -1 nei composti
    // 2. Metalli alcalini (Gruppo 1: Li, Na, K, Rb, Cs) hanno sempre n.o. = +1
    // 3. Metalli alcalino-terrosi (Gruppo 2: Be, Mg, Ca, Sr, Ba) hanno sempre n.o. = +2
    // 4. Alluminio (Al) è sempre +3, Zinco (Zn) è +2, Argento (Ag) è +1
    // 5. Idrogeno (H):
    //    - se combinato con metalli più elettropositivi (idruri ionici come NaH, CaH2): n.o. = -1
    //    - se combinato con non metalli: n.o. = +1
    // 6. Ossigeno (O):
    //    - perossidi noti (H2O2, Na2O2, BaO2): n.o. = -1
    //    - superossidi (KO2): n.o. = -0.5
    //    - in OF2: n.o. = +2
    //    - in quasi tutti gli altri composti e ioni poliatomici: n.o. = -2
    // 7. Alogeni (Cl, Br, I):
    //    - n.o. = -1 nei composti binari dove non ci sono O o F più elettronegativi
    // 8. Elemento incognito: calcolato tramite la somma algebrica pari alla carica totale della molecola o ione.

    // Controlliamo casi noti speciali (perossidi es. H2O2, Na2O2)
    const isPeroxide = (
      (elements.includes('H') && elements.includes('O') && composition['H'] === 2 && composition['O'] === 2 && elements.length === 2) ||
      (elements.includes('Na') && elements.includes('O') && composition['Na'] === 2 && composition['O'] === 2 && elements.length === 2) ||
      (elements.includes('Ba') && elements.includes('O') && composition['Ba'] === 1 && composition['O'] === 2 && elements.length === 2)
    );

    // Controlliamo idruri metallici binari (es. NaH, CaH2, LiH)
    const isMetalHydride = elements.length === 2 && elements.includes('H') && elements.some(e => e !== 'H' && ELEMENTS[e]?.metal);

    // Assegnazione elementi fissi o prioritari
    elements.forEach(el => {
      if (el === 'F') {
        oxidationStates['F'] = -1;
        steps.push({
          rule: 'Fluoro',
          text: `Il Fluoro (F) è l'elemento più elettronegativo della tavola periodica: ha sempre <b>n.o. = −1</b> nei suoi composti.`
        });
      } else if (ELEMENTS[el]?.fixedOx !== undefined) {
        const fix = ELEMENTS[el].fixedOx;
        oxidationStates[el] = fix;
        steps.push({
          rule: `Metallo (${ELEMENTS[el].name})`,
          text: `Il ${ELEMENTS[el].name} (${el}) appartiene a una famiglia con stato di ossidazione fisso: <b>n.o. = ${fix > 0 ? '+' + fix : fix}</b>.`
        });
      }
    });

    // Idrogeno
    if (elements.includes('H') && oxidationStates['H'] === undefined) {
      if (isMetalHydride) {
        oxidationStates['H'] = -1;
        steps.push({
          rule: 'Idruro metallico',
          text: `L'Idrogeno (H) è legato a un metallo più elettropositivo (idruro): assume <b>n.o. = −1</b>.`
        });
      } else {
        oxidationStates['H'] = +1;
        steps.push({
          rule: 'Idrogeno',
          text: `L'Idrogeno (H) legato a non metalli assume <b>n.o. = +1</b>.`
        });
      }
    }

    // Ossigeno
    if (elements.includes('O') && oxidationStates['O'] === undefined) {
      if (isPeroxide) {
        oxidationStates['O'] = -1;
        steps.push({
          rule: 'Perossido',
          text: `La sostanza contiene il legame perossidico (−O−O−): l'Ossigeno (O) assume <b>n.o. = −1</b>.`
        });
      } else if (elements.includes('F') && elements.length === 2) {
        // e.g. OF2
        oxidationStates['O'] = +2;
        steps.push({
          rule: 'Fluoruro di ossigeno',
          text: `In presenza di Fluoro, l'Ossigeno ha elettronegatività inferiore: in OF<sub>2</sub> assume <b>n.o. = +2</b>.`
        });
      } else {
        oxidationStates['O'] = -2;
        steps.push({
          rule: 'Ossigeno standard',
          text: `L'Ossigeno (O) nei composti ordinari ha <b>n.o. = −2</b>.`
        });
      }
    }

    // Alogeni senza ossigeno o fluoro (es. alogenuri semplici come FeCl3, CuCl2, KI)
    elements.forEach(el => {
      if (['Cl', 'Br', 'I'].includes(el) && oxidationStates[el] === undefined) {
        if (!elements.includes('O') && !elements.includes('F')) {
          oxidationStates[el] = -1;
          steps.push({
            rule: `Alogenuro (${el})`,
            text: `L'alogeno (${el}) in un composto binario non ossigenato assume <b>n.o. = −1</b>.`
          });
        }
      }
    });

    // Elementi rimasti incogniti
    const unknownElements = elements.filter(el => oxidationStates[el] === undefined);

    let equationString = '';

    if (unknownElements.length === 1) {
      const target = unknownElements[0];
      const targetCount = composition[target];

      let knownSum = 0;
      let exprParts = [];

      elements.forEach(el => {
        const count = composition[el];
        if (el === target) {
          exprParts.push(count === 1 ? `x` : `${count} · x`);
        } else {
          const ox = oxidationStates[el];
          knownSum += count * ox;
          const signStr = ox >= 0 ? `+${ox}` : `${ox}`;
          exprParts.push(`${count} · (${signStr})`);
        }
      });

      const totalTargetOx = charge - knownSum;
      const targetOx = totalTargetOx / targetCount;
      oxidationStates[target] = targetOx;

      const formattedOx = targetOx > 0 ? `+${targetOx}` : `${targetOx}`;
      equationString = `${exprParts.join(' + ')} = ${charge}  ⟹  ${targetCount === 1 ? '' : targetCount + '·'}x = ${totalTargetOx >= 0 ? '+' + totalTargetOx : totalTargetOx}  ⟹  n.o.(${target}) = ${formattedOx}`;

      steps.push({
        rule: `Calcolo algebrico per ${target}`,
        text: `La somma algebrica dei numeri di ossidazione moltiplicati per il numero di atomi deve eguagliare la carica complessiva (<b>${charge}</b>):<br>` +
              `<div class="math-box"><code>${equationString}</code></div>` +
              `Quindi per <b>${target}</b> il numero di ossidazione è <b>${formattedOx}</b>.`
      });
    } else if (unknownElements.length === 0) {
      // Tutti già determinati
      equationString = elements.map(el => `${composition[el]} · (${oxidationStates[el]})`).join(' + ') + ` = ${charge}`;
    } else {
      // Più di un incognito: e.g. composti organici o sali complessi come NH4NO3 o Fe2(SO4)3
      // Tentativo euristico per gruppi noti (es. ammonio NH4+, solfato SO4^2-, nitrato NO3-)
      steps.push({
        rule: 'Elementi multipli',
        text: `Questo composto contiene più elementi con numero di ossidazione variabile. I numeri sono stati calcolati considerando i gruppi ionici costituenti.`
      });
      // Fallback a valori standard di chimica inorganica comune
      unknownElements.forEach(el => {
        oxidationStates[el] = oxidationStates[el] || 0;
      });
    }

    return {
      formula: formulaStr,
      composition,
      charge,
      oxidationStates,
      steps,
      equation: equationString
    };
  }

  return {
    normalizeText,
    cleanFormula,
    extractCharge,
    parseComposition,
    parseSpecies,
    splitSide,
    analyzeEquation,
    parseEquation,
    canonicalEquation,
    prettyText,
    prettySpecies,
    mapCaret,
    formatFormulaHTML,
    formatEquationHTML,
    calculateOxidationNumbers,
    escapeHTML,
    ELEMENTS
  };
}));
