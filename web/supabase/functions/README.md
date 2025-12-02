# Supabase Edge Functions

This directory contains Supabase Edge Functions for server-side logic.

## Structure

Each function should be in its own directory with an `index.ts` file:

```
supabase/functions/
├── function-name/
│   └── index.ts
└── README.md
```

## Deployment

To deploy Edge Functions, use the Supabase CLI:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy a function
supabase functions deploy function-name

# Deploy all functions
supabase functions deploy
```

## Development

For local development:

```bash
# Start Supabase locally (requires Docker)
supabase start

# Serve functions locally
supabase functions serve
```

## Available Functions

(Add function documentation here as functions are created)

## Notes

- Edge Functions run on Deno runtime
- Use `Deno.serve()` for the HTTP handler
- Import Supabase client from `https://esm.sh/@supabase/supabase-js@2`
- Functions have access to environment variables via `Deno.env.get()`

