/* =====================================================================
   Delta Group S.r.l. — livello API delle prenotazioni
   ---------------------------------------------------------------------
   QUESTO FILE È L'UNICO PUNTO DA MODIFICARE quando il gestionale/backend
   sarà pronto. La pagina prenota.html non conosce gli endpoint: usa solo
   window.DeltaPrenotazioni.getSlot() e window.DeltaPrenotazioni.crea().

   PER COLLEGARE IL BACKEND:
     1. CFG.USE_MOCK = false
     2. CFG.API_BASE = 'https://api.tuo-gestionale.it/v1'   (senza slash finale)
     3. verifica che le risposte rispettino il contratto qui sotto.

   CONTRATTO API
   -------------
   GET  {API_BASE}/slot?servizio=revisione&dal=2026-08-03&al=2026-08-08
   200  {
          "ok": true,
          "giorni": [
            { "data": "2026-08-03", "chiuso": false,
              "slot": [ { "id": "s-20260803-0800", "ora": "08:00", "posti": 2 } ] },
            { "data": "2026-08-04", "chiuso": true, "slot": [] }
          ]
        }

   POST {API_BASE}/prenotazioni
        {
          "servizio": "revisione",              // revisione | tagliando
          "slotId": "s-20260803-0800",
          "data": "2026-08-03",
          "ora": "08:00",
          "veicolo":  { "tipo":"auto", "targa":"AB123CD", "modello":"Fiat Panda",
                        "anno":2016, "alimentazione":"gpl", "km":128000 },
          "cliente":  { "nome":"Mario Rossi", "telefono":"3481234567",
                        "email":"mario@esempio.it", "note":"", "autoCortesia":false },
          "consensoPrivacy": true,
          "origine": "sito-web"
        }
   200  { "ok": true, "codice": "DG-2608-4F7A", "data": "2026-08-03", "ora": "08:00" }
   409  { "ok": false, "errore": "slot_occupato" }      → la pagina torna al passo 1
   4xx  { "ok": false, "errore": "dati_non_validi", "messaggio": "…" }

   REGOLE DI DISPONIBILITÀ (replicate nel mock, da applicare anche lato server)
     · lun–ven 08:00–12:00 e 14:00–19:00, sabato 08:00–12:00, domenica chiuso
     · revisione: 45 min, 2 posti in parallelo
     · tagliando/officina: 90 min, 1 posto
     · preavviso minimo 24 h, orizzonte massimo 60 giorni
     · CHIUSURE: date singole (ferie, festivi) sempre non prenotabili
   ===================================================================== */
(function () {
  'use strict';

  var CFG = {
    USE_MOCK: true,
    API_BASE: '',
    ENDPOINT_SLOT: '/slot',
    ENDPOINT_PRENOTAZIONI: '/prenotazioni',
    TIMEOUT_MS: 12000
  };

  var SERVIZI = {
    revisione: { label: 'Revisione', durata: 45, posti: 2 },
    tagliando: { label: 'Tagliando / officina', durata: 90, posti: 1 }
  };

  /* 0 = domenica … 6 = sabato */
  var ORARI = {
    0: [],
    1: [['08:00', '12:00'], ['14:00', '19:00']],
    2: [['08:00', '12:00'], ['14:00', '19:00']],
    3: [['08:00', '12:00'], ['14:00', '19:00']],
    4: [['08:00', '12:00'], ['14:00', '19:00']],
    5: [['08:00', '12:00'], ['14:00', '19:00']],
    6: [['08:00', '12:00']]
  };

  /* Ferie e festivi: aggiungere le date in formato AAAA-MM-GG */
  var CHIUSURE = ['2026-08-15', '2026-08-16', '2026-12-25', '2026-12-26', '2027-01-01'];

  var PREAVVISO_ORE = 24;
  var ORIZZONTE_GIORNI = 60;

  /* ---------- utilità ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(dt) { return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()); }
  function daIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function minuti(hhmm) { var p = hhmm.split(':'); return (+p[0]) * 60 + (+p[1]); }
  function oraDaMinuti(m) { return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }

  /* occupazione finta ma stabile: la stessa data/ora dà sempre lo stesso esito */
  function hash(s) {
    var h = 2166136261, i;
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h;
  }

  function fetchJson(url, opts) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var t = ctrl ? setTimeout(function () { ctrl.abort(); }, CFG.TIMEOUT_MS) : null;
    opts = opts || {};
    if (ctrl) opts.signal = ctrl.signal;
    return fetch(url, opts).then(function (r) {
      if (t) clearTimeout(t);
      return r.json().then(function (j) {
        if (!r.ok && j && j.errore) return j;
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return j;
      });
    });
  }

  /* ---------- MOCK ---------- */
  function slotMock(servizio, dal, al) {
    var cfg = SERVIZI[servizio] || SERVIZI.revisione;
    var giorni = [];
    var d = daIso(dal), fine = daIso(al);
    var limite = new Date(Date.now() + PREAVVISO_ORE * 3600e3);
    var maxData = new Date(Date.now() + ORIZZONTE_GIORNI * 86400e3);

    while (d <= fine) {
      var data = iso(d);
      var fasce = ORARI[d.getDay()] || [];
      var chiuso = fasce.length === 0 || CHIUSURE.indexOf(data) !== -1 || d > maxData;
      var slot = [];
      if (!chiuso) {
        for (var f = 0; f < fasce.length; f++) {
          var da = minuti(fasce[f][0]), a = minuti(fasce[f][1]);
          for (var m = da; m + cfg.durata <= a; m += cfg.durata) {
            var ora = oraDaMinuti(m);
            var quando = new Date(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(m / 60), m % 60);
            if (quando < limite) continue;
            var h = hash(servizio + data + ora);
            var occupati = h % (cfg.posti + 1);
            var posti = Math.max(0, cfg.posti - occupati);
            if (posti > 0) slot.push({ id: 's-' + data.replace(/-/g, '') + '-' + ora.replace(':', ''), ora: ora, posti: posti });
          }
        }
      }
      giorni.push({ data: data, chiuso: chiuso, slot: slot });
      d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    }
    return { ok: true, giorni: giorni };
  }

  function creaMock(payload) {
    var seme = hash(payload.slotId + (payload.veicolo && payload.veicolo.targa || '')).toString(16).toUpperCase();
    var d = daIso(payload.data);
    var codice = 'DG-' + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + '-' + seme.slice(0, 4);
    return { ok: true, codice: codice, data: payload.data, ora: payload.ora, servizio: payload.servizio };
  }

  function ritarda(valore, ms) {
    return new Promise(function (res) { setTimeout(function () { res(valore); }, ms); });
  }

  /* ---------- API pubblica ---------- */
  function getSlot(params) {
    if (CFG.USE_MOCK) return ritarda(slotMock(params.servizio, params.dal, params.al), 420);
    var url = CFG.API_BASE + CFG.ENDPOINT_SLOT +
      '?servizio=' + encodeURIComponent(params.servizio) +
      '&dal=' + encodeURIComponent(params.dal) +
      '&al=' + encodeURIComponent(params.al);
    return fetchJson(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
  }

  function crea(payload) {
    if (CFG.USE_MOCK) return ritarda(creaMock(payload), 700);
    return fetchJson(CFG.API_BASE + CFG.ENDPOINT_PRENOTAZIONI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  window.DeltaPrenotazioni = {
    config: CFG,
    servizi: SERVIZI,
    orari: ORARI,
    chiusure: CHIUSURE,
    orizzonteGiorni: ORIZZONTE_GIORNI,
    preavvisoOre: PREAVVISO_ORE,
    getSlot: getSlot,
    crea: crea
  };
})();
