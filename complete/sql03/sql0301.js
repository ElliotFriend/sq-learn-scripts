(async () => {
  const {
    Account,
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
    .addOperation(Operation.bumpSequence({
      bumpTo: (parseInt(questAccount.sequence) + 100).toString()
    }))
    .setTimeout(30)
    .build()

  transaction.sign(questKeypair)

  try {
    let res = await server.submitTransaction(transaction)
    console.log(`Transaction Successful! Hash: ${res.hash}`)

    /* We are adding 99 here (instead of 100) because the `build()` method of
     * the transaction has already incremented the sequence by one. */
    const bumpedAccount = new Account(
      questKeypair.publicKey(),
      (parseInt(questAccount.sequence) + 99).toString()
    )
    const nextTransaction = new TransactionBuilder(
      bumpedAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
      .addOperation(Operation.manageData({
        name: 'sequence',
        value: 'bumped'
      }))
      .setTimeout(30)
      .build()

    nextTransaction.sign(questKeypair)

    res = await server.submitTransaction(nextTransaction)
    console.log(`Transaction Successful! Hash: ${res.hash}`)
  } catch (error) {
    console.log(`${error}\nMore details:\n${error.response.data.extras}`)
  }
})()
