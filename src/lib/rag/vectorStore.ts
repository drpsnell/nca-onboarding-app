import "server-only";

import { promises as fs } from "fs";
import path from "path";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
// PDF parsing will be done via dynamic import of pdfjs-dist to avoid bundling issues

let cachedVectorStore: MemoryVectorStore | null = null;

async function readAllSupportedFilesFromDirectory(directoryPath: string): Promise<Array<{ filePath: string; content: string }>> {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files: Array<{ filePath: string; content: string }> = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      const nestedFiles = await readAllSupportedFilesFromDirectory(entryPath);
      files.push(...nestedFiles);
      continue;
    }

    if (!entry.isFile()) continue;

    const lower = entry.name.toLowerCase();
    if (lower.endsWith(".md") || lower.endsWith(".txt")) {
      const content = await fs.readFile(entryPath, "utf8");
      files.push({ filePath: entryPath, content });
      continue;
    }

    if (lower.endsWith(".pdf")) {
      try {
        const data = await fs.readFile(entryPath);
        const content = await extractTextFromPdfData(data);
        if (content.trim().length > 0) {
          files.push({ filePath: entryPath, content });
        }
      } catch (err) {
        console.warn(`Failed to parse PDF: ${entryPath}`, err);
      }
      continue;
    }

    if (lower.endsWith(".mp4")) {
      // Look for a sidecar transcript (same basename .txt or .md)
      const base = entryPath.slice(0, -4);
      const transcriptTxt = `${base}.txt`;
      const transcriptMd = `${base}.md`;
      try {
        const statTxt = await fs.stat(transcriptTxt).catch(() => null);
        const statMd = await fs.stat(transcriptMd).catch(() => null);
        if (statTxt && statTxt.isFile()) {
          const content = await fs.readFile(transcriptTxt, "utf8");
          files.push({ filePath: transcriptTxt, content });
        } else if (statMd && statMd.isFile()) {
          const content = await fs.readFile(transcriptMd, "utf8");
          files.push({ filePath: transcriptMd, content });
        } else {
          console.warn(`MP4 found without transcript, skipped: ${entryPath}`);
        }
      } catch (err) {
        console.warn(`Error while checking transcript for: ${entryPath}`, err);
      }
      continue;
    }
  }

  return files;
}

async function extractTextFromPdfData(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfjs: any = await import("pdfjs-dist/build/pdf.mjs");
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;
    let text = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = (content.items || [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => (item && item.str ? item.str : ""))
        .join(" ");
      text += pageText + "\n";
    }
    return text;
  } catch (err) {
    console.warn("PDF extraction failed", err);
    return "";
  }
}

async function loadDocuments(): Promise<Document[]> {
  const projectRoot = process.cwd();
  const docsDirectory = path.join(projectRoot, "src", "data", "docs");

  try {
    await fs.access(docsDirectory);
  } catch {
    return [];
  }

  const files = await readAllSupportedFilesFromDirectory(docsDirectory);
  const documents: Document[] = files.map(({ filePath, content }) =>
    new Document({ pageContent: content, metadata: { source: path.relative(projectRoot, filePath) } })
  );

  return documents;
}

export async function getVectorStore(): Promise<MemoryVectorStore> {
  if (cachedVectorStore) {
    return cachedVectorStore;
  }

  const documents = await loadDocuments();
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docsToIndex = documents.length > 0 ? await textSplitter.splitDocuments(documents) : [];

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
  });

  cachedVectorStore = await MemoryVectorStore.fromDocuments(docsToIndex, embeddings);
  return cachedVectorStore;
}

export function resetVectorStoreCache() {
  cachedVectorStore = null;
}


