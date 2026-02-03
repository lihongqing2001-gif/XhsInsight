import { GoogleGenAI } from "@google/genai";
import { Note } from "../types";

// In a real production app, this key should be proxied or users should enter their own if it's a BYOK model.
// We assume it's available in the environment.
const apiKey = process.env.API_KEY || ''; 

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async rewriteContent(note: Note, tone: 'professional' | 'emotional' | 'humorous'): Promise<string> {
    try {
      const prompt = `
        You are an expert XiaoHongShu (Red) copywriter. 
        Please rewrite the following note to be more viral, keeping the core message but optimizing for the "${tone}" tone.
        
        Original Title: ${note.title}
        Original Content: ${note.content}
        
        Requirements:
        1. Use emojis appropriately.
        2. Break text into readable paragraphs.
        3. Add relevant hashtags.
        4. Focus on the "viral reasons" identified: ${note.analysis?.viralReasons.join(', ') || 'General appeal'}.
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.8,
        }
      });

      return response.text || "Failed to generate rewrite.";
    } catch (error) {
      console.error("Gemini Rewrite Error:", error);
      return "An error occurred while connecting to the AI service.";
    }
  }

  async generateDeepInsight(notes: Note[]): Promise<string> {
     // Aggregated analysis for a group of notes
     const contents = notes.map(n => `Title: ${n.title}\nStats: Likes ${n.stats.likes}`).join('\n---\n');
     const prompt = `Analyze these ${notes.length} notes. What is the common thread among the high-performing ones? Provide a strategic summary for a brand manager.`;
     
     const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            thinkingConfig: { thinkingBudget: 2048 } // Using thinking model for deep strategic insight
        }
     });
     
     return response.text || "No insights generated.";
  }
}

export const geminiService = new GeminiService();