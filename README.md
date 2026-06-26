cat > README.md << 'EOF'
# HashGov 🔐

> Decentralized administrative services platform built on Hedera Hashgraph

## What it does
- Digital identity management on Hedera DLT
- Issuance and verification of official certificates as NFTs (HTS)
- HBAR wallet integration for on-chain transactions
- Full-stack web interface for citizens and administrators

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js / Express
- **Database:** MongoDB
- **Blockchain:** Hedera Hashgraph (HTS, HCS)

## Getting Started

### Backend
```bash
cd "Back End"
cp .env.sample .env  # Fill in your credentials
npm install
npm start
```

### Frontend
```bash
cd "Front End"
cp .env.sample .env
npm install
npm start
```

## Architecture
HashGov uses Hedera Token Service (HTS) to mint certificates as NFTs and Hedera Consensus Service (HCS) for audit logging of administrative actions.
EOF
