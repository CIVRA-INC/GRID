// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISoulboundNeighborhoodBadge.sol";

contract Verifier is Ownable {
    ISoulboundNeighborhoodBadge public sbnftContract;

    mapping(uint256 => address) public verificationRequests;
    uint256 private _nextRequestId;

    event VerificationRequested(uint256 indexed requestId, address indexed user, string locationData);
    event VerificationConfirmed(uint256 indexed requestId, address indexed user);

    constructor(address _sbnftAddress, address initialOwner) Ownable(initialOwner) {
        sbnftContract = ISoulboundNeighborhoodBadge(_sbnftAddress);
    }

    function requestVerification(string calldata locationData) external {
        uint256 requestId = _nextRequestId++;
        verificationRequests[requestId] = msg.sender;
        emit VerificationRequested(requestId, msg.sender, locationData);
    }

  
    function manualConfirmVerification(uint256 requestId, uint256 neighborhoodId) public onlyOwner {
        address user = verificationRequests[requestId];
        require(user != address(0), "Verifier: Invalid request ID");

        sbnftContract.safeMint(user, neighborhoodId);
        emit VerificationConfirmed(requestId, user);

        delete verificationRequests[requestId];
    }
}
