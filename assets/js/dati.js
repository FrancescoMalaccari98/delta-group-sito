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

  /* Ferie e festivi: aggiungere le date in formato AAAA-MM-GG.
     Da rivedere ogni anno: le date passate si possono togliere. */
  var CHIUSURE = [
    '2026-08-14', '2026-08-15', '2026-08-16',
    '2026-12-24', '2026-12-25', '2026-12-26', '2026-12-31',
    '2027-01-01', '2027-01-06', '2027-04-25', '2027-05-01', '2027-06-02', '2027-08-15'
  ];

  window.DeltaDati = {
    ORARI: ORARI,
    CHIUSURE: CHIUSURE,
    tel: '+390733815450',
    telTesto: '0733 815450',
    whatsapp: '393487619808',
    whatsappTesto: '348 761 9808',
    email: 'info@delta-group.it',
    /* durata e posti in parallelo per tipo di lavorazione */
    servizi: {
      revisione: { label: 'Revisione', durata: 45, posti: 2 },
      tagliando: { label: 'Tagliando / officina', durata: 90, posti: 1 }
    },
    preavvisoOre: 24,
    orizzonteGiorni: 60
  };
})();
