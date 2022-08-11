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

    // const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE');
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
        console.log(`Quest Account ${questKeypair.publicKey()} successfully funded`)
    } else {
        console.log(`Something went wrong funding account: ${kp.publicKey}.`);
    }

    const server = new Server('https://horizon-testnet.stellar.org')
    const questAccount = await server.loadAccount(questKeypair.publicKey())

    let transaction = new TransactionBuilder(
        questAccount, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET
        })
        .addOperation(Operation.manageData({
            name: "Hello",
            value: "Stellar Quest!"
        }))
        .setTimeout(30)
        .build()

    transaction.sign(questKeypair)

    try {
        let res = await server.submitTransaction(transaction)
        console.log(`Transaction Successful! Hash: ${res.hash}`)
    } catch (error) {
        console.log(`${error}: More details:\n${error.response.data}`)
    }
})();