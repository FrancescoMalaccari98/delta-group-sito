/* Delta Group S.r.l. — logica della pagina prenota.html
   Gli endpoint stanno in prenota-api.js: qui solo interfaccia e validazione. */
(function () {
  'use strict';
  var API = window.DeltaPrenotazioni;
  if (!API) return;

  var d = document;
  var q = function (s, c) { return (c || d).querySelector(s); };
  var qa = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  var GIORNI = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'];
  var GIORNI_L = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(dt) { return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()); }
  function daIso(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function piuGiorni(dt, n) { return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n); }
  function primoDelMese(dt) { return new Date(dt.getFullYear(), dt.getMonth(), 1); }
  function ultimoDelMese(dt) { return new Date(dt.getFullYear(), dt.getMonth() + 1, 0); }
  function piuMesi(dt, n) { return new Date(dt.getFullYear(), dt.getMonth() + n, 1); }
  function stessoMese(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth(); }

  var stato = {
    servizio: 'revisione',
    mese: primoDelMese(new Date()),
    giorni: [],
    data: null,
    slotId: null,
    ora: null,
    inCorso: false,
    salti: 0,
    primoCaricamento: true,
    seq: 0
  };

  var el = {
    steps: qa('.step'),
    step1: q('#step1'), step2: q('#step2'), step3: q('#step3'),
    calLabel: q('#calLabel'), calPrev: q('#calPrev'), calNext: q('#calNext'),
    days: q('#days'), slots: q('#slots'), slotCard: q('#slotCard'),
    toStep2: q('#toStep2'), step1Msg: q('#step1Msg'),
    recapServ: q('#recapServ'), recapWhen: q('#recapWhen'), backTo1: q('#backTo1'),
    form: q('#bkForm'), formMsg: q('#formMsg'), submit: q('#bkSubmit'),
    okWhen: q('#okWhen'), okList: q('#okList'), okTitle: q('#okTitle'),
    fieldKm: q('#fieldKm')
  };

  /* ---------- passi ---------- */
  function vaiAlPasso(n) {
    el.step1.hidden = n !== 1;
    el.step2.hidden = n !== 2;
    el.step3.hidden = n !== 3;
    el.steps.forEach(function (s, i) {
      s.classList.toggle('is-current', i === n - 1);
      s.classList.toggle('is-done', i < n - 1);
    });
    var top = q('#bk').getBoundingClientRect().top + window.pageYOffset - 70;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  /* ---------- mese e giorni ---------- */
  /* ultimo mese sfogliabile: deriva dall'orizzonte dell'API, non da un numero fisso */
  function meseMax() {
    var giorni = API.orizzonteGiorni || 60;
    return primoDelMese(new Date(Date.now() + giorni * 86400000));
  }

  function etichettaMese() {
    el.calLabel.textContent = MESI[stato.mese.getMonth()] + ' ' + stato.mese.getFullYear();
    el.calPrev.disabled = stessoMese(stato.mese, new Date());
    el.calNext.disabled = stato.mese >= meseMax();
  }

  function celle() {
    el.days.innerHTML = '';
    var ultimo = ultimoDelMese(stato.mese);
    var offset = (primoDelMese(stato.mese).getDay() + 6) % 7;   /* lunedì = 0 */
    var i, b, v;
    for (i = 0; i < offset; i++) {
      v = d.createElement('span'); v.className = 'cal-blank'; v.setAttribute('aria-hidden', 'true');
      el.days.appendChild(v);
    }
    for (i = 1; i <= ultimo.getDate(); i++) {
      b = d.createElement('button');
      b.type = 'button';
      b.className = 'cal-day is-load';
      b.disabled = true;
      b.setAttribute('data-data', iso(new Date(stato.mese.getFullYear(), stato.mese.getMonth(), i)));
      b.innerHTML = '<b>' + i + '</b><i></i>';
      el.days.appendChild(b);
    }
  }

  function disegnaMese() {
    stato.giorni.forEach(function (g) {
      var b = q('.cal-day[data-data="' + g.data + '"]', el.days);
      if (!b) return;
      var dt = daIso(g.data), liberi = g.slot.length;
      b.classList.remove('is-load');
      b.disabled = g.chiuso || !liberi;
      b.classList.toggle('is-off', b.disabled);
      b.classList.toggle('is-on', g.data === stato.data);
      b.setAttribute('aria-label', GIORNI_L[dt.getDay()] + ' ' + dt.getDate() + ' ' + MESI[dt.getMonth()] +
        (g.chiuso ? ', chiuso' : liberi ? ', ' + liberi + ' orari disponibili' : ', nessun orario disponibile'));
      q('i', b).className = liberi ? 'has-free' : '';
      if (!b.disabled) b.addEventListener('click', function () { scegliGiorno(g.data); });
    });
    /* giorni passati o oltre l'orizzonte: restano spenti */
    qa('.cal-day.is-load', el.days).forEach(function (b) {
      b.classList.remove('is-load'); b.classList.add('is-off'); b.disabled = true;
    });
  }

  function caricaMese(mantieni) {
    var mio = ++stato.seq;               /* solo l'ultima richiesta può scrivere */
    stato.inCorso = true;
    if (!mantieni) stato.data = null;
    /* gli orari appartengono sempre alla richiesta in corso: si azzerano subito */
    stato.slotId = null; stato.ora = null;
    el.slots.innerHTML = '';
    el.slotCard.hidden = true;
    aggiornaContinua();
    etichettaMese();
    celle();
    var oggi = new Date();
    var inizio = stessoMese(stato.mese, oggi) ? oggi : primoDelMese(stato.mese);
    API.getSlot({ servizio: stato.servizio, dal: iso(inizio), al: iso(ultimoDelMese(stato.mese)) }).then(function (r) {
      if (mio !== stato.seq) return;
      stato.inCorso = false;
      if (!r || !r.ok) return erroreSlot();
      stato.giorni = r.giorni || [];
      var primo = null, i;
      for (i = 0; i < stato.giorni.length; i++) {
        if (!stato.giorni[i].chiuso && stato.giorni[i].slot.length) { primo = stato.giorni[i].data; break; }
      }
      /* solo al primo caricamento: apri sul primo mese con disponibilità, entro l'orizzonte */
      if (!primo && stato.primoCaricamento && stato.salti < 12 && stato.mese < meseMax()) {
        stato.salti++;
        stato.mese = piuMesi(stato.mese, 1);
        caricaMese(false);
        return;
      }
      stato.salti = 0;
      stato.primoCaricamento = false;
      disegnaMese();
      el.slotCard.hidden = !primo && !stato.data;
      el.step1Msg.hidden = !!primo;
      if (!primo) {
        el.step1Msg.textContent = stato.mese < meseMax()
          ? 'Nessuna disponibilità in questo mese: prova il mese successivo.'
          : 'Non ci sono altre date prenotabili online. Chiamaci allo 0733 815450 e troviamo posto.';
      }
      if (stato.data && trovaGiorno(stato.data)) scegliGiorno(stato.data, true);
      else if (primo) scegliGiorno(primo, true);
    }).catch(function () { if (mio !== stato.seq) return; stato.inCorso = false; erroreSlot(); });
  }

  function erroreSlot() {
    el.slotCard.hidden = true;
    el.step1Msg.hidden = false;
    el.step1Msg.textContent = 'Non riesco a caricare le disponibilità. Riprova o chiamaci allo 0733 815450.';
  }

  function trovaGiorno(data) {
    for (var i = 0; i < stato.giorni.length; i++) if (stato.giorni[i].data === data) return stato.giorni[i];
    return null;
  }

  /* ---------- slot ---------- */
  function scegliGiorno(data, silenzioso) {
    var g = trovaGiorno(data);
    if (!g || g.chiuso || !g.slot.length) return;
    stato.data = data;
    stato.slotId = null; stato.ora = null;
    aggiornaContinua();
    qa('.cal-day', el.days).forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-data') === data); });
    var dt = daIso(data);
    q('#slotLab').textContent = 'ORARI · ' + GIORNI_L[dt.getDay()].toUpperCase() + ' ' + dt.getDate() + ' ' + MESI[dt.getMonth()].toUpperCase();
    el.slots.innerHTML = '';
    g.slot.forEach(function (s) {
      var b = d.createElement('button');
      b.type = 'button';
      b.className = 'slot';
      b.textContent = s.ora;
      if (s.posti === 1) b.title = 'Ultimo posto disponibile';
      b.addEventListener('click', function () {
        stato.slotId = s.id; stato.ora = s.ora;
        qa('.slot', el.slots).forEach(function (x) { x.classList.remove('is-on'); });
        b.classList.add('is-on');
        aggiornaContinua();
      });
      el.slots.appendChild(b);
    });
    el.slotCard.hidden = false;
    if (!silenzioso) {
      var top = el.slotCard.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  }

  function aggiornaContinua() { el.toStep2.disabled = !(stato.data && stato.slotId); }

  /* ---------- servizio ---------- */
  qa('.seg-opt').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.classList.contains('is-on')) return;
      qa('.seg-opt').forEach(function (x) { x.classList.remove('is-on'); x.setAttribute('aria-checked', 'false'); });
      b.classList.add('is-on'); b.setAttribute('aria-checked', 'true');
      stato.servizio = b.getAttribute('data-serv');
      stato.primoCaricamento = true;
      stato.salti = 0;
      stato.mese = primoDelMese(new Date());   /* si riparte dal mese corrente */
      caricaMese(false);
    });
  });

  el.calPrev.addEventListener('click', function () {
    var p = piuMesi(stato.mese, -1);
    if (p < primoDelMese(new Date())) return;
    stato.mese = p; caricaMese(false);
  });
  el.calNext.addEventListener('click', function () {
    if (stato.mese >= meseMax()) return;
    stato.mese = piuMesi(stato.mese, 1); caricaMese(false);
  });

  /* ---------- passo 2 ---------- */
  function quandoTesto() {
    if (!stato.data) return '—';
    var dt = daIso(stato.data);
    return GIORNI_L[dt.getDay()] + ' ' + dt.getDate() + ' ' + MESI[dt.getMonth()] + ' · ore ' + stato.ora;
  }

  el.toStep2.addEventListener('click', function () {
    el.recapServ.textContent = API.servizi[stato.servizio].label;
    el.recapWhen.textContent = quandoTesto();
    vaiAlPasso(2);
  });
  el.backTo1.addEventListener('click', function () { vaiAlPasso(1); });

  /* ---------- validazione ---------- */
  var RE_TARGA = /^[A-Z]{2}\s?[0-9]{3}\s?[A-Z]{2}$|^[A-Z]{2}\s?[0-9]{5}$|^[A-Z0-9]{5,8}$/;
  var RE_TEL = /^[+0-9][0-9 .\-]{7,17}$/;
  var RE_MAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function segna(nome, ko) {
    var campo = q('#' + nome), err = q('[data-err="' + nome + '"]');
    if (campo && campo.closest('.field')) campo.closest('.field').classList.toggle('has-error', ko);
    if (err) err.hidden = !ko;
    return !ko;
  }

  function valida() {
    var v = q('#targa').value.trim().toUpperCase();
    var ok = segna('targa', !RE_TARGA.test(v));
    ok = segna('modello', q('#modello').value.trim().length < 2) && ok;
    var anno = +q('#anno').value;
    ok = segna('anno', !(anno >= 1950 && anno <= new Date().getFullYear() + 1)) && ok;
    ok = segna('nome', q('#nome').value.trim().length < 3) && ok;
    ok = segna('tel', !RE_TEL.test(q('#tel').value.trim())) && ok;
    ok = segna('email', !RE_MAIL.test(q('#email').value.trim())) && ok;
    var pv = q('#privacy');
    var errPv = q('[data-err="privacy"]');
    errPv.hidden = pv.checked;
    if (!pv.checked) ok = false;
    return ok;
  }

  /* ---------- invio ---------- */
  el.form.addEventListener('submit', function (e) {
    e.preventDefault();
    el.formMsg.hidden = true;
    if (!stato.data || !stato.slotId || !stato.ora) {
      el.formMsg.hidden = false;
      el.formMsg.textContent = 'Scegli di nuovo giorno e orario: la disponibilità è cambiata.';
      vaiAlPasso(1);
      return;
    }
    if (!valida()) {
      var primo = q('.field.has-error input, .field.has-error select');
      if (primo) primo.focus();
      return;
    }
    var payload = {
      servizio: stato.servizio,
      slotId: stato.slotId,
      data: stato.data,
      ora: stato.ora,
      veicolo: {
        tipo: q('#tipo').value,
        targa: q('#targa').value.trim().toUpperCase().replace(/\s+/g, ''),
        modello: q('#modello').value.trim(),
        anno: +q('#anno').value,
        alimentazione: q('#alimentazione').value,
        km: q('#km').value ? +q('#km').value : null
      },
      cliente: {
        nome: q('#nome').value.trim(),
        telefono: q('#tel').value.trim(),
        email: q('#email').value.trim(),
        note: q('#note').value.trim(),
        autoCortesia: q('#cortesia').checked
      },
      consensoPrivacy: true,
      origine: 'sito-web'
    };
    el.submit.disabled = true;
    el.submit.textContent = 'Invio in corso…';
    API.crea(payload).then(function (r) {
      el.submit.disabled = false;
      el.submit.textContent = 'Conferma prenotazione';
      if (r && r.ok) { mostraConferma(r, payload); return; }
      if (r && r.errore === 'slot_occupato') {
        el.step1Msg.hidden = false;
        el.step1Msg.textContent = 'Quell\'orario è stato appena prenotato da qualcun altro. Scegline un altro.';
        stato.slotId = null; stato.ora = null;
        caricaMese(true);
        vaiAlPasso(1);
        return;
      }
      el.formMsg.hidden = false;
      el.formMsg.textContent = (r && r.messaggio) || 'Non è stato possibile confermare la prenotazione. Chiamaci allo 0733 815450.';
    }).catch(function () {
      el.submit.disabled = false;
      el.submit.textContent = 'Conferma prenotazione';
      el.formMsg.hidden = false;
      el.formMsg.textContent = 'Connessione non riuscita. Riprova o chiamaci allo 0733 815450.';
    });
  });

  /* ---------- conferma ---------- */
  function mostraConferma(r, payload) {
    var dt = daIso(stato.data);
    el.okTitle.textContent = 'Ti aspettiamo ' + GIORNI_L[dt.getDay()];
    el.okWhen.textContent = API.servizi[stato.servizio].label + ' · ' + quandoTesto();
    var righe = [
      ['Veicolo', payload.veicolo.modello + ' · ' + payload.veicolo.targa],
      ['Alimentazione', payload.veicolo.alimentazione],
      ['Intestatario', payload.cliente.nome],
      ['Telefono', payload.cliente.telefono],
      ['E-mail', payload.cliente.email]
    ];
    if (payload.cliente.autoCortesia) righe.push(['Auto di cortesia', 'richiesta']);
    if (payload.cliente.note) righe.push(['Note', payload.cliente.note]);
    el.okList.innerHTML = righe.map(function (r2) {
      return '<div><dt>' + r2[0] + '</dt><dd>' + r2[1].replace(/</g, '&lt;') + '</dd></div>';
    }).join('');
    vaiAlPasso(3);
  }

  /* ---------- avvio ---------- */
  caricaMese(false);
})();
