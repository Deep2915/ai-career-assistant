import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

// Mongoose connection (for User & Chat models)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🍃 Mongoose connected to Atlas");
  } catch (err) {
    console.error("❌ Mongoose connection error:", err);
    process.exit(1);
  }
};

// Native MongoClient (for vector search on 'resumes' collection)
const client = new MongoClient(process.env.MONGO_URI);

// Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export { connectDB, client, genAI };
