import { Recipe } from "@/types";
import { getAllRecipes } from "./recipes";

export interface PlannerCriteria {
  packs: string[];
  diets: string[];
  difficulty: {
    Easy: number;
    Medium: number;
    Hard: number;
    any: number;
  };
  counts: {
    vegan: number;
    vegetarian: number;
    chicken: number;
    fish: number;
    "red-meat": number;
    any: number;
  };
}

export async function generateMealPlan(
  criteria: PlannerCriteria
): Promise<{ plan?: Recipe[]; error?: string }> {
  // 1. Initial Filtering
  let pool = await getAllRecipes();
  if (criteria.packs.length > 0) {
    pool = pool.filter((recipe) => criteria.packs.includes(recipe.packSlug));
  }
  if (criteria.diets.length > 0) {
    // If user wants vegetarian, they also accept vegan
    const dietsToFilter = [...criteria.diets];
    if (dietsToFilter.includes("vegetarian")) {
      dietsToFilter.push("vegan");
    }

    pool = pool.filter((recipe) =>
      dietsToFilter.some((diet) => recipe.tags.includes(diet))
    );
  }
  const shuffledPool = pool.sort(() => 0.5 - Math.random());

  // 2. Setup Needs
  const difficultyNeeds = { ...criteria.difficulty };
  const categoryNeeds = { ...criteria.counts };
  const totalMeals =
    Object.values(difficultyNeeds).reduce((a, b) => a + b, 0) ||
    Object.values(categoryNeeds).reduce((a, b) => a + b, 0);

  const mealCategories = Object.keys(categoryNeeds).filter((c) => c !== "any");

  const plan: Recipe[] = [];
  const usedSlugs = new Set<string>();

  // 3. Loop to build the plan by finding the best recipe for each slot
  for (let i = 0; i < totalMeals; i++) {
    let bestPick: Recipe | null = null;
    let bestPickScore = -1;

    // Find the best recipe in the remaining pool by "scoring" it against our needs
    for (const recipe of shuffledPool) {
      if (usedSlugs.has(recipe.slug)) continue;

      const recipeDiff = recipe.difficulty;
      const recipeCat = mealCategories.find((cat) => recipe.tags.includes(cat));

      // Score is higher if it matches a specific need
      let currentScore = 0;
      if (difficultyNeeds[recipeDiff] > 0) currentScore++;
      if (recipeCat && categoryNeeds[recipeCat as keyof typeof categoryNeeds] > 0)
        currentScore++;

      if (currentScore > bestPickScore) {
        bestPick = recipe;
        bestPickScore = currentScore;
        // If we find a perfect match (score of 2), we can stop searching for this slot
        if (currentScore === 2) break;
      }
    }

    // If no specific match was found, try to fill an "any" slot from the remaining pool
    if (
      bestPickScore < 1 &&
      (categoryNeeds.any > 0 || difficultyNeeds.any > 0)
    ) {
      bestPick = shuffledPool.find((recipe) => !usedSlugs.has(recipe.slug)) || null;
    }

    if (!bestPick) {
      return {
        error:
          "Could not generate a full meal plan. Try loosening your criteria.",
      };
    }

    // 4. Add the best pick to the plan and update our needs
    plan.push(bestPick);
    usedSlugs.add(bestPick.slug);

    const pickedDifficulty = bestPick.difficulty;
    const pickedCategory = mealCategories.find((cat) =>
      bestPick.tags.includes(cat)
    );

    // Decrement the most specific need first, falling back to "any"
    if (difficultyNeeds[pickedDifficulty] > 0) {
      difficultyNeeds[pickedDifficulty]--;
    } else if (difficultyNeeds.any > 0) {
      difficultyNeeds.any--;
    }

    if (
      pickedCategory &&
      categoryNeeds[pickedCategory as keyof typeof categoryNeeds] > 0
    ) {
      categoryNeeds[pickedCategory as keyof typeof categoryNeeds]--;
    } else if (categoryNeeds.any > 0) {
      categoryNeeds.any--;
    }
  }

  return { plan };
}

export async function getRecipeCounts(criteria: {
  packs: string[];
}): Promise<{
  categories: Record<keyof Omit<PlannerCriteria["counts"], "any">, number>;
  difficulties: Record<"Easy" | "Medium" | "Hard", number>;
  dietaryTags: Record<string, number>;
  totalAvailable: number;
}> {
  const allRecipes = await getAllRecipes();

  // 1. Filter by selected packs (if any are selected)
  let filteredRecipes = allRecipes;
  if (criteria.packs.length > 0) {
    filteredRecipes = allRecipes.filter((recipe) =>
      criteria.packs.includes(recipe.packSlug)
    );
  }

  // 2. Count recipes
  const categoryCounts: Record<
    keyof Omit<PlannerCriteria["counts"], "any">,
    number
  > = {
    vegan: 0,
    vegetarian: 0,
    chicken: 0,
    fish: 0,
    "red-meat": 0,
  };
  const difficultyCounts: Record<"Easy" | "Medium" | "Hard", number> = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
  };
  const dietaryTagCounts: Record<string, number> = {};

  for (const recipe of filteredRecipes) {
    // Categories
    const isVegan = recipe.tags.includes("vegan");
    const isVegetarian = recipe.tags.includes("vegetarian");
    if (isVegan) categoryCounts.vegan++;
    if (isVegetarian || isVegan) categoryCounts.vegetarian++;
    if (recipe.tags.includes("chicken")) categoryCounts.chicken++;
    if (recipe.tags.includes("fish")) categoryCounts.fish++;
    if (recipe.tags.includes("red-meat")) categoryCounts["red-meat"]++;
    // Difficulty
    difficultyCounts[recipe.difficulty]++;
    // All other tags
    recipe.tags.forEach((tag) => {
      dietaryTagCounts[tag] = (dietaryTagCounts[tag] || 0) + 1;
    });
    // Post-process for vegetarian count in dietaryTags if a recipe is only tagged vegan
    if (isVegan && !isVegetarian) {
      dietaryTagCounts["vegetarian"] =
        (dietaryTagCounts["vegetarian"] || 0) + 1;
    }
  }

  // After counting, we calculate the total available based on the DIET filter
  // This is for the UI feedback, not the final generation pool.
  let totalAvailable = filteredRecipes.length;
  if (criteria.diets.length > 0) {
    const dietsToFilter = [...criteria.diets];
    if (dietsToFilter.includes("vegetarian")) {
      dietsToFilter.push("vegan");
    }
    const dietFilteredRecipes = filteredRecipes.filter((recipe) =>
      // Use Set for uniqueness
      dietsToFilter.some((diet) => recipe.tags.includes(diet))
    );
    totalAvailable = new Set(dietFilteredRecipes).size;
  }

  return {
    categories: categoryCounts,
    difficulties: difficultyCounts,
    dietaryTags: dietaryTagCounts,
    totalAvailable,
  };
}
