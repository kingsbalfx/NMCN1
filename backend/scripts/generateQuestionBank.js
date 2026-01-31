/**
 * Full NMCN Question Bank Generator
 * Aligned with Nursing Curriculum Revised 2022
 * AI-powered explanations included
 */

const fs = require("fs");
const { generateQuestion } = require("../src/utils/ai");

// ✅ Full NMCN Curriculum Subjects & Topics
const subjects = [
  {
    name: "Anatomy and Physiology I",
    topics: ["Cells", "Tissues", "Musculoskeletal System", "Cardiovascular System"]
  },
  {
    name: "Foundation of Nursing I",
    topics: ["Introduction to Nursing", "Nursing Process", "Vital Signs", "Infection Control"]
  },
  {
    name: "Introduction to Nursing Informatics",
    topics: ["Health Records", "ICT in Nursing", "Digital Documentation"]
  },
  {
    name: "Use of English",
    topics: ["Communication Skills", "Academic Writing", "Professional English"]
  },
  {
    name: "Applied Physics",
    topics: ["Energy", "Radiation", "Medical Equipment Basics"]
  },
  {
    name: "Applied Chemistry",
    topics: ["Organic Chemistry", "Solutions", "Biochemistry Basics"]
  },
  {
    name: "Microbiology",
    topics: ["Bacteria", "Viruses", "Infection Prevention", "Immunity"]
  },
  {
    name: "Social and Behavioural Science",
    topics: ["Psychology", "Sociology", "Human Behaviour in Health"]
  },
  {
    name: "Anatomy and Physiology II",
    topics: ["Respiratory System", "Digestive System", "Endocrine System"]
  },
  {
    name: "Foundation of Nursing II",
    topics: ["Patient Care", "Nutrition Basics", "Medication Administration"]
  },
  {
    name: "Medical/Surgical Nursing I",
    topics: ["Cardiology", "Respiratory Disorders", "Hypertension"]
  },
  {
    name: "Primary Health Care I",
    topics: ["Community Diagnosis", "Health Promotion", "Preventive Care"]
  },
  {
    name: "Pharmacology I",
    topics: ["Drug Classifications", "Pharmacokinetics", "Adverse Drug Reactions"]
  },
  {
    name: "Nursing Ethics and Jurisprudence",
    topics: ["Ethics", "Legal Issues", "Professional Conduct"]
  },
  {
    name: "Anatomy and Physiology III",
    topics: ["Nervous System", "Renal System", "Reproductive System"]
  },
  {
    name: "Foundation of Nursing III",
    topics: ["Critical Thinking", "Patient Safety", "Care Planning"]
  },
  {
    name: "Medical/Surgical Nursing II",
    topics: ["Nephrology", "Gastrointestinal Disorders", "Diabetes Mellitus"]
  },
  {
    name: "Primary Health Care II",
    topics: ["Maternal Child Health", "Immunization Programs", "Family Health"]
  },
  {
    name: "Pharmacology II",
    topics: ["Antibiotics", "Analgesics", "Antimalarials"]
  },
  {
    name: "Reproductive Health I",
    topics: ["Antenatal Care", "Family Planning", "Safe Motherhood"]
  },
  {
    name: "Research and Statistics I",
    topics: ["Introduction to Research", "Descriptive Statistics", "Data Collection"]
  },
  {
    name: "Foundation of Nursing IV",
    topics: ["Advanced Nursing Skills", "Leadership Basics", "Clinical Judgment"]
  },
  {
    name: "Medical/Surgical Nursing III",
    topics: ["Oncology", "Hematology", "Immune Disorders"]
  },
  {
    name: "Pharmacology III",
    topics: ["Psychiatric Drugs", "Emergency Drugs", "Toxicology"]
  },
  {
    name: "Research Methodology and Statistics II",
    topics: ["Research Design", "Inferential Statistics", "Proposal Writing"]
  },
  {
    name: "Community Health Nursing I",
    topics: ["Epidemiology", "Disease Control", "Environmental Health"]
  },
  {
    name: "Reproductive Health II",
    topics: ["Labour and Delivery", "Obstetric Emergencies", "Postnatal Care"]
  },
  {
    name: "Nutrition and Dietetics",
    topics: ["Therapeutic Diets", "Malnutrition", "Nutrition in Disease"]
  },
  {
    name: "Professional Writing and Seminar in Nursing",
    topics: ["Research Presentation", "Academic Writing", "Seminar Skills"]
  },
  {
    name: "Politics and Governance in Nursing",
    topics: ["Health Policy", "Nursing Leadership", "Professional Regulation"]
  },
  {
    name: "Medical/Surgical Nursing IV",
    topics: ["Neurology", "Orthopedics", "Trauma Nursing"]
  },
  {
    name: "Reproductive Health III",
    topics: ["Gynecological Disorders", "STIs", "Reproductive Cancers"]
  },
  {
    name: "Community Health Nursing II",
    topics: ["School Health", "Occupational Health", "Community Programs"]
  },
  {
    name: "Mental Health/Psychiatric Nursing",
    topics: ["Depression", "Psychosis", "Anxiety Disorders", "Substance Abuse"]
  },
  {
    name: "Emergency and Disaster Nursing",
    topics: ["Triage", "Disaster Management", "Emergency Care"]
  },
  {
    name: "Quality Improvement and Patient Safety",
    topics: ["Clinical Governance", "Error Prevention", "Quality Assurance"]
  },
  {
    name: "Medical/Surgical Nursing V",
    topics: ["Critical Care", "ICU Nursing", "Advanced Clinical Practice"]
  },
  {
    name: "Home Health Care Nursing",
    topics: ["Home Visits", "Chronic Illness Care", "Palliative Nursing"]
  },
  {
    name: "Principles of Management and Teaching",
    topics: ["Nursing Administration", "Teaching Methods", "Supervision"]
  },
  {
    name: "Health Economics",
    topics: ["Health Financing", "Cost Effectiveness", "Resource Allocation"]
  },
  {
    name: "Entrepreneurship in Nursing",
    topics: ["Private Practice", "Innovation", "Business in Healthcare"]
  }
];

// Question Types & Difficulty
const TYPES = ["mcq", "essay", "fill_blank", "clinical"];
const DIFFICULTIES = ["easy", "hard", "pro"];

async function generateFullBank() {
  const bank = [];

  for (const subject of subjects) {
    for (const topic of subject.topics) {
      for (const type of TYPES) {
        for (const difficulty of DIFFICULTIES) {

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
