import { NextRequest, NextResponse } from "next/server";
import { getVectorStore } from "@/lib/rag/vectorStore";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing 'query' string" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const vectorStore = await getVectorStore();
    const retriever = vectorStore.asRetriever({ k: 4 });

    const model = new ChatOpenAI({ model: "gpt-4o-mini" });

    const prompt = PromptTemplate.fromTemplate(
      [
        "You are a helpful assistant. Use the following context to answer the user's question.",
        "If the answer cannot be found in the context, say you don't know.",
        "\n\nContext:\n{context}\n\nQuestion: {question}\nAnswer:",
      ].join("\n")
    );

    const chain = RunnableSequence.from([
      async (input: { question: string }) => {
        const docs = await retriever.getRelevantDocuments(input.question);
        const context = docs.map((d) => d.pageContent).join("\n\n");
        return { context, question: input.question };
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const answer = await chain.invoke({ question: query });
    return NextResponse.json({ answer });
  } catch (error) {
    console.error("/api/rag/query error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


