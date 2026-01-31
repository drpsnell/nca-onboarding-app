import { NextRequest, NextResponse } from "next/server";
import { fetchDropboxSharedFolder } from "@/lib/fetchDropbox";
import { resetVectorStoreCache } from "@/lib/rag/vectorStore";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sharedLink: string = body.sharedLink || process.env.NCA_DROPBOX_LINK || "";
    if (!sharedLink) {
      return NextResponse.json({ error: "missing sharedLink" }, { status: 400 });
    }

    const destDir = path.join(process.cwd(), "src", "data", "docs", "nca");
    await fetchDropboxSharedFolder(sharedLink, destDir);
    resetVectorStoreCache();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("/api/rag/fetch error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



