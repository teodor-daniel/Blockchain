import React, { useState } from "react";
import "../styles/RestaurantPanel.css";

function RestaurantPanel({ account, fastFoodContract, discountManagerContract }) {
  const [menuItemName, setMenuItemName] = useState("");
  const [menuItemPrice, setMenuItemPrice] = useState("0");
  const [discountItemIndex, setDiscountItemIndex] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);

  // Add a new menu item
  async function handleAddMenuItem() {
    if (!fastFoodContract) return;
    try {
      const priceNum = parseInt(menuItemPrice);
      const tx = await fastFoodContract.addMenuItem(menuItemName, priceNum);
      await tx.wait();
      alert(`Menu item '${menuItemName}' added with price ${priceNum}`);
    } catch (err) {
      console.error(err);
      alert("Failed to add menu item");
    }
  }

  // Set discount via DiscountManager
  async function handleSetDiscount() {
    if (!discountManagerContract) return;
    try {
      // discountManager.setDiscount(restaurant.address, itemIndex, discount)
      const tx = await discountManagerContract.setDiscount(account, discountItemIndex, discountValue);
      await tx.wait();
      alert(`Discount set to ${discountValue}% for itemIndex ${discountItemIndex}`);
    } catch (err) {
      console.error(err);
      alert("Failed to set discount");
    }
  }

  // Withdraw funds
  async function handleWithdraw() {
    if (!fastFoodContract) return;
    try {
      const tx = await fastFoodContract.withdraw();
      await tx.wait();
      alert("Funds withdrawn!");
    } catch (err) {
      console.error(err);
      alert("Withdraw failed");
    }
  }

  return (
    <div className="restaurant-panel">
      <h2>Restaurant Panel</h2>

      <div className="panel-section">
        <h3>Add Menu Item</h3>
        <input
          type="text"
          placeholder="Item name"
          value={menuItemName}
          onChange={(e) => setMenuItemName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Item price (in points)"
          value={menuItemPrice}
          onChange={(e) => setMenuItemPrice(e.target.value)}
        />
        <button onClick={handleAddMenuItem}>Add</button>
      </div>

      <div className="panel-section">
        <h3>Set Discount</h3>
        <input
          type="number"
          placeholder="Item index"
          value={discountItemIndex}
          onChange={(e) => setDiscountItemIndex(e.target.value)}
        />
        <input
          type="number"
          placeholder="Discount %"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
        />
        <button onClick={handleSetDiscount}>Set Discount</button>
      </div>

      <div className="panel-section">
        <h3>Withdraw Funds</h3>
        <button onClick={handleWithdraw}>Withdraw</button>
      </div>
    </div>
  );
}

export default RestaurantPanel;
