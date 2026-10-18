/**
 * data-equations.js
 * Archivio didattico approfondito di reazioni redox risolte passaggio per passaggio.
 * Include spiegazioni teoriche, trucchi mnemonici ed errori comuni per ciascuna reazione.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RedoxTutorialData = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const TUTORIAL_EQUATIONS = [
    {
      id: 'permanganate-iron',
      title: 'Permanganato e Ferro(II) in ambiente acido',
      subtitle: 'La titolazione redox classica (Permanganometria)',
      difficulty: 'Base',
      category: 'Ambiente Acido',
      rawEquation: 'MnO4^- + Fe^2+ -> Mn^2+ + Fe^3+',
      balancedEquation: 'MnO4^- + 5 Fe^2+ + 8 H^+ -> Mn^2+ + 5 Fe^3+ + 4 H2O',
      medium: 'acid',
      oxidant: 'MnO₄⁻ (Ione permanganato)',
      reductant: 'Fe²⁺ (Ione ferroso)',
      electronsExchanged: 5,
      description: 'Reazione fondamentale della chimica analitica quantitativa. Lo ione permanganato viola intenso agisce da potente ossidante e funge da auto-indicatore di punto finale, riducendosi a Mn²⁺ quasi incolore.',
      halfReactionSteps: [
        {
          step: 1,
          title: 'Scrittura delle semireazioni scheletro',
          text: 'Identifichiamo chi cambia stato di ossidazione: il manganese passa da +7 a +2 (riduzione), il ferro passa da +2 a +3 (ossidazione).',
          ox: 'Fe²⁺ &rarr; Fe³⁺',
          red: 'MnO₄⁻ &rarr; Mn²⁺'
        },
        {
          step: 2,
          title: 'Bilanciamento degli elementi redox',
          text: 'Sia il Ferro che il Manganese hanno 1 atomo a sinistra e 1 atomo a destra. Nessun coefficiente necessario in questa fase.',
          ox: 'Fe²⁺ &rarr; Fe³⁺',
          red: 'MnO₄⁻ &rarr; Mn²⁺'
        },
        {
          step: 3,
          title: 'Bilanciamento dell\'Ossigeno con molecole di H₂O',
          text: 'Nella semireazione di riduzione abbiamo 4 atomi di ossigeno nei reagenti (MnO₄⁻). Aggiungiamo quindi <b>4 H₂O</b> nei prodotti.',
          ox: 'Fe²⁺ &rarr; Fe³⁺',
          red: 'MnO₄⁻ &rarr; Mn²⁺ + <b>4 H₂O</b>'
        },
        {
          step: 4,
          title: 'Bilanciamento dell\'Idrogeno con ioni H⁺ (ambiente acido)',
          text: 'Le 4 molecole di H₂O nei prodotti introducono 8 atomi di idrogeno. In ambiente acido, bilanciamo aggiungendo <b>8 H⁺</b> nei reagenti.',
          ox: 'Fe²⁺ &rarr; Fe³⁺',
          red: 'MnO₄⁻ + <b>8 H⁺</b> &rarr; Mn²⁺ + 4 H₂O'
        },
        {
          step: 5,
          title: 'Bilanciamento delle cariche elettriche con elettroni (e⁻)',
          text: '<b>Ossidazione:</b> Fe²⁺ (+2) &rarr; Fe³⁺ (+3). Per bilanciare la carica aggiungiamo <b>1 e⁻</b> a destra.<br>' +
                '<b>Riduzione:</b> MnO₄⁻ (-1) + 8 H⁺ (+8) = carica netta +7 a sinistra; Mn²⁺ (+2) a destra. Per passare da +7 a +2 aggiungiamo <b>5 e⁻</b> a sinistra.',
          ox: 'Fe²⁺ &rarr; Fe³⁺ + <b>1 e⁻</b>',
          red: 'MnO₄⁻ + 8 H⁺ + <b>5 e⁻</b> &rarr; Mn²⁺ + 4 H₂O'
        },
        {
          step: 6,
          title: 'Uguaglianza degli elettroni (m.c.m.) e moltiplicazione',
          text: 'Il m.c.m. tra 1 e 5 è <b>5</b>. Moltiplichiamo la semireazione di ossidazione per 5 e quella di riduzione per 1.',
          multipliers: 'Ossidazione &times; 5  |  Riduzione &times; 1',
          ox: '<b>5</b> Fe²⁺ &rarr; <b>5</b> Fe³⁺ + <b>5 e⁻</b>',
          red: 'MnO₄⁻ + 8 H⁺ + <b>5 e⁻</b> &rarr; Mn²⁺ + 4 H₂O'
        },
        {
          step: 7,
          title: 'Somma membro a membro ed elisione degli elettroni',
          text: 'Sommando le due semireazioni, i 5 elettroni compaiono su entrambi i membri e si cancellano perfettamente.',
          result: '<b>MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ &rarr; Mn²⁺ + 5 Fe³⁺ + 4 H₂O</b>'
        },
        {
          step: 8,
          title: 'Verifica finale di massa e carica',
          text: 'Carica sinistra: (-1) + 5(+2) + 8(+1) = <b>+17</b>.<br>Carica destra: (+2) + 5(+3) = <b>+17</b>.<br>Atomi: 1 Mn, 5 Fe, 8 H, 4 O per ciascun membro. ✅ Bilanciata al 100%!'
        }
      ],
      oxNumberSteps: [
        {
          step: 1,
          title: 'Calcolo di tutti i numeri di ossidazione (n.o.)',
          text: '• In MnO₄⁻: O ha -2; x + 4(-2) = -1 &rArr; <b>n.o.(Mn) = +7</b>.<br>' +
                '• In Fe²⁺: ione monoatomico &rArr; <b>n.o.(Fe) = +2</b>.<br>' +
                '• In Mn²⁺: ione monoatomico &rArr; <b>n.o.(Mn) = +2</b>.<br>' +
                '• In Fe³⁺: ione monoatomico &rArr; <b>n.o.(Fe) = +3</b>.'
        },
        {
          step: 2,
          title: 'Calcolo delle variazioni di n.o. (Δ n.o.)',
          text: '• <b>Fe si ossida:</b> passa da +2 a +3 (&Delta; = +1 e⁻ per atomo).<br>' +
                '• <b>Mn si riduce:</b> passa da +7 a +2 (&Delta; = -5 e⁻ per atomo).'
        },
        {
          step: 3,
          title: 'Bilanciamento dello scambio elettronico tramite m.c.m.',
          text: 'Il m.c.m.(1, 5) = 5. Assegniamo il coefficiente <b>5</b> alle specie del ferro e <b>1</b> alle specie del manganese:<br>' +
                '<code>1 MnO₄⁻ + 5 Fe²⁺ &rarr; 1 Mn²⁺ + 5 Fe³⁺</code>'
        },
        {
          step: 4,
          title: 'Bilanciamento delle cariche elettriche in ambiente acido',
          text: 'Carica reagenti attuali: (-1) + 5(+2) = +9.<br>' +
                'Carica prodotti attuali: (+2) + 5(+3) = +17.<br>' +
                'La differenza (+17 - 9 = 8 cariche positive mancanti a sinistra) si compensa aggiungendo <b>8 H⁺</b> nei reagenti.'
        },
        {
          step: 5,
          title: 'Bilanciamento di H e O con molecole di H₂O',
          text: 'Avendo introdotto 8 H⁺ a sinistra, aggiungiamo <b>4 H₂O</b> a destra per pareggiare gli atomi di H. Il controllo degli atomi di O conferma: 4 atomi a sinistra (MnO₄⁻) e 4 a destra (4 H₂O).'
        }
      ],
      pitfalls: 'Errore comune: dimenticare di moltiplicare la semireazione del ferro per 5, oppure confondere la carica dello ione permanganato (-1) con il suo numero di ossidazione (+7).'
    },
    {
      id: 'dichromate-iodide',
      title: 'Dicromato e Ioduro in ambiente acido',
      subtitle: 'Attenzione al pedice dell\'anione dicromato Cr₂O₇²⁻',
      difficulty: 'Intermedio',
      category: 'Ambiente Acido',
      rawEquation: 'Cr2O7^2- + I^- -> Cr^3+ + I2',
      balancedEquation: 'Cr2O7^2- + 6 I^- + 14 H^+ -> 2 Cr^3+ + 3 I2 + 7 H2O',
      medium: 'acid',
      oxidant: 'Cr₂O₇²⁻ (Ione dicromato)',
      reductant: 'I⁻ (Ione ioduro)',
      electronsExchanged: 6,
      description: 'Esempio classico in cui è cruciale ricordare che l\'anione dicromato contiene 2 atomi di cromo e il prodotto iodio molecolare è biatomico (I₂).',
      halfReactionSteps: [
        {
          step: 1,
          title: 'Semireazioni scheletro',
          text: 'Ossidazione: I⁻ &rarr; I₂. Riduzione: Cr₂O₇²⁻ &rarr; Cr³⁺.',
          ox: 'I⁻ &rarr; I₂',
          red: 'Cr₂O₇²⁻ &rarr; Cr³⁺'
        },
        {
          step: 2,
          title: 'Bilanciamento degli atomi dell\'elemento redox',
          text: '<b>ATTENZIONE:</b> a sinistra abbiamo Cr₂, quindi a destra servono <b>2 Cr³⁺</b>! Allo stesso modo, a destra abbiamo I₂, quindi a sinistra servono <b>2 I⁻</b>!',
          ox: '<b>2</b> I⁻ &rarr; I₂',
          red: 'Cr₂O₇²⁻ &rarr; <b>2</b> Cr³⁺'
        },
        {
          step: 3,
          title: 'Bilanciamento dell\'Ossigeno con H₂O',
          text: 'In Cr₂O₇²⁻ ci sono 7 atomi di ossigeno. Aggiungiamo <b>7 H₂O</b> a destra nella semireazione di riduzione.',
          ox: '2 I⁻ &rarr; I₂',
          red: 'Cr₂O₇²⁻ &rarr; 2 Cr³⁺ + <b>7 H₂O</b>'
        },
        {
          step: 4,
          title: 'Bilanciamento dell\'Idrogeno con H⁺',
          text: 'I 7 H₂O a destra apportano 14 atomi di idrogeno. Aggiungiamo <b>14 H⁺</b> a sinistra.',
          ox: '2 I⁻ &rarr; I₂',
          red: 'Cr₂O₇²⁻ + <b>14 H⁺</b> &rarr; 2 Cr³⁺ + 7 H₂O'
        },
        {
          step: 5,
          title: 'Bilanciamento delle cariche elettriche',
          text: '• Ossidazione: 2 I⁻ ha carica -2; I₂ ha carica 0. Aggiungiamo <b>2 e⁻</b> a destra.<br>' +
                '• Riduzione: (-2) + 14(+1) = +12 a sinistra; 2(+3) = +6 a destra. Per passare da +12 a +6 aggiungiamo <b>6 e⁻</b> a sinistra.',
          ox: '2 I⁻ &rarr; I₂ + <b>2 e⁻</b>',
          red: 'Cr₂O₇²⁻ + 14 H⁺ + <b>6 e⁻</b> &rarr; 2 Cr³⁺ + 7 H₂O'
        },
        {
          step: 6,
          title: 'Pareggio degli elettroni (m.c.m.)',
          text: 'Il m.c.m. tra 2 e 6 è <b>6</b>. Moltiplichiamo l\'ossidazione per 3 e la riduzione per 1.',
          multipliers: 'Ossidazione &times; 3  |  Riduzione &times; 1',
          ox: '<b>6</b> I⁻ &rarr; <b>3</b> I₂ + <b>6 e⁻</b>',
          red: 'Cr₂O₇²⁻ + 14 H⁺ + <b>6 e⁻</b> &rarr; 2 Cr³⁺ + 7 H₂O'
        },
        {
          step: 7,
          title: 'Somma e risultato finale',
          text: 'I 6 elettroni si elidono perfettamente.',
          result: '<b>Cr₂O₇²⁻ + 6 I⁻ + 14 H⁺ &rarr; 2 Cr³⁺ + 3 I₂ + 7 H₂O</b>'
        }
      ],
      oxNumberSteps: [
        {
          step: 1,
          title: 'Determinazione dei numeri di ossidazione',
          text: '• Cr in Cr₂O₇²⁻: 2x + 7(-2) = -2 &rArr; 2x = +12 &rArr; <b>n.o.(Cr) = +6</b>.<br>' +
                '• I in I⁻: <b>n.o. = -1</b>.<br>' +
                '• Cr in Cr³⁺: <b>n.o. = +3</b>.<br>' +
                '• I in I₂: sostanza elementare &rArr; <b>n.o. = 0</b>.'
        },
        {
          step: 2,
          title: 'Calcolo di Δ n.o. tenendo conto dei pedici',
          text: '• <b>Cr:</b> passa da +6 a +3 (&Delta; = 3 per atomo). Poiché la formula ha 2 atomi di Cr, la variazione totale per molecola di Cr₂O₇²⁻ è <b>2 &times; 3 = 6 e⁻ acquistati</b>.<br>' +
                '• <b>I:</b> passa da -1 a 0 (&Delta; = 1 per atomo). Poiché si forma I₂, la coppia di atomi scambia <b>2 e⁻ ceduti</b>.'
        },
        {
          step: 3,
          title: 'Incrocio e bilanciamento cariche',
          text: 'm.c.m.(6, 2) = 6. Abbiamo quindi 1 Cr₂O₇²⁻ (che produce 2 Cr³⁺) e 3 I₂ (provenienti da 6 I⁻).<br>' +
                'Carica a sinistra: (-2) + 6(-1) = -8.<br>' +
                'Carica a destra: 2(+3) = +6.<br>' +
                'Per colmare la differenza da -8 a +6 occorrono <b>14 cariche positive H⁺</b> a sinistra.<br>' +
                'Infine 14 H⁺ richiedono <b>7 H₂O</b> a destra.'
        }
      ],
      pitfalls: 'La trappola più frequente è calcolare Δ n.o. = 3 per il cromo dimenticando che ci sono 2 atomi di cromo per formula, portando a un coefficiente errato per lo iodio.'
    },
    {
      id: 'permanganate-sulfite-basic',
      title: 'Permanganato e Solfito in ambiente basico',
      subtitle: 'La riduzione del manganese si ferma a diossido di manganese MnO₂',
      difficulty: 'Intermedio',
      category: 'Ambiente Basico',
      rawEquation: 'MnO4^- + SO3^2- -> MnO2 + SO4^2-',
      balancedEquation: '2 MnO4^- + 3 SO3^2- + H2O -> 2 MnO2 + 3 SO4^2- + 2 OH^-',
      medium: 'base',
      oxidant: 'MnO₄⁻',
      reductant: 'SO₃²⁻',
      electronsExchanged: 6,
      description: 'In ambiente alcalino, il permanganato non si riduce a Mn²⁺ (come avviene in ambiente acido), bensì precipita come solido bruno MnO₂ (manganese(IV)). Questo esempio mostra come gestire l\'ambiente basico.',
      halfReactionSteps: [
        {
          step: 1,
          title: 'Semireazioni scheletro',
          text: 'Il manganese si riduce da +7 (MnO₄⁻) a +4 (MnO₂). Lo zolfo si ossida da +4 (SO₃²⁻) a +6 (SO₄²⁻).',
          ox: 'SO₃²⁻ &rarr; SO₄²⁻',
          red: 'MnO₄⁻ &rarr; MnO₂'
        },
        {
          step: 2,
          title: 'Bilanciamento dell\'Ossigeno con H₂O',
          text: '• SO₃²⁻ ha 3 O, SO₄²⁻ ha 4 O &rArr; serve <b>1 H₂O</b> a sinistra.<br>' +
                '• MnO₄⁻ ha 4 O, MnO₂ ha 2 O &rArr; servono <b>2 H₂O</b> a destra.',
          ox: 'SO₃²⁻ + <b>H₂O</b> &rarr; SO₄²⁻',
          red: 'MnO₄⁻ &rarr; MnO₂ + <b>2 H₂O</b>'
        },
        {
          step: 3,
          title: 'Bilanciamento dell\'Idrogeno e conversione per ambiente basico',
          text: '<i>Metodo standard e infallibile:</i> bilanciamo dapprima con H⁺ e poi neutralizziamo con OH⁻ su ambo i membri.<br>' +
                '• Per l\'ossidazione: SO₃²⁻ + H₂O &rarr; SO₄²⁻ + 2 H⁺. Aggiungiamo 2 OH⁻ ad ambo i membri: a destra 2 H⁺ + 2 OH⁻ = 2 H₂O. Semplificando l\'H₂O a sinistra:<br>' +
                '<code>SO₃²⁻ + 2 OH⁻ &rarr; SO₄²⁻ + H₂O</code><br>' +
                '• Per la riduzione: MnO₄⁻ + 4 H⁺ &rarr; MnO₂ + 2 H₂O. Aggiungiamo 4 OH⁻ ad ambo i membri: a sinistra 4 H⁺ + 4 OH⁻ = 4 H₂O. Semplificando con i 2 H₂O a destra:<br>' +
                '<code>MnO₄⁻ + 2 H₂O &rarr; MnO₂ + 4 OH⁻</code>',
          ox: 'SO₃²⁻ + 2 OH⁻ &rarr; SO₄²⁻ + H₂O',
          red: 'MnO₄⁻ + 2 H₂O &rarr; MnO₂ + 4 OH⁻'
        },
        {
          step: 4,
          title: 'Aggiunta degli elettroni',
          text: '• Ossidazione: carica reagenti = -2 + 2(-1) = -4; prodotti = -2. Servono <b>2 e⁻</b> a destra.<br>' +
                '• Riduzione: carica reagenti = -1; prodotti = 4(-1) = -4. Servono <b>3 e⁻</b> a sinistra.',
          ox: 'SO₃²⁻ + 2 OH⁻ &rarr; SO₄²⁻ + H₂O + <b>2 e⁻</b>',
          red: 'MnO₄⁻ + 2 H₂O + <b>3 e⁻</b> &rarr; MnO₂ + 4 OH⁻'
        },
        {
          step: 5,
          title: 'Moltiplicazione per m.c.m. e somma finale',
          text: 'm.c.m.(2, 3) = 6. Moltiplichiamo l\'ossidazione per 3 e la riduzione per 2:<br>' +
                '3 SO₃²⁻ + 6 OH⁻ &rarr; 3 SO₄²⁻ + 3 H₂O + 6 e⁻<br>' +
                '2 MnO₄⁻ + 4 H₂O + 6 e⁻ &rarr; 2 MnO₂ + 8 OH⁻<br>' +
                'Sommando e semplificando (4 H₂O - 3 H₂O = 1 H₂O a sinistra; 8 OH⁻ - 6 OH⁻ = 2 OH⁻ a destra):',
          result: '<b>2 MnO₄⁻ + 3 SO₃²⁻ + H₂O &rarr; 2 MnO₂ + 3 SO₄²⁻ + 2 OH⁻</b>'
        }
      ],
      oxNumberSteps: [
        {
          step: 1,
          title: 'Numeri di ossidazione e Δ n.o.',
          text: 'Mn passa da +7 a +4 (&Delta; = -3 e⁻ acquistati).<br>S passa da +4 a +6 (&Delta; = +2 e⁻ ceduti).'
        },
        {
          step: 2,
          title: 'm.c.m. e coefficienti redox iniziali',
          text: 'm.c.m.(3, 2) = 6 &rArr; <b>2 MnO₄⁻</b> e <b>3 SO₃²⁻</b>, producendo <b>2 MnO₂</b> e <b>3 SO₄²⁻</b>.'
        },
        {
          step: 3,
          title: 'Bilanciamento delle cariche in ambiente basico (OH⁻)',
          text: 'Carica sinistra: 2(-1) + 3(-2) = -8.<br>' +
                'Carica destra: 3(-2) = -6.<br>' +
                'Essendo in ambiente basico, per pareggiare le cariche negative aggiungiamo <b>2 OH⁻</b> a destra (così a destra abbiamo -6 + (-2) = -8).'
        },
        {
          step: 4,
          title: 'Bilanciamento H e O con H₂O',
          text: 'I 2 OH⁻ a destra richiedono 2 atomi di H a sinistra &rArr; aggiungiamo <b>1 H₂O</b> a sinistra.<br>' +
                'Verifica atomi O: 2(4) + 3(3) + 1 = 8 + 9 + 1 = 18 a sinistra; 2(2) + 3(4) + 2 = 4 + 12 + 2 = 18 a destra. Perfetto!'
        }
      ],
      pitfalls: 'In ambiente basico molti studenti scrivono erroneamente H⁺ tra i reagenti. Ricorda: in ambiente basico gli ioni H⁺ liberi non possono esistere a concentrazioni significative; le specie che bilanciano sono solo OH⁻ e H₂O.'
    },
    {
      id: 'chlorine-disproportionation',
      title: 'Dismutazione (Disproporzione) del Cloro in ambiente basico a caldo',
      subtitle: 'La stessa specie chimica agisce contemporaneamente da ossidante e riducente',
      difficulty: 'Avanzato',
      category: 'Dismutazione',
      rawEquation: 'Cl2 + OH^- -> Cl^- + ClO3^- + H2O',
      balancedEquation: '3 Cl2 + 6 OH^- -> 5 Cl^- + ClO3^- + 3 H2O',
      medium: 'base',
      oxidant: 'Cl₂ (si riduce a Cl⁻)',
      reductant: 'Cl₂ (si ossida a ClO₃⁻)',
      electronsExchanged: 5,
      description: 'Una reazione di dismutazione si verifica quando atomi dello stesso elemento in un dato stato di ossidazione vengono in parte ossidati a uno stato superiore e in parte ridotti a uno stato inferiore.',
      halfReactionSteps: [
        {
          step: 1,
          title: 'Sdoppiamento della specie dismutante in due semireazioni',
          text: 'Il cloro molecolare Cl₂ (n.o. = 0) si sdoppia:<br>' +
                '• Ossidazione: Cl₂ &rarr; ClO₃⁻ (da 0 a +5)<br>' +
                '• Riduzione: Cl₂ &rarr; Cl⁻ (da 0 a -1)',
          ox: 'Cl₂ &rarr; ClO₃⁻',
          red: 'Cl₂ &rarr; Cl⁻'
        },
        {
          step: 2,
          title: 'Bilanciamento degli atomi di Cloro',
          text: 'Cl₂ è biatomico, quindi dobbiamo formare 2 ClO₃⁻ e 2 Cl⁻:',
          ox: 'Cl₂ &rarr; <b>2</b> ClO₃⁻',
          red: 'Cl₂ &rarr; <b>2</b> Cl⁻'
        },
        {
          step: 3,
          title: 'Bilanciamento in ambiente basico',
          text: '• Nella riduzione: Cl₂ + <b>2 e⁻</b> &rarr; 2 Cl⁻ (già priva di O e H).<br>' +
                '• Nell\'ossidazione: Cl₂ &rarr; 2 ClO₃⁻ ha 6 O a destra. Aggiungiamo 6 H₂O a sinistra e 12 H⁺ a destra. Convertendo in ambiente basico sommando 12 OH⁻:<br>' +
                '<code>Cl₂ + 12 OH⁻ &rarr; 2 ClO₃⁻ + 6 H₂O + 10 e⁻</code>',
          ox: 'Cl₂ + 12 OH⁻ &rarr; 2 ClO₃⁻ + 6 H₂O + <b>10 e⁻</b>',
          red: 'Cl₂ + <b>2 e⁻</b> &rarr; 2 Cl⁻'
        },
        {
          step: 4,
          title: 'm.c.m. degli elettroni',
          text: 'L\'ossidazione scambia 10 elettroni; la riduzione ne scambia 2. m.c.m.(10, 2) = 10. Moltiplichiamo la riduzione per 5:',
          multipliers: 'Ossidazione &times; 1  |  Riduzione &times; 5',
          ox: 'Cl₂ + 12 OH⁻ &rarr; 2 ClO₃⁻ + 6 H₂O + 10 e⁻',
          red: '<b>5</b> Cl₂ + <b>10 e⁻</b> &rarr; <b>10</b> Cl⁻'
        },
        {
          step: 5,
          title: 'Somma e semplificazione dei coefficienti',
          text: 'Sommiamo: (1 Cl₂ + 5 Cl₂) + 12 OH⁻ &rarr; 10 Cl⁻ + 2 ClO₃⁻ + 6 H₂O.<br>' +
                'Otteniamo: 6 Cl₂ + 12 OH⁻ &rarr; 10 Cl⁻ + 2 ClO₃⁻ + 6 H₂O.<br>' +
                'Tutti i coefficienti sono pari! Dividiamo per 2 per avere i minimi interi:',
          result: '<b>3 Cl₂ + 6 OH⁻ &rarr; 5 Cl⁻ + ClO₃⁻ + 3 H₂O</b>'
        }
      ],
      oxNumberSteps: [
        {
          step: 1,
          title: 'Variazioni di n.o.',
          text: '• Cl₂ ha n.o. = 0.<br>' +
                '• In ClO₃⁻: n.o.(Cl) = +5 (&Delta; = +5 per atomo; 10 e⁻ per molecola Cl₂).<br>' +
                '• In Cl⁻: n.o.(Cl) = -1 (&Delta; = -1 per atomo; 2 e⁻ per molecola Cl₂).'
        },
        {
          step: 2,
          title: 'Bilanciamento stechiometrico',
          text: 'Per pareggiare 10 e⁻ ceduti con 2 e⁻ acquistati serve un rapporto di 5 atomi di Cl che si riducono per ogni atomo di Cl che si ossida.<br>' +
                'Quindi il rapporto nei prodotti è <b>5 Cl⁻</b> per ogni <b>1 ClO₃⁻</b> (totale 6 atomi di Cl = 3 molecole Cl₂).'
        },
        {
          step: 3,
          title: 'Completamento con cariche e H₂O',
          text: 'Carica prodotti = 5(-1) + 1(-1) = -6.<br>Aggiungiamo <b>6 OH⁻</b> a sinistra. Per pareggiare gli idrogeni aggiungiamo <b>3 H₂O</b> a destra.'
        }
      ],
      pitfalls: 'Dimenticare di dividere i coefficienti per 2 alla fine per ottenere il set di coefficienti stechiometrici interi minimi.'
    },
    {
      id: 'copper-nitric-conc',
      title: 'Rame metallico e Acido Nitrico concentrato',
      subtitle: 'Reazione molecolare con emissione di diossido di azoto NO₂ (fumi bruni)',
      difficulty: 'Intermedio',
      category: 'Molecolare',
      rawEquation: 'Cu + HNO3 -> Cu(NO3)2 + NO2 + H2O',
      balancedEquation: 'Cu + 4 HNO3 -> Cu(NO3)2 + 2 NO2 + 2 H2O',
      medium: 'acid',
      oxidant: 'HNO₃ (parte dell\'azoto si riduce)',
      reductant: 'Cu metallico',
      electronsExchanged: 2,
      description: 'Celebre reazione in cui una parte dell\'acido nitrico partecipa alla reazione redox (riducendosi a gas bruno NO₂), mentre un\'altra parte agisce da acido salificante per formare il sale Cu(NO₃)₂.',
      halfReactionSteps: [
        {
          step: 1,
          title: 'Forma ionica netta',
          text: 'In soluzione acquosa, dissociamo gli elettroliti forti: Cu + NO₃⁻ + H⁺ &rarr; Cu²⁺ + NO₂ + H₂O.',
          ox: 'Cu &rarr; Cu²⁺',
          red: 'NO₃⁻ &rarr; NO₂'
        },
        {
          step: 2,
          title: 'Bilanciamento semireazioni ioniche',
          text: '• Ossidazione: Cu &rarr; Cu²⁺ + <b>2 e⁻</b><br>' +
                '• Riduzione: NO₃⁻ + 2 H⁺ + <b>1 e⁻</b> &rarr; NO₂ + H₂O',
          ox: 'Cu &rarr; Cu²⁺ + 2 e⁻',
          red: 'NO₃⁻ + 2 H⁺ + 1 e⁻ &rarr; NO₂ + H₂O'
        },
        {
          step: 3,
          title: 'Pareggio degli elettroni e somma ionica',
          text: 'Moltiplichiamo la riduzione per 2:<br>' +
                '<code>Cu + 2 NO₃⁻ + 4 H⁺ &rarr; Cu²⁺ + 2 NO₂ + 2 H₂O</code>',
          result: 'Cu + 2 NO₃⁻ + 4 H⁺ &rarr; Cu²⁺ + 2 NO₂ + 2 H₂O'
        },
        {
          step: 4,
          title: 'Passaggio alla forma molecolare',
          text: 'Cu²⁺ richiede 2 anioni nitrato NO₃⁻ per formare Cu(NO₃)₂. Aggiungiamo 2 NO₃⁻ a entrambi i membri:<br>' +
                'A sinistra i 4 H⁺ con (2 redox + 2 spettatori) = 4 NO₃⁻ formano <b>4 HNO₃</b>.',
          result: '<b>Cu + 4 HNO₃ &rarr; Cu(NO₃)₂ + 2 NO₂ + 2 H₂O</b>'
        }
      ],
      oxNumberSteps: [
        {
          step: 1,
          title: 'Variazione dei numeri di ossidazione',
          text: '• Cu: da 0 a +2 (&Delta; = +2 e⁻ ceduti).<br>' +
                '• N in NO₂: da +5 a +4 (&Delta; = -1 e⁻ acquistato).'
        },
        {
          step: 2,
          title: 'Assegnazione coefficienti redox e spettatori',
          text: 'Per pareggiare gli elettroni, 1 Cu richiede <b>2 NO₂</b>.<br>' +
                'Il rame forma Cu(NO₃)₂, che contiene altri 2 gruppi NO₃⁻ che NON hanno subito redox (spettatori).<br>' +
                'Totale molecole di HNO₃ = 2 (redox) + 2 (salificanti) = <b>4 HNO₃</b>.'
        },
        {
          step: 3,
          title: 'Bilanciamento di H e O',
          text: 'I 4 H di 4 HNO₃ formano <b>2 H₂O</b>. Conteggio O: 4 &times; 3 = 12 a sinistra; 6 [in Cu(NO₃)₂] + 4 [in 2 NO₂] + 2 [in 2 H₂O] = 12 a destra.'
        }
      ],
      pitfalls: 'Dimenticare che non tutto l\'acido nitrico si riduce: 2 molecole su 4 servono semplicemente a fornire gli ioni spettatore nitrato per il rame.'
    },
    {
      id: 'copper-nitric-dilute',
      title: 'Rame metallico e Acido Nitrico diluito',
      subtitle: 'Riduzione a monossido di azoto NO (gas incolore che si imbrunisce all\'aria)',
      difficulty: 'Intermedio',
      category: 'Molecolare',
      rawEquation: 'Cu + HNO3 -> Cu(NO3)2 + NO + H2O',
      balancedEquation: '3 Cu + 8 HNO3 -> 3 Cu(NO3)2 + 2 NO + 4 H2O',
      medium: 'acid',
      oxidant: 'HNO₃ diluito',
      reductant: 'Cu',
      electronsExchanged: 6,
      description: 'A differenza dell\'acido concentrato, quando l\'acido nitrico è diluito la riduzione dell\'azoto è più profonda: passa da +5 a +2 formando NO.',
      halfReactionSteps: [
        {
          step: 1,
          title: 'Semireazioni ioniche',
          text: '• Ossidazione: Cu &rarr; Cu²⁺ + 2 e⁻<br>' +
                '• Riduzione: NO₃⁻ + 4 H⁺ + 3 e⁻ &rarr; NO + 2 H₂O',
          ox: 'Cu &rarr; Cu²⁺ + 2 e⁻',
          red: 'NO₃⁻ + 4 H⁺ + 3 e⁻ &rarr; NO + 2 H₂O'
        },
        {
          step: 2,
          title: 'm.c.m.(2, 3) = 6',
          text: 'Moltiplichiamo l\'ossidazione per 3 e la riduzione per 2:<br>' +
                '<code>3 Cu + 2 NO₃⁻ + 8 H⁺ &rarr; 3 Cu²⁺ + 2 NO + 4 H₂O</code>',
          result: '3 Cu + 2 NO₃⁻ + 8 H⁺ &rarr; 3 Cu²⁺ + 2 NO + 4 H₂O'
        },
        {
          step: 3,
          title: 'Reintegrazione dei nitrati spettatori',
          text: '3 Cu²⁺ richiedono 6 ioni NO₃⁻ per formare 3 Cu(NO₃)₂.<br>' +
                'Aggiungiamo 6 NO₃⁻ ad ambo i membri: a sinistra gli 8 H⁺ si uniscono a (2 + 6) = 8 NO₃⁻ formando <b>8 HNO₃</b>.',
          result: '<b>3 Cu + 8 HNO₃ &rarr; 3 Cu(NO₃)₂ + 2 NO + 4 H₂O</b>'
        }
      ],
      oxNumberSteps: [
        {
          step: 1,
          title: 'Variazione n.o.',
          text: 'Cu: 0 &rarr; +2 (&Delta; = 2). N: +5 &rarr; +2 (&Delta; = 3). m.c.m. = 6.'
        },
        {
          step: 2,
          title: 'Coefficienti',
          text: '3 Cu e 2 NO. Poi 3 Cu(NO₃)₂ richiede 6 nitrati non redox. Totale HNO₃ = 2 + 6 = 8.'
        }
      ],
      pitfalls: 'Confondere i prodotti tra HNO₃ concentrato (produce NO₂) e HNO₃ diluito (produce NO).'
    },
    {
      id: 'hydrogen-peroxide-permanganate',
      title: 'Acqua Ossigenata e Permanganato in ambiente acido',
      subtitle: 'Il perossido d\'idrogeno agisce da riducente liberando O₂ gassoso',
      difficulty: 'Avanzato',
      category: 'Ambiente Acido',
      rawEquation: 'MnO4^- + H2O2 + H^+ -> Mn^2+ + O2 + H2O',
      balancedEquation: '2 MnO4^- + 5 H2O2 + 6 H^+ -> 2 Mn^2+ + 5 O2 + 8 H2O',
      medium: 'acid',
      oxidant: 'MnO₄⁻',
      reductant: 'H₂O₂ (n.o. dell\'ossigeno = -1)',
      electronsExchanged: 10,
      description: 'Nei perossidi come H₂O₂, l\'ossigeno possiede numero di ossidazione -1. In presenza di un ossidante forte come il permanganato, l\'acqua ossigenata viene forzata ad ossidarsi a ossigeno gassoso molecolare O₂ (n.o. = 0).',
      halfReactionSteps: [
        {
          step: 1,
          title: 'Semireazioni',
          text: '• Ossidazione di H₂O₂ (O a -1 passa a 0 in O₂): H₂O₂ &rarr; O₂<br>' +
                '• Riduzione di MnO₄⁻: MnO₄⁻ &rarr; Mn²⁺',
          ox: 'H₂O₂ &rarr; O₂',
          red: 'MnO₄⁻ &rarr; Mn²⁺'
        },
        {
          step: 2,
          title: 'Bilanciamento con H⁺ ed e⁻',
          text: '• Ossidazione: H₂O₂ &rarr; O₂ + <b>2 H⁺</b> + <b>2 e⁻</b><br>' +
                '• Riduzione: MnO₄⁻ + 8 H⁺ + <b>5 e⁻</b> &rarr; Mn²⁺ + 4 H₂O',
          ox: 'H₂O₂ &rarr; O₂ + 2 H⁺ + 2 e⁻',
          red: 'MnO₄⁻ + 8 H⁺ + 5 e⁻ &rarr; Mn²⁺ + 4 H₂O'
        },
        {
          step: 3,
          title: 'm.c.m.(2, 5) = 10',
          text: 'Moltiplichiamo l\'ossidazione per 5 e la riduzione per 2:<br>' +
                '5 H₂O₂ &rarr; 5 O₂ + 10 H⁺ + 10 e⁻<br>' +
                '2 MnO₄⁻ + 16 H⁺ + 10 e⁻ &rarr; 2 Mn²⁺ + 8 H₂O<br>' +
                'Semplificando gli ioni H⁺ (16 a sinistra - 10 a destra = 6 H⁺ a sinistra):',
          result: '<b>2 MnO₄⁻ + 5 H₂O₂ + 6 H⁺ &rarr; 2 Mn²⁺ + 5 O₂ + 8 H₂O</b>'
        }
      ],
      oxNumberSteps: [
        {
          step: 1,
          title: 'Numeri di ossidazione dell\'ossigeno',
          text: 'In H₂O₂ l\'ossigeno ha n.o. = -1. Nella molecola biatomica O₂ ha n.o. = 0.<br>' +
                'La variazione per ogni molecola di H₂O₂ è di <b>2 elettroni ceduti</b>.<br>' +
                'Il manganese passa da +7 a +2 (<b>5 elettroni acquistati</b>).'
        },
        {
          step: 2,
          title: 'Bilancio',
          text: 'm.c.m.(2, 5) = 10 &rArr; <b>5 H₂O₂</b> e <b>2 MnO₄⁻</b>.<br>' +
                'Cariche: 2(-1) + x(+1) = 2(+2) &rArr; -2 + x = +4 &rArr; x = <b>6 H⁺</b>.<br>' +
                'Idrogeni: 5(2) + 6 = 16 atomi H &rArr; <b>8 H₂O</b>.'
        }
      ],
      pitfalls: 'Assegnare all\'ossigeno in H₂O₂ il solito numero di ossidazione -2 anziché -1!'
    },
    {
      id: 'thiosulfate-iodine',
      title: 'Tiosolfato e Iodio (Iodometria)',
      subtitle: 'Formazione dello ione tetrationato S₄O₆²⁻',
      difficulty: 'Intermedio',
      category: 'Chimica Analitica',
      rawEquation: 'S2O3^2- + I2 -> S4O6^2- + I^-',
      balancedEquation: '2 S2O3^2- + I2 -> S4O6^2- + 2 I^-',
      medium: 'neutral',
      oxidant: 'I₂',
      reductant: 'S₂O₃²⁻',
      electronsExchanged: 2,
      description: 'Reazione cardine delle titolazioni iodometriche, usata per determinare quantitativamente sostanze ossidanti tramite viraggio dell\'indicatore salda d\'amido.',
      halfReactionSteps: [
        {
          step: 1,
          title: 'Semireazioni',
          text: '• Ossidazione dello zolfo: 2 S₂O₃²⁻ &rarr; S₄O₆²⁻ + 2 e⁻<br>' +
                '• Riduzione dello iodio: I₂ + 2 e⁻ &rarr; 2 I⁻',
          ox: '2 S₂O₃²⁻ &rarr; S₄O₆²⁻ + 2 e⁻',
          red: 'I₂ + 2 e⁻ &rarr; 2 I⁻'
        },
        {
          step: 2,
          title: 'Somma diretta',
          text: 'Entrambe le semireazioni scambiano esattamente 2 elettroni! Si sommano direttamente senza bisogno di H⁺, OH⁻ o H₂O.',
          result: '<b>2 S₂O₃²⁻ + I₂ &rarr; S₄O₆²⁻ + 2 I⁻</b>'
        }
      ],
      oxNumberSteps: [
        {
          step: 1,
          title: 'Numero di ossidazione medio dello zolfo',
          text: 'In S₂O₃²⁻ il n.o. medio dello zolfo è +2 (2x - 6 = -2 &rArr; x = +2).<br>' +
                'In S₄O₆²⁻ il n.o. medio è +2.5 (4x - 12 = -2 &rArr; 4x = 10 &rArr; x = +2.5).<br>' +
                'Variazione totale per 2 unità di tiosolfato (4 atomi di S) = 4 &times; 0.5 = 2 elettroni.'
        }
      ],
      pitfalls: 'Confondersi con numeri di ossidazione frazionari. Il metodo ionico-elettronico risolve il problema all\'istante senza dover calcolare il n.o. frazionario!'
    },
    {
      id: 'aluminum-nitrate-basic',
      title: 'Alluminio metallico e Nitrato in ambiente basico',
      subtitle: 'Riduzione profonda dell\'azoto a gas ammoniaca NH₃',
      difficulty: 'Avanzato',
      category: 'Ambiente Basico',
      rawEquation: 'Al + NO3^- + OH^- + H2O -> [Al(OH)4]^- + NH3',
      balancedEquation: '8 Al + 3 NO3^- + 5 OH^- + 18 H2O -> 8 [Al(OH)4]^- + 3 NH3',
      medium: 'base',
      oxidant: 'NO₃⁻',
      reductant: 'Al',
      electronsExchanged: 24,
      description: 'Test analitico per riconoscere i nitrati (saggio di Devarda): l\'alluminio in ambiente fortemente basico riduce l\'azoto da +5 (nitrato) fino a -3 (ammoniaca).',
      halfReactionSteps: [
        {
          step: 1,
          title: 'Semireazioni',
          text: '• Ossidazione di Al: Al &rarr; [Al(OH)₄]⁻ (Al passa da 0 a +3)<br>' +
                '• Riduzione di NO₃⁻: NO₃⁻ &rarr; NH₃ (N passa da +5 a -3, ben 8 elettroni!)',
          ox: 'Al + 4 OH⁻ &rarr; [Al(OH)₄]⁻ + 3 e⁻',
          red: 'NO₃⁻ + 6 H₂O + 8 e⁻ &rarr; NH₃ + 9 OH⁻'
        },
        {
          step: 2,
          title: 'm.c.m. tra 3 e 8 elettroni',
          text: 'm.c.m.(3, 8) = <b>24</b>. Moltiplichiamo l\'ossidazione per 8 e la riduzione per 3:<br>' +
                '8 Al + 32 OH⁻ &rarr; 8 [Al(OH)₄]⁻ + 24 e⁻<br>' +
                '3 NO₃⁻ + 18 H₂O + 24 e⁻ &rarr; 3 NH₃ + 27 OH⁻',
          multipliers: 'Ossidazione &times; 8  |  Riduzione &times; 3'
        },
        {
          step: 3,
          title: 'Semplificazione',
          text: '32 OH⁻ a sinistra - 27 OH⁻ a destra = <b>5 OH⁻</b> a sinistra.',
          result: '<b>8 Al + 3 NO₃⁻ + 5 OH⁻ + 18 H₂O &rarr; 8 [Al(OH)₄]⁻ + 3 NH₃</b>'
        }
      ],
      oxNumberSteps: [
        {
          step: 1,
          title: 'Scambio elettronico totale',
          text: 'Al: da 0 a +3 (&Delta; = 3). N: da +5 a -3 (&Delta; = 8).<br>' +
                'm.c.m.(3, 8) = 24 &rArr; servono <b>8 Al</b> e <b>3 NO₃⁻</b>.'
        }
      ],
      pitfalls: 'Calcolare erroneamente la variazione di n.o. per l\'azoto: passare da +5 a -3 è una variazione di 8 unità, NON di 2!'
    },
    {
      id: 'iodate-iodide-comproportionation',
      title: 'Sinproporzione di Iodato e Ioduro',
      subtitle: 'Due stati di ossidazione differenti convergono nello stesso stato (+5 e -1 &rarr; 0)',
      difficulty: 'Intermedio',
      category: 'Sinproporzione',
      rawEquation: 'IO3^- + I^- + H^+ -> I2 + H2O',
      balancedEquation: 'IO3^- + 5 I^- + 6 H^+ -> 3 I2 + 3 H2O',
      medium: 'acid',
      oxidant: 'IO₃⁻ (n.o. = +5)',
      reductant: 'I⁻ (n.o. = -1)',
      electronsExchanged: 5,
      description: 'L\'opposto della dismutazione: due specie dello stesso elemento con n.o. differente reagiscono per formare un\'unica sostanza con n.o. intermedio.',
      halfReactionSteps: [
        {
          step: 1,
          title: 'Semireazioni',
          text: '• Ossidazione dello ioduro: 2 I⁻ &rarr; I₂ + 2 e⁻<br>' +
                '• Riduzione dello iodato: 2 IO₃⁻ + 12 H⁺ + 10 e⁻ &rarr; I₂ + 6 H₂O',
          ox: '2 I⁻ &rarr; I₂ + 2 e⁻',
          red: '2 IO₃⁻ + 12 H⁺ + 10 e⁻ &rarr; I₂ + 6 H₂O'
        },
        {
          step: 2,
          title: 'm.c.m. e somma',
          text: 'Moltiplichiamo l\'ossidazione per 5:<br>' +
                '10 I⁻ &rarr; 5 I₂ + 10 e⁻<br>' +
                'Sommando alla riduzione:<br>' +
                '2 IO₃⁻ + 10 I⁻ + 12 H⁺ &rarr; 6 I₂ + 6 H₂O<br>' +
                'Dividendo tutti i coefficienti per 2:',
          result: '<b>IO₃⁻ + 5 I⁻ + 6 H⁺ &rarr; 3 I₂ + 3 H₂O</b>'
        }
      ],
      oxNumberSteps: [
        {
          step: 1,
          title: 'Rapporto stechiometrico',
          text: 'IO₃⁻ (I passa da +5 a 0) acquista 5 elettroni.<br>' +
                'I⁻ (I passa da -1 a 0) perde 1 elettrone.<br>' +
                'Per pareggiare serve un rapporto 1 : 5 tra IO₃⁻ e I⁻.<br>' +
                'Totale atomi di I = 1 + 5 = 6 atomi, che formano <b>3 I₂</b>.'
        }
      ],
      pitfalls: 'Scrivere coefficienti frazionari o dimenticare di semplificare per 2.'
    }
  ];

  return {
    TUTORIAL_EQUATIONS
  };
}));
