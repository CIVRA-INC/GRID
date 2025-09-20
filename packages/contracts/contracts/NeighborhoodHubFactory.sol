// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./NeighborhoodHub.sol"; 
import "./interfaces/INeighborhoodHubFactory.sol";


contract NeighborhoodHubFactory is INeighborhoodHubFactory, Ownable {
    address public immutable sbnftContractAddress;

    mapping(uint256 => address) public getHubAddress;

    address[] public allHubs;

    constructor(address _sbnftAddress, address initialOwner) Ownable(initialOwner) {
        sbnftContractAddress = _sbnftAddress;
    }


    function createNeighborhoodHub(uint256 _neighborhoodId) external override onlyOwner {
        require(getHubAddress[_neighborhoodId] == address(0), "Factory: Hub already exists");


        NeighborhoodHub newHub = new NeighborhoodHub(sbnftContractAddress, _neighborhoodId);

        // Store the address of the newly created hub.
        address newHubAddress = address(newHub);
        getHubAddress[_neighborhoodId] = newHubAddress;
        allHubs.push(newHubAddress);

        emit NeighborhoodHubCreated(_neighborhoodId, newHubAddress, msg.sender);
    }

    function getAllHubs() external view override returns (address[] memory) {
        return allHubs;
    }
}