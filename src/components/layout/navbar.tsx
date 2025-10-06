"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { NavbarSearch } from "@/components/search/navbar-search";
import { ShoppingCart } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const homeLink = session ? "/dashboard" : "/";

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href={homeLink} className="text-2xl font-bold text-orange-600">
            next-recipe-hub
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <NavbarSearch />
          </div>

          {/* Auth */}
          <div className="flex items-center gap-4">
            {/* Navigation Links */}
            {session && (
              <nav className="flex items-center gap-2">
                <Link href="/recipes">
                  <Button variant="ghost" size="sm">
                    Recipes
                  </Button>
                </Link>
                <Link href="/lists">
                  <Button variant="ghost" size="sm">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Lists
                  </Button>
                </Link>
              </nav>
            )}
            {status === "loading" ? (
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {session.user?.name || session.user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={() => signOut()}>
                  Sign out
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => signIn()}>
                Sign in
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
