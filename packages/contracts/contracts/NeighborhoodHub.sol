// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./interfaces/INeighborhoodHub.sol";


contract NeighborhoodHub is INeighborhoodHub {
    IERC721 public immutable sbnftContract;
    uint256 public immutable neighborhoodId;

    Post[] public posts;
    Poll[] public polls;

    /**
     * @dev This is the core security feature. It checks if the message sender (msg.sender)
     * owns at least one SBNFT. In a real-world scenario with multiple SBNFTs per user,
     * this would need to be more sophisticated, but for the MVP, checking for a balance > 0 is sufficient.
     * Note: A full implementation would check `neighborhoodOf(tokenId)` on the SBNFT contract.
     */
    modifier onlyVerifiedMember() {
        require(sbnftContract.balanceOf(msg.sender) > 0, "NeighborhoodHub: Not a verified member");

        _;
    }

    constructor(address _sbnftAddress, uint256 _neighborhoodId) {
        sbnftContract = IERC721(_sbnftAddress);
        neighborhoodId = _neighborhoodId;
    }


    function createPost(string calldata content, bool isAnonymous) external override onlyVerifiedMember {
        uint256 postId = posts.length;
        posts.push(Post({
            id: postId,
            author: msg.sender,
            content: content,
            timestamp: block.timestamp,
            isAnonymous: isAnonymous
        }));
        emit PostCreated(postId, msg.sender, isAnonymous);
    }

    function createPoll(string calldata question, string[] calldata options, uint256 durationInSeconds) external override onlyVerifiedMember {
        require(options.length >= 2, "Polls must have at least 2 options");
        uint256 pollId = polls.length;

        Poll storage newPoll = polls.push();
        newPoll.id = pollId;
        newPoll.creator = msg.sender;
        newPoll.question = question;
        newPoll.options = options;
        newPoll.deadline = block.timestamp + durationInSeconds;

        emit PollCreated(pollId, msg.sender);
    }

    function vote(uint256 pollId, uint256 optionIndex) external override onlyVerifiedMember {
        Poll storage selectedPoll = polls[pollId];
        require(block.timestamp < selectedPoll.deadline, "Poll has ended");
        require(!selectedPoll.hasVoted[msg.sender], "Already voted");
        require(optionIndex < selectedPoll.options.length, "Invalid option");

        selectedPoll.hasVoted[msg.sender] = true;
        selectedPoll.votes[optionIndex]++;

        emit Voted(pollId, msg.sender, optionIndex);
    }
}