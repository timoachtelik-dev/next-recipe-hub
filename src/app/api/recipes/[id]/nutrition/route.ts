/**
 * Recipe Nutrition API Endpoints
 * GET /api/recipes/[id]/nutrition - Get nutrition breakdown
 * POST /api/recipes/[id]/nutrition - Calculate and save nutrition
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  calculateAndSaveRecipeNutrition,
  getNutritionBreakdown,
} from "@/server/nutrition";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const breakdown = await getNutritionBreakdown(params.id);

    if (!breakdown) {
      return NextResponse.json(
        { error: "Nutrition data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(breakdown);
  } catch (error) {
    console.error("Error fetching nutrition:", error);
    return NextResponse.json(
      { error: "Failed to fetch nutrition data" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify recipe exists and user owns it
    const recipe = await prisma.recipe.findUnique({
      where: { id: params.id },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (recipe.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Calculate and save nutrition
    const nutrition = await calculateAndSaveRecipeNutrition(params.id);

    if (!nutrition) {
      return NextResponse.json(
        { error: "Failed to calculate nutrition" },
        { status: 500 }
      );
    }

    return NextResponse.json(nutrition);
  } catch (error) {
    console.error("Error calculating nutrition:", error);
    return NextResponse.json(
      { error: "Failed to calculate nutrition" },
      { status: 500 }
    );
  }
}

