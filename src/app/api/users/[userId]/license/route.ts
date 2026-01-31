import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Update user license information
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { licenseType, licenseNumber, licenseState } = await request.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        licenseType: licenseType || null,
        licenseNumber: licenseNumber || null,
        licenseState: licenseState || null,
      },
      select: {
        id: true,
        licenseType: true,
        licenseNumber: true,
        licenseState: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating license:", error);
    return NextResponse.json(
      { error: "Failed to update license info" },
      { status: 500 }
    );
  }
}
