import React from "react";
import "../styles/RoleSelector.css";

function RoleSelector({ registerAsCustomer, registerAsRestaurant, account }) {
  if (!account) {
    return <p>Please connect your wallet first!</p>;
  }

  return (
    <div className="role-selector">
      <h2>Welcome! You are not registered.</h2>
      <div className="role-buttons">
        <button onClick={registerAsCustomer}>Register as Customer</button>
        <button onClick={registerAsRestaurant}>Register as Restaurant</button>
      </div>
    </div>
  );
}

export default RoleSelector;
