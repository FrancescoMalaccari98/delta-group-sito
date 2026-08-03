/* Delta Group S.r.l. — comportamenti di pagina
   Nessuna dipendenza esterna. Caricato con defer. */
(function () {
  'use strict';
  var d = document;
  var q = function (s, r) { return (r || d).querySelector(s); };
  var qa = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };

  /* ---------- Header: stato dopo lo scroll ---------- */
  var header = q('#siteHeader');
  var bar = q('#actionbar');
  var hero = q('.hero');
  var barFrom = hero ? Math.max(320, hero.offsetHeight - 240) : 220;

  function onScroll() {
    var y = window.pageYOffset || d.documentElement.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (bar) {
      var show = y > barFrom || d.body.classList.contains('has-cookie');
      bar.classList.toggle('is-visible', show);
      d.body.classList.toggle('has-actionbar', show);
      if (show) misuraBarra();
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    barFrom = hero ? Math.max(320, hero.offsetHeight - 240) : 220;
    onScroll();
  });
  onScroll();

  function misuraBarra() {
    if (!bar) return;
    var hh = bar.offsetHeight;   /* 0 da desktop: la barra è display:none */
    /* si scrive una sola misura valida: così la fascia cookie non si sposta più */
    if (hh > 0) d.documentElement.style.setProperty('--ab-h', hh + 'px');
  }
  window.addEventListener('load', misuraBarra);
  window.addEventListener('resize', misuraBarra);

  /* Campi in compilazione: la barra azioni non copre la tastiera */
  var timerDigita = null;
  function campoTesto(t) {
    return t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) &&
      !/^(checkbox|radio|button|submit|reset)$/i.test(t.type || '');
  }
  d.addEventListener('focusin', function (e) {
    if (!campoTesto(e.target)) return;
    if (timerDigita) { clearTimeout(timerDigita); timerDigita = null; }
    d.body.classList.add('is-typing');
  });
  d.addEventListener('focusout', function (e) {
    if (!campoTesto(e.target)) return;
    timerDigita = setTimeout(function () {
      if (!campoTesto(d.activeElement)) d.body.classList.remove('is-typing');
    }, 160);
  });

  /* ---------- Menu mobile ---------- */
  var drawer = q('#drawer'), openBtn = q('#menuOpen'), closeBtn = q('#menuClose'), lastFocus = null;
  function openDrawer() {
    if (!drawer) return;
    lastFocus = d.activeElement;
    drawer.hidden = false;
    d.documentElement.style.overflow = 'hidden';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
    if (closeBtn) closeBtn.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.hidden = true;
    d.documentElement.style.overflow = '';
    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
    if (lastFocus) lastFocus.focus();
  }
  if (openBtn) openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer && !drawer.hidden) closeDrawer(); });
  qa('.drawer-nav a').forEach(function (a) { a.addEventListener('click', closeDrawer); });

  /* ---------- Stato aperto / chiuso ---------- */
  /* Orari: lun-ven 08:00-12:00 e 14:00-19:00, sab 08:00-12:00, dom chiuso. */
  var ORARI = { 1: [[480, 720], [840, 1140]], 2: [[480, 720], [840, 1140]], 3: [[480, 720], [840, 1140]], 4: [[480, 720], [840, 1140]], 5: [[480, 720], [840, 1140]], 6: [[480, 720]] };
  function hhmm(min) { var h = Math.floor(min / 60), m = min % 60; return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
  function stato() {
    var now = new Date(), g = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    var oggi = ORARI[g] || [];
    for (var i = 0; i < oggi.length; i++) {
      if (m >= oggi[i][0] && m < oggi[i][1]) return { aperto: true, testo: 'Aperto ora · chiude alle ' + hhmm(oggi[i][1]) };
    }
    for (var j = 0; j < oggi.length; j++) {
      if (m < oggi[j][0]) return { aperto: false, testo: 'Chiuso · apre alle ' + hhmm(oggi[j][0]) };
    }
    var k = 1;
    while (k < 8) {
      var gg = (g + k) % 7;
      if (ORARI[gg]) {
        var nomi = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
        var quando = k === 1 ? 'domani' : nomi[gg];
        return { aperto: false, testo: 'Chiuso · apre ' + quando + ' alle ' + hhmm(ORARI[gg][0][0]) };
      }
      k++;
    }
    return null;
  }
  var badge = q('#statusBadge');
  if (badge) {
    var s = stato();
    if (s) {
      q('.txt', badge).textContent = s.testo;
      badge.classList.toggle('is-closed', !s.aperto);
      badge.hidden = false;
    }
  }

  /* ---------- Orari: evidenzia il giorno corrente ---------- */
  qa('.hour-row[data-day]').forEach(function (row) {
    var g = new Date().getDay(), spec = row.getAttribute('data-day'), on = false;
    if (spec.indexOf('-') > -1) { var p = spec.split('-'); on = g >= +p[0] && g <= +p[1]; }
    else { on = g === +spec; }
    var chip = q('.today', row);
    if (on && chip) chip.hidden = false;
  });

  /* ---------- Schede dei servizi ----------
     Una sola sezione visibile per volta. Di default GPL e metano.
     L'indirizzo mantiene #revisioni, #officina ecc., quindi i link dalla home funzionano. */
  var tabs = qa('.anchor-scroll a');
  if (tabs.length) {
    var ids = tabs.map(function (a) { return (a.getAttribute('href') || '').replace('#', ''); });
    var panels = ids.map(function (id) { return d.getElementById(id); });
    var ancora = q('.anchor-nav');

    function mostra(id, vaiSu) {
      if (ids.indexOf(id) === -1) id = ids[0];
      panels.forEach(function (p, i) { if (p) p.hidden = ids[i] !== id; });
      /* la scheda mostrata è subito leggibile: niente attesa dell'animazione di comparsa */
      var att0 = panels[ids.indexOf(id)];
      if (att0) qa('.reveal', att0).forEach(function (el) { el.classList.add('is-in'); });
      tabs.forEach(function (a, i) { a.classList.toggle('is-active', ids[i] === id); });
      var att = tabs[ids.indexOf(id)];
      if (att && att.scrollIntoViewIfNeeded) att.scrollIntoViewIfNeeded();
      if (vaiSu && ancora) {
        var hh = q('.site-header') ? q('.site-header').offsetHeight : 58;
        var y = ancora.getBoundingClientRect().top + window.pageYOffset - hh;
        window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: 'smooth' });
      }
    }

    tabs.forEach(function (a, i) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (history.replaceState) history.replaceState(null, '', '#' + ids[i]);
        mostra(ids[i], true);
      });
    });
    window.addEventListener('hashchange', function () { mostra(location.hash.replace('#', ''), true); });
    mostra((location.hash || '').replace('#', ''), false);
  }

  /* ---------- Consenso cookie e mappa ---------- */
  var KEY = 'dg-consenso';
  var MAPPA = 'https://www.google.com/maps?q=Via+Martiri+di+Belfiore+161,+62012+Civitanova+Marche+MC&output=embed';
  function caricaMappe() {
    qa('[data-map]').forEach(function (box) {
      if (q('iframe', box)) return;
      var f = d.createElement('iframe');
      f.src = MAPPA;
      f.title = 'Mappa della sede di Delta Group';
      f.loading = 'lazy';
      f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      box.appendChild(f);
      var c = q('.map-consent', box); if (c) c.style.display = 'none';
    });
  }
  var banner = q('#cookie');
  var consenso = null;
  try { consenso = localStorage.getItem(KEY); } catch (e) {}
  if (consenso === 'si') caricaMappe();
  else if (banner) {
    banner.hidden = false;
    d.body.classList.add('has-cookie');
    if (bar) { bar.classList.add('is-visible'); d.body.classList.add('has-actionbar'); misuraBarra(); }
  }
  function salva(v) { try { localStorage.setItem(KEY, v); } catch (e) {} if (banner) banner.hidden = true; d.body.classList.remove('has-cookie'); onScroll(); }
  var ok = q('#cookieOk'), no = q('#cookieNo');
  if (ok) ok.addEventListener('click', function () { salva('si'); caricaMappe(); });
  if (no) no.addEventListener('click', function () { salva('no'); });
  qa('[data-map-enable]').forEach(function (b) {
    b.addEventListener('click', function () { salva('si'); caricaMappe(); });
  });

  /* ---------- Form contatti ---------- */
  var form = q('#contactForm');
  if (form) {
    var msg = q('#formMsg');
    var mostraErrore = function (name, on) {
      var el = q('[name="' + name + '"]', form);
      var err = q('[data-err="' + name + '"]', form);
      if (el && el.closest('.field')) el.closest('.field').classList.toggle('has-error', on);
      if (err) err.hidden = !on;
    };
    form.addEventListener('submit', function (e) {
      var nome = form.nome.value.trim();
      var contatto = form.contatto.value.trim();
      var errNome = nome.length < 2;
      var errCont = contatto.length < 5;
      mostraErrore('nome', errNome);
      mostraErrore('contatto', errCont);
      if (errNome || errCont) { e.preventDefault(); (errNome ? form.nome : form.contatto).focus(); return; }

      /* Invio senza ricaricare la pagina. Se fetch non è disponibile,
         il form procede normalmente verso contatto.php. */
      if (!window.fetch) return;
      e.preventDefault();
      var btn = q('button[type="submit"]', form);
      if (btn) { btn.disabled = true; btn.textContent = 'Invio in corso…'; }
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'X-Requested-With': 'fetch' } })
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (data) {
          if (msg) {
            msg.hidden = false;
            msg.className = 'form-msg ' + (data.ok ? 'is-ok' : 'is-ko');
            msg.textContent = data.ok
              ? 'Richiesta inviata. Ti rispondiamo negli orari di apertura. Se hai urgenza, chiamaci allo 0733 815450.'
              : (data.errore || 'Invio non riuscito. Chiamaci allo 0733 815450 o scrivi a info@delta-group.it.');
          }
          if (data.ok) form.reset();
          if (btn) { btn.disabled = false; btn.textContent = 'Invia richiesta'; }
        })
        .catch(function () {
          if (msg) { msg.hidden = false; msg.className = 'form-msg is-ko'; msg.textContent = 'Invio non riuscito. Chiamaci allo 0733 815450.'; }
          if (btn) { btn.disabled = false; btn.textContent = 'Invia richiesta'; }
        });
    });
  }

  /* ---------- Comparsa progressiva ---------- */
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var targets = qa('.sec .wrap > *, .creds-grid');
    targets.forEach(function (el) { el.classList.add('reveal'); });
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); ro.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { ro.observe(el); });
  }
})();


