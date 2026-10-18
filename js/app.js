/**
 * app.js
 * Controller principale dell'applicazione RedoxMaster Lab
 * Gestisce l'interfaccia utente, gli eventi, la sincronizzazione dei moduli e il rendering dinamico.
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- STATO DELL'APPLICAZIONE ---
  const state = {
    currentTab: 'tab-solver',
    currentMedium: 'acid',
    currentMethodView: 'half-reaction', // 'half-reaction' | 'oxidation-number' | 'comparison'
    currentSolution: null,
    quizScore: 0,
    quizTotal: 0,
    answeredQuestions: new Set()
  };

  // --- ELEMENTI DOM PRINCIPALI ---
  const equationInput = document.getElementById('equationInput');
  const livePreviewContent = document.getElementById('livePreviewContent');
  const presetSelect = document.getElementById('presetSelect');
  const mediumRadioGroup = document.getElementById('mediumRadioGroup');
  const solveBtn = document.getElementById('solveBtn');
  const solutionContainer = document.getElementById('solutionContainer');
  const balancedEquationOutput = document.getElementById('balancedEquationOutput');
  const resultMetaBar = document.getElementById('resultMetaBar');
  const stepsDisplay = document.getElementById('stepsDisplay');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const copyResultBtn = document.getElementById('copyResultBtn');
  const printBtn = document.getElementById('printBtn');
  const clearInputBtn = document.getElementById('clearInputBtn');
  const normalizeInputBtn = document.getElementById('normalizeInputBtn');
  const inputFeedback = document.getElementById('inputFeedback');
  const oxCalcPreview = document.getElementById('oxCalcPreview');
  const oxCalcFeedback = document.getElementById('oxCalcFeedback');
  const esc = ChemParser.escapeHTML;
  const autoFormatToggle = document.getElementById('autoFormatToggle');
  let autoFormat = true;
  try { autoFormat = localStorage.getItem('redox_autoformat') !== 'off'; } catch (e) {}
  if (autoFormatToggle) autoFormatToggle.checked = autoFormat;

  /**
   * Formatta il contenuto del campo mentre si scrive (H2O -> H₂O, Fe2+ -> Fe²⁺)
   * mantenendo il cursore nella posizione corrispondente.
   */
  function applyPretty(el, mode = 'equation') {
    if (!autoFormat || !el) return;
    const raw = el.value;
    const caret = el.selectionStart ?? raw.length;
    const pretty = ChemParser.prettyText(raw, mode);
    if (pretty === raw) return;
    el.value = pretty;
    const pos = ChemParser.mapCaret(raw, caret, pretty);
    try { el.setSelectionRange(pos, pos); } catch (e) { el.selectionStart = el.selectionEnd = pos; }
  }

  /** Gestore input comune: non riformatta durante composizione IME o cancellazioni */
  function onFormulaInput(el, mode, after) {
    return (e) => {
      const t = e && e.inputType || '';
      if (!(e && e.isComposing) && !t.startsWith('delete') && !t.startsWith('history')) applyPretty(el, mode);
      after();
    };
  }

  // Casi studio & modale
  const casesGrid = document.getElementById('casesGrid');
  const caseFilterBar = document.getElementById('caseFilterBar');
  const caseModalOverlay = document.getElementById('caseModalOverlay');
  const modalContent = document.getElementById('modalContent');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  // Calcolatore N.O.
  const oxCalcInput = document.getElementById('oxCalcInput');
  const oxCalcBtn = document.getElementById('oxCalcBtn');
  const oxCalcResult = document.getElementById('oxCalcResult');

  // Quiz
  const quizContainer = document.getElementById('quizContainer');
  const quizScoreBadge = document.getElementById('quizScoreBadge');
  const restartQuizBtn = document.getElementById('restartQuizBtn');

  // --- INIZIALIZZAZIONE ---
  initTheme();
  initNavigation();
  initKeypad();
  initSolver();
  initCasesGallery();
  initOxCalculator();
  initQuiz();

  // Esegue il primo bilanciamento di default all'avvio
  applyPretty(equationInput, 'equation');
  handleSolve();

  // =========================================================================
  // 1. TEMA CHIARO / SCURO
  // =========================================================================
  function initTheme() {
    const savedTheme = localStorage.getItem('redox_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('redox_theme', next);
      themeToggleBtn.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }

  // =========================================================================
  // 2. NAVIGAZIONE SCHEDE (TABS)
  // =========================================================================
  function initNavigation() {
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        switchTab(targetId);
      });
    });

    document.getElementById('brandBtn').addEventListener('click', () => {
      switchTab('tab-solver');
    });

    // Switch dei metodi di spiegazione nel Solver
    const methodBtns = document.querySelectorAll('.method-switch-btn');
    methodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        methodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentMethodView = btn.getAttribute('data-method');
        renderSolutionSteps();
      });
    });
  }

  function switchTab(targetId) {
    state.currentTab = targetId;
    document.querySelectorAll('.nav-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === targetId);
    });
    document.querySelectorAll('.tab-content').forEach(c => {
      c.classList.toggle('active', c.id === targetId);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // 3. TASTIERINO CHIMICO & INPUT PREVIEW
  // =========================================================================
  function initKeypad() {
    const insertButtons = document.querySelectorAll('.chem-btn[data-insert]');
    insertButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const textToInsert = btn.getAttribute('data-insert');
        const cursorOffset = parseInt(btn.getAttribute('data-cursor') || '0', 10);
        insertAtCursor(equationInput, textToInsert, cursorOffset);
        applyPretty(equationInput, 'equation');
        updateLivePreview();
      });
    });

    if (clearInputBtn) {
      clearInputBtn.addEventListener('click', () => {
        equationInput.value = '';
        equationInput.focus();
        updateLivePreview();
      });
    }

    equationInput.addEventListener('input', onFormulaInput(equationInput, 'equation', updateLivePreview));

    if (autoFormatToggle) {
      autoFormatToggle.addEventListener('change', () => {
        autoFormat = autoFormatToggle.checked;
        try { localStorage.setItem('redox_autoformat', autoFormat ? 'on' : 'off'); } catch (e) {}
        if (autoFormat) {
          applyPretty(equationInput, 'equation');
          applyPretty(oxCalcInput, 'species');
        } else {
          const a = ChemParser.analyzeEquation(equationInput.value);
          if (a.hasArrow && ![...a.reactants, ...a.products].some(sp => sp.error)) equationInput.value = normalizedEquationText(a);
          const sp = ChemParser.parseSpecies(oxCalcInput.value);
          if (!sp.error && sp.canonical) oxCalcInput.value = sp.canonical;
        }
        updateLivePreview();
        updateOxPreview();
      });
    }

    if (normalizeInputBtn) {
      normalizeInputBtn.addEventListener('click', () => {
        const a = ChemParser.analyzeEquation(equationInput.value);
        if (!a.hasArrow || [...a.reactants, ...a.products].some(sp => sp.error)) {
          equationInput.focus();
          updateLivePreview();
          return;
        }
        equationInput.value = normalizedEquationText(a);
        applyPretty(equationInput, 'equation');
        equationInput.focus();
        updateLivePreview();
      });
    }

    // Gestione radio group ambiente di reazione
    const radioBtns = mediumRadioGroup.querySelectorAll('.radio-btn');
    radioBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        radioBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentMedium = btn.getAttribute('data-medium');
      });
    });

    // Preset Select
    presetSelect.addEventListener('change', (e) => {
      if (!e.target.value) return;
      const [eq, med] = e.target.value.split('|');
      equationInput.value = eq;
      applyPretty(equationInput, 'equation');
      setMedium(med || 'acid');
      updateLivePreview();
      handleSolve();
    });

    // Copia risultato
    copyResultBtn.addEventListener('click', () => {
      const text = balancedEquationOutput.innerText;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = copyResultBtn.textContent;
        copyResultBtn.textContent = '✅ Copiato!';
        setTimeout(() => copyResultBtn.textContent = originalText, 2000);
      });
    });

    // Stampa / Esporta
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  function setMedium(med) {
    state.currentMedium = med;
    const radioBtns = mediumRadioGroup.querySelectorAll('.radio-btn');
    radioBtns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-medium') === med);
    });
  }

  function insertAtCursor(inputField, text, cursorOffset = 0) {
    const startPos = inputField.selectionStart ?? inputField.value.length;
    const endPos = inputField.selectionEnd ?? inputField.value.length;
    const val = inputField.value;
    let insert = text;
    // Evita doppi spazi quando si inseriscono " + " o " -> "
    if (insert.startsWith(' ') && /\s$/.test(val.substring(0, startPos))) insert = insert.trimStart();
    if (insert.endsWith(' ') && /^\s/.test(val.substring(endPos))) insert = insert.trimEnd();
    inputField.value = val.substring(0, startPos) + insert + val.substring(endPos);
    inputField.focus();
    const pos = startPos + insert.length + cursorOffset;
    inputField.selectionStart = pos;
    inputField.selectionEnd = pos;
  }

  /** Testo dell'equazione nella notazione standard (Fe2+ -> Fe^2+, MnO₄⁻ -> MnO4^-) */
  function normalizedEquationText(a) {
    const fmt = sp => (sp.coeff && sp.coeff !== 1 ? sp.coeff + ' ' : '') + (sp.canonical || sp.raw);
    return a.reactants.map(fmt).join(' + ') + ' -> ' + a.products.map(fmt).join(' + ');
  }

  /** Righe di feedback (errori / interpretazioni / ok) */
  function renderFeedback(container, { errors = [], notes = [], ambiguous = [], ok = null, onFix = null }) {
    let html = '';
    errors.forEach(e => { html += `<div class="fb-line fb-error">⚠️ ${esc(e)}</div>`; });
    notes.forEach(n => { html += `<div class="fb-line fb-note">ℹ️ ${esc(n)}</div>`; });
    if (ambiguous.length) {
      const list = ambiguous.map(sp => `<code>${esc(sp.raw)}</code> = ${ChemParser.formatFormulaHTML(sp.canonical)}`).join(', ');
      html += `<div class="fb-line fb-note">ℹ️ Carica scritta senza ^, ho letto: ${list}. Se intendevi altro, usa ^ (es. MnO4^-).` +
              (onFix ? ` <button class="fb-fix" type="button">Scrivi con ^</button>` : '') + `</div>`;
    }
    if (!errors.length && ok) html += `<div class="fb-line fb-ok">✅ ${ok}</div>`;
    container.innerHTML = html;
    const fixBtn = container.querySelector('.fb-fix');
    if (fixBtn && onFix) fixBtn.addEventListener('click', onFix);
  }

  function updateLivePreview() {
    const raw = equationInput.value;
    equationInput.classList.remove('is-invalid', 'is-valid');
    if (!raw.trim()) {
      livePreviewContent.innerHTML = '<i>Inserisci un\'equazione...</i>';
      inputFeedback.innerHTML = '';
      solveBtn.disabled = true;
      return;
    }
    const a = ChemParser.analyzeEquation(raw);
    livePreviewContent.innerHTML = ChemParser.formatEquationHTML(raw) || esc(raw);

    // Mentre si sta ancora scrivendo (nessuna freccia) non urliamo errori
    const typingFirstSide = !a.hasArrow && !a.reactants.some(sp => sp.error);
    if (typingFirstSide) {
      renderFeedback(inputFeedback, { notes: ['Aggiungi la freccia -> e poi i prodotti.'] });
      solveBtn.disabled = true;
      return;
    }

    equationInput.classList.add(a.ok ? 'is-valid' : 'is-invalid');
    solveBtn.disabled = !a.ok;
    const nR = a.reactants.length, nP = a.products.length;
    renderFeedback(inputFeedback, {
      errors: a.errors,
      notes: [...new Set(a.notes)],
      ambiguous: a.ok && !autoFormat ? a.ambiguous : [],
      ok: `Equazione riconosciuta: ${nR} ${nR === 1 ? 'reagente' : 'reagenti'}, ${nP} ${nP === 1 ? 'prodotto' : 'prodotti'}. Premi Invio per bilanciare.`,
      onFix: () => { equationInput.value = normalizedEquationText(a); applyPretty(equationInput, 'equation'); updateLivePreview(); equationInput.focus(); }
    });
  }

  // =========================================================================
  // 4. RISOLUTORE REDOX & RENDERING SPIEGAZIONI
  // =========================================================================
  function initSolver() {
    solveBtn.addEventListener('click', handleSolve);
    equationInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSolve();
    });
  }

  function handleSolve() {
    const rawEq = equationInput.value.trim();
    if (!rawEq) return;

    try {
      // Verifichiamo se corrisponde esattamente a uno dei casi studio ricchi per massimizzare la didattica
      const matchingTutorial = findMatchingTutorialEquation(rawEq, state.currentMedium);

      const solution = RedoxSolver.solveRedox(rawEq, state.currentMedium);
      state.currentSolution = {
        ...solution,
        tutorialData: matchingTutorial
      };

      renderBalancedBanner();
      renderSolutionSteps();
      solutionContainer.style.display = 'block';
      updateLivePreview();
    } catch (err) {
      solutionContainer.style.display = 'none';
      state.currentSolution = null;
      equationInput.classList.add('is-invalid');
      renderFeedback(inputFeedback, { errors: [err.message] });
    }
  }

  function findMatchingTutorialEquation(rawEq, medium) {
    // Confronto per insiemi di specie in forma canonica, ignorando coefficienti,
    // ordine e specie d'ambiente (H2O, H+, OH-) che l'utente può omettere.
    const AUX = new Set(['H2O', 'H^+', 'OH^-']);
    const key = eq => {
      const a = ChemParser.analyzeEquation(eq);
      if (!a.ok) return null;
      const side = list => list.map(sp => sp.canonical).filter(c => !AUX.has(c)).sort().join(',');
      return side(a.reactants) + '=>' + side(a.products);
    };
    const k = key(rawEq);
    if (!k) return null;
    return RedoxTutorialData.TUTORIAL_EQUATIONS.find(t => key(t.rawEquation) === k && (!medium || t.medium === medium)) || null;
  }

  function renderBalancedBanner() {
    const sol = state.currentSolution;
    if (!sol) return;

    balancedEquationOutput.innerHTML = sol.halfReaction.finalEquationHTML;

    const summary = sol.halfReaction.summary;
    resultMetaBar.innerHTML = `
      <div class="meta-chip red">
        <span>🛡️</span> <b>Ossidante:</b> ${ChemParser.formatFormulaHTML(summary.oxidant)}
      </div>
      <div class="meta-chip ox">
        <span>⚡</span> <b>Riducente:</b> ${ChemParser.formatFormulaHTML(summary.reductant)}
      </div>
      <div class="meta-chip electrons">
        <span>🔄</span> <b>Elettroni Scambiati:</b> ${summary.electronsExchanged} e⁻
      </div>
      <div class="meta-chip">
        <span>🌡️</span> <b>Ambiente:</b> ${state.currentMedium === 'acid' ? 'Acido (H⁺)' : state.currentMedium === 'base' ? 'Basico (OH⁻)' : 'Neutro'}
      </div>
    `;
  }

  function renderSolutionSteps() {
    const sol = state.currentSolution;
    if (!sol) return;

    stepsDisplay.innerHTML = '';

    if (state.currentMethodView === 'half-reaction') {
      renderHalfReactionSteps(sol);
    } else if (state.currentMethodView === 'oxidation-number') {
      renderOxidationNumberSteps(sol);
    } else {
      renderComparisonView(sol);
    }
  }

  /**
   * Renderizza i passaggi del Metodo delle Semireazioni (Ionico-Elettronico)
   */
  function renderHalfReactionSteps(sol) {
    const tut = sol.tutorialData;

    // Se abbiamo dati tutorial ricchi e curati per questa reazione
    if (tut && tut.halfReactionSteps) {
      tut.halfReactionSteps.forEach(s => {
        const card = document.createElement('div');
        card.className = 'step-card';

        let innerContent = `
          <div class="step-card-header">
            <div class="step-badge">${s.step}</div>
            <div class="step-title">${s.title}</div>
          </div>
          <div class="step-description">${s.text}</div>
        `;

        if (s.ox && s.red) {
          innerContent += `
            <div class="half-rx-split">
              <div class="half-box ox">
                <div class="half-box-title">🔥 Semireazione di Ossidazione</div>
                <div class="half-box-formula">${s.ox}</div>
              </div>
              <div class="half-box red">
                <div class="half-box-title">❄️ Semireazione di Riduzione</div>
                <div class="half-box-formula">${s.red}</div>
              </div>
            </div>
          `;
        }

        if (s.multipliers) {
          innerContent += `<div class="notes-callout"><b>Fattori di moltiplicazione:</b> ${s.multipliers}</div>`;
        }

        if (s.result) {
          innerContent += `<div class="formula-highlight-box">${s.result}</div>`;
        }

        card.innerHTML = innerContent;
        stepsDisplay.appendChild(card);
      });

      if (tut.pitfalls) {
        const pitCard = document.createElement('div');
        pitCard.className = 'step-card';
        pitCard.style.borderLeft = '4px solid var(--accent-amber)';
        pitCard.innerHTML = `
          <div class="step-card-header">
            <div class="step-badge" style="background: var(--accent-amber);">⚠️</div>
            <div class="step-title" style="color: var(--accent-amber);">Attenzione: Trappola &amp; Errore Tipico da Evitare</div>
          </div>
          <div class="step-description">${tut.pitfalls}</div>
        `;
        stepsDisplay.appendChild(pitCard);
      }
      return;
    }

    // Altrimenti genera dai passaggi algoritmici automatici
    sol.halfReaction.steps.forEach(st => {
      const card = document.createElement('div');
      card.className = 'step-card';

      let content = `
        <div class="step-card-header">
          <div class="step-badge">${st.stepNumber}</div>
          <div class="step-title">${st.title}</div>
        </div>
        <div class="step-description">${st.description}</div>
      `;

      if (st.oxReaction && st.redReaction) {
        content += `
          <div class="half-rx-split">
            <div class="half-box ox">
              <div class="half-box-title">🔥 Ossidazione</div>
              <div class="half-box-formula">${st.oxReaction}</div>
            </div>
            <div class="half-box red">
              <div class="half-box-title">❄️ Riduzione</div>
              <div class="half-box-formula">${st.redReaction}</div>
            </div>
          </div>
        `;
      }

      if (st.finalEquationHTML) {
        content += `<div class="formula-highlight-box">${st.finalEquationHTML}</div>`;
      }

      if (st.massCheck) {
        content += `
          <table class="chem-table">
            <thead>
              <tr>
                <th>Elemento</th>
                <th>Reagenti (SX)</th>
                <th>Prodotti (DX)</th>
                <th>Stato</th>
              </tr>
            </thead>
            <tbody>
              ${st.massCheck.map(r => `
                <tr>
                  <td><b>${r.element}</b> (${r.elementName})</td>
                  <td>${r.left} atomi</td>
                  <td>${r.right} atomi</td>
                  <td>${r.balanced ? '✅ Bilanciato' : '❌ Non bilanciato'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="notes-callout">${st.chargeCheck}</div>
        `;
      }

      if (st.notes) {
        content += `<div class="notes-callout">${st.notes}</div>`;
      }

      card.innerHTML = content;
      stepsDisplay.appendChild(card);
    });
  }

  /**
   * Renderizza i passaggi del Metodo del Numero di Ossidazione
   */
  function renderOxidationNumberSteps(sol) {
    const tut = sol.tutorialData;

    if (tut && tut.oxNumberSteps) {
      tut.oxNumberSteps.forEach(s => {
        const card = document.createElement('div');
        card.className = 'step-card';
        card.innerHTML = `
          <div class="step-card-header">
            <div class="step-badge">${s.step}</div>
            <div class="step-title">${s.title}</div>
          </div>
          <div class="step-description">${s.text}</div>
        `;
        stepsDisplay.appendChild(card);
      });
      return;
    }

    // Risoluzione algoritmica
    sol.oxidationNumber.steps.forEach(st => {
      const card = document.createElement('div');
      card.className = 'step-card';

      let content = `
        <div class="step-card-header">
          <div class="step-badge">${st.stepNumber}</div>
          <div class="step-title">${st.title}</div>
        </div>
        <div class="step-description">${st.description}</div>
      `;

      if (st.table) {
        content += `
          <table class="chem-table">
            <thead>
              <tr>
                <th>Ruolo</th>
                <th>Specie</th>
                <th>Numeri di Ossidazione Dettagliati</th>
              </tr>
            </thead>
            <tbody>
              ${st.table.map(row => {
                const oxBadges = Object.entries(row.data.oxidationStates).map(([el, val]) => {
                  const cls = val > 0 ? 'positive' : val < 0 ? 'negative' : 'zero';
                  const sign = val > 0 ? `+${val}` : `${val}`;
                  return `<span class="ox-badge ${cls}">${el}: ${sign}</span>`;
                }).join(' ');

                return `
                  <tr>
                    <td><b>${row.role}</b></td>
                    <td><code>${ChemParser.formatFormulaHTML(row.formula)}</code></td>
                    <td>${oxBadges}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `;
      }

      if (st.oxDelta && st.redDelta) {
        content += `
          <div class="half-rx-split">
            <div class="half-box ox">
              <div class="half-box-title">🔥 Variazione Ossidazione</div>
              <div>${st.oxDelta}</div>
            </div>
            <div class="half-box red">
              <div class="half-box-title">❄️ Variazione Riduzione</div>
              <div>${st.redDelta}</div>
            </div>
          </div>
        `;
      }

      if (st.coefficientsAssigned) {
        content += `<div class="notes-callout">${st.coefficientsAssigned}</div>`;
      }

      if (st.finalEquationHTML) {
        content += `<div class="formula-highlight-box">${st.finalEquationHTML}</div>`;
      }

      if (st.notes) {
        content += `<div class="notes-callout">${st.notes}</div>`;
      }

      card.innerHTML = content;
      stepsDisplay.appendChild(card);
    });
  }

  /**
   * Vista comparativa affiancata dei due metodi
   */
  function renderComparisonView(sol) {
    const compCard = document.createElement('div');
    compCard.className = 'card';
    compCard.innerHTML = `
      <h3 style="font-size: 18px; margin-bottom: 14px;">⚖️ Confronto Diretto: Semireazioni vs Numero di Ossidazione</h3>
      <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">
        Entrambi i metodi conducono rigorosamente alla stessa equazione finale bilanciata. Ecco un confronto passo dopo passo di come operano i due approcci:
      </p>

      <table class="chem-table">
        <thead>
          <tr>
            <th style="width: 20%;">Fase del Bilanciamento</th>
            <th style="width: 40%; color: var(--accent-cyan);">Metodo Semireazioni (Ionico-Elettronico)</th>
            <th style="width: 40%; color: var(--accent-amber);">Metodo del Numero di Ossidazione</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>Punto di Partenza</b></td>
            <td>Si separano fisicamente le due semireazioni di ossidazione e di riduzione.</td>
            <td>Si mantengono tutti i reagenti e prodotti insieme e si calcolano i n.o. di ogni elemento.</td>
          </tr>
          <tr>
            <td><b>Elettroni Scambiati</b></td>
            <td>Si aggiungono esplicitamente <code>e⁻</code> per pareggiare le cariche algebriche sui due membri.</td>
            <td>Si calcola &Delta; n.o. moltiplicando per il pedice della molecola per quantificare gli elettroni.</td>
          </tr>
          <tr>
            <td><b>Pareggio Elettronico</b></td>
            <td>Si calcola il m.c.m. e si moltiplica ciascuna semireazione per il rispettivo fattore intero.</td>
            <td>Si incrociano i valori di variazione o si usa il m.c.m. per attribuire i primi coefficienti.</td>
          </tr>
          <tr>
            <td><b>Ambiente (H⁺, OH⁻, H₂O)</b></td>
            <td>Si bilancia l'ossigeno con H₂O e l'idrogeno con H⁺/OH⁻ <i>all'interno di ciascuna semireazione</i>.</td>
            <td>Si bilanciano le cariche totali e le masse di O e H <i>sull'intera equazione globale</i> alla fine.</td>
          </tr>
          <tr>
            <td><b>Vantaggio Principale</b></td>
            <td>Auto-consistente e infallibile per reazioni ioniche in soluzione; non richiede di calcolare n.o. frazionari o complessi.</td>
            <td>Più rapido per equazioni molecolari complete senza spezzare i sali in ioni.</td>
          </tr>
        </tbody>
      </table>
    `;
    stepsDisplay.appendChild(compCard);
  }

  // =========================================================================
  // 5. GALLERIA CASI STUDIO RISOLTI
  // =========================================================================
  function initCasesGallery() {
    renderCasesCards('all');

    const filterBtns = caseFilterBar.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        renderCasesCards(filter);
      });
    });

    // Chiusura modale
    modalCloseBtn.addEventListener('click', () => {
      caseModalOverlay.classList.remove('active');
    });

    caseModalOverlay.addEventListener('click', (e) => {
      if (e.target === caseModalOverlay) {
        caseModalOverlay.classList.remove('active');
      }
    });
  }

  function renderCasesCards(filter) {
    casesGrid.innerHTML = '';

    const list = RedoxTutorialData.TUTORIAL_EQUATIONS.filter(item => {
      if (filter === 'all') return true;
      return item.category === filter;
    });

    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'case-card';

      const diffClass = item.difficulty.toLowerCase();

      card.innerHTML = `
        <div>
          <div class="case-card-category">${item.category}</div>
          <h3 class="case-card-title">${item.title}</h3>
          <p style="font-size: 13px; color: var(--text-muted);">${item.subtitle}</p>
          <div class="case-card-formula">${ChemParser.formatFormulaHTML(item.rawEquation)}</div>
        </div>
        <div class="case-card-footer">
          <span class="badge-difficulty ${diffClass}">${item.difficulty}</span>
          <span style="color: var(--accent-cyan); font-weight: 600;">Vedi Soluzione &rarr;</span>
        </div>
      `;

      card.addEventListener('click', () => {
        openCaseModal(item);
      });

      casesGrid.appendChild(card);
    });
  }

  function openCaseModal(item) {
    let stepsHtml = '';
    item.halfReactionSteps.forEach(s => {
      stepsHtml += `
        <div class="step-card" style="margin-bottom: 14px;">
          <div class="step-card-header">
            <div class="step-badge">${s.step}</div>
            <div class="step-title">${s.title}</div>
          </div>
          <div class="step-description">${s.text}</div>
          ${s.ox && s.red ? `
            <div class="half-rx-split">
              <div class="half-box ox">
                <div class="half-box-title">Ossidazione</div>
                <div class="half-box-formula">${s.ox}</div>
              </div>
              <div class="half-box red">
                <div class="half-box-title">Riduzione</div>
                <div class="half-box-formula">${s.red}</div>
              </div>
            </div>
          ` : ''}
          ${s.result ? `<div class="formula-highlight-box">${s.result}</div>` : ''}
        </div>
      `;
    });

    modalContent.innerHTML = `
      <div style="margin-bottom: 20px;">
        <span class="badge-difficulty ${item.difficulty.toLowerCase()}">${item.difficulty}</span>
        <h2 style="font-size: 22px; margin: 8px 0 4px;">${item.title}</h2>
        <p style="color: var(--text-muted); font-size: 14px;">${item.description}</p>
      </div>

      <div class="result-banner" style="margin-bottom: 20px;">
        <div class="result-banner-title">Equazione Bilanciata Finale</div>
        <div class="result-equation" style="font-size: 20px;">${ChemParser.formatFormulaHTML(item.balancedEquation)}</div>
        <div class="result-meta-bar">
          <div class="meta-chip red"><b>Ossidante:</b> ${item.oxidant}</div>
          <div class="meta-chip ox"><b>Riducente:</b> ${item.reductant}</div>
          <div class="meta-chip electrons"><b>Elettroni:</b> ${item.electronsExchanged} e⁻</div>
        </div>
      </div>

      <h3 style="margin-bottom: 14px; font-size: 17px;">Passaggi Risolutivi (Metodo delle Semireazioni):</h3>
      <div>${stepsHtml}</div>

      ${item.pitfalls ? `
        <div class="notes-callout" style="border-left-color: var(--accent-amber); margin-top: 16px;">
          <b>⚠️ Errore tipico degli studenti:</b> ${item.pitfalls}
        </div>
      ` : ''}

      <div style="margin-top: 24px; text-align: right;">
        <button class="btn-primary" id="loadInSolverBtn">
          <span>⚡</span> Carica nel Risolutore Interattivo
        </button>
      </div>
    `;

    document.getElementById('loadInSolverBtn').addEventListener('click', () => {
      equationInput.value = item.rawEquation;
      applyPretty(equationInput, 'equation');
      setMedium(item.medium);
      updateLivePreview();
      caseModalOverlay.classList.remove('active');
      switchTab('tab-solver');
      handleSolve();
    });

    caseModalOverlay.classList.add('active');
  }

  // =========================================================================
  // 6. CALCOLATORE NUMERI DI OSSIDAZIONE
  // =========================================================================
  function initOxCalculator() {
    oxCalcBtn.addEventListener('click', handleOxCalc);
    oxCalcInput.addEventListener('input', onFormulaInput(oxCalcInput, 'species', updateOxPreview));
    oxCalcInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleOxCalc();
    });

    const exampleBtns = document.querySelectorAll('.ox-example-btn');
    exampleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        oxCalcInput.value = btn.getAttribute('data-val');
        applyPretty(oxCalcInput, 'species');
        updateOxPreview();
        handleOxCalc();
      });
    });

    // Calcolo iniziale
    applyPretty(oxCalcInput, 'species');
    updateOxPreview();
    handleOxCalc();
  }

  function updateOxPreview() {
    const raw = oxCalcInput.value.trim();
    oxCalcInput.classList.remove('is-invalid', 'is-valid');
    if (!raw) { oxCalcPreview.innerHTML = '<i>Inserisci una formula...</i>'; oxCalcFeedback.innerHTML = ''; return; }
    const sp = ChemParser.parseSpecies(raw);
    if (/->|→|=/.test(ChemParser.normalizeText(raw))) {
      oxCalcPreview.innerHTML = ChemParser.formatEquationHTML(raw);
      oxCalcInput.classList.add('is-invalid');
      renderFeedback(oxCalcFeedback, { errors: ['Qui va una sola specie (es. K2Cr2O7). Per le equazioni usa la scheda Risolutore.'] });
      return;
    }
    if (sp.error) {
      oxCalcPreview.innerHTML = `<span class="species-error">${esc(raw)}</span>`;
      oxCalcInput.classList.add('is-invalid');
      renderFeedback(oxCalcFeedback, { errors: [sp.error] });
      return;
    }
    oxCalcInput.classList.add('is-valid');
    oxCalcPreview.innerHTML = ChemParser.formatFormulaHTML(sp.canonical);
    renderFeedback(oxCalcFeedback, {
      notes: sp.note ? [sp.note] : [],
      ambiguous: sp.ambiguous && !autoFormat ? [sp] : [],
      onFix: () => { oxCalcInput.value = sp.canonical; updateOxPreview(); handleOxCalc(); }
    });
  }

  function handleOxCalc() {
    const raw = oxCalcInput.value.trim();
    if (!raw) return;

    try {
      const sp = ChemParser.parseSpecies(raw);
      if (sp.error) throw new Error(sp.error);
      const res = ChemParser.calculateOxidationNumbers(sp.canonical);

      let badgesHtml = Object.entries(res.oxidationStates).map(([el, val]) => {
        const cls = val > 0 ? 'positive' : val < 0 ? 'negative' : 'zero';
        const sign = val > 0 ? `+${val}` : `${val}`;
        return `
          <div style="display: inline-flex; flex-direction: column; align-items: center; background: var(--bg-secondary); padding: 10px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin: 4px;">
            <span style="font-size: 12px; color: var(--text-muted);">${ChemParser.ELEMENTS[el]?.name || el}</span>
            <span class="ox-badge ${cls}" style="font-size: 18px; margin-top: 4px;">${sign}</span>
          </div>
        `;
      }).join('');

      let stepsHtml = res.steps.map(s => `
        <div style="margin-bottom: 12px; font-size: 14px;">
          <div style="font-weight: 700; color: var(--accent-cyan);">${s.rule}</div>
          <div style="color: var(--text-muted);">${s.text}</div>
        </div>
      `).join('');

      oxCalcResult.innerHTML = `
        <div class="result-banner" style="background: var(--bg-card); border-color: var(--border-highlight);">
          <div style="font-size: 20px; font-weight: 700; margin-bottom: 12px;">
            Specie: ${ChemParser.formatFormulaHTML(res.formula)} (Carica netta: ${res.charge >= 0 ? '+' + res.charge : res.charge})
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
            ${badgesHtml}
          </div>
          <h4 style="margin: 14px 0 8px; font-size: 15px;">Deduzione Algebrica delle Regole:</h4>
          ${stepsHtml}
        </div>
      `;
      oxCalcResult.style.display = 'block';
    } catch (err) {
      oxCalcResult.innerHTML = `<div class="notes-callout" style="border-left-color: var(--color-ox);">Errore nel calcolo: ${esc(err.message)}</div>`;
      oxCalcResult.style.display = 'block';
    }
  }

  // =========================================================================
  // 7. QUIZ INTERATTIVO
  // =========================================================================
  function initQuiz() {
    renderQuiz();
    restartQuizBtn.addEventListener('click', () => {
      state.quizScore = 0;
      state.quizTotal = 0;
      state.answeredQuestions.clear();
      renderQuiz();
    });
  }

  function renderQuiz() {
    quizContainer.innerHTML = '';
    state.quizTotal = QuizEngine.QUIZ_QUESTIONS.length;
    updateQuizScore();

    QuizEngine.QUIZ_QUESTIONS.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'quiz-card';

      const optionsHtml = q.options.map((opt, optIdx) => `
        <button class="quiz-option-btn" data-qid="${q.id}" data-opt="${optIdx}">
          ${opt.text}
        </button>
      `).join('');

      card.innerHTML = `
        <div style="font-size: 12px; font-weight: 800; color: var(--accent-cyan); text-transform: uppercase;">Domanda ${idx + 1} di ${QuizEngine.QUIZ_QUESTIONS.length}</div>
        <div class="quiz-question-title">${q.title}</div>
        <div style="margin-bottom: 14px; font-size: 15px;">${q.question}</div>
        <div class="quiz-options">${optionsHtml}</div>
        <div class="quiz-feedback" id="feedback-${q.id}"></div>
      `;

      const optionBtns = card.querySelectorAll('.quiz-option-btn');
      optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (state.answeredQuestions.has(q.id)) return; // già risposta
          state.answeredQuestions.add(q.id);

          const optIndex = parseInt(btn.getAttribute('data-opt'), 10);
          const chosenOpt = q.options[optIndex];
          const feedbackDiv = card.querySelector(`#feedback-${q.id}`);

          optionBtns.forEach((b, i) => {
            b.disabled = true;
            if (q.options[i].correct) {
              b.classList.add('correct');
            }
          });

          if (chosenOpt.correct) {
            btn.classList.add('correct');
            state.quizScore++;
            feedbackDiv.className = 'quiz-feedback active success';
            feedbackDiv.innerHTML = `<b>Esatto! ✅</b> ${q.explanation}`;
          } else {
            btn.classList.add('incorrect');
            feedbackDiv.className = 'quiz-feedback active error';
            feedbackDiv.innerHTML = `<b>Non corretto! ❌</b> ${q.explanation}`;
          }

          updateQuizScore();
        });
      });

      quizContainer.appendChild(card);
    });
  }

  function updateQuizScore() {
    quizScoreBadge.textContent = `Punteggio: ${state.quizScore} / ${state.answeredQuestions.size} (di ${state.quizTotal})`;
  }

});
