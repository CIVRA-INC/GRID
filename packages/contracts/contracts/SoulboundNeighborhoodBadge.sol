// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ISoulboundNeighborhoodBadge.sol";

/**
 * @title SoulboundNeighborhoodBadge
 * @dev Implements a Soulbound NFT for resident badges. Updated for OpenZeppelin v5.
 */
contract SoulboundNeighborhoodBadge is ERC721, Ownable, ISoulboundNeighborhoodBadge {
    uint256 private _nextTokenId;
    mapping(uint256 => uint256) public neighborhoodOf;

    event BadgeMinted(address indexed to, uint256 indexed tokenId, uint256 indexed neighborhoodId);

    constructor(address initialOwner) ERC721("GRID Neighborhood Badge", "GRID") Ownable(initialOwner) {}

    /**
     * @dev Mints a new badge. Can only be called by the contract owner (the Verifier contract).
     */
    function safeMint(address to, uint256 _neighborhoodId) public override onlyOwner {
        uint256 tokenId = _nextTokenId++;
        neighborhoodOf[tokenId] = _neighborhoodId;
        _mint(to, tokenId);
        emit BadgeMinted(to, tokenId, _neighborhoodId);
    }

    /**
     * @dev Overrides the internal _update hook to prevent all token transfers,
     * making the token "soulbound." Only the initial mint (from address(0)) is allowed.
     */
    function _update(address from, address to, uint256[] memory tokenIds, uint256 batchSize) internal override {
        require(from == address(0), "SoulboundNeighborhoodBadge: Cannot be transferred");
        super._update(from, to, tokenIds, batchSize);
    }
}
