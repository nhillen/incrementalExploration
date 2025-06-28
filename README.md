# incrementalExploration

This project is a small JavaScript game. To publish the site using GitHub Pages you can create a `gh-pages` branch that contains the latest build of the web assets.

## Publishing to GitHub Pages

A helper script `publish-gh-pages.sh` is included for convenience. It uses a temporary `git worktree` to update the `gh-pages` branch.

Run the following commands from the repository root:

```bash
# First time setup (creates the branch if it doesn't exist)
./publish-gh-pages.sh
```

This will copy `index.html`, `css`, `js`, `modules`, and the `docs` folder to the `gh-pages` branch and push it to `origin`.

After running the script, configure GitHub Pages in the repository settings to serve from the `gh-pages` branch.

## Testing Tips

For quick testing you can give your character extra energy directly from the browser console:

```javascript
// Add 100 energy (cannot exceed the character's max)
character.energy.add(100);
```

Run this while the game is loaded in the browser to instantly refill energy.
