(async () => {
  const {
    Keypair,
    Server,
    TransactionBuilder,
    Networks,
    Operation,
    Claimant,
    Asset,
    BASE_FEE
  } = require('stellar-sdk')
  const { friendbot } = require('./sq-learn-utils')

  // const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
  const questKeypair = Keypair.random()
  const destinationKeypair = Keypair.random()
  const thirdKeypair = Keypair.random()

  // Optional: Log the keypair details if you want to save the information for later.
  console.log(`Quest Public Key: ${questKeypair.publicKey()}`)
  console.log(`Quest Secret Key: ${questKeypair.secret()}`)
  console.log(`Destination Public Key: ${destinationKeypair.publicKey()}`)
  console.log(`Destination Secret Key: ${destinationKeypair.secret()}`)
  console.log(`Third Public Key: ${thirdKeypair.publicKey()}`)
  console.log(`Third Secret Key: ${thirdKeypair.secret()}`)

  // Fund both accounts using friendbot
  await friendbot([
    questKeypair.publicKey(),
    destinationKeypair.publicKey()
  ])

  const clawbackAsset = new Asset(
    'CLAWBACK',
    questKeypair.publicKey()
  )

  const claimant = new Claimant(
    thirdKeypair.publicKey(),
    Claimant.predicateUnconditional()
  )

  const server = new Server('https://horizon-testnet.stellar.org')
  const questAccount = await server.loadAccount(questKeypair.publicKey())

  // set options
  let transaction = new TransactionBuilder(
    questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.setOptions({
      setFlags: 10,
      source: questKeypair.publicKey()
    }))
    .addOperation(Operation.changeTrust({
      asset: clawbackAsset,
      source: destinationKeypair.publicKey()
    }))
    .addOperation(Operation.payment({
      destination: destinationKeypair.publicKey(),
      asset: clawbackAsset,
      amount: '100',
      source: questKeypair.publicKey()
    }))
    .setTimeout(30)
    .build()

  transaction.sign(questKeypair, destinationKeypair)

  try {
    let res = await server.submitTransaction(transaction)
    console.log(`Transaction Successful! Hash: ${res.hash}`)

    transaction = new TransactionBuilder(
      questAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
      .addOperation(Operation.createClaimableBalance({
        asset: clawbackAsset,
        amount: '1',
        claimants: [
          claimant
        ],
        source: destinationKeypair.publicKey()
      }))
      .setTimeout(30)
      .build()

    transaction.sign(questKeypair, destinationKeypair)

    res = await server.submitTransaction(transaction)
    console.log(`Claimable Balance 01 Created! Hash: ${res.hash}`)
    const clawbackCbId = transaction.getClaimableBalanceId(0)
    console.log(`claimableBalanceId: ${clawbackCbId}`)

    transaction = new TransactionBuilder(
      questAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
      .addOperation(Operation.clawback({
        asset: clawbackAsset,
        amount: '1',
        from: destinationKeypair.publicKey(),
        source: questKeypair.publicKey()
      }))
      .addOperation(Operation.setTrustLineFlags({
        trustor: destinationKeypair.publicKey(),
        asset: clawbackAsset,
        flags: {
          clawbackEnabled: false
        },
        source: questKeypair.publicKey()
      }))
      .setTimeout(30)
      .build()

    transaction.sign(questKeypair)

    res = await server.submitTransaction(transaction)
    console.log(`Clawback and setTrustLineFlags Successful! ${res.hash}`)
    
    transaction = new TransactionBuilder(
      questAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
      .addOperation(Operation.createClaimableBalance({
        asset: clawbackAsset,
        amount: '2',
        claimants: [
          claimant
        ],
        source: destinationKeypair.publicKey()
      }))
      .setTimeout(30)
      .build()

    transaction.sign(questKeypair, destinationKeypair)

    res = await server.submitTransaction(transaction)
    console.log(`Claimable Balance 02 Created ${res.hash}`)

    const noClawbackCbId = transaction.getClaimableBalanceId(0)
    console.log(`claimableBalanceId: ${noClawbackCbId}`)

    transaction = new TransactionBuilder(
      questAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
      .addOperation(Operation.clawbackClaimableBalance({
        balanceId: clawbackCbId
      }))
      .setTimeout(30)
      .build()

    transaction.sign(questKeypair)
    res = await server.submitTransaction(transaction)
    console.log(`CB 01 Clawed Back! ${res.hash}`)

//     transaction = new TransactionBuilder(
//       questAccount, {
//         fee: BASE_FEE,
//         networkPassphrase: Networks.TESTNET
//       })
//       .addOperation(Operation.clawbackClaimableBalance({
//         balanceId: noClawbackCbId
//       }))
//       .setTimeout(30)
//       .build()
// 
//     transaction.sign(questKeypair)
// 
//     res = await server.submitTransaction(transaction)
//     console.log(`CB 02 Clawed Back! ${res.hash}`)

    transaction = new TransactionBuilder(
      questAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
      .addOperation(Operation.clawback({
        asset: clawbackAsset,
        amount: '2',
        from: destinationKeypair.publicKey()
      }))
      .setTimeout(30)
      .build()

    transaction.sign(questKeypair)

    res = await server.submitTransaction(transaction)
    console.log(`Clawed Back More! Hash: ${res.hash}`)
  } catch (error) {
    console.log(`${error}. More details:\n${JSON.stringify(error.response.data.extras, null, 2)}`)
  }
})()
