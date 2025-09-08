import { RecipePack } from "@/types";
import Link from "next/link";
import { CardBoxIcon } from "./Icons";

interface RecipePackCardProps {
  pack: RecipePack;
}

const RecipePackCard: React.FC<RecipePackCardProps> = ({ pack }) => {
  return (
    <Link
      href={`/decks/${pack.slug}`}
      className="block rounded-lg bg-base-200 aspect-[3/4] w-64 shadow-lg hover:shadow-xl transition-shadow group"
    >
      <div className="flex flex-col h-full">
        <div className="bg-base-100 flex-grow flex items-center justify-center rounded-t-lg">
          {/* Placeholder for pack art */}
          <CardBoxIcon className="w-24 h-24 text-content-on-dark-secondary" />
        </div>
        <div className="p-4 border-t-2 border-primary">
          <h2 className="text-xl font-bold text-content-on-dark truncate">
            {pack.name}
          </h2>
          <p className="text-sm text-content-on-dark-secondary">
            {pack.description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default RecipePackCard;
