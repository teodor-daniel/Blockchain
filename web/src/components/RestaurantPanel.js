// src/components/RestaurantPanel.js
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "../styles/RestaurantPanel.css";

function RestaurantPanel({ account, fastFoodContract, discountManagerContract, ethPrice }) {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [ethBalance, setEthBalance] = useState(null);
  const [notification, setNotification] = useState(null); // For temporary messages
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  useEffect(() => {
    async function fetchMenuItems() {
      try {
        if (!fastFoodContract || !account) return;
        const items = await fastFoodContract.getMenu(account);
        setMenuItems(items);
      } catch (err) {
        showTemporaryMessage("Error fetching menu items. Check console for details.");
        console.error(err);
      }
    }

    fetchMenuItems();
  }, [fastFoodContract, account]);

  async function handleAddMenuItem() {
    try {
      if (!itemName.trim()) {
        showTemporaryMessage("Item name cannot be empty.");
        return;
      }
      if (isNaN(itemPrice) || itemPrice <= 0) {
        showTemporaryMessage("Item price must be a valid number greater than 0.");
        return;
      }

      const itemPriceInWei = ethers.parseEther(itemPrice);
      const tx = await fastFoodContract.addMenuItem(itemName, itemPriceInWei);
      await tx.wait();

      showTemporaryMessage(`Added '${itemName}' at ${itemPrice} ETH ($${(parseFloat(itemPrice) * ethPrice).toFixed(2)} USD) to the menu!`);

      setItemName("");
      setItemPrice("");

      const updatedMenu = await fastFoodContract.getMenu(account);
      setMenuItems(updatedMenu);
    } catch (err) {
      showTemporaryMessage("Failed to add menu item. Check console for details.");
      console.error(err);
    }
  }

  async function handleSetDiscount() {
    try {
      if (selectedItemIndex === null || selectedItemIndex === undefined) {
        showTemporaryMessage("Please select a menu item.");
        return;
      }

      const tx = await discountManagerContract.setDiscount(
        account,
        selectedItemIndex,
        discountPercentage
      );
      await tx.wait();

      showTemporaryMessage(`Set a ${discountPercentage}% discount for the selected item.`);
    } catch (err) {
      showTemporaryMessage("Failed to set discount. Check console for details.");
      console.error(err);
    }
  }

  async function handleCheckBalance() {
    try {
      if (!account) {
        return;
      }

      setIsBalanceLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(account);
      const formattedBalance = ethers.formatEther(balance);

      setEthBalance(formattedBalance);
    } catch (err) {
      showTemporaryMessage("Failed to fetch balance. Check console for details.");
      console.error(err);
    } finally {
      setIsBalanceLoading(false);
    }
  }

  function showTemporaryMessage(message) {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  }

  return (
    <div className="restaurant-panel">
      <h2>Restaurant Panel</h2>

      {notification && <p className="notification">{notification}</p>}

      <div className="panel-section">
        <h3>Add Menu Item</h3>
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <input
          type="number"
          step="0.001"
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
              {item.name} - {ethers.formatEther(item.price)} ETH (${(parseFloat(ethers.formatEther(item.price)) * ethPrice).toFixed(2)} USD)
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

      <div className="panel-section">
        <h3>Check My ETH Balance</h3>
        <button onClick={handleCheckBalance} disabled={isBalanceLoading}>
          {isBalanceLoading ? "Checking..." : "Check Balance"}
        </button>
        {ethBalance && (
          <p>
            <strong>Balance:</strong> {ethBalance} ETH (${(parseFloat(ethBalance) * ethPrice).toFixed(2)} USD)
          </p>
        )}
      </div>

      <div className="panel-section">
        <h3>Menu Items</h3>
        <ul>
          {menuItems.map((item, idx) => (
            <li key={idx}>
              {item.name} - {ethers.formatEther(item.price)} ETH (${(parseFloat(ethers.formatEther(item.price)) * ethPrice).toFixed(2)} USD)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RestaurantPanel;
