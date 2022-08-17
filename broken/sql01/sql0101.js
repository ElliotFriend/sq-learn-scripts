const {
  Keypair,
  Server,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE
} = require('stellar-sdk')

const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE');
const newKeypair = null // create a new keypair here

const server = null // create your server here
const questAccount = null // load your quest account here

const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  /* Complete your transaction below this line
   * add your `createAccount` operation, set a timeout, and don't forget to build()
   */



  /* Complete your transaction above this line */

// sign your transaction here

try {
  const res = null // submit your transaction here
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}: More details:\n${error.response.data}`)
}
