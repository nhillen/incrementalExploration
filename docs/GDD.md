# Project Museum: Game Design Document

## Core Concept: The Onion Peel

**What players think they're playing:** A cookie clicker clone.

**What they're actually playing:** A meta-game about incremental games, revealed through progression.

**The Hook:** Players invest 2-3 days into what appears to be a standard cookie clicker. When they reach the "prestige" moment, the game reveals its true nature - they've been playing in one universe of a multiverse of incremental games, and their progress has earned them passage to the meta-layer.

---

## Progression Structure

### Layer 0: The Gateway Game (Cookie Clicker)

**Duration:** 2-3 days of active/idle play

**Experience:** A complete, legitimate cookie clicker with:
- Click to bake
- Buildings (Cursor, Grandma, Farm, Factory, etc.)
- Upgrades that boost production
- Achievements
- Standard prestige system (Heavenly Chips equivalent)

**The player should feel:** "This is a solid cookie clicker clone."

**No hints of the meta-game.** The UI is cookie clicker. The mechanics are cookie clicker. The only thing slightly off might be the game's name or occasional cryptic flavor text that makes sense in retrospect.

**Endgame trigger:** When the player reaches a specific milestone (e.g., "Baked 1 Trillion Cookies" or "Owned 100 of every building"), a new button appears:

> **「 TRANSCEND 」**
> *"You've mastered this reality. What lies beyond?"*

---

### Layer 1: The Reveal (Multiversal Store)

**The Transcend moment:**
1. Screen glitches/distorts
2. Cookie clicker UI fades/shatters
3. New UI emerges - The Multiversal Store
4. Text: *"Welcome, Traveler. Universe #247 has been archived."*

**What the player receives:**
- **Transcendence Points (TP)** - Meta-currency based on their cookie clicker progress
- Access to the **Multiversal Store**
- Their cookie clicker save is "archived" (can be revisited but is essentially complete)

**The Multiversal Store offers:**
- **Universal Modifiers** - Buffs that apply to ALL games (click power, speed, luck)
- **New Universes** - Other incremental games to unlock and play
- **Cosmetics/Meta upgrades** - UI themes, automation tools, quality-of-life
- **Mysteries** - Locked options that hint at deeper layers

---

### Layer 2+: The Multiverse

Each unlocked universe is a different incremental game archetype:

| Universe | Archetype | Unlock Cost | Duration |
|----------|-----------|-------------|----------|
| #247 | Clicker (Gateway) | Free | 2-3 days |
| #891 | Idle/Management | 100 TP | 3-4 days |
| #156 | RPG/Combat Loop | 250 TP | 4-5 days |
| #042 | Puzzle/Optimization | 500 TP | 3-4 days |
| #??? | ??? | 1000 TP | ??? |

**Completing each universe:**
- Grants a large TP payout
- Unlocks universe-specific modifiers
- Contributes to "Multiverse Completion %"

**Cross-universe synergies:**
- Universal Modifiers apply everywhere
- Some universes have unique bonuses: "Universe #891: +10% offline progress everywhere"

---

### Layer 3+: Deeper Reveals (Future)

As players complete more universes:
- **Online features unlock** - Leaderboards, cooperative events
- **The Museum manifests** - Hub world where completed universes become exhibits
- **The Meta-Narrative** - Why are there multiple universes? Who is the Curator?
- **Endgame** - Something that ties it all together

---

## Technical Architecture

### Core Systems (Already Built)

These remain valid:

- **Curator** → Becomes "Multiversal Store" manager
- **ExhibitInterface** → Contract for each "Universe"
- **GameLoop** → Handles active + background universe updates
- **SaveManager** → Persists all universe states

### Key Changes from Original Design

1. **No Lobby at Start**
   - Game boots directly into Cookie Clicker
   - Multiversal Store only appears after first Transcendence

2. **Progressive UI Unlocks**
   - Cookie Clicker UI is self-contained
   - Store UI appears as overlay/replacement after Transcend
   - Future: Upgrade Complete style - buy UI elements

3. **Transcendence System**
   - New module handling gateway → reveal transition
   - Calculates TP payout based on progress
   - Triggers reveal animation/narrative

4. **Universe State Machine**
   ```
   LOCKED → ACTIVE → TRANSCENDED → ARCHIVED

   LOCKED: Not yet accessible
   ACTIVE: Player is progressing
   TRANSCENDED: Completed, claimed TP
   ARCHIVED: Generates passive TP, can revisit
   ```

---

## MVP Milestone

**Goal:** Playable cookie clicker that leads to the reveal.

### Phase 1: Cookie Clicker (Complete Game)
- **Buildings:** Cursor, Grandma, Farm, Factory, Mine, Bank (6 tiers)
- **Upgrades:** ~20 upgrades across buildings + click power
- **Achievements:** 15-20 achievements
- **Transcend trigger:** Button appears at 1 Trillion cookies

### Phase 2: The Reveal (Basic)
- Transition animation (simple initially)
- TP calculation and display
- Basic Multiversal Store UI

### Phase 3: Proof of Loop
- One purchasable Universal Modifier
- Verify modifier applies when revisiting Cookie Clicker
- Basic "archived universe" state

---

## Open Questions

1. **Revisiting Transcended universes?**
   - With all progress + universal modifiers?
   - New Game+ style reset?
   - Archived forever (passive TP only)?

2. **Multiple Transcendences from same universe?**
   - Grind Cookie Clicker for more TP?
   - Diminishing returns? One-time payout?

3. **Meta-narrative tone?**
   - Cryptic hints only?
   - Actual story/characters?
   - Player-discovered lore?

---

## References

- **A Dark Room** - Layered reveal, starts simple
- **Candy Box** - Absurdist reveal, hidden depth
- **Cookie Clicker** - The base we're subverting
- **Upgrade Complete** - Meta-game about buying the game itself
- **Universal Paperclips** - Narrative through mechanics
