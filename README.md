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

- [ ] Sostituire le 9 fotografie (vedi `assets/img/FOTO.md`) e scrivere gli `alt`.
- [ ] Inserire il logo vettoriale e allineare l'arancione `--accent` al file originale
      (ora `#F7931D`, in `assets/css/style.css`).
- [ ] Confermare l'anno "Revisioni in sede dal 1997".
- [ ] Compilare Privacy Policy e Cookie Policy.
- [ ] Aggiungere favicon e immagine Open Graph.
- [ ] Verificare orari e recapiti nel blocco JSON-LD in `index.html` e `contatti.html`.

## Note tecniche

- **Mobile-first.** Breakpoint a 768 px (tablet) e 1024 px (desktop): oltre 1024 px compaiono la
  navigazione orizzontale e i layout a due colonne, la barra fissa inferiore scompare.
- **Header e barra azioni** cambiano stato via JavaScript in base allo scroll.
- **Orari:** lo stato "Aperto / Chiuso" è calcolato nel browser dalla costante `ORARI` in
  `assets/js/main.js`. Se cambiano gli orari, aggiorna quella costante, l'elenco nelle pagine e il JSON-LD.
- **Mappa:** l'iframe di Google viene inserito solo dopo il consenso (chiave `dg-consenso` in
  localStorage). Senza consenso restano il segnaposto e il link esterno.
- **Accessibilità:** aree tappabili da 48 px, focus visibile, contrasto AA, supporto a
  "Riduci movimento".
- **Accordion:** elementi `<details>` nativi, funzionano anche senza JavaScript.
- Header, menu e footer sono ripetuti nelle tre pagine: modificandone uno, allinea anche gli altri
  (è il compromesso del progetto senza build).

## Aggiornamento — luglio 2026

- Desktop: contenuto sotto l'header ridotto di circa il 15% (titoli, testi, immagini); header invariato.
- Spaziature verticali delle sezioni dimezzate su mobile, tablet e desktop.
- Privacy e Cookie Policy: nel menu di navigazione mobile (targa in basso) e nella fascia legale in fondo a ogni pagina.
- Pagina Contatti: recapiti in fascia scura a tutta larghezza (`.channels`), sede e orari tipografici con evidenza del giorno corrente (`.hour-row` + chip OGGI), mappa più grande. Rimossa la vecchia `.info-card`.
