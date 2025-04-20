import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const CLERK_API_BASE = "https://api.clerk.com/v1";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const { targetUserId } = await req.json();

    console.log("Request to ban user:", { adminUserId: userId, targetUserId });

    // Check if the requester is authenticated
    if (!userId || !process.env.CLERK_SECRET_KEY) {
      console.log("Unauthorized: No userId found or missing CLERK_SECRET_KEY");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get fresh user data to check admin status
    const adminCheckResponse = await fetch(`${CLERK_API_BASE}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!adminCheckResponse.ok) {
      const errorData = await adminCheckResponse.text();
      console.error("Failed to fetch admin user data:", {
        status: adminCheckResponse.status,
        statusText: adminCheckResponse.statusText,
        error: errorData
      });
      throw new Error(`Failed to fetch admin user data: ${adminCheckResponse.statusText}`);
    }

    const adminUser = await adminCheckResponse.json();
    console.log("Fresh admin check:", { 
      hasRole: !!adminUser.public_metadata?.role, 
      role: adminUser.public_metadata?.role 
    });

    if (!adminUser.public_metadata?.role || adminUser.public_metadata.role !== "admin") {
      console.log("Forbidden: User is not an admin");
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Ban the user using Clerk's API
    const banResponse = await fetch(`${CLERK_API_BASE}/users/${targetUserId}/ban`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!banResponse.ok) {
      const errorData = await banResponse.text();
      console.error("Failed to ban user:", {
        status: banResponse.status,
        statusText: banResponse.statusText,
        error: errorData
      });
      throw new Error(`Failed to ban user: ${banResponse.statusText}`);
    }

    const result = await banResponse.json();
    console.log("Successfully banned user:", result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in ban-user route:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal Error",
      { status: 500 }
    );
  }
} 