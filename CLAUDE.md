# Delta Group S.r.l. — istruzioni di progetto

Sito di un'autofficina e centro revisioni di Civitanova Marche, specializzata in impianti GPL e
metano. Sostituisce il vecchio `deltagroupsrl.it`. Progetto statico, **senza build**: HTML + CSS +
JS puri, più `contatto.php` per il form. Si pubblica caricando i file via FTP su hosting Apache/PHP.

Rispetta queste regole in ogni modifica. Se una richiesta le contraddice, segnalalo prima di eseguire.

## Dati reali — non inventare, non modificare

- Delta Group S.r.l. — Via Martiri di Belfiore 161, 62012 Civitanova Marche (MC)
- Telefono fisso: +39 0733 815450
- Mobile e WhatsApp: +39 348 7619808
- E-mail: info@delta-group.it
- P.IVA: 01580740437
- Orari: lun–ven 08:00–12:00 e 14:00–19:00 · sabato 08:00–12:00 · domenica chiuso
- Partner BRC Gas Service · Revisioni in sede dal 1997 (dicitura da non abbreviare in "Dal 1997")

Non aggiungere numeri, statistiche, recensioni, testimonianze, percentuali o contatori. Non
pubblicare calcolatori di scadenze normative: le periodicità dipendono da serbatoio, omologazione e
veicolo, quindi si invita al contatto per la verifica.

## Struttura

```
index.html        Home: hero, credenziali, servizi, focus GPL, perché, galleria, contatti, footer
servizi.html      Barra a schede sticky + GPL/Revisioni/Officina/Pneumatici/Altri + FAQ
contatti.html     Dati, orari, mappa con consenso, form 4 campi
prenota.html      Prenotazione in 3 passi: calendario e slot, dati veicolo e cliente, riepilogo
privacy.html      Privacy Policy (completa, due punti da confermare — vedi DECISIONI.md A6)
cookie.html       Cookie Policy (completa)
404.html          Pagina di errore, noindex
contatto.php      Invio e-mail, campo trappola anti-bot, limite per IP, risposta JSON per fetch
assets/css/style.css     Foglio unico, mobile-first
assets/js/dati.js        Orari, ferie, festivi calcolati, recapiti, durate. Caricare per primo
assets/js/main.js        Header, menu, orari, schede, consenso cookie, mappa, form, reveal
assets/js/prenota-api.js Livello API (oggi mock): unico file da toccare al collegamento del backend
assets/js/prenota.js     Interfaccia dei tre passi della prenotazione
assets/img/FOTO.md       Elenco delle 9 foto con nomi file definitivi
```

Orari, ferie e recapiti stanno **solo** in `assets/js/dati.js`: cambiarli lì, poi allineare gli
elenchi scritti nelle pagine e il blocco JSON-LD. CSS e JS sono richiamati con `?v=N`: alzare il
numero in tutte le pagine a ogni modifica.

Header, menu e footer sono **duplicati** nelle pagine: se ne modifichi uno, allinea tutte le pagine.
Non introdurre framework, bundler, npm, React o un generatore statico senza richiesta esplicita.

## Griglia e breakpoint

- Mobile-first. Breakpoint: `768px` (tablet), `1024px` (desktop). Viewport di riferimento del
  progetto grafico: **390 × 844**.
- Margini laterali: 20 px mobile, 40 px tablet, 60 px desktop (variabile `--gutter`).
- Contenuto desktop centrato, max 1200 px.
- Header: 58 px mobile, 76 px desktop (`--header-h`).
- Aree tappabili minime 48 × 48 px, distanza minima fra azioni 8 px.
- Raggi: 10 / 13 / 15 px (18 px sulle card desktop).
- Spaziature: multipli di 4 (4, 8, 12, 16, 20, 24, 32, 40, 48).

## Colori (variabili CSS in `:root`)

| Ruolo | Valore |
|---|---|
| Carbone profondo | `#0D0F12` |
| Superficie scura | `#16191F` |
| Bordo scuro | `#282D35` |
| Bianco caldo | `#F4F3F0` |
| Superficie chiara | `#EAE8E3` |
| Testo su scuro | `#F4F6F8` · secondario `#A7AFBA` |
| Testo su chiaro | `#16191F` · secondario `#5A616B` |
| Arancione Delta | `#F7931D` (pressed `#E0820C`) — **azioni primarie** + dettagli: righe, numeri, hover, focus. Testo sopra: `#0D0F12` |
| Blu | `#0072BC` (pressed `#00609F`) — solo link su fondo chiaro. Su carbone non arriva al contrasto AA |
| Verde | `#22C55E` solo stati positivi |
| Rosso | `#EF4444` solo errori |

Regole: **due soli fondi di sezione**, carbone e `--warm`, alternati; `--light` solo per gli incassi
(mappa, placeholder, bordi). Mai un sito interamente nero. Un solo colore acceso per volta. Nessun gradiente colorato: ammessi solo velature scure sulle fotografie per la leggibilità.
Vietati glassmorphism, neon, fibra di carbonio, fiamme, bandiere a scacchi, tachimetri decorativi,
ingranaggi, chiavi inglesi come simbolo, auto sportive, eccesso di rosso.

## Tipografia

