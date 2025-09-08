import RecipePackCard from "@/components/RecipePackCard";
import { getAllRecipePacks } from "@/lib/recipes";

export default async function Home() {
  const recipePacks = await getAllRecipePacks();

  return (
    <main className="container mx-auto p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold mb-2 tracking-tight">
          Your Recipe Decks
        </h1>
        <p className="text-lg text-content-on-light-secondary">
          Select a deck to view the recipes inside.
        </p>
      </header>
      <section className="flex flex-wrap gap-8 ">
        {recipePacks.map((pack) => (
          <RecipePackCard key={pack.slug} pack={pack} />
        ))}
      </section>
    </main>
  );
}
