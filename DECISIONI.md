# Decisioni aperte — sito Delta Group

Elenco di ciò che **non** ho deciso da solo, perché dipende da te, dai contenuti reali
dell'officina o da una scelta di gusto che va vista con gli occhi.
Aggiornato: 10 agosto 2026.

**Chiuse in questa passata:** B4 (mappa OpenStreetMap, fascia consenso rimossa), B5 (avviso ferie),
C1 (arancio sulle azioni), C2 (due fondi), C3 (risolta da B4), C4 (velo di caricamento).
Restano aperte A1–A6, B1, B2, B3, B6 e B7.

---

## A. Servono dati o materiali tuoi

### A1. Dominio canonico
Tutto il sito si dichiara su `https://www.delta-group.it`. Nel vecchio `contatto.php` compariva
invece `deltagroupsrl.it`.
**Serve:** l'indirizzo definitivo, con o senza `www`.
**Dove si cambia:** `canonical` e `og:url` delle 7 pagine, JSON-LD di `index.html` e `contatti.html`,
`sitemap.xml`, `robots.txt`, i due redirect in `.htaccess`. Una passata, dieci minuti.

### A1-bis. Sul web risulta un altro dominio
Cercando l'indirizzo dell'officina, la scheda Federmetano di Delta Group riporta sito
`www.deltagroup.app` e e-mail `info@deltagroup.app`, mentre il sito che stiamo costruendo si
dichiara su `delta-group.it` con `info@delta-group.it`.
**Serve:** sapere quale dei due è quello buono, e far correggere l'altro dove è pubblicato.
Se le e-mail attive sono due, va deciso su quale arrivano le richieste del form.

### A2. Fotografie reali
Le 9 immagini arrivano da Pexels tramite collegamento esterno: sono generiche, dipendono da un
server terzo e non aiutano la fiducia di un cliente locale.
**Serve:** gli scatti dell'officina (elenco in `assets/img/FOTO.md`).
**Cosa faccio quando arrivano:** file locali in AVIF/WebP, passaggio da `background-image` a `<img>`
con `srcset` e `alt` scritti, `loading="lazy"` tranne l'immagine dell'hero. È anche il momento
giusto per togliere `images.pexels.com` dalla Content-Security-Policy.

### A3. Prezzo della revisione e autorizzazione MCTC
Manca del tutto una pagina o una sezione sui costi. È una delle ricerche più frequenti del settore
e per un centro revisioni la tariffa va comunque esposta.
**Serve:** l'importo aggiornato della revisione (auto e moto) e il numero di autorizzazione MCTC.

### A4. Pagina "Chi siamo"
La home afferma "Revisioni in sede dal 1997" ma nessuna pagina lo sostiene.
**Serve:** due paragrafi di storia, il numero di persone in officina, le certificazioni e
l'attestato BRC (anche solo fotografati), eventuali marchi dei fornitori.

### A5. Profili esterni
**Serve:** indirizzo del profilo Google Business e della pagina Facebook, da aggiungere come
`sameAs` nel JSON-LD; è il collegamento che aiuta Google a unire sito, mappa e recensioni.

### A6. Testi legali
Privacy e Cookie Policy sono complete e coerenti con ciò che il sito fa, ma due punti li ho
scritti in modo plausibile e vanno confermati: **24 mesi** di conservazione delle richieste di
contatto e l'elenco dei destinatari dei dati (consulente fiscale, Motorizzazione, fornitori in
garanzia). Da far leggere al consulente privacy.

---

## B. Scelte di prodotto

### B1. Prenotazione online: cosa deve fare davvero  ← la più urgente
Oggi `prenota-api.js` ha `USE_MOCK: true`: il cliente riceve un codice, ma **la prenotazione non
arriva a nessuno**. Tre strade:
1. **Gestionale/backend** — la strada giusta, ma serve sapere quale software usa l'officina.
2. **E-mail** — la prenotazione arriva su `info@delta-group.it` come il form contatti, e la
   disponibilità resta indicativa. Si fa in mezza giornata e si può pubblicare subito.
3. **Toglierla** dal menu finché non c'è il punto 1 o 2.
Fino a quella decisione il sito non può andare online con la pagina Prenota attiva.

### B2. Quattro pagine di servizio invece di una
Oggi "revisione auto Civitanova", "impianto GPL Civitanova" e "gommista Civitanova" competono
tutte per lo stesso indirizzo, e tre sezioni su quattro sono nascoste al caricamento.
**Pro:** quattro porte d'ingresso invece di una, ognuna con titolo, testo e FAQ propri.
**Contro:** cambia il menu, e la barra a schede che abbiamo rifinito diventa un indice fra pagine
diverse. È l'intervento con il maggior ritorno sul traffico, ma è anche il più strutturale.

