import type { ExhibitInstance } from '@/exhibits/ExhibitInterface';
import { curator } from './curator';

const BACKGROUND_INTERVAL = 2 * 60 * 1000; // 2 minutes

/**
 * Game Loop Manager
 *
 * Handles:
 * - Active exhibit updates (every frame)
 * - Background exhibit catch-up (periodic)
 * - Passive income ticking
 * - Focus switching with catch-up calculation
 */
class GameLoop {
  private exhibits: Map<string, ExhibitInstance> = new Map();
  private lastBackgroundTick: Map<string, number> = new Map();
  private activeExhibitId: string | null = null;
  private lastFrameTime: number = 0;
  private running: boolean = false;
  private animationFrameId: number | null = null;

  /**
   * Register an exhibit instance
   */
  registerExhibit(exhibit: ExhibitInstance): void {
    this.exhibits.set(exhibit.id, exhibit);
    this.lastBackgroundTick.set(exhibit.id, Date.now());
  }

  /**
   * Get active exhibit ID
   */
  getActiveExhibitId(): string | null {
    return this.activeExhibitId;
  }

  /**
   * Switch to an exhibit (with catch-up)
   */
  focusExhibit(exhibitId: string): void {
    const exhibit = this.exhibits.get(exhibitId);
    if (!exhibit) return;

    // Catch up the exhibit we're switching TO
    const lastTick = this.lastBackgroundTick.get(exhibitId);
    if (lastTick) {
      const catchUpMs = Date.now() - lastTick;
      if (catchUpMs > 100) {
        // Only catch up if meaningful time passed
        exhibit.update(catchUpMs, false);
      }
    }

    this.activeExhibitId = exhibitId;
    this.lastBackgroundTick.set(exhibitId, Date.now());
  }

  /**
   * Get an exhibit instance
   */
  getExhibit(id: string): ExhibitInstance | undefined {
    return this.exhibits.get(id);
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = performance.now();
    this.tick();
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private tick = (): void => {
    if (!this.running) return;

    const now = performance.now();
    const deltaMs = now - this.lastFrameTime;
    this.lastFrameTime = now;

    const currentTime = Date.now();

    // Update all exhibits
    for (const [id, exhibit] of this.exhibits) {
      const isActive = id === this.activeExhibitId;

      if (isActive) {
        // Active exhibit: full speed updates
        exhibit.update(deltaMs, true);
        this.lastBackgroundTick.set(id, currentTime);
        curator.updateExhibitTickTime(id, currentTime);
      } else {
        // Background exhibit: periodic catch-up
        const lastTick = this.lastBackgroundTick.get(id) || currentTime;
        if (currentTime - lastTick >= BACKGROUND_INTERVAL) {
          const catchUpMs = currentTime - lastTick;
          exhibit.update(catchUpMs, false);
          this.lastBackgroundTick.set(id, currentTime);
          curator.updateExhibitTickTime(id, currentTime);
          // TODO: Emit notification event if milestones were hit
        }
      }
    }

    // Process passive income from archived exhibits
    curator.tickPassiveIncome(deltaMs);

    this.animationFrameId = requestAnimationFrame(this.tick);
  };
}

export const gameLoop = new GameLoop();
