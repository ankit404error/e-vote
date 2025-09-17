// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EVoting
 * @dev A secure voting contract for the Aadhaar-based E-Voting system with encrypted vote storage
 */
contract EVoting {
    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }
    
    struct EncryptedVote {
        bytes32 voterHash;        // Anonymous voter identifier
        string encryptedChoice;   // Encrypted vote choice using public key
        uint256 timestamp;
        bytes32 receiptHash;      // Receipt hash for verification
    }
    
    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public hasVoted;
    mapping(bytes32 => bool) public voterHashes; // Hash of unique voter ID for privacy
    mapping(uint256 => EncryptedVote) public encryptedVotes; // Store encrypted votes
    
    uint256 public candidatesCount;
    uint256 public totalVotes;
    uint256 public encryptedVoteCount;
    bool public votingActive;
    string public publicKey; // RSA public key for encryption
    
    address public admin;
    
    event CandidateAdded(uint256 indexed candidateId, string name, string party);
    event VoteCast(uint256 indexed candidateId, bytes32 indexed voterHash, uint256 timestamp);
    event EncryptedVoteStored(uint256 indexed voteId, bytes32 indexed voterHash, bytes32 receiptHash);
    event VotingStatusChanged(bool active);
    event VotingReset();
    event PublicKeyUpdated(string newPublicKey);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier votingIsActive() {
        require(votingActive, "Voting is not active");
        _;
    }
    
    constructor(string memory _publicKey) {
        admin = msg.sender;
        votingActive = true;
        publicKey = _publicKey;
        encryptedVoteCount = 0;
        
        // Add default candidates for demo
        addCandidate("Alice Johnson", "Progressive Alliance Party");
        addCandidate("Bob Smith", "Unity Coalition Party");
        addCandidate("Carol Williams", "Innovation Party");
        addCandidate("David Brown", "Future Vision Party");
    }
    
    /**
     * @dev Add a new candidate (admin only)
     */
    function addCandidate(string memory _name, string memory _party) public onlyAdmin {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, _party, 0);
        emit CandidateAdded(candidatesCount, _name, _party);
    }
    
    /**
     * @dev Cast a vote for a candidate (public tally)
     * @param _candidateId The ID of the candidate to vote for
     * @param _voterHash Hashed unique identifier of the voter (for privacy)
     */
    function vote(uint256 _candidateId, bytes32 _voterHash) public votingIsActive {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        require(!voterHashes[_voterHash], "This voter has already voted");
        
        voterHashes[_voterHash] = true;
        candidates[_candidateId].voteCount++;
        totalVotes++;
        
        emit VoteCast(_candidateId, _voterHash, block.timestamp);
    }
    
    /**
     * @dev Cast an encrypted vote (for immutable audit trail)
     * @param _encryptedChoice The encrypted vote choice
     * @param _voterHash Hashed unique identifier of the voter (for privacy)
     */
    function castEncryptedVote(
        string memory _encryptedChoice, 
        bytes32 _voterHash
    ) public votingIsActive returns (bytes32 receiptHash) {
        require(!voterHashes[_voterHash], "This voter has already voted");
        require(bytes(_encryptedChoice).length > 0, "Encrypted choice cannot be empty");
        
        // Generate receipt hash
        receiptHash = keccak256(abi.encodePacked(
            _voterHash, 
            _encryptedChoice, 
            block.timestamp, 
            block.number
        ));
        
        // Store encrypted vote
        encryptedVoteCount++;
        encryptedVotes[encryptedVoteCount] = EncryptedVote({
            voterHash: _voterHash,
            encryptedChoice: _encryptedChoice,
            timestamp: block.timestamp,
            receiptHash: receiptHash
        });
        
        emit EncryptedVoteStored(encryptedVoteCount, _voterHash, receiptHash);
        
        return receiptHash;
    }
    
    /**
     * @dev Combined vote function - casts both public tally and encrypted vote
     * @param _candidateId The ID of the candidate to vote for
     * @param _encryptedChoice The encrypted vote choice
     * @param _voterHash Hashed unique identifier of the voter (for privacy)
     */
    function voteWithEncryption(
        uint256 _candidateId, 
        string memory _encryptedChoice, 
        bytes32 _voterHash
    ) public votingIsActive returns (bytes32 receiptHash) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        require(!voterHashes[_voterHash], "This voter has already voted");
        require(bytes(_encryptedChoice).length > 0, "Encrypted choice cannot be empty");
        
        // Mark voter as voted
        voterHashes[_voterHash] = true;
        
        // Increment public tally
        candidates[_candidateId].voteCount++;
        totalVotes++;
        
        // Store encrypted vote for audit
        receiptHash = keccak256(abi.encodePacked(
            _voterHash, 
            _encryptedChoice, 
            block.timestamp, 
            block.number
        ));
        
        encryptedVoteCount++;
        encryptedVotes[encryptedVoteCount] = EncryptedVote({
            voterHash: _voterHash,
            encryptedChoice: _encryptedChoice,
            timestamp: block.timestamp,
            receiptHash: receiptHash
        });
        
        emit VoteCast(_candidateId, _voterHash, block.timestamp);
        emit EncryptedVoteStored(encryptedVoteCount, _voterHash, receiptHash);
        
        return receiptHash;
    }
    
    /**
     * @dev Get candidate details
     */
    function getCandidate(uint256 _candidateId) public view returns (
        uint256 id,
        string memory name,
        string memory party,
        uint256 voteCount
    ) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        Candidate memory candidate = candidates[_candidateId];
        return (candidate.id, candidate.name, candidate.party, candidate.voteCount);
    }
    
    /**
     * @dev Get all candidates with their vote counts
     */
    function getAllCandidates() public view returns (
        uint256[] memory ids,
        string[] memory names,
        string[] memory parties,
        uint256[] memory voteCounts
    ) {
        ids = new uint256[](candidatesCount);
        names = new string[](candidatesCount);
        parties = new string[](candidatesCount);
        voteCounts = new uint256[](candidatesCount);
        
        for (uint256 i = 1; i <= candidatesCount; i++) {
            Candidate memory candidate = candidates[i];
            ids[i-1] = candidate.id;
            names[i-1] = candidate.name;
            parties[i-1] = candidate.party;
            voteCounts[i-1] = candidate.voteCount;
        }
    }
    
    /**
     * @dev Get voting results summary
     */
    function getResults() public view returns (
        uint256 totalVotesCast,
        uint256 totalCandidates,
        uint256 encryptedVotesCast,
        bool isActive
    ) {
        return (totalVotes, candidatesCount, encryptedVoteCount, votingActive);
    }
    
    /**
     * @dev Get encrypted vote by ID (admin only)
     */
    function getEncryptedVote(uint256 _voteId) public view onlyAdmin returns (
        bytes32 voterHash,
        string memory encryptedChoice,
        uint256 timestamp,
        bytes32 receiptHash
    ) {
        require(_voteId > 0 && _voteId <= encryptedVoteCount, "Invalid vote ID");
        EncryptedVote memory vote = encryptedVotes[_voteId];
        return (vote.voterHash, vote.encryptedChoice, vote.timestamp, vote.receiptHash);
    }
    
    /**
     * @dev Get all encrypted votes (admin only) - for decryption interface
     */
    function getAllEncryptedVotes() public view onlyAdmin returns (
        uint256[] memory voteIds,
        bytes32[] memory voterHashes,
        string[] memory encryptedChoices,
        uint256[] memory timestamps,
        bytes32[] memory receiptHashes
    ) {
        voteIds = new uint256[](encryptedVoteCount);
        voterHashes = new bytes32[](encryptedVoteCount);
        encryptedChoices = new string[](encryptedVoteCount);
        timestamps = new uint256[](encryptedVoteCount);
        receiptHashes = new bytes32[](encryptedVoteCount);
        
        for (uint256 i = 1; i <= encryptedVoteCount; i++) {
            EncryptedVote memory vote = encryptedVotes[i];
            voteIds[i-1] = i;
            voterHashes[i-1] = vote.voterHash;
            encryptedChoices[i-1] = vote.encryptedChoice;
            timestamps[i-1] = vote.timestamp;
            receiptHashes[i-1] = vote.receiptHash;
        }
    }
    
    /**
     * @dev Update public key for encryption (admin only)
     */
    function updatePublicKey(string memory _newPublicKey) public onlyAdmin {
        require(bytes(_newPublicKey).length > 0, "Public key cannot be empty");
        publicKey = _newPublicKey;
        emit PublicKeyUpdated(_newPublicKey);
    }
    
    /**
     * @dev Check if a voter has already voted (using hash for privacy)
     */
    function hasVoterVoted(bytes32 _voterHash) public view returns (bool) {
        return voterHashes[_voterHash];
    }
    
    /**
     * @dev Toggle voting status (admin only)
     */
    function toggleVoting() public onlyAdmin {
        votingActive = !votingActive;
        emit VotingStatusChanged(votingActive);
    }
    
    /**
     * @dev Reset all votes (admin only) - for demo purposes
     */
    function resetVotes() public onlyAdmin {
        for (uint256 i = 1; i <= candidatesCount; i++) {
            candidates[i].voteCount = 0;
        }
        totalVotes = 0;
        
        // Clear encrypted votes
        for (uint256 i = 1; i <= encryptedVoteCount; i++) {
            delete encryptedVotes[i];
        }
        encryptedVoteCount = 0;
        
        emit VotingReset();
    }
    
    /**
     * @dev Reset voter registry (admin only) - for demo purposes
     */
    function resetVoterRegistry() public onlyAdmin {
        // Note: This is a simplified reset for demo purposes
        // In production, you would need a more sophisticated approach
        totalVotes = 0;
        encryptedVoteCount = 0;
        emit VotingReset();
    }
    
    /**
     * @dev Emergency reset - clears all data (admin only)
     */
    function emergencyReset() public onlyAdmin {
        // Reset candidate vote counts
        for (uint256 i = 1; i <= candidatesCount; i++) {
            candidates[i].voteCount = 0;
        }
        totalVotes = 0;
        
        // Clear all encrypted votes
        for (uint256 i = 1; i <= encryptedVoteCount; i++) {
            delete encryptedVotes[i];
        }
        encryptedVoteCount = 0;
        
        votingActive = true;
        emit VotingReset();
    }
    
    /**
     * @dev Get winner (candidate with most votes)
     */
    function getWinner() public view returns (
        uint256 winnerId,
        string memory winnerName,
        string memory winnerParty,
        uint256 winnerVotes
    ) {
        require(candidatesCount > 0, "No candidates available");
        
        uint256 highestVotes = 0;
        uint256 winningCandidateId = 0;
        
        for (uint256 i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > highestVotes) {
                highestVotes = candidates[i].voteCount;
                winningCandidateId = i;
            }
        }
        
        if (winningCandidateId > 0) {
            Candidate memory winner = candidates[winningCandidateId];
            return (winner.id, winner.name, winner.party, winner.voteCount);
        }
        
        return (0, "No votes cast", "", 0);
    }
}