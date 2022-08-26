const {
  Keypair,
  Server,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE
} = require('stellar-sdk')

/* TODO (2): get your two keypairs ready, don't forget to have them funded */
const questKeypair = null
const issuerKeypair = null

/* TODO (3): set up your server connection and load up your quest account */
const server = null
const questAccount = null

/* TODO (4): Create your asset below. Use any code you like! */
const someAsset = new Asset(/* put your asset information here */)

const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  /* TODO (5): build your transaction containing the changeTrust operation */

/* TODO (6): Sign and submit your transaction to the network. */
