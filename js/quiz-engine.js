/**
 * quiz-engine.js
 * Modulo per esercitazioni interattive e autoverifica per studenti
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.QuizEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  const QUIZ_QUESTIONS = [
    {
      id: 'q1',
      title: 'Identificazione dell\'ossidante',
      question: 'Nella reazione: <br><span class="chem-formula">MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ &rarr; Mn²⁺ + 5 Fe³⁺ + 4 H₂O</span><br>Qual è la specie chimica che agisce da <b>ossidante</b>?',
      options: [
        { text: 'MnO₄⁻ (lo ione permanganato si riduce, acquistando elettroni)', correct: true },
        { text: 'Fe²⁺ (lo ione ferroso si ossida a Fe³⁺)', correct: false },
        { text: 'H⁺ (gli ioni idrogeno)', correct: false },
        { text: 'Mn²⁺ (lo ione manganese ridotto)', correct: false }
      ],
      explanation: 'L\'agente ossidante è la specie che provoca l\'ossidazione di un\'altra sostanza, riducendosi essa stessa. MnO₄⁻ acquista 5 elettroni passando da n.o. +7 a +2, quindi è l\'ossidante.'
    },
    {
      id: 'q2',
      title: 'Numero di ossidazione del cromo',
      question: 'Qual è il numero di ossidazione del cromo nello ione dicromato <b>Cr₂O₇²⁻</b>?',
      options: [
        { text: '+6', correct: true },
        { text: '+3', correct: false },
        { text: '+7', correct: false },
        { text: '+12', correct: false }
      ],
      explanation: 'Ogni ossigeno ha n.o. = -2. L\'equazione algebrica è: 2·x + 7(-2) = -2 &rArr; 2x - 14 = -2 &rArr; 2x = +12 &rArr; x = +6.'
    },
    {
      id: 'q3',
      title: 'Elettroni scambiati nella riduzione del bicromato',
      question: 'Quanti elettroni vengono acquistati complessivamente da <b>una unità di Cr₂O₇²⁻</b> per ridursi a 2 Cr³⁺?',
      options: [
        { text: '6 elettroni (3 e⁻ per ciascuno dei 2 atomi di cromo)', correct: true },
        { text: '3 elettroni', correct: false },
        { text: '7 elettroni', correct: false },
        { text: '14 elettroni', correct: false }
      ],
      explanation: 'Ogni atomo di cromo passa da +6 a +3, acquistando 3 elettroni. Poiché nella formula Cr₂O₇²⁻ ci sono due atomi di Cr, il totale di elettroni scambiati è 2 &times; 3 = 6 e⁻.'
    },
    {
      id: 'q4',
      title: 'Bilanciamento in ambiente basico',
      question: 'Nel metodo delle semireazioni in <b>ambiente basico</b>, per bilanciare 4 atomi di ossigeno in eccesso su un membro dell\'equazione:',
      options: [
        { text: 'Si può bilanciare con H⁺ e H₂O e poi aggiungere tanti OH⁻ ad ambo i membri quanti sono gli H⁺ presenti', correct: true },
        { text: 'Si aggiungono semplicemente ioni H⁺ e si ignora l\'ambiente', correct: false },
        { text: 'Si aggiunge gas O₂ elementare', correct: false },
        { text: 'Non è possibile bilanciare in ambiente basico', correct: false }
      ],
      explanation: 'La regola aurea per l\'ambiente basico consiste nel bilanciare inizialmente come in ambiente acido (H⁺ e H₂O) e successivamente neutralizzare gli H⁺ sommando un pari numero di OH⁻ a entrambi i membri, formando molecole di H₂O.'
    },
    {
      id: 'q5',
      title: 'Cos\'è una dismutazione (disproporzione)?',
      question: 'Quale delle seguenti reazioni rappresenta una reazione di <b>dismutazione</b>?',
      options: [
        { text: 'Cl₂ + 2 OH⁻ &rarr; Cl⁻ + ClO⁻ + H₂O', correct: true },
        { text: 'Zn + 2 HCl &rarr; ZnCl₂ + H₂', correct: false },
        { text: 'CH₄ + 2 O₂ &rarr; CO₂ + 2 H₂O', correct: false },
        { text: 'Ag⁺ + Cl⁻ &rarr; AgCl', correct: false }
      ],
      explanation: 'Nella reazione del cloro in ambiente basico a freddo, il cloro elementare (n.o. = 0) si riduce a cloruro (n.o. = -1) e contemporaneamente si ossida a ipoclorito (n.o. = +1). Uno stesso elemento si ossida e si riduce simultaneamente.'
    },
    {
      id: 'q6',
      title: 'Numero di ossidazione in H₂O₂',
      question: 'Nel perossido di idrogeno (<b>H₂O₂</b>, acqua ossigenata), qual è il numero di ossidazione dell\'ossigeno?',
      options: [
        { text: '-1', correct: true },
        { text: '-2', correct: false },
        { text: '0', correct: false },
        { text: '+1', correct: false }
      ],
      explanation: 'In tutti i perossidi contenenti il legame a ponte −O−O−, ciascun atomo di ossigeno ha numero di ossidazione -1, poiché il legame omopolare O-O non comporta spostamento di elettroni tra i due atomi.'
    }
  ];

  return {
    QUIZ_QUESTIONS
  };
}));
