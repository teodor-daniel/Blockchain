const { expect } = require("chai");

describe("LoyaltyPoints", function () {
  let LoyaltyPoints, ProductManager, loyaltyPoints, productManager, owner, addr1;

  beforeEach(async function () {
    ProductManager = await ethers.getContractFactory("ProductManager");
    productManager = await ProductManager.deploy();

    LoyaltyPoints = await ethers.getContractFactory("LoyaltyPoints");
    loyaltyPoints = await LoyaltyPoints.deploy(productManager.target);

    [owner, addr1] = await ethers.getSigners();
  });

  it("Should allow the owner to add points", async function () {
    await loyaltyPoints.addPoints(addr1.address, 100);
    const points = await loyaltyPoints.getPoints(addr1.address);
    expect(points).to.equal(100);
  });

  it("Should redeem points for a product", async function () {
    await productManager.addProduct(1, "Coffee", 50);
    await loyaltyPoints.addPoints(addr1.address, 100);
    await loyaltyPoints.connect(addr1).redeemPointsForProduct(1);

    const remainingPoints = await loyaltyPoints.getPoints(addr1.address);
    expect(remainingPoints).to.equal(50);
  });

  it("Should calculate points correctly", async function () {
    const calculatedPoints = await loyaltyPoints.calculatePoints(100);
    expect(calculatedPoints).to.equal(10);
  });
});
