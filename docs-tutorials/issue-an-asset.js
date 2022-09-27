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

  // Keys for accounts to issue and distribute the new asset
  const issuerKeypair = Keypair.random()
  const distributorKeypair = Keypair.random()

  await Promise.all([issuerKeypair, distributorKeypair].map(async (kp) => {
    const friendbotUrl = `https://friendbot.stellar.org?addr=${kp.publicKey()}`
    await fetch(friendbotUrl)
  }))

  // Create an object to represent the new asset
  const astroDollar = new Asset('AstroDollar', issuerKeypair.publicKey())

  const server = new Server('https://horizon-testnet.stellar.org')
  const account = await server.loadAccount(distributorKeypair.publicKey())

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
    // The `payment` operation sends the `amount` of the specified
    // `asset` to our distributor account
    .addOperation(Operation.payment({
      destination: distributorKeypair.publicKey(),
      asset: astroDollar,
      amount: '1000',
      source: issuerKeypair.publicKey()
    }))
    // This (optional) `setOptions` operation locks the issuer account
    // so there can never be any more of the asset minted
    .addOperation(Operation.setOptions({
      masterWeight: 0,
      source: issuerKeypair.publicKey()
    }))
    // setTimeout is required for a transaction
    .setTimeout(30)
    .build()

  transaction.sign(distributorKeypair, issuerKeypair)

  try {
    const res = await server.submitTransaction(transaction)
    console.log(`Transaction Successful! Hash: ${res.hash}`)
  } catch (error) {
    console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
  }
})()
