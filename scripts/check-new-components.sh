#!/bin/bash
# CI guard: fails if new component files are added without APPROVED_NEW_COMPONENT token

NEW_FILES=$(git diff --name-only --diff-filter=A origin/main...HEAD \
  | grep -E '(packages|apps)/.*/src/components/.*\.tsx$')

if [ -n "$NEW_FILES" ]; then
  TOKEN=$(git log origin/main..HEAD --format='%B' | grep -c 'APPROVED_NEW_COMPONENT:')
  PR_TOKEN=$(gh pr view --json body -q '.body' 2>/dev/null | grep -c 'APPROVED_NEW_COMPONENT:')

  if [ "$TOKEN" -eq 0 ] && [ "$PR_TOKEN" -eq 0 ]; then
    echo "ERROR: New component files detected without approval token."
    echo "Files:"
    echo "$NEW_FILES"
    echo ""
    echo "Add 'APPROVED_NEW_COMPONENT: <reason>' to a commit message or PR body."
    exit 1
  fi
fi

echo "Component gate check passed."
