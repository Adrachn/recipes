import { RecipePack } from "@/types";
import Link from "next/link";
import { Archive } from "lucide-react";

interface RecipePackCardProps {
  pack: RecipePack;
}

const RecipePackCard: React.FC<RecipePackCardProps> = ({ pack }) => {
  return (
    <Link
      href={`/decks/${pack.slug}`}
      className="block bg-base-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow aspect-[3/4] w-64 p-4 flex flex-col justify-between"
    >
      <div className="text-center">
        <Archive className="w-24 h-24 mx-auto text-primary" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-content-on-dark">{pack.name}</h3>
        <p className="text-sm text-content-on-dark-secondary">
          {pack.description}
        </p>
      </div>
    </Link>
  );
};

export default RecipePackCard;
