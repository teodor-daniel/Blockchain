const hre = require("hardhat");

async function main() {
  console.log("Compiling contracts...");
  await hre.run("compile");

  // Deploy ProductManager
  console.log("Deploying ProductManager...");
  const ProductManager = await hre.ethers.getContractFactory("ProductManager");
  const productManager = await ProductManager.deploy();
  console.log("ProductManager deployed to:", productManager.target);

  // Deploy LoyaltyPoints
  console.log("Deploying LoyaltyPoints...");
  const LoyaltyPoints = await hre.ethers.getContractFactory("LoyaltyPoints");
  const loyaltyPoints = await LoyaltyPoints.deploy(productManager.target);
  console.log("LoyaltyPoints deployed to:", loyaltyPoints.target);
}

// Execute the script
main().catch((error) => {
  console.error("Error in deployment:", error);
  process.exitCode = 1;
});
