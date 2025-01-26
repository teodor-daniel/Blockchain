const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [owner, restaurant1, restaurant2, customer] = await hre.ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("Restaurant 1 address:", restaurant1.address);
  console.log("Restaurant 2 address:", restaurant2.address);
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

  console.log("Registering roles...");
  await fastFoodLoyalty.connect(owner).registerAccount(restaurant1.address, 1);
  await fastFoodLoyalty.connect(owner).registerAccount(restaurant2.address, 1); 
  await fastFoodLoyalty.connect(owner).registerAccount(customer.address, 2); 
  console.log('Adding Burger to menus...');
  await fastFoodLoyalty.connect(restaurant1).addMenuItem("Simple Burger", ethers.parseEther("5")); 
  console.log('Added "Simple Burger" to Restaurant 1 menu.');

  await fastFoodLoyalty.connect(restaurant2).addMenuItem("Burger Deluxe", ethers.parseEther("10")); 
  console.log('Added "Burger Deluxe" to Restaurant 2 menu.');

  // Save addresses in JSON
  const addresses = {
    DiscountManager: discountManagerAddress,
    FastFoodLoyalty: fastFoodLoyaltyAddress,
    Owner: owner.address,
    Restaurants: [
      { name: "Restaurant 1", address: restaurant1.address },
      { name: "Restaurant 2", address: restaurant2.address },
    ],
    Customer: customer.address,
  };
  fs.writeFileSync(
    "data/contractAddresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("Contract addresses saved to contractAddresses.json");

  // Save ABIs and embedded addresses
  const abiDestDir = path.join(__dirname, "..", "web", "src", "abis");
  if (!fs.existsSync(abiDestDir)) {
    fs.mkdirSync(abiDestDir, { recursive: true });
  }

  const loyaltyArtifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "FastFoodLoyalty.sol",
    "FastFoodLoyalty.json"
  );
  const loyaltyArtifact = JSON.parse(fs.readFileSync(loyaltyArtifactPath, "utf8"));
  const loyaltyAbi = loyaltyArtifact.abi;
  const loyaltyAbiDest = path.join(abiDestDir, "FastFoodLoyalty.json");
  const loyaltyOutput = {
    address: fastFoodLoyaltyAddress,
    owner: owner.address,
    restaurants: [
      { name: "Restaurant 1", address: restaurant1.address },
      { name: "Restaurant 2", address: restaurant2.address },
    ],
    customer: customer.address,
    discountManager: discountManagerAddress,
    abi: loyaltyAbi,
  };
  fs.writeFileSync(loyaltyAbiDest, JSON.stringify(loyaltyOutput, null, 2));
  console.log("FastFoodLoyalty ABI + address copied to:", loyaltyAbiDest);
}

main().catch((error) => {
  console.error("Error in deployment:", error);
  process.exitCode = 1;
});