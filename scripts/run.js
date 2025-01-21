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

  const [owner, restaurant, customer] = await ethers.getSigners();
  console.log("Owner address:", owner.address);
  console.log("Restaurant address:", restaurant.address);
  console.log("Customer address:", customer.address);

  const FastFoodLoyalty = await ethers.getContractFactory("FastFoodLoyalty");
  const fastFoodLoyalty = FastFoodLoyalty.attach(fastFoodLoyaltyAddress);

  const restaurantAccountBefore = await fastFoodLoyalty.accounts(restaurant.address);
  if (restaurantAccountBefore.role === 0) {
    console.log("Registering restaurant...");
    await fastFoodLoyalty.connect(owner).registerAccount(restaurant.address, 1);
  }
  const restaurantAccountAfter = await fastFoodLoyalty.accounts(restaurant.address);
  console.log(`Role for restaurant: ${restaurantAccountAfter.role}`);

  const customerAccountBefore = await fastFoodLoyalty.accounts(customer.address);
  if (customerAccountBefore.role === 0) {
    console.log("Registering customer...");
    await fastFoodLoyalty.connect(owner).registerAccount(customer.address, 2);
  }
  const customerAccountAfter = await fastFoodLoyalty.accounts(customer.address);
  console.log(`Role for customer: ${customerAccountAfter.role}`);

  //Add menu items
  console.log("Adding menu items...");
  await fastFoodLoyalty.connect(restaurant).addMenuItem("Burger", 5);
  await fastFoodLoyalty.connect(restaurant).addMenuItem("Fries", 3);

  console.log("Customer buying 2 Burgers...");
  const burgerPrice = 5;
  const totalEthForBurgers = ethers.parseEther((burgerPrice * 2).toString());
  await fastFoodLoyalty.connect(customer).buy(restaurant.address, 0, 2, {
    value: totalEthForBurgers,
  });

  //Check ETH and points for customer
  const customerEthBalance = await ethers.provider.getBalance(customer.address);
  const customerPoints = await fastFoodLoyalty.getCustomerPoints(customer.address);
  console.log(`Customer ETH balance after buying 2 Burgers: ${ethers.formatEther(customerEthBalance)} ETH`);
  console.log(`Customer points after buying 2 Burgers: ${customerPoints.toString()}`);

  //Add Salad to menu
  console.log("Adding Salad to menu...");
  await fastFoodLoyalty.connect(restaurant).addMenuItem("Salad", 3);

  //Simulate customer redeeming 1 Salad
  console.log("Customer redeeming 1 Salad...");
  await fastFoodLoyalty.connect(customer).redeemItem(restaurant.address, 2);

  //Check final points for customer and redeemed points for restaurant
  const finalCustomerPoints = await fastFoodLoyalty.getCustomerPoints(customer.address);
  console.log(`Customer points after redeeming 1 Salad: ${finalCustomerPoints.toString()}`);

  const restaurantRedeemedPoints = await fastFoodLoyalty.getRestaurantRedeemedPoints(restaurant.address);
  console.log(`Restaurant redeemed points: ${restaurantRedeemedPoints.toString()}`);
  

}

main().catch((error) => {
  console.error("Error in script execution:", error);
  process.exitCode = 1;
});
