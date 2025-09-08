import { getRecipeBySlug } from "@/lib/recipes";
import { notFound } from "next/navigation";
import { Modal } from "@/components/Modal";
import RecipePage from "@/app/recipes/[slug]/page";
import FlippableCard from "@/components/FlippableCard";

export default async function RecipeModal({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  return (
    <Modal>
      <FlippableCard recipe={recipe} back={<RecipePage params={{ slug }} />} />
    </Modal>
  );
}