/* ---------- Splash d'ingresso: i 3 pezzi si uniscono, poi il logo vola nell'header ---------- */
(function () {
  'use strict';
  var root = document.documentElement;
  var sp = document.getElementById('splash');
  if (!sp) return;
  if (!root.classList.contains('splashing')) { sp.remove(); return; }

  var logo = sp.querySelector('.splash-logo');
  var target = document.querySelector('.site-header .logo-img');
  var t1, t2, out = false, done = false;

  function finish() {
    if (done) return;
    done = true;
    clearTimeout(t2);
    root.classList.remove('splashing');
    if (sp.parentNode) sp.parentNode.removeChild(sp);
  }

  function fly() {
    if (out) return;
    out = true;
    clearTimeout(t1);
    if (target) {
      var a = logo.getBoundingClientRect(), b = target.getBoundingClientRect();
      if (a.width && b.width) {
        var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
        var dy = (b.top + b.height / 2) - (a.top + a.height / 2);
        logo.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + (b.width / a.width) + ')';
      }
    }
    sp.classList.add('is-out');
    t2 = setTimeout(finish, 760);
  }

  window.scrollTo(0, 0);
  t1 = setTimeout(fly, 1720);
  sp.addEventListener('click', fly);
  sp.addEventListener('touchstart', fly, { passive: true });
  window.addEventListener('keydown', fly);
  setTimeout(finish, 3800);
})();
