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
  difficulty: 'bronze' | 'silver' | 'gold';
  prepTime?: number;
  cookTime?: number;
  tags: string[];
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
  tags?: string[];
  recipes: Recipe[];
}
