const fs = require("fs");
const path = require("path");
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

  console.log("Registering roles...");
  await fastFoodLoyalty.connect(owner).registerAccount(restaurant.address, 1); // Restaurant
  await fastFoodLoyalty.connect(owner).registerAccount(customer.address, 2); // Customer

  const addresses = {
    DiscountManager: discountManagerAddress,
    FastFoodLoyalty: fastFoodLoyaltyAddress,
    Owner: owner.address,
    Restaurant: restaurant.address,
    Customer: customer.address,
  };
  fs.writeFileSync(
    "data/contractAddresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("Contract addresses saved to contractAddresses.json");


  // 1) FastFoodLoyalty
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

  // 2) DiscountManager
  const discountArtifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "DiscountManager.sol",
    "DiscountManager.json"
  );
  const discountArtifact = JSON.parse(fs.readFileSync(discountArtifactPath, "utf8"));
  const discountAbi = discountArtifact.abi;

  // Destination folder for ABIs
  const abiDestDir = path.join(__dirname, "..", "web", "src", "abis");
  if (!fs.existsSync(abiDestDir)) {
    fs.mkdirSync(abiDestDir, { recursive: true });
  }

  // Write FastFoodLoyalty.json
  const loyaltyAbiDest = path.join(abiDestDir, "FastFoodLoyalty.json");
  const loyaltyOutput = {
    address: fastFoodLoyaltyAddress,
    owner: owner.address,
    restaurant: restaurant.address,
    customer: customer.address,
    discountManager: discountManagerAddress,
    abi: loyaltyAbi,
  };
  fs.writeFileSync(loyaltyAbiDest, JSON.stringify(loyaltyOutput, null, 2));
  console.log("FastFoodLoyalty ABI + address copied to:", loyaltyAbiDest);

  // Write DiscountManager.json (if you want it)
  const discountAbiDest = path.join(abiDestDir, "DiscountManager.json");
  const discountOutput = {
    address: discountManagerAddress,
    owner: owner.address,
    abi: discountAbi,
  };
  fs.writeFileSync(discountAbiDest, JSON.stringify(discountOutput, null, 2));
  console.log("DiscountManager ABI + address copied to:", discountAbiDest);

  console.log("Deployment + ABI export complete!");
}

main().catch((error) => {
  console.error("Error in deployment:", error);
  process.exitCode = 1;
});
