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
│   ├── button.tsx          # Reusable button component
│   ├── card.tsx            # Card layouts
│   ├── input.tsx           # Form inputs
│   └── ...                 # Other base UI components
├── layout/                 # Layout-specific components
│   ├── home-layout.tsx     # Public page layout
│   ├── site-header.tsx     # Site header
│   └── footer.tsx          # Site footer
├── navigation/             # Navigation components
│   ├── navigation.tsx      # Main navigation
│   ├── nav-main.tsx        # Primary navigation
│   └── nav-user.tsx        # User navigation
├── forms/                  # Form-related components
│   ├── form-message.tsx    # Form error/success messages
│   └── submit-button.tsx   # Form submit buttons
├── modals/                 # Modal components
│   └── assistant-setup-modal.tsx # Assistant setup modal
├── data/                   # Data display components
│   └── data-table/         # Data table implementation
│       ├── data-table.tsx  # Main data table
│       ├── table.tsx       # Table component
│       └── columns.tsx     # Column definitions
├── onboarding/            # Onboarding-specific components
│   ├── stepper.tsx        # Main stepper component
│   └── steps/             # Individual step components
├── dashboard/             # Dashboard-specific components
├── billing/               # Billing and payment components
├── inquiry/               # Inquiry-specific components
├── providers/             # Context providers
└── [feature]/             # Feature-specific component groups
```

#### Component Organization Best Practices

1. **Categorize by Function**: Group components by their primary function rather than by page or feature
2. **Use Descriptive Directories**: Directory names should clearly indicate the type of components inside
3. **Keep UI Components Separate**: Base UI components should remain in `/ui/` for reusability
4. **Feature-Specific Grouping**: Components used only in specific features should be grouped together
5. **Consistent Naming**: Use kebab-case for component files and directories
6. **Avoid Deep Nesting**: Limit directory nesting to 3 levels maximum for maintainability
7. **Single Responsibility**: Each component should have a single, clear purpose
8. **Import Paths**: Always use absolute imports with `@/components/` prefix for consistency

#### Component Cleanup Guidelines

- **Remove Unused Components**: Regularly audit and remove components that are no longer imported or used
- **Avoid Redundancy**: Don't create duplicate components with similar functionality
- **Template Cleanup**: Remove starter template components that aren't integrated into the application
- **Dependencies**: Before removing components, check for internal dependencies within the components directory

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

## Layout & Responsive Design Best Practices

### Component Layout Principles

#### 1. **Height Management Strategy**

**✅ Recommended Approach:**
```typescript
// Top-level containers: Use full viewport height
className="h-screen"           // Full viewport height
className="min-h-screen"       // Minimum full height, can grow

// Layout containers: Use flex with proper direction
className="flex flex-col h-full"      // Vertical stacking
className="flex h-full"               // Horizontal layout

// Content areas: Use flex-1 to fill remaining space
className="flex-1 overflow-auto"     // Takes remaining space, scrolls if needed
```

**❌ Avoid These Patterns:**
```typescript
// Don't mix conflicting height constraints
className="h-full h-screen"           // Conflicting heights
className="h-auto h-full"             // Circular dependencies

// Don't use fixed heights for main content areas
className="h-[600px]"                 // Not responsive to screen size
```

#### 2. **Width Management Strategy**

**✅ Responsive Width Patterns:**
```typescript
// Container widths: Use max-width with responsive classes
className="w-full max-w-7xl mx-auto px-4"

// Component widths: Use percentage or viewport units
className="w-full"                    // Full width of container
className="w-1/2 lg:w-1/3"          // Responsive fractions
className="min-w-0"                  // Prevent content overflow

// Filter/control widths: Use consistent sizing
className="w-[140px]"                // Fixed width for controls
className="w-[200px] lg:w-[250px]"   // Responsive control width
```

#### 3. **Resizable Panel Implementation**

**Using shadcn/ui ResizablePanelGroup:**
```typescript
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

// ✅ Correct implementation
<ResizablePanelGroup direction="horizontal" className="h-screen">
  <ResizablePanel defaultSize={70} minSize={50}>
    {/* Main content - takes most space */}
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={30} minSize={25} maxSize={50}>
    {/* Sidebar content - constrained size */}
  </ResizablePanel>
