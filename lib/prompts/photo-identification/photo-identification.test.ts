import { describe, it, expect } from "vitest";
import {
  buildDetailedPrompt,
  buildVisualPrompt,
  buildFallbackPrompt,
  buildStrategicPrompt,
  getPhotoPrompt,
  identificationOutputSchema,
  strategicIdentificationSchema,
  clarificationQuestionSchema,
  DETAILED_META,
  VISUAL_META,
  FALLBACK_META,
  STRATEGIC_META,
} from "./index";
import type { IdentificationContext, StrategicIdentificationContext } from "./types";

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
        const firstEntry = DETAILED_META.changelog[0]!;
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

  describe("V2 Strategic Identification", () => {
    const mockStrategicContext: StrategicIdentificationContext = {
      userContext: "This is my coffee table from IKEA",
      previousAnswers: {
        "Where did you purchase this?": "IKEA",
        "What was the approximate price?": "$300-$800",
      },
    };

    describe("buildStrategicPrompt", () => {
      it("should return a string prompt", () => {
        const prompt = buildStrategicPrompt({});
        expect(typeof prompt).toBe("string");
      });

      it("should include user context when provided", () => {
        const prompt = buildStrategicPrompt({ userContext: "This is my couch" });
        expect(prompt).toContain("This is my couch");
      });

      it("should include previous answers when provided", () => {
        const prompt = buildStrategicPrompt(mockStrategicContext);
        expect(prompt).toContain("IKEA");
        expect(prompt).toContain("$300-$800");
      });

      it("should include strategic approaches section", () => {
        const prompt = buildStrategicPrompt({});
        expect(prompt).toContain("STRATEGIC APPROACHES");
        expect(prompt).toContain("check_label");
        expect(prompt).toContain("purchase_history");
        expect(prompt).toContain("store_search");
        expect(prompt).toContain("feature_match");
        expect(prompt).toContain("use_estimates");
      });

      it("should include critical rules", () => {
        const prompt = buildStrategicPrompt({});
        expect(prompt).toContain("CRITICAL RULES");
        expect(prompt).toContain("Maximum 3 questions");
      });

      it("should include question quality examples", () => {
        const prompt = buildStrategicPrompt({});
        expect(prompt).toContain("QUESTION QUALITY EXAMPLES");
        expect(prompt).toContain("GOOD:");
        expect(prompt).toContain("BAD:");
      });

      it("should include visual estimates instructions", () => {
        const prompt = buildStrategicPrompt({});
        expect(prompt).toContain("VISUAL ESTIMATES");
        expect(prompt).toContain("Dimensions");
        expect(prompt).toContain("Weight");
      });

      it("should include output structure", () => {
        const prompt = buildStrategicPrompt({});
        expect(prompt).toContain("OUTPUT STRUCTURE");
        expect(prompt).toContain("itemType");
        expect(prompt).toContain("strategy");
      });
    });

    describe("STRATEGIC_META", () => {
      it("should have required metadata fields", () => {
        expect(STRATEGIC_META.id).toBe("photo-identification-strategic");
        expect(STRATEGIC_META.version).toBe("2.0.0");
        expect(STRATEGIC_META.model).toBe("openai/gpt-4o");
        expect(STRATEGIC_META.maxTokens).toBe(800);
        expect(STRATEGIC_META.description).toBeDefined();
        expect(Array.isArray(STRATEGIC_META.changelog)).toBe(true);
      });

      it("should have higher maxTokens than V1 prompts", () => {
        expect(STRATEGIC_META.maxTokens).toBeGreaterThan(DETAILED_META.maxTokens);
      });
    });

    describe("strategicIdentificationSchema", () => {
      it("should validate correct strategic output", () => {
        const validOutput = {
          itemType: "Coffee Table",
          category: "Furniture",
          distinctiveFeatures: ["Mid-century modern legs", "White marble top"],
          styleFamily: "Mid-Century Modern",
          visualEstimates: {
            dimensions: { length: 48, width: 24, height: 18 },
            weight: 60,
            canDisassemble: false,
            notes: "Marble top makes this heavy",
          },
          strategy: {
            approach: "purchase_history",
            confidence: 0.8,
            reasoning: "Distinctive style from major retailer",
            questions: [
              {
                question: "Where did you purchase this coffee table?",
                rationale: "Retailer catalog search will find exact match",
                inputType: "select",
                options: ["IKEA", "West Elm", "CB2", "Article"],
              },
            ],
          },
        };

        const result = strategicIdentificationSchema.safeParse(validOutput);
        expect(result.success).toBe(true);
      });

      it("should accept output with immediate identification", () => {
        const outputWithId = {
          itemType: "Coffee Table",
          category: "Furniture",
          distinctiveFeatures: ["IKEA LACK branding visible"],
          visualEstimates: {
            dimensions: { length: 35, width: 22, height: 18 },
            weight: 15,
            canDisassemble: false,
          },
          strategy: {
            approach: "use_estimates",
            confidence: 0.95,
            reasoning: "Brand clearly visible in photo",
            questions: [],
          },
          immediateIdentification: {
            productName: "Coffee Table",
            fullProductName: 'IKEA LACK Coffee Table, white, 35x22"',
            confidence: "high",
          },
        };

        const result = strategicIdentificationSchema.safeParse(outputWithId);
        expect(result.success).toBe(true);
      });

      it("should reject invalid strategy approaches", () => {
        const invalidOutput = {
          itemType: "Table",
          category: "Furniture",
          distinctiveFeatures: [],
          visualEstimates: {
            dimensions: { length: null, width: null, height: null },
            weight: null,
            canDisassemble: null,
          },
          strategy: {
            approach: "invalid_strategy",
            confidence: 0.5,
            reasoning: "Test",
            questions: [],
          },
        };

        const result = strategicIdentificationSchema.safeParse(invalidOutput);
        expect(result.success).toBe(false);
      });

      it("should reject invalid categories", () => {
        const invalidOutput = {
          itemType: "Table",
          category: "InvalidCategory",
          distinctiveFeatures: [],
          visualEstimates: {
            dimensions: { length: null, width: null, height: null },
            weight: null,
            canDisassemble: null,
          },
          strategy: {
            approach: "use_estimates",
            confidence: 0.5,
            reasoning: "Test",
            questions: [],
          },
        };

        const result = strategicIdentificationSchema.safeParse(invalidOutput);
        expect(result.success).toBe(false);
      });

      it("should validate confidence range", () => {
        const outOfRangeConfidence = {
          itemType: "Table",
          category: "Furniture",
          distinctiveFeatures: [],
          visualEstimates: {
            dimensions: { length: null, width: null, height: null },
            weight: null,
            canDisassemble: null,
          },
          strategy: {
            approach: "use_estimates",
            confidence: 1.5, // Invalid: > 1
            reasoning: "Test",
            questions: [],
          },
        };

        const result = strategicIdentificationSchema.safeParse(outOfRangeConfidence);
        expect(result.success).toBe(false);
      });

      it("should enforce maximum 3 questions", () => {
        const tooManyQuestions = {
          itemType: "Table",
          category: "Furniture",
          distinctiveFeatures: [],
          visualEstimates: {
            dimensions: { length: null, width: null, height: null },
            weight: null,
            canDisassemble: null,
          },
          strategy: {
            approach: "store_search",
            confidence: 0.5,
            reasoning: "Test",
            questions: [
              { question: "Q1?", rationale: "R1", inputType: "text" },
              { question: "Q2?", rationale: "R2", inputType: "text" },
              { question: "Q3?", rationale: "R3", inputType: "text" },
              { question: "Q4?", rationale: "R4", inputType: "text" },
            ],
          },
        };

        const result = strategicIdentificationSchema.safeParse(tooManyQuestions);
        expect(result.success).toBe(false);
      });
    });

    describe("clarificationQuestionSchema", () => {
      it("should validate text input question", () => {
        const question = {
          question: "What material is the surface?",
          rationale: "Helps narrow product search",
          inputType: "text",
          placeholder: "e.g., wood, glass, metal",
        };

        const result = clarificationQuestionSchema.safeParse(question);
        expect(result.success).toBe(true);
      });

      it("should validate select input question with options", () => {
        const question = {
          question: "Where did you purchase this?",
          rationale: "Enables catalog search",
          inputType: "select",
          options: ["IKEA", "Wayfair", "Amazon", "Other"],
        };

        const result = clarificationQuestionSchema.safeParse(question);
        expect(result.success).toBe(true);
      });

      it("should validate all input types", () => {
        const inputTypes = ["text", "select", "photo", "date", "number"] as const;

        inputTypes.forEach((inputType) => {
          const question = {
            question: "Test question?",
            rationale: "Test rationale",
            inputType,
            options: inputType === "select" ? ["Option 1", "Option 2"] : undefined,
          };

          const result = clarificationQuestionSchema.safeParse(question);
          expect(result.success).toBe(true);
        });
      });

      it("should reject invalid input types", () => {
        const question = {
          question: "Test?",
          rationale: "Test",
          inputType: "invalid_type",
        };

        const result = clarificationQuestionSchema.safeParse(question);
        expect(result.success).toBe(false);
      });
    });
  });
});
