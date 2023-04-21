(async () => {
  // include the StellarSDK
  const StellarSdk = require('stellar-sdk')
  const fetch = require('node-fetch')

  // Generate two Keypairs: a sender, and a destination.
  const senderKeypair = StellarSdk.Keypair.random()
  const destinationKeypair = StellarSdk.Keypair.random()

  // Optional: Log the keypair details if you want to save the information for later.
  console.log(`Sender Public Key: ${senderKeypair.publicKey()}`)
  console.log(`Sender Secret Key: ${senderKeypair.secret()}`)
  console.log(`Destination Public Key: ${destinationKeypair.publicKey()}`)
  console.log(`Destination Secret Key: ${destinationKeypair.secret()}`)

  await Promise.all([senderKeypair, destinationKeypair].map(async (kp) => {
    // Set up the Friendbot URL endpoints.
    const friendbotUrl = `https://friendbot.stellar.org?addr=${kp.publicKey()}`
    const response = await fetch(friendbotUrl)

    // // Optional Looking at the responses from fetch.
    // let json = await response.json()
    // console.log(json)

    // Check that the response is OK, and give a confirmation message.
    if (response.ok) {
      console.log(`Account ${kp.publicKey()} successfully funded.`)
    } else {
      console.log(`Something went wrong funding account: ${kp.publicKey()}`)
    }
  }))

  // Connect to the testnet with the StellarSdk.
  const server = new StellarSdk.Server('https://horizon-testnet.stellar.org')
  const senderAccount = await server.loadAccount(senderKeypair.publicKey())

  // Build the inner transaction. This will be the transaction where the payment is actually made.
  const innerTransaction = new StellarSdk.TransactionBuilder(
    senderAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
    .addOperation(StellarSdk.Operation.payment({
      destination: destinationKeypair.publicKey(),
      asset: StellarSdk.Asset.native(),
      amount: '100',
      source: senderKeypair.publicKey()
    }))
    .setTimeout(30)
    .build()

  // Sign the inner transaction using the sender keypair. But, we will not be directly submitting this inner transaction on its own.
  innerTransaction.sign(senderKeypair)
  console.log('Inner transaction has been signed.')

  // Build the fee-bump transaction.  We will use your Quest Account as the "channel account."
  // It will be this account that pays the transaction fee and the sequence number.
  const questKeypair = StellarSdk.Keypair.fromSecret('SDKPKC6QG4UWNEVQ36GIDTQRJABV26MDMLKSEYHAXIFAKIDQSFH5ZMMS')
  const feeBumpTransaction = new StellarSdk.TransactionBuilder
    .buildFeeBumpTransaction(
      questKeypair,
      StellarSdk.BASE_FEE,
      innerTransaction,
      StellarSdk.Networks.TESTNET
    )

  // Sign the fee-bump transaction using the channel account keypair.
  feeBumpTransaction.sign(questKeypair)
  console.log('Fee-bump transaction has been signed.')

  // Finally, submit the fee-bump transaction to the testnet.
  try {
    const response = await server.submitTransaction(feeBumpTransaction)
    console.log(`Fee-bump transaction was successfully submitted.\nFee-bump transaction hash: ${response.fee_bump_transaction.hash}\nInner transaction hash: ${response.inner_transaction.hash}`)
  } catch (error) {
    console.log(`${error}. More details:\n${JSON.stringify(error.response.data)}`)
  }
})()
