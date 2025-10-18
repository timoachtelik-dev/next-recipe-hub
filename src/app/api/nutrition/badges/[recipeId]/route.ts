/**
 * Nutrition Badges API Endpoint
 * GET /api/nutrition/badges/[recipeId] - Get nutrition badges for a recipe
 */

import { NextRequest, NextResponse } from "next/server";
import { getRecipeNutritionBadges } from "@/server/nutrition";

export async function GET(
  request: NextRequest,
  { params }: { params: { recipeId: string } }
) {
  try {
    const badges = await getRecipeNutritionBadges(params.recipeId);

    return NextResponse.json(badges);
  } catch (error) {
    console.error("Error fetching nutrition badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition badges" },
      { status: 500 }
    );
  }
}

