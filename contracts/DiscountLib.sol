// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library DiscountLib {

    function applyDiscount(uint256 basePrice, uint256 discountPercentage)
        internal
        pure
        returns (uint256)
    {
        require(discountPercentage <= 100, "Invalid discount");
        return basePrice - (basePrice * discountPercentage) / 100;
    }
}
