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
      var show = y > barFrom;
      bar.classList.toggle('is-visible', show);
      d.body.classList.toggle('has-actionbar', show);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    barFrom = hero ? Math.max(320, hero.offsetHeight - 240) : 220;
    onScroll();
  });
  onScroll();

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

  /* ---------- Menu ancore: voce attiva ---------- */
  var anchors = qa('.anchor-scroll a');
  if (anchors.length && 'IntersectionObserver' in window) {
    var map = {};
    anchors.forEach(function (a) { var t = q(a.getAttribute('href')); if (t) map[t.id] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          anchors.forEach(function (a) { a.classList.remove('is-active'); });
          map[en.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(d.getElementById(id)); });
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
  else if (banner) banner.hidden = false;
  function salva(v) { try { localStorage.setItem(KEY, v); } catch (e) {} if (banner) banner.hidden = true; }
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
