(async () => {
  // Include the StellarSDK.
  const StellarSdk = require('stellar-sdk')
  const fetch = require('node-fetch')

  // Create two Keypairs: your Quest Account and the Family Account (which will
  // be receiving the payments).
  const questKeypair = StellarSdk.Keypair.random()
  const familyKeypair = StellarSdk.Keypair.random()
  // const questKeypair = StellarSdk.Keypair.fromSecret('SECRET_KEY_FOR_YOUR_QUEST_ACCOUNT');

  // Optional: Log the keypair details if you want to save the information for later.
  console.log(`Quest Public Key: ${questKeypair.publicKey()}`)
  console.log(`Quest Secret Key: ${questKeypair.secret()}`)
  console.log(`Family Public Key: ${familyKeypair.publicKey()}`)
  console.log(`Family Secret Key: ${familyKeypair.secret()}`)

  // Fund both accounts using Friendbot. We're performing the fetch operation, and ensuring the response comes back "OK".
  await Promise.all([questKeypair, familyKeypair].map(async (kp) => {
    // Set up the Friendbot URL endpoints
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
  const questAccount = await server.loadAccount(questKeypair.publicKey())

  // Begin building the transaction. We will add the payment operations in a bit
  let transaction = new StellarSdk.TransactionBuilder(
    questAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })

  // Different muxed accounts can all operate on an underlying account's sequence
  // number. So, we need to load the `familyAccount` from the server before we can
  // create our muxed accounts from it
  const familyAccount = await server.loadAccount(familyKeypair.publicKey())

  // We'll create 4 different Muxed Accounts from 4 different IDs. The numbers
  // used here are examples, and you will need to use the muxed account IDs
  // specified alongside your quest keypair
  // Note: We are using `string`s here, as the SDK requires that
  const familyMuxedAccounts = ['1', '22', '333', '4444'].map((id) =>
    new StellarSdk.MuxedAccount(familyAccount, id)
  )

  // We will add an operation for each of the 4 muxed accounts
  familyMuxedAccounts.forEach((familyMember) => {
    // // Optional: log the muxed account details
    // console.log(`${familyMember.id().padStart(4, " ")}: ${familyMember.accountId()}`)

    transaction = transaction
      .addOperation(StellarSdk.Operation.payment({
        destination: familyMember.accountId(),
        asset: StellarSdk.Asset.native(),
        // We are using the muxed account ID here as the `amount`, because it's
        // a simple way to ensure unique amounts for each of the payments.
        amount: familyMember.id(),
        source: questKeypair.publicKey()
      }))
  })

  // `setTimeout` is required for a transaction, and it also must be built.
  transaction = transaction
    .setTimeout(30)
    .build()

  // Our example transaction only requires the signature of the quest keypair.
  transaction.sign(questKeypair)

  // Submit the transaction to the testnet network.
  try {
    const res = await server.submitTransaction(transaction)
    console.log(`Transaction Successful! Hash: ${res.hash}`)
  } catch (error) {
    console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
  }
})()
