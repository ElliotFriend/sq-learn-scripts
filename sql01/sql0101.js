(async () => {
    const {
        Keypair,
        Server,
        TransactionBuilder,
        Networks,
        Operation,
        BASE_FEE
    } = require('stellar-sdk');
    const fetch = require('node-fetch');

    // Part 1: Create the Quest Account by funding the Quest Keypair with XLM from friendbot

    // const questKeypair = StellarSdk.Keypair.fromSecret('SECRETKEYHERE');
    const questKeypair = Keypair.random()

    // Optional: Log the keypair details if you want to save the information for later.
    console.log(`Quest Public Key: ${questKeypair.publicKey()}`);
    console.log(`Quest Secret Key: ${questKeypair.secret()}`);

    const friendbotUrl = `https://friendbot.stellar.org?addr=${questKeypair.publicKey()}`;
    let response = await fetch(friendbotUrl)

    // // Optional: Look at the responses from fetch.
    // let json = await response.json()
    // console.log(json)

    if (response.ok) {
        console.log(`Quest Account ${questAccount.publicKey()} successfully funded`)
    } else {
        console.log(`Something went wrong funding account: ${kp.publicKey}.`);
    }

    // Part 2: Create a new account using the `createAccount` operation with the Quest Account as the source account

    const server = new Server('https://horizon-testnet.stellar.org')
    const questAccount = await server.loadAccount(questKeypair.publicKey())
    const newKeypair = Keypair.random()

    // Optional: Log the keypair details if you want to save the information for later.
    console.log(`Created Public Key: ${newKeypair.publicKey()}`);
    console.log(`Created Secret Key: ${newKeypair.secret()}`);

    let transaction = new TransactionBuilder(
        questAccount, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET
        })
        .addOperation(Operation.createAccount({
            destination: newKeypair.publicKey(),
            startingBalance: "1000"
        }))
        .setTimeout(30)
        .build()

    transaction.sign(questKeypair)

    try {
        await server.submitTransaction(transaction)
        console.log(`New account ${newKeypair.publicKey()} has successfully been created`)
    } catch (error) {
        console.log(`${error}: More details:\n${error.response.data}`)
    }

})();