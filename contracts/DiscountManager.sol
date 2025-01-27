// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IDiscountManager.sol";
//This contract is used to manage discounts for restaurants
contract DiscountManager is IDiscountManager {
    address public override owner;

    mapping(address => mapping(uint256 => uint256)) public override discounts;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyRestaurant(address restaurant) {
        require(msg.sender == restaurant, "Only the restaurant can set discounts");
        _;
    }

    function setDiscount(address restaurant, uint256 itemIndex, uint256 discountPercentage)
        external
        override
        onlyRestaurant(restaurant)
    {
        require(discountPercentage <= 100, "Discount cannot exceed 100%");
        discounts[restaurant][itemIndex] = discountPercentage;
        emit DiscountSet(restaurant, itemIndex, discountPercentage); // This triggers a log event in the frontend
    }

    // Get the discount for a specific item at a restaurant
    function getDiscount(address restaurant, uint256 itemIndex)
        external
        view
        override
        returns (uint256)
    {
        return discounts[restaurant][itemIndex];
    }
}