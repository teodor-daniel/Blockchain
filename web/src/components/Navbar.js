import React from "react";
import "../styles/Navbar.css";

function Navbar({ onConnectWallet, account }) {
  return (
    <nav className="navbar">
      <div className="logo">BlockLoyalty</div>
      <div className="actions">
        {account ? (
          <span className="account-display">
            Connected: {account}...
          </span>
        ) : (
          <button onClick={onConnectWallet}>Connect Wallet</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
