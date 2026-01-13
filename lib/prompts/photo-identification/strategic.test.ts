import { describe, it, expect } from "vitest";
import { buildPrompt, PROMPT_META } from "./strategic";
import {
  strategicIdentificationSchema,
  clarificationQuestionSchema,
  visualEstimatesSchema,
  identificationStrategySchema,
} from "./types";

describe("strategic prompt", () => {
  describe("PROMPT_META", () => {
    it("has correct metadata structure", () => {
      expect(PROMPT_META.id).toBe("photo-identification-strategic");
      expect(PROMPT_META.version).toBe("2.1.0");
      expect(PROMPT_META.model).toBe("openai/gpt-5.2-2025-12-11");
      expect(PROMPT_META.maxTokens).toBe(800);
    });

    it("has changelog entries", () => {
      expect(PROMPT_META.changelog).toBeDefined();
      expect(PROMPT_META.changelog!.length).toBeGreaterThan(0);
    });
  });

  describe("buildPrompt", () => {
    it("builds base prompt without context", () => {
      const prompt = buildPrompt({});

      expect(prompt).toContain("expert at identifying household items");
      expect(prompt).toContain("STRATEGIC APPROACHES");
      expect(prompt).toContain("OUTPUT STRUCTURE");
      expect(prompt).not.toContain("USER CONTEXT:");
      expect(prompt).not.toContain("PREVIOUS ANSWERS:");
    });

    it("includes user context when provided", () => {
      const prompt = buildPrompt({ userContext: "This is my living room couch" });

      expect(prompt).toContain("USER CONTEXT:");
      expect(prompt).toContain("This is my living room couch");
    });

    it("includes previous answers when provided", () => {
      const prompt = buildPrompt({
        previousAnswers: {
          "Where did you purchase this?": "IKEA",
          "What was the approximate price?": "Under $300",
        },
      });

      expect(prompt).toContain("PREVIOUS ANSWERS:");
      expect(prompt).toContain("Q: Where did you purchase this?");
      expect(prompt).toContain("A: IKEA");
      expect(prompt).toContain("Q: What was the approximate price?");
      expect(prompt).toContain("A: Under $300");
    });

    it("includes both context and answers when provided", () => {
      const prompt = buildPrompt({
        userContext: "Mid-century coffee table",
        previousAnswers: { "Retailer?": "West Elm" },
      });

      expect(prompt).toContain("USER CONTEXT:");
      expect(prompt).toContain("Mid-century coffee table");
      expect(prompt).toContain("PREVIOUS ANSWERS:");
      expect(prompt).toContain("A: West Elm");
    });

    it("handles empty previousAnswers object", () => {
      const prompt = buildPrompt({ previousAnswers: {} });

      expect(prompt).not.toContain("PREVIOUS ANSWERS:");
    });

    it("does not include final round warning when clarificationRound is 0", () => {
      const prompt = buildPrompt({ clarificationRound: 0 });

      expect(prompt).not.toContain("FINAL ROUND");
      expect(prompt).not.toContain("NO MORE QUESTIONS ALLOWED");
    });

    it("does not include final round warning when clarificationRound is undefined", () => {
      const prompt = buildPrompt({});

      expect(prompt).not.toContain("FINAL ROUND");
      expect(prompt).not.toContain("NO MORE QUESTIONS ALLOWED");
    });

    it("does not include final round warning for rounds 1-3", () => {
      for (const round of [1, 2, 3]) {
        const prompt = buildPrompt({ clarificationRound: round });
        expect(prompt).not.toContain("FINAL ROUND");
        expect(prompt).not.toContain("NO MORE QUESTIONS ALLOWED");
      }
    });

    it("includes final round warning when clarificationRound is 4", () => {
      const prompt = buildPrompt({ clarificationRound: 4 });

      expect(prompt).toContain("FINAL ROUND");
      expect(prompt).toContain("NO MORE QUESTIONS ALLOWED");
      expect(prompt).toContain("make your BEST identification attempt");
      expect(prompt).toContain("return an empty questions array");
    });

    it("includes final round warning when clarificationRound is >= 4", () => {
      const prompt = buildPrompt({ clarificationRound: 5 });

      expect(prompt).toContain("FINAL ROUND");
      expect(prompt).toContain("NO MORE QUESTIONS ALLOWED");
    });

    it("includes final round warning with previous answers", () => {
      const prompt = buildPrompt({
        clarificationRound: 4,
        previousAnswers: { "Where purchased?": "IKEA" },
      });

      expect(prompt).toContain("PREVIOUS ANSWERS:");
      expect(prompt).toContain("A: IKEA");
      expect(prompt).toContain("FINAL ROUND");
      expect(prompt).toContain("Use the answers provided to narrow down the identification");
    });

    it("includes all strategic approaches", () => {
      const prompt = buildPrompt({});

      expect(prompt).toContain("check_label");
      expect(prompt).toContain("purchase_history");
      expect(prompt).toContain("store_search");
      expect(prompt).toContain("feature_match");
      expect(prompt).toContain("use_estimates");
    });

    it("includes available categories", () => {
      const prompt = buildPrompt({});

      expect(prompt).toContain("AVAILABLE CATEGORIES:");
      expect(prompt).toContain("Furniture");
      expect(prompt).toContain("Electronics");
      expect(prompt).toContain("Kitchenware");
    });

    it("includes confidence levels guidance", () => {
      const prompt = buildPrompt({});

      // Confidence levels are imported from shared module (uppercase in text)
      expect(prompt).toContain("CONFIDENCE LEVELS:");
      expect(prompt).toContain("HIGH:");
      expect(prompt).toContain("MEDIUM:");
      expect(prompt).toContain("LOW:");
    });
  });
});

