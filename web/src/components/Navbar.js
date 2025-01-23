import React from "react";
import "../styles/Navbar.css";

function Navbar({ onConnectWallet, account }) {
  return (
    <nav className="navbar">
      <div className="logo">FastFood App</div>
      <div className="actions">
        {account ? (
          <span className="account-display">
            Connected: {account.substring(0, 6)}...
          </span>
        ) : (
          <button onClick={onConnectWallet}>Connect Wallet</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
