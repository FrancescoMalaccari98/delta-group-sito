# Sito Delta Group S.r.l. — versione statica

Autofficina e centro revisioni, Civitanova Marche. Sette pagine, nessun framework, nessuna build:
si apre in VS Code e si carica sul server via FTP così com'è.

> **Stato:** non pubblicabile finché la prenotazione online non è collegata a qualcosa (vedi
> «Bloccanti»). Tutto il resto è pronto. L'elenco ragionato delle scelte aperte sta in
> `DECISIONI.md`; le regole da rispettare in ogni modifica stanno in `CLAUDE.md`.

## Cosa c'è dentro

```
delta-group-sito/
├── index.html          Home
├── servizi.html        Servizi + FAQ
├── contatti.html       Contatti + form + mappa
├── prenota.html        Prenotazione in tre passi
├── privacy.html        Privacy Policy
├── cookie.html         Cookie Policy
├── 404.html            Pagina di errore (noindex)
├── contatto.php        Invio e-mail del form
├── .htaccess           Compressione, cache, HTTPS, CSP (righe da scommentare)
├── robots.txt · sitemap.xml · manifest.json
├── CLAUDE.md           Regole di progetto — leggere prima di modificare
├── DECISIONI.md        Scelte aperte, con pro e contro
├── .vscode/            Estensioni e impostazioni consigliate
└── assets/
    ├── css/style.css       Foglio di stile unico, mobile-first
    ├── js/dati.js          Orari, ferie, recapiti — caricare per primo
    ├── js/main.js          Header, menu, orari, avviso ferie, schede, form
    ├── js/prenota-api.js   Livello API della prenotazione (oggi mock)
    ├── js/prenota.js       Interfaccia dei tre passi
    └── img/FOTO.md         Elenco delle 9 foto da consegnare
```

## Aprire il progetto

1. In VS Code: **File → Apri cartella…** e scegli `delta-group-sito`.
2. Alla richiesta "Volete installare le estensioni consigliate?" rispondi sì.
3. Clic destro su `index.html` → **Open with Live Server**. Si apre su `http://localhost:5500`.

Live Server serve solo file statici: **il form non invia e-mail**. Per provarlo serve PHP (punto sotto).

## Provare il form in locale

Con PHP installato, dalla cartella del progetto:

```bash
php -S localhost:8000
```

Apri `http://localhost:8000`. In locale `mail()` non invia nulla: il form risponderà con un errore.
La prova reale si fa sull'hosting.

## Vederlo dallo smartphone

Non serve Android Studio: il sito è un sito web, si guarda dal browser del telefono.

1. PC e telefono sulla stessa rete Wi-Fi.
2. Trova l'IP del PC: Windows `ipconfig` → *Indirizzo IPv4* (es. 192.168.1.42); macOS `ipconfig getifaddr en0`.
3. Dal telefono apri `http://192.168.1.42:5500` (Live Server) o `:8000` (PHP).
4. Se non si apre, consenti Node/PHP nel firewall di Windows sulla rete privata.

Per provare la versione mobile dal PC: in Chrome premi F12 → icona telefono → imposta 390 × 844.

## Pubblicare sul server

1. Carica via FTP **il contenuto** di `delta-group-sito` nella cartella pubblica dell'hosting
   (`public_html` su cPanel, `httpdocs` su Plesk). Mantieni la struttura delle sottocartelle.
2. In `contatto.php` controlla `$DESTINATARIO` e `$MITTENTE`: il mittente deve essere un indirizzo
   del dominio ospitato, altrimenti molti provider bloccano l'invio.
3. Attiva il certificato HTTPS dal pannello, poi scommenta le regole HTTPS in `.htaccess`.
4. Invia una richiesta di prova dal form e verifica che arrivi su `info@delta-group.it`.

## Prima di andare online

**Da decidere o fornire (serve il cliente):**

- [ ] **Dominio.** Tutto il sito si dichiara su `https://www.delta-group.it`. Se l'indirizzo è diverso,
      va sostituito in: tag `canonical` e `og:url` delle 6 pagine, blocchi JSON-LD di `index.html` e
      `contatti.html`, `sitemap.xml`, `robots.txt` e le due regole di redirect in `.htaccess`.
