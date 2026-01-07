import type { ExhibitInstance } from '../ExhibitInterface';
import type { Modifiers, MilestoneCallback, ExhibitDef } from '@/core/types';

/**
 * Building definition
 */
interface BuildingDef {
  id: string;
  name: string;
  emoji: string;
  baseCost: number;
  baseCps: number; // cupcakes per second
  description: string;
}

/**
 * Upgrade definition
 */
interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlockCondition: (state: CupcakeState) => boolean;
  effect: (state: CupcakeState) => void;
}

/**
 * Building definitions - Cookie Clicker style progression
 */
const BUILDINGS: BuildingDef[] = [
  { id: 'cursor', name: 'Auto-Clicker', emoji: '👆', baseCost: 15, baseCps: 0.1, description: 'Clicks once every 10 seconds' },
  { id: 'oven', name: 'Oven', emoji: '🔥', baseCost: 100, baseCps: 1, description: 'Bakes 1 cupcake per second' },
  { id: 'bakery', name: 'Bakery', emoji: '🏪', baseCost: 1100, baseCps: 8, description: 'A small bakery producing cupcakes' },
  { id: 'factory', name: 'Factory', emoji: '🏭', baseCost: 12000, baseCps: 47, description: 'Mass-produces cupcakes' },
  { id: 'mine', name: 'Sugar Mine', emoji: '⛏️', baseCost: 130000, baseCps: 260, description: 'Mines sugar for cupcakes' },
  { id: 'portal', name: 'Portal', emoji: '🌀', baseCost: 1400000, baseCps: 1400, description: 'Opens a portal to the cupcake dimension' },
  { id: 'alchemy', name: 'Alchemy Lab', emoji: '⚗️', baseCost: 20000000, baseCps: 7800, description: 'Transmutes gold into cupcakes' },
];

/**
 * Upgrade definitions
 */
const UPGRADES: UpgradeDef[] = [
  // Cursor upgrades
  { id: 'reinforced-finger', name: 'Reinforced Finger', description: 'Clicking gains +1 cupcake', cost: 100,
    unlockCondition: (s) => s.buildings.cursor >= 1,
    effect: (s) => { s.clickPower += 1; }
  },
  { id: 'carpal-tunnel', name: 'Carpal Tunnel Prevention', description: 'Clicking gains +1 cupcake', cost: 500,
    unlockCondition: (s) => s.buildings.cursor >= 1,
    effect: (s) => { s.clickPower += 1; }
  },
  { id: 'ambidextrous', name: 'Ambidextrous', description: 'Clicking gains +5 cupcakes', cost: 10000,
    unlockCondition: (s) => s.buildings.cursor >= 10,
    effect: (s) => { s.clickPower += 5; }
  },
  // Oven upgrades
  { id: 'better-ovens', name: 'Better Ovens', description: 'Ovens are twice as efficient', cost: 1000,
    unlockCondition: (s) => s.buildings.oven >= 1,
    effect: (s) => { s.buildingMultipliers.oven *= 2; }
  },
  { id: 'convection', name: 'Convection Heating', description: 'Ovens are twice as efficient', cost: 5000,
    unlockCondition: (s) => s.buildings.oven >= 5,
    effect: (s) => { s.buildingMultipliers.oven *= 2; }
  },
  // Bakery upgrades
  { id: 'bigger-bakery', name: 'Bigger Bakeries', description: 'Bakeries are twice as efficient', cost: 11000,
    unlockCondition: (s) => s.buildings.bakery >= 1,
    effect: (s) => { s.buildingMultipliers.bakery *= 2; }
  },
  { id: 'franchise', name: 'Franchise Model', description: 'Bakeries are twice as efficient', cost: 55000,
    unlockCondition: (s) => s.buildings.bakery >= 5,
    effect: (s) => { s.buildingMultipliers.bakery *= 2; }
  },
  // Factory upgrades
  { id: 'automation', name: 'Full Automation', description: 'Factories are twice as efficient', cost: 120000,
    unlockCondition: (s) => s.buildings.factory >= 1,
    effect: (s) => { s.buildingMultipliers.factory *= 2; }
  },
  // Mine upgrades
  { id: 'sugar-gas', name: 'Sugar Gas', description: 'Sugar Mines are twice as efficient', cost: 1300000,
    unlockCondition: (s) => s.buildings.mine >= 1,
    effect: (s) => { s.buildingMultipliers.mine *= 2; }
  },
  // Global upgrades
  { id: 'lucky-day', name: 'Lucky Day', description: '+10% CpS', cost: 77777,
    unlockCondition: (s) => s.totalCupcakes >= 77777,
    effect: (s) => { s.globalCpsMultiplier *= 1.1; }
  },
  { id: 'serendipity', name: 'Serendipity', description: '+10% CpS', cost: 777777,
    unlockCondition: (s) => s.totalCupcakes >= 777777,
    effect: (s) => { s.globalCpsMultiplier *= 1.1; }
  },
];

