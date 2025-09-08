import { getRecipeBySlug } from "@/lib/recipes";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

interface RecipePageProps {
  params: {
    slug: string;
  };
}

const RecipePage = async ({ params }: RecipePageProps) => {
  const { slug } = params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    return notFound();
  }

  return (
    <div className="h-full text-content-on-light">
      <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Ingredients</h2>
        <ul className="list-disc list-inside mb-4 space-y-1">
          {recipe.ingredients.map((ing) => (
            <li key={ing.name}>
              <span className="font-semibold">{ing.amount}</span> {ing.name}
            </li>
          ))}
        </ul>
        <h3 className="text-lg font-semibold mb-2 text-primary">
          Instructions
        </h3>
        <ol className="list-decimal list-inside space-y-2">
          {recipe.instructions.map((inst, index) => (
            <li key={index}>{inst}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RecipePage;
