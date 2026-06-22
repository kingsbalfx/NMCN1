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

function getCurriculumData() {
  try {
    return require("../../nursing_questions/curriculum.json");
  } catch (err) {
    console.warn("Could not load curriculum data:", err.message);
    return { courses: {} };
  }
}

function getAllCurriculumCourses(curriculumData = getCurriculumData()) {
  const courses = [];

  if (Array.isArray(curriculumData.courses)) {
    curriculumData.courses.forEach((course) => {
      courses.push({ ...course, semester: course.semester || "uploaded" });
    });
    return courses;
  }

  Object.entries(curriculumData.courses || {}).forEach(([semester, semesterCourses]) => {
    (Array.isArray(semesterCourses) ? semesterCourses : []).forEach((course) => {
      courses.push({ ...course, semester });
    });
  });
  return courses;
}

function findCurriculumCourse({ courseCode, topic }) {
  const courses = getAllCurriculumCourses();
  if (courseCode) {
    const byCode = courses.find((course) => String(course.code).toLowerCase() === String(courseCode).toLowerCase());
    if (byCode) return byCode;
  }

  if (topic) {
    const query = String(topic).toLowerCase();
    return courses.find((course) =>
      String(course.title || "").toLowerCase().includes(query) ||
      String(course.code || "").toLowerCase().includes(query)
    );
  }

  return null;
}

function buildFallbackStudyPack({ courseCode, topic, difficulty = "beginner" }) {
  const curriculum = getCurriculumData();
  const course = findCurriculumCourse({ courseCode, topic }) || {
    code: courseCode || "CUSTOM",
    title: topic || "General Nursing",
    description: "Nursing curriculum topic",
    content: [topic || "General nursing concepts"],
    objectives: []
  };

  const content = Array.isArray(course.content) && course.content.length
    ? course.content
    : [course.description || course.title, ...(course.objectives || [])].filter(Boolean);
  const keyPoints = content.slice(0, 8);
  const firstPoint = keyPoints[0] || course.title;

  return {
    courseCode: course.code,
    title: course.title,
    semester: course.semester || null,
    difficulty,
    lesson: {
      title: `${course.title} made simple`,
      summary: `${course.title} helps student nurses understand ${firstPoint}. Study the key ideas, connect them to patient care, then test yourself with exam questions.`,
      sections: keyPoints.map((point, index) => ({
        heading: point,
        explanation: `In simple terms, ${point} is important because it helps a nurse make safer decisions during assessment, planning, care, and evaluation.`,
        bedside_example: `A student nurse may apply ${point} while observing a patient, documenting findings, or explaining care to a patient or family.`
      })),
      memory_hook: `Think: know it, see it, do it safely, document it.`,
      image_prompt: `A clear educational nursing illustration showing ${course.title}, with diverse male and female Nigerian nursing students learning in a bright clinical skills lab.`
    },
    flashcards: keyPoints.slice(0, 6).map((point) => ({
      front: `What should you remember about ${point}?`,
      back: `${point} should be understood in relation to safe nursing care, patient education, and accurate documentation.`
    })),
    questions: keyPoints.slice(0, 5).map((point, index) => ({
      id: `${course.code || "topic"}-${index + 1}`,
      question: `Which nursing action best shows understanding of ${point}?`,
      options: {
        A: "Ignore the patient's report and wait for a doctor",
        B: "Assess the patient, apply safe nursing principles, and document findings",
        C: "Give medication without checking the prescription",
        D: "Avoid communicating with the patient"
      },
      correct_answer: "B",
      explanation: `Nursing care should combine assessment, safety, communication, and documentation.`
    })),
    clinical_scenario: {
      prompt: `You are posted to a ward and asked to apply ${course.title} knowledge during patient care.`,
      tasks: [
        "Identify the priority assessment",
        "State two nursing interventions",
        "Explain how you will document the care",
        "Mention one patient-safety risk"
      ]
    },
    exam_traps: [
      "Do not choose answers that ignore assessment.",
      "Avoid unsafe medication or procedure shortcuts.",
      "Remember documentation and patient communication."
    ],
    offline_ready: true,
    aiGenerated: false,
    mock: true,
    curriculum_rules: curriculum.programme_rules || {}
  };
}

