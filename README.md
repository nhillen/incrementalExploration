# Project Museum

A "Museum" of incremental game mechanics. Visit distinct "Exhibits," each a self-contained game representing a specific genre of idle gaming.

**The Twist:** Collect "Meta-Currency" from achievements within exhibits to buy system-level cheats. Play classic games, but use meta-level powers to break them, speed-run them, and eventually "solve" them.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Architecture

See [docs/architecture-plan.md](docs/architecture-plan.md) for the full technical design.

### Key Concepts

- **Exhibits**: Self-contained mini-games implementing the `ExhibitInterface` contract
- **Curator**: Meta layer managing Museum Credits and global modifiers
- **Game Loop**: Handles active updates + background catch-up for idle games

### Project Structure

```
src/
  core/           # Meta layer (Curator, GameLoop, SaveManager)
  exhibits/       # Individual mini-games
  ui/             # Lobby and shared UI components
  styles/         # CSS
docs/             # Design documents
legacy/           # Old codebase (for reference)
```

## Current Exhibits

- **Cupcake Clicker** - Click cupcakes, earn milestones, get credits

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```
