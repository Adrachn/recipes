import fs from "fs/promises";
import path from "path";
import { RecipePack } from "@/types";

const dataDir = path.join(process.cwd(), "src", "data");

/**
 * Reads all JSON files from the data directory and returns them as an array of RecipePacks.
 */
export async function getAllRecipePacks(): Promise<RecipePack[]> {
  const filenames = await fs.readdir(dataDir);
  const jsonFiles = filenames.filter((f) => f.endsWith(".json"));

  const packs = await Promise.all(
    jsonFiles.map(async (filename) => {
      const filePath = path.join(dataDir, filename);
      const jsonData = await fs.readFile(filePath, "utf-8");
      return JSON.parse(jsonData) as RecipePack;
    })
  );
  return packs;
}

/**
 * Finds and returns a single recipe pack by its slug.
 * @param slug - The slug of the recipe pack to find.
 */
export async function getRecipePackBySlug(
  slug: string
): Promise<RecipePack | undefined> {
  const packs = await getAllRecipePacks();
  return packs.find((pack) => pack.slug === slug);
}

/**
 * Gets all recipes from all packs and flattens them into a single array.
 */
export async function getAllRecipes() {
  const packs = await getAllRecipePacks();
  return packs.flatMap((pack) =>
    pack.recipes.map((recipe) => ({ ...recipe, packSlug: pack.slug }))
  );
}

/**
 * Finds and returns a single recipe by its slug.
 * @param slug - The slug of the recipe to find.
 */
export async function getRecipeBySlug(slug: string) {
  const allRecipes = await getAllRecipes();
  return allRecipes.find((recipe) => recipe.slug === slug);
}
