import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import { client, genAI } from "../config/db.js";

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

    // VECTOR SEARCH — with proper userId filter
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
          },
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

    const contextChunks = await collection.aggregate(pipeline).toArray();
    console.log(`🔎 Found ${contextChunks.length} matching chunks.`);

    const contextText =
      contextChunks.length > 0
        ? contextChunks.map((c) => c.text).join("\n\n")
        : "No relevant information found in the candidate's resume.";
    console.log("--- DEBUG: Context being sent to Gemini ---");
    console.log(contextText);
    console.log("-------------------------------------------");

    // GENERATION: Using the stable 2026 Flash model
    const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
  You are an expert Technical Recruiter. Analyze the provided resume context and provide a detailed professional answer to the user query.

  Candidate Data:
  ${contextText}

  User Query: ${question}

  Please structure your response (if asked about any of these) with:
  1. Executive Summary (Hire/Not Hire recommendation)
  2. Technical Match (Analyze the candidate's specific projects and skills found in the context)
  3. Areas of Strength (Soft skills and Academics)
  
  IMPORTANT: If the Candidate Data is empty, state clearly that no resume has been processed yet.
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
