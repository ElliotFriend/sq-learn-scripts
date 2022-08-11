(async () => {
    const {
        Keypair,
        Server,
        TransactionBuilder,
        Networks,
        Operation,
        Asset,
        BASE_FEE
    } = require('stellar-sdk');
    const fetch = require('node-fetch');

    // const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE');
    const questKeypair = Keypair.random()
    const destinationKeypair = Keypair.random()

    // Optional: Log the keypair details if you want to save the information for later.
    console.log(`Quest Public Key: ${questKeypair.publicKey()}`);
    console.log(`Quest Secret Key: ${questKeypair.secret()}`);
    console.log(`Destination Public Key: ${destinationKeypair.publicKey()}`);
    console.log(`Destination Secret Key: ${destinationKeypair.secret()}`);

    // Fund both accounts using friendbot
    await Promise.all([questKeypair, destinationKeypair ].map(async (kp) => {
        const friendbotUrl = `https://friendbot.stellar.org?addr=${kp.publicKey()}`;
        let response = await fetch(friendbotUrl)

        // // Optional: Looking at the responses from fetch
        // let json = await response.json();
        // console.log(json);

        // Check that the response is OK, and give a confirmation message.
        if (response.ok) {
            console.log(`Account ${kp.publicKey()} successfully funded.`);
        } else {
            console.log(`Something went wrong funding account:\n\t${questKeypair.publicKey()}.\n\tPerhaps it is already funded? ¯\\_(ツ)_/¯`);
        }
    }));

    const server = new Server('https://horizon-testnet.stellar.org');
    const questAccount = await server.loadAccount(questKeypair.publicKey());

    let transaction = new TransactionBuilder(
        questAccount, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET
        })
        .addOperation(Operation.payment({
            destination: destinationKeypair.publicKey(),
            asset: Asset.native(),
            amount: "100"
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