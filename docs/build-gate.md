# Build Gate: Before You Create Anything New

## Decision tree (follow in order)

1. Can an existing component be used AS-IS?
   -> Yes: use it. Stop here.

2. Can an existing component be extended with a backward-compatible prop?
   -> Yes: add the prop to the package component. Stop here.

3. Can this be solved with composition (children / slots / render props)
   without a new component?
   -> Yes: compose existing components. Stop here.

4. None of the above work.
   -> Write a New Component Proposal (below) and get explicit approval
      from the project owner before writing any code.

## New Component Proposal format

When none of the above apply, create a proposal with:

- **Name**: ComponentName
- **Package**: which @teqbook/* package it belongs in
- **Problem**: what existing components cannot solve
- **Replaces/simplifies**: what current code it removes
- **Public API**: props interface (TypeScript)
- **Usage examples**: 2-3 code snippets showing real use
- **Migration impact**: which files/pages change

Submit this as a comment or message. Do NOT write code until approved.

## What counts as "new component"

- Any new exported React component file in packages/*/src/**
- Any new file in apps/*/src/components/**
- Any new "pattern wrapper" that acts as a layout or page template

## What does NOT count

- Private helper functions in the same file (not exported)
- Internal render helpers in src/internal/ (not exported from index.ts)
- Test files, stories, or documentation
