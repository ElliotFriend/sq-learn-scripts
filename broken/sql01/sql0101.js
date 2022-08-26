const {
  Keypair,
  Server,
  TransactionBuilder,
  Networks,
  Operation,
  BASE_FEE
} = require('stellar-sdk')

const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
/* TODO (2): create a new keypair here to serve as the account to be created */
const newKeypair = null

/* TODO (3): create your server here, and then use it to load your account */
const server = null 
const questAccount = null

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
  /* TODO (7): submit your transaction here using your server */
  const res = null
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}: More details:\n${error.response.data}`)
}
