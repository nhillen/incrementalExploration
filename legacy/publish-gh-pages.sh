#!/bin/bash
set -e

# This script publishes the current repository to the gh-pages branch
# using a temporary worktree. Run this script from the repository root.

worktree_dir=".gh-pages-worktree"

# Remove any previous worktree
if [ -d "$worktree_dir" ]; then
  git worktree remove -f "$worktree_dir"
fi

# Create worktree for gh-pages branch
git worktree add "$worktree_dir" gh-pages || git worktree add -B gh-pages "$worktree_dir" origin/gh-pages

# Clear old contents
rm -rf "$worktree_dir"/*

# Copy website files
cp -r index.html css js modules docs "$worktree_dir"/

# Commit and push
cd "$worktree_dir"
git add .
commit_msg="Deploy $(date +'%Y-%m-%d %H:%M:%S')"
if ! git diff --quiet --cached; then
  git commit -m "$commit_msg"
  git push origin gh-pages
else
  echo "No changes to publish"
fi

# Return to repo root
cd ..

# Remove worktree
git worktree remove "$worktree_dir"
