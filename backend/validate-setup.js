#!/usr/bin/env node

/**
 * Kingsbal Backend Setup Validator
 * Run this script to verify all components are properly configured
 */

const fs = require("fs");
const path = require("path");

console.log("\n🔍 Kingsbal Backend Setup Validator\n");

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function checkFile(filePath, description) {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${description}`);
      checks.passed++;
      return true;
    } else {
      console.log(`❌ ${description} - File not found: ${filePath}`);
      checks.failed++;
      return false;
    }
  } catch (err) {
    console.log(`❌ ${description} - Error: ${err.message}`);
    checks.failed++;
    return false;
  }
}

function checkDirectory(dirPath, description) {
  try {
    const fullPath = path.join(__dirname, dirPath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      console.log(`✅ ${description}`);
      checks.passed++;
      return true;
    } else {
      console.log(`❌ ${description} - Directory not found: ${dirPath}`);
      checks.failed++;
      return false;
    }
  } catch (err) {
    console.log(`❌ ${description} - Error: ${err.message}`);
    checks.failed++;
    return false;
  }
}

function checkEnv() {
  try {
    const envPath = path.join(__dirname, ".env");
    if (fs.existsSync(envPath)) {
      console.log(`✅ .env file exists`);
      checks.passed++;

      const envContent = fs.readFileSync(envPath, "utf-8");
      const requiredVars = [
        "DATABASE_URL",
        "JWT_SECRET",
        "OPENAI_API_KEY",
        "NODE_ENV",
      ];

      let missingVars = [];
      requiredVars.forEach((varName) => {
        if (!envContent.includes(varName)) {
          missingVars.push(varName);
        }
      });

      if (missingVars.length === 0) {
        console.log(`✅ All required environment variables are set`);
        checks.passed++;
      } else {
        console.log(
          `⚠️  Missing environment variables: ${missingVars.join(", ")}`
        );
        checks.warnings++;
      }
    } else {
      console.log(`⚠️  .env file not found (using .env.example as template)`);
      checks.warnings++;
    }
  } catch (err) {
    console.log(`❌ Error checking .env: ${err.message}`);
    checks.failed++;
  }
}

function checkPackageJson() {
  try {
    const pkgPath = path.join(__dirname, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    const requiredDeps = [
      "express",
      "pg",
      "jsonwebtoken",
      "bcryptjs",
      "openai",
      "dotenv",
    ];

    let missingDeps = [];
    requiredDeps.forEach((dep) => {
      if (!pkg.dependencies[dep]) {
        missingDeps.push(dep);
      }
    });

    if (missingDeps.length === 0) {
      console.log(`✅ All required dependencies are listed in package.json`);
      checks.passed++;
    } else {
      console.log(`❌ Missing dependencies: ${missingDeps.join(", ")}`);
      checks.failed++;
    }

    if (pkg.scripts && pkg.scripts.start && pkg.scripts.dev) {
      console.log(`✅ Start and dev scripts are configured`);
      checks.passed++;
    } else {
      console.log(`❌ Missing start or dev scripts in package.json`);
      checks.failed++;
    }
  } catch (err) {
    console.log(`❌ Error checking package.json: ${err.message}`);
    checks.failed++;
  }
}

console.log("📋 Checking File Structure...\n");

// Check source files
checkFile("src/server.js", "Main server file");
checkFile("src/config/db.js", "Database configuration");
checkFile("src/utils/ai.js", "AI utilities");
checkFile("api/index.js", "API entry point");

console.log("\n📁 Checking Directories...\n");

checkDirectory("src/modules/auth", "Auth module");
checkDirectory("src/modules/questions", "Questions module");
checkDirectory("src/modules/exams", "Exams module");
checkDirectory("src/modules/admin", "Admin module");
checkDirectory("src/modules/payments", "Payments module");
checkDirectory("src/modules/users", "Users module");
checkDirectory("src/modules/curriculum", "Curriculum module");
checkDirectory("src/middleware", "Middleware directory");

console.log("\n📋 Checking Route Files...\n");

checkFile("src/modules/auth/auth.routes.js", "Auth routes");
checkFile("src/modules/questions/questions.routes.js", "Questions routes");
checkFile("src/modules/questions/explain.routes.js", "Explain routes");
checkFile("src/modules/exams/exams.routes.js", "Exams routes");
checkFile("src/modules/admin/admin.routes.js", "Admin routes");
checkFile("src/modules/admin/ai_questions.routes.js", "AI Questions routes");
checkFile("src/modules/payments/payments.routes.js", "Payments routes");
checkFile("src/modules/users/users.routes.js", "Users routes");
checkFile("src/modules/curriculum/curriculum.routes.js", "Curriculum routes");

console.log("\n⚙️  Checking Middleware...\n");

checkFile("src/middleware/auth.js", "Auth middleware");
checkFile("src/middleware/admin.js", "Admin middleware");
checkFile("src/middleware/subscription.js", "Subscription middleware");
checkFile("src/middleware/errorHandler.js", "Error handler middleware");

console.log("\n📚 Checking Configuration...\n");

checkFile("package.json", "Package configuration");
checkFile(".env.example", "Environment template");
checkFile("vercel.json", "Vercel configuration");

console.log("\n📖 Checking Documentation...\n");

checkFile("BACKEND_README.md", "Backend README");
checkFile("API_DOCUMENTATION.md", "API Documentation");
checkFile("DATABASE_SCHEMA.sql", "Database schema");

console.log("\n🔐 Checking Environment...\n");

checkEnv();
checkPackageJson();

console.log("\n" + "=".repeat(50));
console.log("\n📊 Setup Validation Summary\n");
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);

const total = checks.passed + checks.failed + checks.warnings;
const percentage = Math.round((checks.passed / total) * 100);

console.log(`\n📈 Overall Status: ${percentage}% Complete\n`);

if (checks.failed === 0) {
  console.log("🎉 All checks passed! You're ready to go.\n");
  console.log("Next steps:");
  console.log("1. npm install");
  console.log("2. Configure .env with your credentials");
  console.log("3. npm run dev");
  console.log("\n");
  process.exit(0);
} else {
  console.log("⚠️  Please fix the errors above and try again.\n");
  process.exit(1);
}
