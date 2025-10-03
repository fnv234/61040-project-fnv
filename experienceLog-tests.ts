/**
 * ExperienceLog Test Cases
 * 
 */

import { ExperienceLog } from './experienceLog';
import { GeminiLLM, Config } from './gemini-llm';



/**
 * Load configuration from config.json
 */
function loadConfig(): Config {
    try {
        const config = require('../config.json');
        return config;
    } catch (error) {
        console.error('❌ Error loading config.json. Please ensure it exists with your API key.');
        console.error('Error details:', (error as Error).message);
        process.exit(1);
    }
}

/**
 * Test case 1: Basic CRUD operations
 * Demonstrates creating, updating, retrieving, and deleting logs
 */
export async function testBasicCRUD(): Promise<void> {
  console.log("\n🧪 TEST CASE 1: Basic CRUD");
  console.log("================================");

  const logSystem = new ExperienceLog();

  console.log("📝 Creating logs...");
  const l1 = logSystem.createLog("user1", "ZenTeaHouse", 5, 2, 4, "Smooth and balanced");
  const l2 = logSystem.createLog("user1", "MatchaLab", 4, 3, 5, "Strong and earthy");
  const l3 = logSystem.createLog("user1", "GreenCorner", 3, 4, 2, "Too sweet");

  console.log("✅ Logs created:", [l1, l2, l3]);

  console.log("\n🔍 Getting logs for user1...");
  console.log(logSystem.getUserLogs("user1"));

  console.log("\n✏️ Updating a log...");
  const updated = logSystem.updateLog(l3.logId, { rating: 2, notes: "Too sweet for my taste" });
  console.log("✅ Updated log:", updated);

  console.log("\n🗑️ Deleting a log...");
  logSystem.deleteLog(l2.logId);
  console.log("✅ Remaining logs:", logSystem.getUserLogs("user1"));
}

/**
 * Test case 2: Average ratings
 * Demonstrates computing averages per place
 */
export async function testAverages(): Promise<void> {
  console.log("\n🧪 TEST CASE 2: Average Ratings");
  console.log("================================");

  const logSystem = new ExperienceLog();

  console.log("📝 Creating logs...");
  logSystem.createLog("user1", "ZenTeaHouse", 5, 2, 5, "Amazing froth");
  logSystem.createLog("user1", "ZenTeaHouse", 4, 3, 4, "Quite good");
  logSystem.createLog("user1", "MatchaLab", 3, 4, 2, "Not my favorite");

  console.log("\n📊 Average rating ZenTeaHouse:", logSystem.getAverageRating("user1", "ZenTeaHouse"));
  console.log("📊 Average rating MatchaLab:", logSystem.getAverageRating("user1", "MatchaLab"));
}

/**
 * Test case 3: AI profile summary
 * Demonstrates generating a taste profile summary from multiple logs
 */
export async function testAIProfileSummary(): Promise<void> {
  console.log("\n🧪 TEST CASE 3: AI Profile Summary");
  console.log("===================================");

  const logSystem = new ExperienceLog();
  const config = loadConfig();
  const llm = new GeminiLLM(config);

  console.log("📝 Creating logs...");
  logSystem.createLog("user1", "ZenTeaHouse", 5, 2, 4, "Smooth and balanced");
  logSystem.createLog("user1", "MatchaLab", 4, 3, 5, "Strong and earthy");
  logSystem.createLog("user1", "GreenCorner", 2, 4, 2, "Too sweet");

  console.log("\n🤖 Generating profile summary via Gemini...");
  const summary = await logSystem.generateProfileSummary("user1", llm);
  console.log("✅ Profile Summary:\n", summary);
}

/**
 * Main function to run all test cases
 */
async function main(): Promise<void> {
  console.log("🍵 ExperienceLog Test Suite");
  console.log("==========================\n");

  try {
    await testBasicCRUD();
    await testAverages();
    await testAIProfileSummary();

    console.log("\n🎉 All test cases completed successfully!");
  } catch (error) {
    console.error("❌ Test error:", (error as Error).message);
    process.exit(1);
  }
}

// Run the tests if this file is executed directly
if (require.main === module) {
  main();
}
