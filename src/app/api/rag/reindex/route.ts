import { NextRequest, NextResponse } from "next/server";
import { resetVectorStoreCache } from "@/lib/rag/vectorStore";

export async function POST(_req: NextRequest) {
  resetVectorStoreCache();
  return NextResponse.json({ ok: true });
}



