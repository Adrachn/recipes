// Define a type for the parsed quantity
export type ParsedQuantity = {
  value: number;
  unit: string;
};

// Conversion rates to base units (ml for volume, g for mass, pcs for pieces)
const conversions: Record<
  string,
  { baseUnit: "ml" | "g" | "pcs"; rate: number }
> = {
  // Volume
  ml: { baseUnit: "ml", rate: 1 },
  cl: { baseUnit: "ml", rate: 10 },
  dl: { baseUnit: "ml", rate: 100 },
  l: { baseUnit: "ml", rate: 1000 },
  tsp: { baseUnit: "ml", rate: 5 }, // Teaspoon
  tsk: { baseUnit: "ml", rate: 5 }, // Swedish Teaspoon
  tbsp: { baseUnit: "ml", rate: 15 }, // Tablespoon
  msk: { baseUnit: "ml", rate: 15 }, // Swedish Tablespoon

  // Mass
  g: { baseUnit: "g", rate: 1 },
  hg: { baseUnit: "g", rate: 100 },
  kg: { baseUnit: "g", rate: 1000 },

  // Pieces - for units that are counted
  st: { baseUnit: "pcs", rate: 1 },
  pcs: { baseUnit: "pcs", rate: 1 },
  can: { baseUnit: "pcs", rate: 1 },
};

/**
 * Parses a quantity string (e.g., "2.4 dl") into a value and unit.
 * @param quantityStr The string to parse.
 * @returns A ParsedQuantity object or null if parsing fails.
 */
export const parseQuantity = (
  quantityStr: string
): ParsedQuantity | null => {
  if (!quantityStr) return null;
  const str = quantityStr.trim().toLowerCase();

  // Updated regex to better handle optional units
  const match = str.match(/^(\d*[\.,]?\d+)\s*([a-zA-ZåäöÅÄÖ]*)$/);

  if (!match) {
    return null;
  }

  const value = parseFloat(match[1].replace(",", "."));
  let unit = match[2] || "pcs";

  if (isNaN(value)) return null;

  // If a unit is found, check if it's a known unit. Otherwise, it's a piece.
  if (match[2] && !conversions[match[2]]) {
    // This handles cases like "2 green chilies" where "green" is captured
    // but isn't a real unit. We assume the whole string was a description
    // and the core quantity is just the number.
    unit = "pcs";
  }

  return { value, unit };
};

/**
 * Converts a parsed quantity to its base unit (ml, g, or pcs).
 * @param parsedQuantity The ParsedQuantity object.
 * @returns A new ParsedQuantity object with the base unit and converted value, or null if conversion is not possible.
 */
export const convertToBaseUnit = (
  parsedQuantity: ParsedQuantity
): ParsedQuantity | null => {
  const unit = parsedQuantity.unit.toLowerCase();
  const conversionInfo = conversions[unit];

  if (!conversionInfo) {
    // If unit is unknown, treat it as a piece/unitless quantity.
    return { value: parsedQuantity.value, unit: "pcs" };
  }

  return {
    value: parsedQuantity.value * conversionInfo.rate,
    unit: conversionInfo.baseUnit,
  };
};

/**
 * Formats a quantity from a base unit to a more human-readable string.
 * e.g., 1500g becomes "1.5 kg", 400ml becomes "4 dl".
 * @param value The numerical value in its base unit.
 * @param unit The base unit ('ml', 'g', or 'pcs').
 * @returns A formatted string.
 */
export const formatQuantity = (value: number, unit: string): string => {
  const round = (num: number) => Math.round(num * 100) / 100;

  if (unit === "g") {
    if (value >= 1000) return `${round(value / 1000)} kg`;
  }
  if (unit === "ml") {
    if (value >= 1000) return `${round(value / 1000)} l`;
    if (value >= 100) return `${round(value / 100)} dl`;
  }
  if (unit === "pcs") {
    return `${round(value)}`;
  }

  return `${round(value)} ${unit}`;
};
