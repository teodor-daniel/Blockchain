import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "../styles/RestaurantPanel.css";

function RestaurantPanel({ account, fastFoodContract, discountManagerContract }) {
  const [itemName, setItemName] = useState(""); // For adding menu items
  const [itemPrice, setItemPrice] = useState(""); // For adding menu items
  const [menuItems, setMenuItems] = useState([]); // For existing menu items
  const [selectedItemIndex, setSelectedItemIndex] = useState(null); // For selecting a menu item
  const [discountPercentage, setDiscountPercentage] = useState(10); // For setting discounts

  // Fetch menu items for the restaurant
  useEffect(() => {
    async function fetchMenuItems() {
      try {
        if (!fastFoodContract || !account) return;

        const items = await fastFoodContract.getMenu(account);
        setMenuItems(items);
      } catch (err) {
        console.error("Error fetching menu items:", err);
      }
    }

    fetchMenuItems();
  }, [fastFoodContract, account]);

  // Add a new menu item
  async function handleAddMenuItem() {
    try {
      if (!fastFoodContract) {
        alert("Contract not connected.");
        return;
      }

      if (!itemName.trim()) {
        alert("Item name cannot be empty.");
        return;
      }
      if (isNaN(itemPrice) || itemPrice <= 0) {
        alert("Item price must be a valid number greater than 0.");
        return;
      }

      const itemPriceInWei = ethers.parseEther(itemPrice);

      console.log(`Adding menu item: ${itemName}, Price (Wei): ${itemPriceInWei.toString()}`);

      const tx = await fastFoodContract.addMenuItem(itemName, itemPriceInWei);
      await tx.wait();

      alert(`Added '${itemName}' at ${itemPrice} ETH to the restaurant menu!`);

      // Clear inputs
      setItemName("");
      setItemPrice("");

      // Refresh menu items
      const updatedMenu = await fastFoodContract.getMenu(account);
      setMenuItems(updatedMenu);
    } catch (err) {
      console.error("Error adding menu item:", err);
      alert("Failed to add menu item. Check console for details.");
    }
  }

  // Set a discount for a selected menu item
  async function handleSetDiscount() {
    if (!discountManagerContract || selectedItemIndex === null) {
      alert("Please select a menu item and discount percentage.");
      return;
    }

    try {
      const tx = await discountManagerContract.setDiscount(
        account,
        selectedItemIndex,
        discountPercentage
      );
      await tx.wait();

      alert(`Set a ${discountPercentage}% discount for item index ${selectedItemIndex}.`);
    } catch (err) {
      console.error("Error setting discount:", err);
      alert("Failed to set discount. Check console for details.");
    }
  }

  return (
    <div className="restaurant-panel">
      <h2>Restaurant Panel</h2>

      <div className="panel-section">
        <h3>Add Menu Item</h3>
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Item Price (ETH)"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
        />
        <button onClick={handleAddMenuItem}>Add Menu Item</button>
      </div>

      <div className="panel-section">
        <h3>Set Discount</h3>
        <select
          value={selectedItemIndex ?? ""}
          onChange={(e) => setSelectedItemIndex(parseInt(e.target.value))}
        >
          <option value="">-- Select Menu Item --</option>
          {menuItems.map((item, idx) => (
            <option key={idx} value={idx}>
              {item.name} - {ethers.formatEther(item.price)} ETH
            </option>
          ))}
        </select>
        <select
          value={discountPercentage}
          onChange={(e) => setDiscountPercentage(parseInt(e.target.value))}
        >
          <option value={10}>10%</option>
          <option value={20}>20%</option>
          <option value={30}>30%</option>
        </select>
        <button onClick={handleSetDiscount}>Apply Discount</button>
      </div>
    </div>
  );
}

export default RestaurantPanel;
