import type { Modifiers, ExhibitDef, ExhibitState, MilestoneDef } from './types';
import { DEFAULT_MODIFIERS } from './types';

type CuratorEventType = 'creditsChanged' | 'exhibitUnlocked' | 'milestoneCompleted' | 'exhibitArchived';
type CuratorListener = (data: unknown) => void;

/**
 * The Curator: Meta layer that manages the museum economy.
 *
 * Responsibilities:
 * - Store Museum Credits (the meta currency)
 * - Track global modifiers (speed, luck, automation)
 * - Registry of all exhibits and their states
 * - Process milestone rewards
 * - Calculate passive income from archived exhibits
 */
class Curator {
  private _credits: number = 0;
  private _modifiers: Modifiers = { ...DEFAULT_MODIFIERS };
  private _purchasedUpgrades: string[] = [];

  private exhibits: Map<string, ExhibitDef> = new Map();
  private exhibitStates: Map<string, ExhibitState> = new Map();

  private listeners: Map<CuratorEventType, Set<CuratorListener>> = new Map();

  // Passive income accumulator (for fractional credits)
  private passiveIncomeAccumulator: number = 0;

  get credits(): number {
    return this._credits;
  }

  get modifiers(): Modifiers {
    return { ...this._modifiers };
  }

  /**
   * Register an exhibit definition
   */
  registerExhibit(def: ExhibitDef): void {
    this.exhibits.set(def.id, def);

    // Initialize state if not exists
    if (!this.exhibitStates.has(def.id)) {
      this.exhibitStates.set(def.id, {
        unlocked: def.unlockCost === 0, // Free exhibits start unlocked
        archived: false,
        completedMilestones: [],
        lastTickTime: Date.now(),
        exhibitData: null,
      });
    }
  }

  /**
   * Get exhibit definition by ID
   */
  getExhibitDef(id: string): ExhibitDef | undefined {
    return this.exhibits.get(id);
  }

  /**
   * Get exhibit state by ID
   */
  getExhibitState(id: string): ExhibitState | undefined {
    return this.exhibitStates.get(id);
  }

  /**
   * Get all registered exhibits
   */
  getAllExhibits(): Array<{ def: ExhibitDef; state: ExhibitState }> {
    const result: Array<{ def: ExhibitDef; state: ExhibitState }> = [];
    for (const [id, def] of this.exhibits) {
      const state = this.exhibitStates.get(id);
      if (state) {
        result.push({ def, state });
      }
    }
    return result;
  }

  /**
   * Add credits to the wallet
   */
  addCredits(amount: number): void {
    this._credits += amount;
    this.emit('creditsChanged', this._credits);
  }

  /**
   * Spend credits (returns false if insufficient)
   */
  spendCredits(amount: number): boolean {
    if (this._credits >= amount) {
      this._credits -= amount;
      this.emit('creditsChanged', this._credits);
      return true;
    }
    return false;
  }

  /**
   * Unlock an exhibit
   */
  unlockExhibit(exhibitId: string): boolean {
    const def = this.exhibits.get(exhibitId);
    const state = this.exhibitStates.get(exhibitId);

    if (!def || !state || state.unlocked) {
      return false;
    }

    if (this.spendCredits(def.unlockCost)) {
      state.unlocked = true;
      this.emit('exhibitUnlocked', exhibitId);
      return true;
    }
    return false;
  }

  /**
   * Called when an exhibit emits a milestone signal
   */
  onMilestoneUnlocked(exhibitId: string, milestoneId: string): void {
    const def = this.exhibits.get(exhibitId);
    const state = this.exhibitStates.get(exhibitId);

    if (!def || !state) return;
    if (state.completedMilestones.includes(milestoneId)) return;

    // Find the milestone definition
    const milestone = def.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    // Award credits
    state.completedMilestones.push(milestoneId);
    this.addCredits(milestone.creditReward);

    this.emit('milestoneCompleted', { exhibitId, milestoneId, reward: milestone.creditReward });

    // Check for archival (100% completion)
    if (state.completedMilestones.length === def.milestones.length && !state.archived) {
      state.archived = true;
      this.emit('exhibitArchived', exhibitId);
    }
  }

  /**
   * Process passive income from archived exhibits
   */
  tickPassiveIncome(deltaMs: number): void {
    let incomePerSecond = 0;

    for (const [id, state] of this.exhibitStates) {
      if (state.archived) {
        const def = this.exhibits.get(id);
        if (def) {
          incomePerSecond += def.passiveIncomeOnRetirement;
        }
      }
    }

    if (incomePerSecond > 0) {
      this.passiveIncomeAccumulator += incomePerSecond * (deltaMs / 1000);
      const wholeCredits = Math.floor(this.passiveIncomeAccumulator);
      if (wholeCredits > 0) {
        this.passiveIncomeAccumulator -= wholeCredits;
        this.addCredits(wholeCredits);
      }
    }
  }

  /**
   * Update exhibit's last tick time
   */
  updateExhibitTickTime(exhibitId: string, time: number): void {
    const state = this.exhibitStates.get(exhibitId);
    if (state) {
      state.lastTickTime = time;
    }
  }

  /**
   * Store exhibit-specific save data
   */
  setExhibitData(exhibitId: string, data: unknown): void {
    const state = this.exhibitStates.get(exhibitId);
    if (state) {
      state.exhibitData = data;
    }
  }

  /**
   * Get exhibit-specific save data
   */
  getExhibitData(exhibitId: string): unknown {
    return this.exhibitStates.get(exhibitId)?.exhibitData;
  }

  /**
   * Apply a modifier upgrade
   */
  applyModifierUpgrade(key: keyof Modifiers, delta: number): void {
    this._modifiers[key] += delta;
  }

  /**
   * Get milestone info for an exhibit
   */
  getMilestoneStatus(exhibitId: string): Array<MilestoneDef & { completed: boolean }> {
    const def = this.exhibits.get(exhibitId);
    const state = this.exhibitStates.get(exhibitId);

    if (!def || !state) return [];

    return def.milestones.map((m) => ({
      ...m,
      completed: state.completedMilestones.includes(m.id),
    }));
  }

  // Event system
  on(event: CuratorEventType, callback: CuratorListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: CuratorEventType, callback: CuratorListener): void {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: CuratorEventType, data: unknown): void {
    this.listeners.get(event)?.forEach((cb) => cb(data));
  }

  /**
   * Export state for saving
   */
  exportSaveData(): {
    credits: number;
    modifiers: Modifiers;
    purchasedUpgrades: string[];
    exhibits: Record<string, ExhibitState>;
  } {
    const exhibits: Record<string, ExhibitState> = {};
    for (const [id, state] of this.exhibitStates) {
      exhibits[id] = { ...state };
    }
    return {
      credits: this._credits,
      modifiers: { ...this._modifiers },
      purchasedUpgrades: [...this._purchasedUpgrades],
      exhibits,
    };
  }

  /**
   * Import state from save
   */
  importSaveData(data: {
    credits: number;
    modifiers: Modifiers;
    purchasedUpgrades: string[];
    exhibits: Record<string, ExhibitState>;
  }): void {
    this._credits = data.credits;
    this._modifiers = { ...data.modifiers };
    this._purchasedUpgrades = [...data.purchasedUpgrades];

    for (const [id, state] of Object.entries(data.exhibits)) {
      if (this.exhibitStates.has(id)) {
        this.exhibitStates.set(id, { ...state });
      }
    }

    this.emit('creditsChanged', this._credits);
  }
}

// Singleton instance
export const curator = new Curator();
