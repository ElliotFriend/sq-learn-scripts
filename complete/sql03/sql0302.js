(async () => {
  const {
    Asset,
    Keypair,
    Server,
    TransactionBuilder,
    Networks,
    Operation,
    BASE_FEE
  } = require('stellar-sdk')
  const { friendbot } = require('../../sq-learn-utils')

  const questKeypair = Keypair.fromSecret('SCBHFC5IEBZTL5BDXS45PWW5DGJU6ZIJ2VRCISPMSGFYINA27YDPJ3BL')
  // const questKeypair = Keypair.random()
  const sponsorKeypair = Keypair.random()

  // Optional: Log the keypair details if you want to save the information for later.
  console.log(`Quest Public Key: ${questKeypair.publicKey()}`)
  console.log(`Quest Secret Key: ${questKeypair.secret()}`)
  console.log(`Sponsor Public Key: ${sponsorKeypair.publicKey()}`)
  console.log(`Sponsor Secret Key: ${sponsorKeypair.secret()}`)

  await friendbot(sponsorKeypair.publicKey())

  const server = new Server('https://horizon-testnet.stellar.org')
  const sponsorAccount = await server.loadAccount(sponsorKeypair.publicKey())

//   // PART 1: I didn't fund my account yet
// 
//   const transaction = new TransactionBuilder(
//     sponsorAccount, {
//       fee: BASE_FEE,
//       networkPassphrase: Networks.TESTNET
//     })
//     .addOperation(Operation.beginSponsoringFutureReserves({
//       sponsoredId: questKeypair.publicKey()
//     }))
//     .addOperation(Operation.createAccount({
//       destination: questKeypair.publicKey(),
//       startingBalance: '0'
//     }))
//     .addOperation(Operation.endSponsoringFutureReserves({
//       source: questKeypair.publicKey()
//     }))
//     .setTimeout(30)
//     .build()

  // PART 2: I already funded my account

  const transaction = new TransactionBuilder(
    sponsorAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.beginSponsoringFutureReserves({
      sponsoredId: questKeypair.publicKey()
    }))
    .addOperation(Operation.revokeAccountSponsorship({
      account: questKeypair.publicKey(),
      source: questKeypair.publicKey()
    }))
    .addOperation(Operation.endSponsoringFutureReserves({
      source: questKeypair.publicKey()
    }))
    .addOperation(Operation.payment({
      destination: 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR',
      asset: Asset.native(),
      amount: '10000',
      source: questKeypair.publicKey()
    }))
    .setTimeout(30)
    .build()

  transaction.sign(
    sponsorKeypair,
    questKeypair
  )

  try {
    const res = await server.submitTransaction(transaction)
    console.log(`Transaction Successful! Hash: ${res.hash}`)
  } catch (error) {
    console.log(`${error}\nMore details:\n${error.response.data.extras}`)
  }
})()
