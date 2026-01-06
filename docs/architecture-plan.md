# Project Museum: Web Architecture Plan

## Tech Stack Recommendation

### Core
- **TypeScript** - Type safety is valuable for the contract/interface pattern between exhibits and meta layer
- **Vite** - Fast dev server, clean builds, no config headaches

### UI Layer
- **Preact** - React-like but 3KB, fast enough for incremental math, familiar patterns
  - Alternative: Vanilla TS with a simple reactive state library (like nanostores)
  - We can start simple and add Preact later if needed

### Styling
- **CSS Modules** or vanilla CSS - Keep it simple, no heavy framework needed

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      LOBBY (UI)                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Exhibit │ │ Exhibit │ │ Exhibit │ │  Gift   │       │
│  │  Tab 1  │ │  Tab 2  │ │  Tab 3  │ │  Shop   │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    CURATOR (Meta Layer)                 │
│  - Museum Credits (wallet)                              │
│  - Global Modifiers (speed, luck, automation)           │
│  - Exhibit Registry                                     │
│  - Game Loop (ticks all exhibits, active or background) │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │ Exhibit A │   │ Exhibit B │   │ Exhibit C │
    │ (Clicker) │   │  (RPG)    │   │ (Factory) │
    │           │   │           │   │           │
    │ Own state │   │ Own state │   │ Own state │
    │ Own logic │   │ Own logic │   │ Own logic │
    └───────────┘   └───────────┘   └───────────┘
```

---

## The Exhibit Contract (Interface)

Each exhibit is an ES module that exports these functions:

```typescript
// src/exhibits/ExhibitInterface.ts

export interface ExhibitConfig {
  id: string;
  title: string;
  description: string;
  unlockCost: number;
  passiveIncomeOnRetirement: number;
  milestones: MilestoneDef[];
}

export interface Modifiers {
  speedMult: number;
  clickPowerMult: number;
  autoClickRate: number;
  luckMult: number;
}

export interface ExhibitInstance {
  // Lifecycle
  init(modifiers: Modifiers): void;

  // Game loop - called every frame when active, less often when background
  update(deltaMs: number, isActive: boolean): void;

  // State management
  getState(): unknown;  // Exhibit-specific save blob
  loadState(state: unknown): void;

  // UI - returns the DOM element or render function
  render(): HTMLElement;

  // Milestones - curator subscribes to this
  onMilestone(callback: (milestoneId: string) => void): void;
}
```

---

## File Structure

```
/src
  /core
    curator.ts          # Meta layer singleton
    save-manager.ts     # LocalStorage + import/export
    game-loop.ts        # requestAnimationFrame loop
    types.ts            # Shared interfaces

  /exhibits
    ExhibitInterface.ts # The contract
    /clicker            # First exhibit
      index.ts          # Implements ExhibitInterface
      state.ts          # Clicker-specific state
      ui.ts             # Clicker-specific UI
    /bakery             # Second exhibit (future)
    ...

  /ui
    lobby.ts            # Main menu / gallery
    gift-shop.ts        # Upgrades store
    tab-manager.ts      # Handles exhibit tabs
    hud.ts              # Meta overlay when in exhibit

  /data
    exhibits.json       # Exhibit definitions (or .ts for type safety)
    upgrades.json       # Global upgrade definitions

  main.ts               # Entry point
  index.html

/docs
  GDD.md               # Already created
  architecture.md      # This file (expanded)
```

---

## Game Loop Strategy

```typescript
// Pseudocode
class GameLoop {
  private exhibits: Map<string, ExhibitInstance>;
  private activeExhibitId: string | null;

  tick(deltaMs: number) {
    for (const [id, exhibit] of this.exhibits) {
      const isActive = id === this.activeExhibitId;

      // Active exhibit: full speed updates
      // Background exhibits: reduced tick rate OR catch-up on focus
      if (isActive) {
        exhibit.update(deltaMs, true);
      } else {
        // Option A: Tick at reduced rate (e.g., every 1 second)
        // Option B: Don't tick, calculate catch-up when switching to it
        // Option C: Web Worker for background math (future optimization)
      }
    }

    // Process passive income from archived exhibits
    this.curator.tickPassiveIncome(deltaMs);
  }
}
```

---

## Save System

Single save object in LocalStorage:

```typescript
interface SaveData {
  version: number;
  timestamp: number;
  meta: {
    credits: number;
    modifiers: Modifiers;
    purchasedUpgrades: string[];
  };
  exhibits: {
    [exhibitId: string]: {
      unlocked: boolean;
      archived: boolean;
      completedMilestones: string[];
      state: unknown;  // Exhibit-specific blob
    };
  };
}
```

Export = JSON.stringify + download
Import = File picker + JSON.parse + validation

---

## Open Questions for You

1. **Background simulation**: When player is in Exhibit A, should Exhibit B:
   - A) Pause completely (simplest)
   - B) Tick at reduced rate (medium complexity)
   - C) Calculate catch-up time when switching (most "idle game" feel)

2. **Tab UI**: Are you envisioning:
   - Browser-style tabs at the top?
   - A sidebar gallery?
   - Cards/tiles you click to enter?

3. **Starting point**: Should we:
   - A) Build the frame first (Curator, save system, empty lobby)
   - B) Build a minimal "dummy clicker" exhibit first to prove the contract
   - C) Both in parallel

---

## Suggested Implementation Order

1. **Core scaffold**: Vite + TS project setup, file structure
2. **Curator + Types**: Define the interfaces, basic curator with credits
3. **Dummy exhibit**: 10-click button that emits a milestone
4. **Verify loop**: Click → milestone → credits → see it work
5. **Save system**: LocalStorage persistence
6. **Lobby UI**: Basic gallery showing the dummy exhibit
7. **First real exhibit**: The Clicker archetype
