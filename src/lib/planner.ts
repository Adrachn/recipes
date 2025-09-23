import { Recipe } from "@/types";
import { getAllRecipes } from "./recipes";

export interface PlannerCriteria {
  packs: string[];
  diets: string[];
  keywords: string[];
  difficulty: {
    Bronze: number;
    Silver: number;
    Gold: number;
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
  criteria: PlannerCriteria,
  existingSlugs: string[] = []
): Promise<{ plan?: Recipe[]; error?: string }> {
  // 1. Initial Filtering
  let pool = await getAllRecipes();
  if (criteria.packs.length > 0) {
    pool = pool.filter((recipe) => criteria.packs.includes(recipe.packSlug));
  }
  if (criteria.keywords.length > 0) {
    pool = pool.filter((recipe) =>
      criteria.keywords.every((keyword) => recipe.keywords?.includes(keyword))
    );
  }

  const shuffledPool = [...pool].sort(() => 0.5 - Math.random());

  // 2. Setup Needs
  const difficultyNeeds = { ...criteria.difficulty };
  const categoryNeeds = { ...criteria.counts };
  const totalMeals = Object.values(categoryNeeds).reduce((a, b) => a + b, 0);

  const mealCategories = Object.keys(categoryNeeds).filter((c) => c !== "any");

  const plan: Recipe[] = [];
  const usedSlugs = new Set<string>(existingSlugs);

  // 3. Loop to build the plan by finding the best recipe for each slot
  for (let i = 0; i < totalMeals; i++) {
    let bestPick: Recipe | null = null;
    let bestPickScore = -1;

    // Find the best recipe in the remaining pool by "scoring" it against our needs
    for (const recipe of shuffledPool) {
      if (usedSlugs.has(recipe.slug.current)) continue;

      const recipeDiff =
        recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1);
      const recipeCat = mealCategories.find((cat) =>
        recipe.categories.includes(cat)
      );

      // Score is higher if it matches a specific need
      let currentScore = 0;
      if (difficultyNeeds[recipeDiff as keyof typeof difficultyNeeds] > 0)
        currentScore++;
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
      bestPick =
        shuffledPool.find((recipe) => !usedSlugs.has(recipe.slug.current)) ||
        null;
    }

    if (!bestPick) {
      // Future improvement: Add more detailed error message here about which criteria failed.
      return {
        error:
          "Could not generate a full meal plan. Try loosening your criteria.",
      };
    }

    // 4. Add the best pick to the plan and update our needs
    plan.push(bestPick);
    usedSlugs.add(bestPick.slug.current);

    const pickedDifficulty =
      bestPick.difficulty.charAt(0).toUpperCase() +
      bestPick.difficulty.slice(1);
    const pickedCategory = mealCategories.find((cat) =>
      bestPick.categories.includes(cat)
    );

    // Decrement the most specific need first, falling back to "any"
    if (
      pickedDifficulty &&
      difficultyNeeds[pickedDifficulty as keyof typeof difficultyNeeds] > 0
    ) {
      difficultyNeeds[pickedDifficulty as keyof typeof difficultyNeeds]--;
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
  keywords: string[];
}): Promise<{
  categories: Record<keyof Omit<PlannerCriteria['counts'], 'any'>, number>;
  difficulties: Record<'Bronze' | 'Silver' | 'Gold', number>;
  dietaryTags: Record<string, number>;
  totalAvailable: number;
}> {
  const allRecipes = await getAllRecipes();

  // 1. Filter by selected packs (if any are selected)
  let filteredRecipes = allRecipes;
  if (criteria.packs.length > 0) {
    filteredRecipes = allRecipes.filter(
      (recipe) => recipe.packSlug && criteria.packs.includes(recipe.packSlug)
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
  const difficultyCounts: Record<"Bronze" | "Silver" | "Gold", number> = {
    Bronze: 0,
    Silver: 0,
    Gold: 0,
  };
  const dietaryTagCounts: Record<string, number> = {};

  for (const recipe of filteredRecipes) {
    // Categories
    const isVegan = recipe.categories.includes('vegan');
    const isVegetarian = recipe.categories.includes('vegetarian');
    if (isVegan) categoryCounts.vegan++;
    if (isVegetarian || isVegan) categoryCounts.vegetarian++;
    if (recipe.categories.includes('chicken')) categoryCounts.chicken++;
    if (recipe.categories.includes('fish')) categoryCounts.fish++;
    if (recipe.categories.includes('red-meat')) categoryCounts['red-meat']++;
    // Difficulty
    const difficultyMap = {
      bronze: 'Bronze',
      silver: 'Silver',
      gold: 'Gold',
    };
    const difficultyKey =
      difficultyMap[recipe.difficulty as keyof typeof difficultyMap];
    if (difficultyKey) {
      difficultyCounts[difficultyKey as keyof typeof difficultyCounts]++;
    }

    // All other tags (now keywords)
    recipe.keywords?.forEach((keyword) => {
      dietaryTagCounts[keyword] = (dietaryTagCounts[keyword] || 0) + 1;
    });

    // We also want to count categories under the "dietaryTags" umbrella for the UI
    recipe.categories.forEach((cat) => {
      dietaryTagCounts[cat] = (dietaryTagCounts[cat] || 0) + 1;
    });

    // Post-process for vegetarian count in dietaryTags if a recipe is only tagged vegan
    if (isVegan && !isVegetarian) {
      dietaryTagCounts['vegetarian'] =
        (dietaryTagCounts['vegetarian'] || 0) + 1;
    }
  }

  // After counting, we calculate the total available based on ALL filters
  let finalFilteredRecipes = filteredRecipes;
  if (criteria.keywords.length > 0) {
    finalFilteredRecipes = finalFilteredRecipes.filter((recipe) =>
      criteria.keywords.every((keyword) => recipe.keywords?.includes(keyword))
    );
  }

  const totalAvailable = new Set(finalFilteredRecipes).size;

  return {
    categories: categoryCounts,
    difficulties: difficultyCounts,
    dietaryTags: dietaryTagCounts,
    totalAvailable,
  };
}
