// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISoulboundNeighborhoodBadge
 * @dev Interface for the SoulboundNeighborhoodBadge contract.
 * Defines the external functions that other contracts can call.
 */
interface ISoulboundNeighborhoodBadge {
    /**
     * @dev Mints a new soulbound token for a user in a specific neighborhood.
     * @param to The address of the recipient.
     * @param _neighborhoodId The ID of the neighborhood.
     */
    function safeMint(address to, uint256 _neighborhoodId) external;
}
