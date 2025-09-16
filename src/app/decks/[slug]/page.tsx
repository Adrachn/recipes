import RecipeCard from "@/components/RecipeCard";
import { getRecipePackBySlug } from "@/lib/recipes";
import { notFound } from "next/navigation";

type DeckPageProps = {
  params: {
    slug: string;
  };
};

export default async function DeckPage({ params }: DeckPageProps) {
  const { slug } = params;
  const pack = await getRecipePackBySlug(slug);

  if (!pack) {
    notFound();
  }

  return (
    <main className="container mx-auto p-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">{pack.name}</h1>
        <p className="text-lg text-content-on-light-secondary">
          {pack.description}
        </p>
      </header>

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
    </main>
  );
}
