// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev Library pentru calculul discountului.
 * Nu menține stare, conține doar funcții pure.
 */
library DiscountLib {
    /**
     * @dev Calculează prețul cu discountPercentage aplicat, 
     * unde discountPercentage este între 0 și 100.
     */
    function applyDiscount(uint256 basePrice, uint256 discountPercentage)
        internal
        pure
        returns (uint256)
    {
        require(discountPercentage <= 100, "Invalid discount");
        return basePrice - (basePrice * discountPercentage) / 100;
    }
}
