# 🗳️ Voting Configuration System

The E-Vote system now includes a comprehensive voting configuration system that allows administrators to control when and how voting occurs. This system provides both database-level and API-level controls to manage the voting process.

## 🌟 Features

- **Voting Status Control**: Enable or disable voting at any time
- **Time-Based Voting Periods**: Set specific start and end times for voting
- **Dynamic Configuration**: Change voting settings without restarting the server
- **Real-time Status Checks**: Frontend automatically checks voting status
- **Admin Panel Integration**: API endpoints for admin control
- **CLI Management Tools**: Command-line interface for easy administration

## 🛠️ Configuration Options

### Voting Status
- `ACTIVE`: Voting is enabled (subject to time period)
- `INACTIVE`: Voting is completely disabled

### Time Period Settings
- `voting_start_time`: When voting begins (ISO 8601 format)
- `voting_end_time`: When voting ends (ISO 8601 format)

### Display Settings
- `voting_title`: Title shown to users
- `voting_description`: Description shown to users

## 📋 Management Commands

### Using npm scripts:
```bash
# Check current voting status
npm run voting-status

# Enable voting
npm run voting-enable

# Disable voting
npm run voting-disable

# Show all configuration options
npm run voting-config
```

### Using the CLI directly:
```bash
# Check status
node manage-voting.js status

# Enable/disable voting
node manage-voting.js enable
node manage-voting.js disable

# Set voting period
node manage-voting.js set-period "2025-01-01T00:00:00Z" "2025-12-31T23:59:59Z"

# Update titles and descriptions
node manage-voting.js set-title "Presidential Election 2024"
node manage-voting.js set-description "Choose your candidate for the next term"
```

## 🔌 API Endpoints

### Get Voting Configuration
```http
GET /api/voting/config
```

Returns the complete voting configuration and current status:
```json
{
  "success": true,
  "config": {
    "voting_status": "ACTIVE",
    "voting_start_time": "2025-01-01T00:00:00Z",
    "voting_end_time": "2025-12-31T23:59:59Z",
    "voting_title": "General Election 2024",
    "voting_description": "Cast your vote for candidates",
    "isActive": true,
    "status": "ACTIVE",
    "startTime": "2025-01-01T00:00:00Z",
    "endTime": "2025-12-31T23:59:59Z",
    "currentTime": "2025-09-17T21:56:59.561Z"
  }
}
```

### Update Voting Configuration (Admin)
```http
POST /api/admin/voting/config
Content-Type: application/json

{
  "key": "voting_status",
  "value": "ACTIVE"
}
```

Allowed keys:
- `voting_status`: "ACTIVE" or "INACTIVE"
- `voting_start_time`: ISO 8601 date string
- `voting_end_time`: ISO 8601 date string
- `voting_title`: String
- `voting_description`: String

## 🎯 Frontend Integration

The frontend automatically checks voting status when:
- Loading the voting page
- Before allowing candidate selection
- Before submitting votes

### User Experience
- **Active Voting**: Users can select candidates and vote normally
- **Inactive Voting**: 
  - Candidate cards are dimmed and disabled
  - Vote button is disabled
  - Clear message explains why voting is unavailable
  - Time period information is displayed

## 📊 Database Schema

The system adds a `voting_config` table:
```sql
CREATE TABLE voting_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Technical Implementation

### Server-side Integration
- Database methods: `getVotingConfig()`, `updateVotingConfig()`, `isVotingActive()`
- API endpoints for configuration management
- Automatic voting status checks in voting endpoints

### Client-side Integration  
- Updated voting status endpoint includes configuration
- Frontend checks voting status before allowing interactions
- Visual indicators for voting availability
- Real-time status updates

## 🚀 Common Use Cases

### 1. Scheduled Election
```bash
# Set up an election period
node manage-voting.js set-period "2025-11-01T08:00:00Z" "2025-11-01T20:00:00Z"
node manage-voting.js set-title "Student Council Election 2025"
node manage-voting.js enable
```

### 2. Emergency Voting Stop
```bash
# Immediately disable all voting
npm run voting-disable
```

### 3. Maintenance Mode
```bash
# Disable voting for system maintenance
npm run voting-disable
# ... perform maintenance ...
npm run voting-enable
```

### 4. Pre-Election Setup
```bash
# Set up voting but don't start yet
node manage-voting.js set-period "2025-12-15T09:00:00Z" "2025-12-15T17:00:00Z"
node manage-voting.js set-title "Annual Board Election"
node manage-voting.js disable
# Enable when ready to start
```

## 🔍 Monitoring and Status

### Check Current Status
```bash
npm run voting-status
```

This shows:
- ✅ Current voting status (Active/Inactive)
- 📅 Configured time period
- 🏷️ Current title and description  
- ⏰ Current time vs. voting period
- 📋 Detailed reason if voting is inactive

### Status Indicators
- 🟢 **ACTIVE**: Voting is available now
- 🔴 **INACTIVE**: Voting is not available
- ⏰ Time-based reasons (not started/ended)
- 🛑 Admin-disabled reasons

## 🛡️ Security Considerations

- All configuration changes are logged with timestamps
- Admin endpoints should be protected (add authentication as needed)
- Configuration changes take effect immediately
- Database integrity is maintained with proper constraints

## 🔄 Integration with Blockchain

The voting configuration system works alongside the blockchain voting:
- Configuration controls when votes can be submitted to the blockchain
- Blockchain transactions are still attempted when voting is active
- Database tracking continues regardless of blockchain status
- Fallback systems remain operational

## 📝 Best Practices

1. **Test Configuration Changes**: Always verify settings with `npm run voting-status`
2. **Set Buffer Time**: Include buffer time before/after main voting period
3. **Clear Communication**: Update title/description to match current election
4. **Monitor Active Periods**: Check status during active voting periods
5. **Backup Before Changes**: Backup database before major configuration changes

## 🆘 Troubleshooting

### Voting Shows as Inactive
1. Check time period: `npm run voting-status`
2. Verify current time vs. configured period
3. Check admin status setting
4. Update period if needed: `node manage-voting.js set-period "<start>" "<end>"`

### Frontend Not Reflecting Changes  
1. Configuration changes are immediate
2. Users may need to refresh the page
3. Check network connectivity to API
4. Verify server is running with updated code

### Database Issues
1. Check database file permissions
2. Verify table creation in logs
3. Recreate voting_config table if needed
4. Check for database corruption

This voting configuration system provides complete control over the voting process while maintaining the security and integrity of the blockchain-based voting system.