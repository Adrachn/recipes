"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CardBoxIcon, CardStackIcon } from "./Icons";

const Header = () => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="fixed top-0 left-0 w-full p-4 z-10">
      <nav className="container mx-auto flex items-center justify-end space-x-4">
        <Link href="/" title="My Decks">
          <CardBoxIcon
            className={`w-8 h-8 transition-colors ${
              isActive("/") ? "text-primary" : "text-content-on-light"
            } hover:text-primary`}
          />
        </Link>
        <Link href="/recipes" title="All Cards">
          <CardStackIcon
            className={`w-8 h-8 transition-colors ${
              isActive("/recipes") ? "text-primary" : "text-content-on-light"
            } hover:text-primary`}
          />
        </Link>
      </nav>
    </header>
  );
};

export default Header;
