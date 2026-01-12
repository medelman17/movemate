/**
 * Comprehensive measurement conversion instructions for product research prompts.
 * Ensures consistent unit conversion across all AI-generated product data.
 */
export const dimensionConversionRules = `DIMENSION AND WEIGHT CONVERSION:
1. Convert all measurements to inches:
   - From cm: divide by 2.54
   - From mm: divide by 25.4
   - From feet: multiply by 12
   - From meters: multiply by 39.37
2. Convert weight to pounds:
   - From kg: multiply by 2.205
   - From grams: divide by 453.59
   - From oz: divide by 16
3. Return null for any value you cannot determine
4. Round to 2 decimal places`;

/**
 * JSON structure format for dimension objects.
 */
export const dimensionFormat = `Dimensions should be returned as:
{
  "length": number | null,  // inches
  "width": number | null,   // inches
  "height": number | null   // inches
}`;
