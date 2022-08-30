const {
  Keypair,
  Server,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE
} = require('stellar-sdk')

/* TODO (1): you'll need two funded keypairs for this quest */
const questKeypair = null
const issuerKeypair = null

/* TODO (1): create your server, and load the *issuer* account from it */
const server = new Server()
const issuerAccount = await server.loadAccount()

/* TODO (2): create your custom asset that we can control authorization for */
const controlledAsset = new Asset()

/* TODO (3-7): add onto the transaction below to complete your quest. Be mindful
 * of which source account you're using for each operation */
const transaction = new TransactionBuilder(
  issuerAccount, {
    fee: BASE_FEE
  })
  .addOperation(
    /* (3) you need an operation to set the flags on the issuer account */
  )
  .addOperation(
    /* (4) you need an operation for the quest account to trust the asset */
  )
  .addOperation(
    /* (5) you need an operation to authorize the trustline for the quest account */
  )
  .addOperation(
    /* (6) you need an operation to send the asset to the quest account */
  )
  .addOperation(
    /* (7) you need an operation to revoke the quest account's authorization */
  )

/* TODO (8): sign and submit the transaction to the testnet */
transaction.sign()
const res = await server.submitTransaction(transaction)