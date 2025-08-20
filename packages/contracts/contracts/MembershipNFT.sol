pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ProofOfLocation.sol";

contract MembershipNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    ProofOfLocation public immutable proofOfLocation;

    constructor(address _proofOfLocationAddress)
        ERC721("GRID Membership", "GRID")
        Ownable(msg.sender)
    {
        proofOfLocation = ProofOfLocation(_proofOfLocationAddress);
    }

    function safeMint(address _to) public onlyOwner {
        bytes32 locationHash = proofOfLocation.locationVerifications(_to);
        require(locationHash != bytes32(0), "User location not verified");
        _safeMint(_to, _nextTokenId++);
    }

    function _transfer(address from, address to, uint256 tokenId) internal override {
        revert("This NFT is soulbound and cannot be transferred.");
    }
}