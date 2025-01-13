// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ProductManager.sol";
import "./ItemManager.sol";

contract LoyaltyPoints {
    address public owner;
    mapping(address => uint256) public points;

    ProductManager public productManager;
    ItemManager public itemManager;

    //Events
    event PointsAdded(address indexed user, uint256 amount);
    event PointsTransferred(address indexed from, address indexed to, uint256 amount);
    event PointsRedeemed(address indexed user, uint256 amount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier hasEnoughPoints(address user, uint256 amount) {
        require(points[user] >= amount, "Not enough points");
        _;
    }

    constructor(address productManagerAddress, address itemManagerAddress) {
        owner = msg.sender;
        productManager = ProductManager(productManagerAddress);
        itemManager = ItemManager(itemManagerAddress);
    }

    //Add points to a user
    function addPoints(address user, uint256 amount) external onlyOwner {
        points[user] += amount;
        emit PointsAdded(user, amount);
    }

    //Transfer points between users
    function transferPoints(address to, uint256 amount) external hasEnoughPoints(msg.sender, amount) {
        points[msg.sender] -= amount;
        points[to] += amount;
        emit PointsTransferred(msg.sender, to, amount);
    }

    //Redeem points
    function redeemPointsForProduct(uint256 productId) external hasEnoughPoints(msg.sender, productManager.getProductPrice(productId)) {
        uint256 price = productManager.getProductPrice(productId);
        points[msg.sender] -= price;
        emit PointsRedeemed(msg.sender, price);
    }

    //Award points based on item type
    function awardPointsForItem(uint256 itemId) external {
        ItemManager.Item memory item = itemManager.getItem(itemId);

        uint256 pointsToAward;
        if (item.itemType == ItemManager.ItemType.Basic) {
            pointsToAward = 10; // Award 10 points for Basic items
        } else if (item.itemType == ItemManager.ItemType.Premium) {
            pointsToAward = 20; // Award 20 points for Premium items
        } else if (item.itemType == ItemManager.ItemType.Exclusive) {
            pointsToAward = 50; // Award 50 points for Exclusive items
        }

        points[msg.sender] += pointsToAward;
        emit PointsAdded(msg.sender, pointsToAward);
    }

    //View function: Get balance of points
    function getPoints(address user) external view returns (uint256) {
        return points[user];
    }

    //Pure function: Calculate points based on amount spent
    function calculatePoints(uint256 amountSpent) public pure returns (uint256) {
        return amountSpent / 10;
    }

    //Deposit ETH to contract
    function deposit() external payable {
        require(msg.value > 0, "Must send ETH");
    }

    //Withdraw ETH from contract
    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Not enough balance");
        payable(owner).transfer(amount);
    }

    //Fallback function
    receive() external payable {}
}
