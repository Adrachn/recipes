import Link from "next/link";
import {
  Leaf,
  Drumstick,
  Fish,
  Beef,
  Carrot,
  type LucideProps,
} from "lucide-react";
import type { RecipePack as RecipePackType } from "@/types";
import { PackRecipeCard } from "./PackRecipeCard";

type RecipePackProps = {
  pack: RecipePackType;
};

// Map category strings to Lucide icons
const categoryIconMap: Record<string, React.FC<LucideProps>> = {
  vegan: Carrot, // New icon for vegan
  vegetarian: Leaf,
  chicken: Drumstick,
  fish: Fish,
  "red-meat": Beef,
};

const CategoryIcon = ({ category }: { category: string }) => {
  if (!category) return null; // Prevent crash if category is null or undefined
  const Icon = categoryIconMap[category.toLowerCase()];
  if (!Icon) return null;
  return <Icon className="w-5 h-5" />;
};

// The card stack should be standing up (portrait orientation)
const CardStack = () => (
  <div className="relative w-52 h-72">
    {/* Base card */}
    <div className="absolute w-full h-full bg-slate-200 border-2 border-slate-300 rounded-lg shadow-md transform rotate-[6deg]" />
    {/* Middle card */}
    <div className="absolute w-full h-full bg-white border-2 border-slate-300 rounded-lg shadow-lg transform rotate-[2deg]" />
    {/* Top card - now the actual PackRecipeCard */}
    <div className="absolute w-full h-full transform -rotate-[3deg]">
      <PackRecipeCard />
    </div>
  </div>
);

export function RecipePack({ pack }: RecipePackProps) {
  // Get unique categories from all recipes in the pack
  const packCategories = Array.from(
    new Set(pack.recipes.flatMap((recipe) => recipe.categories))
  );

  return (
    <Link
      href={`/decks/${pack.slug.current}`}
      className="group block w-[320px] h-[480px] transition-transform duration-300 ease-in-out hover:-translate-y-2"
    >
      <div className="relative w-full h-full p-5 bg-gradient-to-br from-green-600 to-green-800 text-white rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between">
        <div className="text-center h-16 flex items-center justify-center">
          <h2 className="text-3xl font-bold tracking-wider uppercase">
            {pack.name}
          </h2>
        </div>

        {/* Window with new card stack */}
        <div className="flex-grow my-4 flex items-center justify-center">
          <CardStack />
        </div>

        <div className="text-center">
          <p className="text-sm text-green-200 mb-3">{pack.description}</p>
          <div className="flex items-center justify-center gap-3">
            {packCategories.map((category) => (
              <div
                key={category}
                className="bg-black/20 p-2 rounded-full border-2 border-white/50"
                title={category}
              >
                <CategoryIcon category={category} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
