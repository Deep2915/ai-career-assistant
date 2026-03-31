import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import { client, genAI, supabase } from "../config/db.js";

// GET /api/conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await Chat.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: "$conversationId",
          title: { $first: "$title" },
          lastActive: { $max: "$createdAt" },
        },
      },
      { $sort: { lastActive: -1 } },
    ]);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/chats
export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId }).sort({
      createdAt: 1,
    });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/chats/:conversationId
export const getChatsByConversation = async (req, res) => {
  try {
    const chats = await Chat.find({
      userId: req.userId,
      conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/chat
export const sendChat = async (req, res) => {
  const { question, conversationId } = req.body;
  console.log("📩 Received Question:", question);

  try {
    await client.connect();
    const db = client.db("career_assistant");
    const collection = db.collection("resumes");

    // First check if ANY resume chunks exist for this specific conversation
    const hasResume = await collection.findOne({
      userId: new mongoose.Types.ObjectId(req.userId),
      conversationId: conversationId,
    });

    let contextText;

    if (!hasResume) {
      // No resume uploaded in this conversation — don't search at all
      console.log("⚠️ No resume found for this conversation.");
      contextText = "No resume has been uploaded for this conversation. Please upload a resume first before asking questions.";
    } else {
      // Resume exists for this conversation — do vector search
      const embedModel = genAI.getGenerativeModel({
        model: "gemini-embedding-001",
      });

      const searchContext = `${question} projects portfolio technical work`;
      const result = await embedModel.embedContent({
        content: { parts: [{ text: searchContext }] },
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
            numCandidates: 150,
            limit: 15,
            filter: {
              userId: { $eq: new mongoose.Types.ObjectId(req.userId) },
              conversationId: { $eq: conversationId },
            },
          },
        },
        {
          $project: {
            _id: 0,
            text: 1,
            conversationId: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ];

      let contextChunks = await collection.aggregate(pipeline).toArray();

      // Server-side safety filter: only keep chunks from this conversation
      // (in case Atlas index doesn't have conversationId as a filter field yet)
      contextChunks = contextChunks.filter(
        (c) => c.conversationId === conversationId
      );

      console.log(`🔎 Found ${contextChunks.length} matching chunks for conversation ${conversationId}.`);

      contextText =
        contextChunks.length > 0
          ? contextChunks.map((c) => c.text).join("\n\n")
          : "No relevant information found in the candidate's resume.";
    }

    console.log("--- DEBUG: Context being sent to Gemini ---");
    console.log(contextText);
    console.log("-------------------------------------------");

    // GENERATION: Using the stable 2026 Flash model
    const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
  You are an expert Technical Recruiter. Your goal is to answer the User Query based ONLY on the provided Candidate Data.

  Candidate Data:
  ${contextText}

  User Query: ${question}

  INSTRUCTIONS:
  1. If the Candidate Data is empty, state clearly that no resume has been processed yet.
  2. Provide a direct, concise answer to the User Query first. 
  3. DO NOT provide a "Hire/Not Hire" recommendation or a full breakdown unless the user specifically asks for an evaluation, a summary, or a hiring opinion.
  4. If (and only if) the user asks for a comprehensive analysis or a summary, use the following structure:
     - Executive Summary: A brief recommendation.
     - Technical Match: Analysis of specific projects/skills.
     - Areas of Strength: Soft skills and academic highlights.
  5. Keep the tone professional, objective, and brief. Avoid unnecessary introductory filler.
`;
    const chatResult = await chatModel.generateContent(prompt);
    const response = await chatResult.response;
    const text = response.text();

    const chatTitle = question.split(" ").slice(0, 5).join(" ") + "...";

    const newChat = new Chat({
      userId: req.userId,
      conversationId: conversationId,
      title: chatTitle,
      question: question,
      answer: text,
    });
    await newChat.save();

    res.json({ answer: text });
  } catch (error) {
    console.error("❌ SERVER ERROR:", error);
    res.status(500).json({
      error:
        "The Career Advisor is busy or model is offline. Error: " +
        error.message,
    });
  }
};

// DELETE /api/conversations/:conversationId
export const deleteConversation = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.userId;

  try {
    // 1. Delete chat messages from Mongoose
    await Chat.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
      conversationId,
    });

    // 2. Delete resume vector chunks from native MongoDB
    await client.connect();
    const db = client.db("career_assistant");
    await db.collection("resumes").deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
      conversationId,
    });

    // 3. Delete resume file record & Supabase storage
    const filesCollection = db.collection("resume_files");
    const fileRecord = await filesCollection.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      conversationId,
    });

    if (fileRecord) {
      // Remove from Supabase Storage
      await supabase.storage.from("resumes").remove([fileRecord.filePath]);
      // Remove the DB record
      await filesCollection.deleteOne({ _id: fileRecord._id });
    }

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Delete Conversation Error:", error);
    res.status(500).json({ error: error.message });
  }
};
