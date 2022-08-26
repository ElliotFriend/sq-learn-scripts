const {
  /* TODO (1): import anything you'll need from the stellar-sdk */
} = require('stellar-sdk')

/* TODO (2): setup your quest keypair, fund it using any method you like */
const questKeypair = null

/* TODO (2):  set up your server connection and load up your quest account */
const server = null
const questAccount = null

/* TODO (3): set the asset you will be using to counter your XLM offer */
const offerAsset = null

const transaction = new TransactionBuilder(
  questAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET
  })
  /* TODO (4-7): add your operations to this transaction. While you could submit
   * as many different buy/sell/passive-sell offers as you want in one transaction,
   * for this quest, you are only required to submit at least one.  */

/* TODO (8): sign and submit your transaction to the network */