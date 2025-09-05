import { Recipe } from "@/types";
import React from "react";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const difficultyGradients = {
    Easy: "from-bronze-light via-bronze to-bronze-dark",
    Medium: "from-silver-light via-silver to-silver-dark",
    Hard: "from-gold-light via-gold to-gold-dark",
  };

  return (
    <div
      className={`rounded-lg p-2 bg-gradient-to-br ${
        difficultyGradients[recipe.difficulty]
      }`}
    >
      <div className="bg-base-200 rounded-md h-full">
        {/* Image will go here */}
        <div className="p-4">
          <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
          <p className="text-base-content-secondary text-sm">
            {recipe.summary}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
