import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the AI SDK before any imports
vi.mock("ai", () => ({
  generateObject: vi.fn(),
  createGateway: vi.fn(() => vi.fn((model: string) => ({ modelId: model }))),
}));

// Mock langfuse
vi.mock("@langfuse/tracing", () => ({
  getActiveTraceId: vi.fn(() => "test-trace-id"),
}));

// Import after mocking
import { generateObject } from "ai";
import {
  identifyProductFromPhotoV2,
  identifyProductFromPhotoV2Compat,
} from "./identify-from-photo-v2";

const mockGenerateObject = vi.mocked(generateObject);

/**
 * Creates a minimal mock response that satisfies the generateObject return type.
 */
function createMockResponse(object: ReturnType<typeof createValidResponse>) {
  return {
    object,
  } as Awaited<ReturnType<typeof generateObject>>;
}

/**
 * Creates a valid strategic identification response for testing.
 */
function createValidResponse() {
  return {
    itemType: "Coffee Table",
    category: "Furniture",
    distinctiveFeatures: ["Wood top", "Metal legs"],
    styleFamily: "Modern",
    visualEstimates: {
      dimensions: { length: 48, width: 24, height: 18 },
      weight: 60,
      canDisassemble: false,
      notes: null,
    },
    strategy: {
      approach: "use_estimates",
      confidence: 0.7,
      reasoning: "Generic item",
      questions: [],
    },
    immediateIdentification: null,
  };
}