describe("schema validation", () => {
  describe("clarificationQuestionSchema", () => {
    it("validates a valid select question", () => {
      const question = {
        question: "Where did you purchase this?",
        rationale: "Retailer catalog search",
        inputType: "select",
        options: ["IKEA", "Wayfair", "Amazon", "Other"],
        placeholder: null,
      };

      const result = clarificationQuestionSchema.safeParse(question);
      expect(result.success).toBe(true);
    });

    it("validates a valid text question", () => {
      const question = {
        question: "What brand is visible on the label?",
        rationale: "Direct brand identification",
        inputType: "text",
        options: null,
        placeholder: "Enter brand name...",
      };

      const result = clarificationQuestionSchema.safeParse(question);
      expect(result.success).toBe(true);
    });

    it("rejects invalid inputType", () => {
      const question = {
        question: "Test question",
        rationale: "Test",
        inputType: "invalid_type",
        options: null,
        placeholder: null,
      };

      const result = clarificationQuestionSchema.safeParse(question);
      expect(result.success).toBe(false);
    });

    it("validates photo input type", () => {
      const question = {
        question: "Can you take a photo of the label?",
        rationale: "Label contains product info",
        inputType: "photo",
        options: null,
        placeholder: null,
      };

      const result = clarificationQuestionSchema.safeParse(question);
      expect(result.success).toBe(true);
    });
  });

  describe("visualEstimatesSchema", () => {
    it("validates complete estimates", () => {
      const estimates = {
        dimensions: { length: 48, width: 24, height: 18 },
        weight: 60,
        canDisassemble: true,
        notes: "Marble top makes it heavy",
      };

      const result = visualEstimatesSchema.safeParse(estimates);
      expect(result.success).toBe(true);
    });

    it("allows null dimensions", () => {
      const estimates = {
        dimensions: { length: null, width: null, height: null },
        weight: null,
        canDisassemble: null,
        notes: null,
      };

      const result = visualEstimatesSchema.safeParse(estimates);
      expect(result.success).toBe(true);
    });

    it("allows partial dimensions", () => {
      const estimates = {
        dimensions: { length: 48, width: 24, height: null },
        weight: 60,
        canDisassemble: false,
        notes: null,
      };

      const result = visualEstimatesSchema.safeParse(estimates);
      expect(result.success).toBe(true);
    });
  });

  describe("identificationStrategySchema", () => {
    it("validates check_label strategy", () => {
      const strategy = {
        approach: "check_label",
        confidence: 0.7,
        reasoning: "Item likely has a tag under seat cushion",
        questions: [
          {
            question: "Can you check under the seat cushions for a tag?",
            rationale: "Most sofas have tags there",
            inputType: "photo",
            options: null,
            placeholder: null,
          },
        ],
      };

      const result = identificationStrategySchema.safeParse(strategy);
      expect(result.success).toBe(true);
    });

    it("validates use_estimates strategy with no questions", () => {
      const strategy = {
        approach: "use_estimates",
        confidence: 0.6,
        reasoning: "Generic item, visual estimates sufficient",
        questions: [],
      };

      const result = identificationStrategySchema.safeParse(strategy);
      expect(result.success).toBe(true);
    });

    it("rejects more than 3 questions", () => {
      const strategy = {
        approach: "purchase_history",
        confidence: 0.8,
        reasoning: "Need purchase info",
        questions: [
          { question: "Q1", rationale: "R1", inputType: "text", options: null, placeholder: null },
          { question: "Q2", rationale: "R2", inputType: "text", options: null, placeholder: null },
          { question: "Q3", rationale: "R3", inputType: "text", options: null, placeholder: null },
          { question: "Q4", rationale: "R4", inputType: "text", options: null, placeholder: null },
        ],
      };

      const result = identificationStrategySchema.safeParse(strategy);
      expect(result.success).toBe(false);
    });

    it("rejects confidence outside 0-1 range", () => {
      const strategyTooHigh = {
        approach: "feature_match",
        confidence: 1.5,
        reasoning: "Test",
        questions: [],
      };

      const strategyTooLow = {
        approach: "feature_match",
        confidence: -0.1,
        reasoning: "Test",
        questions: [],
      };

      expect(identificationStrategySchema.safeParse(strategyTooHigh).success).toBe(false);
      expect(identificationStrategySchema.safeParse(strategyTooLow).success).toBe(false);
    });
  });

  describe("strategicIdentificationSchema", () => {
    it("validates complete response with immediate identification", () => {
      const response = {
        itemType: "Coffee Table",
        category: "Furniture",
        distinctiveFeatures: ["Mid-century modern legs", "White marble top"],
        styleFamily: "Mid-Century Modern",
        visualEstimates: {
          dimensions: { length: 48, width: 24, height: 18 },
          weight: 60,
          canDisassemble: false,
          notes: "Marble top is heavy",
        },
        strategy: {
          approach: "use_estimates",
          confidence: 0.9,
          reasoning: "Brand visible in photo",
          questions: [],
        },
        immediateIdentification: {
          productName: "Coffee Table",
          fullProductName: "West Elm Mid-Century Pop-Up Coffee Table",
          confidence: "high",
        },
      };

      const result = strategicIdentificationSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it("validates response with questions and no immediate ID", () => {
      const response = {
        itemType: "Sofa",
        category: "Furniture",
        distinctiveFeatures: ["Tufted back", "Velvet fabric", "Gold legs"],
        styleFamily: "Modern Glam",
        visualEstimates: {
          dimensions: { length: 84, width: 36, height: 32 },
          weight: 120,
          canDisassemble: true,
          notes: "Legs appear removable",
        },
        strategy: {
          approach: "purchase_history",
          confidence: 0.7,
          reasoning: "Distinctive style likely from major retailer",
          questions: [
            {
              question: "Where did you purchase this sofa?",
              rationale: "Retailer catalog search",
              inputType: "select",
              options: ["Wayfair", "West Elm", "Article", "Other"],
              placeholder: null,
            },
          ],
        },
        immediateIdentification: null,
      };

      const result = strategicIdentificationSchema.safeParse(response);
      expect(result.success).toBe(true);
    });

    it("validates all category values", () => {
      const categories = [
        "Furniture",
        "Electronics",
        "Kitchenware",
        "Clothing",
        "Books",
        "Decor",
        "Tools",
        "Appliances",
        "Other",
      ];

      for (const category of categories) {
        const response = {
          itemType: "Test Item",
          category,
          distinctiveFeatures: [],
          styleFamily: null,
          visualEstimates: {
            dimensions: { length: null, width: null, height: null },
            weight: null,
            canDisassemble: null,
            notes: null,
          },
          strategy: {
            approach: "use_estimates",
            confidence: 0.5,
            reasoning: "Test",
            questions: [],
          },
          immediateIdentification: null,
        };

        const result = strategicIdentificationSchema.safeParse(response);
        expect(result.success).toBe(true);
      }
    });

    it("rejects invalid category", () => {
      const response = {
        itemType: "Test",
        category: "InvalidCategory",
        distinctiveFeatures: [],
        styleFamily: null,
        visualEstimates: {
          dimensions: { length: null, width: null, height: null },
          weight: null,
          canDisassemble: null,
          notes: null,
        },
        strategy: {
          approach: "use_estimates",
          confidence: 0.5,
          reasoning: "Test",
          questions: [],
        },
        immediateIdentification: null,
      };

      const result = strategicIdentificationSchema.safeParse(response);
      expect(result.success).toBe(false);
    });

    it("validates all strategy approaches", () => {
      const approaches = [
        "check_label",
        "purchase_history",
        "store_search",
        "feature_match",
        "use_estimates",
      ];

      for (const approach of approaches) {
        const response = {
          itemType: "Test Item",
          category: "Furniture",
          distinctiveFeatures: [],
          styleFamily: null,
          visualEstimates: {
            dimensions: { length: null, width: null, height: null },
            weight: null,
            canDisassemble: null,
            notes: null,
          },
          strategy: {
            approach,
            confidence: 0.5,
            reasoning: "Test",
            questions: [],
          },
          immediateIdentification: null,
        };

        const result = strategicIdentificationSchema.safeParse(response);
        expect(result.success).toBe(true);
      }
    });
  });
});
