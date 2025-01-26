const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FastFoodLoyalty and DiscountManager Tests", function () {
  let owner, restaurant1, restaurant2, customer;
  let DiscountManager, FastFoodLoyalty;
  let discountManager, fastFoodLoyalty;

  beforeEach(async function () {
    [owner, restaurant1, restaurant2, customer] = await ethers.getSigners();

    // Deploy DiscountManager
    DiscountManager = await ethers.getContractFactory("DiscountManager");
    discountManager = await DiscountManager.deploy();
    console.log("Deploying DiscountManager...");

    await discountManager.waitForDeployment();
    const discountManagerAddress = await discountManager.getAddress();
    console.log(`DiscountManager deployed at: ${discountManagerAddress}`);

    // Deploy FastFoodLoyalty with DiscountManager address
    FastFoodLoyalty = await ethers.getContractFactory("FastFoodLoyalty");
    fastFoodLoyalty = await FastFoodLoyalty.deploy(discountManagerAddress);
    console.log("Deploying FastFoodLoyalty...");

    await fastFoodLoyalty.waitForDeployment();
    const fastFoodLoyaltyAddress = await fastFoodLoyalty.getAddress();
    console.log(`FastFoodLoyalty deployed at: ${fastFoodLoyaltyAddress}`);

    // Register roles
    await fastFoodLoyalty.connect(owner).registerAccount(restaurant1.address, 1); // Restaurant 1
    await fastFoodLoyalty.connect(owner).registerAccount(restaurant2.address, 1); // Restaurant 2
    await fastFoodLoyalty.connect(owner).registerAccount(customer.address, 2); // Customer
  });

  // a. Test Adding Menu Items for Multiple Restaurants
  it("should allow multiple restaurants to add their own menu items", async function () {
    // Restaurant 1 adds "Simple Burger"
    await fastFoodLoyalty.connect(restaurant1).addMenuItem("Simple Burger", ethers.parseEther("5"));
    let menu1 = await fastFoodLoyalty.getMenu(restaurant1.address);
    expect(menu1.length).to.equal(1);
    expect(menu1[0].name).to.equal("Simple Burger");
    expect(menu1[0].price).to.equal(ethers.parseEther("5"));

    // Restaurant 2 adds "Burger Deluxe"
    await fastFoodLoyalty.connect(restaurant2).addMenuItem("Burger Deluxe", ethers.parseEther("10"));
    let menu2 = await fastFoodLoyalty.getMenu(restaurant2.address);
    expect(menu2.length).to.equal(1);
    expect(menu2[0].name).to.equal("Burger Deluxe");
    expect(menu2[0].price).to.equal(ethers.parseEther("10"));
  });

  // b. Test Purchases from Multiple Restaurants
  it("should allow a customer to buy items from multiple restaurants", async function () {
    // Add menu items
    await fastFoodLoyalty.connect(restaurant1).addMenuItem("Simple Burger", ethers.parseEther("5"));
    await fastFoodLoyalty.connect(restaurant2).addMenuItem("Burger Deluxe", ethers.parseEther("10"));

    // Purchase from Restaurant 1
    const burgerPrice = ethers.parseEther("5");
    const buyTx1 = await fastFoodLoyalty.connect(customer).buy(restaurant1.address, 0, 1, {
      value: burgerPrice,
    });
    await buyTx1.wait();

    // Purchase from Restaurant 2
    const deluxePrice = ethers.parseEther("10");
    const buyTx2 = await fastFoodLoyalty.connect(customer).buy(restaurant2.address, 0, 1, {
      value: deluxePrice,
    });
    await buyTx2.wait();

    // Check customer points
    const customerPoints = await fastFoodLoyalty.getCustomerPoints(customer.address);
    console.log(`Customer points after purchases: ${customerPoints}`);
    expect(customerPoints).to.equal(15000); // 5000 + 10000

    // Check restaurant balances
    const balance1 = await fastFoodLoyalty.balances(restaurant1.address);
    expect(balance1).to.equal(burgerPrice);

    const balance2 = await fastFoodLoyalty.balances(restaurant2.address);
    expect(balance2).to.equal(deluxePrice);
  });

  // c. Test Applying Discounts for Multiple Restaurants
  it("should allow multiple restaurants to apply and handle discounts", async function () {
    // Add menu items
    await fastFoodLoyalty.connect(restaurant1).addMenuItem("Simple Burger", ethers.parseEther("5"));
    await fastFoodLoyalty.connect(restaurant2).addMenuItem("Burger Deluxe", ethers.parseEther("10"));

    // Apply 20% discount on Restaurant 1's "Simple Burger"
    await discountManager.connect(restaurant1).setDiscount(restaurant1.address, 0, 20);
    const discount1 = await discountManager.getDiscount(restaurant1.address, 0);
    expect(discount1).to.equal(20);

    // Apply 50% discount on Restaurant 2's "Burger Deluxe"
    await discountManager.connect(restaurant2).setDiscount(restaurant2.address, 0, 50);
    const discount2 = await discountManager.getDiscount(restaurant2.address, 0);
    expect(discount2).to.equal(50);

    // Customer buys discounted "Simple Burger" from Restaurant 1
    const discountedBurgerPrice = ethers.parseEther("4"); // 5 ETH - 20% = 4 ETH
    const buyTx1 = await fastFoodLoyalty.connect(customer).buy(restaurant1.address, 0, 1, {
      value: discountedBurgerPrice,
    });
    await buyTx1.wait();

    // Customer buys discounted "Burger Deluxe" from Restaurant 2
    const discountedDeluxePrice = ethers.parseEther("5"); // 10 ETH - 50% = 5 ETH
    const buyTx2 = await fastFoodLoyalty.connect(customer).buy(restaurant2.address, 0, 1, {
      value: discountedDeluxePrice,
    });
    await buyTx2.wait();

    // Check customer points
    const customerPoints = await fastFoodLoyalty.getCustomerPoints(customer.address);
    console.log(`Customer points after discounted purchases: ${customerPoints}`);
    expect(customerPoints).to.equal(9000); // 4000 + 5000

    // Check restaurant balances
    const balance1 = await fastFoodLoyalty.balances(restaurant1.address);
    expect(balance1).to.equal(discountedBurgerPrice);

    const balance2 = await fastFoodLoyalty.balances(restaurant2.address);
    expect(balance2).to.equal(discountedDeluxePrice);
  });

  // d. Test Reverting on Insufficient ETH
  it("should revert if a customer tries to buy with insufficient ETH", async function () {
    // Add menu item
    await fastFoodLoyalty.connect(restaurant1).addMenuItem("Simple Burger", ethers.parseEther("5"));

    // Attempt to buy with insufficient ETH
    await expect(
      fastFoodLoyalty.connect(customer).buy(restaurant1.address, 0, 1, {
        value: ethers.parseEther("4"), // Insufficient ETH
      })
    ).to.be.revertedWith("Insufficient ETH sent");
  });

  // f. Test Redeeming Points
  it("should allow customers to redeem points for items from multiple restaurants", async function () {
    // Add menu items
    await fastFoodLoyalty.connect(restaurant1).addMenuItem("Simple Burger", ethers.parseEther("5"));
    await fastFoodLoyalty.connect(restaurant2).addMenuItem("Burger Deluxe", ethers.parseEther("10"));

    // Customer purchases
    const buyTx1 = await fastFoodLoyalty.connect(customer).buy(restaurant1.address, 0, 1, {
        value: ethers.parseEther("5"),
    });
    await buyTx1.wait();

    const buyTx2 = await fastFoodLoyalty.connect(customer).buy(restaurant2.address, 0, 1, {
        value: ethers.parseEther("10"),
    });
    await buyTx2.wait();

    // Check customer points
    const points = await fastFoodLoyalty.getCustomerPoints(customer.address);
    console.log(`Customer points before redemption: ${points}`);
    expect(points).to.equal(15000); // 5000 + 10000

    // Redeem "Simple Burger" from Restaurant 1 (requires 5 ETH / 1e15 = 5000 points)
    const redeemTx1 = await fastFoodLoyalty.connect(customer).redeemItem(restaurant1.address, 0);
    await redeemTx1.wait();

    // Check points after first redemption
    const pointsAfterRedeem1 = await fastFoodLoyalty.getCustomerPoints(customer.address);
    console.log(`Customer points after first redemption: ${pointsAfterRedeem1}`);
    expect(pointsAfterRedeem1).to.equal(10000); // 15000 - 5000

    // Redeem "Burger Deluxe" from Restaurant 2 (requires 10 ETH / 1e15 = 10000 points)
    const redeemTx2 = await fastFoodLoyalty.connect(customer).redeemItem(restaurant2.address, 0);
    await redeemTx2.wait();

    // Check customer points after second redemption
    const pointsAfterRedeem2 = await fastFoodLoyalty.getCustomerPoints(customer.address);
    console.log(`Customer points after second redemption: ${pointsAfterRedeem2}`);
    expect(pointsAfterRedeem2).to.equal(0); // 10000 - 10000
});


  // g. Test Event Emissions
  it("should emit events correctly during various operations", async function () {
    // Add menu items and expect MenuItemAdded events
    await expect(
      fastFoodLoyalty.connect(restaurant1).addMenuItem("Simple Burger", ethers.parseEther("5"))
    )
      .to.emit(fastFoodLoyalty, "MenuItemAdded")
      .withArgs(restaurant1.address, "Simple Burger", ethers.parseEther("5"));

    await expect(
      fastFoodLoyalty.connect(restaurant2).addMenuItem("Burger Deluxe", ethers.parseEther("10"))
    )
      .to.emit(fastFoodLoyalty, "MenuItemAdded")
      .withArgs(restaurant2.address, "Burger Deluxe", ethers.parseEther("10"));

    // Apply discounts and expect DiscountSet events
    await expect(
      discountManager.connect(restaurant1).setDiscount(restaurant1.address, 0, 20)
    )
      .to.emit(discountManager, "DiscountSet")
      .withArgs(restaurant1.address, 0, 20);

    await expect(
      discountManager.connect(restaurant2).setDiscount(restaurant2.address, 0, 50)
    )
      .to.emit(discountManager, "DiscountSet")
      .withArgs(restaurant2.address, 0, 50);

    // Adjusted purchases to accumulate sufficient points
    // Customer buys 5 ETH from Restaurant 1 (5 ETH / 1e15 = 5000 points)
    await expect(
      fastFoodLoyalty.connect(customer).buy(restaurant1.address, 0, 1, {
        value: ethers.parseEther("5"),
      })
    )
      .to.emit(fastFoodLoyalty, "PointsAwarded")
      .withArgs(customer.address, 5000); // 5 ETH = 5000 points

    // Customer buys 10 ETH from Restaurant 2 (10 ETH / 1e15 = 10000 points)
    await expect(
      fastFoodLoyalty.connect(customer).buy(restaurant2.address, 0, 1, {
        value: ethers.parseEther("10"),
      })
    )
      .to.emit(fastFoodLoyalty, "PointsAwarded")
      .withArgs(customer.address, 10000); // 10 ETH = 10000 points

    // Redeem "Simple Burger" from Restaurant 1 (5000 points)
    await expect(
      fastFoodLoyalty.connect(customer).redeemItem(restaurant1.address, 0)
    )
      .to.emit(fastFoodLoyalty, "ItemRedeemed")
      .withArgs(customer.address, "Simple Burger");

    // Redeem "Burger Deluxe" from Restaurant 2 (10000 points)
    await expect(
      fastFoodLoyalty.connect(customer).redeemItem(restaurant2.address, 0)
    )
      .to.emit(fastFoodLoyalty, "ItemRedeemed")
      .withArgs(customer.address, "Burger Deluxe");
  });
  // h. Test Edge cases eg 100% discount, non-restaurant accounts setting discounts, non-customer accounts buying items, redeeming more points than available
  describe("Edge Case Tests", function () {
    // 100% discount
    it("should not allow setting a discount above 100%", async function () {
      await fastFoodLoyalty.connect(restaurant1).addMenuItem("Simple Burger", ethers.parseEther("5"));
      await expect(
        discountManager.connect(restaurant1).setDiscount(restaurant1.address, 0, 150) // 150% discount
      ).to.be.revertedWith("Discount cannot exceed 100%");
    });
    // Non-restaurant accounts setting discounts
    it("should not allow non-restaurant accounts to set discounts", async function () {
      await fastFoodLoyalty.connect(restaurant1).addMenuItem("Simple Burger", ethers.parseEther("5"));
      await expect(
        discountManager.connect(customer).setDiscount(restaurant1.address, 0, 20) // Customer trying to set discount
      ).to.be.revertedWith("Only the restaurant can set discounts");
    });
    // Non-customer accounts buying items
    it("should not allow non-customer accounts to buy items", async function () {
      await fastFoodLoyalty.connect(restaurant1).addMenuItem("Simple Burger", ethers.parseEther("5"));
      await expect(
        fastFoodLoyalty.connect(restaurant1).buy(restaurant1.address, 0, 1, {
          value: ethers.parseEther("5"),
        })
      ).to.be.revertedWith("Only customers can perform this action");
    });
    // Redeeming more points than available
    it("should not allow redeeming more points than available", async function () {
      await fastFoodLoyalty.connect(restaurant1).addMenuItem("Simple Burger", ethers.parseEther("5"));

      // Customer purchases one item to get 5000 points
      await fastFoodLoyalty.connect(customer).buy(restaurant1.address, 0, 1, {
        value: ethers.parseEther("5"),
      });

      // Attempt to redeem an item that costs more points
      await fastFoodLoyalty.connect(restaurant1).addMenuItem("Expensive Burger", ethers.parseEther("10"));
      await expect(
        fastFoodLoyalty.connect(customer).redeemItem(restaurant1.address, 1) // Requires 10,000 points
      ).to.be.revertedWith("Not enough points to redeem this item");
    });
  });
});
