// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract ProofOfLocation {
    address public owner;
    mapping(address => bytes32) public locationVerifications;
    event LocationVerified(address indexed user, bytes32 indexed locationHash);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function verifyLocation(address _user, bytes32 _locationHash) public onlyOwner {
        require(_user != address(0), "Cannot verify for the zero address");
        locationVerifications[_user] = _locationHash;
        emit LocationVerified(_user, _locationHash);
    }
}