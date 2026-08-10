# Sito Delta Group S.r.l. — versione statica

Autofficina e centro revisioni, Civitanova Marche. Tre pagine, nessun framework, nessuna build:
si apre in VS Code e si carica sul server via FTP così com'è.

## Cosa c'è dentro

```
delta-group-sito/
├── index.html          Home
├── servizi.html        Servizi + FAQ
├── contatti.html       Contatti + form
├── privacy.html        Privacy Policy (da compilare)
├── cookie.html         Cookie Policy (da compilare)
├── contatto.php        Invio e-mail del form
├── .htaccess           Compressione, cache, HTTPS (righe da scommentare)
├── .vscode/            Estensioni e impostazioni consigliate
└── assets/
    ├── css/style.css   Foglio di stile unico, mobile-first
    ├── js/main.js      Header, menu, orari, cookie, mappa, form
    └── img/FOTO.md     Elenco delle 9 foto da consegnare
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
- [ ] **Ad ogni modifica di CSS o JS: alzare il numero in `?v=4`** nei tag `<link>` e `<script>` di
      tutte le pagine. La cache è di un anno: senza questo, chi ha già visitato il sito vede la
      versione vecchia.

## Note tecniche

- **Mobile-first.** Breakpoint a 768 px (tablet) e 1024 px (desktop): oltre 1024 px compaiono la
  navigazione orizzontale e i layout a due colonne, la barra fissa inferiore scompare.
- **Header e barra azioni** cambiano stato via JavaScript in base allo scroll.
- **Orari, ferie e recapiti:** un solo file, `assets/js/dati.js`. Lo leggono `main.js` (stato aperto/chiuso)
  e `prenota-api.js` (disponibilità del calendario). Restano da aggiornare a mano l'elenco visibile nel footer
  e nella pagina Contatti, e il blocco JSON-LD.
- **Mappa:** l'iframe di Google viene inserito solo dopo il consenso (chiave `dg-consenso` in
  localStorage). Senza consenso restano il segnaposto e il link esterno.
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
- **Asset versionati** (`style.css?v=4`, `main.js?v=4`, …): la cache lunga non blocca più gli aggiornamenti.
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

- Contrasti portati sopra la soglia AA: `--faint-d` `#5F6875` → `#7E8794`,
  `--faint-l` `#9AA0A8` → `#6E747C`, copyright del footer `#6F757E` → `#8A919B`.
- Errori dei moduli collegati ai campi (`aria-describedby`, `aria-invalid`) e messaggi annunciati
  (`aria-live`).
- Descrizione testuale delle immagini di fondo dell'hero.

### Pulizia

- Rimosse ~40 righe di CSS non più agganciate a nessun markup (`.info-card` e tutta la vecchia
  scheda contatti, `.hrow`, `.piva`, `.brand-line`, `.logo-mark`, `.footer-note`,
  `.site-footer--min`, `.with-num i`, `.row-title i`) e il riferimento morto `fieldKm` in `prenota.js`.
- Orari e ferie non sono più duplicati fra `main.js` e `prenota-api.js`: entrambi leggono `dati.js`.
- Blocco `@font-face` pronto in fondo a `style.css` per il passaggio ai caratteri serviti dal dominio.

### Restano aperti (richiedono una tua decisione)

1. **Pagine separate per i quattro servizi.** Oggi «revisione auto Civitanova», «impianto GPL» e
   «gommista» competono tutte per la stessa URL, e tre sezioni su quattro sono nascoste al
   caricamento. Quattro pagine dedicate porterebbero più traffico, ma cambiano la struttura del
   menu e il senso della barra a schede: è un intervento da concordare.
2. **Arancione come colore delle azioni.** Oggi il colore del marchio (arancio) e quello dei
   pulsanti (blu) sono diversi, quindi l'azione non è mai riconoscibilmente «Delta». Vale la pena
   vedere le due versioni affiancate prima di decidere.
3. **Caratteri serviti dal dominio:** i file `.woff2` vanno scaricati una volta e messi in
   `assets/font/`; il CSS è già pronto.
