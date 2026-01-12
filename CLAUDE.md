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
- **lib/prompts/** - Centralized AI prompt management system
- **hooks/** - Custom React hooks

### Prompt Management System

All AI prompts are centralized in `lib/prompts/` with versioning, metadata, and type safety:

**Directory Structure:**
```
lib/prompts/
├── index.ts                    # Central registry and exports
├── config.ts                   # Model configurations (vision, webSearch, fast)
├── types.ts                    # Core types (PromptConfig, PromptBuilder, ModelConfig)
├── shared/                     # Reusable prompt fragments
│   ├── confidence-levels.ts
│   ├── dimension-conversion.ts
│   ├── moving-context.ts
│   └── output-format.ts
├── photo-identification/       # Photo analysis prompts (3 strategies)
│   ├── detailed.ts
│   ├── visual.ts
│   ├── fallback.ts
│   └── types.ts
├── product-research/           # Product research prompts (URL & search)
│   ├── url-based.ts
│   ├── search-based.ts
│   └── types.ts
└── utilities/                  # Utility prompts
    └── simplify-name.ts
```

**Prompt Organization Patterns:**

1. **Metadata Tracking**: Each prompt has `PromptConfig` with id, version, model, maxTokens, description, and changelog
2. **Builder Pattern**: Prompts use typed `PromptBuilder<TContext>` functions that accept context objects
3. **Shared Fragments**: Reusable components (confidenceLevels, dimensionConversion) composed into prompts
4. **Co-located Schemas**: Zod validation schemas live with their prompts
5. **Central Registry**: `promptRegistry` in [lib/prompts/index.ts](lib/prompts/index.ts:1) for tooling/debugging access

**Adding New Prompts:**
1. Create prompt file in appropriate domain directory
2. Export `PROMPT_META: PromptConfig` with metadata
3. Export `buildPrompt: PromptBuilder<TContext>` function
4. Add Zod schema if structured output needed
5. Register in domain index.ts
6. Write unit tests in `.test.ts` file

**Model Configurations:**
- `vision`: GPT-4o for photo analysis (400 tokens, temp 0.3)
- `webSearch`: Perplexity sonar-pro for research (1000 tokens, temp 0.2)
- `fast`: GPT-4o-mini for simple tasks (50 tokens, temp 0.1)

### Key Patterns

**Supabase Dual Client Pattern:**

- `lib/supabase/client.ts` - Browser client using `createBrowserClient` for client components
- `lib/supabase/server.ts` - Server client using `createServerClient` with cookie management

**AI Integration:**

- Server actions in `app/actions/` use Vercel AI SDK (`ai` package)
- `identify-from-photo.ts` - GPT-4o vision for item identification using prompts from [lib/prompts/photo-identification](lib/prompts/photo-identification/index.ts:1)
- `product-research.ts` - Perplexity sonar-pro for web research using prompts from [lib/prompts/product-research](lib/prompts/product-research/index.ts:1)
- `simplify-product-name.ts` - GPT-4o-mini for name simplification using prompt from [lib/prompts/utilities](lib/prompts/utilities/index.ts:1)
- Uses `generateObject` with Zod schemas from `lib/prompts/` for type-safe AI responses

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
