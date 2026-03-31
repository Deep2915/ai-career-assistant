import mongoose from "mongoose";
import pdf from "pdf-parse-fork";
import { client, genAI, supabase } from "../config/db.js";

// POST /api/upload-resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { conversationId } = req.body;
    if (!conversationId) return res.status(400).json({ error: "No conversationId provided" });

    const data = await pdf(req.file.buffer);

    const chunks = data.text
      .split("\n\n")
      .map((c) => c.trim())
      .filter((c) => c.length > 30);

    console.log(`♻️ Processing ${chunks.length} chunks...`);

    await client.connect();
    const db = client.db("career_assistant");
    const collection = db.collection("resumes");

    await collection.deleteMany({ userId: req.userId, conversationId: conversationId });

    // ── Upload original PDF to Supabase Storage ──
    const filePath = `${req.userId}/${conversationId}/${req.file.originalname || "resume.pdf"}`;

    // Remove old file if it exists (ignore errors)
    await supabase.storage.from("resumes").remove([filePath]);

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, req.file.buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload PDF to storage: " + uploadError.message });
    }

    // Store the file path in MongoDB for later retrieval
    const filesCollection = db.collection("resume_files");
    await filesCollection.updateOne(
      { userId: new mongoose.Types.ObjectId(req.userId), conversationId },
      {
        $set: {
          filePath,
          fileName: req.file.originalname || "resume.pdf",
          uploadedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // ── Vectorize chunks ──
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
        conversationId: conversationId,
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

// GET /api/resume-file/:conversationId — returns a signed URL for the PDF
export const getResumeURL = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("career_assistant");
    const filesCollection = db.collection("resume_files");

    const record = await filesCollection.findOne({
      userId: new mongoose.Types.ObjectId(req.userId),
      conversationId: req.params.conversationId,
    });

    if (!record) {
      return res.status(404).json({ error: "No resume found for this conversation" });
    }

    // Create a signed URL valid for 1 hour
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(record.filePath, 3600);

    if (error) {
      console.error("Supabase signed URL error:", error);
      return res.status(500).json({ error: "Failed to generate resume URL" });
    }

    res.json({ url: data.signedUrl, fileName: record.fileName });
  } catch (error) {
    console.error("Get Resume URL Error:", error);
    res.status(500).json({ error: error.message });
  }
};
