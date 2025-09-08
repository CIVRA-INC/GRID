
pragma solidity ^0.8.20;

interface INeighborhoodHub {

    struct Post {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        bool isAnonymous;
    }


    struct Poll {
        uint256 id;
        address creator;
        string question;
        string[] options;
        mapping(uint256 => uint256) votes;
        mapping(address => bool) hasVoted;
        uint256 deadline;
    }

  
    event PostCreated(uint256 indexed postId, address indexed author, bool isAnonymous);

    event PollCreated(uint256 indexed pollId, address indexed creator);
 
    event Voted(uint256 indexed pollId, address indexed voter, uint256 optionIndex);

    function createPost(string calldata content, bool isAnonymous) external;

    function createPoll(string calldata question, string[] calldata options, uint256 durationInSeconds) external;

    function vote(uint256 pollId, uint256 optionIndex) external;
}