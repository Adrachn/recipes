import fs from "fs/promises";
import path from "path";
import { RecipePack } from "@/types";
import RecipeCard from "@/components/RecipeCard";

async function getRecipePack(): Promise<RecipePack> {
  const filePath = path.join(
    process.cwd(),
    "src",
    "data",
    "indian-recipes.json"
  );
  const jsonData = await fs.readFile(filePath, "utf-8");
  const objectData = JSON.parse(jsonData);
  return objectData;
}

export default async function Home() {
  const recipePack = await getRecipePack();

  return (
    <main className="container mx-auto p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">{recipePack.name}</h1>
        <p className="text-lg text-zinc-400">{recipePack.description}</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {recipePack.recipes.map((recipe) => (
          <RecipeCard key={recipe.slug} recipe={recipe} />
        ))}
      </section>
    </main>
  );
}
