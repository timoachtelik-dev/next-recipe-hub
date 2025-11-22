import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NewRecipeClient from "./client";

export default async function NewRecipePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/recipes/new");
  }

  return <NewRecipeClient />;
}
