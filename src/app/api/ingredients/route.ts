import { NextRequest, NextResponse } from "next/server";
import { searchIngredients } from "@/server/ingredients";
import { ingredientAutocompleteSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    
    // If no query provided, return all ingredients (for dropdown)
    if (!query) {
      const ingredients = await searchIngredients("");
      return NextResponse.json(ingredients);
    }
    
    const validatedParams = ingredientAutocompleteSchema.parse({ q: query });
    const ingredients = await searchIngredients(validatedParams.q);

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("Error searching ingredients:", error);
    return NextResponse.json(
      { error: "Failed to search ingredients" },
      { status: 500 }
    );
  }
}
