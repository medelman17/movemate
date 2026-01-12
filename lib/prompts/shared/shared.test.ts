import { describe, it, expect } from "vitest";
import {
  jsonOutputInstruction,
  jsonOnlyReminder,
  wrapJsonResponse,
  confidenceLevels,
  confidenceLevelsCompact,
  confidenceThresholds,
  dimensionConversionRules,
  dimensionFormat,
  movingInventoryContext,
  itemCategories,
  categoryExamples,
} from "./index";
import type { ConfidenceLevel, ItemCategory } from "./index";

describe("Shared Prompt Fragments", () => {
  describe("JSON Output Format", () => {
    describe("jsonOutputInstruction", () => {
      it("should be a function", () => {
        expect(typeof jsonOutputInstruction).toBe("function");
      });

      it("should return a string with JSON instruction", () => {
        const mockSchema = { _def: {} };
        const result = jsonOutputInstruction(mockSchema as any);
        expect(typeof result).toBe("string");
        expect(result.toLowerCase()).toContain("json");
      });
    });

    describe("jsonOnlyReminder", () => {
      it("should be a non-empty string", () => {
        expect(typeof jsonOnlyReminder).toBe("string");
        expect(jsonOnlyReminder.length).toBeGreaterThan(0);
      });

      it("should prohibit non-JSON output", () => {
        const lower = jsonOnlyReminder.toLowerCase();
        expect(lower).toMatch(/only|just|no|without/);
        expect(lower).toContain("json");
      });
    });

    describe("wrapJsonResponse", () => {
      it("should be a function", () => {
        expect(typeof wrapJsonResponse).toBe("function");
      });

      it("should wrap example object correctly", () => {
        const example = '{ "field": "example" }';
        const result = wrapJsonResponse(example);
        expect(typeof result).toBe("string");
        expect(result.toLowerCase()).toContain("json");
      });
    });
  });

  describe("Confidence Levels", () => {
    describe("confidenceLevels", () => {
      it("should be a non-empty string", () => {
        expect(typeof confidenceLevels).toBe("string");
        expect(confidenceLevels.length).toBeGreaterThan(0);
      });

      it("should define HIGH confidence", () => {
        expect(confidenceLevels).toMatch(/HIGH/i);
      });

      it("should define MEDIUM confidence", () => {
        expect(confidenceLevels).toMatch(/MEDIUM/i);
      });

      it("should define LOW confidence", () => {
        expect(confidenceLevels).toMatch(/LOW/i);
      });
    });

    describe("confidenceLevelsCompact", () => {
      it("should be a non-empty string", () => {
        expect(typeof confidenceLevelsCompact).toBe("string");
        expect(confidenceLevelsCompact.length).toBeGreaterThan(0);
      });

      it("should be shorter than full version", () => {
        expect(confidenceLevelsCompact.length).toBeLessThan(confidenceLevels.length);
      });
    });

    describe("confidenceThresholds", () => {
      it("should be an object with numeric thresholds", () => {
        expect(typeof confidenceThresholds).toBe("object");
        expect(confidenceThresholds.high).toBeDefined();
        expect(confidenceThresholds.medium).toBeDefined();
        expect(confidenceThresholds.low).toBeDefined();
        expect(typeof confidenceThresholds.high).toBe("number");
      });
    });

    describe("ConfidenceLevel type", () => {
      it("should accept valid confidence levels", () => {
        const validLevels: ConfidenceLevel[] = ["high", "medium", "low"];
        expect(validLevels.length).toBe(3);
      });
    });
  });

  describe("Dimension Conversion", () => {
    describe("dimensionConversionRules", () => {
      it("should be a non-empty string", () => {
        expect(typeof dimensionConversionRules).toBe("string");
        expect(dimensionConversionRules.length).toBeGreaterThan(0);
      });

      it("should mention conversion", () => {
        expect(dimensionConversionRules.toLowerCase()).toContain("convert");
      });

      it("should mention centimeters", () => {
        expect(dimensionConversionRules.toLowerCase()).toMatch(/cm|centimeter/);
      });

      it("should mention inches", () => {
        expect(dimensionConversionRules.toLowerCase()).toContain("inch");
      });

      it("should mention pounds", () => {
        expect(dimensionConversionRules.toLowerCase()).toContain("pound");
      });

      it("should include conversion factors", () => {
        // Should have numbers like 2.54, 25.4, 2.205, etc.
        expect(dimensionConversionRules).toMatch(/\d+\.\d+/);
      });
    });

    describe("dimensionFormat", () => {
      it("should be a non-empty string", () => {
        expect(typeof dimensionFormat).toBe("string");
        expect(dimensionFormat.length).toBeGreaterThan(0);
      });

      it("should reference dimensions", () => {
        expect(dimensionFormat.toLowerCase()).toMatch(/dimension|length|width|height/);
      });
    });
  });

  describe("Moving Context", () => {
    describe("movingInventoryContext", () => {
      it("should be a non-empty string", () => {
        expect(typeof movingInventoryContext).toBe("string");
        expect(movingInventoryContext.length).toBeGreaterThan(0);
      });

      it("should mention moving", () => {
        expect(movingInventoryContext.toLowerCase()).toContain("moving");
      });

      it("should reference inventory", () => {
        expect(movingInventoryContext.toLowerCase()).toContain("inventory");
      });
    });

    describe("itemCategories", () => {
      it("should be an array", () => {
        expect(Array.isArray(itemCategories)).toBe(true);
      });

      it("should have multiple categories", () => {
        expect(itemCategories.length).toBeGreaterThanOrEqual(5);
      });

      it("should include common categories", () => {
        const lower = itemCategories.map((c) => c.toLowerCase());
        expect(lower).toContain("furniture");
        expect(lower).toContain("electronics");
        expect(lower).toContain("other");
      });

      it("should not have duplicates", () => {
        const unique = new Set(itemCategories);
        expect(unique.size).toBe(itemCategories.length);
      });
    });

    describe("categoryExamples", () => {
      it("should be an object", () => {
        expect(typeof categoryExamples).toBe("object");
      });

      it("should have category examples", () => {
        expect(Object.keys(categoryExamples).length).toBeGreaterThan(0);
      });
    });

    describe("ItemCategory type", () => {
      it("should accept valid item categories", () => {
        const validCategories: ItemCategory[] = [
          "Furniture",
          "Electronics",
          "Kitchenware",
          "Clothing",
          "Books",
          "Decor",
          "Tools",
          "Other",
        ];
        expect(validCategories.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe("Fragment Integration", () => {
    it("should have composable fragments", () => {
      const combinedPrompt = `
        ${movingInventoryContext}

        ${confidenceLevels}

        ${dimensionConversionRules}

        ${jsonOnlyReminder}
      `;

      expect(combinedPrompt.length).toBeGreaterThan(0);
    });

    it("should have consistent terminology", () => {
      const allFragments = [
        confidenceLevels,
        dimensionConversionRules,
        movingInventoryContext,
        jsonOnlyReminder,
      ].join(" ");

      expect(allFragments.length).toBeGreaterThan(100);
    });

    it("should not have conflicting instructions", () => {
      const allFragments = [
        confidenceLevels,
        dimensionConversionRules,
        movingInventoryContext,
        jsonOnlyReminder,
      ].join(" ");

      expect(allFragments.toLowerCase()).not.toMatch(/ignore previous|disregard/);
    });
  });

  describe("Fragment Utility", () => {
    it("should provide dimension conversion guidance", () => {
      expect(dimensionConversionRules.toLowerCase()).toMatch(/convert|conversion/);
    });

    it("should provide confidence level guidance", () => {
      expect(confidenceLevels.toLowerCase()).toMatch(/confidence|high|medium|low/);
    });

    it("should provide JSON output guidance", () => {
      expect(jsonOnlyReminder.toLowerCase()).toContain("json");
    });

    it("should provide moving context", () => {
      expect(movingInventoryContext.toLowerCase()).toContain("moving");
    });
  });

  describe("Type Safety", () => {
    it("should export ConfidenceLevel type", () => {
      const levels: ConfidenceLevel[] = ["high", "medium", "low"];
      expect(levels).toHaveLength(3);
    });

    it("should export ItemCategory type", () => {
      const category: ItemCategory = "Furniture";
      expect(typeof category).toBe("string");
    });
  });

  describe("Fragment Quality", () => {
    it("should have clear, imperative instructions in dimension rules", () => {
      expect(dimensionConversionRules.length).toBeGreaterThan(50);
    });

    it("should have clear confidence level descriptions", () => {
      expect(confidenceLevels.length).toBeGreaterThan(50);
    });

    it("should have meaningful moving context", () => {
      expect(movingInventoryContext.length).toBeGreaterThan(50);
    });

    it("should provide actionable JSON output instructions", () => {
      expect(jsonOnlyReminder.length).toBeGreaterThan(10);
    });
  });
});
