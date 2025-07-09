# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spaak is an AI-powered secretary application that handles missed calls for businesses. Built with Next.js 14 App Router, it integrates with Supabase for backend services, Vapi for voice AI capabilities, and includes a modern UI with shadcn/ui components.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Authentication**: Supabase Auth with SSR cookie-based sessions
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS with shadcn/ui components
- **UI Components**: Radix UI primitives with custom styling
- **Voice AI**: Vapi integration via webhooks
- **Communication**: Twilio for SMS, Resend for email
- **Payments**: Stripe integration for subscriptions
- **Maps & Places**: Google Maps Places API (new autocomplete)
- **Deployment**: Optimized for Vercel
- **Language**: TypeScript throughout
- **Package Manager**: pnpm (evidenced by pnpm-lock.yaml)

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

## Required Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Additional integrations (Stripe, Twilio, etc.)
# Add other environment variables as needed
```

## Architecture

### App Structure (Next.js 14 App Router)
- **App Router**: Uses Next.js 14 App Router with file-based routing
- **Authentication Pages**: Protected auth flows in `app/(auth-pages)/`
  - Sign in, sign up, forgot password
- **Full-Screen Pages**: Standalone pages outside dashboard layout
  - `app/subscribe/` - Subscription welcome page (full-screen)
  - `app/onboarding/` - Multi-step onboarding flow (full-screen)
- **Dashboard**: Main application interface at `app/dashboard/`
  - Includes sidebar layout for authenticated users
  - Account, billing, and main dashboard pages
- **API Routes**: Backend endpoints in `app/api/`
- **Server Actions**: In `app/actions/` for server-side operations

### Component Organization Convention

Follow this structure for organizing components:

```
components/
├── ui/                     # Base UI components (shadcn/ui)
├── onboarding/            # Onboarding-specific components
│   ├── stepper.tsx        # Main stepper component
│   └── steps/             # Individual step components
├── auth/                  # Authentication components
├── dashboard/             # Dashboard-specific components
├── layouts/               # Layout components
└── [feature]/             # Feature-specific component groups
```

### Page Organization Convention

```
app/
├── (auth-pages)/          # Auth-only pages (grouped route)
├── subscribe/             # Full-screen subscription page
├── onboarding/            # Full-screen onboarding flow
├── dashboard/             # Dashboard layout with sidebar
│   ├── layout.tsx         # Dashboard-specific layout
│   ├── page.tsx           # Main dashboard
│   ├── account/           # Account management
│   └── billing/           # Billing and subscriptions
├── api/                   # API route handlers
└── actions/               # Server actions
```

### Key Components
- **Supabase Integration**: Client/server utilities in `utils/supabase/`
- **UI Components**: shadcn/ui base components in `components/ui/`
- **State Management**: Zustand stores in `stores/`
- **Middleware**: Session management via `middleware.ts`
- **Edge Functions**: Vapi integration in `supabase/functions/`

### User Flow & Authentication Checks

#### Complete User Journey
1. **New User Registration**
   - Sign up at `/sign-up`
   - Email verification (if configured)
   - Redirect to subscription flow

2. **Subscription Flow** 
   - User directed to `/subscribe` (full-screen)
   - Stripe payment processing
   - `onboarding_status` remains `pending`
   - Redirect to onboarding after payment

3. **Onboarding Flow**
   - User directed to `/onboarding` (full-screen, multi-step)
   - Step 1: Business name and owner name
   - Step 2: Services offered (multi-select)
   - Step 3: Specialty (multi-select)
   - Step 4: Service area (Google Places autocomplete)
   - Updates `onboarding_status` to `completed`
   - Redirect to dashboard

4. **Dashboard Access**
   - Only accessible after completing onboarding
   - Full sidebar layout with main application features

5. **First-Time Setup Flow** (Post-Onboarding)
   - User enters dashboard for the first time
   - Automatic assistant setup modal appears (if `has_seen_assistant_setup` = false)
   - Modal guides through AI assistant configuration and phone number assignment
   - Database flags updated to prevent showing modal again
   - User can skip steps and return later via assistant settings page

#### Authentication & Onboarding Checks

**Dashboard Layout Logic** (`app/dashboard/layout.tsx`):
```typescript
// Check sequence on every dashboard access:
1. Auth loading → Show "Loading dashboard..."
2. Onboarding loading → Show "Loading dashboard..."
3. needsOnboarding (no subscription) → Redirect to /subscribe
4. needsPostSubscriptionOnboarding → Redirect to /onboarding
5. All checks pass → Show dashboard with sidebar
```

**Auth Store States**:
- `needsOnboarding`: User has no active subscription
- `needsPostSubscriptionOnboarding`: User has subscription but onboarding incomplete
- `isAuthenticated`: User session is valid
- `onboardingLoading`: Onboarding status check in progress

**Page Protection**:
- `/subscribe` and `/onboarding` require authentication
- Unauthenticated users redirected to `/sign-in`
- Dashboard access blocked until onboarding complete

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
- `has_seen_assistant_setup` (BOOLEAN, DEFAULT FALSE, tracks first-time assistant setup modal)
- `has_seen_phone_number_setup` (BOOLEAN, DEFAULT FALSE, tracks first-time phone number setup modal)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW(), auto-updated)
- CONSTRAINT: completed onboarding requires business_name AND owner_name

**customer_inquiries** - Job requests from voice calls
- `id` (UUID, Primary Key, uuid_generate_v4())
- `flow` (TEXT, NOT NULL, call flow type)
- `name` (TEXT, NOT NULL)
- `phone` (TEXT, NOT NULL, customer's phone number - the caller)
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
- `business_phone` (TEXT, service provider's phone number that received the call)
- `business_phone_id` (TEXT, VAPI phone number ID)
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
- `customer_inquiries.business_phone` → `twilio_phone_numbers.phone_number` (links inquiries to service providers)

Note: Customer inquiries are linked to service providers via the business_phone field, which matches the phone number that received the call from VAPI.

### Google Places API Integration

**Location**: `app/actions/google-places.ts`

The application uses the **new Google Places API (New)** (not legacy) for service area selection during onboarding.

**Features**:
- Server-side API calls for security
- Debounced requests (300ms) to minimize API usage
- Restricted to localities and administrative areas
- Biased to Australia (`regionCode: "AU"`)
- Session tokens for billing optimization
- Field masks for optimized responses

**Implementation**:
```typescript
// Server action with debounced client-side calls
const result = await getPlaceAutocomplete(searchTerm);

