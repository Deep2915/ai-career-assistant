import fs from "fs";
import pdf from "pdf-parse-fork";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apikey: process.env.GEMINI_API_KEY });

async function processResume() {
  const path = "./deepFinalCV.pdf";
  if (!fs.existsSync(path)) {
    console.error("PDF NOT FOUND");
    return;
  }
  try {
    const dataBuffer = fs.readFileSync(path);
    const data = await pdf(dataBuffer);
    const resumeText = data.text;

    console.log("data extracted, sending to gemini....");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a professional recruiter, Analyze this resume snippet and list top 3 technical skills identified: /n/n ${resumeText.slice(0, 2000)}`,
            },
          ],
        },
      ],
    });

    console.log("---gemini's analysis---");
    console.log(response.text);
    console.log("---------------");
  } catch (err) {
    console.error("Error", err.message);
  }
}
processResume();
