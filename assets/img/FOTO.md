# Fotografie da inserire

> **Stato attuale:** i placeholder mostrano foto temporanee di Pexels (licenza libera, uso
> commerciale consentito, nessuna attribuzione obbligatoria) caricate dal loro CDN. Servono solo
> per valutare l'impaginazione: vanno sostituite con gli scatti reali dell'officina prima della
> pubblicazione. Ogni foto è applicata con un attributo `style="background-image:url(...)"` nel
> tag del placeholder: si sostituisce quel valore, o meglio si passa a un `<img>` locale.

Nomi file definitivi: il codice li richiama con questi nomi.
Formato consigliato: **WebP** (qualità 80), oltre a un JPG di riserva se necessario.

| File | Dove appare | Contenuto | Dimensione minima |
|---|---|---|---|
| foto-01-hero.webp | Home, hero | Ingresso officina o auto sul ponte, corsia GPL riconoscibile | 2400 × 1600 |
| foto-02-gpl.webp | Home, card principale | Montaggio impianto: riduttore BRC nel vano motore, mani al lavoro | 1600 × 1000 |
| foto-03-revisioni.webp | Home, carosello | Area revisioni con veicolo in linea | 1400 × 1800 |
| foto-04-diagnosi.webp | Home, carosello | Strumento di diagnosi collegato, schermo leggibile | 1400 × 1800 |
| foto-05-serbatoio.webp | Home, carosello | Serbatoio GPL o bombola metano, dettaglio ravvicinato | 1400 × 1800 |
| foto-06-impianto.webp | Servizi, GPL e metano | Componenti dell'impianto installati, vista pulita | 1600 × 2000 |
| foto-07-revisioni.webp | Servizi, Revisioni | Linea revisioni, prova freni in corso | 1600 × 1200 |
| foto-08-officina.webp | Servizi, Officina | Tester collegato alla vettura, banco ordinato | 1600 × 1200 |
| foto-09-pneumatici.webp | Servizi, Pneumatici | Equilibratrice con pneumatico montato | 1600 × 1200 |

## Direzione fotografica

- Luce naturale, ambienti ordinati, leggera desaturazione e temperatura lievemente fredda.
- Nessuna posa, nessun pollice alzato, nessuna auto sportiva, nessuna immagine stock.
- Il colore reale dell'officina deve restare riconoscibile: non convertire tutto in bianco e nero.

## Come sostituire un placeholder

Nel codice ogni foto è un blocco segnaposto:

```html
<div class="hero-media ph" data-ph="FOTO-01-HERO · INGRESSO OFFICINA"></div>
```

Sostituiscilo con l'immagine reale, mantenendo la stessa classe di posizione:

```html
<img class="hero-media" src="assets/img/foto-01-hero.webp" alt="Ingresso dell'officina Delta Group a Civitanova Marche">
```

Per le immagini sotto la prima schermata aggiungi `loading="lazy"`.
Scrivi sempre un testo alternativo che descriva la scena.
