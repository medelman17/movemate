# MoveMate

A modern moving inventory management application with AI-powered item identification. Track your belongings, estimate moving costs, and stay organized during your move.

## Features

### AI-Powered Item Identification
- **Photo Recognition**: Upload a photo and GPT-4o Vision identifies the item automatically
- **Smart Questioning**: When uncertain, the AI asks targeted clarifying questions
- **Web Research**: Perplexity-powered product research fetches dimensions, weight, and specifications
- **Visual Estimates**: Always provides fallback estimates from visual analysis

### Inventory Management
- **Track Items**: Organize items by category and room location
- **Dimensions & Weight**: Store physical specifications for moving estimates
- **Packing Status**: Mark items as packed or unpacked
- **Bulk Actions**: Select multiple items for batch operations
- **CSV Export**: Export your complete inventory for moving companies

### Dashboard Metrics
- Total item count
- Estimated total volume (cubic feet)
- Estimated total weight (pounds)

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Language**: TypeScript (strict mode)
- **UI**: [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL + Row Level Security)
- **Authentication**: Supabase Auth
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai) with AI Gateway
  - GPT-4o for vision/photo analysis
  - GPT-4o-mini for simple tasks
  - Perplexity Sonar Pro for web research
- **Storage**: [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for image uploads
- **Observability**: [Langfuse](https://langfuse.com) for AI tracing (optional)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Supabase account
- Vercel account (for AI Gateway and Blob storage)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/medelman17/v0-moving-inventory-app.git
   cd v0-moving-inventory-app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure the required environment variables in `.env.local`:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Vercel AI Gateway
   AI_GATEWAY_API_KEY=your_vercel_ai_gateway_key

   # Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

   # Optional: Langfuse for AI observability
   LANGFUSE_ENABLED=false
   LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
   LANGFUSE_SECRET_KEY=your_langfuse_secret_key
   LANGFUSE_HOST=https://cloud.langfuse.com
   ```

5. Set up the database:
   - Run the migrations in `supabase/migrations/` in your Supabase SQL Editor
   - This creates the `items` and `locations` tables with Row Level Security

6. Start the development server:
   ```bash
   pnpm dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run unit tests (Vitest)
pnpm test:ui      # Run tests with UI
```

## Project Structure

```
├── app/
│   ├── actions/          # Server actions for AI operations
│   ├── api/              # API routes (file uploads)
│   ├── auth/             # Authentication pages
│   └── page.tsx          # Main inventory dashboard
├── components/
│   ├── inventory/        # Domain-specific components
│   └── ui/               # shadcn/ui component library
├── lib/
│   ├── prompts/          # Centralized AI prompt management
│   ├── supabase/         # Supabase client configuration
│   ├── langfuse/         # AI observability utilities
│   └── types.ts          # TypeScript type definitions
├── hooks/                # Custom React hooks
├── supabase/
│   └── migrations/       # Database migration files
└── e2e/                  # End-to-end tests (Playwright)
```

## AI Architecture

### Photo Identification Flow

1. User uploads a photo (supports JPEG, PNG, WebP, HEIC)
2. Client-side preprocessing: resize, compress, fix orientation
3. GPT-4o Vision analyzes the image with strategic prompting
4. If high confidence: proceed to product research
5. If uncertain: ask targeted clarification questions (max 2 rounds)
6. Perplexity Sonar Pro researches product specifications online
7. Form auto-fills with identified product data

### Prompt Management System

All AI prompts are centralized in `lib/prompts/` with:
- Version tracking and metadata
- Type-safe builder patterns
- Zod schemas for structured outputs
- Reusable shared fragments

## Data Model

The core `Item` type includes:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner reference |
| name | string | Item name |
| description | string? | Optional description |
| category | string | Category (Furniture, Electronics, etc.) |
| location | string | Room location |
| quantity | number | Item count |
| weight | number? | Weight in pounds |
| length, width, height | number? | Dimensions in inches |
| can_disassemble | boolean | Whether item can be taken apart |
| is_fragile | boolean | Fragile handling required |
| photo_url | string? | Uploaded photo URL |
| is_packed | boolean | Packing status |

## Development

### Adding New AI Prompts

1. Create a prompt file in the appropriate `lib/prompts/` subdirectory
2. Export `PROMPT_META: PromptConfig` with version and model info
3. Export a typed `buildPrompt: PromptBuilder<TContext>` function
4. Add Zod schema for structured outputs
5. Register in the domain's `index.ts`
6. Write unit tests

### Supabase Client Pattern

```typescript
// Client-side (browser)
import { createClient } from "@/lib/supabase/client"

// Server-side (Server Components, Server Actions)
import { createClient } from "@/lib/supabase/server"
```

### Vercel AI Gateway

Always use the gateway pattern for AI calls:

```typescript
import { createGateway } from "ai"

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? "",
})

// Use provider/model format
const { object } = await generateObject({
  model: gateway("openai/gpt-4o"),
  // ...
})
```

## Deployment

The application is designed for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

The project includes Vercel Analytics for monitoring.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
