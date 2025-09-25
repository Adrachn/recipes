import { Recipe } from "@/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { urlFor } from "@/sanity/lib/image";
import { X } from "lucide-react";

interface CalendarRecipeCardProps {
  recipe: Recipe;
  isSelectionMode?: boolean;
  onDelete?: () => void;
}

const getCardCategoryStyle = (tags: string[]) => {
  if (tags.includes("vegan")) return "bg-vegan-gradient";
  if (tags.includes("vegetarian")) return "bg-vegetarian-gradient";
  if (tags.includes("chicken")) return "bg-chicken-gradient";
  if (tags.includes("fish")) return "bg-fish-gradient";
  if (tags.includes("red-meat")) return "bg-red-meat-gradient";
  return "bg-base-200";
};

const CalendarRecipeCard: React.FC<CalendarRecipeCardProps> = ({
  recipe,
  isSelectionMode,
  onDelete,
}) => {
  const difficultyGradients = {
    bronze: "from-bronze-light via-bronze to-bronze-dark",
    silver: "from-silver-light via-silver to-silver-dark",
    gold: "from-gold-light via-gold to-gold-dark",
  };

  return (
    <div className="relative h-full w-full">
      <Link
        href={`/recipes/${recipe.slug.current}`}
        className="block h-full w-full"
        onClick={(e) => {
          if (isSelectionMode) {
            e.preventDefault();
          }
        }}
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
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete();
          }}
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-transform transform hover:scale-110"
          aria-label="Delete recipe"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default CalendarRecipeCard;
