const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateQuestion({ topic, type, difficulty }) {
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
}

module.exports = { generateQuestion };
