import { Recipe } from "@/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Timer } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";

interface RecipeCardProps {
  recipe: Recipe;
}

const getCardCategoryStyle = (tags: string[]) => {
  if (tags.includes("vegan")) return "bg-vegan-gradient";
  if (tags.includes("vegetarian")) return "bg-vegetarian-gradient";
  if (tags.includes("chicken")) return "bg-chicken-gradient";
  if (tags.includes("fish")) return "bg-fish-gradient";
  if (tags.includes("red-meat")) return "bg-red-meat-gradient";
  return "bg-base-200";
};

const getDifficultyGradient = (difficulty: "bronze" | "silver" | "gold") => {
  const gradients = {
    bronze: "from-bronze-light via-bronze to-bronze-dark",
    silver: "from-silver-light via-silver to-silver-dark",
    gold: "from-gold-light via-gold to-gold-dark",
  };
  return gradients[difficulty] || "";
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const prep = recipe.prepTime || 0;
  const cook = recipe.cookTime || 0;
  const totalTime = prep + cook;

  // Ensure recipe.image has a value before calling urlFor
  const imageUrl =
    recipe.image && recipe.image.asset
      ? urlFor(recipe.image).height(300).width(300).url()
      : "/images/placeholder.png"; // Fallback image

  return (
    <Link
      href={`/recipes/${recipe.slug.current}`}
      className="block h-full transition-all duration-300 ease-in-out hover:-translate-y-2"
    >
      {/* Metallic Border */}
      <div
        className={`w-full h-full rounded-xl p-4 bg-gradient-to-br shadow-xl ${getDifficultyGradient(
          recipe.difficulty
        )}`}
      >
        {/* Inner Card */}
        <div
          className={`w-full h-full rounded-md p-2.5 flex flex-col gap-2.5 ${getCardCategoryStyle(
            recipe.tags
          )}`}
        >
          {/* Image */}
          <figure className="relative w-full h-48 overflow-hidden rounded-t-md">
            <Image
              src={imageUrl}
              alt={recipe.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </figure>
          {/* Text Area */}
          <figcaption className="p-4 flex flex-col justify-between flex-grow bg-[#FDFBF4] rounded-b-md">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {recipe.name}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{recipe.summary}</p>
            </div>
            <div className="mt-4 flex justify-between items-center">
              {totalTime > 0 && (
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600">
                    {totalTime} min
                  </span>
                </div>
              )}
            </div>
          </figcaption>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
