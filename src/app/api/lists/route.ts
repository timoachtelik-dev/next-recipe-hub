import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createList, getUserLists } from "@/server/lists";
import { createListSchema } from "@/lib/validators";
import { LimitError } from "@/lib/limits";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lists = await getUserLists(session.user.id);
    return NextResponse.json(lists);
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch lists" },
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
    const validatedData = createListSchema.parse(body);
    
    const list = await createList(validatedData, session.user.id);

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    console.error("Error creating list:", error);
    if (error instanceof LimitError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}
