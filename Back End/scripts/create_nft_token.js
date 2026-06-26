// Script to create a new Hedera NFT token and output the admin/supply key
// Usage: node scripts/create_nft_token.js

const {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
} = require('@hashgraph/sdk');
require('dotenv').config();

async function main() {
  // 1. Generate a new private key for the supply/admin key
  const supplyKey = PrivateKey.generateED25519();
  console.log('\n=== NFT Supply/Admin Key (SAVE THIS!) ===');
  console.log('Private Key:', supplyKey.toString());
  console.log('Public Key:', supplyKey.publicKey.toString());

  // 2. Use your operator account for paying fees (must have HBAR)
  const OPERATOR_ACCOUNT_ID = process.env.ADMIN_ACCOUNT_ID;
  const OPERATOR_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
  console.log('OPERATOR_ACCOUNT_ID:', OPERATOR_ACCOUNT_ID);
  console.log('OPERATOR_PRIVATE_KEY:', OPERATOR_PRIVATE_KEY);
  const client = Client.forTestnet().setOperator(
    OPERATOR_ACCOUNT_ID,
    OPERATOR_PRIVATE_KEY,
  );
  // 3. Create the NFT token
  const transaction = await new TokenCreateTransaction()
    .setTokenName('Academic Certificate NFT')
    .setTokenSymbol('CERT')
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setTreasuryAccountId(OPERATOR_ACCOUNT_ID)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(1000)
    .setSupplyKey(supplyKey.publicKey)
    .setAdminKey(supplyKey.publicKey)
    .setFreezeDefault(false)
    .setMaxTransactionFee(new Hbar(20));

  const tx = await transaction.freezeWith(client).sign(supplyKey);
  const submitTx = await tx.execute(client);
  const receipt = await submitTx.getReceipt(client);
  const tokenId = receipt.tokenId;

  console.log('\n=== Created NFT Token ===');
  console.log('Token ID:', tokenId.toString());
  console.log('Supply/Admin Private Key (SAVE THIS!):', supplyKey.toString());
  console.log('Supply/Admin Public Key:', supplyKey.publicKey.toString());
  console.log(
    '\nStore this private key securely. You will need it to mint NFTs!',
  );
}

main().catch((err) => {
  console.error('Error creating NFT token:', err);
  process.exit(1);
});
