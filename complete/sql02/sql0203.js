(async () => {
  const {
    Keypair,
    Server,
    TransactionBuilder,
    Networks,
    Operation,
    BASE_FEE
  } = require('stellar-sdk')
  const { friendbot } = require('../../sq-learn-utils')

  // const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE');
  const questKeypair = Keypair.random()

  // Optional: Log the keypair details if you want to save the information for later.
  console.log(`Quest Public Key: ${questKeypair.publicKey()}`)
  console.log(`Quest Secret Key: ${questKeypair.secret()}`)

  await friendbot(questKeypair.publicKey())

  const server = new Server('https://horizon-testnet.stellar.org')
  const questAccount = await server.loadAccount(questKeypair.publicKey())

  const transaction = new TransactionBuilder(
    questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.setOptions({
      homeDomain: 'example.glitch.me'
    }))
    .setTimeout(30)
    .build()

  transaction.sign(questKeypair)

  try {
    const res = await server.submitTransaction(transaction)
    console.log(`Transaction Successful! Hash: ${res.hash}`)
  } catch (error) {
    console.log(`${error}: More details:\n${error.response.data}`)
  }
})()
