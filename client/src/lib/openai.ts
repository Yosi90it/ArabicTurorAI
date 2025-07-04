import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || "YOUR_API_KEY_HERE",
  dangerouslyAllowBrowser: true
});

export interface WordAnalysis {
  word: string;
  translation: string;
  grammar: string;
  pronunciation?: string;
  examples?: string[];
}

export async function analyzeArabicWord(word: string): Promise<WordAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert Arabic language teacher. Analyze the given Arabic word and provide detailed information. Respond with JSON in this exact format:
{
  "word": "the original Arabic word",
  "translation": "English translation",
  "grammar": "detailed grammar explanation (verb form, noun type, etc.)",
  "pronunciation": "phonetic pronunciation",
  "examples": ["example sentence 1", "example sentence 2"]
}`
        },
        {
          role: "user",
          content: `Analyze this Arabic word: ${word}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      word: result.word || word,
      translation: result.translation || "Translation not available",
      grammar: result.grammar || "Grammar info not available",
      pronunciation: result.pronunciation,
      examples: result.examples || []
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      word: word,
      translation: "Translation service temporarily unavailable",
      grammar: "Grammar analysis temporarily unavailable"
    };
  }
}