(async () => {
  const fetch = require('node-fetch')
  const {
    Keypair,
    Server,
    TransactionBuilder,
    Networks,
    Operation,
    Asset,
    BASE_FEE
  } = require('stellar-sdk')

  // Keys for accounts to issue and trust the new asset
  const issuerKeypair = Keypair.random()
  const trustingKeypair = Keypair.random()

  await Promise.all([trustingKeypair, issuerKeypair].map(async (kp) => {
    const friendbotUrl = `https://friendbot.stellar.org?addr=${kp.publicKey()}`
    await fetch(friendbotUrl)
  }))

  // Create an object to represent the new asset
  const astroDollar = new Asset('AstroDoller', issuerKeypair.publicKey())

  const server = new Server('https://horizon-testnet.stellar.org')
  const account = await server.loadAccount(trustingKeypair.publicKey())

  const transaction = new TransactionBuilder(
    account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
    // The `changeTrust` operation creates (or alters) a trustline
    // The `limit` parameter below is optional
    .addOperation(Operation.changeTrust({
      asset: astroDollar,
      limit: '1000'
    }))
    // setTimeout is required for a transaction
    .setTimeout(30)
    .build()

  transaction.sign(trustingKeypair)

  try {
    const res = await server.submitTransaction(transaction)
    console.log(`Transaction Successful! Hash: ${res.hash}`)
  } catch (error) {
    console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
  }
})()
