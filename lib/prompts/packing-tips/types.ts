/**
 * Types for packing tips prompt.
 */

/**
 * Context passed to the packing tips prompt builder.
 */
export interface PackingTipsContext {
  /** Item name (e.g., "Coffee Table", "Floor Lamp") */
  itemName: string;
  /** Full product name with details if available */
  fullProductName?: string;
  /** Item category (e.g., "Furniture", "Electronics") */
  category?: string;
  /** Item description with materials, features, etc. */
  description?: string;
  /** Whether the item can be disassembled */
  canDisassemble?: boolean;
  /** Whether the item is fragile */
  isFragile?: boolean;
  /** Item dimensions in inches (for context) */
  dimensions?: {
    length: number | null;
    width: number | null;
    height: number | null;
  };
  /** Item weight in pounds (for context) */
  weight?: number | null;
}
