import Link from "next/link";
import { Leaf, Drumstick, Fish, Beef, Flame } from "lucide-react";
import type { RecipePack } from "@/types";
import { PackRecipeCard } from "./PackRecipeCard";

// This is a temporary type until we fetch from Sanity
type TempRecipePack = {
  name: string;
  slug: {
    current: string;
  };
  description?: string;
  tags?: string[];
};

type RecipePackProps = {
  pack: TempRecipePack;
};

// Map tag strings to Lucide icons
const tagIconMap: { [key: string]: React.ElementType } = {
  vegan: Leaf,
  vegetarian: Leaf,
  chicken: Drumstick,
  fish: Fish,
  "red-meat": Beef,
  spicy: Flame,
};

const TagIcon = ({ tag }: { tag: string }) => {
  const Icon = tagIconMap[tag.toLowerCase()];
  if (!Icon) return null;
  return <Icon className="w-5 h-5" />;
};

// The card stack should be standing up (portrait orientation)
const CardStack = () => (
  <div className="relative w-52 h-72">
    {/* Base card */}
    <div className="absolute w-full h-full bg-slate-200 border-2 border-slate-300 rounded-lg shadow-md transform rotate-[6deg]" />
    {/* Middle card */}
    <div className="absolute w-full h-full bg-white border-2 border-slate-300 rounded-lg shadow-lg transform rotate-[2deg]" />
    {/* Top card - now the actual PackRecipeCard */}
    <div className="absolute w-full h-full transform -rotate-[3deg]">
      <PackRecipeCard />
    </div>
  </div>
);

export function RecipePack({ pack }: RecipePackProps) {
  // Dummy data for design purposes
  const displayPack = {
    name: pack.name || "Starter Pack",
    slug: { current: pack.slug?.current || "starter-pack" },
    description:
      pack.description ||
      "A few simple recipes to get you started on your culinary journey.",
    tags: pack.tags || ["vegan", "chicken", "red-meat", "spicy"],
  };

  return (
    <Link
      href={`/decks/${displayPack.slug.current}`}
      className="group block w-[320px] h-[480px] transition-transform duration-300 ease-in-out hover:-translate-y-2"
    >
      <div className="relative w-full h-full p-5 bg-gradient-to-br from-green-600 to-green-800 text-white rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between">
        <div className="text-center h-16 flex items-center justify-center">
          <h2 className="text-3xl font-bold tracking-wider uppercase">
            {displayPack.name}
          </h2>
        </div>

        {/* Window with new card stack */}
        <div className="flex-grow my-4 flex items-center justify-center">
          <CardStack />
        </div>

        <div className="text-center">
          <p className="text-sm text-green-200 mb-3">
            {displayPack.description}
          </p>
          <div className="flex items-center justify-center gap-3">
            {displayPack.tags.map((tag) => (
              <div
                key={tag}
                className="bg-black/20 p-2 rounded-full border-2 border-white/50"
                title={tag}
              >
                <TagIcon tag={tag} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