/**
 * Cupcake Clicker state
 */
interface CupcakeState {
  cupcakes: number;
  totalClicks: number;
  totalCupcakes: number;
  clickPower: number;
  globalCpsMultiplier: number;
  buildings: Record<string, number>;
  buildingMultipliers: Record<string, number>;
  purchasedUpgrades: string[];
}

/**
 * Exhibit definition for Cupcake Clicker
 */
export const cupcakeClickerDef: ExhibitDef = {
  id: 'cupcake-clicker',
  title: 'Cupcake Clicker',
  description: 'Click to bake cupcakes! A simple start to your museum journey.',
  unlockCost: 0,
  passiveIncomeOnRetirement: 5,
  milestones: [
    { id: 'first-cupcake', title: 'First Cupcake', description: 'Bake your first cupcake', creditReward: 5 },
    { id: 'baker-dozen', title: "Baker's Dozen", description: 'Bake 13 cupcakes', creditReward: 10 },
    { id: 'cupcake-100', title: 'Cupcake Apprentice', description: 'Bake 100 cupcakes', creditReward: 15 },
    { id: 'cupcake-1000', title: 'Cupcake Master', description: 'Bake 1,000 cupcakes', creditReward: 25 },
    { id: 'first-oven', title: 'First Oven', description: 'Buy your first oven', creditReward: 10 },
    { id: 'cupcake-10000', title: 'Cupcake Tycoon', description: 'Bake 10,000 cupcakes', creditReward: 50 },
    { id: 'cupcake-million', title: 'Cupcake Millionaire', description: 'Bake 1,000,000 cupcakes', creditReward: 100 },
  ],
};

const MILESTONE_THRESHOLDS: Record<string, (s: CupcakeState) => boolean> = {
  'first-cupcake': (s) => s.totalCupcakes >= 1,
  'baker-dozen': (s) => s.totalCupcakes >= 13,
  'cupcake-100': (s) => s.totalCupcakes >= 100,
  'cupcake-1000': (s) => s.totalCupcakes >= 1000,
  'first-oven': (s) => s.buildings.oven >= 1,
  'cupcake-10000': (s) => s.totalCupcakes >= 10000,
  'cupcake-million': (s) => s.totalCupcakes >= 1000000,
};

function createDefaultState(): CupcakeState {
  const buildings: Record<string, number> = {};
  const buildingMultipliers: Record<string, number> = {};
  for (const b of BUILDINGS) {
    buildings[b.id] = 0;
    buildingMultipliers[b.id] = 1;
  }
  return {
    cupcakes: 0,
    totalClicks: 0,
    totalCupcakes: 0,
    clickPower: 1,
    globalCpsMultiplier: 1,
    buildings,
    buildingMultipliers,
    purchasedUpgrades: [],
  };
}

/**
 * Format large numbers
 */
function formatNumber(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + ' trillion';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + ' billion';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + ' million';
  if (n >= 1e4) return (n / 1e3).toFixed(1) + 'k';
  if (n >= 100) return Math.floor(n).toLocaleString();
  if (n >= 1) return n.toFixed(1);
  return n.toFixed(2);
}

/**
 * Calculate building cost with scaling (1.15x per owned)
 */
