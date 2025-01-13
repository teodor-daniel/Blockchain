const hre = require("hardhat");

async function main() {
  // Contract addresses from the deployment
  const productManagerAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const itemManagerAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const loyaltyPointsAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  // Get the contract factories
  const ProductManager = await hre.ethers.getContractFactory("ProductManager");
  const ItemManager = await hre.ethers.getContractFactory("ItemManager");
  const LoyaltyPoints = await hre.ethers.getContractFactory("LoyaltyPoints");

  // Attach the deployed contracts
  const productManager = ProductManager.attach(productManagerAddress);
  const itemManager = ItemManager.attach(itemManagerAddress);
  const loyaltyPoints = LoyaltyPoints.attach(loyaltyPointsAddress);

  // Add products to ProductManager
  console.log("Adding products...");
  await productManager.addProduct(1, "Product A", 10);
  await productManager.addProduct(2, "Product B", 5);
  console.log("Products added!");

  // Add items to ItemManager
  console.log("Adding items...");
  await itemManager.addItem(1, "Item A", 0); // Basic
  await itemManager.addItem(2, "Item B", 1); // Premium
  await itemManager.addItem(3, "Item C", 2); // Exclusive
  console.log("Items added!");

  // Award points based on item type
  console.log("Awarding points for items...");
  const [signer] = await hre.ethers.getSigners();
  await loyaltyPoints.connect(signer).awardPointsForItem(1); // Basic
  await loyaltyPoints.connect(signer).awardPointsForItem(2); // Premium
  console.log("Points awarded!");

  // Check points balance
  const pointsBalance = await loyaltyPoints.getPoints(signer.address);
  console.log("User points balance:", pointsBalance.toString());

  // Redeem points for a product
  console.log("Redeeming points for Product A...");
  await loyaltyPoints.connect(signer).redeemPointsForProduct(1);
  const updatedPointsBalance = await loyaltyPoints.getPoints(signer.address);
  console.log("Updated points balance:", updatedPointsBalance.toString());
}

// Execute the script
main().catch((error) => {
  console.error("Error in interaction:", error);
  process.exitCode = 1;
});
