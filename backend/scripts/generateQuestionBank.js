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
    topics: ["Levels of organization", "Cell structure and function", "Tissues", "Skeletal system", "Joints", "Muscular system"]
  },
  {
    name: "Anatomy and Physiology II",
    topics: ["Cardiovascular system", "Blood composition", "Respiratory system", "Digestive system", "Urinary system", "Endocrine system"]
  },
  {
    name: "Foundation of Nursing I",
    topics: ["History of Nursing", "Roles of a nurse", "Ethics and legal issues", "Communication", "Health and illness concepts", "Infection prevention", "Vital signs"]
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
    topics: ["Micro-organisms", "Sterilization", "Disinfection", "Immunity"]
  },
  {
    name: "Social and Behavioural Science",
    topics: ["Psychology", "Sociology", "Human Behaviour in Health"]
  },
  {
    name: "Foundation of Nursing II",
    topics: ["Nursing process", "Patient assessment", "Documentation", "Hygiene and comfort", "Bed making", "Positioning patients"]
  },
  {
    name: "Medical/Surgical Nursing I",
    topics: ["Patient care principles", "Pain management", "Fluid and electrolyte balance", "Pre/Post-operative care"]
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
    topics: ["Advanced nursing procedures", "Leadership", "Supervision", "Ethical decision-making"]
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
  },
  {
    name: "Home Healthcare Nursing",
    topics: ["Home-based care", "Chronic disease management", "Palliative care", "Family-centered care"]
  },
  {
    name: "Principles of Management and Teaching",
    topics: ["Leadership styles", "Nursing administration", "Teaching methods", "Clinical supervision"]
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
              // Enhanced prompt logic to include curriculum context for essay answers
              const q = await generateQuestion({ 
                topic, 
                type, 
                difficulty,
                curriculumContext: subject.name 
              });

              bank.push({
                subject: subject.name,
                topic,
                type,
                difficulty,
                ...q,
                generatedAt: new Date().toISOString()
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
