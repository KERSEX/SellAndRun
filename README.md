# Sell and Run

Ein Jump-'n'-Run im Synthwave-Look: Du bist Vertriebler des Monats und verkaufst dich
durch sechs Level – vom Büro bis ins Steuerparadies – immer knapp vor dem Steuerfahnder.

## ▶ Jetzt spielen

**https://kersex.github.io/SellAndRun/**

Läuft direkt im Browser, keine Installation nötig.

## Steuerung

| Aktion | Tastatur | Xbox | PlayStation |
|---|---|---|---|
| Laufen | A / D oder Pfeiltasten | Stick / D-Pad | Stick / D-Pad |
| Springen | W / Leertaste | A | ✕ (Kreuz) |
| Verkaufen / Schießen | E | X | □ (Viereck) |
| Sprint (Dash) | Shift | RB | R1 |
| Pause | ESC | Start | Options |

Am besten zuerst das **Tutorial** im Hauptmenü starten – dort gibt es einen Übungsparcours,
in dem jede Funktion einmal erklärt und ausprobiert wird.

## Features

- **6 Level** mit eigenen Hintergründen (Büro, Innenstadt, Messehalle, Flughafen, Frachtraum, Steuerparadies)
- **Bosse**: Akten ausweichen und Verträge platzieren – im Finale wird der Koffer zur Schrotflinte
- **Verkaufen** an Kunden, Verträge und Münzen sammeln, **Combo-Multiplikator** für schnelle Abschlüsse
- **Power-Ups**: Kaffee (Speed), Aktenkoffer (Schild), Magnet
- **Shop** zwischen den Leveln für dauerhafte Upgrades
- **Schwierigkeitsgrade** inkl. frei einstellbarem Modus
- **Boss-Rush**, Statistiken, Erfolge und freischaltbare Anzüge (Skins)
- Gamepad-Unterstützung, Pause-Menü, Checkpoints, Fortschritt wird gespeichert

Kleines Extra: Tippe im Spiel `KAOS` für ein Cheat-Menü.

## Technik

Reines HTML/CSS/JavaScript mit [Phaser 3](https://phaser.io/) – keine Build-Tools.
Zum lokalen Spielen genügt ein einfacher Webserver, z. B.:

```bash
python -m http.server 5510
```

Dann `http://localhost:5510` im Browser öffnen.
