# Supabase Workspace

This directory contains the shared Supabase project used by both the web (Next.js) and mobile (Expo) applications.

## Structure

- `config.toml`, `deno.json` – Supabase CLI configuration shared across apps.
- `migrations/` – Database schema changes managed via `supabase db generate` / `supabase db push`.
- `functions/` – Edge Functions (Twilio/Vapi, Stripe, etc.) deployed with `supabase functions deploy`.

## Usage

Run all Supabase CLI commands from this folder:

```bash
# Start local Supabase stack
supabase start

# Generate a migration
supabase db diff --schema public --file migrations/<timestamp>_description.sql

# Deploy Edge Functions
supabase functions deploy <function-name>
```

Both apps consume the same backend, so always coordinate schema/function changes with the full team before deploying.

