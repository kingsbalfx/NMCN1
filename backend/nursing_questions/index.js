// Fallback questions
const fallbackQuestions = [
  {
    "id": 1,
    "topic": "Anatomy and Physiology",
    "subject": "Fundamentals",
    "question": "What is the primary function of the mitochondria?",
    "options": {
      "A": "Protein synthesis",
      "B": "Energy production (ATP synthesis)",
      "C": "DNA replication",
      "D": "Waste storage"
    },
    "correct_answer": "B",
    "explanation": "Mitochondria are known as the powerhouse of the cell. Their primary function is to produce ATP through cellular respiration."
  },
  {
    "id": 2,
    "topic": "Nursing Fundamentals",
    "subject": "Fundamentals",
    "question": "Which of the following is the correct order of steps in the nursing process?",
    "options": {
      "A": "Planning, Assessment, Diagnosis, Implementation, Evaluation",
      "B": "Assessment, Diagnosis, Planning, Implementation, Evaluation",
      "C": "Diagnosis, Assessment, Planning, Implementation, Evaluation",
      "D": "Implementation, Assessment, Diagnosis, Planning, Evaluation"
    },
    "correct_answer": "B",
    "explanation": "The nursing process follows: Assessment, Diagnosis, Planning, Implementation, Evaluation."
  },
  {
    "id": 3,
    "topic": "Medical-Surgical Nursing",
    "subject": "Clinical",
    "question": "What is the normal range for adult body temperature in Celsius?",
    "options": {
      "A": "35.5 - 36.5°C",
      "B": "36.5 - 37.5°C",
      "C": "37.5 - 38.5°C",
      "D": "38.5 - 39.5°C"
    },
    "correct_answer": "B",
    "explanation": "Normal body temperature is 36.5°C to 37.5°C."
  },
  {
    "id": 4,
    "topic": "Community Health Nursing",
    "subject": "Community",
    "question": "Which vaccine is administered at birth to prevent tuberculosis?",
    "options": {
      "A": "OPV",
      "B": "BCG",
      "C": "Pentavalent",
      "D": "Rotavirus"
    },
    "correct_answer": "B",
    "explanation": "BCG vaccine is administered at birth to provide immunity against tuberculosis."
  },
  {
    "id": 5,
    "topic": "Mental Health Nursing",
    "subject": "Clinical",
    "question": "What is the primary goal of therapeutic communication in nursing?",
    "options": {
      "A": "To control the patient's behavior",
      "B": "To establish trust and understanding with the patient",
      "C": "To diagnose mental illness",
      "D": "To prescribe medications"
    },
    "correct_answer": "B",
    "explanation": "Therapeutic communication aims to establish a helping relationship and promote trust."
  },
  {
    "id": 6,
    "topic": "Reproductive Health",
    "subject": "Maternal-Child",
    "question": "What is the normal duration of pregnancy from conception?",
    "options": {
      "A": "38 weeks",
      "B": "40 weeks",
      "C": "42 weeks",
      "D": "36 weeks"
    },
    "correct_answer": "B",
    "explanation": "A normal pregnancy lasts approximately 40 weeks (280 days) from LMP."
  },
  {
    "id": 7,
    "topic": "Pediatric Nursing",
    "subject": "Clinical",
    "question": "What is the normal pulse rate range for a school-age child (6-12 years)?",
    "options": {
      "A": "70-110 beats per minute",
      "B": "80-120 beats per minute",
      "C": "100-160 beats per minute",
      "D": "60-100 beats per minute"
    },
    "correct_answer": "A",
    "explanation": "Normal pulse rate for school-age children is 70-110 beats per minute."
  },
  {
    "id": 8,
    "topic": "Pharmacology",
    "subject": "Fundamentals",
    "question": "Which of the following is NOT a principle of nursing ethics?",
    "options": {
      "A": "Autonomy",
      "B": "Beneficence",
      "C": "Maleficence",
      "D": "Justice"
    },
    "correct_answer": "C",
    "explanation": "Maleficence is not a nursing principle; the principles are Autonomy, Beneficence, Non-maleficence, and Justice."
  },
  {
    "id": 9,
    "topic": "Health Economics",
    "subject": "Advanced",
    "question": "What is the primary goal of health promotion?",
    "options": {
      "A": "To treat disease",
      "B": "To increase longevity",
      "C": "To maintain and improve health status",
      "D": "To reduce healthcare costs"
    },
    "correct_answer": "C",
    "explanation": "Health promotion aims to maintain and improve the health status of individuals and communities."
  },
  {
    "id": 10,
    "topic": "Research Methodology",
    "subject": "Advanced",
    "question": "What type of research design allows the researcher to manipulate the independent variable?",
    "options": {
      "A": "Descriptive research",
      "B": "Correlational research",
      "C": "Experimental research",
      "D": "Qualitative research"
    },
    "correct_answer": "C",
    "explanation": "Experimental research allows researchers to manipulate variables and determine cause-and-effect relationships."
  }
];

// Try to load question files - safe loading with fallback
let allQuestions = [...fallbackQuestions];

const tryLoad = (path) => {
  try {
    const data = require(path);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
};

// Attempt to load JSON files
const jsonFiles = [
  "./anatomy.json",
  "./fundamentals.json",
  "./med_surg.json",
  "./pharmacology.json",
  "./Reproductive-health.JSON",
  "./community_health.json",
  "./mental_health.json",
  "./pediatrics.json",
  "./ethics_law.json",
  "./geriatic-nursing.JSON",
  "./health-economics.JSON",
  "./Midwifery.JSON",
  "./nutrition&dietetics.JSON",
  "./primary-health-care.JSON"
];

// Attempt to load JS files
const jsFiles = [
  "./foundation.js",
  "./others.js",
  "./research.js"
];

// Load all JSON files
jsonFiles.forEach(file => {
  const loaded = tryLoad(file);
  if (loaded.length > 0) {
    allQuestions = [...allQuestions, ...loaded];
  }
});

// Load all JS files
jsFiles.forEach(file => {
  const loaded = tryLoad(file);
  if (loaded.length > 0) {
    allQuestions = [...allQuestions, ...loaded];
  }
});

console.log(`✅ Loaded ${allQuestions.length} nursing questions`);

// Export API
module.exports = {
  getQuestions: () => allQuestions,
  
  getQuestionsByTopic: (topic) => {
    if (!topic) return allQuestions;
    const filtered = allQuestions.filter(q => {
      const topicStr = (q.topic || q.subject || q.name || "").toLowerCase();
      return topicStr.includes(topic.toLowerCase());
    });
    return filtered.length > 0 ? filtered : fallbackQuestions;
  },
  
  getRandomQuestions: (count = 10) => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  },
  
  getCount: () => allQuestions.length,
  
  getFallback: () => fallbackQuestions
};
