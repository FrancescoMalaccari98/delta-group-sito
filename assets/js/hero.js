/* =====================================================================
   Delta Group S.r.l. — hero della home: «Che cosa serve alla tua auto?»
   Ogni voce apre sotto il titolo la risposta giusta (azione e dettagli)
   e cambia la foto della hero. Senza JavaScript le voci restano link alle
   schede di servizi.html. Caricare dopo dati.js e tagliando.js.
   ===================================================================== */
(function () {
  'use strict';
  var d = document;
  var gruppo = d.querySelector('.needs');
  if (!gruppo) return;

  var voci = Array.prototype.slice.call(gruppo.querySelectorAll('.need'));
  var pannelli = Array.prototype.slice.call(d.querySelectorAll('.need-panel'));
  var cambioFoto = d.querySelector('.hero-swap');

  /* ---------- voci come pulsanti che aprono e chiudono la risposta ---------- */
  function scegli(chiave) {
    var hero = d.querySelector('.hero');
    if (hero) hero.classList.add('is-touched');
    voci.forEach(function (v) {
      v.setAttribute('aria-expanded', v.getAttribute('data-need') === chiave ? 'true' : 'false');
    });
    pannelli.forEach(function (p) {
      p.hidden = p.id !== (chiave ? 'need-' + chiave : 'need-start');
    });
    if (!cambioFoto) return;
    if (!chiave) { cambioFoto.classList.remove('is-on'); return; }
    var url = gruppo.querySelector('.need[data-need="' + chiave + '"]').getAttribute('data-foto');
    var img = new Image();
    /* la foto entra solo quando è già scaricata: niente riquadro vuoto durante la dissolvenza */
    img.onload = function () {
      if (voci.every(function (v) { return v.getAttribute('data-need') !== chiave || v.getAttribute('aria-expanded') === 'true'; })) {
        cambioFoto.style.backgroundImage = 'url("' + url + '")';
        cambioFoto.classList.add('is-on');
      }
    };
    img.src = url;
  }

  voci.forEach(function (v) {
    v.setAttribute('role', 'button');
    v.setAttribute('aria-expanded', 'false');
    v.setAttribute('aria-controls', 'need-' + v.getAttribute('data-need'));
    v.addEventListener('click', function (e) {
      e.preventDefault();
      scegli(v.getAttribute('aria-expanded') === 'true' ? null : v.getAttribute('data-need'));
    });
    /* un link con ruolo di pulsante deve rispondere anche alla barra spaziatrice */
    v.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); v.click(); }
    });
  });

  /* ---------- tagliando: stima immediata per cilindrata ---------- */
  var T = window.DeltaTagliando;
  var cfg = (window.DeltaDati || {}).tagliando;
  var campo = d.getElementById('heroCc');
  var uscita = d.getElementById('heroStima');
  var prenota = d.querySelector('.need-prenota');
  if (!campo || !T || !cfg) return;

  function riga(nome, forchetta) {
    var r = d.createElement('span');
    r.className = 'need-stima-riga';
    var n = d.createElement('span'); n.textContent = nome;
    var p = d.createElement('b'); p.textContent = T.prezzoTesto(forchetta);
    r.appendChild(n); r.appendChild(p);
    return r;
  }

  function stima(conErrori) {
    var v = T.validaCc(campo.value);
    uscita.textContent = '';
    if (!v.ok) {
      campo.setAttribute('aria-invalid', conErrori && v.errore !== 'vuoto' ? 'true' : 'false');
      if (conErrori && v.errore !== 'vuoto') uscita.textContent = 'Scrivi solo il numero dei cc, per esempio 1400.';
      prenota.href = 'prenota.html?servizio=tagliando';
      return;
    }
    campo.setAttribute('aria-invalid', 'false');
    var i = T.fasciaPer(v.cc, cfg.fasce);
    uscita.appendChild(riga('Tagliando completo', cfg.prezzi.completo[i]));
    uscita.appendChild(riga('Tagliando intermedio', cfg.prezzi.intermedio[i]));
    prenota.href = 'prenota.html?servizio=tagliando&cc=' + v.cc;
  }

  var attesa = null;
  campo.addEventListener('input', function () {
    clearTimeout(attesa);
    attesa = setTimeout(function () { stima(false); }, 400);
  });
  campo.addEventListener('change', function () { clearTimeout(attesa); stima(true); });
})();
