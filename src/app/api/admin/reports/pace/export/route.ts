import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: CSV export for FCLB submission
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    const completions = await prisma.cECompletion.findMany({
      where: Object.keys(dateFilter).length > 0 ? { completedAt: dateFilter } : {},
      orderBy: { completedAt: "desc" },
      include: {
        user: { select: { email: true, licenseNumber: true, licenseState: true, licenseType: true } },
      },
    });

    // Build CSV
    const headers = [
      "Certificate Number",
      "Participant Name",
      "Email",
      "License Type",
      "License Number",
      "License State",
      "Course Title",
      "Credit Hours",
      "Completion Date",
      "Duration (Minutes)",
      "Case Version",
    ];

    const rows = completions.map((c) => [
      c.certificateNumber,
      c.userName,
      c.user.email,
      c.user.licenseType || "",
      c.user.licenseNumber || "",
      c.user.licenseState || "",
      c.courseTitle,
      c.creditHours.toString(),
      c.completedAt.toISOString().slice(0, 10),
      c.durationMinutes.toString(),
      c.caseVersion,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="pace-report-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting PACE CSV:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
