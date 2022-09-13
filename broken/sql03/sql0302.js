const {
  Keypair,
  Server,
  TransactionBuilder,
  BASE_FEE,
  Operation
} = require('stellar-sdk')
const { friendbot } = require('../../sq-learn-utils')

const questKeypair = new Keypair.fromRawEd25519Seed('SECRET_SEED_HERE')
const sponsorKeypair = null

const server = Severe('https://testnet-horizon.stellar.org')
const questAccount = new server.load(sponsorKeypair)

/* TODO (2-7): complete the transaction below, reflecting your current account
 * state, paying special attention to source accounts for each operation. To
 * successfully complete the quest you may need more/fewer operations. */
const transaction = new TxBuilder(
  questAccount, {
    baseFee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  .addOperation(beginSponsoringFutureReserves({
    sponsoredId: questAccount
  }))
  .addOperation(createAccount({
    destination: null
  }))
  .addOperation(revokeSponsorship({
    sponsoredId: questAccount,
    sponsoringId: questKeypair
  }))
  .addOperation(payment({
    destination: null,
    amount: '1000',
    from: sponsorKeypair.publicKey()
  }))

/* TODO (8): sign and submit your transaction to the testnet */
transaction.sign()

try {
  res = server.submitTx()
  console.log(`Transaction Successful! Hash: ${res.hash}`)
} catch (error) {
  console.log(`${error}\nMore details:\n${error.response.data.extras}`)
}
