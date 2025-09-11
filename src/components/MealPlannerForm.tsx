"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Recipe, RecipePack } from "@/types";
import RecipeCard from "./RecipeCard";
import {
  createMealPlanAction,
  getCountsAction,
  rerollRecipeAction,
} from "../app/meal-planner/actions";
import { PlannerCriteria } from "@/lib/planner";
import { ChevronDown, RefreshCw, Ban } from "lucide-react";
import CategoryCounter from "./CategoryCounter";

type AvailableCounts = {
  categories: Record<string, number>;
  difficulties: Record<string, number>;
  dietaryTags: Record<string, number>;
  totalAvailable: number;
};

interface MealPlannerFormProps {
  packs: RecipePack[];
}

const mealCategories: (keyof Omit<PlannerCriteria["counts"], "any">)[] = [
  "vegan",
  "vegetarian",
  "chicken",
  "fish",
  "red-meat",
];

const difficultyCategories: ("Easy" | "Medium" | "Hard")[] = [
  "Easy",
  "Medium",
  "Hard",
];

const dietaryTags = ["lactose-free", "gluten-free"];

const MealPlannerForm: React.FC<MealPlannerFormProps> = ({ packs }) => {
  const [plan, setPlan] = useState<Recipe[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRerolling, setIsRerolling] = useState<string | null>(null);
  const [lastCriteria, setLastCriteria] = useState<PlannerCriteria | null>(
    null
  );
  const [totalMeals, setTotalMeals] = useState(7);
  const [showCustomCounts, setShowCustomCounts] = useState(false);
  const [customCounts, setCustomCounts] = useState<PlannerCriteria["counts"]>({
    vegan: 0,
    vegetarian: 0,
    chicken: 0,
    fish: 0,
    "red-meat": 0,
    any: 0, // This will be calculated on submit
  });
  const [difficultyCounts, setDifficultyCounts] = useState<
    PlannerCriteria["difficulty"]
  >({
    Easy: 0,
    Medium: 0,
    Hard: 0,
    any: 0, // This will be calculated on submit
  });

  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [availableCounts, setAvailableCounts] =
    useState<AvailableCounts | null>(null);

  // Effect to fetch available recipe counts when filters change
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (selectedPacks.length === 0) {
        setAvailableCounts(null);
        return;
      }

      const counts = await getCountsAction({
        packs: selectedPacks,
        diets: selectedDiets,
      });
      setAvailableCounts(counts);
    }, 300); // Debounce to avoid excessive fetching

    return () => {
      clearTimeout(handler);
    };
  }, [selectedPacks, selectedDiets]);

  const handleCustomCountChange = (
    category: keyof PlannerCriteria["counts"],
    value: number
  ) => {
    setCustomCounts((prev) => ({ ...prev, [category]: value }));
  };

  const handleDifficultyCountChange = (
    difficulty: "Easy" | "Medium" | "Hard",
    value: number
  ) => {
    setDifficultyCounts((prev) => ({ ...prev, [difficulty]: value }));
  };

  const handleClearCategory = (category: keyof PlannerCriteria["counts"]) => {
    setCustomCounts((prev) => ({ ...prev, [category]: 0 }));
  };

  const handleClearAllCustomCounts = () => {
    setCustomCounts({
      vegan: 0,
      vegetarian: 0,
      chicken: 0,
      fish: 0,
      "red-meat": 0,
      any: 0,
    });
  };

  const handleClearAllDifficultyCounts = () => {
    setDifficultyCounts({ Easy: 0, Medium: 0, Hard: 0, any: 0 });
  };

  const handleClearAllCustomizations = () => {
    handleClearAllCustomCounts();
    handleClearAllDifficultyCounts();
  };

  // Memoized derived state to avoid recalculating on every render
  const { remainingMeals, remainingMealsForDifficulty } = useMemo(() => {
    const customSum = Object.values(customCounts)
      .filter((_, i) => Object.keys(customCounts)[i] !== "any")
      .reduce((a, b) => a + b, 0);
    const remainingMeals = totalMeals - customSum;

    const difficultySum = Object.values(difficultyCounts)
      .filter((_, i) => Object.keys(difficultyCounts)[i] !== "any")
      .reduce((a, b) => a + b, 0);
    const remainingMealsForDifficulty = totalMeals - difficultySum;

    return { remainingMeals, remainingMealsForDifficulty };
  }, [totalMeals, customCounts, difficultyCounts]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const packs = formData.getAll("packs");

    if (packs.length === 0) {
      setError("Please select at least one recipe pack to generate a plan.");
      return;
    }

    setIsLoading(true);
    setPlan(null);
    setError(null);

    let selectedPacks = packs as string[];
    if (selectedPacks.length === 0) {
      selectedPacks = packs.map((p) => p.slug);
    }

    let counts: PlannerCriteria["counts"];
    if (showCustomCounts) {
      const customSum = Object.values(customCounts).reduce(
        (acc, val) => acc + val,
        0
      );
      const anyCount = Math.max(0, totalMeals - customSum);
      counts = { ...customCounts, any: anyCount };
    } else {
      counts = {
        vegan: 0,
        vegetarian: 0,
        chicken: 0,
        fish: 0,
        "red-meat": 0,
        any: totalMeals,
      };
    }

    const anyDifficultyCount = Math.max(
      0,
      totalMeals - Object.values(difficultyCounts).reduce((a, b) => a + b, 0)
    );

    const finalDifficultyCounts = {
      ...difficultyCounts,
      any: anyDifficultyCount,
    };

    const anyCategoryCount = Math.max(
      0,
      totalMeals -
        Object.values(customCounts)
          .filter((_, i) => Object.keys(customCounts)[i] !== "any") // Exclude 'any' from sum
          .reduce((a, b) => a + b, 0)
    );

    const finalCategoryCounts = {
      ...customCounts,
      any: anyCategoryCount,
    };

    const criteria: PlannerCriteria = {
      packs: packs as string[],
      diets: selectedDiets,
      difficulty: finalDifficultyCounts as any, // The type needs `any` which we are adding
      counts: finalCategoryCounts,
    };
    setLastCriteria(criteria);

    const result = await createMealPlanAction(criteria);
    if (result.error) {
      setError(result.error);
      setPlan(null);
    } else {
      setPlan(result.plan || null);
      setError(null);
    }
    setIsLoading(false);
  };

  const handleReroll = async (recipeToReplace: Recipe) => {
    if (!lastCriteria || !plan) return;
    setIsRerolling(recipeToReplace.slug);
    setError(null); // Clear previous errors

    const currentPlanSlugs = plan.map((recipe) => recipe.slug);
    const result = await rerollRecipeAction(
      lastCriteria,
      currentPlanSlugs,
      recipeToReplace.slug,
      recipeToReplace.tags
    );

    if (result.newRecipe) {
      const newPlan = plan.map((recipe) =>
        recipe.slug === recipeToReplace.slug ? result.newRecipe! : recipe
      );
      setPlan(newPlan);
    } else {
      setError(result.error || "Failed to find a replacement recipe.");
    }

    setIsRerolling(null);
  };

  const countsInCategoryInPlan = plan
    ? plan.reduce((acc, recipe) => {
        const primaryCategory = mealCategories.find((cat) =>
          recipe.tags.includes(cat)
        );
        if (primaryCategory) {
          acc[primaryCategory] = (acc[primaryCategory] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    : {};

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-slate-50 p-8 rounded-xl shadow-lg border border-slate-200 max-w-2xl mx-auto"
      >
        <fieldset className="mb-8">
          <legend className="text-xl font-semibold mb-4 text-gray-800">
            1. Select Recipe Packs
          </legend>
          <div className="grid grid-cols-2 gap-4">
            {packs.map((pack) => (
              <div key={pack.slug} className="flex items-center">
                <input
                  type="checkbox"
                  id={`pack-${pack.slug}`}
                  name="packs"
                  value={pack.slug}
                  checked={selectedPacks.includes(pack.slug)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPacks([...selectedPacks, pack.slug]);
                    } else {
                      setSelectedPacks(
                        selectedPacks.filter((p) => p !== pack.slug)
                      );
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor={`pack-${pack.slug}`}
                  className="ml-3 block text-sm font-medium text-gray-700"
                >
                  {pack.name}
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-8">
          <legend className="text-xl font-semibold mb-4 text-gray-800">
            2. Dietary Preferences (Optional)
          </legend>
          <div className="grid grid-cols-2 gap-4">
            {[...mealCategories, ...dietaryTags].map((diet) => (
              <div key={diet} className="flex items-center">
                <input
                  type="checkbox"
                  id={`diet-${diet}`}
                  name="diets"
                  value={diet}
                  checked={selectedDiets.includes(diet)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDiets([...selectedDiets, diet]);
                    } else {
                      setSelectedDiets(selectedDiets.filter((d) => d !== diet));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor={`diet-${diet}`}
                  className="ml-3 flex items-center text-sm font-medium text-gray-700 capitalize"
                >
                  <span>{diet.replace("-", " ")}</span>
                  {availableCounts && (
                    <span className="ml-1 text-xs text-slate-400">
                      ({availableCounts.dietaryTags[diet] || 0})
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-8">
          <legend className="text-xl font-semibold mb-4 text-gray-800">
            3. How many meals?
          </legend>
          <div className="flex justify-center space-x-2 mb-4">
            {Array.from({ length: 7 }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setTotalMeals(num)}
                disabled={
                  availableCounts ? num > availableCounts.totalAvailable : false
                }
                className={`w-10 h-10 rounded-md font-semibold transition-colors ${
                  totalMeals === num
                    ? "bg-primary text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                } disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`}
              >
                {num}
              </button>
            ))}
          </div>
          {availableCounts && (
            <p className="text-center text-sm text-slate-500">
              {availableCounts.totalAvailable} recipes match your filters.
            </p>
          )}
          <button
            type="button"
            onClick={() => setShowCustomCounts(!showCustomCounts)}
            className="w-full text-left text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center py-2"
          >
            <span>Meal Customization</span>
            <ChevronDown
              className={`w-4 h-4 ml-1 transition-transform ${
                showCustomCounts ? "rotate-180" : ""
              }`}
            />
          </button>
          {showCustomCounts && (
            <div className="relative mt-4 border-t pt-4">
              <div className="absolute -top-3 right-0">
                <button
                  type="button"
                  onClick={handleClearAllCustomizations}
                  className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary transition-colors bg-slate-50 px-2"
                  title="Clear all customizations"
                >
                  <Ban className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="relative">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Meal Types
                  </h4>
                  <div className="grid grid-cols-1 gap-y-4">
                    {mealCategories.map((category) => (
                      <CategoryCounter
                        key={category}
                        category={category}
                        availableCount={availableCounts?.categories[category]}
                        currentValue={customCounts[category]}
                        maxValue={customCounts[category] + remainingMeals}
                        onChange={(value) =>
                          handleCustomCountChange(category, value)
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="relative border-t pt-6">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Difficulty
                  </h4>
                  <div className="grid grid-cols-1 gap-y-4">
                    {difficultyCategories.map((difficulty) => (
                      <CategoryCounter
                        key={difficulty}
                        category={difficulty}
                        availableCount={
                          availableCounts?.difficulties[difficulty]
                        }
                        currentValue={difficultyCounts[difficulty]}
                        maxValue={
                          difficultyCounts[difficulty] +
                          remainingMealsForDifficulty
                        }
                        onChange={(value) =>
                          handleDifficultyCountChange(difficulty, value)
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </fieldset>

        <div className="text-center">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:shadow-none"
          >
            {isLoading ? "Generating..." : "Generate Plan"}
          </button>
        </div>
      </form>
      <div className="mt-12">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md max-w-2xl mx-auto text-center">
            <strong className="font-bold">Oops! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        {plan && (
          <section>
            <h2 className="text-3xl font-bold text-center mb-8">
              Your Meal Plan
            </h2>
            <div className="flex flex-wrap gap-8 justify-center">
              {plan.map((recipe) => {
                const getCountsInCategoryInPlan = (recipeSlug: string) => {
                  const targetRecipe = plan.find((r) => r.slug === recipeSlug);
                  if (!targetRecipe) return 0;
                  const targetCategory = targetRecipe.tags.find((t) =>
                    mealCategories.includes(t)
                  );
                  if (!targetCategory) return plan.length; // Fallback for uncategorized

                  return plan.filter((r) => r.tags.includes(targetCategory))
                    .length;
                };

                const countsInCategoryInPlan = getCountsInCategoryInPlan(
                  recipe.slug
                );
                const canReroll =
                  (availableCounts?.categories[
                    recipe.tags.find((t) =>
                      mealCategories.includes(t)
                    ) as string
                  ] ?? 0) > countsInCategoryInPlan;

                return (
                  <div
                    key={recipe.slug}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      style={{
                        width: "var(--card-width)",
                        height: "var(--card-height)",
                      }}
                    >
                      <RecipeCard recipe={recipe} />
                    </div>
                    <button
                      onClick={() => handleReroll(recipe)}
                      disabled={isRerolling === recipe.slug || !canReroll}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-700 disabled:text-slate-400 rounded-md font-semibold transition-colors text-sm"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          isRerolling === recipe.slug ? "animate-spin" : ""
                        }`}
                      />
                      Reroll
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default MealPlannerForm;
