const fs = require("fs");
const hre = require("hardhat");

async function main() {
  const [owner, restaurant, customer] = await hre.ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("Restaurant address:", restaurant.address);
  console.log("Customer address:", customer.address);

  // Deploy FastFoodLoyalty
  const FastFoodLoyalty = await hre.ethers.getContractFactory("FastFoodLoyalty");
  const fastFoodLoyalty = await FastFoodLoyalty.deploy();
  await fastFoodLoyalty.waitForDeployment();
  const fastFoodLoyaltyAddress = await fastFoodLoyalty.getAddress();
  console.log("FastFoodLoyalty deployed to:", fastFoodLoyaltyAddress);

  // Register roles for restaurant and customer
  console.log("Registering roles...");
  await fastFoodLoyalty.connect(owner).registerAccount(restaurant.address, 1); // Register restaurant as Role.Restaurant
  await fastFoodLoyalty.connect(owner).registerAccount(customer.address, 2); // Register customer as Role.Customer

  // Verify roles
  const restaurantAccount = await fastFoodLoyalty.accounts(restaurant.address);
  const customerAccount = await fastFoodLoyalty.accounts(customer.address);
  console.log(`Role for restaurant: ${restaurantAccount.role}`); // Should be 1
  console.log(`Role for customer: ${customerAccount.role}`); // Should be 2

  // Save the contract address and signer addresses
  const addresses = {
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
