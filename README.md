# ⚓ The Ancient Mariners - Iron Maiden Chords & Tabs Web App

Web App completa, reattiva e dal design heavy metal per la cover band **"The Ancient Mariners"** (Iron Maiden Tribute).
Contiene testi completi, accordi, tabulati di chitarra/basso, trasposizione automatica di tonalità, auto-scroll per suonare dal vivo, ricerca istantanea e modalità Stage ad alto contrasto per tablet e smartphone sul palco.

---

## 🚀 Caratteristiche Principali

- 🎸 **Repertorio Iron Maiden**: Canzoni iconiche con accordi e tabulati (*Rime of the Ancient Mariner*, *The Trooper*, *Fear of the Dark*, *Run to the Hills*, *Hallowed Be Thy Name*, *Aces High*, *Wasted Years*, ecc.).
- 🎵 **Traspositore in Tempo Reale**: Pulsanti `+` e `-` per cambiare la tonalità degli accordi in semitoni per adattarsi alla voce del cantante.
- 📜 **Auto-Scroll Regolabile**: Scorrimento automatico hands-free con slider di velocità per leggere i testi mentre si suona.
- ⚡ **Stage Mode (Modalità Palco)**: Interfaccia ad alto contrasto e caratteri ingranditi per una perfetta visibilità su smartphone/tablet da microfono o leggio.
- 🔍 **Ricerca Istantanea e Filtri**: Cerca per titolo, album, tonalità o testo della canzone. Scorciatoia da tastiera `/`.
- 📋 **Gestore Scaletta Live (Setlist)**: Crea e salva la scaletta dei concerti direttamente nel browser (`localStorage`).
- 📱 **100% Responsive**: Testato per Smartphone, Tablet e PC Desktop.

---

## 🛠️ Come Caricare la Web App su GitHub e Render.com

L'applicazione è sviluppata come una **PWA / Web App Statica Moderna** (HTML5, CSS3, JS ES6+). Non richiede build o server complessi ed è completamente **GRATUITA** da ospitare su [Render.com](https://render.com).

### Passaggio 1: Inizializzare Git e Caricare il Codice su GitHub

Apri il terminale all'interno della cartella del progetto (`/Users/ricky/Documents/Ancient Mariner App`) ed esegui i seguenti comandi:

```bash
# 1. Inizializza il repository Git
git init

# 2. Aggiungi tutti i file al commit
git add .

# 3. Crea il primo commit
git commit -m "Initial commit - The Ancient Mariners Web App"

# 4. Collega il tuo repository remoto GitHub (Sostituisci il link con il tuo URL GitHub)
git remote add origin https://github.com/IL_TUO_UTENTE_GITHUB/ancient-mariners-app.git

# 5. Rinomina il ramo in main e fai il push
git branch -M main
git push -u origin main
```

---

### Passaggio 2: Configurare il Deploy su Render.com

1. Vai su **[Render.com](https://dashboard.render.com/)** e fai il login (o crea un account gratuito tramite GitHub).
2. Clicca sul pulsante **"New +"** in alto a destra e seleziona **"Static Site"**.
3. Collega il tuo account GitHub e seleziona il repository **`ancient-mariners-app`**.
4. Compila i dettagli del servizio:
   - **Name**: `ancient-mariners-app` (o il nome che preferisci)
   - **Branch**: `main`
   - **Build Command**: *Lascia vuoto*
   - **Publish Directory**: `./` (o `.`)
5. Clicca su **"Create Static Site"**.

🎉 **Fatto!** In pochi secondi Render genererà l'URL pubblico della tua Web App (es. `https://ancient-mariners-app.onrender.com`), accessibile da qualsiasi smartphone, tablet o PC in tutto il mondo!

---

## 💻 Test Locale nel Browser

Per testare la Web App sul tuo computer locale in qualsiasi momento:

Con Python 3 (già disponibile su Mac):
```bash
python3 -m http.server 8080
```
Apri il tuo browser e vai all'indirizzo: **`http://localhost:8080`**

---

## ⚓ The Ancient Mariners
*Up the Irons!* 🤘
