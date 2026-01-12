# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MoveMate is a moving inventory management application with AI-powered item identification. Built with Next.js 16 (App Router), React 19, Supabase, and Vercel AI SDK.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm start        # Start production server
```

## Architecture

### Directory Structure

- **app/** - Next.js App Router pages and API routes
- **app/actions/** - Server actions with `"use server"` for AI operations
- **app/api/** - API routes (file uploads)
- **app/auth/** - Authentication pages (login, sign-up)
- **components/ui/** - shadcn/ui component library
- **components/inventory/** - Domain-specific inventory components
- **lib/supabase/** - Supabase client initialization (client.ts, server.ts)
- **hooks/** - Custom React hooks

### Key Patterns

**Supabase Dual Client Pattern:**

- `lib/supabase/client.ts` - Browser client using `createBrowserClient` for client components
- `lib/supabase/server.ts` - Server client using `createServerClient` with cookie management

**AI Integration:**

- Server actions in `app/actions/` use Vercel AI SDK (`ai` package)
- `identify-from-photo.ts` - GPT-4o vision for item identification with structured output (Zod schemas)
- `product-research.ts` - Perplexity API (`perplexity/sonar-pro`) for web research
- Uses `generateObject` with Zod schemas for type-safe AI responses

**UI Components:**

- shadcn/ui with Radix UI primitives
- Class variance authority (CVA) for component variants
- Tailwind CSS v4 with CSS custom properties (OKLch color space)

**Forms:**

- react-hook-form with Zod validation via `@hookform/resolvers`

**State Management:**

- React useState for component-level state
- No centralized store; Server Components fetch data directly
- Custom `useToast` hook with reducer pattern for notifications

### Data Model

Core `Item` type includes: id, user_id, name, description, category, location, quantity, weight, dimensions (length/width/height), can_disassemble, photo_url, notes, is_packed, created_at, updated_at

### File Uploads

Images upload to Vercel Blob via `POST /api/upload`, with client-side preprocessing for compression and orientation correction.

## Environment Variables

Required Supabase and OpenAI configuration. Check `.env.local` for required keys.

## Important Notes

- Never use mock data as a workaround
- TypeScript strict mode enabled with path aliases (`@/*`)
- Server actions handle AI processing; client components handle UI state
- Auto-login with test user exists for development (check auth flow)

<!-- BACKLOG.MD MCP GUIDELINES START -->

<CRITICAL_INSTRUCTION>

## BACKLOG WORKFLOW INSTRUCTIONS

This project uses Backlog.md MCP for all task and project management activities.

**CRITICAL GUIDANCE**

- If your client supports MCP resources, read `backlog://workflow/overview` to understand when and how to use Backlog for this project.
- If your client only supports tools or the above request fails, call `backlog.get_workflow_overview()` tool to load the tool-oriented overview (it lists the matching guide tools).

- **First time working here?** Read the overview resource IMMEDIATELY to learn the workflow
- **Already familiar?** You should have the overview cached ("## Backlog.md Overview (MCP)")
- **When to read it**: BEFORE creating tasks, or when you're unsure whether to track work

These guides cover:

- Decision framework for when to create tasks
- Search-first workflow to avoid duplicates
- Links to detailed guides for task creation, execution, and completion
- MCP tools reference

You MUST read the overview resource to understand the complete workflow. The information is NOT summarized here.

</CRITICAL_INSTRUCTION>

<!-- BACKLOG.MD MCP GUIDELINES END -->
