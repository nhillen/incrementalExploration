# Game Design Document: Project Museum

## 1. High-Level Concept

**The Pitch:** A "Museum" of incremental game mechanics. The player visits distinct "Exhibits," each a self-contained game representing a specific genre of idle gaming (Clicker, RPG, Loop, Puzzle).

**The Twist:** The player collects "Meta-Currency" from achievements within exhibits to buy **System-Level Cheats**. You play classic games, but you use modern, meta-level powers to break them, speed-run them, and eventually "solve" them.

## 2. Core Gameplay Loop

The game operates on a strictly separated **Hub & Spoke** model.

1. **Enter Exhibit:** Player selects a module (e.g., "The Bakery") from the Museum Lobby.
2. **Active Play:** Player engages with the specific mechanics of that module (clicking, buying buildings).
3. **Milestones (The Uplink):** The module does *not* export gold/cookies. It exports **Milestone Signals** (e.g., "Baked 1 Million Items").
4. **Meta Reward:** Milestones grant **Museum Credits**.
5. **Meta Upgrade (The Downlink):** Player spends Credits in the Lobby on **Global Artifacts** (e.g., "Global Speed +50%", "Auto-Clicker 2.0").
6. **Retirement (The End State):** Once an Exhibit is mastered, it is "Archived." It is removed from active play and becomes a passive generator of Museum Credits.

## 3. Systems Architecture (The "Contract")

To allow for distinct game types (Godot implementation), we treat every game as a **Black Box**.

### A. The Module (The Exhibit)

Every mini-game (scene) must implement this strict interface:

* **Inputs (Global Modifiers):** The module must accept a dictionary of buffs from the Meta.
  * *Example:* `Game.start( global_speed_mult: 2.0, auto_click_rate: 5 )`

* **Outputs (Signals):** The module never touches the global wallet. It only emits status updates.
  * *Example:* `signal milestone_unlocked(id: String)`

* **State:** The module manages its own save data.
  * *Example:* `func get_save_blob()` and `func load_save_blob()`

### B. The Meta Layer (The Curator)

The Meta layer handles the economy outside the games.

* **The Ticket Counter:** Stores the **Museum Credits** (Hard Currency).
* **The Collection:** A list of `Resource` files defining which Exhibits are unlocked.
* **The Modifier Engine:** Calculates the total "Cheat" values (Speed, Luck, Automation) based on purchased upgrades and passes them down to the active Exhibit.

## 4. Progression Mechanics

### Phase 1: Exploration (Active)

* Player enters a fresh Exhibit.
* Progress is slow/standard.
* Player earns early Milestones → buys generic Meta Upgrades (e.g., "Start next run with 10% resources").

### Phase 2: Domination (Synergy)

* Player returns to the Exhibit with Meta Upgrades.
* The game is now faster/easier than the original design intended.
* Player hits high-tier Milestones → unlocks "Specific Artifacts" (e.g., "Unlocks the Auto-Buyer logic for all Exhibits").

### Phase 3: Archival (Passive)

* **Trigger:** Player completes 100% of an Exhibit's Milestones.
* **Effect:** The Exhibit gets a "Gold Frame" in the menu.
* **Benefit:** The player no longer needs to enter the Exhibit. The Exhibit now generates a flat rate of Museum Credits per second, simulating "Ticket Sales" from visitors coming to see your completed work.
* **Why this works:** It prevents "tab fatigue." You don't have 10 tabs open; you have 1 active game and 5 "retired" games paying your salary.

## 5. UI/UX Hierarchy

### The Lobby (Main Menu)

* **The Gallery:** A scrolling list or map of Exhibits.
  * *Visuals:* Locked exhibits are shrouded. Completed exhibits are Gold. Active exhibits show a progress bar (e.g., "45/100 Milestones").

* **The Gift Shop (Upgrades):**
  * **Tools:** Global buffs (Speed, Click Power).
  * **Tickets:** Unlock new Exhibits.
  * **Automation:** Unlocks logic (Auto-buyers, Macros).

### The Overlay (HUD)

When inside an Exhibit, a small, collapsible "Meta-HUD" sits on top of the game (Z-Index max).

* **Back to Museum:** Exit button.
* **Milestone Tracker:** "Next Reward at: 1 Billion Cookies."
* **Active Modifiers:** A tooltip showing "Global Speed: 2.5x active."

## 6. Technical Definition (Godot)

We will use a **Resource-based approach** to define the game structure without hardcoding.

**File:** `ExhibitDef.gd` (Resource)

```gdscript
extends Resource
class_name ExhibitDef

@export_group("Meta Data")
@export var id: String = "exhibit_01"
@export var title: String = "The Bakery"
@export var icon: Texture2D
@export var scene_path: String = "res://games/bakery/main.tscn"

@export_group("Economy")
@export var unlock_cost: int = 100
@export var passive_income_on_retirement: int = 10

@export_group("Milestones")
@export var milestones: Array[MilestoneResource] # Array of achievements
```

## 7. Next Steps (Development Roadmap)

1. **Build the Frame:** Create the Lobby, the Save System, and the "Meta Wallet."
2. **Build the "Dummy" Exhibit:** A minimal button-clicker that just implements the Contract (emits a signal when clicked 10 times).
3. **Verify the Loop:** Ensure clicking the dummy → getting the milestone → getting credits → buying an upgrade works.
4. **Develop Exhibit A:** The first real game (The "Clicker" archetype).
