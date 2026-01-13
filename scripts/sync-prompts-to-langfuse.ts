#!/usr/bin/env npx tsx
/**
 * Sync local prompts to Langfuse Prompt Management.
 *
 * This script exports all prompts from lib/prompts/ to Langfuse for:
 * - Version tracking linked to traces
 * - Performance analytics by prompt version
 * - A/B testing infrastructure
 *
 * Usage:
 *   npx tsx scripts/sync-prompts-to-langfuse.ts
 *   npx tsx scripts/sync-prompts-to-langfuse.ts --dry-run
 *   npx tsx scripts/sync-prompts-to-langfuse.ts --production
 *
 * Environment variables:
 *   LANGFUSE_PUBLIC_KEY - Langfuse public key
 *   LANGFUSE_SECRET_KEY - Langfuse secret key
 *   LANGFUSE_BASE_URL - Langfuse base URL (optional)
 */

import { LangfuseClient } from "@langfuse/client";
import { getAllPromptVersions } from "../lib/prompts";

// Import prompt builders for content export
import { buildPrompt as buildStrategicPrompt } from "../lib/prompts/photo-identification/strategic";
import { buildPrompt as buildUrlResearchPrompt } from "../lib/prompts/product-research/url-based";
import { buildPrompt as buildSearchResearchPrompt } from "../lib/prompts/product-research/search-based";
import { simplifyNameSystemPrompt } from "../lib/prompts/utilities/simplify-name";

// Map prompt IDs to their builders with sample context
const promptBuilders: Record<string, () => string> = {
  "photo-identification-strategic": () =>
    buildStrategicPrompt({ userContext: undefined, previousAnswers: undefined }),
  "product-research-url": () =>
    buildUrlResearchPrompt({ url: "https://example.com/product" }),
  "product-research-search": () =>
    buildSearchResearchPrompt({ productName: "IKEA KALLAX shelf" }),
  "simplify-product-name": () => simplifyNameSystemPrompt,
};

interface SyncOptions {
  dryRun: boolean;
  labels: string[];
}

async function syncPrompts(options: SyncOptions): Promise<void> {
  const { dryRun, labels } = options;

  // Validate environment
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;

  if (!publicKey || !secretKey) {
    console.error("Error: LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY must be set");
    process.exit(1);
  }

  const client = new LangfuseClient({
    publicKey,
    secretKey,
    baseUrl: process.env.LANGFUSE_BASE_URL || "https://cloud.langfuse.com",
  });

  console.log("\n🔄 Syncing prompts to Langfuse...\n");
  console.log(`   Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`   Labels: ${labels.join(", ")}\n`);

  const allPrompts = getAllPromptVersions();
  let synced = 0;
  let skipped = 0;
  let errors = 0;

  for (const prompt of allPrompts) {
    const promptId = prompt.id;
    const builder = promptBuilders[promptId];

    if (!builder) {
      console.log(`   ⏭️  ${promptId} - No builder found, skipping`);
      skipped++;
      continue;
    }

    try {
      const content = builder();

      console.log(`   📝 ${promptId}`);
      console.log(`      Version: ${prompt.version}`);
      console.log(`      Model: ${prompt.model}`);
      console.log(`      Content: ${content.length} chars`);

      if (!dryRun) {
        await client.prompt.create({
          name: promptId,
          type: "text",
          prompt: content,
          labels,
          config: {
            version: prompt.version,
            model: prompt.model,
            maxTokens: prompt.maxTokens,
            description: prompt.description,
          },
        });
        console.log(`      ✅ Synced`);
      } else {
        console.log(`      🔍 Would sync (dry run)`);
      }

      synced++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`      ❌ Error: ${message}`);
      errors++;
    }
  }

  // Flush to ensure all requests are sent
  if (!dryRun) {
    await client.flush();
  }

  console.log("\n📊 Summary:");
  console.log(`   Synced: ${synced}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log();
}

// Parse CLI arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const isProduction = args.includes("--production");

const labels = isProduction ? ["production"] : ["staging"];

syncPrompts({ dryRun, labels }).catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
