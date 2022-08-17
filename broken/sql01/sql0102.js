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

const questKeypair = null /* TODO (3): load your quest account's keypair here*/
const destinationKeypair = null /* TODO (3): create a destination keypair here */

/* This method of using friendbot is not strictly necessary. We've put together
 * this helper function only as a convenience for you. You you free to choose
 * any number of ways to fund these accounts. */
await friendbot([questKeypair.publicKey(), destinationKeypair.publicKey()])

const server = null /* TODO (4): create your horizon server here */
const questAccount = null /* TODO (4): load your quest account here */

const transaction = null  /* TODO (5): build your transaction here */

/* TODO (6): sign your transaction here */

try {
  const res = null  /* TODO (7): submit your transaction to the testnet network */
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}: More details:\n${error.response.data}`)
}
