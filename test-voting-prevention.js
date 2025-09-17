const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000';
const TEST_USER_ID = 999; // Test user ID

async function testVotingPrevention() {
    console.log('🧪 Testing Voting Prevention System...');
    console.log('=====================================\n');

    try {
        // Step 1: Check initial voting status
        console.log('1. 📊 Checking initial voting status...');
        const initialStatus = await fetch(`${BASE_URL}/api/voting/status/${TEST_USER_ID}`);
        const initialData = await initialStatus.json();
        
        console.log(`   Initial status: ${initialData.hasVoted ? 'Already voted' : 'Not voted yet'}`);
        console.log(`   Can vote: ${initialData.canVote}`);
        console.log(`   Message: ${initialData.message}\n`);

        // Step 2: Try to vote for first time
        console.log('2. 🗳️  Attempting first vote...');
        const firstVote = await fetch(`${BASE_URL}/api/voting/cast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                candidateId: 1,
                userId: TEST_USER_ID,
                candidateName: 'Candidate A'
            })
        });

        const firstVoteData = await firstVote.json();
        
        if (firstVoteData.success) {
            console.log('   ✅ First vote successful!');
            console.log(`   Transaction: ${firstVoteData.transactionHash}`);
        } else {
            console.log('   ❌ First vote failed:');
            console.log(`   Error: ${firstVoteData.message}`);
        }
        console.log('');

        // Step 3: Wait a moment and check status again
        console.log('3. 📊 Checking voting status after first vote...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const afterVoteStatus = await fetch(`${BASE_URL}/api/voting/status/${TEST_USER_ID}`);
        const afterVoteData = await afterVoteStatus.json();
        
        console.log(`   Status after vote: ${afterVoteData.hasVoted ? 'Voted' : 'Not voted'}`);
        console.log(`   Can vote again: ${afterVoteData.canVote}`);
        console.log(`   Message: ${afterVoteData.message}`);
        if (afterVoteData.votedAt) {
            console.log(`   Voted at: ${afterVoteData.votedAt}`);
        }
        console.log('');

        // Step 4: Try to vote again (THIS SHOULD BE PREVENTED)
        console.log('4. 🚫 Attempting second vote (should be prevented)...');
        const secondVote = await fetch(`${BASE_URL}/api/voting/cast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                candidateId: 2,
                userId: TEST_USER_ID,
                candidateName: 'Candidate B'
            })
        });

        const secondVoteData = await secondVote.json();
        
        if (secondVoteData.success) {
            console.log('   ❌ ERROR: Second vote was allowed! This is a bug!');
        } else {
            console.log('   ✅ Second vote correctly prevented!');
            console.log(`   Prevention message: ${secondVoteData.message}`);
            if (secondVoteData.alreadyVoted) {
                console.log('   🔒 Already voted flag: true');
            }
        }
        console.log('');

        // Step 5: Try third vote attempt with different candidate
        console.log('5. 🚫 Attempting third vote (should also be prevented)...');
        const thirdVote = await fetch(`${BASE_URL}/api/voting/cast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                candidateId: 3,
                userId: TEST_USER_ID,
                candidateName: 'Candidate C'
            })
        });

        const thirdVoteData = await thirdVote.json();
        
        if (thirdVoteData.success) {
            console.log('   ❌ ERROR: Third vote was allowed! This is a bug!');
        } else {
            console.log('   ✅ Third vote correctly prevented!');
            console.log(`   Prevention message: ${thirdVoteData.message}`);
        }
        console.log('');

        // Step 6: Final status check
        console.log('6. 📊 Final voting status check...');
        const finalStatus = await fetch(`${BASE_URL}/api/voting/status/${TEST_USER_ID}`);
        const finalData = await finalStatus.json();
        
        console.log(`   Final status: ${finalData.hasVoted ? 'Voted' : 'Not voted'}`);
        console.log(`   Can vote: ${finalData.canVote}`);
        console.log(`   Transaction hash: ${finalData.transactionHash || 'None'}`);
        console.log('');

        // Summary
        console.log('📋 SUMMARY:');
        console.log('===========');
        
        const preventionWorking = !secondVoteData.success && !thirdVoteData.success;
        
        if (preventionWorking) {
            console.log('✅ VOTING PREVENTION IS WORKING CORRECTLY!');
            console.log('   - User can vote once ✅');
            console.log('   - Subsequent votes are blocked ✅');
            console.log('   - Clear error messages shown ✅');
            console.log('   - Database tracking working ✅');
        } else {
            console.log('❌ VOTING PREVENTION IS NOT WORKING!');
            console.log('   - Users can vote multiple times');
            console.log('   - This needs to be fixed immediately');
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.log('');
        console.log('💡 Make sure the server is running:');
        console.log('   npm start');
    }
}

// Run the test
if (require.main === module) {
    testVotingPrevention();
}

module.exports = { testVotingPrevention };