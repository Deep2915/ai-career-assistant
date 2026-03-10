import fs from "fs";
import pdf from "pdf-parse-fork";
import { GoogleGenAI } from "@google/genai";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

console.log("1. Environment Loaded. Checking URI...");
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("❌ FATAL: MONGO_URI is missing from .env!");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const client = new MongoClient(uri);

const main = async () => {
  console.log("2. Main function started...");
  try {
    console.log("3. Attempting to connect to MongoDB...");
    await client.connect();
    console.log("✅ 4. Connected to MongoDB!");

    const db = client.db("career_assistant");
    const collection = db.collection("resumes");

    console.log("5. Reading PDF...");
    const dataBuffer = fs.readFileSync("./deepFinalCV.pdf");
    const data = await pdf(dataBuffer);

    const chunks = data.text.split("\n").filter((c) => c.trim().length > 20);
    console.log(
      `✅ 6. Found ${chunks.length} chunks. Starting vectorization...`,
    );

    for (let i = 0; i < chunks.length; i++) {
      // Note the updated structure for contents
      const result = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: [
          {
            parts: [{ text: chunks[i] }],
          },
        ],
      });

      // The SDK returns an array of embeddings because we sent an array of contents
      const embedding = result.embeddings[0].values;

      await collection.insertOne({
        text: chunks[i],
        vector: embedding,
        uploadedAt: new Date(),
      });
      console.log(`   - Stored chunk ${i + 1}`);
    }

    console.log("🎉 SUCCESS: Resume stored in Atlas!");
  } catch (error) {
    console.error("❌ ERROR:", error);
  } finally {
    await client.close();
    console.log("7. Connection closed.");
  }
};

// Explicitly call the function and catch top-level errors
main().catch((err) => console.error("GLOBAL ERROR:", err));
