(async () => {
  const {
    Keypair,
    Server,
    TransactionBuilder,
    Networks,
    Operation,
    Asset,
    Claimant,
    BASE_FEE
  } = require('stellar-sdk')
  const {
    friendbot,
    waitSomeMinutes
  } = require('../../sq-learn-utils')

  // const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE');
  const questKeypair = Keypair.random()
  const claimantKeypair = Keypair.random()

  // Optional: Log the keypair details if you want to save the information for later.
  console.log(`Quest Public Key: ${questKeypair.publicKey()}`)
  console.log(`Quest Secret Key: ${questKeypair.secret()}`)
  console.log(`Claimant Public Key: ${claimantKeypair.publicKey()}`)
  console.log(`Claimant Secret Key: ${claimantKeypair.secret()}`)

  // Fund both accounts using friendbot
  await friendbot([questKeypair.publicKey(), claimantKeypair.publicKey()])

  const server = new Server('https://horizon-testnet.stellar.org')
  const questAccount = await server.loadAccount(questKeypair.publicKey())

  const claimant = new Claimant(
    claimantKeypair.publicKey(),
    Claimant.predicateNot(
      Claimant.predicateBeforeRelativeTime('300')
    )
  )

  const questClaimant = new Claimant(
    questKeypair.publicKey(),
    Claimant.predicateUnconditional()
  )

  const transaction = new TransactionBuilder(
    questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.createClaimableBalance({
      asset: Asset.native(),
      amount: '100',
      claimants: [
        claimant,
        questClaimant
      ]
    }))
    .setTimeout(30)
    .build()

  transaction.sign(questKeypair)

  try {
    let res = await server.submitTransaction(transaction)
    console.log(`Transaction Successful! Hash: ${res.hash}`)
    console.log(`Claimable Balance ID: ${transaction.getClaimableBalanceId(0)}`)

    res = await server.claimableBalances().claimant(claimantKeypair.publicKey()).call()
    console.log(res.records[0].id)

    await waitSomeMinutes(5)

    const claimantAccount = await server.loadAccount(claimantKeypair.publicKey())
    const claimTransaction = new TransactionBuilder(
      claimantAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
      .addOperation(Operation.claimClaimableBalance({
        balanceId: transaction.getClaimableBalanceId(0)
      }))
      .setTimeout(30)
      .build()

    claimTransaction.sign(claimantKeypair)

    res = await server.submitTransaction(claimTransaction)
    console.log(`Balance Successfully Claimed! Hash: ${res.hash}`)
  } catch (error) {
    console.log(`${error}\nMore details:\n${error.response.data.extras}`)
  }
})()
