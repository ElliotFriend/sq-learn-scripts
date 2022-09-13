/* TODO (1): Fill in all the SDK, account, and keypair setup below this line  */
const {
  Keypair,
  Server,
  BASE_FEE
} = require('stellar-sdk')

const questKeypair = Keypair.fromPublicKey('PUBLIC_KEY_HERE')

const server = Server(null)
const questAccount = server.loadAccount(questKeypair.public)
/* TODO (1): Fill in all the SDK, account, and keypair setup above this line  */

const transaction = new TransactionBuilder({
    source: questAccount,
    fee: 100,
    networkPassphrase: TESTNET_PASSPHRASE
  })
  .addOperation(bumpSequenceOperation({
    bumpTo: 0,
    source: questKeypair
  }))

TransactionBuilder.sign()

try {
  let res = await server.submit()
  console.log(`Transaction Successful! Hash: ${res.hash}`)

  /* TODO (4-5): Provided the previous transaction was successful build, sign
   * and submit your second transaction from within the try loop */

  /* TODO (4): Use this line to re-load your account from the server */
  // const bumpedAccount = server.loadAccount(questKeypair.public)
  
  /* TODO (4): Use this line to manually create your account object */
  // const bumpedAccount = Account(accountId, sequence)
  
  /* TODO (4): Complete this transaction with the operation of your choosing */
  const nextTransaction = new Transaction({
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.someOperation())
    .setTimeout(30)
    .build()

  /* TODO (5): sign and submit the second transaction to the testnet */
  nextTransaction.sign()

  let res = await server.submit()
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}: More details:\n${error.response.data}`)
}
