/**
 * Single source of truth for recipe taxonomy: meal categories, difficulty,
 * dietary tags, and style/cuisine tags. Used by Sanity schema (dropdown/list
 * options) and the app (meal planner filters, types). Add or change values
 * here only; Sanity and UI stay in sync.
 */

export type TaxonomyOption = { value: string; title: string };

export const MEAL_CATEGORIES: TaxonomyOption[] = [
  { value: "beef", title: "Beef" },
  { value: "chicken", title: "Chicken" },
  { value: "fish", title: "Fish" },
  { value: "lamb", title: "Lamb" },
  { value: "pork", title: "Pork" },
  { value: "vegan", title: "Vegan" },
  { value: "vegetarian", title: "Vegetarian" },
];

export type MealCategoryValue = (typeof MEAL_CATEGORIES)[number]["value"];


export const DIFFICULTY_LEVELS: TaxonomyOption[] = [
  { value: "bronze", title: "Bronze" },
  { value: "silver", title: "Silver" },
  { value: "gold", title: "Gold" },
];

export type DifficultyValue = (typeof DIFFICULTY_LEVELS)[number]["value"];

export type DifficultyLabel = "Bronze" | "Silver" | "Gold";

export const DIETARY_TAGS: TaxonomyOption[] = [
  { value: "dairy-free", title: "Dairy free" },
  { value: "gluten-free", title: "Gluten free" },
  { value: "lactose-free", title: "Lactose free" },
  { value: "nut-free", title: "Nut free" },
];

export const STYLE_TAGS: TaxonomyOption[] = [
  { value: "breakfast", title: "Breakfast" },
  { value: "chocolate", title: "Chocolate" },
  { value: "curry", title: "Curry" },
  { value: "dessert", title: "Dessert" },
  { value: "drink", title: "Drink" },
  { value: "low-calorie", title: "Low Calorie" },
  { value: "main", title: "Main" },
  { value: "pasta", title: "Pasta" },
  { value: "sandwich", title: "Sandwich" },
  { value: "salad", title: "Salad" },
  { value: "side", title: "Side" },
  { value: "smoothie", title: "Smoothie" },
  { value: "snack", title: "Snack" },
  { value: "soup", title: "Soup" },
  { value: "quick", title: "Quick" },
];

/** All keyword options (dietary + style) for Sanity list — one field, one list. */
export const KEYWORD_OPTIONS: TaxonomyOption[] = [
  ...DIETARY_TAGS,
  ...STYLE_TAGS,
];

/** For UI: dietary options with value + label (label used for display). */
export const DIETARY_OPTIONS = DIETARY_TAGS.map((o) => ({
  value: o.value,
  label: o.title,
}));

/** For UI: style options with value + label. */
export const STYLE_OPTIONS = STYLE_TAGS.map((o) => ({
  value: o.value,
  label: o.title,
}));
