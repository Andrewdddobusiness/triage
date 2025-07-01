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
- `id` (UUID, Primary Key, uuid_generate_v4())
- `auth_user_id` (UUID, UNIQUE, Foreign Key to auth.users, ON DELETE CASCADE)
- `onboarding_status` (TEXT, NOT NULL, DEFAULT 'pending', CHECK: 'pending' | 'completed')
- `business_name` (TEXT, required when onboarding_status = 'completed')
- `owner_name` (TEXT, required when onboarding_status = 'completed')
- `business_phone` (TEXT[], array)
- `business_email` (TEXT[], array)
- `specialty` (TEXT[], array)
- `services_offered` (TEXT[], array)
- `service_area` (TEXT[], array)
- `license_number` (TEXT)
- `insurance_info` (TEXT)
- `rating` (DECIMAL(3,2))
- `availability_status` (TEXT, DEFAULT 'available', CHECK: 'available' | 'busy' | 'unavailable')
- `subscription_status` (TEXT, DEFAULT 'none', CHECK: 'none' | 'active' | 'inactive' | 'trial')
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW(), auto-updated)
- CONSTRAINT: completed onboarding requires business_name AND owner_name

**customer_inquiries** - Job requests from voice calls
- `id` (UUID, Primary Key, uuid_generate_v4())
- `flow` (TEXT, NOT NULL, call flow type)
- `name` (TEXT, NOT NULL)
- `phone` (TEXT, NOT NULL)
- `email` (TEXT)
- `inquiry_date` (TIMESTAMPTZ, DEFAULT NOW())
- `preferred_service_date` (TIMESTAMPTZ)
- `preferred_service_date_text` (TEXT)
- `estimated_completion` (TIMESTAMPTZ)
- `budget` (DECIMAL(10,2))
- `job_type` (TEXT)
- `job_description` (TEXT)
- `street_address` (TEXT)
- `city` (TEXT)
- `state` (TEXT)
- `postal_code` (TEXT)
- `country` (TEXT, DEFAULT 'Australia')
- `call_sid` (TEXT)
- `assistant_id` (TEXT)
- `status` (TEXT, DEFAULT 'new', CHECK: 'new' | 'contacted' | 'scheduled' | 'completed' | 'cancelled')
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW(), auto-updated)

**customer_messages** - Follow-up messages for existing jobs
- `id` (UUID, Primary Key, uuid_generate_v4())
- `name` (TEXT, NOT NULL)
- `phone` (TEXT, NOT NULL)
- `email` (TEXT)
- `message` (TEXT, NOT NULL)
- `call_sid` (TEXT)
- `assistant_id` (TEXT)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

#### AI & Communication Tables

**assistant_presets** - Vapi AI assistant configurations
- `id` (UUID, Primary Key, uuid_generate_v4())
- `name` (TEXT, NOT NULL)
- `description` (TEXT)
- `voice_provider` (TEXT, NOT NULL)
- `assistant_id` (TEXT, NOT NULL)
- `voice_id` (TEXT)
- `default_greeting` (TEXT)
- `avatar_url` (TEXT)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

**service_provider_assistants** - Links providers to AI assistants
- `id` (UUID, Primary Key, uuid_generate_v4())
- `service_provider_id` (UUID, NOT NULL, Foreign Key to service_providers, ON DELETE CASCADE)
- `assistant_id` (TEXT)
- `assistant_preset_id` (UUID, Foreign Key to assistant_presets)
- `greeting_message` (TEXT)
- `enabled` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

**twilio_phone_numbers** - Phone number management
- `id` (UUID, Primary Key, uuid_generate_v4())
- `phone_number` (TEXT, NOT NULL, UNIQUE)
- `friendly_name` (TEXT)
- `iso_country` (TEXT, DEFAULT 'AU')
- `capabilities` (TEXT[], array)
- `voice_url` (TEXT)
- `sms_url` (TEXT)
- `twilio_sid` (TEXT, NOT NULL, UNIQUE)
- `assigned_to` (UUID, Foreign Key to service_providers, ON DELETE SET NULL)
- `assigned_at` (TIMESTAMPTZ)
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW(), auto-updated)
- `vapi_phone_number_id` (TEXT)
- `vapi_imported_at` (TIMESTAMPTZ)

#### Subscription Management

**subscriptions** - Stripe subscription tracking
- `id` (UUID, Primary Key, uuid_generate_v4())
- `service_provider_id` (UUID, NOT NULL, Foreign Key to service_providers, ON DELETE CASCADE)
- `stripe_customer_id` (TEXT, NOT NULL)
- `stripe_subscription_id` (TEXT, UNIQUE)
- `stripe_price_id` (TEXT)
- `status` (TEXT, NOT NULL, CHECK: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid')
- `current_period_start` (TIMESTAMPTZ)
- `current_period_end` (TIMESTAMPTZ)
- `cancel_at_period_end` (BOOLEAN, DEFAULT FALSE)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW(), auto-updated)

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