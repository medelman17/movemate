/**
 * Domain-specific context for moving inventory applications.
 * Provides background information to AI models about the moving use case.
 */
export const movingInventoryContext = `You are assisting with a moving inventory application. Your goal is to help identify and catalog household items for moving purposes.

Key considerations:
- Items need accurate dimensions and weight for moving estimates
- Simple, recognizable names help movers identify items
- Detailed product info helps with insurance and replacement value`;

/**
 * Standard item categories for moving inventory.
 */
export const itemCategories = [
  "Furniture",
  "Electronics",
  "Kitchenware",
  "Clothing",
  "Books",
  "Decor",
  "Tools",
  "Other",
] as const;

/**
 * Item category type derived from the categories array.
 */
export type ItemCategory = (typeof itemCategories)[number];

/**
 * Example items for each category to guide AI categorization.
 */
export const categoryExamples: Record<ItemCategory, string[]> = {
  Furniture: ["Sofa", "Dining Table", "Bed Frame", "Bookshelf", "Dresser", "Coffee Table"],
  Electronics: ["TV", "Computer", "Gaming Console", "Speaker", "Monitor", "Printer"],
  Kitchenware: ["Plates", "Cookware", "Utensils", "Appliances", "Glassware"],
  Clothing: ["Wardrobe", "Shoes", "Accessories", "Seasonal Wear"],
  Books: ["Textbooks", "Novels", "Magazines", "Collections"],
  Decor: ["Paintings", "Vases", "Rugs", "Curtains", "Lamps", "Picture Frames"],
  Tools: ["Power Tools", "Hand Tools", "Gardening Equipment", "Workshop Items"],
  Other: ["Sports Equipment", "Musical Instruments", "Toys", "Office Supplies"],
};
