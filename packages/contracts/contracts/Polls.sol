pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Polls {
    IERC721 public immutable membershipNFT;

    struct Poll {
        uint256 id;
        address creator;
        string question;
        string[] options;
        mapping(uint256 => uint256) votes; // option index => vote count
        mapping(address => bool) voters;
    }

    uint256 private pollCounter;
    mapping(uint256 => Poll) public polls;

    event PollCreated(uint256 indexed pollId, address indexed creator);
    event Voted(uint256 indexed pollId, address indexed voter, uint256 optionIndex);

    constructor(address _membershipNFTAddress) {
        membershipNFT = IERC721(_membershipNFTAddress);
    }

    modifier onlyMember() {
        require(membershipNFT.balanceOf(msg.sender) > 0, "Only members can perform this action");
        _;
    }

    function createPoll(string memory _question, string[] memory _options) public onlyMember {
        require(_options.length >= 2, "Must have at least two options");
        pollCounter++;
        Poll storage newPoll = polls[pollCounter];
        newPoll.id = pollCounter;
        newPoll.creator = msg.sender;
        newPoll.question = _question;
        newPoll.options = _options;
        emit PollCreated(pollCounter, msg.sender);
    }

    function vote(uint256 _pollId, uint256 _optionIndex) public onlyMember {
        Poll storage p = polls[_pollId];
        require(p.id != 0, "Poll does not exist");
        require(!p.voters[msg.sender], "Already voted");
        require(_optionIndex < p.options.length, "Invalid option");
        p.voters[msg.sender] = true;
        p.votes[_optionIndex]++;
        emit Voted(_pollId, msg.sender, _optionIndex);
    }

    function getPollDetails(uint256 _pollId) public view returns (string memory, string[] memory, uint256[] memory) {
        Poll storage p = polls[_pollId];
        require(p.id != 0, "Poll does not exist");
        uint256[] memory voteCounts = new uint256[](p.options.length);
        for (uint256 i = 0; i < p.options.length; i++) {
            voteCounts[i] = p.votes[i];
        }
        return (p.question, p.options, voteCounts);
    }
}
