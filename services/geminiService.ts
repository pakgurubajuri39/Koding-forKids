
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getGameHint(levelName: string, story: string, currentProgram: string[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User sedang bermain game koding anak SD bertema Ramadan. 
      Level: ${levelName}
      Cerita: ${story}
      Koding saat ini: ${currentProgram.join(', ') || 'Kosong'}
      
      Berikan 1 kalimat penyemangat dan 1 petunjuk logis (critical thinking) singkat dalam Bahasa Indonesia yang ramah anak.
      Jangan berikan jawaban langsung, beri petunjuk saja.`,
      config: {
        maxOutputTokens: 150,
        temperature: 0.7,
      }
    });
    return response.text || "Ayo semangat! Kamu pasti bisa memecahkan koding ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terus mencoba ya! Pikirkan langkah selanjutnya dengan hati-hati.";
  }
}
