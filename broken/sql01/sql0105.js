const {
  Keypair,
  Server,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE
} = require('stellar-sdk')
const { friendbot } = require('../../sq-learn-utils')

/* TODO (2): create and fund all the accounts you'll need */
const questKeypair = null
const issuerKeypair = null
const distributorKeypair = null
const destinationKeypair = null

/* TODO (3): setup the server, account for the transaction, and your custom asset */
const server = null
const questAccount = null
const pathAsset = null

const transaction = new TransactionBuilder(
  /* TODO (4-6): build your transaction below this line */


  
  /* TODO (4-6): build your transaction above this line */
  .setTimeout(30)
  .build()

/* TODO (7): sign and submit your transaction to the network */