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

/* TODO (2): setup quest keypair, fund it using any method you like */
const questKeypair = null

/* TODO (2):  */
const server = null
const questAccount = null

/* TODO (3): set the asset you will be using to counter your XLM offer */
const offerAsset = null

const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  /* TODO (4-7): add your operations to this transaction  */

/* TODO (8): sign and submit your transaction to the network */