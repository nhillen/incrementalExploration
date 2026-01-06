import type { ExhibitInstance } from '../ExhibitInterface';
import type { Modifiers, MilestoneCallback, ExhibitDef } from '@/core/types';

/**
 * Cupcake Clicker state
 */
interface CupcakeState {
  cupcakes: number;
  totalClicks: number;
  totalCupcakes: number; // lifetime, for milestones
}

/**
 * Exhibit definition for Cupcake Clicker
 */
export const cupcakeClickerDef: ExhibitDef = {
  id: 'cupcake-clicker',
  title: 'Cupcake Clicker',
  description: 'Click to bake cupcakes! A simple start to your museum journey.',
  unlockCost: 0, // Starts unlocked
  passiveIncomeOnRetirement: 5,
  milestones: [
    { id: 'first-cupcake', title: 'First Cupcake', description: 'Bake your first cupcake', creditReward: 5 },
    { id: 'baker-dozen', title: "Baker's Dozen", description: 'Bake 13 cupcakes', creditReward: 10 },
    { id: 'cupcake-50', title: 'Cupcake Enthusiast', description: 'Bake 50 cupcakes', creditReward: 15 },
    { id: 'cupcake-100', title: 'Cupcake Apprentice', description: 'Bake 100 cupcakes', creditReward: 25 },
    { id: 'cupcake-500', title: 'Cupcake Baker', description: 'Bake 500 cupcakes', creditReward: 50 },
    { id: 'cupcake-1000', title: 'Cupcake Master', description: 'Bake 1,000 cupcakes', creditReward: 100 },
  ],
};

/**
 * Milestone thresholds
 */
const MILESTONE_THRESHOLDS: Record<string, number> = {
  'first-cupcake': 1,
  'baker-dozen': 13,
  'cupcake-50': 50,
  'cupcake-100': 100,
  'cupcake-500': 500,
  'cupcake-1000': 1000,
};

/**
 * Cupcake Clicker Exhibit
 */
export function createCupcakeClicker(): ExhibitInstance {
  // State
  let state: CupcakeState = {
    cupcakes: 0,
    totalClicks: 0,
    totalCupcakes: 0,
  };

  let modifiers: Modifiers;
  let milestoneCallback: MilestoneCallback | null = null;
  let unlockedMilestones: Set<string> = new Set();

  // DOM elements
  let container: HTMLElement;
  let counterEl: HTMLElement;
  let autoClickAccumulator = 0;

  function checkMilestones(): void {
    for (const [milestoneId, threshold] of Object.entries(MILESTONE_THRESHOLDS)) {
      if (!unlockedMilestones.has(milestoneId) && state.totalCupcakes >= threshold) {
        unlockedMilestones.add(milestoneId);
        milestoneCallback?.(milestoneId);
      }
    }
  }

  function updateDisplay(): void {
    if (counterEl) {
      counterEl.textContent = `${Math.floor(state.cupcakes)} cupcakes`;
    }
  }

  function handleClick(): void {
    const power = modifiers.clickPowerMult;
    state.cupcakes += power;
    state.totalCupcakes += power;
    state.totalClicks++;
    updateDisplay();
    checkMilestones();
  }

  return {
    id: 'cupcake-clicker',

    init(mods: Modifiers): void {
      modifiers = mods;
    },

    update(deltaMs: number, isActive: boolean): void {
      // Auto-click processing
      if (modifiers.autoClickRate > 0) {
        const clicksToProcess = modifiers.autoClickRate * (deltaMs / 1000) * modifiers.speedMult;

        if (isActive) {
          // Active: apply clicks incrementally for visual feedback
          autoClickAccumulator += clicksToProcess;
          const wholeClicks = Math.floor(autoClickAccumulator);
          if (wholeClicks > 0) {
            autoClickAccumulator -= wholeClicks;
            const cupcakesEarned = wholeClicks * modifiers.clickPowerMult;
            state.cupcakes += cupcakesEarned;
            state.totalCupcakes += cupcakesEarned;
            updateDisplay();
            checkMilestones();
          }
        } else {
          // Background/catch-up: bulk calculate
          const cupcakesEarned = clicksToProcess * modifiers.clickPowerMult;
          state.cupcakes += cupcakesEarned;
          state.totalCupcakes += cupcakesEarned;
          checkMilestones();
        }
      }
    },

    getState(): CupcakeState {
      return { ...state };
    },

    loadState(saved: unknown): void {
      if (saved && typeof saved === 'object') {
        const s = saved as Partial<CupcakeState>;
        state = {
          cupcakes: s.cupcakes ?? 0,
          totalClicks: s.totalClicks ?? 0,
          totalCupcakes: s.totalCupcakes ?? 0,
        };
        // Rebuild unlocked milestones from total
        for (const [milestoneId, threshold] of Object.entries(MILESTONE_THRESHOLDS)) {
          if (state.totalCupcakes >= threshold) {
            unlockedMilestones.add(milestoneId);
          }
        }
      }
    },

    render(): HTMLElement {
      container = document.createElement('div');
      container.className = 'cupcake-clicker';

      counterEl = document.createElement('div');
      counterEl.className = 'cupcake-counter';
      updateDisplay();

      const button = document.createElement('button');
      button.className = 'cupcake-button';
      button.textContent = '🧁';
      button.addEventListener('click', handleClick);

      const hint = document.createElement('p');
      hint.textContent = 'Click the cupcake!';
      hint.style.color = 'var(--text-secondary)';

      container.appendChild(counterEl);
      container.appendChild(button);
      container.appendChild(hint);

      return container;
    },

    onMilestone(callback: MilestoneCallback): void {
      milestoneCallback = callback;
    },

    destroy(): void {
      milestoneCallback = null;
    },
  };
}