- [ ] **Prenotazione online.** Oggi `assets/js/prenota-api.js` ha `USE_MOCK: true`: le prenotazioni
      **non arrivano a nessuno**. Prima di pubblicare: collegare il gestionale, oppure far inviare la
      prenotazione per e-mail come il form contatti, oppure togliere la voce dal menu.
- [ ] **Fotografie.** Le 9 immagini arrivano ancora da Pexels via collegamento esterno
      (vedi `assets/img/FOTO.md`). Con gli scatti reali: file locali in AVIF/WebP, tag `<img>` con
      `srcset`, `alt` scritti, `loading="lazy"` tranne l'hero.
- [ ] **Testi legali.** Privacy e Cookie Policy sono complete e coerenti con ciò che il sito fa oggi,
      ma vanno lette dal consulente privacy. Da confermare in particolare: 24 mesi di conservazione
      delle richieste di contatto e l'elenco dei destinatari dei dati.
- [ ] **Prezzo della revisione** e numero di autorizzazione MCTC: mancano e servono (obbligo di
      esposizione della tariffa + è una delle ricerche più frequenti).
- [ ] Confermare l'anno "Revisioni in sede dal 1997" e i dati per una pagina "Chi siamo".
- [ ] Profilo Google Business e pagina Facebook: gli indirizzi vanno aggiunti come `sameAs` nel JSON-LD.

**Da fare sul server:**

- [ ] Attivare il certificato SSL, poi verificare i due redirect in `.htaccess` e togliere il commento
      alla riga `Strict-Transport-Security`.
- [ ] Inviare una richiesta di prova dal form e controllare che arrivi (e non finisca in spam:
      servono record SPF e DKIM sul dominio).
- [ ] Registrare il sito su Google Search Console e inviare `sitemap.xml`.
- [ ] **Ad ogni modifica di CSS o JS: alzare il numero in `?v=12`** nei tag `<link>` e `<script>` di
      tutte le pagine. La cache è di un anno: senza questo, chi ha già visitato il sito vede la
      versione vecchia.

## Note tecniche

- **Mobile-first.** Breakpoint a 768 px (tablet) e 1024 px (desktop): oltre 1024 px compaiono la
  navigazione orizzontale e i layout a due colonne, la barra fissa inferiore scompare.
- **Header e barra azioni** cambiano stato via JavaScript in base allo scroll.
- **Orari, ferie e recapiti:** un solo file, `assets/js/dati.js`. Lo leggono `main.js` (stato aperto/chiuso)
  e `prenota-api.js` (disponibilità del calendario). Restano da aggiornare a mano l'elenco visibile nel footer
  e nella pagina Contatti, e il blocco JSON-LD.
- **Mappa:** iframe OpenStreetMap statico in `contatti.html`. Nessun cookie, nessuna fascia di
  consenso, nessuna chiave salvata. Non reintrodurre Google Maps incorporato senza rimettere il
  consenso. Il link «Come arrivare» del footer resta su Google Maps: è un clic esplicito.
- **Avviso ferie:** fascia in home fra hero e credenziali, compare da sola 14 giorni prima della
  chiusura. Unisce i giorni contigui di chiusura (ferie + festivi + domeniche) in un unico periodo.
- **Accessibilità:** aree tappabili da 48 px, focus visibile, contrasto AA, supporto a
  "Riduci movimento".
