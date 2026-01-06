import { curator } from './core/curator';
import { gameLoop } from './core/game-loop';
import { saveManager } from './core/save-manager';
import { lobby } from './ui/lobby';
import { createCupcakeClicker, cupcakeClickerDef } from './exhibits/cupcake-clicker';

/**
 * Project Museum - Entry Point
 */
function init(): void {
  console.log('🏛️ Project Museum starting...');

  const app = document.getElementById('app');
  if (!app) {
    console.error('App container not found!');
    return;
  }

  // Register exhibit definitions with curator
  curator.registerExhibit(cupcakeClickerDef);

  // Load saved game (if exists)
  saveManager.load();

  // Initialize lobby UI
  lobby.init(app);

  // Create and register exhibit instances
  const cupcakeClicker = createCupcakeClicker();

  // Load exhibit state from curator
  const savedState = curator.getExhibitData('cupcake-clicker');
  if (savedState) {
    cupcakeClicker.loadState(savedState);
  }

  lobby.registerExhibit(cupcakeClicker);

  // Start game loop
  gameLoop.start();

  // Start auto-save
  saveManager.startAutoSave();

  console.log('🏛️ Project Museum ready!');

  // Expose for debugging
  if (import.meta.env.DEV) {
    (window as unknown as Record<string, unknown>).museum = {
      curator,
      gameLoop,
      saveManager,
      lobby,
    };
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
