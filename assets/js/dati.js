/* =====================================================================
   Delta Group S.r.l. — dati dell'attività: UNICO PUNTO DA MODIFICARE
   per orari, ferie e recapiti. Lo leggono main.js e prenota-api.js.
   Caricare SEMPRE prima degli altri script.
   ===================================================================== */
(function () {
  'use strict';

  /* Orari in minuti dalla mezzanotte. 0 = domenica … 6 = sabato.
     480 = 08:00 · 720 = 12:00 · 840 = 14:00 · 1140 = 19:00 */
  var FERIALE = [[480, 720], [840, 1140]];
  var ORARI = { 0: [], 1: FERIALE, 2: FERIALE, 3: FERIALE, 4: FERIALE, 5: FERIALE, 6: [[480, 720]] };

  /* ------------------------------------------------------------------
     FERIE E CHIUSURE STRAORDINARIE — l'unico elenco da tenere aggiornato.
     Formato AAAA-MM-GG. Le date passate si possono togliere.
     ------------------------------------------------------------------ */
  var FERIE = [
    '2026-08-14', '2026-08-17',
    '2026-12-24', '2026-12-31'
  ];

  /* I festivi nazionali vengono calcolati per l'anno in corso e per il
     successivo: non c'è più un elenco che scade. */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(a, m, g) { return a + '-' + pad(m) + '-' + pad(g); }

  /* Pasqua secondo l'algoritmo di Meeus/Jones/Butcher: serve per la Pasquetta */
  function pasqua(anno) {
    var a = anno % 19, b = Math.floor(anno / 100), c = anno % 100;
    var d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    var g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    var m = Math.floor((a + 11 * h + 22 * l) / 451);
    var mese = Math.floor((h + l - 7 * m + 114) / 31);
    var giorno = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(anno, mese - 1, giorno);
  }

  function festivi(anno) {
    var fissi = [[1, 1], [1, 6], [4, 25], [5, 1], [6, 2], [8, 15], [11, 1], [12, 8], [12, 25], [12, 26]];
    var out = fissi.map(function (x) { return iso(anno, x[0], x[1]); });
    var p = pasqua(anno);
    var pasquetta = new Date(p.getFullYear(), p.getMonth(), p.getDate() + 1);
    out.push(iso(pasquetta.getFullYear(), pasquetta.getMonth() + 1, pasquetta.getDate()));
    return out;
  }

  var anno = new Date().getFullYear();
  var CHIUSURE = festivi(anno).concat(festivi(anno + 1)).concat(FERIE);

  window.DeltaDati = {
    ORARI: ORARI,
    CHIUSURE: CHIUSURE,
    ferie: FERIE,
    tel: '+390733815450',
    telTesto: '0733 815450',
    whatsapp: '393487619808',
    whatsappTesto: '348 761 9808',
    email: 'info@delta-group.it',
    /* durata in minuti e posti in parallelo per tipo di lavorazione */
    servizi: {
      revisione: { label: 'Revisione', durata: 45, posti: 2 },
      tagliando: { label: 'Tagliando / officina', durata: 90, posti: 1 }
    },
    preavvisoOre: 24,
    orizzonteGiorni: 60,

    /* ------------------------------------------------------------------
       TAGLIANDO — spesa indicativa per cilindrata (scheda Tagliando di servizi.html)
       fasce: limite superiore di ogni fascia in cc; null = «oltre».
       prezzi: forchetta [minimo, massimo] in euro interi, una per fascia,
       nello stesso ordine. Al posto di una forchetta si può scrivere null:
       quella fascia mostrerà «Prezzo su richiesta».
       ATTENZIONE: sono STIME basate sui prezzi medi di mercato per un'officina
       indipendente (fonti consultate a novembre 2026: officina.it,
       Automobile360, costorealeauto.it, cartest2016.it, espertoautoricambi.it,
       Norauto, Euromaster). Vanno confermate o sostituite dall'officina
       prima della pubblicazione online.
       ------------------------------------------------------------------ */
    tagliando: {
      fasce: [1200, 1600, 2000, 2500, null],
      prezzi: {
        completo:   [[150, 220], [180, 280], [230, 350], [280, 420], [350, 550]],
        intermedio: [[70, 110],  [80, 130],  [100, 160], [120, 190], [150, 240]]
      }
    }
  };
})();
