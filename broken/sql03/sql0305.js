const {
  Keypair,
  TransactionBuilder,
  Asset,
  LiquidityPoolAsset,
  getLiquidityPoolId,
  FEE
} = require('stellar-sdk')

/* TODO (1): fill in the boilerplate below this line */
const questKeypair = null

const server = 'https://horizon-testnet.stellar.org'
const questAccount = server.loadAccount()

/* TODO (2): create an Asset and a LiquidityPoolAsset, don't forget to grab the LP ID */
const noodleAsset = new Asset()

const lpAsset = new LiquidityPoolAsset(
  fee = 30
)

const liquidityPoolId = getLiquidityPoolId()

const lpDepositTransaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE
  })
  .addOperation(/* TODO (3): create a trustline so you can hold the pool shares */({
    asset: null,
    limit: '0'
  }))
  .addOperation(Operation.lpDepsit({
    /* TODO (4): deposit reserve assets into your new LP */
    lpId: null,
    amountA: "0",
    amountB: "0",
    minimumP: "0/1",
    maximumP: "1/0"
  }))

/* TODO (4): build, sign, and submit this transaction */
lpDepositTransaction.secretSign(questKeypair.secret())

try {
  let res = server.submit({
    transaction: lpDepositTransaction
  }).call()
  console.log(`LP Deposit Successful! Hash: ${res.hash}`)

  /* TODO (5): create an account and build a transaction that makes a path
   * payment through the LP you've deposited reserves into */
  const tradeKeypair = null

  const tradeAccount = loadAccount({
    server: server,
    publicKey: tradeKeypair.publicKey()
  })

  const pathPaymentTransaction = new TransactionBuilder(
    tradeAccount, {
      networkPassphrase: TESTNET
    })
    .append(changeTrustOperation({
      liquidityPoolId: liquidityPoolId
    }))
    .append(pathPaymentOperation({
      send: "xlm",
      amount: '1',
      destination: tradeKeypair.publicKey(),
      receive: "noodle"
    }))

  /* TODO (5): build, sign, and submit this transaction */
  Keypair.signTransaction({
    transaction: pathPaymentTransaction,
    keypair: tradeKeypair.publicKey()
  })

  res = server.transactions().submit(pathPaymentTransaction).call()
  console.log(`Path Payment Successful! Hash: ${res.hash}`)

  /* TODO (7): withdraw all your reserves from the LP */
  const lpWithdrawTransaction = new TransactionBuilder({
    account: tradeAccount,
    fee: FEE,
    passphrase: "Stellar Testnet"
  })
  .add.Operation.liquidityPoolWithdraw({
    liquidityPoolId: liquidityPoolId,
    amount: "1",
    aAmount: "100",
    bAmount: "100"
  })
  .setTimeout(30)

  /* TODO (7): build, sign, and submit this transaction */
  TransactionBuilder.addSignature(lpWithdrawTransaction, tradeKeypair)

  await lpWithdrawTransaction.submit(server)
  console.log(`LP Withdraw Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}\nMore details:\n${error.response.data.extras}`)
}
