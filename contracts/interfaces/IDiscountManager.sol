// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface for the DiscountManager contract
interface IDiscountManager {
    function owner() external view returns (address);

    function discounts(address restaurant, uint256 itemIndex) external view returns (uint256);

    function setDiscount(address restaurant, uint256 itemIndex, uint256 discountPercentage) external;

    function getDiscount(address restaurant, uint256 itemIndex) external view returns (uint256);

    event DiscountSet(address indexed restaurant, uint256 itemIndex, uint256 discountPercentage);
}
