import { describe, it, expect } from "vitest";
import {
  buildUrlPrompt,
  buildSearchPrompt,
  buildResearchPrompt,
  getResearchPromptBuilder,
  productInfoSchema,
  URL_META,
  SEARCH_META,
} from "./index";
import type { UrlResearchContext, SearchResearchContext } from "./types";

describe("Product Research Prompts", () => {
  describe("buildUrlPrompt", () => {
    const mockContext: UrlResearchContext = {
      url: "https://ikea.com/us/en/p/kallax-shelf-unit-white-80275887/",
    };

    it("should return a string prompt", () => {
      const prompt = buildUrlPrompt(mockContext);
      expect(typeof prompt).toBe("string");
    });

    it("should include the URL in the prompt", () => {
      const prompt = buildUrlPrompt(mockContext);
      expect(prompt).toContain(mockContext.url);
    });

    it("should mention fetching from the URL", () => {
      const prompt = buildUrlPrompt(mockContext);
      expect(prompt.toLowerCase()).toMatch(/fetch|url|page|site|web/);
    });

    it("should include dimension conversion instructions", () => {
      const prompt = buildUrlPrompt(mockContext);
      expect(prompt).toContain("DIMENSION AND WEIGHT");
    });

    it("should mention JSON output format", () => {
      const prompt = buildUrlPrompt(mockContext);
      expect(prompt).toContain("JSON");
    });

    it("should handle different URL formats", () => {
      const contexts = [
        { url: "https://amazon.com/dp/B08X123ABC" },
        { url: "http://ikea.com/product" },
        { url: "https://wayfair.com/furniture/item" },
      ];

      contexts.forEach((ctx) => {
        const prompt = buildUrlPrompt(ctx);
        expect(typeof prompt).toBe("string");
        expect(prompt).toContain(ctx.url);
      });
    });
  });

  describe("buildSearchPrompt", () => {
    const mockContext: SearchResearchContext = {
      productName: "IKEA KALLAX Shelf Unit White",
    };

    it("should return a string prompt", () => {
      const prompt = buildSearchPrompt(mockContext);
      expect(typeof prompt).toBe("string");
    });

    it("should include the product name in the prompt", () => {
      const prompt = buildSearchPrompt(mockContext);
      expect(prompt).toContain(mockContext.productName);
    });

    it("should mention web search", () => {
      const prompt = buildSearchPrompt(mockContext);
      expect(prompt.toLowerCase()).toMatch(/search|find|look up|query/);
    });

    it("should include dimension conversion instructions", () => {
      const prompt = buildSearchPrompt(mockContext);
      expect(prompt).toContain("DIMENSION AND WEIGHT");
    });

    it("should handle product names with special characters", () => {
      const contexts = [
        { productName: "Chair & Table Set" },
        { productName: "Sofa (3-Seater)" },
        { productName: "Shelf Unit - 77x147 cm" },
      ];

      contexts.forEach((ctx) => {
        const prompt = buildSearchPrompt(ctx);
        expect(typeof prompt).toBe("string");
        expect(prompt).toContain(ctx.productName);
      });
    });

    it("should be different from URL prompt", () => {
      const urlPrompt = buildUrlPrompt({ url: "https://example.com" });
      const searchPrompt = buildSearchPrompt(mockContext);
      expect(searchPrompt).not.toBe(urlPrompt);
    });
  });

  describe("buildResearchPrompt (convenience function)", () => {
    it("should use URL prompt builder when isUrl is true", () => {
      const url = "https://ikea.com/product";
      const prompt = buildResearchPrompt(url, true);
      const directPrompt = buildUrlPrompt({ url });
      expect(prompt).toBe(directPrompt);
    });

    it("should use search prompt builder when isUrl is false", () => {
      const productName = "IKEA KALLAX";
      const prompt = buildResearchPrompt(productName, false);
      const directPrompt = buildSearchPrompt({ productName });
      expect(prompt).toBe(directPrompt);
    });

    it("should produce different prompts for URL vs search", () => {
      const input = "https://ikea.com/product";
      const urlPrompt = buildResearchPrompt(input, true);
      const searchPrompt = buildResearchPrompt(input, false);
      expect(urlPrompt).not.toBe(searchPrompt);
    });
  });

  describe("getResearchPromptBuilder", () => {
    it("should return URL builder for url mode", () => {
      const builder = getResearchPromptBuilder("url");
      expect(builder).toBe(buildUrlPrompt);
    });

    it("should return search builder for search mode", () => {
      const builder = getResearchPromptBuilder("search");
      expect(builder).toBe(buildSearchPrompt);
    });

    it("should return working builder functions", () => {
      const urlBuilder = getResearchPromptBuilder("url");
      const urlPrompt = urlBuilder({ url: "https://example.com" });
      expect(typeof urlPrompt).toBe("string");

      const searchBuilder = getResearchPromptBuilder("search");
      const searchPrompt = searchBuilder({ productName: "Test Product" });
      expect(typeof searchPrompt).toBe("string");
    });
  });

  describe("Prompt Metadata", () => {
    describe("URL_META", () => {
      it("should have required metadata fields", () => {
        expect(URL_META.id).toBe("product-research-url");
        expect(URL_META.version).toBeDefined();
        expect(URL_META.model).toBe("perplexity/sonar-pro");
        expect(URL_META.maxTokens).toBe(1000);
        expect(URL_META.description).toBeDefined();
        expect(Array.isArray(URL_META.changelog)).toBe(true);
      });

      it("should have at least one changelog entry", () => {
        expect(URL_META.changelog.length).toBeGreaterThan(0);
        const firstEntry = URL_META.changelog[0];
        expect(firstEntry.version).toBeDefined();
        expect(firstEntry.date).toBeDefined();
        expect(firstEntry.change).toBeDefined();
      });
    });

    describe("SEARCH_META", () => {
      it("should have required metadata fields", () => {
        expect(SEARCH_META.id).toBe("product-research-search");
        expect(SEARCH_META.version).toBeDefined();
        expect(SEARCH_META.model).toBe("perplexity/sonar-pro");
        expect(SEARCH_META.maxTokens).toBe(1000);
        expect(SEARCH_META.description).toBeDefined();
        expect(Array.isArray(SEARCH_META.changelog)).toBe(true);
      });
    });

    it("should have consistent model configuration", () => {
      expect(URL_META.model).toBe(SEARCH_META.model);
      expect(URL_META.maxTokens).toBe(SEARCH_META.maxTokens);
    });
  });

  describe("productInfoSchema", () => {
    it("should validate complete product info", () => {
      const validProduct = {
        name: "Shelf Unit",
        fullProductName: "IKEA KALLAX Shelf Unit White",
        dimensions: {
          length: 77,
          width: 39,
          height: 147,
        },
        weight: 35.5,
        description: "4x4 cube organizer for storage",
        category: "Furniture" as const,
        canDisassemble: true,
      };

      const result = productInfoSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it("should accept null values for optional fields", () => {
      const minimalProduct = {
        name: "Chair",
        fullProductName: "Dining Chair",
        dimensions: {
          length: null,
          width: null,
          height: null,
        },
        weight: null,
        description: null,
        category: null,
        canDisassemble: null,
      };

      const result = productInfoSchema.safeParse(minimalProduct);
      expect(result.success).toBe(true);
    });

    it("should reject invalid category values", () => {
      const invalidProduct = {
        name: "Item",
        fullProductName: "Test Item",
        dimensions: { length: null, width: null, height: null },
        weight: null,
        description: null,
        category: "InvalidCategory",
        canDisassemble: null,
      };

      const result = productInfoSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });

    it("should validate all allowed categories", () => {
      const categories = [
        "Furniture",
        "Electronics",
        "Kitchenware",
        "Clothing",
        "Books",
        "Decor",
        "Tools",
        "Other",
      ] as const;

      categories.forEach((category) => {
        const product = {
          name: "Test",
          fullProductName: "Test Product",
          dimensions: { length: null, width: null, height: null },
          weight: null,
          description: null,
          category,
          canDisassemble: null,
        };

        const result = productInfoSchema.safeParse(product);
        expect(result.success).toBe(true);
      });
    });

    it("should reject missing required fields", () => {
      const incompleteProduct = {
        name: "Item",
      };

      const result = productInfoSchema.safeParse(incompleteProduct);
      expect(result.success).toBe(false);
    });

    it("should validate dimension object structure", () => {
      const productWithDimensions = {
        name: "Box",
        fullProductName: "Storage Box",
        dimensions: {
          length: 50,
          width: 40,
          height: 30,
        },
        weight: null,
        description: null,
        category: null,
        canDisassemble: null,
      };

      const result = productInfoSchema.safeParse(productWithDimensions);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dimensions.length).toBe(50);
        expect(result.data.dimensions.width).toBe(40);
        expect(result.data.dimensions.height).toBe(30);
      }
    });

    it("should allow boolean values for canDisassemble", () => {
      const products = [
        { canDisassemble: true },
        { canDisassemble: false },
        { canDisassemble: null },
      ];

      products.forEach((partial) => {
        const product = {
          name: "Item",
          fullProductName: "Test Item",
          dimensions: { length: null, width: null, height: null },
          weight: null,
          description: null,
          category: null,
          ...partial,
        };

        const result = productInfoSchema.safeParse(product);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Prompt Content Quality", () => {
    it("should include moving-specific context", () => {
      const urlPrompt = buildUrlPrompt({ url: "https://example.com" });
      const searchPrompt = buildSearchPrompt({ productName: "Test" });

      // Check for moving-related terminology
      [urlPrompt, searchPrompt].forEach((prompt) => {
        const lowerPrompt = prompt.toLowerCase();
        expect(
          lowerPrompt.includes("moving") ||
          lowerPrompt.includes("pack") ||
          lowerPrompt.includes("disassemble") ||
          lowerPrompt.includes("transport")
        ).toBe(true);
      });
    });

    it("should request dimension data", () => {
      const urlPrompt = buildUrlPrompt({ url: "https://example.com" });
      const searchPrompt = buildSearchPrompt({ productName: "Test" });

      [urlPrompt, searchPrompt].forEach((prompt) => {
        const lowerPrompt = prompt.toLowerCase();
        expect(
          lowerPrompt.includes("dimension") ||
          lowerPrompt.includes("size") ||
          lowerPrompt.includes("measurement")
        ).toBe(true);
      });
    });

    it("should request weight information", () => {
      const urlPrompt = buildUrlPrompt({ url: "https://example.com" });
      const searchPrompt = buildSearchPrompt({ productName: "Test" });

      [urlPrompt, searchPrompt].forEach((prompt) => {
        expect(prompt.toLowerCase()).toContain("weight");
      });
    });
  });
});
