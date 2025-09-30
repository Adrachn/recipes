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

// Map category strings to icons
const categoryIconMap: Record<string, React.FC<LucideProps>> = {
  vegan: Carrot,
  vegetarian: Leaf,
  chicken: Drumstick,
  fish: Fish,
  "red-meat": Beef,
};

const CategoryIcon = ({ category }: { category: string }) => {
  if (!category) return null;
  const Icon = categoryIconMap[category.toLowerCase()];
  if (!Icon) return null;
  return <Icon className="w-5 h-5" />;
};

const CardStack = () => (
  <div className="relative w-44 h-58">
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
      className="group block w-[380px] h-[520px] [perspective:1000px]"
    >
      <div
        className="relative w-full h-full p-16 text-white rounded-lg transition-all duration-300 flex flex-col justify-between bg-cover bg-center group-hover:-translate-y-4"
        style={{
          backgroundImage: "url('/images/green-pack.png')",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="w-full h-full flex flex-col justify-center"
          style={{
            transformStyle: "preserve-3d",
            transform:
              "rotateY(20deg) rotateX(-15deg) rotateZ(-8deg) translateZ(80px)",
          }}
        >
          <div className="relative text-center pt-2 w-full px-3">
            <h2 className="text-xl font-bold tracking-wider uppercase ">
              {pack.name}
            </h2>
          </div>

          {/* Window with new card stack */}
          <div className="flex-grow flex items-center justify-center">
            <CardStack />
          </div>

          <div className="relative text-center w-full  px-2">
            <p className="text-xs text-green-100 mb-2">{pack.description}</p>
            <div className="flex items-center justify-center gap-2 pb-3">
              {packCategories.map((category) => (
                <div
                  key={category}
                  className="bg-black/20 p-1.5 rounded-full border border-white/30"
                  title={category}
                >
                  <CategoryIcon category={category} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
