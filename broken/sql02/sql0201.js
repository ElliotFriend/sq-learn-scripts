const {
  Keypair,
  TransactionBuilder,
  Operation,
} = require('stellar-sdk')

/* TODO (2): create your two keypairs and make sure they are both funded */
const questKeypair = Keypair.fromSecret()
const destinationKeypair = Keypair.fromSecret()

/* TODO (3): create a server and load your account from it */
const server = new Server('SERVER_URL_HERE')
const questAccount = await server

/* TODO (4): complete your transaction below */
const transaction = new TransactionBuilder(
  /* fill in the transaction basics here */
  )
  .addOperation(Operation.accountMerge(
    /* complete the `accountMerge` operation */
  ))

/* TODO (5): sign your transaction here and submit it to the testnet */
transaction.sign()
const res = await server