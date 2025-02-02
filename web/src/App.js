// src/App.js
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import fastFoodAbi from "./abis/FastFoodLoyalty.json";
import discountManagerAbi from "./abis/DiscountManager.json";
import RoleSelector from "./components/RoleSelector";
import MainMenu from "./components/MainMenu";
import RestaurantPanel from "./components/RestaurantPanel";
import Navbar from "./components/Navbar";
import { getEthPrice } from "./utils/getEthPrice";

const FAST_FOOD_LOYALTY_ADDRESS = fastFoodAbi.address;
const DISCOUNT_MANAGER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [role, setRole] = useState(0); // 0=None, 1=Restaurant, 2=Customer
  const [fastFoodContract, setFastFoodContract] = useState(null);
  const [discountManagerContract, setDiscountManagerContract] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const tempProvider = new ethers.BrowserProvider(window.ethereum);
      const tempSigner = await tempProvider.getSigner();
      const userAddress = await tempSigner.getAddress();

      setProvider(tempProvider);
      setSigner(tempSigner);
      setAccount(userAddress);

      // Instantiate contracts
      console.log("Connecting to contracts... fastFoodAbi:", fastFoodAbi);
      const fastFood = new ethers.Contract(
        FAST_FOOD_LOYALTY_ADDRESS,
        fastFoodAbi.abi,
        tempSigner
      );
      const discountManager = new ethers.Contract(
        DISCOUNT_MANAGER_ADDRESS,
        discountManagerAbi.abi,
        tempSigner
      );
      setFastFoodContract(fastFood);
      setDiscountManagerContract(discountManager);

      console.log("Connected to MetaMask:", userAddress);
    } catch (err) {
      console.error("User rejected or error:", err);
    }
  }

  async function fetchRole() {
    if (!fastFoodContract || !account) return;
    try {
      const acctData = await fastFoodContract.accounts(account);
      const userRole = acctData.role;
      setRole(Number(userRole));
      console.log("User role is:", userRole);
    } catch (err) {
      console.error("Error in fetchRole:", err);
    }
  }

  async function fetchEthPrice() {
    const price = await getEthPrice();
    if (price) {
      setEthPrice(price);
    } else {
      setEthPrice(null);
    }
  }

  useEffect(() => {
    fetchEthPrice();
    const interval = setInterval(fetchEthPrice, 600000); // Refresh every 10 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (fastFoodContract && account) {
      fetchRole();
    }
  }, [fastFoodContract, account]);

  async function registerAsRestaurant() {
    try {
      const tx = await fastFoodContract.register(1);
      await tx.wait();
      alert("Registered as Restaurant!");
      fetchRole();
    } catch (err) {
      console.error(err);
      alert("Error registering: " + err.message);
    }
  }

  async function registerAsCustomer() {
    try {
      const tx = await fastFoodContract.register(2);
      await tx.wait();
      alert("Registered as Customer!");
      fetchRole();
    } catch (err) {
      console.error(err);
      alert("Error registering: " + err.message);
    }
  }

  return (
    <div className="app-container">
      <Navbar onConnectWallet={connectWallet} account={account} ethPrice={ethPrice} />
      <div style={{ margin: "2rem" }}>
        {role === 0 ? (
          <RoleSelector
            registerAsCustomer={registerAsCustomer}
            registerAsRestaurant={registerAsRestaurant}
            account={account}
          />
        ) : role === 1 ? (
          <RestaurantPanel
            account={account}
            fastFoodContract={fastFoodContract}
            discountManagerContract={discountManagerContract}
            ethPrice={ethPrice}
          />
        ) : (
          <MainMenu
            account={account}
            fastFoodContract={fastFoodContract}
            discountManagerContract={discountManagerContract}
            ethPrice={ethPrice}
          />
        )}
      </div>
    </div>
  );
}

export default App;
