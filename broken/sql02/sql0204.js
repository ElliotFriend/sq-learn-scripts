/* TODO (1): get your boilerplate ready, make sure you questKeypair is funded */
const {
  /* grab everything you need from the sdk */
} = require('stellar-sdk')

/* Tip: if you are building and submitting the two transactions necessary for
 * this quest seperately, you'll want to log the public/secret keys for these
 * signers so you can use them to sign a transaction when you need to. */
const questKeypair = Keypair
const secondSigner = Keypair
const thirdSigner = Keypair

/* TODO (1): prepare your server and load an account from it */
const server = Server('horizon-testnet.stellar.org')
const account = await server.loadAccount(/* which account do you need to load? */)

const transaction = new TransactionBuilder(
  account, {
    fee: null,
    networkPassphrase: null
  })
  .addOperation(
    /* TODO (2): configure your thresholds and weights with a `setOptions` operation */
  )
  .addOperation(
    /* TODO (3): add another `ed25519PublicKey` signer with a weight of 2 */
  )
  .addOperation(
    /* TODO (3): add one more `ed25519PublicKey` signer with the necessary weight */
  )
  .build()

/* TODO (4): sign and submit your transaction to the testnet */
transaction(account)

try {
  let res = await server
  console.log(`Additional Signers Successfully Added! Hash: ${res.hash}`)

  /* Tip: If you want to immediately submit this second transaction, right here
   * would be an excellent place to build, sign, and submit that transaction */
} catch (error) {
  console.log(`${error}: More details:\n${error.response.data}`)
}