</ResizablePanelGroup>
```

**Key Rules:**
- Use `h-screen` or `h-full` on the top-level ResizablePanelGroup
- Set sensible `defaultSize`, `minSize`, and `maxSize` constraints
- Main content panels should have higher `minSize` values
- Detail panels should have `maxSize` constraints to prevent overwhelming content

#### 4. **Sidebar Integration Patterns**

**Dashboard Layout Structure:**
```typescript
// Layout hierarchy that works with shadcn sidebar
<SidebarProvider>
  <AppSidebar />                      // Left navigation sidebar
  <ResizablePanelGroup>              // Full-height resizable area
    <ResizablePanel>
      <SidebarInset>                 // Header + content area
        <header>...</header>         // Fixed header
        <main>...</main>             // Scrollable content
      </SidebarInset>
    </ResizablePanel>
    {conditionalRightPanel && (
      <ResizablePanel>              // Right detail panel
        <DetailComponent />
      </ResizablePanel>
    )}
  </ResizablePanelGroup>
</SidebarProvider>
```

#### 5. **Scroll Management**

**Container Scroll Strategy:**
```typescript
// ✅ Proper scroll containers
className="overflow-auto"            // Allow scrolling when needed
className="overflow-hidden"          // Prevent scrolling (for layout containers)
className="overflow-y-auto"          // Vertical scroll only

// ✅ Content that should scroll
<div className="flex-1 overflow-auto p-6">
  {/* Long content that may need scrolling */}
</div>

// ✅ Fixed headers that shouldn't scroll
<header className="flex-shrink-0 h-16">
  {/* Always visible header */}
</header>
```

#### 6. **Responsive Breakpoints Strategy**

**Mobile-First Approach:**
```typescript
// ✅ Mobile-first responsive classes
className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4"

// Filter layouts: Stack on mobile, row on desktop
className="flex flex-col gap-4 md:flex-row md:items-center"

// Hide elements on small screens
className="hidden md:block"          // Show on medium screens and up
className="block md:hidden"          // Show only on small screens
```

**Responsive Filter Bar Pattern:**
```typescript
<div className="flex flex-wrap items-center gap-4 px-2 sm:px-4 lg:px-6">
  <Input className="w-[200px] lg:w-[250px]" />
  <Select className="w-[140px]" />
  <Select className="w-[120px]" />
</div>
```

#### 7. **Data Table Layout Best Practices**

**Table Container Pattern:**
```typescript
<div className="flex w-full flex-col gap-4">
  {/* Filters: Always visible, responsive */}
  <div className="flex flex-wrap items-center gap-4">
    {/* Filter components with consistent widths */}
  </div>
  
  {/* Table: Scrollable container */}
  <div className="overflow-hidden rounded-lg border">
    <Table>
      {/* Table content */}
    </Table>
  </div>
  
  {/* Pagination: Fixed at bottom */}
  <div className="flex items-center justify-between">
    {/* Pagination controls */}
  </div>
</div>
```

#### 8. **Modal and Overlay Positioning**

**Full-Screen Overlays:**
```typescript
// ✅ Proper modal/sidebar overlay positioning
className="fixed inset-0 z-50"              // Full screen overlay
className="fixed right-0 top-0 h-screen"    // Right-aligned overlay
className="fixed inset-0 bg-black/20 z-40"  // Backdrop overlay
```

### Common Layout Anti-Patterns to Avoid

**❌ Height Conflicts:**
```typescript
// Don't create circular height dependencies
<div className="h-full">
  <div className="h-full">
    <div className="h-[calc(100%-60px)]">  // Manual height calculations
```

**❌ Fixed Sizes for Dynamic Content:**
```typescript
className="h-[600px] w-[800px]"  // Not responsive
className="max-h-[400px]"        // May cut off content
```

**❌ Mixing Layout Systems:**
```typescript
// Don't mix CSS Grid with Flexbox incorrectly
className="grid grid-cols-2 flex flex-row"  // Conflicting layout methods
```

### Testing Layout Responsiveness

**Always Test These Scenarios:**
1. **Mobile Portrait** (320px - 480px width)
2. **Mobile Landscape** (480px - 768px width) 
3. **Tablet** (768px - 1024px width)
4. **Desktop** (1024px+ width)
5. **Large Desktop** (1440px+ width)

**Browser Testing:**
- Test with browser zoom at 125%, 150%, 200%
- Test with browser developer tools device simulation
- Test actual resizing of browser window
- Test with very tall and very short content

### Key Principles Summary

1. **Use viewport units** (`h-screen`, `min-h-screen`) for full-height layouts
2. **Use flexbox** with `flex-1` for dynamic space allocation  
3. **Set proper constraints** on resizable panels (min/max sizes)
4. **Separate fixed and scrollable areas** clearly
5. **Use consistent sizing** for filter controls and UI elements
6. **Test responsive behavior** at all breakpoints
7. **Avoid fixed pixel heights** for main content areas
8. **Use overflow controls** strategically to prevent layout breaks

## Typography & Design System Style Guide

### Text Hierarchy

#### **Page Titles & Main Headers**
```typescript
// Large page titles (dashboard, account pages)
className="text-2xl font-bold"          // Dashboard metrics
className="text-xl font-semibold"       // Panel headers

