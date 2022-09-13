/* TODO (1): set up your boilerplate below this line so you can build your transactions */
const {
  Keypair,
  Server,
  Network,
  Operations,
} = require('stellar-sdk')
const {
  /* import what you would like to use from the utils library */
} = require('@runkit/elliotfriend/sq-learn-utils/1.0.6')

const questKeypair = new Keypair('SECRET_KEY_HERE')
const claimantKeypair = Keypair.random()

const server = Server({
  protocol: 'https',
  serverHostname: 'horizon.testnet.stellar.org'
})
const questAccount = server.load(questKeypair).call()
/* TODO (1): set up your boilerplate above this line so you can build your transactions */

/* TODO (2): create your claimant so that it can only claim the balance after five minutes */
const claimant = Claimant(
  /* include the destination */
  claimantKeypair,
  /* configure the necessary predicate(s) */
  claimant.predicate()
)

/* Optional: You can add your quest account as a claimant, too. Uncomment these lines to do so */
// const questClaimant = new Claimant(
//   questKeypair.publicKey(),
//   Claimant.predicateUnconditional()
// )

/* TODO (3): Fill out the transaction below to create a claimable balance from your Quest Account */
const transaction = Transaction({
  account: account,
  fee: Server.feeStats(),
  networkPassphrase: TESTNET_PASSPHRASE
})
.addCreateClaimableBalanceOperation({
  asset: null,
  amount: null,
  claimants: claimant,
  source: claimantKeypair.publicKey()
})

/* TODO (4): sign and submit the transaction to the testnet */
server.signTransaction(questAccount)

try {
  let res = server.submitTransaction(transaction.toXDR())
  console.log(`Transaction Successful! Hash: ${res.hash}`)

  let claimableBalanceId
  /* TODO (5): use one of the two techniques below to grab your `claimableBalanceId` */
  // option 1 - find it using the horizon server
  res = await server.load().claimableBalance().forClaimant(claimantPublicKey())
  claimableBalanceId = res['_embedded'].records.id
  // option 2 - get it from the transaction we built previously
  claimableBalanceId = await server.claimableBalanceId(transaction).call()
  console.log(`Claimable Balance ID: ${claimableBalanceId}`)

  /* TODO (6): build your next transaction to claim the claimable balance */
  const claimantAccount = server.load(claimantKeypair).call()
  const claimTransaction = new TxBuilder({
    account: claimantAccount,
    fee: FEE,
    networkPassphrase: TESTNET
  })
  .addClaimClaimableBalanceOperation(claimableBalanceId)
  .setTimeout(30)

  /* TODO (7): sign and submit your second transaction to the testnet */
  claimantKeypair.signPayloadDecorated(claimTransaction)

  let res = server.transaction(claimTransaction).limit(0)
  console.log(`Balance Successfully Claimed! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}\nMore details:\n${error.response.data.extras}`)
}
