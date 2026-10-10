# Mijn Voeding

Een persoonlijke, Nederlandstalige voedingsapp met een eigen, transparant puntensysteem. Geïnspireerd op het gebruiksgemak van een ZeroPoints-aanpak, maar met eigen regels en een eigen formule.

Installeerbare webapp voor iPhone en Mac. Alle gegevens blijven lokaal op het toestel. Geen account, geen server, geen advertenties, geen kosten.

## Installeren op je iPhone

1. Open de app-link (GitHub Pages, zie hieronder) in **Safari**.
2. Tik op de deelknop en kies **Zet op beginscherm**.
3. Open de app voortaan via het icoon. Daarna werkt ze ook zonder internet.

Op de Mac kan hetzelfde via Safari: **Archief › Voeg toe aan Dock**.

## GitHub Pages aanzetten

Instellingen van de repo › **Pages** › *Build and deployment* › Source: **Deploy from a branch** › Branch: **main**, map **/docs** › Save.

Na een minuutje staat de app op `https://<gebruiker>.github.io/mijn-voeding/`.

## Puntenregels (fase 1)

De punten van een product worden in deze volgorde bepaald:

1. **ZeroPoints**: 0 punten. Standaard voor de meeste niet-zetmeelrijke groenten, vers fruit, peulvruchten, eieren, mager vlees en gevogelte, alle vis, schaal- en schelpdieren, tofu, magere natuuryoghurt en skyr. De calorieën tellen wel mee in de voedingswaarden. De lijst is per product aan te passen.
2. **Vetregel**: elk zuiver bereidingsvet telt 2 punten per koffielepel, ongeacht de soort.
3. **Vaste punten**: bijvoorbeeld avocado (¼ = 2, ½ = 4, hele = 8), of een vaste waarde die je zelf invult.
4. **Formule** voor al de rest (eigen ontwerp):

   `punten = kcal ÷ 25 − eiwit (g) ÷ 10 − vezels (g) ÷ 5`, nooit onder 0, afgerond per portie.

Alle getallen zijn aanpasbaar in Instellingen. Een aanpassing geldt voor wat je vanaf dan noteert; het dagboek van vroeger blijft ongewijzigd, omdat punten bij het noteren worden vastgezet.

### Budget

- Dagbudget plus een aparte weekreserve. Wat boven het dagbudget gaat, komt uit de weekreserve. Ongebruikte dagpunten schuiven niet door.
- Bewegingspunten gaan naar de weekreserve en starten elke maandag opnieuw op nul.
- Het budgetvoorstel in de app rekent: energieverbruik (Mifflin-St Jeor × activiteit) − gematigd tekort − kcal uit ZeroPoints, gedeeld door 25. Een deel per dag gaat naar de weekreserve.

## Gegevens en back-up

- Opslag in IndexedDB op het toestel, met versienummers en migraties: een update van de app wist nooit gegevens.
- **Instellingen › Gegevens en back-up**: back-up als bestand (bv. naar iCloud Drive) of als tekst, en terugzetten.
- Gegevens horen bij het webadres. Blijf de app dus via hetzelfde adres gebruiken.

## Ontwikkelen

Broncode staat in `src/`. Bouwen:

```sh
python3 build.py   # vereist Pillow voor de iconen
```

Dit schrijft de app naar `docs/` (wat GitHub Pages serveert), plus een testversie en een zip in `dist/` (niet in git).

| Bestand | Inhoud |
|---|---|
| `src/seed.js` | Standaardproducten, porties, eetdrang-labels en snelle ideeën |
| `src/core.js` | Opslag, puntenmotor, dag- en weekberekening, budget, back-up |
| `src/ui.js` | Schermen en panelen |
| `src/style.css` | Vormgeving (licht en donker thema) |
| `src/sw.js` | Offline-ondersteuning |

Bij een nieuwe versie: verhoog `APP_VERSION` in `src/core.js`, bouw opnieuw en push. De service worker haalt de nieuwe versie op bij de volgende keer openen met internet.

## Fases

- **Fase 1 (deze versie)**: puntensysteem, ZeroPoints, vet- en avocadoregel, standaardproducten, dag- en weekbudget, bewegingspunten, dagboek, favorieten en vaste maaltijden, eetdrangknop, back-up.
- **Fase 2**: receptenboek, recepten toevoegen via foto of tekst, recepten beoordelen.
- **Fase 3**: weekmenu's, boodschappenlijsten, gewichtsgrafiek, analyse van eetpatronen.

Punten en voedingswaarden zijn persoonlijke regels en gemiddelden per standaardportie, geen algemeen voedingsadvies.
