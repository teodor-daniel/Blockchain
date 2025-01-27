import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import fastFoodAbi from "../abis/FastFoodLoyalty.json";
import "../styles/MainMenu.css";

function MainMenu({ account, fastFoodContract, discountManagerContract }) {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  // New state variables for persistent account info
  const [points, setPoints] = useState(null);
  const [balance, setBalance] = useState(null);

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
      showTemporaryMessage("Failed to fetch menu. Check console for details.");
      console.error(err);
    }
  }

  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenu();
    }
  }, [selectedRestaurant]);

  async function handleCheckInfo() {
    if (!fastFoodContract || !account) return;

    try {
      // Fetch points and balance in parallel
      const pointsPromise = fastFoodContract.getCustomerPoints(account);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balancePromise = provider.getBalance(account);

      const [fetchedPoints, fetchedBalance] = await Promise.all([pointsPromise, balancePromise]);
      const formattedBalance = ethers.formatEther(fetchedBalance);

      // Update state with fetched data
      setPoints(fetchedPoints.toString());
      setBalance(formattedBalance);
    } catch (err) {
      showTemporaryMessage("Failed to fetch account information. Check console for details.");
      console.error(err);
    }
  }

  async function buyItem(index) {
    if (!fastFoodContract || !discountManagerContract || !selectedRestaurant) return;

    try {
      const item = menuItems[index];
      const basePrice = item.price;
      const discount = await discountManagerContract.getDiscount(selectedRestaurant, index);
      const discountedPrice = basePrice - (basePrice * discount) / 100n;

      const tx = await fastFoodContract.buy(selectedRestaurant, index, 1, {
        value: discountedPrice,
      });
      await tx.wait();

      showTemporaryMessage(
        `Successfully bought "${item.name}" at a ${discount}% discount! Paid ${ethers.formatEther(
          discountedPrice
        )} ETH.`
      );
    } catch (err) {
      showTemporaryMessage("Failed to complete the purchase. Check console for details.");
      console.error(err);
    }
  }

  async function redeemItem(index) {
    if (!fastFoodContract || !selectedRestaurant) return;

    setIsRedeeming(true);

    try {
      const item = menuItems[index];
      const tx = await fastFoodContract.redeemItem(selectedRestaurant, index);
      await tx.wait();

      showTemporaryMessage(`Successfully redeemed "${item.name}" using points!`);
    } catch (err) {
      showTemporaryMessage("Failed to redeem item. Check console for details.");
      console.error(err);
    } finally {
      setIsRedeeming(false);
    }
  }

  function showTemporaryMessage(message) {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 8000);
  }

  return (
    <div className="main-menu">
      <h2>Welcome Customer!</h2>

      <div className="check-info">
        <button onClick={handleCheckInfo}>Check My Info</button>
      </div>

      <div className="account-info">
        {points !== null && balance !== null && (
          <div>
            <p><strong>Points:</strong> {points}</p>
            <p><strong>ETH Balance:</strong> {balance} ETH</p>
          </div>
        )}
      </div>

      {notification && <p className="notification">{notification}</p>}

      <div className="restaurant-selector">
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
          <h3>Menu Items</h3>
          <div className="menu-grid">
            {menuItems.map((item, idx) => (
              <div className="menu-card" key={idx}>
                <h4>{item.name}</h4>
                <p>Base Price: {ethers.formatEther(item.price)} ETH</p>
                <div className="menu-buttons">
                  <button onClick={() => buyItem(idx)}>Buy</button>
                  <button onClick={() => redeemItem(idx)} disabled={isRedeeming}>
                    Redeem
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MainMenu;
