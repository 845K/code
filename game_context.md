```markdown
# Glitch Hunt – Project Context

## Overzicht
Dit project is een **persoonlijke 3D browsergame** gebouwd in **JavaScript + Three.js** (single HTML file prototype).

De game is geïnspireerd op:
- Pokémon (mechanics: verzamelen + turn-based battles)
- Murder Drones (karakters)
- The Amazing Digital Circus (extra level / sfeer)

Belangrijk:
- Dit is **niet bedoeld voor publicatie**, maar als leer- en bouwproject
- Gebruik van bestaande characters is oké binnen deze context

---

## Core Concept

### Gameplay Loop
1. Speler loopt rond in 3D wereld
2. Vangt characters (Uzi, Cyn, V)
3. Opent gates via progressie
4. Vecht tegen vijanden (turn-based)
5. Verslaat bosses
6. Unlockt nieuwe gebieden

---

## Huidige Features

### Wereld
- 3D map met meerdere zones
- Walls + colliders
- Gates die openen op basis van progressie
- NPC’s met dialogen

### Characters (Team)
- Uzi (damage / speed)
- Cyn (control / sustain)
- V (sterk, snel, aggressive)

### Vijanden / Bosses
- Worker Drone (early fight)
- J (mid boss)
- Sentinel (late gate boss)
- N (final boss)

### Extra Level
Unlock condition:
- Uzi + Cyn + V

Resultaat:
- Trap verschijnt naar **Amazing Digital Circus area**
- NPC’s:
  - Gangle
  - Jax
  - Pomni

---

## Battle System

### Type
Turn-based

### Mechanics
- Player turn / Enemy turn
- Damage calculation:
```

damage = move.power + attack - (defense / 2)

```
- Random variance toegevoegd

### Features
- 3 moves per character
- Heal moves
- Team switching (reserve system)
- Auto-switch bij KO

---

## Progressie Logica

### Gate A
- Vereist: Uzi + Cyn

### Gate B
- Vereist: J verslagen

### Core Gate
- Vereist: Sentinel verslagen

### Circus Unlock
- Vereist: Uzi + Cyn + V

---

## Controls

### World
- WASD = bewegen
- Mouse = kijken
- E = interactie
- Click = pointer lock

### Battle
- 1 / 2 / 3 = attacks
- Buttons = UI alternatief
- Switch via knoppen

---

## Technische Afspraken

### Stack
- Plain HTML
- Vanilla JavaScript
- Three.js via CDN (ES module)

### Architectuur
- Single file (voor nu)
- Geen build tools
- Geen dependencies buiten Three.js

### Data structuur
- `entities[]` → NPCs, units, bosses
- `units{}` → stats + moves
- `game{}` → state
- `colliders[]` → physics
- `gates[]` → progress blockers

---

## Wat NIET gedaan moet worden (valkuilen)

- Niet meteen:
- inventory systemen
- save/load
- multiplayer
- complexe animaties
- Niet overstappen naar 3D models (GLTF etc.) voordat gameplay stabiel is
- Niet alles herschrijven → iteratief uitbreiden

---

## Volgende Prioriteiten

### 1. Battle verbeteren
- Crit chance
- Status effects (corrupt, stun)
- Visuele feedback

### 2. Circus Level uitbreiden
- Quests van Gangle
- Sarcastische interacties met Jax
- Nieuwe boss (bijv. abstract entity)

### 3. Game feel
- Animaties (simple)
- Camera polish
- Sound (later)

### 4. Structuur verbeteren (later)
- Split naar meerdere JS files
- Event system
- State management

---

## Design Richting

De game moet voelen als:
- Licht chaotisch
- Donker + glitchy
- Humor + ongemak
- Niet te serieus

---

## Belangrijkste Regel

**Altijd eerst speelbaar houden.**

Geen nieuwe feature toevoegen zonder dat:
- de game nog werkt
- de flow logisch blijft

---

## Snelle Start (VSCode + Codex)

1. Open project folder
2. Open HTML bestand
3. Gebruik Codex voor:
 - uitbreiden features
 - refactors
 - debuggen

Tip:
Geef Codex altijd context zoals:
> "We are working on a single-file Three.js browser game with a turn-based battle system and entity-based world."

---

## Notities

- Balans is belangrijk → bosses moeten te winnen zijn
- Team mechanic is core → uitbreiden, niet vervangen
- Wereld mag groeien, maar gameplay eerst

---

Einde context.
```
