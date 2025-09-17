const hre = require("hardhat");

async function main() {
  console.log("🔨 Compiling contracts...");
  
  await hre.run("compile");
  
  console.log("✅ Contracts compiled successfully!");
  console.log("📁 Artifacts saved to:", hre.config.paths.artifacts);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Compilation failed:", error);
    process.exit(1);
  });
