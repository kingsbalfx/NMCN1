/**
 * Kingsbal Digital Healthcare Bridge
 * Full NMCN Question Bank Generator
 *
 * Generates:
 *  - MCQ
 *  - Essay
 *  - Fill-in-the-blank
 *  - Clinical scenario questions
 *
 * Aligned with NMCN curriculum
 * AI-powered explanations included
 */

const fs = require("fs");
const { generateQuestion } = require("../src/utils/ai");

// Full NMCN subjects & topics
const subjects = [
  { name: "Anatomy & Physiology", topics: ["Cardiovascular", "Respiratory", "Nervous System"] },
  { name: "Medical-Surgical Nursing", topics: ["Cardiology", "Nephrology", "Oncology"] },
  { name: "Pediatric Nursing", topics: ["Growth & Development", "Nutrition", "Infections"] },
  { name: "Midwifery", topics: ["Antenatal Care", "Labor & Delivery", "Postnatal Care"] },
  { name: "Community Health Nursing", topics: ["Epidemiology", "Health Promotion"] },
  { name: "Pharmacology", topics: ["Drugs", "Toxicology"] },
  { name: "Mental Health Nursing", topics: ["Depression", "Psychosis", "Anxiety Disorders"] },
  { name: "Nursing Ethics & Professional Practice", topics: ["Ethics", "Legal Issues", "Professionalism"] }
];

const TYPES = ["mcq", "essay", "fill_blank", "clinical"];
const DIFFICULTIES = ["easy", "hard", "pro"];

async function generateFullBank() {
  const bank = [];

  for (const subject of subjects) {
    for (const topic of subject.topics) {
      for (const type of TYPES) {
        for (const difficulty of DIFFICULTIES) {

          // Control scale here
          const count = type === "mcq" ? 5 : 2;

          for (let i = 0; i < count; i++) {
            try {
              const q = await generateQuestion({ topic, type, difficulty });

              bank.push({
                subject: subject.name,
                topic,
                type,
                difficulty,
                ...q
              });

              console.log(
                `Generated: ${subject.name} | ${topic} | ${type} | ${difficulty}`
              );

            } catch (err) {
              console.error("Generation failed:", err.message);
            }
          }
        }
      }
    }
  }

  fs.writeFileSync(
    "nmcn_full_question_bank.json",
    JSON.stringify(bank, null, 2)
  );

  console.log("✅ Full NMCN question bank generated successfully!");
}

// Run script
generateFullBank();
