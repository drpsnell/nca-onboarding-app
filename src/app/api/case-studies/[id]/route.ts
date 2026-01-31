import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const casesDir = path.join(process.cwd(), "src/data/case-studies");
    const indexRaw = fs.readFileSync(path.join(casesDir, "index.json"), "utf-8");
    const index = JSON.parse(indexRaw);

    const entry = index.cases.find((c: { id: string }) => c.id === id);
    if (!entry) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const caseRaw = fs.readFileSync(path.join(casesDir, entry.file), "utf-8");
    const caseData = JSON.parse(caseRaw);

    return NextResponse.json(caseData);
  } catch (error) {
    console.error("Error loading case study:", error);
    return NextResponse.json({ error: "Failed to load case" }, { status: 500 });
  }
}
