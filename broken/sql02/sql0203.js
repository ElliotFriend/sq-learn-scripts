/* BEGIN RUNKIT ENDPOINT */
exports.endpoint = function (request, response) {
  const tomlData = `VERSION = "0.1.0"
NETWORK_PASSPHRASE = "Test SDF Network ; September 2015"
ACCOUNTS = [ 
  "REPLACE_WITH_YOUR_QUEST_ACCOUNT_PUBLIC_KEY" 
]`
  response.writeHead(200, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'text/plain'
  })
  response.end(tomlData)
}
/* END RUNKIT ENDPOINT */



/* BEGIN STELLAR TRANSACTION */
const {
  TransactionBuilder,
  Networks,
  Operation,
} = require('stellar-sdk')

/* TODO (3): setup your keypair, server, and load your account */
const questKeypair = Keypair.random()
const server = new Server()
const questAccount = await server.loadAccount(questKeypair)

/* TODO (4): */
const transaction = new TransactionBuilder(
  questAccount, {
    networkPassphrase: Networks.TESTNET
  })
  /* add your operation here */
  .setTimeout(30)

/* TODO (5): sign and submit your transaction to the testnet */
transaction.sign()
const res = server.submit()
/* END STELLAR TRANSACTION */