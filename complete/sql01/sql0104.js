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
  const offerAsset = new Asset(
    code = 'OFFER',
    issuer = issuerKeypair.publicKey()
  )

  const transaction = new TransactionBuilder(
    questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.changeTrust({
      asset: offerAsset
    }))
    .addOperation(Operation.payment({
      destination: questKeypair.publicKey(),
      asset: offerAsset,
      amount: '10000',
      source: issuerKeypair.publicKey()
    }))
    .addOperation(Operation.manageBuyOffer({
      selling: offerAsset,
      buying: Asset.native(),
      buyAmount: '100',
      price: '0.1'
    }))
    .addOperation(Operation.manageSellOffer({
      selling: offerAsset,
      buying: Asset.native(),
      amount: '1000',
      price: '10'
    }))
    .addOperation(Operation.createPassiveSellOffer({
      selling: offerAsset,
      buying: Asset.native(),
      amount: '1',
      price: '10'
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
