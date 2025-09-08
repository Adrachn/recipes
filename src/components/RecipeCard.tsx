import { Recipe } from "@/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface RecipeCardProps {
  recipe: Recipe;
}

const getCardCategoryStyle = (tags: string[]) => {
  if (tags.includes("vegan"))
    return "bg-gradient-to-br from-[var(--color-card-vegan-start)] to-[var(--color-card-vegan-end)]";
  if (tags.includes("vegetarian"))
    return "bg-gradient-to-br from-[var(--color-card-vegetarian-start)] to-[var(--color-card-vegetarian-end)]";
  if (tags.includes("chicken"))
    return "bg-gradient-to-br from-[var(--color-card-chicken-start)] to-[var(--color-card-chicken-end)]";
  if (tags.includes("fish"))
    return "bg-gradient-to-br from-[var(--color-card-fish-start)] to-[var(--color-card-fish-end)]";
  if (tags.includes("meat"))
    return "bg-gradient-to-br from-[var(--color-card-meat-start)] to-[var(--color-card-meat-end)]";
  return "bg-base-200";
};

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const difficultyGradients = {
    Easy: "from-bronze-light via-bronze to-bronze-dark",
    Medium: "from-silver-light via-silver to-silver-dark",
    Hard: "from-gold-light via-gold to-gold-dark",
  };

  return (
    <Link href={`/recipes/${recipe.slug}`} className="block h-full">
      <div
        className={`rounded-lg p-2.5 bg-gradient-to-br h-full shadow-lg hover:shadow-xl transition-shadow ${
          difficultyGradients[recipe.difficulty]
        }`}
      >
        <div
          className={`rounded-md p-2.5 h-full text-content-on-dark flex flex-col ${getCardCategoryStyle(
            recipe.tags
          )}`}
        >
          <div className="relative w-full h-48">
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover rounded-t-md border-2 border-black"
            />
          </div>
          <div className="p-4 flex-grow">
            <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
            <p className="text-content-on-dark-secondary text-sm">
              {recipe.summary}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
