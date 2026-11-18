/* =====================================================================
   Delta Group S.r.l. — pagina Tagliando: spesa indicativa per cilindrata
   Fasce e prezzi stanno in assets/js/dati.js (DeltaDati.tagliando).
   Caricare dopo dati.js e main.js.
   ===================================================================== */
(function (root) {
  'use strict';

  var MIN_CC = 50, MAX_CC = 8000;
  var NOMI = { completo: 'tagliando completo', intermedio: 'tagliando intermedio' };

  /* 1400 → «1.400» */
  function migliaia(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

  /* Legge la cilindrata scritta dall'utente: accetta «1400», «1.400», «1 400», «1400 cc». */
  function validaCc(testo) {
    var s = String(testo == null ? '' : testo).toLowerCase().replace(/cc/g, '').replace(/\s/g, '');
    if (!s) return { ok: false, errore: 'vuoto' };
    /* il punto vale solo come separatore delle migliaia («1.400»): «1.6» o «1.60» (litri) sono errori */
    if (s.indexOf('.') > -1) {
      if (!/^\d{1,3}(\.\d{3})+$/.test(s)) return { ok: false, errore: 'non_valido' };
      s = s.replace(/\./g, '');
    }
    if (!/^\d+$/.test(s)) return { ok: false, errore: 'non_valido' };
    var cc = parseInt(s, 10);
    if (cc < MIN_CC || cc > MAX_CC) return { ok: false, errore: 'fuori_intervallo' };
    return { ok: true, cc: cc };
  }

  /* Indice della prima fascia il cui limite contiene la cilindrata (null = oltre). */
  function fasciaPer(cc, fasce) {
    for (var i = 0; i < fasce.length; i++) {
      if (fasce[i] === null || cc <= fasce[i]) return i;
    }
    return fasce.length - 1;
  }

  function etichettaFascia(i, fasce) {
    var max = fasce[i], prev = i > 0 ? fasce[i - 1] : null;
    if (max === null) return 'oltre ' + migliaia(prev) + ' cc';
    if (i === 0) return 'fino a ' + migliaia(max) + ' cc';
    return migliaia(prev + 1) + '–' + migliaia(max) + ' cc';
  }

  /* forchetta [min, max] in euro → «180–280 €»; senza cifre → «Prezzo su richiesta» */
  function prezzoTesto(forchetta) {
    if (!forchetta || !forchetta[0] || !forchetta[1]) return 'Prezzo su richiesta';
    return migliaia(Math.round(forchetta[0])) + '–' + migliaia(Math.round(forchetta[1])) + ' €';
  }

  function linkPrenota(pacchetto, cc) {
    return 'prenota.html?servizio=tagliando&pacchetto=' + pacchetto + (cc ? '&cc=' + cc : '');
  }

  function linkWhatsApp(pacchetto, cc, numero) {
    var testo = 'Salve, vorrei un preventivo per il ' + NOMI[pacchetto] + '.' +
      (cc ? ' Cilindrata: ' + migliaia(cc) + ' cc.' : '') + ' Modello e anno: ';
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(testo);
  }

  var api = {
    validaCc: validaCc, fasciaPer: fasciaPer, etichettaFascia: etichettaFascia,
    prezzoTesto: prezzoTesto, linkPrenota: linkPrenota, linkWhatsApp: linkWhatsApp,
    migliaia: migliaia
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.DeltaTagliando = api;

  /* ---------- collegamento alla pagina ----------
     Senza JavaScript il campo cilindrata resta nascosto e le card mostrano
     «Prezzo in base alla cilindrata» con Prenota funzionante. */
  if (typeof document === 'undefined') return;
  var ERRORI = {
    non_valido: 'Scrivi solo il numero dei cc, per esempio 1400.',
    fuori_intervallo: 'Controlla il valore: la cilindrata va da 50 a 8.000 cc.'
  };

  function avvia() {
    var dati = root.DeltaDati || {};
    var cfg = dati.tagliando;
    var box = document.getElementById('calc');
    if (!box || !cfg) return;
    var input = document.getElementById('cc');
    var err = document.getElementById('ccErr');
    var fascia = document.getElementById('ccFascia');
    var numero = dati.whatsapp || '393487619808';
    var pacchetti = Array.prototype.slice.call(document.querySelectorAll('.pkg[data-pacchetto]'));

    /* conErrori: false mentre si scrive (nessun allarme su «1», «14»…),
       true all'uscita dal campo o con Invio */
    function aggiorna(conErrori) {
      var v = validaCc(input.value);
      var errore = conErrori && !v.ok && v.errore !== 'vuoto';
      var cc = v.ok ? v.cc : null;
      var i = cc ? fasciaPer(cc, cfg.fasce) : -1;

      box.classList.toggle('has-error', errore);
      input.setAttribute('aria-invalid', errore ? 'true' : 'false');
      err.hidden = !errore;
      err.textContent = errore ? ERRORI[v.errore] : '';
      fascia.textContent = cc ? 'FASCIA ' + etichettaFascia(i, cfg.fasce).toUpperCase() : '';

      pacchetti.forEach(function (p) {
        var k = p.getAttribute('data-pacchetto');
        var forchetta = cc ? (cfg.prezzi[k] || [])[i] : null;
        p.querySelector('.pkg-prezzo').textContent = cc ? prezzoTesto(forchetta) : 'Prezzo in base alla cilindrata';
        p.querySelector('.pkg-wa').href = linkWhatsApp(k, cc, numero);
        p.querySelector('.pkg-prenota').href = linkPrenota(k, cc);
      });
    }

    /* mentre si scrive si aggiorna dopo una breve pausa: niente fasce di passaggio
       («140» verso «1400») e meno annunci ripetuti per i lettori di schermo */
    var attesa = null;
    box.hidden = false;
    input.addEventListener('input', function () {
      clearTimeout(attesa);
      attesa = setTimeout(function () { aggiorna(false); }, 400);
    });
    input.addEventListener('change', function () { clearTimeout(attesa); aggiorna(true); });
    aggiorna(false);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia);
  else avvia();
})(typeof window !== 'undefined' ? window : null);
