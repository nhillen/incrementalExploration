/**
 * Global modifiers passed from Meta layer to Exhibits
 */
export interface Modifiers {
  speedMult: number;
  clickPowerMult: number;
  autoClickRate: number; // clicks per second, 0 = disabled
  luckMult: number;
}

/**
 * Default modifiers for a fresh game
 */
export const DEFAULT_MODIFIERS: Modifiers = {
  speedMult: 1.0,
  clickPowerMult: 1.0,
  autoClickRate: 0,
  luckMult: 1.0,
};

/**
 * Definition of a milestone/achievement within an exhibit
 */
export interface MilestoneDef {
  id: string;
  title: string;
  description: string;
  creditReward: number;
}

/**
 * Static definition of an exhibit (loaded from config)
 */
export interface ExhibitDef {
  id: string;
  title: string;
  description: string;
  unlockCost: number; // 0 = starts unlocked
  passiveIncomeOnRetirement: number; // credits/second when archived
  milestones: MilestoneDef[];
}

/**
 * Runtime state of an exhibit
 */
export interface ExhibitState {
  unlocked: boolean;
  archived: boolean;
  completedMilestones: string[];
  lastTickTime: number; // for catch-up calculation
  exhibitData: unknown; // exhibit-specific save blob
}

/**
 * Full save data structure
 */
export interface SaveData {
  version: number;
  timestamp: number;
  meta: {
    credits: number;
    modifiers: Modifiers;
    purchasedUpgrades: string[];
  };
  exhibits: Record<string, ExhibitState>;
}

/**
 * Callback for milestone events
 */
export type MilestoneCallback = (milestoneId: string) => void;
