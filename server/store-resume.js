import fs from "fs";
import pdf from "pdf-parse-fork";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
const apiKey = process.env.GEMINI_API_KEY;

if (!uri || !apiKey) {
  console.error("❌ FATAL: Missing MONGO_URI or GEMINI_API_KEY in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const client = new MongoClient(uri);

const main = async () => {
  try {
    console.log("🚀 Connecting to MongoDB Atlas...");
    await client.connect();
    
    const db = client.db("career_assistant");
    const collection = db.collection("resumes");

    // 🔥 CRITICAL CHANGE: Clear old data to prevent dimension mismatch errors
    console.log("🧹 Clearing old incompatible vectors...");
    await collection.deleteMany({}); 

    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    console.log("📄 Reading PDF file...");
    const dataBuffer = fs.readFileSync("./deepFinalCV.pdf");
    const data = await pdf(dataBuffer);

    // Filter out tiny fragments
    const chunks = data.text
      .split("\n\n")
      .map(c => c.trim())
      .filter((c) => c.length > 20);

    console.log(`✅ Extracted ${chunks.length} valid chunks.`);

    for (let i = 0; i < chunks.length; i++) {
      try {
        // Generate Embedding (768 dimensions)
        const result = await model.embedContent({
          content: { parts: [{ text: chunks[i] }] },
          taskType: "RETRIEVAL_DOCUMENT",
          outputDimensionality: 768,
        });

        const embedding = result.embedding.values;

        await collection.insertOne({
          text: chunks[i],
          vector: embedding, // This is your 768-dim array
          metadata: { source: "deepFinalCV.pdf", chunkIndex: i },
          uploadedAt: new Date(),
        });

        console.log(`   [${i + 1}/${chunks.length}] Stored successfully.`);
      } catch (embedError) {
        console.error(`   ❌ Failed on chunk ${i}:`, embedError.message);
      }
    }

    console.log("\n🎉 ALL DONE! Your database is now clean and searchable.");
    
  } catch (error) {
    console.error("\n❌ GLOBAL ERROR:", error.message);
  } finally {
    await client.close();
  }
};

main();