import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Store original env
const originalEnv = process.env;

describe("logger module", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("logger exports", () => {
    it("exports base logger", async () => {
      const { logger } = await import("./logger");
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.error).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.debug).toBe("function");
    });

    it("exports aiLogger child logger", async () => {
      const { aiLogger } = await import("./logger");
      expect(aiLogger).toBeDefined();
      expect(typeof aiLogger.info).toBe("function");
    });

    it("exports authLogger child logger", async () => {
      const { authLogger } = await import("./logger");
      expect(authLogger).toBeDefined();
      expect(typeof authLogger.info).toBe("function");
    });

    it("exports dbLogger child logger", async () => {
      const { dbLogger } = await import("./logger");
      expect(dbLogger).toBeDefined();
      expect(typeof dbLogger.info).toBe("function");
    });

    it("exports telemetryLogger child logger", async () => {
      const { telemetryLogger } = await import("./logger");
      expect(telemetryLogger).toBeDefined();
      expect(typeof telemetryLogger.info).toBe("function");
    });
  });

  describe("log level configuration", () => {
    it("respects LOG_LEVEL env var", async () => {
      process.env.LOG_LEVEL = "warn";
      process.env.NODE_ENV = "production";

      const { logger } = await import("./logger");
      expect(logger.level).toBe("warn");
    });

    it("defaults to info in production without LOG_LEVEL", async () => {
      delete process.env.LOG_LEVEL;
      process.env.NODE_ENV = "production";

      const { logger } = await import("./logger");
      expect(logger.level).toBe("info");
    });

    it("defaults to debug in development without LOG_LEVEL", async () => {
      delete process.env.LOG_LEVEL;
      process.env.NODE_ENV = "development";

      const { logger } = await import("./logger");
      expect(logger.level).toBe("debug");
    });
  });

  describe("child logger bindings", () => {
    it("aiLogger has module: ai binding", async () => {
      const { aiLogger } = await import("./logger");
      // Access bindings via the internal structure
      expect(aiLogger.bindings()).toEqual({ module: "ai" });
    });

    it("authLogger has module: auth binding", async () => {
      const { authLogger } = await import("./logger");
      expect(authLogger.bindings()).toEqual({ module: "auth" });
    });

    it("dbLogger has module: db binding", async () => {
      const { dbLogger } = await import("./logger");
      expect(dbLogger.bindings()).toEqual({ module: "db" });
    });

    it("telemetryLogger has module: telemetry binding", async () => {
      const { telemetryLogger } = await import("./logger");
      expect(telemetryLogger.bindings()).toEqual({ module: "telemetry" });
    });
  });
});
