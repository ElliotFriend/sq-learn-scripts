const {
  Keypair,
  Server,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE
} = require('stellar-sdk')

const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE');
const newKeypair = null /* TODO (2): create a new keypair here */

const server = null /* TODO (3): create your server here */
const questAccount = null /* TODO (3): load your quest account here */

const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  /* TODO (5): Complete your transaction below this line
   * add your `createAccount` operation, set a timeout, and don't forget to build() */



  /* TODO (5): Complete your transaction above this line */

/* TODO (6): sign your transaction here */

try {
  const res = null /* TODO (7): submit your transaction here */
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}: More details:\n${error.response.data}`)
}
