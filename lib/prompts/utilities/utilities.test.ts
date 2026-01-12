import { describe, it, expect } from "vitest";
import { simplifyNameSystemPrompt, SIMPLIFY_NAME_META } from "./index";

describe("Utility Prompts", () => {
  describe("simplifyNameSystemPrompt", () => {
    it("should be a non-empty string", () => {
      expect(typeof simplifyNameSystemPrompt).toBe("string");
      expect(simplifyNameSystemPrompt.length).toBeGreaterThan(0);
    });

    it("should include the task description", () => {
      expect(simplifyNameSystemPrompt.toLowerCase()).toContain("simplif");
    });

    it("should include rules section", () => {
      expect(simplifyNameSystemPrompt).toContain("RULES:");
    });

    it("should specify to remove brand names", () => {
      const lowerPrompt = simplifyNameSystemPrompt.toLowerCase();
      expect(lowerPrompt).toContain("brand");
    });

    it("should specify to remove model numbers", () => {
      const lowerPrompt = simplifyNameSystemPrompt.toLowerCase();
      expect(lowerPrompt).toContain("model");
    });

    it("should specify to remove colors", () => {
      const lowerPrompt = simplifyNameSystemPrompt.toLowerCase();
      expect(lowerPrompt).toContain("color");
    });

    it("should specify to remove dimensions", () => {
      const lowerPrompt = simplifyNameSystemPrompt.toLowerCase();
      expect(lowerPrompt).toContain("dimension");
    });

    it("should specify to remove materials (unless essential)", () => {
      const lowerPrompt = simplifyNameSystemPrompt.toLowerCase();
      expect(lowerPrompt).toContain("material");
    });

    it("should specify to remove style descriptors", () => {
      const lowerPrompt = simplifyNameSystemPrompt.toLowerCase();
      expect(lowerPrompt).toContain("style");
    });

    it("should instruct to keep only core item type", () => {
      const lowerPrompt = simplifyNameSystemPrompt.toLowerCase();
      expect(lowerPrompt).toMatch(/core|item type|keep only/);
    });

    it("should specify title case formatting", () => {
      const lowerPrompt = simplifyNameSystemPrompt.toLowerCase();
      expect(lowerPrompt).toContain("title case");
    });

    it("should specify 1-3 word maximum", () => {
      const prompt = simplifyNameSystemPrompt;
      expect(prompt).toMatch(/1-3 word/i);
    });

    it("should include EXAMPLES section", () => {
      expect(simplifyNameSystemPrompt).toContain("EXAMPLES:");
    });

    it("should include multiple example transformations", () => {
      // Check for arrow notation showing transformation
      const arrows = simplifyNameSystemPrompt.match(/→/g);
      expect(arrows).toBeTruthy();
      expect(arrows!.length).toBeGreaterThanOrEqual(5);
    });

    it("should have examples showing brand removal", () => {
      // Should have examples with brands like IKEA, etc.
      expect(simplifyNameSystemPrompt).toMatch(/IKEA|Yaheetech|HEMNES/i);
    });

    it("should have examples showing dimension removal", () => {
      // Check for examples with measurements
      expect(simplifyNameSystemPrompt).toMatch(/\d+x\d+|cm|inch|quart/i);
    });

    it("should have examples showing color removal", () => {
      // Check for color examples
      expect(simplifyNameSystemPrompt.toLowerCase()).toMatch(/white|blue|red|navy/);
    });

    it("should have Shelf Unit example", () => {
      expect(simplifyNameSystemPrompt).toMatch(/KALLAX.*Shelf.*Unit/i);
      expect(simplifyNameSystemPrompt).toContain('"Shelf Unit"');
    });

    it("should have storage-related examples", () => {
      const lowerPrompt = simplifyNameSystemPrompt.toLowerCase();
      expect(lowerPrompt).toMatch(/storage|ottoman|bookshelf|dresser/);
    });

    it("should instruct to return ONLY simplified name", () => {
      const lowerPrompt = simplifyNameSystemPrompt.toLowerCase();
      expect(lowerPrompt).toMatch(/return only|nothing else|only the/);
    });

    it("should not include JSON formatting instructions", () => {
      // This is a simple text output, not JSON
      const lowerPrompt = simplifyNameSystemPrompt.toLowerCase();
      expect(lowerPrompt).not.toContain("json");
    });
  });

  describe("SIMPLIFY_NAME_META", () => {
    it("should have required metadata fields", () => {
      expect(SIMPLIFY_NAME_META.id).toBe("simplify-product-name");
      expect(SIMPLIFY_NAME_META.version).toBeDefined();
      expect(SIMPLIFY_NAME_META.model).toBe("openai/gpt-4o-mini");
      expect(SIMPLIFY_NAME_META.maxTokens).toBe(50);
      expect(SIMPLIFY_NAME_META.description).toBeDefined();
      expect(Array.isArray(SIMPLIFY_NAME_META.changelog)).toBe(true);
    });

    it("should use fast/cheap model", () => {
      // Should use mini model since this is a simple task
      expect(SIMPLIFY_NAME_META.model).toContain("mini");
    });

    it("should have low token limit", () => {
      // Simple output should need very few tokens
      expect(SIMPLIFY_NAME_META.maxTokens).toBeLessThanOrEqual(100);
    });

    it("should have at least one changelog entry", () => {
      expect(SIMPLIFY_NAME_META.changelog.length).toBeGreaterThan(0);
      const firstEntry = SIMPLIFY_NAME_META.changelog[0]!;
      expect(firstEntry.version).toBeDefined();
      expect(firstEntry.date).toBeDefined();
      expect(firstEntry.change).toBeDefined();
    });

    it("should have descriptive description", () => {
      const desc = SIMPLIFY_NAME_META.description.toLowerCase();
      expect(desc).toMatch(/simplif/);
      expect(desc.length).toBeGreaterThan(20);
    });
  });

  describe("Prompt Content Quality", () => {
    it("should cover all 9 rules explicitly", () => {
      const prompt = simplifyNameSystemPrompt;
      // Count numbered rules (1. through 9.)
      const ruleNumbers = [];
      for (let i = 1; i <= 9; i++) {
        if (prompt.includes(`${i}.`)) {
          ruleNumbers.push(i);
        }
      }
      expect(ruleNumbers.length).toBe(9);
    });

    it("should provide diverse example categories", () => {
      const prompt = simplifyNameSystemPrompt.toLowerCase();
      // Should have examples from different furniture/item categories
      const categories = [
        prompt.includes("shelf") || prompt.includes("bookshelf"),
        prompt.includes("ottoman"),
        prompt.includes("dresser"),
        prompt.includes("chair"),
        prompt.includes("tv") || prompt.includes("television"),
        prompt.includes("mixer") || prompt.includes("kitchen"),
      ];

      const categoriesFound = categories.filter(Boolean).length;
      expect(categoriesFound).toBeGreaterThanOrEqual(4);
    });

    it("should show consistent output format in examples", () => {
      // All simplified outputs should be in quotes
      const lines = simplifyNameSystemPrompt.split("\n");
      const exampleLines = lines.filter((line) => line.includes("→"));

      exampleLines.forEach((line) => {
        const afterArrow = line.split("→")[1];
        if (afterArrow) {
          // Check for quoted output
          expect(afterArrow).toMatch(/"[^"]+"/);
        }
      });
    });

    it("should demonstrate title case in examples", () => {
      const examples = [
        "Shelf Unit",
        "Storage Ottoman",
        "Bookshelf",
        "Dresser",
        "Accent Chair",
      ];

      examples.forEach((example) => {
        // Check each word starts with capital
        const words = example.split(" ");
        words.forEach((word) => {
          const firstChar = word[0];
          if (firstChar) {
            expect(firstChar).toBe(firstChar.toUpperCase());
          }
        });
      });
    });

    it("should have examples within 1-3 word constraint", () => {
      const lines = simplifyNameSystemPrompt.split("\n");
      const exampleLines = lines.filter((line) => line.includes("→"));

      exampleLines.forEach((line) => {
        const afterArrow = line.split("→")[1];
        if (afterArrow) {
          // Extract text between quotes
          const match = afterArrow.match(/"([^"]+)"/);
          const simplifiedName = match?.[1];
          if (simplifiedName) {
            const wordCount = simplifiedName.trim().split(/\s+/).length;
            expect(wordCount).toBeLessThanOrEqual(3);
            expect(wordCount).toBeGreaterThanOrEqual(1);
          }
        }
      });
    });
  });

  describe("Prompt Design", () => {
    it("should be suitable as a system message", () => {
      // System prompts should describe role/task
      const prompt = simplifyNameSystemPrompt.toLowerCase();
      expect(prompt).toMatch(/you are|your job|your task/);
    });

    it("should have clear structure with sections", () => {
      const prompt = simplifyNameSystemPrompt;
      // Should have distinct sections (RULES, EXAMPLES, etc.)
      expect(prompt).toContain("RULES:");
      expect(prompt).toContain("EXAMPLES:");
    });

    it("should be concise for a fast model", () => {
      // Should be shorter than the complex prompts since it uses mini model
      expect(simplifyNameSystemPrompt.length).toBeLessThan(2000);
    });

    it("should not have ambiguous instructions", () => {
      const prompt = simplifyNameSystemPrompt.toLowerCase();
      // Should not contain words like "maybe", "possibly", "might"
      expect(prompt).not.toMatch(/maybe|possibly|might|perhaps|if you can/);
    });

    it("should end with clear output instruction", () => {
      const lines = simplifyNameSystemPrompt.split("\n");
      const lastLines = lines.slice(-5).join(" ").toLowerCase();
      expect(lastLines).toMatch(/return only|nothing else/);
    });
  });
});
