// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ItemManager {
    enum ItemType { Basic, Premium, Exclusive }
    
    struct Item {
        uint256 itemId;
        string name;
        ItemType itemType;
    }

    mapping(uint256 => Item) public items; // Store items by their ID
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Add an item to the system
     */
    function addItem(
        uint256 itemId,
        string memory name,
        ItemType itemType
    ) public onlyOwner {
        items[itemId] = Item(itemId, name, itemType);
    }

    /**
     * @dev Get item details
     */
    function getItem(uint256 itemId) public view returns (Item memory) {
        return items[itemId];
    }
}
