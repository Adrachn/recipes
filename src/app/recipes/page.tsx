import RecipeCard from "@/components/RecipeCard";
import { getAllRecipePacks } from "@/lib/recipes";

export default async function Home() {
  const recipePacks = await getAllRecipePacks();

  return (
    <main className="container mx-auto p-8 space-y-16">
      {recipePacks.map((pack) => (
        <div key={pack.slug}>
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">{pack.name}</h1>
            <p className="text-lg text-content-on-light-secondary">
              {pack.description}
            </p>
          </header>

          <section className="flex flex-wrap gap-8 justify-center">
            {pack.recipes.map((recipe) => (
              <div
                key={recipe.slug}
                style={{
                  width: "var(--card-width)",
                  height: "var(--card-height)",
                }}
              >
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </section>
        </div>
      ))}
    </main>
  );
}
