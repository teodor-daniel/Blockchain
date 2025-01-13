// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./interfaces/IProductManager.sol";

contract ProductManager is IProductManager {
    using Strings for uint256;

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

    /**
     * @dev Add a product (only the owner can call this)
     */
    function addProduct(
        uint256 productId, 
        string memory name, 
        uint256 price
    ) 
        public 
        override 
        onlyOwner 
    {
        products[productId] = name;
        productPrices[productId] = price;
    }

    /**
     * @dev Get the price of a product
     */
    function getProductPrice(uint256 productId) 
        public 
        view 
        override 
        returns (uint256) 
    {
        return productPrices[productId];
    }

    /**
     * @dev Get info about the product, including ID and name
     */
    function getProductInfo(uint256 productId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        return string(
            abi.encodePacked(
                "Product #", 
                productId.toString(), 
                ": ", 
                products[productId]
            )
        );
    }
}