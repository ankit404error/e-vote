#!/usr/bin/env node

const Database = require('./database');
const db = new Database();

const args = process.argv.slice(2);
const command = args[0];

function showUsage() {
    console.log(`
🗳️  E-Vote Configuration Management Tool

Usage: node manage-voting.js <command> [options]

Commands:
  status                     - Show current voting configuration
  enable                     - Enable voting
  disable                    - Disable voting
  set-period <start> <end>   - Set voting period (ISO dates)
  set-title <title>          - Set voting title
  set-description <desc>     - Set voting description

Examples:
  node manage-voting.js status
  node manage-voting.js enable
  node manage-voting.js disable
  node manage-voting.js set-period "2024-01-01T00:00:00Z" "2024-12-31T23:59:59Z"
  node manage-voting.js set-title "General Election 2024"
  node manage-voting.js set-description "Cast your vote for the candidates"
    `);
}

function showStatus() {
    db.getVotingConfig((err, config) => {
        if (err) {
            console.error('❌ Error getting voting configuration:', err);
            process.exit(1);
        }
        
        db.isVotingActive((err, activeStatus) => {
            if (err) {
                console.error('❌ Error checking voting status:', err);
                process.exit(1);
            }
            
            console.log('\n📊 Voting Configuration Status:\n');
            console.log(`Status: ${activeStatus.isActive ? '🟢 ACTIVE' : '🔴 INACTIVE'}`);
            console.log(`Setting: ${config.voting_status || 'ACTIVE'}`);
            console.log(`Title: ${config.voting_title || 'General Election 2024'}`);
            console.log(`Description: ${config.voting_description || 'Cast your vote for candidates'}`);
            console.log(`Start Time: ${config.voting_start_time || '2024-01-01T00:00:00Z'}`);
            console.log(`End Time: ${config.voting_end_time || '2024-12-31T23:59:59Z'}`);
            console.log(`Current Time: ${new Date().toISOString()}`);
            
            if (activeStatus.isActive) {
                console.log('\n✅ Voting is currently ACTIVE - users can cast votes');
            } else {
                console.log('\n⛔ Voting is currently INACTIVE - users cannot vote');
                if (config.voting_status !== 'ACTIVE') {
                    console.log('   Reason: Voting is disabled by administrator');
                } else {
                    const now = new Date();
                    const start = new Date(config.voting_start_time);
                    const end = new Date(config.voting_end_time);
                    
                    if (now < start) {
                        console.log(`   Reason: Voting has not started yet (starts ${start.toLocaleString()})`);
                    } else if (now > end) {
                        console.log(`   Reason: Voting period has ended (ended ${end.toLocaleString()})`);
                    }
                }
            }
            
            console.log('');
            db.close();
        });
    });
}

function enableVoting() {
    db.updateVotingConfig('voting_status', 'ACTIVE', (err, result) => {
        if (err) {
            console.error('❌ Error enabling voting:', err);
            process.exit(1);
        }
        
        console.log('✅ Voting has been ENABLED');
        console.log('   Users can now cast votes (within the configured time period)');
        db.close();
    });
}

function disableVoting() {
    db.updateVotingConfig('voting_status', 'INACTIVE', (err, result) => {
        if (err) {
            console.error('❌ Error disabling voting:', err);
            process.exit(1);
        }
        
        console.log('⛔ Voting has been DISABLED');
        console.log('   Users cannot cast votes until voting is re-enabled');
        db.close();
    });
}

function setVotingPeriod(startTime, endTime) {
    // Validate dates
    try {
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Invalid date format');
        }
        
        if (start >= end) {
            throw new Error('Start time must be before end time');
        }
        
        // Update start time
        db.updateVotingConfig('voting_start_time', start.toISOString(), (err) => {
            if (err) {
                console.error('❌ Error setting start time:', err);
                process.exit(1);
            }
            
            // Update end time
            db.updateVotingConfig('voting_end_time', end.toISOString(), (err) => {
                if (err) {
                    console.error('❌ Error setting end time:', err);
                    process.exit(1);
                }
                
                console.log('📅 Voting period updated successfully:');
                console.log(`   Start: ${start.toLocaleString()}`);
                console.log(`   End: ${end.toLocaleString()}`);
                console.log(`   Duration: ${Math.round((end - start) / (1000 * 60 * 60 * 24))} days`);
                db.close();
            });
        });
        
    } catch (error) {
        console.error('❌ Invalid date format. Use ISO format like "2024-01-01T00:00:00Z"');
        process.exit(1);
    }
}

function setTitle(title) {
    db.updateVotingConfig('voting_title', title, (err, result) => {
        if (err) {
            console.error('❌ Error setting title:', err);
            process.exit(1);
        }
        
        console.log(`📝 Voting title updated to: "${title}"`);
        db.close();
    });
}

function setDescription(description) {
    db.updateVotingConfig('voting_description', description, (err, result) => {
        if (err) {
            console.error('❌ Error setting description:', err);
            process.exit(1);
        }
        
        console.log(`📄 Voting description updated to: "${description}"`);
        db.close();
    });
}

// Handle commands
switch (command) {
    case 'status':
        showStatus();
        break;
        
    case 'enable':
        enableVoting();
        break;
        
    case 'disable':
        disableVoting();
        break;
        
    case 'set-period':
        if (args.length < 3) {
            console.error('❌ Error: Both start and end times are required');
            console.error('Usage: node manage-voting.js set-period "<start>" "<end>"');
            process.exit(1);
        }
        setVotingPeriod(args[1], args[2]);
        break;
        
    case 'set-title':
        if (args.length < 2) {
            console.error('❌ Error: Title is required');
            console.error('Usage: node manage-voting.js set-title "<title>"');
            process.exit(1);
        }
        setTitle(args.slice(1).join(' '));
        break;
        
    case 'set-description':
        if (args.length < 2) {
            console.error('❌ Error: Description is required');
            console.error('Usage: node manage-voting.js set-description "<description>"');
            process.exit(1);
        }
        setDescription(args.slice(1).join(' '));
        break;
        
    default:
        if (!command) {
            console.log('❌ No command provided');
        } else {
            console.log(`❌ Unknown command: ${command}`);
        }
        showUsage();
        process.exit(1);
}