import type { SaveData } from './types';
import { curator } from './curator';
import { lobby } from '@/ui/lobby';

const SAVE_KEY = 'project-museum-save';
const SAVE_VERSION = 1;
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

/**
 * Save Manager
 *
 * Handles:
 * - LocalStorage persistence
 * - Auto-save
 * - Manual export/import
 */
class SaveManager {
  private autoSaveIntervalId: number | null = null;

  /**
   * Save current game state to LocalStorage
   */
  save(): void {
    // First, collect all exhibit states
    lobby.saveAllExhibitStates();

    const curatorData = curator.exportSaveData();

    const saveData: SaveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      meta: {
        credits: curatorData.credits,
        modifiers: curatorData.modifiers,
        purchasedUpgrades: curatorData.purchasedUpgrades,
      },
      exhibits: curatorData.exhibits,
    };

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      console.log('[SaveManager] Game saved');
    } catch (e) {
      console.error('[SaveManager] Failed to save:', e);
    }
  }

  /**
   * Load game state from LocalStorage
   */
  load(): boolean {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;

      const saveData = JSON.parse(raw) as SaveData;

      // Version check (for future migrations)
      if (saveData.version !== SAVE_VERSION) {
        console.warn('[SaveManager] Save version mismatch, may need migration');
      }

      curator.importSaveData({
        credits: saveData.meta.credits,
        modifiers: saveData.meta.modifiers,
        purchasedUpgrades: saveData.meta.purchasedUpgrades,
        exhibits: saveData.exhibits,
      });

      console.log('[SaveManager] Game loaded');
      return true;
    } catch (e) {
      console.error('[SaveManager] Failed to load:', e);
      return false;
    }
  }

  /**
   * Export save as downloadable JSON file
   */
  export(): void {
    this.save(); // Ensure latest state

    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      console.error('[SaveManager] No save data to export');
      return;
    }

    const blob = new Blob([raw], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `project-museum-save-${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Import save from file
   */
  async import(): Promise<boolean> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(false);
          return;
        }

        try {
          const text = await file.text();
          const saveData = JSON.parse(text) as SaveData;

          // Basic validation
          if (typeof saveData.version !== 'number' || !saveData.meta || !saveData.exhibits) {
            throw new Error('Invalid save file format');
          }

          localStorage.setItem(SAVE_KEY, text);
          this.load();
          resolve(true);
        } catch (e) {
          console.error('[SaveManager] Failed to import:', e);
          resolve(false);
        }
      };

      input.click();
    });
  }

  /**
   * Clear save data
   */
  clear(): void {
    localStorage.removeItem(SAVE_KEY);
    console.log('[SaveManager] Save cleared');
  }

  /**
   * Start auto-save
   */
  startAutoSave(): void {
    if (this.autoSaveIntervalId !== null) return;

    this.autoSaveIntervalId = window.setInterval(() => {
      this.save();
    }, AUTO_SAVE_INTERVAL);

    // Also save when page is hidden/closed
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.save();
      }
    });

    window.addEventListener('beforeunload', () => {
      this.save();
    });
  }

  /**
   * Stop auto-save
   */
  stopAutoSave(): void {
    if (this.autoSaveIntervalId !== null) {
      clearInterval(this.autoSaveIntervalId);
      this.autoSaveIntervalId = null;
    }
  }
}

export const saveManager = new SaveManager();