- **Accordion:** elementi `<details>` nativi, funzionano anche senza JavaScript.
- Header, menu, footer, barra azioni e fascia cookie sono ripetuti in tutte le pagine e oggi sono
  **identici carattere per carattere**: se ne modifichi uno, va riportato su tutte e sei. È il compromesso
  di un progetto senza build; il passo successivo naturale è rinominare le pagine in `.php` e usare
  `include 'parti/header.php'` (l'hosting ha già PHP: lo prova `contatto.php`).

## Aggiornamento — luglio 2026

- Desktop: contenuto sotto l'header ridotto di circa il 15% (titoli, testi, immagini); header invariato.
- Spaziature verticali delle sezioni dimezzate su mobile, tablet e desktop.
- Privacy e Cookie Policy: nel menu di navigazione mobile (targa in basso) e nella fascia legale in fondo a ogni pagina.
- Pagina Contatti: recapiti in fascia scura a tutta larghezza (`.channels`), sede e orari tipografici con evidenza del giorno corrente (`.hour-row` + chip OGGI), mappa più grande. Rimossa la vecchia `.info-card`.

## Aggiornamento — agosto 2026

- **Home:** la galleria chiude la pagina a filo schermo. Le didascalie restano vicine al bordo inferiore
  su desktop e appena sopra la barra azioni su mobile (`--ab-h` misurata in `main.js`).
- **Footer:** da 2 a 4 colonne su desktop (marchio e sede · pagine · orari · contatti + "Come arrivare"),
  2×2 su tablet, colonna "Pagine" nascosta su mobile perché già nel menu. Fascia legale con copyright a sinistra.
- **Prenota:** alla conferma compare un velo a schermo pieno (`.loader` in `prenota.html`) con il marchio
  che ruota fino alla risposta del server; visibile almeno 700 ms, scroll bloccato via `html.is-loading`.
- **Contatti:** gli orari non vanno più a capo a metà (`.hour-row .val{white-space:nowrap}`).

## Aggiornamento — revisione completa, agosto 2026

Intervento su tutto il sito dopo l'analisi di codice, SEO, privacy, performance e accessibilità.

### Pubblicazione e conformità

- **Footer su tutte le pagine.** Home e Servizi non l'avevano: ragione sociale, P.IVA e link legali
  ora sono raggiungibili da ogni pagina (obbligo dell'art. 2250 c.c.). Su mobile resta nascosto su
  home, servizi, prenota e contatti, dove la pagina chiude sul contenuto e sulla barra azioni.
- **Privacy Policy e Cookie Policy riscritte** e complete: basi giuridiche, tempi di conservazione,
  destinatari, trasferimenti fuori UE, diritti e reclamo al Garante. Dichiarata anche la richiesta
  a Google Fonts, che avviene prima del consenso.
- **Consenso revocabile.** Pulsante «Gestisci cookie» nella fascia legale di ogni pagina: cancella
  la scelta salvata e ripropone il banner (art. 7 GDPR).
- **`.htaccess`:** redirect a HTTPS e a www attivi, `ErrorDocument 404`, cache a un anno sugli
  asset versionati, `Content-Security-Policy` che elenca i soli domini realmente usati,
  `X-Frame-Options`, `Permissions-Policy`, HSTS pronta da attivare, `Options -Indexes`.
- **Asset versionati** (`style.css?v=7`, `main.js?v=7`, …): la cache lunga non blocca più gli aggiornamenti.
- **`contatto.php`:** corretto il difetto per cui il messaggio arrivava con le entità HTML
  (`l&#039;auto`); aggiunti limite di 5 invii all'ora per IP, validazione del recapito come telefono
  o e-mail, oggetto con il nome del richiedente, mittente di busta `-f` per la consegna.

### SEO

- `canonical`, `og:url`, `og:site_name`, `twitter:card` e `apple-touch-icon` su tutte le pagine.
- **Immagine per le condivisioni** generata a 1200×630: `assets/img/og-delta-group.png`.
  Prima le anteprime su WhatsApp e Facebook erano vuote.
- **JSON-LD riscritto**: `@id`, `url`, `logo`, `image` reale (prima puntava a un file inesistente),
  `priceRange`, `paymentAccepted`, `foundingDate`, `hasMap`, chiusura domenicale esplicita,
  `hasOfferCatalog` con i cinque servizi, area servita estesa ai comuni vicini.
- **FAQ strutturate** (`FAQPage`) su `servizi.html`: le cinque domande possono comparire
  direttamente nei risultati di ricerca.
- Aggiunti `robots.txt`, `sitemap.xml` e `404.html` (pagina di errore con i quattro percorsi utili).

### Prestazioni

- **Splash della home** da 1,72 s a 0,9 s, e non più una volta per sessione ma **una volta al giorno**:
  era il freno principale sul caricamento della pagina più visitata.
- **Preload dell'immagine dell'hero** e `preconnect` al server delle foto.
- **Comparsa progressiva solo sotto la prima schermata**: ciò che si vede subito non aspetta più
  l'IntersectionObserver. Esclusi i passi della prenotazione, che non devono dipendere da un'animazione.

### Prenotazione

- **Velo di caricamento onesto:** prima restava a schermo 4,7 secondi imposti; ora compare solo se la
  risposta tarda più di 250 ms e si chiude appena arriva.
- **«Aggiungi al calendario»**: scarica un file `.ics` con orario, durata reale della lavorazione,
  indirizzo, codice prenotazione e promemoria il giorno prima.
- **«Conferma su WhatsApp»**: messaggio già scritto con servizio, data, codice e veicolo.
- **Codice prenotazione** mostrato nel riepilogo.
- **Bozza salvata** nel browser per 30 minuti: un ricaricamento a metà compilazione non cancella più
  dieci campi.
- **Targa:** la vecchia regola accettava `12345`; ora riconosce i formati italiani reali.
  Il limite dell'anno nell'HTML non contraddice più quello del JavaScript.

### Interfaccia e contenuti

- **Menu mobile:** `role="dialog"`, il tabulatore non esce più dal pannello, la pagina corrente è
  evidenziata e c'è la voce «Prenota online», che mancava.
- **Schede dei servizi:** semantica ARIA completa (`tablist`/`tab`/`tabpanel`) e navigazione con
  le frecce della tastiera.
- **Stato «Aperto ora · chiude alle 19:00»** anche nell'hero della home: prima era solo su Contatti.
- **Link WhatsApp con messaggio già scritto**, diverso per contesto (verifica impianto, preventivo gomme,
  contatto generico). Il numero è scritto in un unico formato in tutto il sito.
- **Icona del telefono**: cornetta al posto dello smartphone, più riconoscibile per «Chiama».
- Sulla pagina Prenota il pulsante «Prenota» della barra azioni porta al modulo invece di ricaricare
  la stessa pagina.
- **Hero desktop** da 440 a 520 px, titolo da 58 a 68 px: era più debole della versione mobile.
- **Gerarchia dei pulsanti**: una sola azione primaria per sezione (Officina e Pneumatici usavano
  varianti diverse per la stessa importanza).
- **Refuso** «AUTOOFFICINA» → «AUTOFFICINA» su tutte le pagine.

### Accessibilità

- Contrasti portati sopra la soglia AA **su tutti i fondi su cui i colori vengono usati**, non solo
  sul bianco: `--faint-d` `#5F6875` → `#7E8794` (5,0:1 su carbone), `--faint-l` `#9AA0A8` →
  `#5F656D` (6,0:1 su bianco, 5,2:1 su `--warm`, 4,8:1 su `--light`), copyright del footer
  `#6F757E` → `#8A919B`, riga «Domenica / Chiuso» degli orari da `#8A919B` (2,87:1 su fondo warm)
  al token `--faint-l`, 5,3:1. Nessun grigio è più scritto a mano nel foglio di stile: i due
  token bastano, e questo evita che un valore sfugga al controllo come è successo qui.
- Errori dei moduli collegati ai campi (`aria-describedby`, `aria-invalid`) e messaggi annunciati
  (`aria-live`).
- Descrizione testuale delle immagini di fondo dell'hero.

### Pulizia

- Rimosse ~40 righe di CSS non più agganciate a nessun markup (`.info-card` e tutta la vecchia
  scheda contatti, `.hrow`, `.piva`, `.brand-line`, `.logo-mark`, `.footer-note`,
  `.site-footer--min`, `.with-num i`, `.row-title i`) e il riferimento morto `fieldKm` in `prenota.js`.
- Orari e ferie non sono più duplicati fra `main.js` e `prenota-api.js`: entrambi leggono `dati.js`.
- Blocco `@font-face` pronto in fondo a `style.css` per il passaggio ai caratteri serviti dal dominio.

## Aggiornamento — 10 agosto 2026

Chiuse sei decisioni aperte (B4, B5, C1, C2, C3, C4 di `DECISIONI.md`).

- **Azioni in arancio.** Pulsanti pieni, «Prenota» della barra e «Prenota online» del menu passano
  da blu `#0072BC` ad arancio `#F7931D` con testo carbone. Il blu resta ai link su fondo chiaro:
  su carbone si ferma a 3:1 di contrasto, sotto il minimo AA per il testo piccolo.
- **Due fondi invece di tre.** Le sezioni alternano solo carbone e `--warm`; `--light` resta per
  gli incassi (mappa, placeholder, bordi).
- **Mappa OpenStreetMap** al posto di Google Maps. Sparite la fascia del consenso, il pulsante
  «Gestisci cookie» e la chiave `dg-consenso`. Privacy e Cookie Policy riscritte di conseguenza,
  `frame-src` della CSP aggiornata.
- **Avviso ferie** in home, automatico dalle date in `dati.js`.
- **Velo di caricamento** della prenotazione: i tre pezzi del marchio si compongono e si separano
  in ciclo (tre triangoli CSS) invece del logo che ruotava di 360°.
- Corretti sette titoli in cui `<br>` era attaccato alla parola precedente: il testo letto da
  Google e dagli screen reader diceva «Specialisti inGPL».
- Allineate le tre etichette della fascia recapiti in `contatti.html`: `line-height` in px invece
  di unitless, così il corpo ridotto dell'e-mail non abbassa più il suo blocco.

---

# Cose da fare

## Bloccanti — senza queste il sito non va online

- [ ] **Prenotazione online.** `assets/js/prenota-api.js` ha `USE_MOCK: true`: il cliente riceve un
      codice ma **la prenotazione non arriva a nessuno**. Tre strade in `DECISIONI.md` B1:
      gestionale, e-mail come il form contatti, oppure togliere la voce dal menu.
- [ ] **Dominio canonico.** Il sito si dichiara su `https://www.delta-group.it`. Va confermato con o
      senza `www`, poi sostituito in `canonical` e `og:url` delle 7 pagine, JSON-LD di `index.html`
      e `contatti.html`, `sitemap.xml`, `robots.txt` e i due redirect in `.htaccess`.
- [ ] **Certificato HTTPS** attivo, poi verificare i redirect e scommentare `Strict-Transport-Security`.
- [ ] **`contatto.php`:** verificare `$DESTINATARIO` e `$MITTENTE` (il mittente deve appartenere al
      dominio ospitato) e fare un invio di prova.

## Dubbi aperti — servono una risposta tua

- [ ] **Due domini in giro.** La scheda Federmetano dell'officina indica sito `www.deltagroup.app` e
      e-mail `info@deltagroup.app`; il sito si dichiara su `delta-group.it` con `info@delta-group.it`.
      Quale dei due è quello buono? E su quale casella devono arrivare le richieste del form?
- [ ] **Segnaposto della mappa.** È a `43.2971, 13.7268`, il centro di via Martiri di Belfiore. Il
      civico 161 non è stato verificato: se lo scarto si vede, servono le coordinate esatte.
- [ ] **Prezzo della revisione** (auto e moto) e **numero di autorizzazione MCTC**. Mancano del tutto:
      è una delle ricerche più frequenti del settore e la tariffa va comunque esposta.
- [ ] **«Revisioni in sede dal 1997»**: da confermare. Oggi nessuna pagina lo sostiene.
- [ ] **REA e capitale sociale.** Il footer riporta ragione sociale, sede e P.IVA ma non il numero
      REA con l'ufficio del registro imprese né il capitale sociale: per una S.r.l. l'art. 2250 c.c.
      li richiede. Servono i due dati dalla visura.
- [ ] **Testi legali da far leggere al consulente privacy.** Due punti sono scritti in modo
      plausibile ma non confermati: 24 mesi di conservazione delle richieste di contatto e l'elenco
      dei destinatari (consulente fiscale, Motorizzazione, fornitori in garanzia).
- [ ] **Profili esterni.** Indirizzo del profilo Google Business e della pagina Facebook, da
      aggiungere come `sameAs` nel JSON-LD.
- [ ] **Numero di dipendenti e fatturato.** Serve per sapere se l'officina è una microimpresa: da
      questo dipende se l'European Accessibility Act si applica alla prenotazione online.

## Materiali da consegnare

- [ ] **9 fotografie reali** dell'officina (elenco in `assets/img/FOTO.md`). Oggi sono immagini
      generiche caricate da `images.pexels.com`: dipendono da un server terzo e non aiutano la
      fiducia di un cliente locale. All'arrivo: file locali AVIF/WebP, `<img>` con `srcset` e `alt`,
      `loading="lazy"` tranne l'hero, e via `images.pexels.com` dalla CSP.
- [ ] **Caratteri `.woff2`** scaricati da google-webfonts-helper e messi in `assets/font/`: il CSS è
      già pronto in fondo a `style.css`. Finché i font arrivano da Google, il browser comunica
      l'indirizzo IP del visitatore prima di qualsiasi consenso.
- [ ] **Due paragrafi di storia, numero di persone in officina, certificazioni e attestato BRC** per
      una pagina «Chi siamo».

## Interventi tecnici approvati, non ancora fatti

- [ ] **B7 — parti condivise in PHP.** Header, menu, footer e barra azioni sono ripetuti in sette
      file. Rinominare le pagine in `.php` e usare `include 'parti/header.php'` risolve per sempre.
      Approvato, ma **da fare come ultimo passo prima di pubblicare**: da quel momento l'anteprima
      locale richiede un server PHP e servono i redirect da `.html` a `.php`.
- [ ] **B2 — quattro pagine di servizio** invece di una. Oggi «revisione auto Civitanova»,
      «impianto GPL Civitanova» e «gommista Civitanova» competono per lo stesso indirizzo e tre
      sezioni su quattro sono nascoste al caricamento. È l'intervento con il maggior ritorno sul
      traffico ed è anche il più strutturale: cambia menu e barra a schede. Da concordare.
- [ ] **B3 — disdetta e promemoria** della prenotazione. Dipende da B1.

## Da sistemare — emerso dal controllo desktop e mobile del 10 agosto

Nessuno di questi blocca la pubblicazione, ma sono difetti veri, in ordine di gravità.

- [ ] **Su mobile la P.IVA non si vede su nessuna pagina utile.** Il footer è nascosto sotto 768 px
      su home, servizi, prenota e contatti, e il menu a scomparsa riporta solo Privacy e Cookie.
      Ragione sociale e P.IVA restano visibili solo su privacy, cookie e 404. L'art. 2250 c.c. non
      distingue fra desktop e mobile: serve una riga con ragione sociale, sede e P.IVA nella targa
      del menu, oppure il footer ridotto anche su mobile.
- [ ] **Il calendario della prenotazione non è usabile da tastiera con uno screen reader.** Le celle
      dei giorni si annunciano come «1», «2», «3»: manca `aria-label="martedì 12 agosto"`. Stessa
      cosa per gli orari, che dicono solo «08:45» senza il giorno. WCAG 2.4.6.
- [ ] **L'anello di messa a fuoco è arancione anche sui pulsanti arancioni.** Con `outline-offset:2px`
      l'anello cade sul fondo della sezione: su carbone si vede (8:1), su fondo chiaro sta a 2:1 e
      non arriva al 3:1 richiesto da WCAG 1.4.11. Serve un anello a due strati (interno chiaro,
      esterno scuro) oppure un colore di focus diverso dal colore dell'azione.
- [ ] **Occhielli `.eyebrow--dark` a 4,36:1 su fondo warm**, appena sotto il 4,5:1 di WCAG 1.4.3
      («SERVIZI», «PERCHÉ DELTA GROUP»). Basta scurire `#6B7280` a circa `#65696F`.
- [ ] **«PRIVACY POLICY» e «COOKIE POLICY» del footer sono a 11 px e alti 14 px.** Sotto il minimo
      di 12,5 px che il progetto si è dato per le etichette monospace, e sotto i 24×24 px di area
      tappabile di WCAG 2.5.8. Sono anche i due link che per legge devono essere raggiungibili.
- [ ] **I passi della prenotazione non dichiarano quello corrente.** Manca `aria-current="step"` sul
      passo attivo: visivamente si vede, a un lettore di schermo no.
- [ ] **`<br>` attaccato alla parola precedente nella targa del menu:** «AUTOFFICINA E CENTRO
      REVISIONI<br>CIVITANOVA MARCHE» viene letto «REVISIONICIVITANOVA». Stesso difetto già corretto
      nei titoli.
- [ ] **Nel menu a scomparsa, su schermi bassi (sotto 720 px) l'etichetta scende a 10 px**, sotto il
      minimo del progetto.
- [ ] **I link che aprono una nuova finestra non lo dichiarano** («Come arrivare», «© OpenStreetMap»).
      È un requisito AAA, non AA, ma costa un `aria-label`.
- [ ] **Da verificare a mano, non testabile da qui:** reflow a 320 px di larghezza (WCAG 1.4.10),
      ingrandimento del testo al 200% (1.4.4), e la resa reale su iPhone e Android con la barra del
      browser che si ritira.
