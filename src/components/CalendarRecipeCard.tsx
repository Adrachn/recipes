import { Recipe } from "@/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { urlFor } from "@/sanity/lib/image";

interface CalendarRecipeCardProps {
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

const CalendarRecipeCard: React.FC<CalendarRecipeCardProps> = ({ recipe }) => {
  const difficultyGradients = {
    bronze: "from-bronze-light via-bronze to-bronze-dark",
    silver: "from-silver-light via-silver to-silver-dark",
    gold: "from-gold-light via-gold to-gold-dark",
  };

  return (
    <Link
      href={`/recipes/${recipe.slug.current}`}
      className="block h-full w-full"
    >
      <div
        className={`rounded-lg p-1.5 bg-gradient-to-br h-full shadow-md ${
          difficultyGradients[recipe.difficulty]
        }`}
      >
        <div
          className={`rounded-md p-1.5 h-full text-content-on-dark flex flex-col gap-1.5 ${getCardCategoryStyle(
            recipe.categories
          )}`}
        >
          <figure className="relative w-full flex-grow overflow-hidden rounded-t-md">
            <Image
              src={
                recipe.image
                  ? urlFor(recipe.image).width(200).height(200).url()
                  : "/images/placeholder.png"
              }
              alt={recipe.name}
              fill
              className="object-cover"
              sizes="150px"
            />
          </figure>
          <figcaption className="p-2 bg-[#FDFBF4] rounded-b-md">
            <h3 className="text-sm font-bold text-slate-800 truncate">
              {recipe.name}
            </h3>
          </figcaption>
        </div>
      </div>
    </Link>
  );
};

export default CalendarRecipeCard;
