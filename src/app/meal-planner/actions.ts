"use server";

import {
  generateMealPlan,
  getRecipeCounts,
  PlannerCriteria,
} from "@/lib/planner";
import { getAllRecipes, searchRecipes } from "@/lib/recipes";
import { Recipe } from "@/types";

export async function createMealPlanAction(
  criteria: PlannerCriteria,
  existingSlugs: string[]
) {
  const result = await generateMealPlan(criteria, existingSlugs);
  return result;
}

export async function getCountsAction(criteria: {
  packs: string[];
  keywords: string[];
}) {
  const counts = await getRecipeCounts(criteria);
  return counts;
}

export async function rerollRecipeAction(
  criteria: PlannerCriteria,
  currentPlanSlugs: string[],
  slugToReplace: string,
  tagsToMatch: string[],
  difficulty: "bronze" | "silver" | "gold"
): Promise<{ newRecipe?: Recipe; error?: string }> {
  // 1. Get all recipes and filter them based on original criteria
  const allRecipes = await getAllRecipes();
  let filteredRecipes = allRecipes;
  if (criteria.packs.length > 0) {
    filteredRecipes = allRecipes.filter(
      (recipe) => recipe.packSlug && criteria.packs.includes(recipe.packSlug)
    );
  }

  if (criteria.diets.length > 0) {
    // If user wants vegetarian, they also accept vegan
    const dietsToFilter = [...criteria.diets];
    if (dietsToFilter.includes("vegetarian")) {
      dietsToFilter.push("vegan");
    }
    filteredRecipes = filteredRecipes.filter((recipe) =>
      dietsToFilter.some((diet) => recipe.categories.includes(diet))
    );
  }

  // Further filter by difficulty if specified in criteria
  // This part is complex because difficulty is now an object of counts.
  // For reroll, we should just ensure the new recipe fits the overall criteria.

  // 2. Exclude recipes already in the plan and match difficulty
  const availablePool = filteredRecipes.filter(
    (recipe) =>
      !currentPlanSlugs.includes(recipe.slug.current) &&
      recipe.difficulty === difficulty
  );

  // Find the primary meal category tag (e.g., 'vegan', 'chicken') to match
  const primaryCategory = tagsToMatch.find((tag) =>
    ["vegan", "vegetarian", "chicken", "fish", "red-meat"].includes(tag)
  );

  // 2a. Prioritize finding a replacement with the same primary category
  // ONLY if that category was specifically requested in the original criteria.
  let replacementPool: Recipe[] = [];
  if (
    primaryCategory &&
    criteria.counts[primaryCategory as keyof typeof criteria.counts] > 0
  ) {
    replacementPool = availablePool.filter((recipe) =>
      recipe.categories.includes(primaryCategory)
    );
  }

  // 2b. If no specific match is needed or found, use the general pool
  if (replacementPool.length === 0) {
    replacementPool = availablePool;
  }

  if (replacementPool.length === 0) {
    return {
      error: "No alternative recipes found matching the criteria.",
    };
  }

  // 3. Find a replacement
  const newRecipe =
    replacementPool[Math.floor(Math.random() * replacementPool.length)];

  return { newRecipe };
}

export async function searchRecipesAction(
  query: string
): Promise<Recipe[] | { error: string }> {
  if (query.trim().length < 2) {
    return [];
  }
  try {
    const recipes = await searchRecipes(query);
    return recipes;
  } catch (error) {
    console.error("Error searching recipes:", error);
    return { error: "Failed to search for recipes. Please try again." };
  }
}
