export interface Ingredient {
  amount: string;
  name: string;
}

export interface Recipe {
  title: string;
  slug: string;
  image: string;
  summary: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  ingredients: Ingredient[];
  instructions: string[];
}

export interface RecipePack {
  name: string;
  slug: string;
  description: string;
  recipes: Recipe[];
}
