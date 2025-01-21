const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  const addressesPath = path.join(__dirname, "../data/contractAddresses.json");

  if (!fs.existsSync(addressesPath)) {
    console.error("Error: Contract not deployed. Run the deployment script first.");
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  const fastFoodLoyaltyAddress = addresses.FastFoodLoyalty;
  const discountManagerAddress = addresses.DiscountManager;

  const [owner, restaurant, customer] = await ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("Restaurant address:", restaurant.address);
  console.log("Customer address:", customer.address);

  const FastFoodLoyalty = await ethers.getContractFactory("FastFoodLoyalty");
  const fastFoodLoyalty = FastFoodLoyalty.attach(fastFoodLoyaltyAddress);

  const DiscountManager = await ethers.getContractFactory("DiscountManager");
  const discountManager = DiscountManager.attach(discountManagerAddress);

  const restaurantAccountBefore = await fastFoodLoyalty.accounts(restaurant.address);
  if (restaurantAccountBefore.role === 0) {
    console.log("Registering restaurant...");
    await fastFoodLoyalty.connect(owner).registerAccount(restaurant.address, 1);
  }
 
  const customerAccountBefore = await fastFoodLoyalty.accounts(customer.address);
  if (customerAccountBefore.role === 0) {
    console.log("Registering customer...");
    await fastFoodLoyalty.connect(owner).registerAccount(customer.address, 2);
  }

  console.log("Adding menu items...");
  await fastFoodLoyalty.connect(restaurant).addMenuItem("Burger", 5);
  await fastFoodLoyalty.connect(restaurant).addMenuItem("Fries", 3);

  console.log("Customer buying 1 Burger at full price...");
  const burgerPrice = ethers.parseEther("5"); //5 ETH for simplicity
  await fastFoodLoyalty.connect(customer).buy(restaurant.address, 0, 1, {
    value: burgerPrice,
  });

  const customerEthBalanceAfterFirstPurchase = await ethers.provider.getBalance(customer.address);
  const customerPointsAfterFirstPurchase = await fastFoodLoyalty.getCustomerPoints(customer.address);
  console.log(`Customer ETH balance after first Burger: ${ethers.formatEther(customerEthBalanceAfterFirstPurchase)} ETH`);
  console.log(`Customer points after first Burger: ${customerPointsAfterFirstPurchase.toString()}`);

  console.log("Restaurant setting a 20% discount on Burgers...");
  await discountManager.connect(restaurant).setDiscount(restaurant.address, 0, 20); //discount pentru burger.

  console.log("Customer buying 1 Burger with 20% discount...");
  const discountedBurgerPrice = (burgerPrice * 80n) / 100n; // exemplu: 20% discount
  await fastFoodLoyalty.connect(customer).buy(restaurant.address, 0, 1, {
    value: discountedBurgerPrice,
  });
  console.log("Customer buying 1 Salad at full price...");
  const saladPrice = ethers.parseEther("3"); //3 ETH for simplicity
  await fastFoodLoyalty.connect(customer).buy(restaurant.address, 1, 1, {
    value: saladPrice,
  });
  const customerEthBalanceAfterDiscountedPurchase = await ethers.provider.getBalance(customer.address);
  const customerPointsAfterDiscountedPurchase = await fastFoodLoyalty.getCustomerPoints(customer.address);
  console.log(`Customer ETH balance after discounted Burger: ${ethers.formatEther(customerEthBalanceAfterDiscountedPurchase)} ETH`);
  console.log(`Customer points after discounted Burger: ${customerPointsAfterDiscountedPurchase.toString()}`);

  // (Optional) Demonstrație: restaurant își retrage banii
  console.log("Restaurant withdrawing funds...");
  await fastFoodLoyalty.connect(restaurant).withdraw();
  const restaurantBalanceAfter = await ethers.provider.getBalance(restaurant.address);
  console.log("Restaurant ETH balance after withdraw:", ethers.formatEther(restaurantBalanceAfter));
}

main().catch((error) => {
  console.error("Error in script execution:", error);
  process.exitCode = 1;
});
