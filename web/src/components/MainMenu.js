import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import fastFoodAbi from "../abis/FastFoodLoyalty.json";
import "../styles/MainMenu.css";

/**
 * MainMenu Component
 * 
 * Expects props:
 *  - account (the current user's address)
 *  - fastFoodContract (an ethers.Contract for FastFoodLoyalty)
 *  - discountManagerContract (an ethers.Contract for DiscountManager)
 */
function MainMenu({ account, fastFoodContract, discountManagerContract }) {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [customerPoints, setCustomerPoints] = useState(null);
  const [ethBalance, setEthBalance] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (fastFoodAbi.restaurants) {
      setRestaurants(fastFoodAbi.restaurants);
    }
  }, []);

  async function fetchMenu() {
    if (!fastFoodContract || !selectedRestaurant) return;

    try {
      const items = await fastFoodContract.getMenu(selectedRestaurant);
      setMenuItems(items);
    } catch (err) {
      console.error("Error fetching menu:", err);
    }
  }

  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenu();
    }
  }, [selectedRestaurant]);

  /**
   * Buy an item at a given index.
   * - Fetches the discount from DiscountManager
   * - Calculates discounted price
   * - Calls `buy()` with the discounted price as msg.value
   */
  async function buyItem(index) {
    if (!fastFoodContract || !discountManagerContract || !selectedRestaurant) return;

    try {
      const item = menuItems[index];
      const basePrice = item.price; // BigInt

      const discount = await discountManagerContract.getDiscount(selectedRestaurant, index);


      const discountedPrice = basePrice - (basePrice * discount) / 100n;

      const tx = await fastFoodContract.buy(selectedRestaurant, index, 1, {
        value: discountedPrice,
      });
      await tx.wait();

      openModal(
        `You bought "${item.name}" at a ${discount}% discount! Paid ${ethers.formatEther(discountedPrice)} ETH.`
      );
    } catch (err) {
      console.error("Error buying item:", err);
      openModal("Failed to complete the purchase. Check console for details.");
    }
  }

  async function fetchCustomerPoints() {
    if (!fastFoodContract || !account) return;

    try {
      const points = await fastFoodContract.getCustomerPoints(account);
      const formattedPoints = ethers.formatEther(points);
      setCustomerPoints(formattedPoints);
      openModal(`You have ${formattedPoints} points.`);
    } catch (err) {
      console.error("Error fetching customer points:", err);
      openModal("Failed to fetch points.");
    }
  }

  async function fetchCustomerBalance() {
    if (!account) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(account);
      const formattedBalance = ethers.formatEther(balance);
      setEthBalance(formattedBalance);
      openModal(`Your wallet balance is ${formattedBalance} ETH.`);
    } catch (err) {
      console.error("Error fetching ETH balance:", err);
      openModal("Failed to fetch balance.");
    }
  }

  function openModal(content) {
    setModalContent(content);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setModalContent(null);
  }

  return (
    <div className="main-menu">
      <h2>Welcome Customer!</h2>

      <div className="check-points">
        <button onClick={fetchCustomerPoints}>Check My Points</button>
      </div>

      <div className="check-balance">
        <button onClick={fetchCustomerBalance}>Check My ETH Balance</button>
      </div>

      <div className="restaurant-selector">
        <label>Select a Restaurant:</label>
        <select
          value={selectedRestaurant}
          onChange={(e) => setSelectedRestaurant(e.target.value)}
        >
          <option value="">-- Select a Restaurant --</option>
          {restaurants.map((restaurant, idx) => (
            <option key={idx} value={restaurant.address}>
              {restaurant.name}
            </option>
          ))}
        </select>
        <button onClick={fetchMenu} disabled={!selectedRestaurant}>
          Fetch Menu
        </button>
      </div>

      {menuItems.length > 0 && (
        <div className="menu-list">
          {menuItems.map((item, idx) => (
            <div className="menu-card" key={idx}>
              <h3>{item.name}</h3>
              <p>Base Price: {ethers.formatEther(item.price)} ETH</p>
              <button onClick={() => buyItem(idx)}>Buy</button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <>
          <div className="modal-overlay" onClick={closeModal}></div>
          <div className="modal">
            <h3>Information</h3>
            <p>{modalContent}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </>
      )}
    </div>
  );
}

export default MainMenu;
