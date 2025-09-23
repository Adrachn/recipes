export interface Ingredient {
  _key: string;
  name: string;
  quantity: string;
}

export interface Recipe {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  image: {
    asset: {
      _ref: string;
    };
  };
  summary: string;
  difficulty: "bronze" | "silver" | "gold";
  prepTime?: number;
  cookTime?: number;
  categories: string[];
  keywords?: string[];
  servings?: number;
  packSlug?: string;
  ingredients: Ingredient[];
  instructions: any[]; // Sanity's portable text
}

export interface RecipePack {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  description?: string;
  recipes: Recipe[];
}
