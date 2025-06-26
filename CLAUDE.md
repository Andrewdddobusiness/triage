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
The application handles two main data flows:
- **Customer Inquiries**: New job requests captured via voice calls
- **Customer Messages**: Follow-up messages for existing jobs

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