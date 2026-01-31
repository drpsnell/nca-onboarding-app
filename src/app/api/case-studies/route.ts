import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const casesDir = path.join(process.cwd(), "src/data/case-studies");
    const indexPath = path.join(casesDir, "index.json");
    const raw = fs.readFileSync(indexPath, "utf-8");
    const index = JSON.parse(raw);

    return NextResponse.json(index);
  } catch (error) {
    console.error("Error loading case studies index:", error);
    return NextResponse.json({ cases: [] });
  }
}
