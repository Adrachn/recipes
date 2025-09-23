import { getRecipeBySlug } from "@/lib/recipes";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

interface RecipePageProps {
  params: {
    slug: string;
  };
}

// Custom components for rendering Sanity's Portable Text
const ptComponents: PortableTextComponents = {
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-1 mt-2">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mt-2">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
};

const RecipePage = async ({ params }: RecipePageProps) => {
  const { slug } = params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    return notFound();
  }

  return (
    <div className="h-full text-slate-800 p-8 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-4">{recipe.name}</h1>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Ingredients</h2>
        <ul className="list-disc list-inside mb-4 space-y-1">
          {recipe.ingredients.map((ing) => (
            <li key={ing._key}>
              <span className="font-semibold">{ing.quantity}</span> {ing.name}
            </li>
          ))}
        </ul>
        <h3 className="text-lg font-semibold mb-2 text-primary">
          Instructions
        </h3>
        <div className="prose prose-slate max-w-none">
          <PortableText value={recipe.instructions} components={ptComponents} />
        </div>
      </div>
    </div>
  );
};

export default RecipePage;
