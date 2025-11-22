import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRecipe, getRecipeBySlug, updateRecipe, deleteRecipe } from "@/server/recipes";
import { updateRecipeSchema } from "@/lib/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Try to fetch by slug first (slugs contain hyphens), then by ID
    // CUIDs start with 'c' and are alphanumeric, while slugs are hyphenated words
    let recipe;
    if (id.includes('-') && id.split('-').length > 2) {
      // Likely a slug (e.g., "red-red-red-4923")
      recipe = await getRecipeBySlug(id);
    } else {
      // Likely a CUID (e.g., "clrxxx...")
      recipe = await getRecipe(id);
    }

    // If still not found, try the other method as fallback
    if (!recipe) {
      recipe = id.includes('-') ? await getRecipe(id) : await getRecipeBySlug(id);
    }

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized - Please sign in to edit recipes" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the recipe to check ownership
    let recipe;
    if (id.includes('-') && id.split('-').length > 2) {
      recipe = await getRecipeBySlug(id);
    } else {
      recipe = await getRecipe(id);
    }

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Check if the user is the recipe author
    if (recipe.authorId !== session.user.id) {
      return NextResponse.json(
        { error: `You don't have permission to edit this recipe. This recipe was created by ${recipe.author.name || recipe.author.email}.` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateRecipeSchema.parse(body);

    const updatedRecipe = await updateRecipe(recipe.id, validatedData);

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { error: "Failed to update recipe" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized - Please sign in to delete recipes" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the recipe to check ownership
    let recipe;
    if (id.includes('-') && id.split('-').length > 2) {
      recipe = await getRecipeBySlug(id);
    } else {
      recipe = await getRecipe(id);
    }

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Check if the user is the recipe author
    if (recipe.authorId !== session.user.id) {
      return NextResponse.json(
        { error: `You don't have permission to delete this recipe. This recipe was created by ${recipe.author.name || recipe.author.email}.` },
        { status: 403 }
      );
    }

    await deleteRecipe(recipe.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe" },
      { status: 500 }
    );
  }
}
