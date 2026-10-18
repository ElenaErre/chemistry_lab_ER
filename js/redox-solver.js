/**
 * redox-solver.js
 * Motore di risoluzione e bilanciamento per equazioni redox
 * Implementa sia il Metodo delle Semireazioni (ionico-elettronico)
 * sia il Metodo del Numero di Ossidazione.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./chem-parser'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./chem-parser'));
  } else {
    root.RedoxSolver = factory(root.ChemParser);
  }
}(typeof self !== 'undefined' ? self : this, function (ChemParser) {

  // Helper per calcolo Massimo Comune Divisore e Minimo Comune Multiplo
  function gcd(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) {
      let t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  function lcm(a, b) {
    if (a === 0 || b === 0) return 0;
    return Math.abs(Math.round((a * b) / gcd(a, b)));
  }

  // Semplificazione di una frazione [numeratore, denominatore]
  function simplifyFraction(n, d) {
    if (d < 0) {
      n = -n;
      d = -d;
    }
    let common = gcd(n, d);
    return [n / common, d / common];
  }

  /**
   * Parser di un'equazione chimica grezza in forma reagenti -> prodotti.
   * Accetta frecce standard: ->, ➔, ⟶, =, =>
   */
  function parseEquationString(eqStr) {
    if (!eqStr || !String(eqStr).trim()) throw new Error("Inserisci un'equazione da bilanciare.");
    // Parsing robusto: distingue il '+' separatore dal '+' di carica,
    // accetta pedici/apici Unicode, frecce varie e valida i simboli.
    const parsed = ChemParser.parseEquation(eqStr);
    const uniq = list => {
      const seen = new Set();
      return list.map(sp => sp.canonical).filter(c => (seen.has(c) ? false : (seen.add(c), true)));
    };
    return { reactants: uniq(parsed.reactants), products: uniq(parsed.products) };
  }

  /**
   * Risolve il sistema lineare stechiometrico e di carica per trovare i coefficienti interi minimi.
   */
  function balanceLinearSystem(reactants, products, medium = 'acid') {
    // Aggiungiamo specie ambientali ausiliarie se non già presenti
    const allReactants = [...reactants];
    const allProducts = [...products];

    const all = [...allReactants, ...allProducts];
    const hasH2O = all.includes('H2O');
    const hasH = all.includes('H^+') || all.includes('H3O^+');
    const hasOH = all.includes('OH^-');

    // In base all'ambiente aggiungiamo candidati
    const auxSpecies = [];
    if (!hasH2O) auxSpecies.push('H2O');
    if (medium === 'acid' && !hasH) auxSpecies.push('H^+');
    if (medium === 'base' && !hasOH) auxSpecies.push('OH^-');

    // Tutti i composti candidati
    const candReactants = [...allReactants];
    const candProducts = [...allProducts];

    // Proviamo a determinare da che parte vanno le specie ausiliarie
    // Creiamo una lista completa di tutte le specie con ruoli
    // Usiamo l'approccio robusto: matrici con tutte le combinazioni possibili di collocazione
    const possibleSpeciesLists = [];

    if (auxSpecies.length === 0) {
      possibleSpeciesLists.push({ r: candReactants, p: candProducts });
    } else if (auxSpecies.length === 1) {
      const sp = auxSpecies[0];
      possibleSpeciesLists.push({ r: [...candReactants, sp], p: candProducts });
      possibleSpeciesLists.push({ r: candReactants, p: [...candProducts, sp] });
      possibleSpeciesLists.push({ r: candReactants, p: candProducts }); // senza
    } else if (auxSpecies.length === 2) {
      const sp1 = auxSpecies[0];
      const sp2 = auxSpecies[1];
      // sp1 a sinistra, sp2 a destra
      possibleSpeciesLists.push({ r: [...candReactants, sp1], p: [...candProducts, sp2] });
      // sp2 a sinistra, sp1 a destra
      possibleSpeciesLists.push({ r: [...candReactants, sp2], p: [...candProducts, sp1] });
      // entrambi a sinistra o entrambi a destra
      possibleSpeciesLists.push({ r: [...candReactants, sp1, sp2], p: candProducts });
      possibleSpeciesLists.push({ r: candReactants, p: [...candProducts, sp1, sp2] });
      // solo uno
      possibleSpeciesLists.push({ r: [...candReactants, sp1], p: candProducts });
      possibleSpeciesLists.push({ r: candReactants, p: [...candProducts, sp1] });
      possibleSpeciesLists.push({ r: [...candReactants, sp2], p: candProducts });
      possibleSpeciesLists.push({ r: candReactants, p: [...candProducts, sp2] });
      possibleSpeciesLists.push({ r: candReactants, p: candProducts });
    }

    for (let candidate of possibleSpeciesLists) {
      const sol = trySolveMatrix(candidate.r, candidate.p);
      if (sol) {
        return sol;
      }
    }

    return null;
  }

  function trySolveMatrix(rList, pList) {
    // Costruisce la lista di tutti gli elementi presenti + carica elettrica
    const species = [];
    rList.forEach(s => {
      const { body, charge } = ChemParser.extractCharge(s);
      const comp = ChemParser.parseComposition(body);
      species.push({ raw: s, side: 'reactant', comp, charge });
    });
    pList.forEach(s => {
      const { body, charge } = ChemParser.extractCharge(s);
      const comp = ChemParser.parseComposition(body);
      species.push({ raw: s, side: 'product', comp, charge });
    });

    const elementsSet = new Set();
    species.forEach(sp => {
      Object.keys(sp.comp).forEach(el => elementsSet.add(el));
    });
    const elements = Array.from(elementsSet);

    // Righe della matrice: un'equazione per ogni elemento + una per la conservazione della carica
    const numEquations = elements.length + 1; // +1 per carica
    const numVars = species.length;

    // Matrice A[numEquations][numVars]
    const matrix = [];
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const row = [];
      for (let j = 0; j < numVars; j++) {
        const sp = species[j];
        const count = sp.comp[el] || 0;
        row.push(sp.side === 'reactant' ? count : -count);
      }
      matrix.push(row);
    }
    // Riga della carica
    const chargeRow = [];
    for (let j = 0; j < numVars; j++) {
      const sp = species[j];
      chargeRow.push(sp.side === 'reactant' ? sp.charge : -sp.charge);
    }
    matrix.push(chargeRow);

    // Risoluzione per spazio nullo (null space) con numeri razionali
    let coeffs = solveNullSpaceRational(matrix, numVars);

    // Soluzione non unica (es. H2O2 + MnO4^-: infinite combinazioni con la dismutazione di H2O2).
    // Si aggiunge il vincolo didattico: gli atomi con n.o. invariato si conservano separatamente
    // (es. O(-2) di MnO4^- finisce tutto in H2O), come fa il metodo delle semireazioni.
    if (!coeffs) {
      const oxOf = species.map(sp => {
        try { return ChemParser.calculateOxidationNumbers(sp.raw).oxidationStates; } catch (e) { return {}; }
      });
      const candidates = [];
      elements.forEach(el => {
        const states = new Set();
        species.forEach((sp, j) => { if (sp.comp[el]) states.add(oxOf[j][el]); });
        states.forEach(ox => {
          const row = species.map((sp, j) => {
            const n = (sp.comp[el] && oxOf[j][el] === ox) ? sp.comp[el] : 0;
            return sp.side === 'reactant' ? n : -n;
          });
          const hasL = row.some(v => v > 0), hasR = row.some(v => v < 0);
          if (hasL && hasR) candidates.push(row);
        });
      });
      for (const extra of candidates) {
        coeffs = solveNullSpaceRational([...matrix, extra], numVars);
        if (coeffs && coeffs.every(c => c > 0)) break;
        coeffs = null;
      }
    }
    if (!coeffs || coeffs.some(c => c <= 0)) {
      return null;
    }

    // Costruisce il risultato
    const finalReactants = [];
    const finalProducts = [];
    for (let i = 0; i < species.length; i++) {
      const sp = species[i];
      const c = coeffs[i];
      if (sp.side === 'reactant') {
        finalReactants.push({ formula: sp.raw, coeff: c });
      } else {
        finalProducts.push({ formula: sp.raw, coeff: c });
      }
    }

    return {
      reactants: finalReactants,
      products: finalProducts,
      coeffs
    };
  }

  // Risolve Ax = 0 su numeri razionali e ritorna il vettore minimo di interi positivi
  function solveNullSpaceRational(matrix, numVars) {
    const numRows = matrix.length;
    // Converte ogni elemento in frazione [num, den]
    let A = matrix.map(row => row.map(val => [val, 1]));

    let lead = 0;
    for (let r = 0; r < numRows; r++) {
      if (lead >= numVars) break;
      let i = r;
      while (i < numRows && A[i][lead][0] === 0) {
        i++;
      }
      if (i === numRows) {
        lead++;
        r--;
        continue;
      }
      // Scambio righe
      let temp = A[i];
      A[i] = A[r];
      A[r] = temp;

      // Normalizza riga r
      let leadVal = A[r][lead];
      for (let j = 0; j < numVars; j++) {
        A[r][j] = divFrac(A[r][j], leadVal);
      }

      // Elimina altre righe
      for (let k = 0; k < numRows; k++) {
        if (k !== r) {
          let factor = A[k][lead];
          if (factor[0] !== 0) {
            for (let j = 0; j < numVars; j++) {
              A[k][j] = subFrac(A[k][j], mulFrac(factor, A[r][j]));
            }
          }
        }
      }
      lead++;
    }

    // Trova le variabili libere
    // Poiché per le equazioni chimiche vogliamo la soluzione unidimensionale (o proviamo con l'ultima variabile = 1)
    const sol = new Array(numVars).fill(null);
    sol[numVars - 1] = [1, 1]; // poniamo l'ultima variabile = 1

    for (let r = numRows - 1; r >= 0; r--) {
      let pivotCol = -1;
      for (let c = 0; c < numVars; c++) {
        if (A[r][c][0] !== 0) {
          pivotCol = c;
          break;
        }
      }
      if (pivotCol === -1) continue;

      let sum = [0, 1];
      for (let c = pivotCol + 1; c < numVars; c++) {
        if (sol[c] !== null && A[r][c][0] !== 0) {
          sum = addFrac(sum, mulFrac(A[r][c], sol[c]));
        }
      }
      sol[pivotCol] = negateFrac(sum);
    }

    // Se qualche variabile non è assegnata o è zero o negativa
    if (sol.some(val => val === null || val[0] <= 0)) {
      return null;
    }

    // Troviamo il mcm di tutti i denominatori
    let totalLcm = 1;
    sol.forEach(f => {
      totalLcm = lcm(totalLcm, f[1]);
    });

    const intCoeffs = sol.map(f => (f[0] * totalLcm) / f[1]);
    const overallGcd = intCoeffs.reduce((acc, v) => gcd(acc, v), intCoeffs[0]);
    return intCoeffs.map(v => v / overallGcd);
  }

  // Operazioni su frazioni [n, d]
  function addFrac(a, b) {
    return simplifyFraction(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  }
  function subFrac(a, b) {
    return simplifyFraction(a[0] * b[1] - b[0] * a[1], a[1] * b[1]);
  }
  function mulFrac(a, b) {
    return simplifyFraction(a[0] * b[0], a[1] * b[1]);
  }
  function divFrac(a, b) {
    if (b[0] === 0) throw new Error("Division by zero in fraction");
    return simplifyFraction(a[0] * b[1], a[1] * b[0]);
  }
  function negateFrac(a) {
    return [-a[0], a[1]];
  }

  /**
   * Generatore di spiegazione approfondita con il Metodo delle Semireazioni (ionico-elettronico).
   */
  function generateHalfReactionExplanation(balancedSolution, medium = 'acid') {
    const steps = [];

    // Formatta una specie con coefficiente
    const fmt = (coeff, formula) => {
      const cStr = coeff === 1 ? '' : `<b>${coeff}</b> `;
      return `${cStr}${ChemParser.formatFormulaHTML(formula)}`;
    };

    // Equazione completa bilanciata
    const eqHTML = balancedSolution.reactants.map(r => fmt(r.coeff, r.formula)).join(' + ') +
      ' &rarr; ' +
      balancedSolution.products.map(p => fmt(p.coeff, p.formula)).join(' + ');

    // Analisi dei numeri di ossidazione per individuare chi si ossida e riduce
    const redoxInfo = findRedoxPairs(balancedSolution);

    // Passo 1: Individuazione delle specie e separazione in semireazioni scheletro
    steps.push({
      stepNumber: 1,
      title: "Identificazione delle specie redox e separazione in semireazioni",
      description: "Si analizzano i reagenti e prodotti per determinare gli elementi che variano il proprio stato di ossidazione. Si scindono le due semireazioni:",
      oxReaction: redoxInfo.oxHalfRaw,
      redReaction: redoxInfo.redHalfRaw,
      notes: `<b>Ossidazione:</b> ${redoxInfo.oxExplanation}<br><b>Riduzione:</b> ${redoxInfo.redExplanation}`
    });

    // Passo 2: Bilanciamento degli atomi diversi da O e H
    steps.push({
      stepNumber: 2,
      title: "Bilanciamento degli elementi redox (diversi da O e H)",
      description: "Si pareggiano gli atomi dell'elemento che cambia numero di ossidazione anteponendo opportuni coefficienti stechiometrici.",
      oxReaction: redoxInfo.oxHalfAtomsBalanced,
      redReaction: redoxInfo.redHalfAtomsBalanced,
      notes: redoxInfo.atomBalanceNotes
    });

    // Passo 3: Bilanciamento dell'Ossigeno con molecole di H2O
    steps.push({
      stepNumber: 3,
      title: "Bilanciamento degli atomi di Ossigeno (aggiunta di H₂O)",
      description: "Per ogni atomo di ossigeno mancante, si aggiunge una molecola di <b>H₂O</b> sul lato opportuno della semireazione.",
      oxReaction: redoxInfo.oxHalfWithOxygen,
      redReaction: redoxInfo.redHalfWithOxygen,
      notes: "L'acqua è il solvente della reazione e funge da sorgente o pozzo di atomi di ossigeno."
    });

    // Passo 4: Bilanciamento dell'Idrogeno (in base all'ambiente di reazione)
    let envTitle = medium === 'acid' ? "Bilanciamento dell'Idrogeno in ambiente acido (con H⁺)" :
                  medium === 'base' ? "Bilanciamento dell'Idrogeno in ambiente basico (con H₂O e OH⁻)" :
                  "Bilanciamento dell'Idrogeno in ambiente neutro";

    let envDescription = medium === 'acid'
      ? "In <b>ambiente acido</b>, per ogni atomo di idrogeno mancante si aggiunge uno ione idrogeno <b>H⁺</b>."
      : "In <b>ambiente basico</b>, per ogni H mancante si aggiungono ioni <b>OH⁻</b> e molecole di <b>H₂O</b> (oppure si aggiungono dapprima ioni H⁺ e poi si neutralizzano entrambi i membri sommando tanti OH⁻ quanti sono gli H⁺, formando H₂O).";

    steps.push({
      stepNumber: 4,
      title: envTitle,
      description: envDescription,
      oxReaction: redoxInfo.oxHalfWithHydrogen,
      redReaction: redoxInfo.redHalfWithHydrogen,
      notes: medium === 'base' ? "<i>Regola fondamentale in ambiente basico:</i> non devono comparire ioni H⁺ liberi nell'equazione finale." : ""
    });

    // Passo 5: Bilanciamento delle cariche con elettroni (e⁻)
    steps.push({
      stepNumber: 5,
      title: "Bilanciamento delle cariche elettriche (aggiunta di e⁻)",
      description: "Si calcola la carica netta a sinistra e a destra di ciascuna semireazione. Si aggiungono elettroni (<b>e⁻</b>, carica negativa) sul membro a carica maggiore per eguagliare le cariche.",
      oxReaction: redoxInfo.oxHalfWithElectrons,
      redReaction: redoxInfo.redHalfWithElectrons,
      notes: `Semireazione di Ossidazione: perde <b>${redoxInfo.oxElectrons} e⁻</b> (scritti a destra).<br>` +
             `Semireazione di Riduzione: acquista <b>${redoxInfo.redElectrons} e⁻</b> (scritti a sinistra).`
    });

    // Passo 6: Minimo Comune Multiplo degli elettroni scambiati
    const eLcm = lcm(redoxInfo.oxElectrons, redoxInfo.redElectrons) || 1;
    const oxFactor = eLcm / (redoxInfo.oxElectrons || 1);
    const redFactor = eLcm / (redoxInfo.redElectrons || 1);

    steps.push({
      stepNumber: 6,
      title: "Eguagliamento degli elettroni scambiati (Minimo Comune Multiplo)",
      description: `Il numero di elettroni ceduti deve essere esattamente uguale al numero di elettroni acquistati. ` +
                   `Si calcola il m.c.m. tra <b>${redoxInfo.oxElectrons}</b> e <b>${redoxInfo.redElectrons}</b>, che risulta <b>${eLcm}</b>.`,
      multiplierDetails: [
        { label: "Moltiplicatore Ossidazione", factor: oxFactor, reaction: redoxInfo.oxHalfWithElectrons },
        { label: "Moltiplicatore Riduzione", factor: redFactor, reaction: redoxInfo.redHalfWithElectrons }
      ],
      notes: `Si moltiplica l'intera semireazione di ossidazione per <b>${oxFactor}</b> e quella di riduzione per <b>${redFactor}</b>.`
    });

    // Passo 7: Somma membro a membro e semplificazione
    steps.push({
      stepNumber: 7,
      title: "Somma membro a membro e semplificazione",
      description: "Si sommano i reagenti con i reagenti e i prodotti con i prodotti. Gli elettroni (<b>" + eLcm + " e⁻</b>) si cancellano reciprocamente. Si semplificano le molecole di <b>H₂O</b> e gli ioni <b>H⁺ / OH⁻</b> presenti su ambo i membri.",
      finalEquationHTML: eqHTML,
      notes: "Tutte le specie comuni a sinistra e a destra vengono elise lasciando solo l'eccesso netto."
    });

    // Passo 8: Verifica di massa e di carica
    const checkResult = verifyBalance(balancedSolution);
    steps.push({
      stepNumber: 8,
      title: "Verifica finale di conservazione di massa e di carica",
      description: "Si controlla che ogni specie atomica sia perfettamente bilanciata e che la somma algebrica delle cariche sia identica prima e dopo la freccia.",
      massCheck: checkResult.massTable,
      chargeCheck: checkResult.chargeText,
      isValid: checkResult.isValid
    });

    return {
      method: 'half-reaction',
      medium,
      steps,
      finalEquationHTML: eqHTML,
      summary: {
        oxidant: redoxInfo.oxidantSpecies,
        reductant: redoxInfo.reductantSpecies,
        electronsExchanged: eLcm
      }
    };
  }

  /**
   * Generatore di spiegazione approfondita con il Metodo del Numero di Ossidazione.
   */
  function generateOxidationNumberExplanation(balancedSolution, medium = 'acid') {
    const steps = [];

    const fmt = (coeff, formula) => {
      const cStr = coeff === 1 ? '' : `<b>${coeff}</b> `;
      return `${cStr}${ChemParser.formatFormulaHTML(formula)}`;
    };

    const eqHTML = balancedSolution.reactants.map(r => fmt(r.coeff, r.formula)).join(' + ') +
      ' &rarr; ' +
      balancedSolution.products.map(p => fmt(p.coeff, p.formula)).join(' + ');

    const redoxInfo = findRedoxPairs(balancedSolution);

    // Passo 1: Calcolo dei numeri di ossidazione
    const oxStatesTable = computeOxTableForReaction(balancedSolution);
    steps.push({
      stepNumber: 1,
      title: "Assegnazione dei Numeri di Ossidazione (n.o.)",
      description: "Si determina il numero di ossidazione di ciascun elemento in ogni reagente e prodotto applicando le regole IUPAC.",
      table: oxStatesTable,
      notes: "Gli elementi che cambiano stato di ossidazione sono i protagonisti della reazione di ossidoriduzione."
    });

    // Passo 2: Individuazione delle variazioni (Δ n.o.)
    steps.push({
      stepNumber: 2,
      title: "Calcolo della variazione del numero di ossidazione (Δ n.o.)",
      description: "Si identifica chi subisce un incremento di n.o. (ossidazione) e chi subisce un decremento (riduzione). Si tiene conto degli indici stechiometrici presenti nella formula.",
      oxDelta: redoxInfo.oxDeltaText,
      redDelta: redoxInfo.redDeltaText,
      notes: `<b>Ossidazione:</b> ${redoxInfo.oxElement} passa da n.o. ${redoxInfo.oxOld} a ${redoxInfo.oxNew} (&Delta; = +${redoxInfo.oxDiffPerAtom} per atomo, totale molecola = +${redoxInfo.oxElectrons}).<br>` +
             `<b>Riduzione:</b> ${redoxInfo.redElement} passa da n.o. ${redoxInfo.redOld} a ${redoxInfo.redNew} (&Delta; = -${redoxInfo.redDiffPerAtom} per atomo, totale molecola = -${redoxInfo.redElectrons}).`
    });

    // Passo 3: Incrocio dei coefficienti (pareggiamento elettroni)
    const eLcm = lcm(redoxInfo.oxElectrons, redoxInfo.redElectrons) || 1;
    const factorOx = eLcm / (redoxInfo.oxElectrons || 1);
    const factorRed = eLcm / (redoxInfo.redElectrons || 1);

    steps.push({
      stepNumber: 3,
      title: "Pareggio degli elettroni scambiati tramite m.c.m.",
      description: `Gli elettroni ceduti nella reazione di ossidazione devono eguagliare quelli acquistati nella riduzione. ` +
                   `Calcolando il m.c.m. tra <b>${redoxInfo.oxElectrons}</b> e <b>${redoxInfo.redElectrons}</b> (= <b>${eLcm}</b>), ` +
                   `si assegnano i primi coefficienti stechiometrici alle specie redox.`,
      coefficientsAssigned: `Coefficiente per la specie che si ossida: <b>${factorOx}</b><br>Coefficiente per la specie che si riduce: <b>${factorRed}</b>`,
      intermediateEquation: redoxInfo.intermediateRedoxHTML
    });

    // Passo 4: Bilanciamento degli atomi spettatori / non redox
    steps.push({
      stepNumber: 4,
      title: "Bilanciamento di metalli e non metalli non redox",
      description: "Si bilanciano gli elementi che non hanno subito variazioni di numero di ossidazione (es. cationi spettatori come Na⁺, K⁺ o anioni come SO₄²⁻).",
      notes: redoxInfo.spectatorNotes || "In questo caso tutti i metalli principali fanno parte delle coppie redox o sono già in equilibrio."
    });

    // Passo 5: Bilanciamento delle cariche elettriche
    let chargeDesc = medium === 'acid'
      ? "In <b>ambiente acido</b>, la differenza di carica tra reagenti e prodotti si colma aggiungendo ioni <b>H⁺</b>."
      : "In <b>ambiente basico</b>, la differenza di carica tra reagenti e prodotti si colma aggiungendo ioni <b>OH⁻</b>.";

    steps.push({
      stepNumber: 5,
      title: `Bilanciamento delle cariche elettriche in ambiente ${medium === 'acid' ? 'acido' : 'basico'}`,
      description: chargeDesc,
      chargeDetails: redoxInfo.chargeBalanceDetails,
      notes: "La somma delle cariche sui reagenti deve uguagliare la somma delle cariche sui prodotti."
    });

    // Passo 6: Bilanciamento di H e O con H2O
    steps.push({
      stepNumber: 6,
      title: "Bilanciamento finale di Idrogeno e Ossigeno (aggiunta di H₂O)",
      description: "Si aggiungono le molecole di <b>H₂O</b> necessarie per pareggiare gli atomi di idrogeno. Il conteggio finale degli atomi di ossigeno serve da verifica infallibile del corretto bilanciamento.",
      finalEquationHTML: eqHTML,
      notes: "Se il numero di atomi di ossigeno risulta automaticamente pari sui due membri, il bilanciamento è garantito al 100%."
    });

    // Passo 7: Controllo finale
    const checkResult = verifyBalance(balancedSolution);
    steps.push({
      stepNumber: 7,
      title: "Verifica e conclusione",
      description: "Controllo finale di massa e carica.",
      massCheck: checkResult.massTable,
      chargeCheck: checkResult.chargeText,
      isValid: checkResult.isValid
    });

    return {
      method: 'oxidation-number',
      medium,
      steps,
      finalEquationHTML: eqHTML,
      summary: {
        oxidant: redoxInfo.oxidantSpecies,
        reductant: redoxInfo.reductantSpecies,
        electronsExchanged: eLcm
      }
    };
  }

  /**
   * Estrae e analizza le coppie redox e genera le rappresentazioni delle semireazioni.
   */
  function findRedoxPairs(balancedSolution) {
    // Calcoliamo i n.o. di tutte le specie
    const rOx = balancedSolution.reactants.map(r => ({
      formula: r.formula,
      coeff: r.coeff,
      oxData: ChemParser.calculateOxidationNumbers(r.formula)
    }));

    const pOx = balancedSolution.products.map(p => ({
      formula: p.formula,
      coeff: p.coeff,
      oxData: ChemParser.calculateOxidationNumbers(p.formula)
    }));

    // Confrontiamo elementi chiave escludendo H e O (salvo se O o H cambiano es. H2O2 o H2)
    const elements = new Set();
    rOx.forEach(r => Object.keys(r.oxData.oxidationStates).forEach(e => elements.add(e)));

    let oxElement = null, redElement = null;
    let oxOld = 0, oxNew = 0, redOld = 0, redNew = 0;
    let oxSpecieR = null, oxSpecieP = null;
    let redSpecieR = null, redSpecieP = null;

    elements.forEach(el => {
      // Troviamo il n.o. nei reagenti e prodotti
      const rSpeciesWithEl = rOx.filter(r => r.oxData.oxidationStates[el] !== undefined);
      const pSpeciesWithEl = pOx.filter(p => p.oxData.oxidationStates[el] !== undefined);

      if (rSpeciesWithEl.length > 0 && pSpeciesWithEl.length > 0) {
        const oxValR = rSpeciesWithEl[0].oxData.oxidationStates[el];
        const oxValP = pSpeciesWithEl[0].oxData.oxidationStates[el];

        if (oxValP > oxValR) {
          oxElement = el;
          oxOld = oxValR;
          oxNew = oxValP;
          oxSpecieR = rSpeciesWithEl[0].formula;
          oxSpecieP = pSpeciesWithEl[0].formula;
        } else if (oxValP < oxValR) {
          redElement = el;
          redOld = oxValR;
          redNew = oxValP;
          redSpecieR = rSpeciesWithEl[0].formula;
          redSpecieP = pSpeciesWithEl[0].formula;
        }
      }
    });

    // Se per qualche motivo euristico non trovato (es. dismutazione di Cl2)
    if (!oxElement || !redElement) {
      // Gestione dismutazione: uno stesso elemento sia ossida che riduce
      elements.forEach(el => {
        const rSpeciesWithEl = rOx.filter(r => r.oxData.oxidationStates[el] !== undefined);
        const pSpeciesWithEl = pOx.filter(p => p.oxData.oxidationStates[el] !== undefined);
        if (pSpeciesWithEl.length >= 2 && rSpeciesWithEl.length >= 1) {
          const oxValR = rSpeciesWithEl[0].oxData.oxidationStates[el];
          const val1 = pSpeciesWithEl[0].oxData.oxidationStates[el];
          const val2 = pSpeciesWithEl[1].oxData.oxidationStates[el];
          if (val1 > oxValR && val2 < oxValR) {
            oxElement = el; oxOld = oxValR; oxNew = val1; oxSpecieR = rSpeciesWithEl[0].formula; oxSpecieP = pSpeciesWithEl[0].formula;
            redElement = el; redOld = oxValR; redNew = val2; redSpecieR = rSpeciesWithEl[0].formula; redSpecieP = pSpeciesWithEl[1].formula;
          } else if (val2 > oxValR && val1 < oxValR) {
            oxElement = el; oxOld = oxValR; oxNew = val2; oxSpecieR = rSpeciesWithEl[0].formula; oxSpecieP = pSpeciesWithEl[1].formula;
            redElement = el; redOld = oxValR; redNew = val1; redSpecieR = rSpeciesWithEl[0].formula; redSpecieP = pSpeciesWithEl[0].formula;
          }
        }
      });
    }

    // Fallback sicuro se non rilevato
    oxElement = oxElement || 'Specie Riducente';
    redElement = redElement || 'Specie Ossidante';
    oxSpecieR = oxSpecieR || (balancedSolution.reactants[0]?.formula || '');
    oxSpecieP = oxSpecieP || (balancedSolution.products[0]?.formula || '');
    redSpecieR = redSpecieR || (balancedSolution.reactants[1]?.formula || balancedSolution.reactants[0]?.formula || '');
    redSpecieP = redSpecieP || (balancedSolution.products[1]?.formula || balancedSolution.products[0]?.formula || '');

    const oxDiffPerAtom = Math.abs(oxNew - oxOld) || 1;
    const redDiffPerAtom = Math.abs(redNew - redOld) || 1;

    // Calcolo elettroni tenendo conto dei pedici nelle specie
    const compOxR = ChemParser.parseComposition(ChemParser.extractCharge(oxSpecieR).body);
    const atomsOxInR = compOxR[oxElement] || 1;
    const oxElectrons = oxDiffPerAtom * atomsOxInR;

    const compRedR = ChemParser.parseComposition(ChemParser.extractCharge(redSpecieR).body);
    const atomsRedInR = compRedR[redElement] || 1;
    const redElectrons = redDiffPerAtom * atomsRedInR;

    // Costruzione stringhe semireazioni
    const oxHalfRaw = `${ChemParser.formatFormulaHTML(oxSpecieR)} &rarr; ${ChemParser.formatFormulaHTML(oxSpecieP)}`;
    const redHalfRaw = `${ChemParser.formatFormulaHTML(redSpecieR)} &rarr; ${ChemParser.formatFormulaHTML(redSpecieP)}`;

    // Bilanciamento atomi redox
    const compOxP = ChemParser.parseComposition(ChemParser.extractCharge(oxSpecieP).body);
    const atomsOxInP = compOxP[oxElement] || 1;
    let oxCoeffP = 1, oxCoeffR = 1;
    if (atomsOxInR !== atomsOxInP) {
      const atomLcm = lcm(atomsOxInR, atomsOxInP);
      oxCoeffR = atomLcm / atomsOxInR;
      oxCoeffP = atomLcm / atomsOxInP;
    }

    const compRedP = ChemParser.parseComposition(ChemParser.extractCharge(redSpecieP).body);
    const atomsRedInP = compRedP[redElement] || 1;
    let redCoeffP = 1, redCoeffR = 1;
    if (atomsRedInR !== atomsRedInP) {
      const atomLcm = lcm(atomsRedInR, atomsRedInP);
      redCoeffR = atomLcm / atomsRedInR;
      redCoeffP = atomLcm / atomsRedInP;
    }

    const fmtSpecie = (c, f) => (c > 1 ? `<b>${c}</b> ` : '') + ChemParser.formatFormulaHTML(f);

    const oxHalfAtomsBalanced = `${fmtSpecie(oxCoeffR, oxSpecieR)} &rarr; ${fmtSpecie(oxCoeffP, oxSpecieP)}`;
    const redHalfAtomsBalanced = `${fmtSpecie(redCoeffR, redSpecieR)} &rarr; ${fmtSpecie(redCoeffP, redSpecieP)}`;

    // Calcolo O e H per semireazioni
    const oxO_R = (compOxR['O'] || 0) * oxCoeffR;
    const oxO_P = (compOxP['O'] || 0) * oxCoeffP;
    const diffO_ox = oxO_R - oxO_P; // se > 0 eccesso a sinistra, serve H2O a destra

    const redO_R = (compRedR['O'] || 0) * redCoeffR;
    const redO_P = (compRedP['O'] || 0) * redCoeffP;
    const diffO_red = redO_R - redO_P;

    const buildWithOxygen = (rPart, pPart, diffO) => {
      if (diffO > 0) {
        return `${rPart} &rarr; ${pPart} + ${diffO > 1 ? '<b>' + diffO + '</b> ' : ''}H<sub>2</sub>O`;
      } else if (diffO < 0) {
        const need = Math.abs(diffO);
        return `${rPart} + ${need > 1 ? '<b>' + need + '</b> ' : ''}H<sub>2</sub>O &rarr; ${pPart}`;
      }
      return `${rPart} &rarr; ${pPart}`;
    };

    const oxHalfWithOxygen = buildWithOxygen(fmtSpecie(oxCoeffR, oxSpecieR), fmtSpecie(oxCoeffP, oxSpecieP), diffO_ox);
    const redHalfWithOxygen = buildWithOxygen(fmtSpecie(redCoeffR, redSpecieR), fmtSpecie(redCoeffP, redSpecieP), diffO_red);

    // Con Idrogeno
    const oxH_R = (compOxR['H'] || 0) * oxCoeffR + (diffO_ox < 0 ? Math.abs(diffO_ox) * 2 : 0);
    const oxH_P = (compOxP['H'] || 0) * oxCoeffP + (diffO_ox > 0 ? diffO_ox * 2 : 0);
    const diffH_ox = oxH_R - oxH_P;

    const redH_R = (compRedR['H'] || 0) * redCoeffR + (diffO_red < 0 ? Math.abs(diffO_red) * 2 : 0);
    const redH_P = (compRedP['H'] || 0) * redCoeffP + (diffO_red > 0 ? diffO_red * 2 : 0);
    const diffH_red = redH_R - redH_P;

    const buildWithHydrogen = (baseOxHtml, diffH) => {
      const parts = baseOxHtml.split(' &rarr; ');
      if (diffH > 0) {
        return `${parts[0]} &rarr; ${parts[1]} + ${diffH > 1 ? '<b>' + diffH + '</b> ' : ''}H<sup>+</sup>`;
      } else if (diffH < 0) {
        const need = Math.abs(diffH);
        return `${parts[0]} + ${need > 1 ? '<b>' + need + '</b> ' : ''}H<sup>+</sup> &rarr; ${parts[1]}`;
      }
      return baseOxHtml;
    };

    const oxHalfWithHydrogen = buildWithHydrogen(oxHalfWithOxygen, diffH_ox);
    const redHalfWithHydrogen = buildWithHydrogen(redHalfWithOxygen, diffH_red);

    // Con Elettroni
    const oxHalfWithElectrons = `${oxHalfWithHydrogen} + <b>${oxElectrons} e<sup>&minus;</sup></b>`;
    const redHalfParts = redHalfWithHydrogen.split(' &rarr; ');
    const redHalfWithElectrons = `${redHalfParts[0]} + <b>${redElectrons} e<sup>&minus;</sup></b> &rarr; ${redHalfParts[1]}`;

    return {
      oxElement, redElement,
      oxOld, oxNew, redOld, redNew,
      oxDiffPerAtom, redDiffPerAtom,
      oxElectrons, redElectrons,
      oxidantSpecies: redSpecieR,
      reductantSpecies: oxSpecieR,
      oxExplanation: `Il riducente <b>${ChemParser.formatFormulaHTML(oxSpecieR)}</b> si ossida a <b>${ChemParser.formatFormulaHTML(oxSpecieP)}</b> aumentando il n.o. di ${oxElement} da ${oxOld >= 0 ? '+' + oxOld : oxOld} a ${oxNew >= 0 ? '+' + oxNew : oxNew}.`,
      redExplanation: `L'ossidante <b>${ChemParser.formatFormulaHTML(redSpecieR)}</b> si riduce a <b>${ChemParser.formatFormulaHTML(redSpecieP)}</b> diminuendo il n.o. di ${redElement} da ${redOld >= 0 ? '+' + redOld : redOld} a ${redNew >= 0 ? '+' + redNew : redNew}.`,
      atomBalanceNotes: (oxCoeffR > 1 || oxCoeffP > 1 || redCoeffR > 1 || redCoeffP > 1) ?
        `Attenzione ai pedici: è necessario anteporre i coefficienti per pareggiare il numero di atomi dell'elemento redox prima di procedere.` :
        `Gli atomi di ${oxElement} e ${redElement} risultano già bilanciati 1:1.`,
      oxHalfRaw, redHalfRaw,
      oxHalfAtomsBalanced, redHalfAtomsBalanced,
      oxHalfWithOxygen, redHalfWithOxygen,
      oxHalfWithHydrogen, redHalfWithHydrogen,
      oxHalfWithElectrons, redHalfWithElectrons,
      oxDeltaText: `<b>${oxElement}</b>: n.o. varia da ${oxOld} a ${oxNew} (&Delta; = +${oxDiffPerAtom} e⁻ per atomo)`,
      redDeltaText: `<b>${redElement}</b>: n.o. varia da ${redOld} a ${redNew} (&Delta; = -${redDiffPerAtom} e⁻ per atomo)`,
      intermediateRedoxHTML: `${fmtSpecie(lcm(oxElectrons, redElectrons) / oxElectrons, oxSpecieR)} + ${fmtSpecie(lcm(oxElectrons, redElectrons) / redElectrons, redSpecieR)} &rarr; ...`,
      chargeBalanceDetails: "Si sommano le cariche su entrambi i membri e si compensa la differenza con ioni dell'ambiente.",
      spectatorNotes: ""
    };
  }

  /**
   * Genera tabella HTML con numeri di ossidazione per tutti i partecipanti.
   */
  function computeOxTableForReaction(balancedSolution) {
    const list = [];
    balancedSolution.reactants.forEach(r => {
      const data = ChemParser.calculateOxidationNumbers(r.formula);
      list.push({ formula: r.formula, role: 'Reagente', data });
    });
    balancedSolution.products.forEach(p => {
      const data = ChemParser.calculateOxidationNumbers(p.formula);
      list.push({ formula: p.formula, role: 'Prodotto', data });
    });
    return list;
  }

  /**
   * Verifica conservazione di massa e di carica.
   */
  function verifyBalance(solution) {
    const rAtoms = {};
    let rCharge = 0;
    solution.reactants.forEach(r => {
      const { body, charge } = ChemParser.extractCharge(r.formula);
      const comp = ChemParser.parseComposition(body);
      rCharge += charge * r.coeff;
      Object.keys(comp).forEach(el => {
        rAtoms[el] = (rAtoms[el] || 0) + comp[el] * r.coeff;
      });
    });

    const pAtoms = {};
    let pCharge = 0;
    solution.products.forEach(p => {
      const { body, charge } = ChemParser.extractCharge(p.formula);
      const comp = ChemParser.parseComposition(body);
      pCharge += charge * p.coeff;
      Object.keys(comp).forEach(el => {
        pAtoms[el] = (pAtoms[el] || 0) + comp[el] * p.coeff;
      });
    });

    const allElements = Array.from(new Set([...Object.keys(rAtoms), ...Object.keys(pAtoms)]));
    const massTable = allElements.map(el => {
      const left = rAtoms[el] || 0;
      const right = pAtoms[el] || 0;
      return {
        element: el,
        elementName: ChemParser.ELEMENTS[el]?.name || el,
        left,
        right,
        balanced: left === right
      };
    });

    const chargeBalanced = rCharge === pCharge;
    const allAtomsBalanced = massTable.every(row => row.balanced);

    return {
      isValid: chargeBalanced && allAtomsBalanced,
      massTable,
      chargeText: `Carica Reagenti: <b>${rCharge >= 0 ? '+' + rCharge : rCharge}</b> | Carica Prodotti: <b>${pCharge >= 0 ? '+' + pCharge : pCharge}</b> ${chargeBalanced ? '✅ (Conservata)' : '❌ (Non corrispondente)'}`
    };
  }

  /**
   * Funzione principale di bilanciamento e generazione di entrambe le spiegazioni.
   */
  function solveRedox(equationStr, medium = 'acid') {
    const { reactants, products } = parseEquationString(equationStr);
    const balancedSol = balanceLinearSystem(reactants, products, medium);

    if (!balancedSol) {
      throw new Error(`Impossibile bilanciare l'equazione in ambiente ${medium === 'acid' ? 'acido' : medium === 'base' ? 'basico' : 'neutro'}. Controlla la formula dei reagenti e prodotti.`);
    }

    const halfReactionResult = generateHalfReactionExplanation(balancedSol, medium);
    const oxidationNumberResult = generateOxidationNumberExplanation(balancedSol, medium);

    return {
      balancedSolution: balancedSol,
      halfReaction: halfReactionResult,
      oxidationNumber: oxidationNumberResult
    };
  }

  return {
    parseEquationString,
    balanceLinearSystem,
    solveRedox,
    verifyBalance,
    generateHalfReactionExplanation,
    generateOxidationNumberExplanation
  };
}));
