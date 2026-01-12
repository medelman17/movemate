import { describe, it, expect } from "vitest";
import {
  buildDetailedPrompt,
  buildVisualPrompt,
  buildFallbackPrompt,
  getPhotoPrompt,
  identificationOutputSchema,
  DETAILED_META,
  VISUAL_META,
  FALLBACK_META,
} from "./index";
import type { IdentificationContext } from "./types";

describe("Photo Identification Prompts", () => {
  const mockContext: IdentificationContext = {
    userContext: "Item is in my living room",
  };

  describe("buildDetailedPrompt", () => {
    it("should return a string prompt", () => {
      const prompt = buildDetailedPrompt(mockContext);
      expect(typeof prompt).toBe("string");
    });

    it("should include context in the prompt", () => {
      const prompt = buildDetailedPrompt(mockContext);
      expect(prompt).toContain(mockContext.userContext);
    });

    it("should mention brand and model numbers", () => {
      const prompt = buildDetailedPrompt(mockContext);
      expect(prompt.toLowerCase()).toMatch(/brand|model/);
    });

    it("should include confidence level instructions", () => {
      const prompt = buildDetailedPrompt(mockContext);
      expect(prompt).toContain("CONFIDENCE LEVELS");
    });

    it("should include JSON output format instructions", () => {
      const prompt = buildDetailedPrompt(mockContext);
      expect(prompt).toContain("JSON");
    });

    it("should handle empty user context", () => {
      const prompt = buildDetailedPrompt({ userContext: "" });
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(0);
    });
  });

  describe("buildVisualPrompt", () => {
    it("should return a string prompt", () => {
      const prompt = buildVisualPrompt(mockContext);
      expect(typeof prompt).toBe("string");
    });

    it("should include context in the prompt", () => {
      const prompt = buildVisualPrompt(mockContext);
      expect(prompt).toContain(mockContext.userContext);
    });

    it("should emphasize visual characteristics", () => {
      const prompt = buildVisualPrompt(mockContext);
      expect(prompt.toLowerCase()).toMatch(/visual|appearance|style|material/);
    });

    it("should instruct to ignore unclear text", () => {
      const prompt = buildVisualPrompt(mockContext);
      expect(prompt.toLowerCase()).toMatch(/ignore|unclear/);
    });

    it("should be different from detailed prompt", () => {
      const detailedPrompt = buildDetailedPrompt(mockContext);
      const visualPrompt = buildVisualPrompt(mockContext);
      expect(visualPrompt).not.toBe(detailedPrompt);
    });
  });

  describe("buildFallbackPrompt", () => {
    it("should return a string prompt", () => {
      const prompt = buildFallbackPrompt(mockContext);
      expect(typeof prompt).toBe("string");
    });

    it("should include context in the prompt", () => {
      const prompt = buildFallbackPrompt(mockContext);
      expect(prompt).toContain(mockContext.userContext);
    });

    it("should focus on basic categorization", () => {
      const prompt = buildFallbackPrompt(mockContext);
      expect(prompt.toLowerCase()).toMatch(/category|basic|generic/);
    });

    it("should be the simplest/shortest prompt", () => {
      const detailed = buildDetailedPrompt(mockContext);
      const visual = buildVisualPrompt(mockContext);
      const fallback = buildFallbackPrompt(mockContext);

      // Fallback should generally be shorter than the others
      expect(fallback.length).toBeLessThanOrEqual(Math.max(detailed.length, visual.length));
    });
  });

  describe("getPhotoPrompt", () => {
    it("should return detailed strategy prompt and metadata", () => {
      const result = getPhotoPrompt("detailed");
      expect(result.build).toBe(buildDetailedPrompt);
      expect(result.config).toBe(DETAILED_META);
    });

    it("should return visual strategy prompt and metadata", () => {
      const result = getPhotoPrompt("visual");
      expect(result.build).toBe(buildVisualPrompt);
      expect(result.config).toBe(VISUAL_META);
    });

    it("should return fallback strategy prompt and metadata", () => {
      const result = getPhotoPrompt("fallback");
      expect(result.build).toBe(buildFallbackPrompt);
      expect(result.config).toBe(FALLBACK_META);
    });

    it("should return working builder functions", () => {
      const strategies = ["detailed", "visual", "fallback"] as const;
      strategies.forEach((strategy) => {
        const { build } = getPhotoPrompt(strategy);
        const prompt = build(mockContext);
        expect(typeof prompt).toBe("string");
        expect(prompt.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Prompt Metadata", () => {
    describe("DETAILED_META", () => {
      it("should have required metadata fields", () => {
        expect(DETAILED_META.id).toBe("photo-identification-detailed");
        expect(DETAILED_META.version).toBeDefined();
        expect(DETAILED_META.model).toBe("openai/gpt-4o");
        expect(DETAILED_META.maxTokens).toBe(400);
        expect(DETAILED_META.description).toBeDefined();
        expect(Array.isArray(DETAILED_META.changelog)).toBe(true);
      });

      it("should have at least one changelog entry", () => {
        expect(DETAILED_META.changelog.length).toBeGreaterThan(0);
        const firstEntry = DETAILED_META.changelog[0];
        expect(firstEntry.version).toBeDefined();
        expect(firstEntry.date).toBeDefined();
        expect(firstEntry.change).toBeDefined();
      });
    });

    describe("VISUAL_META", () => {
      it("should have required metadata fields", () => {
        expect(VISUAL_META.id).toBe("photo-identification-visual");
        expect(VISUAL_META.version).toBeDefined();
        expect(VISUAL_META.model).toBe("openai/gpt-4o");
        expect(VISUAL_META.maxTokens).toBe(400);
        expect(VISUAL_META.description).toBeDefined();
        expect(Array.isArray(VISUAL_META.changelog)).toBe(true);
      });
    });

    describe("FALLBACK_META", () => {
      it("should have required metadata fields", () => {
        expect(FALLBACK_META.id).toBe("photo-identification-fallback");
        expect(FALLBACK_META.version).toBeDefined();
        expect(FALLBACK_META.model).toBe("openai/gpt-4o");
        expect(FALLBACK_META.maxTokens).toBe(400);
        expect(FALLBACK_META.description).toBeDefined();
        expect(Array.isArray(FALLBACK_META.changelog)).toBe(true);
      });
    });

    it("should have consistent model configuration across strategies", () => {
      expect(DETAILED_META.model).toBe(VISUAL_META.model);
      expect(VISUAL_META.model).toBe(FALLBACK_META.model);
      expect(DETAILED_META.maxTokens).toBe(VISUAL_META.maxTokens);
      expect(VISUAL_META.maxTokens).toBe(FALLBACK_META.maxTokens);
    });
  });

  describe("identificationOutputSchema", () => {
    it("should validate correct output structure", () => {
      const validOutput = {
        productName: "Chair",
        fullProductName: "IKEA POÄNG Armchair, birch veneer/white",
        confidence: "high" as const,
        reasoning: "Brand and model clearly visible",
        needsManualReview: false,
        clarificationQuestions: ["What color do you prefer?"],
      };

      const result = identificationOutputSchema.safeParse(validOutput);
      expect(result.success).toBe(true);
    });

    it("should accept output without optional fields", () => {
      const minimalOutput = {
        productName: "Chair",
        fullProductName: "IKEA POÄNG Armchair",
        confidence: "medium" as const,
        reasoning: "Generic furniture item",
        needsManualReview: true,
      };

      const result = identificationOutputSchema.safeParse(minimalOutput);
      expect(result.success).toBe(true);
    });

    it("should reject invalid confidence levels", () => {
      const invalidOutput = {
        productName: "Chair",
        fullProductName: "Chair",
        confidence: "very-high",
        reasoning: "Test",
        needsManualReview: false,
      };

      const result = identificationOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });

    it("should reject missing required fields", () => {
      const incompleteOutput = {
        productName: "Chair",
        confidence: "high",
      };

      const result = identificationOutputSchema.safeParse(incompleteOutput);
      expect(result.success).toBe(false);
    });

    it("should have all expected fields", () => {
      // Test by parsing a complete valid object
      const completeOutput = {
        productName: "Test",
        fullProductName: "Test Product",
        confidence: "high" as const,
        reasoning: "Test reasoning",
        needsManualReview: false,
        clarificationQuestions: [],
      };

      const result = identificationOutputSchema.safeParse(completeOutput);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.productName).toBeDefined();
        expect(result.data.fullProductName).toBeDefined();
        expect(result.data.confidence).toBeDefined();
        expect(result.data.reasoning).toBeDefined();
        expect(result.data.needsManualReview).toBeDefined();
        expect(result.data.clarificationQuestions).toBeDefined();
      }
    });
  });

  describe("Prompt Integration", () => {
    it("should produce prompts that reference the output schema fields", () => {
      const strategies = ["detailed", "visual", "fallback"] as const;
      strategies.forEach((strategy) => {
        const { build } = getPhotoPrompt(strategy);
        const prompt = build(mockContext);

        // Check that prompt mentions key output fields
        const lowerPrompt = prompt.toLowerCase();
        expect(
          lowerPrompt.includes("productname") ||
          lowerPrompt.includes("product name") ||
          lowerPrompt.includes("name")
        ).toBe(true);
      });
    });

    it("should produce different prompts for different strategies", () => {
      const detailed = buildDetailedPrompt(mockContext);
      const visual = buildVisualPrompt(mockContext);
      const fallback = buildFallbackPrompt(mockContext);

      expect(detailed).not.toBe(visual);
      expect(visual).not.toBe(fallback);
      expect(detailed).not.toBe(fallback);
    });
  });
});
