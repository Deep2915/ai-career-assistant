import { GoogleGenerativeAI } from "@google/generative-ai";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import { text } from "express";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function searchResume(queryText) {
  try {
    await client.connect();
    const db = client.db("career_assistant");
    const collection = db.collection("resumes");

    const count = await collection.countDocuments();
    console.log(`Debug: Total documents in collection: ${count}`);

    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent({
      content: { parts: [{ text: queryText }] },
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: 768,
    });
    const queryVector = result.embedding.values;

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
      {
        $project: {
          _id: 0,
          text: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];
    const results = await collection.aggregate(pipeline).toArray();
    console.log(`Debug: Found ${results.length} documents in search.`);

    console.log(`-----Search results for "${queryText}"`);
    console.log("-----------------------------");
    results.forEach((res, i) => {
      console.log(`[Match ${i + 1}] (Score: ${res.score.toFixed(4)})`);
      console.log(`${res.text}\n`);
    });
  } catch (error) {
    console.error("Search error : ", error);
  } finally {
    await client.close();
  }
}
const userQuestion =
  process.argv.slice(2).join(" ") || "What are the technical skills?";
searchResume(userQuestion);
