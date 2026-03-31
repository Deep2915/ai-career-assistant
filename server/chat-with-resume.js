import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const client = new MongoClient(process.env.MONGO_URI);

async function askCareerAdvisor(userQuestion) {
  try {
    await client.connect();
    const db = client.db("career_assistant");
    const collection = db.collection("resumes");

    // 1. Get the Embedding
    const embedModel = genAI.getGenerativeModel({
      model: "gemini-embedding-001",
    });
    const embedResult = await embedModel.embedContent({
      content: { parts: [{ text: userQuestion }] },
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: 768,
    });
    const queryVector = embedResult.embedding.values;

    // 2. Vector Search
    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "vector",
          queryVector: queryVector,
          numCandidates: 100,
          limit: 5,
        },
      },
      { $project: { _id: 0, text: 1 } },
    ];

    const contextChunks = await collection.aggregate(pipeline).toArray();
    const contextText =
      contextChunks.length > 0
        ? contextChunks.map((c) => c.text).join("\n\n")
        : "No relevant resume data found.";

    // 3. THE FIX: Use "gemini-1.5-flash" (no -latest suffix)
    const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an AI Career Assistant. Use the provided Context from a candidate's resume to answer the question.
      
      Context:
      ${contextText}
      
      Question: ${userQuestion}
    `;

    // 4. Correct way to call generateContent
    const result = await chatModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("\n🤖 AI CAREER RESPONSE: ");
    console.log("------------------");
    console.log(text);
  } catch (error) {
    console.error("❌ Chat error details: ", error);
  } finally {
    await client.close();
  }
}
const query =
  process.argv.slice(2).join(" ") || "Give me a summary of this candidate.";
askCareerAdvisor(query);
