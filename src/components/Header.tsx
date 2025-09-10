"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, Layers, CalendarPlus } from "lucide-react";

const Header = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 left-0 w-full p-4 z-10">
      <nav className="container mx-auto flex items-center justify-end space-x-4">
        <Link href="/meal-planner" title="Meal Planner">
          <CalendarPlus
            className={`w-10 h-10 transition-colors ${
              isActive("/meal-planner")
                ? "text-primary"
                : "text-content-on-light"
            } hover:text-primary`}
          />
        </Link>
        <Link href="/" title="My Decks">
          <Archive
            className={`w-10 h-10 transition-colors ${
              isActive("/") ? "text-primary" : "text-content-on-light"
            } hover:text-primary`}
          />
        </Link>
        <Link href="/recipes" title="All Cards">
          <Layers
            className={`w-12 h-12 transition-colors ${
              isActive("/recipes") ? "text-primary" : "text-content-on-light"
            } hover:text-primary`}
          />
        </Link>
      </nav>
    </header>
  );
};

export default Header;
