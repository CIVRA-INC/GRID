// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// A simple interface for the SBNFT contract
interface ISoulboundNFT {
    function balanceOf(address owner) external view returns (uint256);
}

contract NeighborhoodHub {
    using ECDSA for bytes32;

    // --- Existing Structs and State Variables ---
    struct Post {
        uint256 id;
        string content;
        address author; // For anonymous posts, this will be address(0)
        bool isAnonymous;
        uint256 timestamp;
    }

    ISoulboundNFT public sbnft;
    Post[] public posts;
    uint256 public nextPostId;

    event PostCreated(
        uint256 id,
        string content,
        address indexed author,
        bool isAnonymous
    );

    // --- Existing Constructor ---
    constructor(address _sbnftAddress) {
        sbnft = ISoulboundNFT(_sbnftAddress);
    }

    // --- Existing `createPost` function (for public posts) ---
    function createPost(string calldata _content) external {
        require(sbnft.balanceOf(msg.sender) > 0, "NeighborhoodHub: Caller is not a verified member");
        
        posts.push(Post({
            id: nextPostId,
            content: _content,
            author: msg.sender,
            isAnonymous: false,
            timestamp: block.timestamp
        }));

        emit PostCreated(nextPostId, _content, msg.sender, false);
        nextPostId++;
    }

    // --- NEW FUNCTION for Anonymous Posting ---

    /**
     * @notice Allows a verified member to post anonymously via a relayer.
     * @dev The user signs a hash of the content off-chain. A relayer submits this
     * signature to the contract, which verifies the signer owns the SBNFT.
     * @param _content The content of the post.
     * @param _signature The user's EIP-191 signature of the content hash.
     */
    function postAnonymously(string calldata _content, bytes calldata _signature) external {
        // 1. Recreate the message hash that the user signed off-chain.
        // The EIP-191 standard prefix ("\x19Ethereum Signed Message:\n") prevents
        // signatures from being valid for other chains or contracts.
        bytes32 messageHash = keccak256(bytes(_content));
        bytes32 prefixedHash = messageHash.toEthSignedMessageHash();

        // 2. Recover the signer's address from the signature and the hash.
        address signer = prefixedHash.recover(_signature);

        // 3. Verify that the recovered signer is a valid SBNFT holder.
        require(sbnft.balanceOf(signer) > 0, "NeighborhoodHub: Signer is not a verified member");

        // 4. Create the post, marking the author as anonymous (address(0)).
        posts.push(Post({
            id: nextPostId,
            content: _content,
            author: address(0), // Anonymize the author
            isAnonymous: true,
            timestamp: block.timestamp
        }));

        // Use the relayer's address (msg.sender) in the event for traceability if needed,
        // or emit the recovered signer's address if privacy allows. Here, we emit the anonymous address.
        emit PostCreated(nextPostId, _content, address(0), true);
        nextPostId++;
    }
}