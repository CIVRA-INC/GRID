// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISoulboundNeighborhoodBadge.sol";

/**
 * @title Verifier
 * @dev This contract orchestrates the user verification process. It requests
 * attestations from the Flare State Connector and, upon success, directs the
 * SBNFT contract to mint a badge.
 */
contract Verifier is Ownable {
    ISoulboundNeighborhoodBadge public sbnftContract;

    mapping(uint256 => address) public verificationRequests;
    uint256 private _nextRequestId;

    event VerificationRequested(uint256 indexed requestId, address indexed user, string locationData);
    event VerificationConfirmed(uint256 indexed requestId, address indexed user);

    constructor(address _sbnftAddress, address initialOwner) Ownable(initialOwner) {
        sbnftContract = ISoulboundNeighborhoodBadge(_sbnftAddress);
    }

    /**
     * @dev Kicks off the verification process for a user.
     * In a real implementation, this would trigger a call to the State Connector.
     */
    function requestVerification(string calldata locationData) external {
        uint256 requestId = _nextRequestId++;
        verificationRequests[requestId] = msg.sender;
        emit VerificationRequested(requestId, msg.sender, locationData);

        // PRODUCTION TODO: Integrate the actual call to the Flare State Connector here.
        // This involves formatting the request according to the attestation protocol.
    }

    /**
     * @dev Simulates the callback/response from the State Connector.
     * In the real world, this function would be callable by the State Connector and
     * would decode the attestation proof. For the MVP, it is restricted to the
     * owner to manually confirm a successful off-chain verification.
     */
    function manualConfirmVerification(uint256 requestId, uint256 neighborhoodId) public onlyOwner {
        address user = verificationRequests[requestId];
        require(user != address(0), "Verifier: Invalid request ID");

        // The Verifier contract, as the owner of the SBNFT contract, calls mint.
        sbnftContract.safeMint(user, neighborhoodId);
        emit VerificationConfirmed(requestId, user);

        delete verificationRequests[requestId];
    }
}
