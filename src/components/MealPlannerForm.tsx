"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Recipe, RecipePack } from "@/types";
import RecipeCard from "./RecipeCard";
import {
  createMealPlanAction,
  getCountsAction,
  rerollRecipeAction,
  searchRecipesAction,
} from "../app/meal-planner/actions";
import { PlannerCriteria } from "@/lib/planner";
import { RefreshCw, Ban, CalendarCheck, Trash2 } from "lucide-react";
import CategoryCounter from "./CategoryCounter";
import { useRouter } from "next/navigation";

type MealPlanData = {
  [date: string]: Recipe | null; // Key is YYYY-MM-DD
};

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

const difficultyCategories: ("Bronze" | "Silver" | "Gold")[] = [
  "Bronze",
  "Silver",
  "Gold",
];

const globalFilters = ["lactose-free", "gluten-free"];

const MealPlannerForm: React.FC<MealPlannerFormProps> = ({ packs }) => {
  const [plan, setPlan] = useState<Recipe[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRerolling, setIsRerolling] = useState<string | null>(null);
  const router = useRouter();

  // State for manual recipe search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [lastCriteria, setLastCriteria] = useState<PlannerCriteria | null>(
    null
  );
  const [totalMeals, setTotalMeals] = useState(7);
  const [mealTypeCounts, setMealTypeCounts] = useState<
    PlannerCriteria["counts"]
  >({
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
    Bronze: 0,
    Silver: 0,
    Gold: 0,
    any: 0, // This will be calculated on submit
  });

  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [selectedGlobalFilters, setSelectedGlobalFilters] = useState<string[]>(
    []
  );
  const [availableCounts, setAvailableCounts] =
    useState<AvailableCounts | null>(null);

  // Effect to fetch available recipe counts when filters change
  useEffect(() => {
    const handler = setTimeout(async () => {
      // No need to fetch if no packs are selected, as the pool is "all"
      const counts = await getCountsAction({
        packs: selectedPacks,
        keywords: selectedGlobalFilters,
      });
      setAvailableCounts(counts);
    }, 300); // Debounce to avoid excessive fetching

    return () => {
      clearTimeout(handler);
    };
  }, [selectedPacks, selectedGlobalFilters]);

  // Effect to handle recipe search with debouncing
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      const result = await searchRecipesAction(searchQuery);
      if ("error" in result) {
        setSearchError(result.error);
        setSearchResults([]);
      } else {
        // Exclude recipes already in the plan from search results
        const planIds = new Set(plan?.map((p) => p._id));
        setSearchResults(result.filter((r) => !planIds.has(r._id)));
      }
      setIsSearching(false);
    }, 500); // Debounce search by 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, plan]);

  const handleMealTypeCountChange = (
    category: keyof PlannerCriteria["counts"],
    value: number
  ) => {
    setMealTypeCounts((prev) => ({ ...prev, [category]: value }));
  };

  const handleDifficultyCountChange = (
    difficulty: "Bronze" | "Silver" | "Gold",
    value: number
  ) => {
    setDifficultyCounts((prev) => ({ ...prev, [difficulty]: value }));
  };

  const handleClearAllMealTypeCounts = () => {
    setMealTypeCounts({
      vegan: 0,
      vegetarian: 0,
      chicken: 0,
      fish: 0,
      "red-meat": 0,
      any: 0,
    });
  };

  const handleClearAllDifficultyCounts = () => {
    setDifficultyCounts({ Bronze: 0, Silver: 0, Gold: 0, any: 0 });
  };

  // Memoized derived state to avoid recalculating on every render
  const { remainingMeals, remainingMealsForDifficulty } = useMemo(() => {
    const customSum = Object.values(mealTypeCounts)
      .filter((_, i) => Object.keys(mealTypeCounts)[i] !== "any")
      .reduce((a, b) => a + b, 0);
    const remainingMeals = totalMeals - customSum;

    const difficultySum = Object.values(difficultyCounts)
      .filter((_, i) => Object.keys(difficultyCounts)[i] !== "any")
      .reduce((a, b) => a + b, 0);
    const remainingMealsForDifficulty = totalMeals - difficultySum;

    return {
      remainingMeals,
      remainingMealsForDifficulty,
    };
  }, [totalMeals, mealTypeCounts, difficultyCounts]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const packs = formData.getAll("packs");

    setIsLoading(true);
    setError(null);

    const anyCategoryCount = Math.max(
      0,
      totalMeals -
        Object.values(mealTypeCounts)
          .filter((_, i) => Object.keys(mealTypeCounts)[i] !== "any") // Exclude 'any' from sum
          .reduce((a, b) => a + b, 0)
    );

    const finalCategoryCounts = {
      ...mealTypeCounts,
      any: anyCategoryCount,
    };

    const anyDifficultyCount = Math.max(
      0,
      totalMeals -
        Object.values(difficultyCounts)
          .filter((_, i) => Object.keys(difficultyCounts)[i] !== "any")
          .reduce((a, b) => a + b, 0)
    );

    const finalDifficultyCounts = {
      ...difficultyCounts,
      any: anyDifficultyCount,
    };

    const criteria: PlannerCriteria = {
      packs: packs as string[],
      keywords: selectedGlobalFilters,
      diets: [], // Deprecated
      difficulty: finalDifficultyCounts,
      counts: finalCategoryCounts,
    };
    setLastCriteria(criteria);

    const existingSlugs = plan?.map((recipe) => recipe.slug.current) ?? [];
    const result = await createMealPlanAction(criteria, existingSlugs);
    if (result.error) {
      setError(result.error);
    } else {
      setPlan((prevPlan) => [...(prevPlan || []), ...(result.plan || [])]);
      setError(null);
    }
    setIsLoading(false);
  };

  const handleAddToHand = (recipe: Recipe) => {
    setPlan((prevPlan) => {
      const currentPlan = prevPlan || [];
      if (!currentPlan.find((p) => p._id === recipe._id)) {
        return [...currentPlan, recipe];
      }
      return currentPlan;
    });
    // Remove the added recipe from search results
    setSearchResults(searchResults.filter((r) => r._id !== recipe._id));
  };

  const handleRemoveFromHand = (recipeId: string) => {
    setPlan((prevPlan) => {
      if (!prevPlan) return null;
      const newPlan = prevPlan.filter((recipe) => recipe._id !== recipeId);
      return newPlan.length > 0 ? newPlan : null;
    });
  };

  const handleReroll = async (recipeToReplace: Recipe) => {
    if (!lastCriteria || !plan) return;
    setIsRerolling(recipeToReplace._id);
    setError(null); // Clear previous errors

    const currentPlanSlugs = plan.map((recipe) => recipe.slug.current);
    const result = await rerollRecipeAction(
      lastCriteria,
      currentPlanSlugs,
      recipeToReplace.slug.current,
      recipeToReplace.categories,
      recipeToReplace.difficulty
    );

    if (result.newRecipe) {
      const newPlan = plan.map((recipe) =>
        recipe._id === recipeToReplace._id ? result.newRecipe! : recipe
      );
      setPlan(newPlan);
    } else {
      setError(result.error || "Failed to find a replacement recipe.");
    }

    setIsRerolling(null);
  };

  const handleClearHand = () => {
    setPlan(null);
    setError(null);
  };

  const handleAddToCalendar = () => {
    if (!plan) return;

    // Fetch existing plan or create a new one
    const savedPlanJson = localStorage.getItem("monthlyMealPlan");
    const existingPlan: MealPlanData = savedPlanJson
      ? JSON.parse(savedPlanJson)
      : {};

    // Find the first empty day to start adding recipes
    let startDate = new Date();
    const existingDates = Object.keys(existingPlan)
      .filter((date) => existingPlan[date] !== null)
      .sort((a, b) => a.localeCompare(b));
    if (existingDates.length > 0) {
      const lastDate = new Date(existingDates[existingDates.length - 1]);
      startDate = new Date(lastDate);
      startDate.setDate(startDate.getDate() + 1);
    }

    // Add the new recipes to the plan
    const newPlan = { ...existingPlan };
    plan.forEach((recipe, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
      newPlan[dateKey] = recipe;
    });

    localStorage.setItem("monthlyMealPlan", JSON.stringify(newPlan));
    router.push("/meal-plan/view");
  };

  const countsInPlanByDifficulty = plan
    ? plan.reduce(
        (acc, recipe) => {
          const diff =
            recipe.difficulty.charAt(0).toUpperCase() +
            recipe.difficulty.slice(1);
          acc[diff as "Bronze" | "Silver" | "Gold"] =
            (acc[diff as "Bronze" | "Silver" | "Gold"] || 0) + 1;
          return acc;
        },
        {} as Record<"Bronze" | "Silver" | "Gold", number>
      )
    : { Bronze: 0, Silver: 0, Gold: 0 };

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
              <div key={pack._id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`pack-${pack._id}`}
                  name="packs"
                  value={pack.slug.current}
                  checked={selectedPacks.includes(pack.slug.current)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPacks([...selectedPacks, pack.slug.current]);
                    } else {
                      setSelectedPacks(
                        selectedPacks.filter((p) => p !== pack.slug.current)
                      );
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor={`pack-${pack._id}`}
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
            2. Global Filters (Optional)
          </legend>
          <div className="grid grid-cols-2 gap-4">
            {globalFilters.map((filter) => (
              <div key={filter} className="flex items-center">
                <input
                  type="checkbox"
                  id={`filter-${filter}`}
                  name="globalFilters"
                  value={filter}
                  checked={selectedGlobalFilters.includes(filter)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedGlobalFilters([
                        ...selectedGlobalFilters,
                        filter,
                      ]);
                    } else {
                      setSelectedGlobalFilters(
                        selectedGlobalFilters.filter((f) => f !== filter)
                      );
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor={`filter-${filter}`}
                  className="ml-3 flex items-center text-sm font-medium text-gray-700 capitalize"
                >
                  <span>{filter.replace("-", " ")}</span>
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-8">
          <legend className="text-xl font-semibold mb-4 text-gray-800">
            3. Define Your Meal Plan
          </legend>
          <h4 className="font-semibold text-gray-700 mb-2">How many meals?</h4>
          <div className="flex justify-center space-x-2 mb-6">
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
            <p className="text-center text-sm text-slate-500 -mt-2 mb-6">
              {availableCounts.totalAvailable} recipes match your filters.
            </p>
          )}

          <div className="relative border-t pt-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-700">Meal Types</h4>
              <button
                type="button"
                onClick={handleClearAllMealTypeCounts}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
                title="Clear meal types"
              >
                <Ban className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-y-4 mb-6">
              {mealCategories.map((category) => (
                <CategoryCounter
                  key={category}
                  category={category}
                  availableCount={availableCounts?.categories[category]}
                  currentValue={mealTypeCounts[category]}
                  maxValue={Math.min(
                    availableCounts?.categories[category] ?? totalMeals,
                    mealTypeCounts[category] + remainingMeals
                  )}
                  onChange={(value) =>
                    handleMealTypeCountChange(category, value)
                  }
                />
              ))}
            </div>
          </div>

          <div className="relative border-t pt-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-700">Difficulty</h4>
              <button
                type="button"
                onClick={handleClearAllDifficultyCounts}
                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
                title="Clear difficulty selections"
              >
                <Ban className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
            <div className="grid grid-cols-1 gap-y-4">
              {difficultyCategories.map((difficulty) => (
                <CategoryCounter
                  key={difficulty}
                  category={difficulty}
                  availableCount={availableCounts?.difficulties[difficulty]}
                  currentValue={difficultyCounts[difficulty]}
                  maxValue={Math.min(
                    availableCounts?.difficulties[difficulty] ?? totalMeals,
                    difficultyCounts[difficulty] + remainingMealsForDifficulty
                  )}
                  onChange={(value) =>
                    handleDifficultyCountChange(difficulty, value)
                  }
                />
              ))}
            </div>
          </div>
        </fieldset>

        <div className="text-center">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:shadow-none"
          >
            {isLoading ? "Dealing..." : "Deal Cards"}
          </button>
        </div>
      </form>
      <div className="mt-12 w-full px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-8 max-w-2xl mx-auto text-center">
            <strong className="font-bold">Oops! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <section>
          {plan && plan.length > 0 && (
            <>
              <h2 className="text-3xl font-bold text-center mb-8">Your Hand</h2>
              <div className="flex flex-wrap gap-8 justify-center">
                {plan.map((recipe) => {
                  const recipeDifficulty =
                    recipe.difficulty.charAt(0).toUpperCase() +
                    recipe.difficulty.slice(1);

                  const canReroll =
                    (availableCounts?.difficulties[
                      recipeDifficulty as "Bronze" | "Silver" | "Gold"
                    ] ?? 0) >
                    countsInPlanByDifficulty[
                      recipeDifficulty as "Bronze" | "Silver" | "Gold"
                    ];

                  return (
                    <div
                      key={recipe._id}
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReroll(recipe)}
                          disabled={isRerolling === recipe._id || !canReroll}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-700 disabled:text-slate-400 rounded-md font-semibold transition-colors text-sm"
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${
                              isRerolling === recipe._id ? "animate-spin" : ""
                            }`}
                          />
                          Reroll
                        </button>
                        <button
                          onClick={() => handleRemoveFromHand(recipe._id)}
                          className="flex items-center justify-center gap-2 px-2 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md font-semibold transition-colors text-sm"
                          title="Remove recipe"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-12 flex justify-center gap-4">
                <button
                  onClick={handleClearHand}
                  className="bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-lg hover:bg-slate-300 transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear Hand
                </button>
                <button
                  onClick={handleAddToCalendar}
                  className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
                >
                  <CalendarCheck className="w-5 h-5" />
                  Add to Calendar
                </button>
              </div>
            </>
          )}
          {/* Search and Add Section - Always Visible */}
          <div className="mt-8 pt-8 border-t-2 border-slate-200">
            <h3 className="text-2xl font-bold text-center mb-4">
              {plan && plan.length > 0 ? "Add another card" : "Build your hand"}
            </h3>
            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for recipes by name, keyword..."
                className="w-full p-3 pr-10 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary transition-colors"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {searchError && (
              <p className="text-red-500 text-sm text-center">{searchError}</p>
            )}

            <div className="space-y-2">
              {searchResults.map((recipe) => (
                <div
                  key={recipe._id}
                  className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm border border-slate-100"
                >
                  <span className="font-semibold text-slate-700">
                    {recipe.name}
                  </span>
                  <button
                    onClick={() => handleAddToHand(recipe)}
                    className="px-3 py-1 text-sm font-semibold bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Add to Hand
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default MealPlannerForm;