function getBuildingCost(def: BuildingDef, owned: number): number {
  return Math.floor(def.baseCost * Math.pow(1.15, owned));
}

/**
 * Cupcake Clicker Exhibit
 */
export function createCupcakeClicker(): ExhibitInstance {
  let state = createDefaultState();
  let modifiers: Modifiers;
  let milestoneCallback: MilestoneCallback | null = null;
  let unlockedMilestones: Set<string> = new Set();

  // DOM elements
  let container: HTMLElement;
  let counterEl: HTMLElement;
  let cpsEl: HTMLElement;
  let buildingsContainer: HTMLElement;
  let upgradesContainer: HTMLElement;

  function calculateCps(): number {
    let cps = 0;
    for (const b of BUILDINGS) {
      const count = state.buildings[b.id] || 0;
      const mult = state.buildingMultipliers[b.id] || 1;
      cps += b.baseCps * count * mult;
    }
    return cps * state.globalCpsMultiplier * modifiers.speedMult;
  }

  function checkMilestones(): void {
    for (const [milestoneId, checkFn] of Object.entries(MILESTONE_THRESHOLDS)) {
      if (!unlockedMilestones.has(milestoneId) && checkFn(state)) {
        unlockedMilestones.add(milestoneId);
        milestoneCallback?.(milestoneId);
      }
    }
  }

  function updateDisplay(): void {
    if (counterEl) {
      counterEl.textContent = formatNumber(state.cupcakes) + ' cupcakes';
    }
    if (cpsEl) {
      const cps = calculateCps();
      cpsEl.textContent = `per second: ${formatNumber(cps)}`;
    }
    updateBuildingButtons();
    updateUpgradeButtons();
  }

  function updateBuildingButtons(): void {
    if (!buildingsContainer) return;
    const buttons = buildingsContainer.querySelectorAll('.building-btn');
    buttons.forEach((btn, i) => {
      const def = BUILDINGS[i];
      const cost = getBuildingCost(def, state.buildings[def.id] || 0);
      const canAfford = state.cupcakes >= cost;
      btn.classList.toggle('affordable', canAfford);
      btn.classList.toggle('disabled', !canAfford);

      const costEl = btn.querySelector('.building-cost');
      if (costEl) costEl.textContent = formatNumber(cost);

      const countEl = btn.querySelector('.building-count');
      if (countEl) countEl.textContent = String(state.buildings[def.id] || 0);
    });
  }

  function updateUpgradeButtons(): void {
    if (!upgradesContainer) return;
    upgradesContainer.innerHTML = '';

    for (const upgrade of UPGRADES) {
      if (state.purchasedUpgrades.includes(upgrade.id)) continue;
      if (!upgrade.unlockCondition(state)) continue;

      const canAfford = state.cupcakes >= upgrade.cost;
      const btn = document.createElement('button');
      btn.className = `upgrade-btn ${canAfford ? 'affordable' : 'disabled'}`;
      btn.innerHTML = `
        <div class="upgrade-name">${upgrade.name}</div>
        <div class="upgrade-desc">${upgrade.description}</div>
        <div class="upgrade-cost">${formatNumber(upgrade.cost)}</div>
      `;
      btn.addEventListener('click', () => buyUpgrade(upgrade));
      upgradesContainer.appendChild(btn);
    }
  }

  function handleClick(): void {
    const power = state.clickPower * modifiers.clickPowerMult;
    state.cupcakes += power;
    state.totalCupcakes += power;
    state.totalClicks++;

    // Click animation
    if (container) {
      const pop = document.createElement('div');
      pop.className = 'click-pop';
      pop.textContent = '+' + formatNumber(power);
      pop.style.left = (Math.random() * 60 + 20) + '%';
      container.querySelector('.clicker-area')?.appendChild(pop);
      setTimeout(() => pop.remove(), 800);
    }

    updateDisplay();
    checkMilestones();
  }

  function buyBuilding(def: BuildingDef): void {
    const cost = getBuildingCost(def, state.buildings[def.id] || 0);
    if (state.cupcakes >= cost) {
      state.cupcakes -= cost;
      state.buildings[def.id] = (state.buildings[def.id] || 0) + 1;
      updateDisplay();
      checkMilestones();
    }
  }

  function buyUpgrade(upgrade: UpgradeDef): void {
    if (state.cupcakes >= upgrade.cost && !state.purchasedUpgrades.includes(upgrade.id)) {
      state.cupcakes -= upgrade.cost;
      state.purchasedUpgrades.push(upgrade.id);
      upgrade.effect(state);
      updateDisplay();
      checkMilestones();
    }
  }

  function renderBuildings(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'buildings-list';

    for (const def of BUILDINGS) {
      const btn = document.createElement('button');
      btn.className = 'building-btn';
      btn.innerHTML = `
        <span class="building-emoji">${def.emoji}</span>
        <div class="building-info">
          <div class="building-name">${def.name}</div>
          <div class="building-cps">${formatNumber(def.baseCps)} CpS each</div>
        </div>
        <div class="building-right">
          <div class="building-cost">${formatNumber(def.baseCost)}</div>
          <div class="building-count">0</div>
        </div>
      `;
      btn.title = def.description;
      btn.addEventListener('click', () => buyBuilding(def));
      container.appendChild(btn);
    }

    return container;
  }

  return {
    id: 'cupcake-clicker',

    init(mods: Modifiers): void {
      modifiers = mods;
    },

    update(deltaMs: number, isActive: boolean): void {
      const cps = calculateCps();
      if (cps > 0) {
        const earned = cps * (deltaMs / 1000);
        state.cupcakes += earned;
        state.totalCupcakes += earned;
        if (isActive) {
          updateDisplay();
        }
        checkMilestones();
      }
    },

    getState(): CupcakeState {
      return JSON.parse(JSON.stringify(state));
    },

    loadState(saved: unknown): void {
      if (saved && typeof saved === 'object') {
        const s = saved as Partial<CupcakeState>;
        const defaults = createDefaultState();
        state = {
          cupcakes: s.cupcakes ?? 0,
          totalClicks: s.totalClicks ?? 0,
          totalCupcakes: s.totalCupcakes ?? 0,
          clickPower: s.clickPower ?? 1,
          globalCpsMultiplier: s.globalCpsMultiplier ?? 1,
          buildings: { ...defaults.buildings, ...s.buildings },
          buildingMultipliers: { ...defaults.buildingMultipliers, ...s.buildingMultipliers },
          purchasedUpgrades: s.purchasedUpgrades ?? [],
        };
        // Rebuild unlocked milestones
        for (const [milestoneId, checkFn] of Object.entries(MILESTONE_THRESHOLDS)) {
          if (checkFn(state)) {
            unlockedMilestones.add(milestoneId);
          }
        }
      }
    },

    render(): HTMLElement {
      container = document.createElement('div');
      container.className = 'cupcake-clicker';

      // Left side: clicker area
      const clickerArea = document.createElement('div');
      clickerArea.className = 'clicker-area';

      counterEl = document.createElement('div');
      counterEl.className = 'cupcake-counter';

      cpsEl = document.createElement('div');
      cpsEl.className = 'cupcake-cps';

      const button = document.createElement('button');
      button.className = 'cupcake-button';
      button.textContent = '🧁';
      button.addEventListener('click', handleClick);

      clickerArea.appendChild(counterEl);
      clickerArea.appendChild(cpsEl);
      clickerArea.appendChild(button);

      // Right side: shop
      const shopArea = document.createElement('div');
      shopArea.className = 'shop-area';

      const upgradesHeader = document.createElement('h3');
      upgradesHeader.textContent = 'Upgrades';
      upgradesContainer = document.createElement('div');
      upgradesContainer.className = 'upgrades-list';

      const buildingsHeader = document.createElement('h3');
      buildingsHeader.textContent = 'Buildings';
      buildingsContainer = renderBuildings();

      shopArea.appendChild(upgradesHeader);
      shopArea.appendChild(upgradesContainer);
      shopArea.appendChild(buildingsHeader);
      shopArea.appendChild(buildingsContainer);

      container.appendChild(clickerArea);
      container.appendChild(shopArea);

      updateDisplay();
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
