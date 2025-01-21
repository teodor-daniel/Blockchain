const fs = require("fs");
const hre = require("hardhat");

async function main() {
  const [owner, restaurant, customer] = await hre.ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("Restaurant address:", restaurant.address);
  console.log("Customer address:", customer.address);

  // Deploy DiscountManager
  const DiscountManager = await hre.ethers.getContractFactory("DiscountManager");
  const discountManager = await DiscountManager.deploy();
  await discountManager.waitForDeployment();
  const discountManagerAddress = await discountManager.getAddress();
  console.log("DiscountManager deployed to:", discountManagerAddress);

  // Deploy FastFoodLoyalty
  const FastFoodLoyalty = await hre.ethers.getContractFactory("FastFoodLoyalty");
  const fastFoodLoyalty = await FastFoodLoyalty.deploy(discountManagerAddress);
  await fastFoodLoyalty.waitForDeployment();
  const fastFoodLoyaltyAddress = await fastFoodLoyalty.getAddress();
  console.log("FastFoodLoyalty deployed to:", fastFoodLoyaltyAddress);

  // Register roles for restaurant and customer
  console.log("Registering roles...");
  await fastFoodLoyalty.connect(owner).registerAccount(restaurant.address, 1);
  await fastFoodLoyalty.connect(owner).registerAccount(customer.address, 2);

  // Save addresses
  const addresses = {
    DiscountManager: discountManagerAddress,
    FastFoodLoyalty: fastFoodLoyaltyAddress,
    Owner: owner.address,
    Restaurant: restaurant.address,
    Customer: customer.address,
  };
  fs.writeFileSync("data/contractAddresses.json", JSON.stringify(addresses, null, 2));
  console.log("Contract addresses saved to contractAddresses.json");
}

main().catch((error) => {
  console.error("Error in deployment:", error);
  process.exitCode = 1;
});
