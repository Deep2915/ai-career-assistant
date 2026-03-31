import mongoose from "mongoose";
import pdf from "pdf-parse-fork";
import { client, genAI } from "../config/db.js";

// POST /api/upload-resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const data = await pdf(req.file.buffer);

    const chunks = data.text
      .split("\n\n")
      .map((c) => c.trim())
      .filter((c) => c.length > 30);

    console.log(`♻️ Processing ${chunks.length} chunks...`);

    await client.connect();
    const db = client.db("career_assistant");
    const collection = db.collection("resumes");

    await collection.deleteMany({ userId: req.userId });

    const embedModel = genAI.getGenerativeModel({
      model: "gemini-embedding-001",
    });

    for (const chunk of chunks) {
      const result = await embedModel.embedContent({
        content: { parts: [{ text: chunk }] },
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: 768,
      });

      const embedding = result.embedding.values;

      await collection.insertOne({
        text: chunk,
        vector: embedding,
        userId: new mongoose.Types.ObjectId(req.userId),
        uploadedAt: new Date(),
      });
    }

    res.json({
      message: `Success! ${chunks.length} chunks vectorized at 768-dimensions.`,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
};
