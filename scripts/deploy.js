const hre = require("hardhat");

async function main() {
  // Compile the contract
  console.log("Compiling contracts...");
  await hre.run("compile");

  // Get the contract factory
  console.log("Fetching contract factory...");
  const LoyaltyPoints = await hre.ethers.getContractFactory("LoyaltyPoints");

  // Deploy the contract
  console.log("Deploying contract...");
  const loyaltyPoints = await LoyaltyPoints.deploy();

  // Wait for the deployment transaction to be mined
  const txReceipt = await loyaltyPoints.deploymentTransaction().wait();

  // Print the contract address
  console.log("LoyaltyPoints deployed to:", loyaltyPoints.target);
}

// Execute the deployment script
main().catch((error) => {
  console.error("Error in deployment:", error);
  process.exitCode = 1;
});
