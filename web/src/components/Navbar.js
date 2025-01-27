import React from "react";
import "../styles/Navbar.css";

function Navbar({ onConnectWallet, account, ethPrice }) {
  return (
    <nav className="navbar">
      <div className="logo">BlockLoyalty</div>
      <div className="actions">
        {ethPrice !== null ? (
          <p>ETH Price: ${ethPrice.toLocaleString()}</p>
        ) : (
          <p>Loading ETH Price...</p>
        )}
        {account ? (
          <p>
            Connected: {account}
            {account.substring(account.length)}
          </p>
        ) : (
          <button onClick={onConnectWallet}>Connect Wallet</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