### B3. Disdetta e promemoria della prenotazione
Oggi per disdire bisogna telefonare, e non c'è nessun promemoria. Con un backend si possono avere
un link di disdetta personale e un promemoria automatico il giorno prima (e-mail o WhatsApp).
Dipende da B1.

### ~~B4. Mappa senza consenso~~ — fatto il 10 agosto
Mappa OpenStreetMap in `contatti.html`, fascia del consenso e chiave `dg-consenso` rimosse da
tutte le pagine, Privacy e Cookie Policy riscritte di conseguenza, `frame-src` della CSP aggiornata.
Il link «Come arrivare» del footer resta su Google Maps: è una navigazione che parte da un clic
esplicito, non un contenuto incorporato, e geolocalizza l'indirizzo meglio di chiunque altro.

**Un punto da confermare:** il segnaposto della mappa è a `43.2971, 13.7268`, il centro di via
Martiri di Belfiore. Il numero civico 161 non l'ho potuto verificare: se lo scarto è visibile,
aprimi la posizione esatta su una mappa e mandami le due coordinate, si cambiano in una riga.

### ~~B5. Avviso di chiusura per ferie~~ — fatto il 10 agosto
Fascia in home fra hero e credenziali, visibile nei 14 giorni prima della chiusura e durante.
Non legge l'elenco grezzo delle ferie ma il calendario vero: 14 e 17 agosto, con Ferragosto e la
domenica in mezzo, diventano «Chiusi dal 14 al 17 agosto. Riapriamo martedì 18 agosto alle 08:00».
Le date restano l'unica cosa da aggiornare, in `assets/js/dati.js`.

### B6. Caratteri serviti dal dominio
I font arrivano da Google, che riceve l'IP del visitatore prima di ogni consenso. Il CSS è già
pronto in fondo a `style.css`: servono i cinque file `.woff2` scaricati una volta da
google-webfonts-helper e messi in `assets/font/`. Non posso scaricarli io.

### B7. Pagine in PHP con parti condivise  ← approvata, la eseguo per ultima
Header, menu, footer, barra azioni e fascia cookie sono ripetuti in sette file e oggi sono identici
carattere per carattere — ma ogni modifica futura va fatta sette volte, ed è da lì che sono nati
quasi tutti gli allineamenti sbagliati delle settimane scorse.
Rinominare le pagine in `.php` e usare `include 'parti/header.php'` risolve per sempre.
**Contro:** con Live Server non si vede più l'anteprima locale (serve PHP), e gli indirizzi passano
da `.html` a `.php`, quindi vanno impostati dei redirect.

Hai approvato: la faccio, ma la tengo come **ultimo passo prima della pubblicazione**. Motivo: da
quel momento il sito non è più visibile in anteprima senza un server PHP, e finché restano aperte
le foto, i prezzi e la prenotazione lavoreremo ancora molto guardando le pagine. Dimmi "adesso" e
la eseguo subito.

---

## C. Scelte visive da vedere affiancate

### ~~C1. Arancio o blu per le azioni~~ — fatto il 10 agosto
Azioni primarie in arancio `#F7931D` con testo carbone: pulsanti pieni, «Prenota» della barra
azioni, «Prenota online» del menu desktop.
Il blu `#0072BC` non è sparito ma è sceso di grado: resta ai link su fondo chiaro. Non l'ho messo
sui dettagli in generale perché su carbone arriva a 3:1 di contrasto, sotto il minimo AA per il
testo piccolo; l'arancio sta a 8:1. Quindi: arancio sul carbone, blu sui link chiari.

### ~~C2. Due fondi invece di tre~~ — fatto il 10 agosto
Le sezioni alternano solo carbone e `--warm`. `--light` non è più un fondo di sezione: resta per
gli incassi (sfondo della mappa, placeholder foto, bordi), dove serve un chiaro leggermente più
profondo del fondo pagina.

### ~~C3. Fascia cookie più compatta su mobile~~ — risolta da B4
La fascia non esiste più. Sulla prima schermata restano header e barra azioni.

### ~~C4. Il logo che ruota nel velo di caricamento~~ — fatto il 10 agosto
Niente più rotazione: i tre pezzi entrano, compongono il marchio, si separano, in ciclo. Stessa
idea dello splash d'ingresso, fatta con tre triangoli CSS invece che con l'SVG, così pesa nulla.
Con `prefers-reduced-motion` il marchio resta fermo e composto.
