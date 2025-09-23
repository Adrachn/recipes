"use client";

import RecipeCard from "@/components/RecipeCard";
import { Recipe } from "@/types";
import { useState, useEffect } from "react";

const getDifficultyGradients = (recipe: Recipe) => {
  const difficultyGradients = {
    bronze: "from-bronze-light via-bronze to-bronze-dark",
    silver: "from-silver-light via-silver to-silver-dark",
    gold: "from-gold-light via-gold to-gold-dark",
  };
  return difficultyGradients[recipe.difficulty];
};

const getCardCategoryStyle = (categories: string[]) => {
  if (categories.includes("vegan")) return "bg-vegan-gradient";
  if (categories.includes("vegetarian")) return "bg-vegetarian-gradient";
  if (categories.includes("chicken")) return "bg-chicken-gradient";
  if (categories.includes("fish")) return "bg-fish-gradient";
  if (categories.includes("red-meat")) return "bg-red-meat-gradient";
  return "bg-base-200";
};

export default function FlippableCard({
  recipe,
  back,
}: {
  recipe: Recipe & { packSlug: string };
  back: React.ReactNode;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start the entrance animation
    setIsAnimating(true);
    // Then, trigger the flip
    const flipTimeout = setTimeout(() => setIsFlipped(true), 150);
    return () => clearTimeout(flipTimeout);
  }, []);

  return (
    <div
      className="[perspective:1000px] transition-all duration-500"
      style={{
        width: "var(--modal-card-width)",
        height: "var(--modal-card-height)",
        opacity: isAnimating ? 1 : 0,
        transform: `scale(${isAnimating ? 1 : 0.8})`,
      }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] origin-center ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* Front of the card */}
        <div className="absolute w-full h-full [backface-visibility:hidden]">
          <RecipeCard recipe={recipe} />
        </div>
        {/* Back of the card */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {/* Metallic Border */}
          <div
            className={`w-full h-full rounded-xl p-6 bg-gradient-to-br shadow-xl ${getDifficultyGradients(
              recipe
            )}`}
          >
            {/* Inner Card with Category Gradient */}
            <div
              className={`w-full h-full rounded-md p-2.5 flex flex-col gap-2.5 ${getCardCategoryStyle(
                recipe.categories
              )}`}
            >
              {/* Textbox */}
              <div className="w-full h-full bg-[#FDFBF4] rounded-md overflow-y-auto">
                {back}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
