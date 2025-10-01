import RecipeCard from "@/components/RecipeCard";
import { getAllRecipePacks } from "@/lib/recipes";

export default async function Home() {
  const recipePacks = await getAllRecipePacks();

  return (
    <main className="w-full p-8 space-y-16">
      {recipePacks.map((pack) => (
        <div key={pack._id} className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">{pack.name}</h2>
          <section className="flex flex-wrap gap-8 justify-center">
            {pack.recipes.map((recipe) => (
              <div
                key={recipe._id}
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
