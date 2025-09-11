import { Recipe } from "@/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Timer } from "lucide-react";

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

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const difficultyGradients = {
    Easy: "from-bronze-light via-bronze to-bronze-dark",
    Medium: "from-silver-light via-silver to-silver-dark",
    Hard: "from-gold-light via-gold to-gold-dark",
  };

  const prep = parseInt(recipe.prepTime);
  const cook = parseInt(recipe.cookTime);
  const totalTime = (isNaN(prep) ? 0 : prep) + (isNaN(cook) ? 0 : cook);

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="block h-full transition-all duration-300 ease-in-out hover:-translate-y-2"
    >
      <div
        className={`rounded-lg p-2.5 bg-gradient-to-br h-full shadow-xl hover:shadow-2xl transition-shadow ${
          difficultyGradients[recipe.difficulty]
        }`}
      >
        <div
          className={`rounded-md p-2.5 h-full text-content-on-dark flex flex-col gap-2.5 ${getCardCategoryStyle(
            recipe.tags
          )}`}
        >
          <figure className="relative w-full h-48 overflow-hidden rounded-t-md">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </figure>
          <figcaption className="p-4 flex flex-col justify-between flex-grow bg-[#FDFBF4] rounded-b-md">
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                {recipe.title}
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