function parseCurriculumTextFallback({ title = "Uploaded Curriculum", curriculum_text }) {
  const lines = String(curriculum_text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const courses = [];
  let currentSection = "general";

  lines.forEach((line) => {
    const normalized = line.replace(/\s+/g, " ");
    const isLikelyHeading = /^[A-Z0-9 &/().-]{6,}$/.test(normalized) && normalized.length < 90;

    if (/YEAR|SEMESTER/i.test(normalized) && isLikelyHeading) {
      currentSection = normalized.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
      return;
    }

    if (isLikelyHeading && !/TABLE OF CONTENT|INTRODUCTION|OBJECTIVES|COMPETENCIES/i.test(normalized)) {
      const codePrefix = normalized.split(/\s+/).map((part) => part[0]).join("").slice(0, 3) || "NUR";
      courses.push({
        code: `${codePrefix}${String(courses.length + 1).padStart(3, "0")}`,
        title: normalized.replace(/\s+/g, " ").replace(/\bI{2,3}\b/g, (match) => match),
        semester: currentSection,
        content: [],
        objectives: [],
        units: null,
        source: title
      });
      return;
    }

    if (courses.length && normalized.length > 4) {
      const target = courses[courses.length - 1];
      if (target.content.length < 12) target.content.push(normalized);
    }
  });

  return {
    title,
    courses: courses.slice(0, 80),
    summary: {
      total_courses: courses.length,
      sections_detected: [...new Set(courses.map((course) => course.semester))].length,
      aiGenerated: false
    }
  };
}

async function generateStudyPack({ courseCode, topic, difficulty = "beginner" }) {
  if (!openai) return buildFallbackStudyPack({ courseCode, topic, difficulty });

  const course = findCurriculumCourse({ courseCode, topic });
  const fallback = buildFallbackStudyPack({ courseCode, topic, difficulty });
  const context = JSON.stringify(course || fallback, null, 2);

  const prompt = `
Create a simple, comprehensive nursing student study pack from this curriculum course.
The tone must be clear, friendly, exam-focused, and suitable for offline use.
Include a visual image prompt for the lesson.

Course context:
${context}

Respond strictly as JSON with:
{
  "courseCode": "",
  "title": "",
  "difficulty": "",
  "lesson": {"title": "", "summary": "", "sections": [{"heading": "", "explanation": "", "bedside_example": ""}], "memory_hook": "", "image_prompt": ""},
  "flashcards": [{"front": "", "back": ""}],
  "questions": [{"question": "", "options": {"A": "", "B": "", "C": "", "D": ""}, "correct_answer": "", "explanation": ""}],
  "clinical_scenario": {"prompt": "", "tasks": []},
  "exam_traps": [],
  "offline_ready": true
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.55,
      max_tokens: 1600,
    });

    const result = JSON.parse(response.choices[0].message.content.trim());
    result.aiGenerated = true;
    return result;
  } catch (err) {
    console.error("Study pack generation error:", err.message);
    return { ...fallback, error: true };
  }
}

async function parseCurriculumText({ title, curriculum_text }) {
  if (!openai) return parseCurriculumTextFallback({ title, curriculum_text });

  const prompt = `
You are structuring a Nigerian General Nursing curriculum for an AI learning app.
Extract courses, semesters, objectives, content outlines, clinical requirements, grading rules, and logbook requirements.
Keep student-facing wording simple.

Title: ${title || "Uploaded Curriculum"}

Curriculum text:
${String(curriculum_text || "").slice(0, 18000)}

Respond strictly as JSON:
{
  "title": "",
  "courses": [{"code": "", "title": "", "semester": "", "description": "", "objectives": [], "content": [], "units": null}],
  "clinical_requirements": [],
  "evaluation": {},
  "student_summary": "",
  "aiGenerated": true
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2500,
    });
    const result = JSON.parse(response.choices[0].message.content.trim());
    result.aiGenerated = true;
    return result;
  } catch (err) {
    console.error("Curriculum parse error:", err.message);
    return { ...parseCurriculumTextFallback({ title, curriculum_text }), error: true };
  }
}

