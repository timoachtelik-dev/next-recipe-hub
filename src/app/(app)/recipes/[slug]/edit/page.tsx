import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import EditRecipeClient from "./client";

interface EditRecipePageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/recipes/${slug}/edit`);
  }

  return <EditRecipeClient slug={slug} />;
}
