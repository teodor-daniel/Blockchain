import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "../styles/RestaurantPanel.css";

function RestaurantPanel({ account, fastFoodContract, discountManagerContract }) {
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

      showTemporaryMessage(`Added '${itemName}' at ${itemPrice} ETH to the menu!`);

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
      if (!selectedItemIndex) {
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
        showTemporaryMessage("Account not available.");
        return;
      }

      setIsBalanceLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(account);
      const formattedBalance = ethers.formatEther(balance);

      setEthBalance(formattedBalance);
      showTemporaryMessage(`Your balance is ${formattedBalance} ETH.`);
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

      <div className="panel-section">
        <h3>Check My ETH Balance</h3>
        <button onClick={handleCheckBalance} disabled={isBalanceLoading}>
          {isBalanceLoading ? "Checking..." : "Check Balance"}
        </button>
        {ethBalance && (
          <p>
            <strong>Balance:</strong> {ethBalance} ETH
          </p>
        )}
      </div>
    </div>
  );
}

export default RestaurantPanel;
