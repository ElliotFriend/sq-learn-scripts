(async () => {
  const {
    Keypair,
    Server,
    TransactionBuilder,
    Networks,
    Operation,
    Asset,
    LiquidityPoolAsset,
    getLiquidityPoolId,
    BASE_FEE
  } = require('stellar-sdk')
  const { friendbot } = require('../../sq-learn-utils')

  // const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE')
  const questKeypair = Keypair.random()
  const tradeKeypair = Keypair.random()

  // Optional: Log the keypair details if you want to save the information for later.
  console.log(`Quest Public Key: ${questKeypair.publicKey()}`)
  console.log(`Quest Secret Key: ${questKeypair.secret()}`)
  console.log(`Trade Public Key: ${tradeKeypair.publicKey()}`)
  console.log(`Trade Secret Key: ${tradeKeypair.secret()}`)

  await friendbot([questKeypair.publicKey(), tradeKeypair.publicKey()])

  const server = new Server('https://horizon-testnet.stellar.org')
  const questAccount = await server.loadAccount(questKeypair.publicKey())

  const noodleAsset = new Asset(
    code = 'NOODLE',
    issuer = questKeypair.publicKey()
  )

  const lpAsset = new LiquidityPoolAsset(
    assetA = Asset.native(),
    assetB = noodleAsset,
    fee = 30
  )
  const lpId = getLiquidityPoolId('constant_product', lpAsset).toString('hex')

  const lpDepositTransaction = new TransactionBuilder(
    questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.changeTrust({
      asset: lpAsset
    }))
    .addOperation(Operation.liquidityPoolDeposit({
      liquidityPoolId: lpId,
      maxAmountA: '100',
      maxAmountB: '100',
      minPrice: {
        n: 1,
        d: 1
      },
      maxPrice: {
        n: 1,
        d: 1
      }
    }))
    .setTimeout(30)
    .build()

  lpDepositTransaction.sign(questKeypair)

  try {
    let res = await server.submitTransaction(lpDepositTransaction)
    console.log(`LP Deposit Successful! Hash: ${res.hash}`)

    const tradeAccount = await server.loadAccount(tradeKeypair.publicKey())

    const pathPaymentTransaction = new TransactionBuilder(
      tradeAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
      .addOperation(Operation.changeTrust({
        asset: noodleAsset,
        source: tradeKeypair.publicKey()
      }))
      .addOperation(Operation.pathPaymentStrictReceive({
        sendAsset: Asset.native(),
        sendMax: '10',
        destination: tradeKeypair.publicKey(),
        destAsset: noodleAsset,
        destAmount: '1',
        source: tradeKeypair.publicKey()
      }))
      .setTimeout(30)
      .build()

    pathPaymentTransaction.sign(tradeKeypair)

    res = await server.submitTransaction(pathPaymentTransaction)
    console.log(`Path Payment Successful! Hash: ${res.hash}`)

    const lpWithdrawTransaction = new TransactionBuilder(
      questAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET
      })
      .addOperation(Operation.liquidityPoolWithdraw({
        liquidityPoolId: lpId,
        amount: '100',
        minAmountA: '0',
        minAmountB: '0'
      }))
      .setTimeout(30)
      .build()

    lpWithdrawTransaction.sign(questKeypair)

    res = await server.submitTransaction(lpWithdrawTransaction)
    console.log(`LP Withdraw Successful! Hash: ${res.hash}`)
  } catch (error) {
    console.log(`${error}\nMore details:\n${error.response.data.extras}`)
  }
})()
