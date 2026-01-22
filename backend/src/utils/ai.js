const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

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

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 400,
    temperature: 0.7,
  });

  return JSON.parse(response.data.choices[0].text.trim());
}

module.exports = { generateQuestion };
