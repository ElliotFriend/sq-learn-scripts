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

  const server = new Server('https://horizon-testnet.stellar.org')
  const questAccount = await server.loadAccount(questKeypair.publicKey())

  const transaction = new TransactionBuilder(
    questAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET
    })
    .addOperation(Operation.changeTrust({
      asset: lpAsset
    }))
    .addOperation(Operation.liquidityPoolDeposit({
      liquidityPoolId: lpId,
      maxAmountA: '1000',
      maxAmountB: '2000',
      minPrice: {
        n: 1,
        d: 2
      },
      maxPrice: {
        n: 1,
        d: 2
      }
    }))
    .addOperation(Operation.changeTrust({
      asset: noodleAsset,
      source: tradeKeypair.publicKey()
    }))
    // .addOperation(Operation.pathPaymentStrictReceive({
    //   sendAsset: Asset.native(),
    //   sendMax: '7000',
    //   destination: tradeKeypair.publicKey(),
    //   destAsset: noodleAsset,
    //   destAmount: '1000',
    //   source: tradeKeypair.publicKey()
    // }))
    .addOperation(Operation.pathPaymentStrictSend({
      sendAsset: Asset.native(),
      sendAmount: '50',
      destination: tradeKeypair.publicKey(),
      destAsset: noodleAsset,
      destMin: '0.1',
      source: tradeKeypair.publicKey()
    }))
    // .addOperation(Operation.liquidityPoolWithdraw({
    //   liquidityPoolId: lpId,
    //   amount: '100',
    //   minAmountA: '0',
    //   minAmountB: '0'
    // }))
    .setTimeout(30)
    .build()

  transaction.sign(
    questKeypair,
    tradeKeypair
  )

  try {
    const res = await server.submitTransaction(transaction)
    console.log(`Transaction Successful! Hash: ${res.hash}`)
  } catch (error) {
    console.log(`${error}: More details:\n${error.response.data}`)
  }
})()

// fee stuff
//
// i need to buy 1 NOODLE, and pay the LP 0.3% in fees (0.3% in NOODLE)
// so i have to calculate (before/after) what the xlm value of 0.003 noodle is
// and send it along with the payment?
// no, it's .3% of XLM I'm giving, since the amm is charging the fee
// on the unit **it** is buying?
