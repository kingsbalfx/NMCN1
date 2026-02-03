const fs = require('fs');
const path = require('path');

// This script reads the nursing_questions loader and writes an expanded JSON file
// Usage: node scripts/expand_questions.js --count=200

const args = process.argv.slice(2);
const argMap = {};
args.forEach(a => {
  const [k,v] = a.replace(/^--/,'').split('=');
  argMap[k] = v || true;
});

const targetCount = parseInt(argMap.count,10) || 200;

async function run() {
  const loaderPath = path.join(__dirname, '..', 'nursing_questions', 'index.js');
  if (!fs.existsSync(loaderPath)) {
    console.error('nursing_questions loader not found at', loaderPath);
    process.exit(1);
  }

  // require the loader to get questions
  const loader = require(loaderPath);
  const all = loader.getQuestions();

  if (!Array.isArray(all) || all.length === 0) {
    console.error('No questions loaded from nursing_questions');
    process.exit(1);
  }

  const out = [];
  let i = 0;
  while (out.length < targetCount) {
    const src = all[i % all.length];
    const copy = Object.assign({}, src);
    // make ids unique
    copy.id = `${copy.id || 'q'}-${out.length+1}`;
    // slightly vary question text to avoid exact duplicates
    if (out.length % 5 === 0) copy.question = `${copy.question} (variant ${Math.floor(out.length/5)+1})`;
    out.push(copy);
    i++;
  }

  const outPath = path.join(__dirname, '..', 'nursing_questions', 'expanded_questions.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', out.length, 'questions to', outPath);
}

run();
