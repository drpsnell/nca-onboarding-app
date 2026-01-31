import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // eslint-disable-next-line @next/next/no-assign-module-variable
    const module = await prisma.module.findUnique({
      where: { slug },
    });

    if (!module || !module.contentPath) {
      return NextResponse.json({ content: "" });
    }

    const filePath = join(process.cwd(), "src/data/docs", module.contentPath);
    const content = await readFile(filePath, "utf-8");

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error reading module content:", error);
    return NextResponse.json({ content: "" });
  }
}
