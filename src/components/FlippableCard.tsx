"use client";

import RecipeCard from "@/components/RecipeCard";
import { Recipe } from "@/types";
import { useState, useEffect } from "react";

const getDifficultyGradients = (recipe: Recipe) => {
  const difficultyGradients = {
    Easy: "from-bronze-light via-bronze to-bronze-dark",
    Medium: "from-silver-light via-silver to-silver-dark",
    Hard: "from-gold-light via-gold to-gold-dark",
  };
  return difficultyGradients[recipe.difficulty];
};

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
          <div
            className={`rounded-lg p-2.5 bg-gradient-to-br h-full ${getDifficultyGradients(
              recipe
            )}`}
          >
            <div
              className={`rounded-md p-4 h-full overflow-y-auto ${getCardCategoryStyle(
                recipe.tags
              )}`}
            >
              {back}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
