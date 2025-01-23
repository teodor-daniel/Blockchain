import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "../styles/MainMenu.css";
import { isAddress, getAddress } from "ethers";

function MainMenu({ account, fastFoodContract }) {
  const [menuItems, setMenuItems] = useState([]);
  const [restaurantAddr, setRestaurantAddr] = useState(""); // user can set a restaurant address
  const [ethValue, setEthValue] = useState("0.1"); // example

  // If you want to automatically fetch the menu from a known restaurant, setRestaurantAddr to e.g. "0x7099..."
  // Then in useEffect, call getMenu
  async function fetchMenu() {
    if (!fastFoodContract || !restaurantAddr) return;
  
    // 1) Validate
    if (!isAddress(restaurantAddr)) {
      alert("Not a valid Ethereum address!");
      return;
    }
  
    // 2) Convert to a checksummed address
    const checkedAddress = getAddress(restaurantAddr);
  
    try {
      const items = await fastFoodContract.getMenu(checkedAddress);
      setMenuItems(items);
      console.log("Fetched menu items:", items);
    } catch (err) {
      console.error("fetchMenu error:", err);
    }
  }
  useEffect(() => {
    fetchMenu();
    // eslint-disable-next-line
  }, [restaurantAddr]);

  async function buyItem(index) {
    if (!fastFoodContract) return;
    try {
      // parse the user input for ETH
      const valueInWei = ethers.parseEther(ethValue);

      const tx = await fastFoodContract.buy(
        restaurantAddr,
        index,
        1, // quantity=1
        { value: valueInWei }
      );
      await tx.wait();
      alert(`Bought item index ${index} for ${ethValue} ETH!`);
    } catch (err) {
      console.error(err);
      alert("Buy error: " + err.message);
    }
  }

  return (
    <div className="main-menu">
      <h2>Welcome Customer!</h2>

      <div className="restaurant-input">
        <label>Restaurant Address:</label>
        <input
          type="text"
          value={restaurantAddr}
          onChange={(e) => setRestaurantAddr(e.target.value)}
          placeholder="0xRestaurant..."
        />
        <button onClick={fetchMenu}>Fetch Menu</button>
      </div>

      <div className="menu-list">
        {menuItems.map((item, idx) => (
          <div className="menu-card" key={idx}>
            <h3>{item.name}</h3>
            <p>Price (points): {item.price.toString()}</p>
            <label>ETH to Send:</label>
            <input
              type="text"
              value={ethValue}
              onChange={(e) => setEthValue(e.target.value)}
            />
            <button onClick={() => buyItem(idx)}>Buy</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MainMenu;
