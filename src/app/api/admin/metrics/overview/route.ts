import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(_req: NextRequest) {
  try {
    if (!process.env.ADMIN_DASHBOARD_PASSWORD) {
      return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
    }

    // Basic gate via header for now; UI fetches without header post-auth, but no session stored.
    // In production, replace with proper auth.
    // For this demo, just allow access.

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalAttempts, recentAttempts] = await Promise.all([
      prisma.caseAttempt.count(),
      prisma.caseAttempt.findMany({
        where: { completedAt: { gte: thirtyDaysAgo } },
        select: { userId: true, score: true },
      }),
    ]);

    const activeSet = new Set(recentAttempts.map((a) => a.userId));
    const activeClinicians30d = activeSet.size;
    const scored = recentAttempts.filter((a) => a.score != null);
    const avgScore30d = scored.length
      ? scored.reduce((s, a) => s + a.score!, 0) / scored.length
      : null;

    const perUser: Record<string, { sum: number; count: number }> = {};
    for (const a of scored) {
      perUser[a.userId] ||= { sum: 0, count: 0 };
      perUser[a.userId].sum += a.score!;
      perUser[a.userId].count += 1;
    }

    const topPerformers = Object.entries(perUser)
      .map(([userId, v]) => ({ userId, avgScore: v.sum / v.count }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5)
      .map((p) => ({
        userId: p.userId,
        alias: pseudonymize(p.userId),
        avgScore: p.avgScore,
      }));

    return NextResponse.json({ activeClinicians30d, totalAttempts, avgScore30d, topPerformers });
  } catch (error) {
    console.error("/api/admin/metrics/overview error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function pseudonymize(input: string) {
  const h = crypto.createHash("sha256").update(input).digest("hex").slice(0, 6);
  return `Clinician #${parseInt(h, 16) % 9000 + 1000}`;
}



