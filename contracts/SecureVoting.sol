// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SecureVoting {
    // Candidate enum
    enum Candidate { CandidateA, CandidateB, CandidateC }
    
    // Mapping to track if an address has voted
    mapping(address => bool) public hasVoted;
    
    // Mapping to store vote counts
    mapping(Candidate => uint256) public voteCounts;
    
    // Event emitted when a vote is cast
    event VoteCast(
        address indexed voter,
        Candidate candidate,
        string oact,
        uint256 timestamp,
        uint256 blockNumber
    );
    
    // Contract owner
    address public owner;
    
    // Total votes cast
    uint256 public totalVotes;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOnce() {
        require(!hasVoted[msg.sender], "Address has already voted");
        _;
    }
    
    modifier validCandidate(uint256 _candidate) {
        require(_candidate <= 2, "Invalid candidate");
        _;
    }
    
    function vote(uint256 _candidate, string memory _oact) 
        external 
        onlyOnce 
        validCandidate(_candidate) 
    {
        Candidate candidate = Candidate(_candidate);
        
        // Mark as voted
        hasVoted[msg.sender] = true;
        
        // Increment vote count
        voteCounts[candidate]++;
        totalVotes++;
        
        // Emit event
        emit VoteCast(
            msg.sender,
            candidate,
            _oact,
            block.timestamp,
            block.number
        );
    }
    
    function getResults() external view returns (uint256, uint256, uint256, uint256) {
        return (
            voteCounts[Candidate.CandidateA],
            voteCounts[Candidate.CandidateB],
            voteCounts[Candidate.CandidateC],
            totalVotes
        );
    }
    
    function getCandidateName(uint256 _candidate) external pure returns (string memory) {
        if (_candidate == 0) return "Candidate A";
        if (_candidate == 1) return "Candidate B";
        if (_candidate == 2) return "Candidate C";
        return "Invalid";
    }
    
    function hasAddressVoted(address _voter) external view returns (bool) {
        return hasVoted[_voter];
    }
}