describe("identifyProductFromPhotoV2", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("input validation", () => {
    it("throws error for empty imageUrl", async () => {
      await expect(identifyProductFromPhotoV2("")).rejects.toThrow(
        "Invalid image URL provided"
      );
    });

    it("throws error for null-like imageUrl", async () => {
      // @ts-expect-error testing invalid input
      await expect(identifyProductFromPhotoV2(null)).rejects.toThrow(
        "Invalid image URL provided"
      );
    });

    it("throws error for non-string imageUrl", async () => {
      // @ts-expect-error testing invalid input
      await expect(identifyProductFromPhotoV2(123)).rejects.toThrow(
        "Invalid image URL provided"
      );
    });

    it("throws error for invalid URL format", async () => {
      await expect(identifyProductFromPhotoV2("not-a-url")).rejects.toThrow(
        "Image URL must be a data URI or HTTP(S) URL"
      );
    });

    it("throws error for file:// URLs", async () => {
      await expect(
        identifyProductFromPhotoV2("file:///path/to/image.jpg")
      ).rejects.toThrow("Image URL must be a data URI or HTTP(S) URL");
    });

    it("accepts valid http URL", async () => {
      mockGenerateObject.mockResolvedValueOnce(
        createMockResponse(createValidResponse())
      );

      const result = await identifyProductFromPhotoV2(
        "http://example.com/image.jpg"
      );
      expect(result.estimates.itemType).toBe("Coffee Table");
    });

    it("accepts valid https URL", async () => {
      mockGenerateObject.mockResolvedValueOnce(
        createMockResponse(createValidResponse())
      );

      const result = await identifyProductFromPhotoV2(
        "https://example.com/image.jpg"
      );
      expect(result.estimates.itemType).toBe("Coffee Table");
    });

    it("accepts valid data URI", async () => {
      mockGenerateObject.mockResolvedValueOnce(
        createMockResponse(createValidResponse())
      );

      const result = await identifyProductFromPhotoV2(
        "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      );
      expect(result.estimates.itemType).toBe("Coffee Table");
    });
  });

  describe("error classification", () => {
    it("classifies rate limit errors", async () => {
      mockGenerateObject.mockRejectedValueOnce(new Error("rate limit exceeded"));

      await expect(
        identifyProductFromPhotoV2("https://example.com/image.jpg")
      ).rejects.toThrow(
        "AI service is temporarily busy. Please wait a moment and try again."
      );
    });

    it("classifies too many requests errors", async () => {
      mockGenerateObject.mockRejectedValueOnce(new Error("too many requests"));

      await expect(
        identifyProductFromPhotoV2("https://example.com/image.jpg")
      ).rejects.toThrow(
        "AI service is temporarily busy. Please wait a moment and try again."
      );
    });

    it("classifies quota exceeded errors", async () => {
      mockGenerateObject.mockRejectedValueOnce(
        new Error("insufficient_quota")
      );

      await expect(
        identifyProductFromPhotoV2("https://example.com/image.jpg")
      ).rejects.toThrow(
        "AI service is temporarily busy. Please wait a moment and try again."
      );
    });

    it("classifies invalid image errors", async () => {
      mockGenerateObject.mockRejectedValueOnce(
        new Error("invalid image format")
      );

      await expect(
        identifyProductFromPhotoV2("https://example.com/image.jpg")
      ).rejects.toThrow(
        "Image appears to be invalid or corrupted. Please try a different photo."
      );
    });

    it("classifies corrupt image errors", async () => {
      mockGenerateObject.mockRejectedValueOnce(new Error("corrupt file data"));

      await expect(
        identifyProductFromPhotoV2("https://example.com/image.jpg")
      ).rejects.toThrow(
        "Image appears to be invalid or corrupted. Please try a different photo."
      );
    });

    it("classifies network/timeout errors", async () => {
      mockGenerateObject.mockRejectedValueOnce(new Error("network timeout"));

      await expect(
        identifyProductFromPhotoV2("https://example.com/image.jpg")
      ).rejects.toThrow(
        "Network error while analyzing photo. Please check your connection and try again."
      );
    });

    it("classifies fetch errors", async () => {
      mockGenerateObject.mockRejectedValueOnce(new Error("fetch failed"));

      await expect(
        identifyProductFromPhotoV2("https://example.com/image.jpg")
      ).rejects.toThrow(
        "Network error while analyzing photo. Please check your connection and try again."
      );
    });

    it("classifies unauthorized errors", async () => {
      mockGenerateObject.mockRejectedValueOnce(new Error("unauthorized"));

      await expect(
        identifyProductFromPhotoV2("https://example.com/image.jpg")
      ).rejects.toThrow("Service configuration error. Please contact support.");
    });

    it("classifies API key errors", async () => {
      mockGenerateObject.mockRejectedValueOnce(new Error("missing api key"));

      await expect(
        identifyProductFromPhotoV2("https://example.com/image.jpg")
      ).rejects.toThrow("Service configuration error. Please contact support.");
    });

    it("classifies schema validation errors", async () => {
      mockGenerateObject.mockRejectedValueOnce(
        new Error("json_schema validation failed")
      );

      await expect(
        identifyProductFromPhotoV2("https://example.com/image.jpg")
      ).rejects.toThrow("AI configuration error. Please contact support.");
    });

    it("provides generic error for unknown issues", async () => {
      mockGenerateObject.mockRejectedValueOnce(
        new Error("some unknown error")
      );

      await expect(
        identifyProductFromPhotoV2("https://example.com/image.jpg")
      ).rejects.toThrow(
        "Failed to analyze photo. Please try again or enter details manually."
      );
    });
  });

  describe("response validation", () => {
    // Note: Incomplete response errors are caught by the generic error handler
    // and transformed into user-friendly messages
    it("throws error for incomplete response (missing itemType)", async () => {
      const invalidResponse = createValidResponse();
      // @ts-expect-error testing invalid response
      invalidResponse.itemType = undefined;

      mockGenerateObject.mockResolvedValueOnce(
        createMockResponse(invalidResponse)
      );

      await expect(
        identifyProductFromPhotoV2("https://example.com/image.jpg")
      ).rejects.toThrow(
        "Failed to analyze photo. Please try again or enter details manually."
      );
    });

    it("throws error for incomplete response (missing category)", async () => {
      const invalidResponse = createValidResponse();
      // @ts-expect-error testing invalid response
      invalidResponse.category = undefined;

      mockGenerateObject.mockResolvedValueOnce(
        createMockResponse(invalidResponse)
      );

      await expect(
        identifyProductFromPhotoV2("https://example.com/image.jpg")
      ).rejects.toThrow(
        "Failed to analyze photo. Please try again or enter details manually."
      );
    });

    it("throws error for incomplete response (missing strategy)", async () => {
      const invalidResponse = createValidResponse();
      // @ts-expect-error testing invalid response
      invalidResponse.strategy = undefined;

      mockGenerateObject.mockResolvedValueOnce(
        createMockResponse(invalidResponse)
      );

      await expect(
        identifyProductFromPhotoV2("https://example.com/image.jpg")
      ).rejects.toThrow(
        "Failed to analyze photo. Please try again or enter details manually."
      );
    });
  });

  describe("successful response transformation", () => {
    it("transforms response with immediate identification", async () => {
      const responseWithId = createValidResponse();
      responseWithId.immediateIdentification = {
        productName: "Coffee Table",
        fullProductName: "IKEA LACK Coffee Table",
        confidence: "high",
      };

      mockGenerateObject.mockResolvedValueOnce(
        createMockResponse(responseWithId)
      );

      const result = await identifyProductFromPhotoV2(
        "https://example.com/image.jpg"
      );

      expect(result.identified).toBeDefined();
      expect(result.identified!.productName).toBe("Coffee Table");
      expect(result.identified!.fullProductName).toBe("IKEA LACK Coffee Table");
      expect(result.identified!.confidence).toBe("high");
      expect(result.questions).toBeUndefined();
    });

    it("transforms response with questions (no immediate ID)", async () => {
      const responseWithQuestions = createValidResponse();
      responseWithQuestions.strategy.questions = [
        {
          question: "Where did you purchase this?",
          rationale: "Retailer search",
          inputType: "select",
          options: ["IKEA", "Wayfair"],
          placeholder: null,
        },
      ];

      mockGenerateObject.mockResolvedValueOnce(
        createMockResponse(responseWithQuestions)
      );

      const result = await identifyProductFromPhotoV2(
        "https://example.com/image.jpg"
      );

      expect(result.identified).toBeUndefined();
      expect(result.questions).toBeDefined();
      expect(result.questions!.length).toBe(1);
      expect(result.questions![0].question).toBe("Where did you purchase this?");
    });

    it("hides questions when immediate ID exists", async () => {
      const response = createValidResponse();
      response.immediateIdentification = {
        productName: "Sofa",
        fullProductName: "West Elm Sofa",
        confidence: "medium",
      };
      response.strategy.questions = [
        {
          question: "Ignored question",
          rationale: "Should be ignored",
          inputType: "text",
          options: null,
          placeholder: null,
        },
      ];

      mockGenerateObject.mockResolvedValueOnce(createMockResponse(response));

      const result = await identifyProductFromPhotoV2(
        "https://example.com/image.jpg"
      );

      expect(result.identified).toBeDefined();
      expect(result.questions).toBeUndefined();
    });

    it("includes estimates in all responses", async () => {
      mockGenerateObject.mockResolvedValueOnce(
        createMockResponse(createValidResponse())
      );

      const result = await identifyProductFromPhotoV2(
        "https://example.com/image.jpg"
      );

      expect(result.estimates).toBeDefined();
      expect(result.estimates.itemType).toBe("Coffee Table");
      expect(result.estimates.category).toBe("Furniture");
      expect(result.estimates.dimensions.length).toBe(48);
      expect(result.estimates.weight).toBe(60);
    });

    it("includes description in estimates from visual info", async () => {
      mockGenerateObject.mockResolvedValueOnce(
        createMockResponse(createValidResponse())
      );

      const result = await identifyProductFromPhotoV2(
        "https://example.com/image.jpg"
      );

      // Should include styleFamily and distinctiveFeatures
      expect(result.estimates.description).toBe(
        "Coffee Table. Modern. Wood top, Metal legs."
      );
    });

    it("includes notes in description when present", async () => {
      const responseWithNotes = createValidResponse();
      responseWithNotes.visualEstimates.notes = "Some wear visible on surface";

      mockGenerateObject.mockResolvedValueOnce(
        createMockResponse(responseWithNotes)
      );

      const result = await identifyProductFromPhotoV2(
        "https://example.com/image.jpg"
      );

      expect(result.estimates.description).toBe(
        "Coffee Table. Modern. Wood top, Metal legs. Some wear visible on surface."
      );
    });

    it("uses only itemType when no visual info available", async () => {
      const minimalResponse = createValidResponse();
      minimalResponse.styleFamily = null;
      minimalResponse.distinctiveFeatures = [];
      minimalResponse.visualEstimates.notes = null;

      mockGenerateObject.mockResolvedValueOnce(
        createMockResponse(minimalResponse)
      );

      const result = await identifyProductFromPhotoV2(
        "https://example.com/image.jpg"
      );

      expect(result.estimates.description).toBe("Coffee Table");
    });

    it("includes features and strategy in response", async () => {
      mockGenerateObject.mockResolvedValueOnce(
        createMockResponse(createValidResponse())
      );

      const result = await identifyProductFromPhotoV2(
        "https://example.com/image.jpg"
      );

      expect(result.features).toEqual(["Wood top", "Metal legs"]);
      expect(result.strategy.approach).toBe("use_estimates");
      expect(result.strategy.confidence).toBe(0.7);
    });

    it("includes trace ID when available", async () => {
      mockGenerateObject.mockResolvedValueOnce(
        createMockResponse(createValidResponse())
      );

      const result = await identifyProductFromPhotoV2(
        "https://example.com/image.jpg"
      );

      expect(result.traceId).toBe("test-trace-id");
    });
  });
});

