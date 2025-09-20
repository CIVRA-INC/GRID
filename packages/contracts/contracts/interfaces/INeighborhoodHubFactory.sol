// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title INeighborhoodHubFactory
 * @dev Interface for the NeighborhoodHubFactory. It defines the external functions
 * for creating and retrieving neighborhood hubs.
 */
interface INeighborhoodHubFactory {
    /**
     * @dev Emitted when a new NeighborhoodHub is created and registered.
     */
    event NeighborhoodHubCreated(uint256 indexed neighborhoodId, address indexed hubAddress, address indexed creator);

    /**
     * @dev Creates a new NeighborhoodHub for a given neighborhood ID.
     * @param _neighborhoodId The unique ID for the new neighborhood.
     */
    function createNeighborhoodHub(uint256 _neighborhoodId) external;

    /**
     * @dev Returns the address of the hub for a specific neighborhood ID.
     * @param _neighborhoodId The ID of the neighborhood.
     * @return The address of the NeighborhoodHub contract.
     */
    function getHubAddress(uint256 _neighborhoodId) external view returns (address);

    /**
     * @dev Returns an array of all created hub addresses.
     * @return An array of addresses.
     */
    function getAllHubs() external view returns (address[] memory);
}