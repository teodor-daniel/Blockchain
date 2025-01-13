const hre = require("hardhat");

async function main() {
  console.log("Compiling contracts...");
  await hre.run("compile");

  // Deploy ProductManager
  console.log("Deploying ProductManager...");
  const ProductManager = await hre.ethers.getContractFactory("ProductManager");
  const productManager = await ProductManager.deploy();
  console.log("Waiting for ProductManager deployment...");
  await productManager.deploymentTransaction();
  console.log("ProductManager deployed to:", productManager.target || productManager.address);

  // Deploy ItemManager
  console.log("Deploying ItemManager...");
  const ItemManager = await hre.ethers.getContractFactory("ItemManager");
  const itemManager = await ItemManager.deploy();
  console.log("Waiting for ItemManager deployment...");
  await itemManager.deploymentTransaction();
  console.log("ItemManager deployed to:", itemManager.target || itemManager.address);

  // Deploy LoyaltyPoints
  console.log("Deploying LoyaltyPoints...");
  const LoyaltyPoints = await hre.ethers.getContractFactory("LoyaltyPoints");
  const loyaltyPoints = await LoyaltyPoints.deploy(productManager.target || productManager.address, itemManager.target || itemManager.address);
  console.log("Waiting for LoyaltyPoints deployment...");
  await loyaltyPoints.deploymentTransaction();
  console.log("LoyaltyPoints deployed to:", loyaltyPoints.target || loyaltyPoints.address);

  console.log("Deployment complete!");
}

// Execute the script
main().catch((error) => {
  console.error("Error in deployment:", error);
  process.exitCode = 1;
});
