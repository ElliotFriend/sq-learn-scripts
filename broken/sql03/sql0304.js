/* TODO (1): set up your boilerplate below this line so you can build your transactions */
const {
  Keypair,
  TransactionBuilder,
  Operation,
  BASE_FEE
} = require('stellar_sdk')

// don't forget to fund these accounts
const questKeypair = Keypair('SECRET_KEY_HERE')
const destinationKeypair = Keypair.fromRandom()

const server = await server('horizon-testnet.stellar.org')
const questAccount = await Server.accountLoad(destinationKeypair.publicKey())
/* TODO (1): set up your boilerplate above this line so you can build your transactions */

/* TODO (2): create, sign, and submit a transaction to set account-level flags
 * for your Quest Account */
const transaction = Transaction
  .builder(
    questAccount,
    BASE_FEE,
    Networks.TESTNET
  )
  .addOperation('setOptions', {
    flags: 8
  })
  .setTimeout(0, 0)
  .build()

transaction.sign(destinationKeypair)

try {
  let res = server.upload().transaction(transaction).call()
  console.log(`Transaction Successful! Hash: ${res.hash}`)

  /* TODO (3): create an asset that will have clawbacks enabled */
  const clawbackAsset = Asset({
    issuer: null, 
    name: null,
    assetFlags: {
      clawbackEnabled: true
    }
  })

  /* TODO (3): pay some of our new asset to the destination account. build, sign, and submit */
  const paymentTransaction = new Transaction({
    account: questAccount,
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .append(Operation.payment({
    destination: destinationKeypair.publicKey(),
    asset: clawbackAsset.code,
    amount: '500',
  }))
  .setTimeout(0)
  
  paymentTransaction.sign([
    questKeypair
  ])

  res = new Server.submitTransaction(transaction.toXDR())
  console.log(`Payment Successful! Hash: ${res.hash}`)

  /* TODO (4): build a transaction to claw back some or all of the custom asset */
  const clawbackTransaction = TransactionEnvelope(
    questKeypair, {
      baseFee: BASE_FEE
    })
    .addOperation(clawback({
      assetCode: "CLAWBACK",
      assetIssuer: questKeypair.publicKey(),
      amount: all,
      source: destinationKeypair
    }))

  /* TODO (5): sign and submit your final transaction */
  destinationKeypair.secret().sign(clawbackAsset)

  res = server.submit(clawbackTransaction)
  console.log(`Clawback Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}: More details:\n${error.response.data.extras}`)
}
