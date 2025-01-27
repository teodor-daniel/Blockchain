// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DiscountManager.sol";
import "./DiscountLib.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
//This contract is used to manage a loyalty program for a fast food chain as well as the menu items for each restaurant
contract FastFoodLoyalty is ReentrancyGuard {

    address public owner;
    DiscountManager public discountManager;

    // 3 Types of users: None, Restaurant, Customer
    enum Role { None, Restaurant, Customer }

    struct MenuItem {
        string name;
        uint256 price;
    }

    struct Account {
        Role role; 
        uint256 points; // Points earned from purchases
        uint256 redeemedPoints; // Points spent on items
    }

    // Mapping of addresses to accounts
    mapping(address => Account) public accounts;
    mapping(address => MenuItem[]) public restaurantMenus;
    mapping(address => uint256) public balances;

    // These events log important information for the frontend to display
    event PointsAwarded(address indexed customer, uint256 points);
    event ItemRedeemed(address indexed customer, string itemName);
    event AccountRegistered(address indexed account, Role role);
    event MenuItemAdded(address indexed restaurant, string itemName, uint256 price);

    // Modifiers to restrict access to certain functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyRestaurant() {
        require(accounts[msg.sender].role == Role.Restaurant, "Only restaurants can perform this action");
        _;
    }

    modifier onlyCustomer() {
        require(accounts[msg.sender].role == Role.Customer, "Only customers can perform this action");
        _;
    }

    // Constructor to set the owner and the DiscountManager contract address
    constructor(address discountManagerAddress) {
        owner = msg.sender;
        discountManager = DiscountManager(discountManagerAddress);
    }

    // Function to register an account with a specific role
    function register(Role role) external {
        require(accounts[msg.sender].role == Role.None, "Account already registered");
        accounts[msg.sender] = Account(role, 0, 0);
        emit AccountRegistered(msg.sender, role);
    }

    // Function to register an account with a specific role by the owner
    function registerAccount(address account, Role role) external onlyOwner {
        require(accounts[account].role == Role.None, "Account already registered");
        accounts[account] = Account(role, 0, 0);
        emit AccountRegistered(account, role);
    }

    // Function to add a menu item for a restaurant
    function addMenuItem(string memory name, uint256 price) external onlyRestaurant {
        require(price > 0, "Price must be greater than 0");
        require(bytes(name).length > 0, "Item name cannot be empty");

        // Debug logs
        emit MenuItemAdded(msg.sender, name, price);
        restaurantMenus[msg.sender].push(MenuItem(name, price));
    }

    // Function to redeem a menu item using points
    function redeemItem(address restaurant, uint256 itemIndex) external onlyCustomer {
        require(itemIndex < restaurantMenus[restaurant].length, "Invalid menu item index");

        MenuItem memory item = restaurantMenus[restaurant][itemIndex];
        uint256 requiredPoints = item.price / 1e15; // Convert price from Wei to points
        require(accounts[msg.sender].points >= requiredPoints, "Not enough points to redeem this item");

        accounts[msg.sender].points -= requiredPoints;
        accounts[msg.sender].redeemedPoints += requiredPoints;
        accounts[restaurant].redeemedPoints += requiredPoints;

        emit ItemRedeemed(msg.sender, item.name);
    }


    function getMenu(address restaurant) external view returns (MenuItem[] memory) {
        return restaurantMenus[restaurant];
    }

    function getCustomerPoints(address customer) external view returns (uint256) {
        require(accounts[customer].role == Role.Customer, "Address is not a customer");
        return accounts[customer].points;
    }

    function getRestaurantRedeemedPoints(address restaurant) external view returns (uint256) {
        require(accounts[restaurant].role == Role.Restaurant, "Address is not a restaurant");
        return accounts[restaurant].redeemedPoints;
    }


    // Function to buy a menu item from a restaurant  and earn points based on the amount spent (1 point per 1e15 Wei)
    function buy(address payable restaurant, uint256 itemIndex, uint256 quantity)
        external
        payable
        onlyCustomer
        nonReentrant
    {
        require(itemIndex < restaurantMenus[restaurant].length, "Invalid menu item index");

        MenuItem memory item = restaurantMenus[restaurant][itemIndex];

        uint256 discount = discountManager.getDiscount(restaurant, itemIndex);

        // Apply discount to the item price using the DiscountLib library
        uint256 discountedPrice = DiscountLib.applyDiscount(item.price, discount);

        uint256 totalPrice = discountedPrice * quantity;

        require(msg.value >= totalPrice, "Insufficient ETH sent");

        balances[restaurant] += msg.value;

        uint256 points = msg.value / 1e15; 
        accounts[msg.sender].points += points;

        emit PointsAwarded(msg.sender, points);
    }

    function withdraw() external nonReentrant {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No funds to withdraw");

        balances[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
    }
}
