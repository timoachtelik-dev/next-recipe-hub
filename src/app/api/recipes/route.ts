import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createRecipe, searchRecipes } from "@/server/recipes";
import { createRecipeSchema, recipeSearchSchema } from "@/lib/validators";
import { LimitError } from "@/lib/limits";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      q: searchParams.get("q") || undefined,
      tags: searchParams.get("tags")?.split(",").filter(Boolean),
      diet: searchParams.get("diet") || undefined,
      maxTime: searchParams.get("maxTime") ? Number(searchParams.get("maxTime")) : undefined,
      minServings: searchParams.get("minServings") ? Number(searchParams.get("minServings")) : undefined,
      maxServings: searchParams.get("maxServings") ? Number(searchParams.get("maxServings")) : undefined,
      maxCalories: searchParams.get("maxCalories") ? Number(searchParams.get("maxCalories")) : undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 12,
    };

    const validatedParams = recipeSearchSchema.parse(params);
    const result = await searchRecipes(validatedParams);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error searching recipes:", error);
    return NextResponse.json(
      { error: "Failed to search recipes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createRecipeSchema.parse(body);
    
    const recipe = await createRecipe(validatedData, session.user.id);

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    if (error instanceof LimitError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Failed to create recipe" },
      { status: 500 }
    );
  }
}
