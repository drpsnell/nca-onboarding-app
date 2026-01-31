import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { Dropbox } from "dropbox";
// ZIP fallback disabled to avoid bundling S3 optional peer deps in unzipper

export async function fetchDropboxSharedFolder(sharedLink: string, destDir: string) {
  if (!sharedLink) throw new Error("Missing sharedLink");

  await fs.mkdir(destDir, { recursive: true });

  const token = process.env.DROPBOX_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Dropbox ingestion requires DROPBOX_ACCESS_TOKEN set in .env");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbx: any = new Dropbox({ accessToken: token, fetch });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = [];
  let cursor: string | undefined;
  do {
    if (!cursor) {
      const res = await dbx.sharingListSharedLinkFiles({ url: sharedLink });
      items.push(...(res.result.entries || []));
      cursor = res.result.cursor;
    } else {
      const res = await dbx.sharingListSharedLinkFilesContinue({ cursor });
      items.push(...(res.result.entries || []));
      cursor = res.result.cursor;
      if (!res.result.has_more) cursor = undefined;
    }
  } while (cursor);

  for (const entry of items) {
    if (entry[".tag"] === "file") {
      const filePathLower: string = entry.path_lower;
      const fileName = path.basename(filePathLower);
      const lower = fileName.toLowerCase();
      const supported = lower.endsWith(".txt") || lower.endsWith(".md") || lower.endsWith(".pdf") || lower.endsWith(".mp4");
      if (!supported) continue;
      const tmp = await dbx.filesGetTemporaryLink({ path: filePathLower });
      const url = tmp.result.link;
      const resp = await fetch(url);
      const arrayBuffer = await resp.arrayBuffer();
      await fs.writeFile(path.join(destDir, fileName), Buffer.from(arrayBuffer));
    }
  }
}

// ZIP fallback removed


