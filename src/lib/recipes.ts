import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { Recipe, RecipePack } from '@/types';

// Helper function to get all recipe data, expanding the references in packs
const getAllRecipesQuery = groq`*[_type == "recipe"]{
  _id,
  name,
  slug,
  image,
  summary,
  difficulty,
  prepTime,
  cookTime,
  tags,
  ingredients,
  instructions
}`;

export async function getAllRecipes(): Promise<Recipe[]> {
  return client.fetch(getAllRecipesQuery);
}

// Helper function to get a single recipe by its slug
export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const query = groq`*[_type == "recipe" && slug.current == $slug][0]{
    ...,
  }`;
  return client.fetch(query, { slug });
}

// Function to get all recipe packs, and for each pack, fetch the full recipe objects
const getAllRecipePacksQuery = groq`*[_type == "recipePack"]{
  _id,
  name,
  slug,
  description,
  tags,
  "recipes": recipes[]->{
    _id,
    name,
    slug,
    image,
    summary,
    difficulty,
    prepTime,
    cookTime,
    tags,
    ingredients,
    instructions
  }
}`;

export async function getAllRecipePacks(): Promise<RecipePack[]> {
  return client.fetch(getAllRecipePacksQuery);
}

// Function to get a single recipe pack by its slug
export async function getRecipePackBySlug(
  slug: string
): Promise<RecipePack | null> {
  const query = groq`*[_type == "recipePack" && slug.current == $slug][0]{
    ...,
    "recipes": recipes[]->{
      ...
    }
  }`;
  return client.fetch(query, { slug });
}
