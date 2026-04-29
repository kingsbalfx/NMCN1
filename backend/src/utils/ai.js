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

async function generateCurriculumQuestion({ courseCode, topic, difficulty = "medium", type = "multiple-choice" }) {
  // Load curriculum data
  let curriculumData = {};
  try {
    curriculumData = require("../../nursing_questions/curriculum.json");
  } catch (err) {
    console.warn("Could not load curriculum data:", err.message);
  }

  // Find course information
  let courseInfo = null;
  if (courseCode) {
    for (const semester in curriculumData.courses) {
      const courses = curriculumData.courses[semester];
      courseInfo = courses.find(c => c.code === courseCode);
      if (courseInfo) break;
    }
  }

  // Build context from curriculum
  let context = "";
  if (courseInfo) {
    context = `
Course: ${courseInfo.title} (${courseInfo.code})
Description: ${courseInfo.description || "N/A"}
Content: ${courseInfo.content ? courseInfo.content.join(", ") : "General nursing concepts"}
Objectives: ${courseInfo.objectives ? courseInfo.objectives.join(", ") : "N/A"}
    `.trim();
  } else if (topic) {
    context = `Topic: ${topic} - Based on Nigerian Nursing and Midwifery Council (NMCN) curriculum`;
  }

  // If no OpenAI key, return mock question
  if (!openai) {
    return {
      question: `Sample ${type} question about ${courseInfo ? courseInfo.title : topic}`,
      options: {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      correct_answer: "B",
      explanation: `This is a ${difficulty} level question based on the NMCN curriculum. Mock data returned because OPENAI_API_KEY is not configured.`,
      aiGenerated: false,
      mock: true,
      courseCode,
      topic
    };
  }

  const prompt = `
Generate a ${type} question for Nigerian Nursing students based on the NMCN curriculum.

${context}

Difficulty: ${difficulty}

The question should test understanding of key concepts, clinical application, or critical thinking as per NMCN standards.

Respond strictly in JSON:
{
  "question": "...",
  "options": {"A":"...","B":"...","C":"...","D":"..."},
  "correct_answer": "...",
  "explanation": "...",
  "courseCode": "${courseCode || ''}",
  "topic": "${topic || ''}"
}
  `.trim();

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content.trim());
    result.aiGenerated = true;
    return result;
  } catch (err) {
    console.error("Curriculum AI generation error:", err.message);
    // Return mock question on error
    return {
      question: `Sample ${type} question about ${courseInfo ? courseInfo.title : topic}`,
      options: {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      correct_answer: "B",
      explanation: `This is a ${difficulty} level question based on the NMCN curriculum. Mock data returned due to AI error.`,
      aiGenerated: false,
      error: true,
      courseCode,
      topic
    };
  }
}

module.exports = { generateQuestion, generateCurriculumQuestion };