// Usage examples:
<h1 className="text-2xl font-bold">Analytics Overview</h1>
<h2 className="text-xl font-semibold">Inquiry Details</h2>
```

#### **Section Headers**
```typescript
// Section/subsection headers within pages
className="text-lg font-semibold"       // Main sections
className="font-semibold text-lg"       // Panel sections (inquiry details)

// Usage examples:
<h3 className="text-lg font-semibold mb-4">All Inquiries</h3>
<h3 className="font-semibold text-lg">Caller Details</h3>
<h3 className="font-semibold text-lg">Job Details</h3>
```

#### **Small Headers & Labels**
```typescript
// Card headers and form labels
className="tracking-tight text-sm font-medium"     // Analytics cards
className="text-sm font-medium text-gray-600"      // Field labels
className="text-sm font-medium text-muted-foreground"  // Semantic labels

// Usage examples:
<h3 className="tracking-tight text-sm font-medium">New Inquiries</h3>
<label className="text-sm font-medium text-gray-600">Customer Name</label>
<label className="text-sm font-medium text-muted-foreground">Phone Number</label>
```

#### **Body Text & Content**
```typescript
// Primary body text
className="text-base"                   // Standard content (inquiry panel large text)
className="text-sm"                     // Secondary content (inquiry panel details)
className="text-xs"                     // Small content (table cells)

// Usage examples:
<p className="text-base font-medium">{inquiry?.name}</p>
<p className="text-sm">{inquiry?.phone || "Not provided"}</p>
<span className="text-xs">Table data</span>
```

### Color System & Theme

#### **Theme Colors (CSS Variables)**
```css
/* Light Mode */
--background: 0 0% 100%;           /* #ffffff - Main background */
--foreground: 0 0% 3.9%;           /* #0a0a0a - Primary text */
--muted: 0 0% 96.1%;              /* #f6f6f6 - Muted backgrounds */
--muted-foreground: 0 0% 45.1%;   /* #737373 - Muted text */
--card: 0 0% 100%;                /* #ffffff - Card backgrounds */
--card-foreground: 0 0% 3.9%;     /* #0a0a0a - Card text */
--border: 0 0% 89.8%;             /* #e5e5e5 - Borders */

/* Dark Mode */
--background: 0 0% 3.9%;          /* #0a0a0a - Main background */
--foreground: 0 0% 98%;           /* #fafafa - Primary text */
--muted: 0 0% 14.9%;             /* #262626 - Muted backgrounds */
--muted-foreground: 0 0% 63.9%;  /* #a3a3a3 - Muted text */
```

#### **Semantic Color Usage**
```typescript
// Primary text colors
className="text-foreground"             // Main text
className="text-muted-foreground"       // Secondary/muted text
className="text-gray-600"              // Field labels (fixed gray)

// Background colors
className="bg-background"               // Main backgrounds
className="bg-card"                     // Card backgrounds  
className="bg-muted"                    // Table headers, muted areas

// Status & feedback colors
className="text-red-600"               // Error states
className="text-green-600"             // Success states (copy feedback)
className="text-blue-800"             // Status badges (blue variant)
className="text-yellow-800"           // Status badges (yellow variant)
```

#### **Status Badge Color System**
```typescript
// Status-specific color combinations (background + text)
"bg-blue-100 text-blue-800"           // New status
"bg-yellow-100 text-yellow-800"       // Contacted status  
"bg-purple-100 text-purple-800"       // Scheduled status
"bg-green-100 text-green-800"         // Completed status
"bg-red-100 text-red-800"             // Cancelled status
"bg-gray-100 text-gray-800"           // Default/unknown status

