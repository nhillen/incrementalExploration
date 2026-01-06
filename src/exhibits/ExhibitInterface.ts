import type { Modifiers, MilestoneCallback } from '@/core/types';

/**
 * The Contract: Every exhibit must implement this interface.
 *
 * Exhibits are "black boxes" - they:
 * - Receive modifiers from the meta layer (downlink)
 * - Emit milestone signals (uplink)
 * - Manage their own internal state
 * - Never touch the global credits wallet directly
 */
export interface ExhibitInstance {
  /** Unique identifier matching the ExhibitDef */
  readonly id: string;

  /**
   * Initialize the exhibit with global modifiers.
   * Called when the exhibit is first loaded or when modifiers change.
   */
  init(modifiers: Modifiers): void;

  /**
   * Update the exhibit state.
   * @param deltaMs - Time elapsed since last update in milliseconds
   * @param isActive - True if this exhibit is currently visible/focused
   *
   * When isActive is false, deltaMs may be large (catch-up scenario).
   * Exhibits should handle this gracefully (e.g., calculate bulk progress).
   */
  update(deltaMs: number, isActive: boolean): void;

  /**
   * Get the exhibit's current state for saving.
   * This should be a serializable object.
   */
  getState(): unknown;

  /**
   * Load previously saved state.
   */
  loadState(state: unknown): void;

  /**
   * Render the exhibit UI.
   * Returns the root DOM element for this exhibit.
   * Called once; the exhibit should update its own DOM thereafter.
   */
  render(): HTMLElement;

  /**
   * Subscribe to milestone events.
   * The curator will call this to listen for achievements.
   */
  onMilestone(callback: MilestoneCallback): void;

  /**
   * Clean up when exhibit is unmounted (optional).
   */
  destroy?(): void;
}

/**
 * Factory function type for creating exhibit instances
 */
export type ExhibitFactory = () => ExhibitInstance;