// API Configuration (New Places API)
- Endpoint: https://places.googleapis.com/v1/places:autocomplete
- Method: POST with JSON body
- Authentication: X-Goog-Api-Key header
- Field Mask: Specific fields for performance
- Types: locality, administrative_area_level_1, administrative_area_level_2
- Region: AU (Australia biased)
- Session tokens: Generated per search session
```

**Usage in Components**:
- `components/onboarding/steps/service-area-step.tsx`
- Debounced input with 300ms delay
- Dropdown with autocomplete suggestions
- Fallback to manual entry if needed

### Environment Configuration
Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for Edge Functions)
- `GOOGLE_MAPS_API_KEY` (for Places Autocomplete)

### Supabase Edge Functions
Located in `supabase/functions/`:
- **vapi_call_webhook**: Processes voice call data and saves to database
- **vapi_call_poller**: Handles ongoing call management
- **stripe-create-session**: Handles Stripe subscription creation

### Styling System
- Uses Tailwind CSS with CSS variables for theming
- Supports dark/light mode via next-themes
- shadcn/ui configuration in `components.json`
- Custom color palette defined in `tailwind.config.ts`

## Development Notes

### General
- **Package Manager**: pnpm (evidenced by `pnpm-lock.yaml`)
- **TypeScript**: Strict mode enabled with path aliases (`@/*`)
- **Deployment**: Configured for Vercel with Supabase integration
- **Routing**: Next.js 14 App Router with file-based routing
- **State Persistence**: Zustand with localStorage persistence

### Authentication & Middleware
- **Middleware**: Handles authentication across all routes except static assets (`middleware.ts`)
- **Protected Routes**: Dashboard routes require authentication
- **Session Management**: SSR-compatible cookie-based sessions
- **Auth Provider**: Client-side auth state management with Zustand

### API Integration Patterns
- **Server Actions**: Used for secure server-side operations (Google Places, Stripe)
- **Edge Functions**: Supabase functions for webhooks and external integrations
- **Client-Side**: React Query for client-side data fetching (where applicable)

### Component Patterns
- **Compound Components**: Complex UI elements broken into smaller, reusable parts
- **Server Components**: Default for static content and initial data loading
- **Client Components**: For interactive elements and state management
- **Loading States**: Comprehensive loading and error states throughout

### Code Organization
- **Feature-based**: Components organized by feature (onboarding, auth, dashboard)
- **Shared UI**: Base components in `components/ui/` following shadcn/ui patterns
- **Actions**: Server actions grouped in `app/actions/` by functionality
- **Types**: TypeScript interfaces defined close to usage or in shared locations

### Performance Optimizations
- **Debounced API Calls**: Google Places autocomplete (300ms debounce)
- **Lazy Loading**: Components loaded on demand where appropriate
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Optimization**: Automatic code splitting with App Router