import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const CLERK_API_BASE = "https://api.clerk.com/v1";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const { targetUserId } = await req.json();

    if (!userId || !process.env.CLERK_SECRET_KEY) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the user's metadata to set them as admin
    const response = await fetch(`${CLERK_API_BASE}/users/${targetUserId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_metadata: {
          role: "admin"
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Failed to set admin role:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Failed to set admin role: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Successfully set admin role:", result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in set-admin route:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error",
      { status: 500 }
    );
  }
} 