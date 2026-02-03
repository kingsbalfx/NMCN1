let openai = null;

// Only initialize OpenAI if API key is provided
if (process.env.OPENAI_API_KEY) {
  const { OpenAI } = require("openai");
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn("⚠️  OPENAI_API_KEY not set. AI generation will use mock data.");
}

async function generateQuestion({ topic, type, difficulty }) {
  // If no OpenAI key, return mock question
  if (!openai) {
    return {
      question: `Sample ${type} question about ${topic}`,
      options: {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      correct_answer: "B",
      explanation: `This is a ${difficulty} level question about ${topic}. Mock data returned because OPENAI_API_KEY is not configured.`,
      aiGenerated: false,
      mock: true
    };
  }

  const prompt = `
Generate a ${type} question for Nigerian Nursing and Midwifery students
based on the NMCN curriculum.

Topic: ${topic}
Difficulty: ${difficulty}

Respond strictly in JSON:
{
  "question": "...",
  "options": {"A":"...","B":"...","C":"...","D":"..."},
  "correct_answer": "...",
  "explanation": "..."
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 400,
    });

    return JSON.parse(response.choices[0].message.content.trim());
  } catch (err) {
    console.error("AI generation error:", err.message);
    // Return mock question on error
    return {
      question: `Sample ${type} question about ${topic}`,
      options: {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      correct_answer: "B",
      explanation: `This is a ${difficulty} level question about ${topic}. Mock data returned due to AI error.`,
      aiGenerated: false,
      error: true
    };
  }
}

module.exports = { generateQuestion };
