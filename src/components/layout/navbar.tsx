"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="text-2xl font-bold text-orange-600">
            next-recipe-hub
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <form action="/" method="get" className="relative">
              <Input
                type="search"
                placeholder="Search recipes..."
                name="q"
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </form>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-4">
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