- Titoli e numeri: **Barlow Semi Condensed** (600/700).
- Testi, pulsanti, navigazione: **Inter**.
- Etichette, occhielli e dati tecnici: monospace, maiuscolo, tracking `.12em`, mai per paragrafi interi.
- Minimi: corpo 17 px (18 px desktop), testo secondario 16 px, pulsanti 16 px, line-height corpo ≥ 1.5.
- Nessun testo sotto 16 px, escluse le etichette monospace (12.5 px).

## Contenuti — limiti da rispettare

- Home: massimo ~350 parole visibili, esclusi contatti, orari e testi legali.
- Titoli max 7 parole · sottotitoli max 22 · paragrafi max 35 (3–4 righe visive).
- Testo card max 16 parole · descrizione servizio in home max 20 · risposte FAQ max 45.
- Una sola idea e una sola CTA principale per sezione. Non ripetere lo stesso concetto in due sezioni.
- Contenuti tecnici secondari in accordion (`<details>`), non in elenchi lunghi.

## Tono di voce

Asciutto, chiaro, competente, rassicurante, concreto, verificabile. "Tu" professionale. Fatti e
servizi al posto degli aggettivi. **Vietati**: "i migliori", "leader", "eccellenza", "servizio
impeccabile", "qualità senza compromessi", "prezzi imbattibili", promesse non dimostrabili,
linguaggio allarmistico, lorem ipsum. Non affermare che "gli interventi non fanno decadere la
garanzia": usare "Ricambi conformi e lavorazioni documentate". Se si usa la sigla MCTC, spiegarla.

## Comportamenti già implementati (non riscriverli da zero)

- Header trasparente sulla hero, fondo carbone + bordo oltre 40 px di scroll.
- Barra azioni fissa **solo sotto 1024 px** (Chiama arancione, WhatsApp e Indicazioni sobri),
  compare oltre la hero, rispetta `env(safe-area-inset-bottom)`.
- Menu a schermo intero con blocco dello scroll, chiusura con Esc, focus gestito.
- Stato "Aperto / Chiuso" calcolato nel browser dalla costante `ORARI` in `main.js`. Se cambiano gli
  orari aggiorna: `ORARI`, gli elenchi nelle pagine e il blocco JSON-LD.
- Mappa **OpenStreetMap** in un iframe statico: nessun cookie, nessuna fascia di consenso, nessuna
  chiave in localStorage. Non reintrodurre Google Maps incorporato. Il link «Come arrivare» del
  footer resta su Google Maps: è un clic esplicito, non un contenuto incorporato.
- Avviso ferie in home: compare da solo 14 giorni prima, unisce i giorni di chiusura contigui
  (ferie + festivi + domeniche) in un unico periodo. Date in `assets/js/dati.js`.
- Form: 4 campi (nome, telefono o e-mail, servizio, messaggio), validazione inline, invio via fetch,
  fallback POST classico. **Non chiedere targa, libretto o altri dati tecnici al primo contatto.**
- Accordion nativi `<details>`: funzionano senza JavaScript.
- Velo di caricamento della prenotazione: i tre pezzi del marchio si compongono e si separano in
  ciclo (tre triangoli CSS). Niente rotazioni del logo.
- Animazioni discrete e `prefers-reduced-motion` rispettato. Vietati parallasse aggressivo, elementi
  che seguono il dito, animazioni infinite, autoplay video, caroselli automatici, 3D pesante.

## Fotografie

Segnaposto attuali: `<div class="ph" data-ph="...">`. Sostituire con `<img>` mantenendo la classe di
posizione, aggiungendo `alt` descrittivo e `loading="lazy"` sotto la prima schermata. Nomi file e
contenuto richiesto: vedi `assets/img/FOTO.md`. Direzione: reale, tecnica, luminosa, leggera
desaturazione, temperatura fredda. Mai stock, mai supercar, mai persone in posa o pollici alzati.

## Accessibilità e qualità

Contrasto minimo WCAG AA, focus visibile su ogni controllo, un solo `<h1>` per pagina, gerarchia dei
titoli coerente, `alt` su ogni immagine informativa, link telefono/WhatsApp/e-mail sempre nativi.

## Da completare (aperto)

Il dettaglio e le alternative stanno in `DECISIONI.md`. In sintesi:

- [ ] **Bloccante:** `prenota-api.js` ha `USE_MOCK: true` — la prenotazione non arriva a nessuno.
      Finché non è collegata (backend o e-mail) la pagina Prenota non può andare online.
- [ ] 9 fotografie reali + testi alternativi (oggi sono collegamenti a images.pexels.com)
- [ ] B7: header/menu/footer in `include` PHP — approvato, da fare come ultimo passo prima di
      pubblicare (dopo, l'anteprima locale richiede un server PHP)
- [ ] Confermare il segnaposto della mappa (43.2971, 13.7268: centro della via, non il civico 161)
- [ ] Dominio canonico definitivo (`www` o no) e HTTPS attivo, poi regole `.htaccess` scommentate
- [ ] Prezzo della revisione e numero di autorizzazione MCTC
- [ ] Conferma dell'anno "Revisioni in sede dal 1997" ed eventuale pagina "Chi siamo"
- [ ] Conferma dei due punti aperti in Privacy Policy (conservazione 24 mesi, destinatari)
- [ ] Caratteri `.woff2` locali in `assets/font/` (CSS già pronto in fondo a `style.css`)
- [ ] `contatto.php`: verificare `$DESTINATARIO` e `$MITTENTE` (dominio ospitato) e provare l'invio
