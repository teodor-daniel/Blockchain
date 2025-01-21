// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DiscountManager {
    address public owner;

    // Mapping: restaurant -> itemIndex -> discountPercentage
    mapping(address => mapping(uint256 => uint256)) public discounts;

    event DiscountSet(address indexed restaurant, uint256 itemIndex, uint256 discountPercentage);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyRestaurant(address restaurant) {
        require(msg.sender == restaurant, "Only the restaurant can set discounts");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setDiscount(address restaurant, uint256 itemIndex, uint256 discountPercentage) external onlyRestaurant(restaurant) {
        require(discountPercentage <= 100, "Discount cannot exceed 100%");
        discounts[restaurant][itemIndex] = discountPercentage;
        emit DiscountSet(restaurant, itemIndex, discountPercentage);
    }

    function getDiscount(address restaurant, uint256 itemIndex) external view returns (uint256) {
        return discounts[restaurant][itemIndex];
    }
}
