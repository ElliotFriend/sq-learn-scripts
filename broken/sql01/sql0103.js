(async () => {
  const {
    Keypair,
    Server,
    TransactionBuilder,
    Networks,
    Operation,
    Asset,
    BASE_FEE
  } = require('stellar-sdk')
  const { friendbot } = require('../../sq-learn-utils')

  // const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE');
  const questKeypair = Keypair.random()
  const issuerKeypair = Keypair.random()

  // Optional: Log the keypair details if you want to save the information for later.
  console.log(`Quest Public Key: ${questKeypair.publicKey()}`)
  console.log(`Quest Secret Key: ${questKeypair.secret()}`)
  console.log(`Issuer Public Key: ${issuerKeypair.publicKey()}`)
  console.log(`Issuer Secret Key: ${issuerKeypair.secret()}`)

  // Fund both accounts using friendbot
  await friendbot([questKeypair.publicKey(), issuerKeypair.publicKey()])

  const server = new Server('https://horizon-testnet.stellar.org')
  const questAccount = await server.loadAccount(questKeypair.publicKey())
  const santaAsset = new Asset(
    code = 'SANTA',
    issuer = issuerKeypair.publicKey()
  )

  const transaction = new TransactionBuilder(
    questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.changeTrust({
      asset: santaAsset
    }))
    .addOperation(Operation.payment({
      destination: questKeypair.publicKey(),
      asset: santaAsset,
      amount: '10',
      source: issuerKeypair.publicKey()
    }))
    .setTimeout(30)
    .build()

  transaction.sign(
    questKeypair,
    issuerKeypair
  )

  try {
    const res = await server.submitTransaction(transaction)
    console.log(`Transaction Successful! Hash: ${res.hash}`)
  } catch (error) {
    console.log(`${error}: More details:\n${error.response.data}`)
  }
})()
