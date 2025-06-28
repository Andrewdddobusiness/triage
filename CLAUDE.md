# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spaak is an AI-powered secretary application that handles missed calls for businesses. Built with Next.js 14 App Router, it integrates with Supabase for backend services, Vapi for voice AI capabilities, and includes a modern UI with shadcn/ui components.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Supabase Auth with SSR cookie-based sessions
- **Styling**: Tailwind CSS with shadcn/ui components
- **Voice AI**: Vapi integration via webhooks
- **Communication**: Twilio for SMS, Resend for email
- **Deployment**: Optimized for Vercel
- **Language**: TypeScript throughout

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Note: This project does not currently have linting, testing, or type-checking scripts configured.

## Architecture

### App Structure
- **App Router**: Uses Next.js 14 App Router with nested layouts
- **Authentication**: Cookie-based auth flows in `app/(auth-pages)/`
- **Dashboard**: Main application interface at `app/dashboard/`
- **API Routes**: Backend endpoints in `app/api/`

### Key Components
- **Supabase Integration**: Client/server utilities in `utils/supabase/`
- **UI Components**: shadcn/ui components in `components/ui/`
- **Middleware**: Session management via `middleware.ts`
- **Webhooks**: Vapi integration in `supabase/functions/`

### Database Schema

The application uses a multi-tenant architecture with service providers managing customer interactions:

#### Core Tables

**service_providers** - Central user management table
- `id` (UUID, Primary Key)
- `auth_user_id` (UUID, Foreign Key to auth.users)
- `onboarding_status` ('pending', 'completed')
- `business_name`, `owner_name` (required after onboarding)
- `business_phone[]`, `business_email[]` (arrays)
- `specialty[]`, `services_offered[]`, `service_area[]`
- `availability_status` ('available', 'busy', 'unavailable')
- `subscription_status` ('none', 'active', 'inactive', 'trial')

**customer_inquiries** - Job requests from voice calls
- `id` (UUID, Primary Key)
- `flow` (TEXT, call flow type)
- Customer details: `name`, `phone`, `email`
- Job details: `job_type`, `job_description`, `budget`
- Location: `street_address`, `city`, `state`, `postal_code`, `country`
- Scheduling: `preferred_service_date`, `preferred_service_date_text`
- Status: `status` ('new', 'contacted', 'scheduled', 'completed', 'cancelled')
- Call tracking: `call_sid`, `assistant_id`

**customer_messages** - Follow-up messages for existing jobs
- `id` (UUID, Primary Key)
- Customer details: `name`, `phone`, `email`
- `message` (TEXT)
- Call tracking: `call_sid`, `assistant_id`

#### AI & Communication Tables

**assistant_presets** - Vapi AI assistant configurations
- `id` (UUID, Primary Key)
- `name`, `description`
- `voice_provider`, `assistant_id`, `voice_id`
- `default_greeting`, `avatar_url`

**service_provider_assistants** - Links providers to AI assistants
- `id` (UUID, Primary Key)
- `service_provider_id` (Foreign Key)
- `assistant_preset_id` (Foreign Key)
- `assistant_id`, `greeting_message`
- `enabled` (Boolean)

**twilio_phone_numbers** - Phone number management
- `id` (UUID, Primary Key)
- `phone_number` (TEXT, Unique)
- `twilio_sid` (TEXT, Unique)
- `assigned_to` (Foreign Key to service_providers)
- `capabilities[]`, `voice_url`, `sms_url`
- `vapi_phone_number_id`, `vapi_imported_at`

#### Subscription Management

**subscriptions** - Stripe subscription tracking
- `id` (UUID, Primary Key)
- `service_provider_id` (Foreign Key)
- `stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id`
- `status` ('active', 'canceled', 'incomplete', etc.)
- `current_period_start`, `current_period_end`
- `cancel_at_period_end`

#### Key Relationships

- `service_providers.auth_user_id` → `auth.users.id` (Supabase Auth)
- `service_provider_assistants.service_provider_id` → `service_providers.id`
- `service_provider_assistants.assistant_preset_id` → `assistant_presets.id`
- `twilio_phone_numbers.assigned_to` → `service_providers.id`
- `subscriptions.service_provider_id` → `service_providers.id`

Note: Customer inquiries and messages are not directly linked to service providers - they're matched via assistant_id and call routing logic.

### Environment Configuration
Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for Edge Functions)

### Supabase Edge Functions
Located in `supabase/functions/`:
- **vapi_call_webhook**: Processes voice call data and saves to database
- **vapi_call_poller**: Handles ongoing call management

### Styling System
- Uses Tailwind CSS with CSS variables for theming
- Supports dark/light mode via next-themes
- shadcn/ui configuration in `components.json`
- Custom color palette defined in `tailwind.config.ts`

## Development Notes

- The project uses pnpm as the package manager (evidenced by `pnpm-lock.yaml`)
- Middleware handles authentication across all routes except static assets
- The app is configured for deployment with Vercel's Supabase integration
- TypeScript strict mode is enabled with path aliases (`@/*`)