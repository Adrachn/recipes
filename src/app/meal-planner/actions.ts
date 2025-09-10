"use server";

import {
  generateMealPlan,
  getRecipeCounts,
  PlannerCriteria,
} from "@/lib/planner";
import { getAllRecipes } from "@/lib/recipes";
import { Recipe } from "@/types";

export async function createMealPlanAction(criteria: PlannerCriteria) {
  const result = await generateMealPlan(criteria);
  return result;
}

export async function getCountsAction(criteria: {
  packs: string[];
}) {
  const counts = await getRecipeCounts(criteria);
  return counts;
}

export async function rerollRecipeAction(
  criteria: PlannerCriteria,
  currentPlanSlugs: string[],
  slugToReplace: string,
  tagsToMatch: string[]
): Promise<{ newRecipe?: Recipe; error?: string }> {
  // 1. Get all recipes and filter them based on original criteria
  const allRecipes = await getAllRecipes();
  let filteredRecipes = allRecipes;
  if (criteria.packs.length > 0) {
    filteredRecipes = allRecipes.filter((recipe) =>
      criteria.packs.includes(recipe.packSlug)
    );
  }

  if (criteria.diets.length > 0) {
    // If user wants vegetarian, they also accept vegan
    const dietsToFilter = [...criteria.diets];
    if (dietsToFilter.includes("vegetarian")) {
      dietsToFilter.push("vegan");
    }
    filteredRecipes = filteredRecipes.filter((recipe) =>
      dietsToFilter.some((diet) => recipe.tags.includes(diet))
    );
  }

  // Further filter by difficulty if specified in criteria
  // This part is complex because difficulty is now an object of counts.
  // For reroll, we should just ensure the new recipe fits the overall criteria.

  // 2. Exclude recipes already in the plan
  const availablePool = filteredRecipes.filter(
    (recipe) => !currentPlanSlugs.includes(recipe.slug)
  );

  // Find the primary meal category tag (e.g., 'vegan', 'chicken') to match
  const primaryCategory = tagsToMatch.find((tag) =>
    ["vegan", "vegetarian", "chicken", "fish", "red-meat"].includes(tag)
  );

  // 2a. Prioritize finding a replacement with the same primary category
  let replacementPool = [];
  if (primaryCategory) {
    replacementPool = availablePool.filter((recipe) =>
      recipe.tags.includes(primaryCategory)
    );
  }

  // 2b. If no specific match is found, fall back to the general pool
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
