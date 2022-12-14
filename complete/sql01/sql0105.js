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
  const distributorKeypair = Keypair.random()
  const destinationKeypair = Keypair.random()

  // Optional: Log the keypair details if you want to save the information for later.
  console.log(`Quest Public Key: ${questKeypair.publicKey()}`)
  console.log(`Quest Secret Key: ${questKeypair.secret()}`)
  console.log(`Issuer Public Key: ${issuerKeypair.publicKey()}`)
  console.log(`Issuer Secret Key: ${issuerKeypair.secret()}`)
  console.log(`Distributor Public Key: ${distributorKeypair.publicKey()}`)
  console.log(`Distributor Secret Key: ${distributorKeypair.secret()}`)
  console.log(`Destination Public Key: ${destinationKeypair.publicKey()}`)
  console.log(`Destination Secret Key: ${destinationKeypair.secret()}`)

  // Fund all accounts using friendbot
  await friendbot([
    questKeypair.publicKey(),
    issuerKeypair.publicKey(),
    distributorKeypair.publicKey(),
    destinationKeypair.publicKey()
  ])

  const server = new Server('https://horizon-testnet.stellar.org')
  const questAccount = await server.loadAccount(questKeypair.publicKey())
  const pathAsset = new Asset(
    code = 'PATH',
    issuer = issuerKeypair.publicKey()
  )

  const transaction = new TransactionBuilder(
    questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.changeTrust({
      asset: pathAsset,
      source: destinationKeypair.publicKey()
    }))
    .addOperation(Operation.changeTrust({
      asset: pathAsset,
      source: distributorKeypair.publicKey()
    }))
    .addOperation(Operation.payment({
      destination: distributorKeypair.publicKey(),
      asset: pathAsset,
      amount: '1000000',
      source: issuerKeypair.publicKey()
    }))
    .addOperation(Operation.createPassiveSellOffer({
      selling: pathAsset,
      buying: Asset.native(),
      amount: '2000',
      price: '1',
      source: distributorKeypair.publicKey()
    }))
    .addOperation(Operation.createPassiveSellOffer({
      selling: Asset.native(),
      buying: pathAsset,
      amount: '2000',
      price: '1',
      source: distributorKeypair.publicKey()
    }))
    .addOperation(Operation.pathPaymentStrictSend({
      sendAsset: Asset.native(),
      sendAmount: '1000',
      destination: destinationKeypair.publicKey(),
      destAsset: pathAsset,
      destMin: '1000'
    }))
    .addOperation(Operation.pathPaymentStrictReceive({
      sendAsset: pathAsset,
      sendMax: '450',
      destination: questKeypair.publicKey(),
      destAsset: Asset.native(),
      destAmount: '450',
      source: destinationKeypair.publicKey()
    }))
    .setTimeout(30)
    .build()

  transaction.sign(
    questKeypair,
    issuerKeypair,
    destinationKeypair,
    distributorKeypair
  )

  try {
    const res = await server.submitTransaction(transaction)
    console.log(`Transaction Successful! Hash: ${res.hash}`)
  } catch (error) {
    console.log(`${error}: More details:\n${error.response.data}`)
  }
})()
