// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProductManager {
    mapping(uint256 => string) public products; 
    mapping(uint256 => uint256) public productPrices;
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    //Add a product
    function addProduct(uint256 productId, string memory name, uint256 price) public onlyOwner {
        products[productId] = name;
        productPrices[productId] = price;
    }

    //Get the price of a product
    function getProductPrice(uint256 productId) public view returns (uint256) {
        return productPrices[productId];
    }
}