function buildFallbackTutorResponse({ question, courseCode, topic, learningLevel = "simple" }) {
  const course = findCurriculumCourse({ courseCode, topic }) || {
    code: courseCode || "NUR",
    title: topic || "General Nursing",
    content: [topic || question || "Nursing care"]
  };
  const keyConcepts = (Array.isArray(course.content) ? course.content : [])
    .filter(Boolean)
    .slice(0, 4);
  const focus = keyConcepts[0] || course.title;

  return {
    courseCode: course.code || courseCode || null,
    topic: topic || course.title,
    learningLevel,
    answer: `In simple nursing terms, ${focus} matters because it guides safe assessment, care planning, patient education, and documentation. Start by identifying what is happening to the patient, check safety risks, choose the nursing action that protects the patient, and record what you observed and did.`,
    steps: [
      "Read the question and underline the patient problem.",
      "Identify the safest nursing priority first.",
      "Connect the answer to assessment, intervention, evaluation, and documentation.",
      "Reject options that ignore safety, consent, infection control, or medication rights."
    ],
    bedside_example: `If a patient presents with a problem related to ${focus}, the student nurse should assess the patient, report abnormal findings, carry out only approved nursing interventions, and document care accurately.`,
    memory_hook: "Assess first, act safely, explain clearly, document always.",
    image_prompt: `A clean educational nursing illustration about ${course.title}, showing diverse Nigerian male and female nursing students learning with a patient-care diagram in a bright clinical skills lab.`,
    quick_check: {
      question: `What is the safest first step when a nursing question asks about ${focus}?`,
      answer: "Assess the patient and identify the priority safety need before acting."
    },
    sources: ["Published nursing curriculum", "NMCN-style clinical reasoning"],
    aiGenerated: false,
    offline_ready: true
  };
}

async function generateTutorExplanation({ question, courseCode, topic, learningLevel = "simple", studentAnswer }) {
  const fallback = buildFallbackTutorResponse({ question, courseCode, topic, learningLevel });
  if (!openai) return fallback;

  const course = findCurriculumCourse({ courseCode, topic });
  const context = JSON.stringify(course || fallback, null, 2);

  const prompt = `
You are an AI nursing tutor for Nigerian General Nursing students.
Explain the student's question in simple, comprehensive language.
Use the curriculum context, clinical safety, exam reasoning, and a visual image prompt.
Do not diagnose a real patient or replace a qualified clinician.

Course context:
${context}

Student question:
${question}

Student answer, if any:
${studentAnswer || "Not provided"}

Learning level: ${learningLevel}

Respond strictly as JSON:
{
  "courseCode": "",
  "topic": "",
  "learningLevel": "",
  "answer": "",
  "steps": [],
  "bedside_example": "",
  "memory_hook": "",
  "image_prompt": "",
  "quick_check": {"question": "", "answer": ""},
  "sources": [],
  "offline_ready": true
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.45,
      max_tokens: 1100,
    });

    const result = JSON.parse(response.choices[0].message.content.trim());
    result.aiGenerated = true;
    result.offline_ready = true;
    return result;
  } catch (err) {
    console.error("Tutor explanation error:", err.message);
    return { ...fallback, error: true };
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

module.exports = {
  generateQuestion,
  generateCurriculumQuestion,
  generateStudyPack,
  generateTutorExplanation,
  parseCurriculumText,
  getCurriculumData,
  getAllCurriculumCourses
};