describe("identifyProductFromPhotoV2Compat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns fullProductName for high confidence identification", async () => {
    const response = createValidResponse();
    response.immediateIdentification = {
      productName: "Coffee Table",
      fullProductName: "IKEA LACK Coffee Table, white",
      confidence: "high",
    };

    mockGenerateObject.mockResolvedValueOnce(createMockResponse(response));

    const result = await identifyProductFromPhotoV2Compat(
      "https://example.com/image.jpg"
    );

    expect(result).toBe("IKEA LACK Coffee Table, white");
  });

  it("returns clarification request for questions", async () => {
    const response = createValidResponse();
    response.strategy.questions = [
      {
        question: "Where did you buy this?",
        rationale: "Retailer search",
        inputType: "select",
        options: ["IKEA", "Wayfair"],
        placeholder: null,
      },
      {
        question: "What's the price range?",
        rationale: "Narrow options",
        inputType: "select",
        options: ["Under $100", "$100-$300"],
        placeholder: null,
      },
    ];

    mockGenerateObject.mockResolvedValueOnce(createMockResponse(response));

    const result = await identifyProductFromPhotoV2Compat(
      "https://example.com/image.jpg"
    );

    expect(typeof result).toBe("object");
    expect(
      (result as { needsClarification: true; questions: string[] })
        .needsClarification
    ).toBe(true);
    expect(
      (result as { needsClarification: true; questions: string[] }).questions
    ).toEqual(["Where did you buy this?", "What's the price range?"]);
  });

  it("returns fullProductName for medium confidence (no questions)", async () => {
    const response = createValidResponse();
    response.immediateIdentification = {
      productName: "Sofa",
      fullProductName: "Gray Sectional Sofa",
      confidence: "medium",
    };

    mockGenerateObject.mockResolvedValueOnce(createMockResponse(response));

    const result = await identifyProductFromPhotoV2Compat(
      "https://example.com/image.jpg"
    );

    expect(result).toBe("Gray Sectional Sofa");
  });

  it("returns itemType with category as fallback", async () => {
    mockGenerateObject.mockResolvedValueOnce(
      createMockResponse(createValidResponse())
    );

    const result = await identifyProductFromPhotoV2Compat(
      "https://example.com/image.jpg"
    );

    expect(result).toBe("Coffee Table (Furniture)");
  });
});
