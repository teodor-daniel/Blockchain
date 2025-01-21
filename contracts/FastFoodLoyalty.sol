// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FastFoodLoyalty {
    address public owner;

    enum Role { None, Restaurant, Customer }

    struct MenuItem {
        string name;
        uint256 price; //Price in points
    }

    struct Account {
        Role role;
        uint256 points;
        uint256 redeemedPoints; //Tracks points redeemed by a restaurant
    }

    mapping(address => Account) public accounts;
    mapping(address => MenuItem[]) public restaurantMenus;

    event PointsAwarded(address indexed customer, uint256 points);
    event ItemRedeemed(address indexed customer, string itemName);
    event AccountRegistered(address indexed account, Role role);
    event MenuItemAdded(address indexed restaurant, string itemName, uint256 price);

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

    constructor() {
        owner = msg.sender;
    }

    function registerAccount(address account, Role role) external onlyOwner {
        require(accounts[account].role == Role.None, "Account already registered");
        accounts[account] = Account(role, 0, 0);
        emit AccountRegistered(account, role);
    }

    function addMenuItem(string memory name, uint256 price) external onlyRestaurant {
        restaurantMenus[msg.sender].push(MenuItem(name, price));
        emit MenuItemAdded(msg.sender, name, price);
    }

    function redeemItem(address restaurant, uint256 itemIndex) external onlyCustomer {
        require(itemIndex < restaurantMenus[restaurant].length, "Invalid menu item index");

        MenuItem memory item = restaurantMenus[restaurant][itemIndex];
        require(accounts[msg.sender].points >= item.price, "Not enough points to redeem this item");

        accounts[msg.sender].points -= item.price;
        accounts[msg.sender].redeemedPoints += item.price;
        accounts[restaurant].redeemedPoints += item.price;

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

    function buy(address payable restaurant, uint256 itemIndex, uint256 quantity) external payable onlyCustomer {
        require(itemIndex < restaurantMenus[restaurant].length, "Invalid menu item index");

        MenuItem memory item = restaurantMenus[restaurant][itemIndex];
        uint256 totalPrice = item.price * quantity;

        require(msg.value >= totalPrice, "Insufficient ETH sent");

        restaurant.transfer(msg.value);
        uint256 points = msg.value / 1000000000000000; // 1 ETH = 0.0000000000000001 points
        accounts[msg.sender].points += points;

        emit PointsAwarded(msg.sender, points);
        emit ItemRedeemed(msg.sender, item.name);
    }
}
