const {
  Server,
  Transaction,
  Networks,
  BASE_FEE
} = require('stellar-sdk')

/* TODO (1): setup your keypair, server, and load your account */
const questKeypair = Keypair.fromSecret()
const server = null
const questAccount = server.loadAccount()

/* TODO (2): build your transaction here, containing a `manageData` operation */
const transaction = new Transaction(
  questAccount, {
    fee: BASE_FEE,
    passphrase: Networks.TESTNET
  })
  .addOperation(
    /* add your `manageData` operation here */
  )
  .build()

/* TODO (3): sign and submit your transaction to the testnet */
transaction.sign(questAccount)
const res = null
