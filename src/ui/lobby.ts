import { curator } from '@/core/curator';
import { gameLoop } from '@/core/game-loop';
import type { ExhibitInstance } from '@/exhibits/ExhibitInterface';

/**
 * Lobby UI Manager
 *
 * Handles:
 * - Credits display
 * - Tab navigation between exhibits
 * - Exhibit rendering
 * - Milestone notifications
 */
class Lobby {
  private container: HTMLElement | null = null;
  private tabsContainer: HTMLElement | null = null;
  private exhibitContainer: HTMLElement | null = null;
  private creditsDisplay: HTMLElement | null = null;
  private exhibitInstances: Map<string, ExhibitInstance> = new Map();

  /**
   * Initialize the lobby UI
   */
  init(appElement: HTMLElement): void {
    this.container = appElement;
    this.render();
    this.bindEvents();
  }

  /**
   * Register an exhibit with the lobby
   */
  registerExhibit(exhibit: ExhibitInstance): void {
    this.exhibitInstances.set(exhibit.id, exhibit);

    // Wire up milestone callback to curator
    exhibit.onMilestone((milestoneId) => {
      curator.onMilestoneUnlocked(exhibit.id, milestoneId);
      this.showNotification(`Milestone unlocked!`);
    });

    // Add to game loop
    gameLoop.registerExhibit(exhibit);

    // Refresh tabs
    this.renderTabs();
  }

  private render(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="lobby">
        <header class="lobby-header">
          <h1>Project Museum</h1>
          <div class="credits-display">
            <span class="amount">0</span> Credits
          </div>
        </header>
        <nav class="tabs"></nav>
        <main class="exhibit-container">
          <p style="text-align: center; color: var(--text-secondary);">
            Select an exhibit to begin
          </p>
        </main>
      </div>
    `;

    this.tabsContainer = this.container.querySelector('.tabs');
    this.exhibitContainer = this.container.querySelector('.exhibit-container');
    this.creditsDisplay = this.container.querySelector('.credits-display .amount');
  }

  private renderTabs(): void {
    if (!this.tabsContainer) return;

    this.tabsContainer.innerHTML = '';

    const exhibits = curator.getAllExhibits();
    const activeId = gameLoop.getActiveExhibitId();

    for (const { def, state } of exhibits) {
      const tab = document.createElement('button');
      tab.className = 'tab';
      tab.dataset.exhibitId = def.id;
      tab.textContent = def.title;

      if (!state.unlocked) {
        tab.classList.add('locked');
        tab.textContent += ` (${def.unlockCost} credits)`;
      } else if (def.id === activeId) {
        tab.classList.add('active');
      }

      if (state.archived) {
        tab.textContent += ' ⭐';
      }

      this.tabsContainer.appendChild(tab);
    }
  }

  private bindEvents(): void {
    // Tab clicks
    this.tabsContainer?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('tab')) {
        const exhibitId = target.dataset.exhibitId;
        if (exhibitId) {
          this.switchToExhibit(exhibitId);
        }
      }
    });

    // Credits updates
    curator.on('creditsChanged', (credits) => {
      if (this.creditsDisplay) {
        this.creditsDisplay.textContent = String(credits);
      }
    });

    // Milestone completions
    curator.on('milestoneCompleted', (data) => {
      const { reward } = data as { reward: number };
      this.showNotification(`+${reward} Credits!`);
    });

    // Exhibit archived
    curator.on('exhibitArchived', (exhibitId) => {
      this.showNotification(`${exhibitId} completed! Now earning passive income.`);
      this.renderTabs();
    });
  }

  private switchToExhibit(exhibitId: string): void {
    const state = curator.getExhibitState(exhibitId);

    if (!state?.unlocked) {
      // Try to unlock
      const def = curator.getExhibitDef(exhibitId);
      if (def && curator.credits >= def.unlockCost) {
        if (curator.unlockExhibit(exhibitId)) {
          this.renderTabs();
          this.switchToExhibit(exhibitId); // Recurse to actually switch
        }
      } else {
        this.showNotification('Not enough credits!');
      }
      return;
    }

    const exhibit = this.exhibitInstances.get(exhibitId);
    if (!exhibit || !this.exhibitContainer) return;

    // Initialize exhibit with current modifiers
    exhibit.init(curator.modifiers);

    // Load saved state if exists
    const savedData = curator.getExhibitData(exhibitId);
    if (savedData) {
      exhibit.loadState(savedData);
    }

    // Render exhibit
    this.exhibitContainer.innerHTML = '';
    this.exhibitContainer.appendChild(exhibit.render());

    // Focus in game loop (triggers catch-up)
    gameLoop.focusExhibit(exhibitId);

    // Update tabs
    this.renderTabs();
  }

  private showNotification(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Save all exhibit states
   */
  saveAllExhibitStates(): void {
    for (const [id, exhibit] of this.exhibitInstances) {
      curator.setExhibitData(id, exhibit.getState());
    }
  }
}

export const lobby = new Lobby();
