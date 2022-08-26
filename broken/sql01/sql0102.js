const {
  Keypair,
  Server,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE
} = require('stellar-sdk')
const { friendbot } = require('@runkit/elliotfriend/sq-learn-utils/1.0.5')

/* TODO (3): setup the necessary keypairs here */
const questKeypair = null
const destinationKeypair = null

/* This method of using friendbot is not strictly necessary. We've put together
 * this helper function simply as a convenience. You are free to choose any
 * number of ways to fund these accounts. */
await friendbot([questKeypair.publicKey(), destinationKeypair.publicKey()])

/* TODO (4): create your server here, and then use it to load your account */
const server = null
const questAccount = null

const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  /* TODO (5): include a payment operation and finish building your transaction here */

/* TODO (6): sign your transaction here */

try {
  /* TODO (7): submit your transaction here using your server */
  const res = null
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}: More details:\n${error.response.data}`)
}