// With hover states
"hover:bg-blue-200 hover:text-blue-900"    // Darker on hover
```

### Spacing & Layout Standards

#### **Container Spacing**
```typescript
// Page-level containers
className="space-y-6 px-4"             // Dashboard main content
className="p-6 space-y-6"              // Panel content areas
className="space-y-4"                  // Section groupings

// Component spacing
className="gap-4"                       // Grid/flex gaps
className="gap-2"                       // Small component gaps
className="mb-4"                        // Section bottom margins
```

#### **Card & Panel Patterns**
```typescript
// Standard card styling
className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"

// Analytics cards
className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"

// Panel containers
className="h-full bg-white border-l flex flex-col"    // Side panels
className="space-y-2"                                 // Field containers
```

### Interactive Elements

#### **Button Styling Standards**
```typescript
// Copy buttons (small icons)
className="h-6 w-6 p-0"               // Small icon buttons
className="h-8 px-2"                  // Small buttons with text

// Icon sizing in buttons
className="h-3 w-3"                   // Small icons (copy, check)
className="h-4 w-4"                   // Standard icons (close, navigation)
```

#### **Icon Standards**
```typescript
// Icon sizing by context
className="h-3 w-3"                   // Button icons, small indicators
className="h-4 w-4"                   // Field labels, navigation icons
className="h-5 w-5"                   // Larger interactive elements

// Icon colors
className="text-muted-foreground"     // Standard icon color
className="text-green-600"            // Success state icons
className="text-gray-600"             // Label icons
```

### Form & Input Patterns

#### **Field Label Patterns**
```typescript
// Standard field label with icon
<label className="text-sm font-medium text-gray-600 flex items-center gap-2">
  <IconComponent className="h-4 w-4" />
  Field Name
</label>

// Content display pattern
<div className="space-y-2">
  <label>...</label>
  <div className="flex items-center gap-2">
    <p className="text-sm flex-1">{content}</p>
    {/* Optional action button */}
  </div>
</div>
```

#### **Filter & Control Sizing**
```typescript
// Filter controls (consistent widths)
className="w-[200px] lg:w-[250px]"    // Search inputs
className="w-[140px]"                  // Standard selects
className="w-[120px]"                  // Compact selects
```

### Responsive Design Patterns

#### **Breakpoint Strategy**
```typescript
// Mobile-first responsive classes
className="w-full md:w-1/2 lg:w-1/3"           // Progressive sizing
className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"    // Responsive grids
className="flex flex-col gap-4 md:flex-row"     // Stack on mobile, row on desktop

// Responsive text sizing
className="text-sm md:text-base"               // Larger text on desktop
className="px-2 sm:px-4 lg:px-6"             // Progressive padding
```

### Component-Specific Patterns

#### **Table Styling**
```typescript
// Table header (sticky)
className="sticky top-0 z-[1] bg-muted"

// Table containers
className="overflow-hidden rounded-lg border"

// Cell content
className="text-xs"                    // Table cell text size
```

#### **Loading States**
```typescript
// Skeleton sizing
className="h-8 w-8"                   // Analytics number skeletons
className="h-4 w-32"                  // Text skeletons
className="h-5 w-12 rounded-full"     // Badge skeletons
```

### Usage Guidelines

#### **When to Use Each Text Size**
- **`text-2xl font-bold`**: Main page headers, primary metrics
- **`text-xl font-semibold`**: Panel titles, major section headers  
- **`text-lg font-semibold`**: Subsection headers, content group titles
- **`text-sm font-medium`**: Labels, card headers, navigation
- **`text-base`**: Primary content in panels, important data
- **`text-sm`**: Secondary content, descriptions, form fields
- **`text-xs`**: Table data, compact listings, metadata

#### **Color Usage Rules**
1. **Use semantic colors** (`text-muted-foreground`) over fixed colors when possible
2. **Fixed grays** (`text-gray-600`) only for form labels that need consistent color
3. **Status colors** follow the established badge color system
4. **Success/error states** use `text-green-600` and `text-red-600`
5. **Interactive elements** use theme colors for better dark mode support

#### **Spacing Consistency**
- **Section spacing**: Use `space-y-6` for major sections, `space-y-4` for subsections
- **Field spacing**: Use `space-y-2` for form field containers
- **Component gaps**: Use `gap-4` for grids, `gap-2` for inline elements
- **Container padding**: Use `p-6` for panels, `px-4` for page content