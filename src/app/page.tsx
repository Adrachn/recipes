import { RecipePack } from "@/components/RecipePack";
import { getAllRecipePacks } from "@/lib/recipes";
import Container from "@/components/Container";

export default async function Home() {
  const recipePacks = await getAllRecipePacks();

  return (
    <main>
      <Container className="py-8">
        <header className="col-span-12 text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-2 tracking-tight">
            Your Recipe Decks
          </h1>
          <p className="text-lg text-content-on-light-secondary">
            Select a deck to view the recipes inside.
          </p>
        </header>
        <section className="col-span-12 flex flex-wrap gap-8 justify-center">
          {recipePacks.map((pack) => (
            <RecipePack key={pack._id} pack={pack} />
          ))}
        </section>
      </Container>
    </main>
  );
}
