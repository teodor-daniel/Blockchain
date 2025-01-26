// const { expect } = require("chai");
// const { ethers } = require("hardhat");

// describe("FastFoodLoyalty Gas Analysis", function () {
//   let fastFoodLoyalty, discountManager, owner, customer, restaurant;

//   beforeEach(async function () {
//     [owner, customer, restaurant] = await ethers.getSigners();

//     // Deploy DiscountManager contract
//     const DiscountManager = await ethers.getContractFactory("DiscountManager");
//     discountManager = await DiscountManager.connect(owner).deploy(); // Deploy the contract
//     await discountManager.deployTransaction.wait(); // Ensure it's mined

//     // Deploy FastFoodLoyalty contract with DiscountManager address
//     const FastFoodLoyalty = await ethers.getContractFactory("FastFoodLoyalty");
//     fastFoodLoyalty = await FastFoodLoyalty.connect(owner).deploy(discountManager.address);
//     await fastFoodLoyalty.deployTransaction.wait(); // Ensure it's mined

//     // Register roles
//     await fastFoodLoyalty.connect(owner).registerAccount(restaurant.address, 1); // Restaurant
//     await fastFoodLoyalty.connect(owner).registerAccount(customer.address, 2); // Customer

//     // Add menu item
//     await fastFoodLoyalty.connect(restaurant).addMenuItem("Burger", ethers.utils.parseEther("0.01"));
// });


//   it("Should estimate gas for buy()", async function () {
//     // Set a discount
//     await discountManager.setDiscount(restaurant.address, 0, 20); // 20% discount

//     // Perform a buy
//     const tx = await fastFoodLoyalty
//       .connect(customer)
//       .buy(restaurant.address, 0, 1, { value: ethers.utils.parseEther("0.008") }); // 20% discount applied

//     const receipt = await tx.wait();
//     console.log("Gas used for buy():", receipt.gasUsed.toString());
//   });

//   it("Should estimate gas for redeemItem()", async function () {
//     // Award points manually for simplicity
//     await fastFoodLoyalty.connect(owner).registerAccount(customer.address, 2);
//     await fastFoodLoyalty.connect(customer).buy(restaurant.address, 0, 1, { value: ethers.utils.parseEther("0.01") });

//     // Redeem item
//     const tx = await fastFoodLoyalty.connect(customer).redeemItem(restaurant.address, 0);
//     const receipt = await tx.wait();
//     console.log("Gas used for redeemItem():", receipt.gasUsed.toString());
//   });
// });
