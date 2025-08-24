// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SoulboundNeighborhoodBadge
 * @dev This contract implements a Soulbound Non-F-ungible Token (SBNFT)
 * that represents a verified resident's badge for a specific neighborhood.
 * This version is updated for OpenZeppelin v5.0 and Hardhat v3.
 */
contract SoulboundNeighborhoodBadge is ERC721, Ownable {
        
    uint256 private _nextTokenId;

    mapping(uint256 => uint256) public neighborhoodOf;
    
    event BadgeMinted(address indexed to, uint256 indexed tokenId, uint256 indexed neighborhoodId);

    /**
     * @dev The constructor is called only once when the contract is deployed.
     * It sets the name and symbol for our NFT collection.
     * @param initialOwner The address that will have initial ownership of the contract.
     */
    constructor(address initialOwner) ERC721("GRID Neighborhood Badge", "GRID") Ownable(initialOwner) {}

    /**
     * @dev The core function to create and assign a new badge.
     * It can only be called by the contract's owner.
     * @param to The address of the verified resident receiving the badge.
     * @param _neighborhoodId The ID of the neighborhood this badge is for.
     */
    function safeMint(address to, uint256 _neighborhoodId) public onlyOwner {
        
        
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        neighborhoodOf[tokenId] = _neighborhoodId;
        _safeMint(to, tokenId);
        emit BadgeMinted(to, tokenId, _neighborhoodId);
    }

    /**
     * @dev This is the crucial function that makes our token "soulbound".
     * It's a standard ERC721 "hook" that runs before any transfer.
     * We override it to block all transfers except for the initial minting.
     * The function signature is updated to match OpenZeppelin v5.0.
     * @param from The address the token is coming from.
     * @param to The address the token is going to.
     * @param tokenIds An array of token IDs being transferred (will be a single ID for ERC721).
     * @param batchSize The size of the tokenIds array.
     */
    function _update(address from, address to, uint256[] memory tokenIds, uint256 batchSize) internal override {
        require(from == address(0), "SoulboundNeighborhoodBadge: Cannot be transferred");
        super._update(from, to, tokenIds, batchSize);
    }
}
