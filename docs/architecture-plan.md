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
    /cupcake-clicker    # First exhibit (dummy/proof of concept)
      index.ts          # Implements ExhibitInterface
      state.ts          # Cupcake-specific state
      ui.ts             # Cupcake-specific UI
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

**Decision**: Hybrid catch-up approach
- Calculate offline progress when switching to an exhibit
- ALSO do periodic background catch-ups (every ~2-3 minutes) to enable notifications and make inactive exhibits feel "alive"

```typescript
// Pseudocode
class GameLoop {
  private exhibits: Map<string, ExhibitInstance>;
  private activeExhibitId: string | null;
  private lastBackgroundTick: Map<string, number>;  // Track per-exhibit
  private readonly BACKGROUND_INTERVAL = 2 * 60 * 1000; // 2 minutes

  tick(deltaMs: number) {
    const now = Date.now();

    for (const [id, exhibit] of this.exhibits) {
      const isActive = id === this.activeExhibitId;

      if (isActive) {
        // Active exhibit: full speed updates every frame
        exhibit.update(deltaMs, true);
        this.lastBackgroundTick.set(id, now);
      } else {
        // Background exhibit: periodic catch-up ticks
        const lastTick = this.lastBackgroundTick.get(id) || now;
        if (now - lastTick >= this.BACKGROUND_INTERVAL) {
          const catchUpMs = now - lastTick;
          exhibit.update(catchUpMs, false);
          this.lastBackgroundTick.set(id, now);
          // Opportunity to show notification if milestones hit
        }
      }
    }

    // Process passive income from archived exhibits
    this.curator.tickPassiveIncome(deltaMs);
  }

  // Called when switching to an exhibit - full catch-up
  onExhibitFocus(exhibitId: string) {
    const lastTick = this.lastBackgroundTick.get(exhibitId);
    if (lastTick) {
      const catchUpMs = Date.now() - lastTick;
      this.exhibits.get(exhibitId)?.update(catchUpMs, false);
    }
    this.activeExhibitId = exhibitId;
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

## Design Decisions

1. **Background simulation**: ✅ Hybrid approach
   - Calculate catch-up when switching to an exhibit
   - Also do periodic background ticks (~every 2-3 min) for notifications/liveliness

2. **Tab UI**: ✅ Start with tabs, iterate later
   - May evolve to something more bespoke

3. **Starting point**: ✅ Build dummy exhibit first
   - "Cupcake Clicker" - proves the contract works

---

## Implementation Order

1. **Core scaffold**: Vite + TS project setup, file structure
2. **Core types**: Define ExhibitInterface contract and shared types
3. **Curator**: Basic meta layer with credits and modifiers
4. **Cupcake Clicker**: Dummy exhibit that emits milestones
5. **Game loop**: With background catch-up support
6. **Lobby UI**: Basic tabs to switch between exhibits
7. **Save system**: LocalStorage + export/import
8. **Verify the loop**: Click → milestone → credits → upgrade → faster clicking
