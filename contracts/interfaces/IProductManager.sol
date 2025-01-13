// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Interface for interacting with ProductManager contracts.
 */
interface IProductManager {
    function addProduct(uint256 productId, string memory name, uint256 price) external;
    function getProductPrice(uint256 productId) external view returns (uint256);
    function getProductInfo(uint256 productId) external view returns (string memory);
}
