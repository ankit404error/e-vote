const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testVote() {
    try {
        console.log('🗳️  Testing vote casting...');
        
        const response = await fetch('http://localhost:4000/api/cast-vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: 'OACT_test_12345',
                candidate: 'Candidate A'
            })
        });
        
        const result = await response.json();
        console.log('📊 Vote response:', result);
        
        if (result.success) {
            console.log('✅ Vote cast successfully!');
            console.log('📄 Transaction hash:', result.transactionHash);
            
            // Check updated candidates
            const candidatesResponse = await fetch('http://localhost:4000/api/blockchain/candidates');
            const candidatesResult = await candidatesResponse.json();
            console.log('📊 Updated candidates:', candidatesResult.candidates);
        } else {
            console.log('❌ Vote failed:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testVote();