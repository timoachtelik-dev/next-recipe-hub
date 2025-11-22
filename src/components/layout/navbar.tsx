"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { NavbarSearch } from "@/components/search/navbar-search";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ShoppingCart } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const homeLink = session ? "/dashboard" : "/";

  return (
    <header className="bg-baby-powder dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border transition-colors">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href={homeLink} className="text-2xl font-bold text-orange-600 dark:text-dark-orange-500">
            next-recipe-hub
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <NavbarSearch />
          </div>

          {/* Auth and Theme Toggle */}
          <div className="flex items-center gap-4">
            {/* Navigation Links */}
            {session && (
              <nav className="flex items-center gap-2">
                <Link href="/recipes">
                  <Button variant="link" size="sm">
                    Recipes
                  </Button>
                </Link>
                <Link href="/lists">
                  <Button variant="link" size="sm">
                    <ShoppingCart className="size-4 mr-1" />
                    Lists
                  </Button>
                </Link>
              </nav>
            )}
            {status === "loading" ? (
              <div className="w-20 h-8 bg-gray-200 dark:bg-dark-gray-200 rounded animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-dark-gray-500">
                  {session.user?.name || session.user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign out
                </Button>
              </div>
            ) : (
              <Button variant="primary" size="sm" onClick={() => signIn()}>
                Sign in
              </Button>
            )}
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
