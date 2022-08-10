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
    const sponsorKeypair = Keypair.random()

    // Optional: Log the keypair details if you want to save the information for later.
    console.log(`Quest Public Key: ${questKeypair.publicKey()}`);
    console.log(`Quest Secret Key: ${questKeypair.secret()}`);
    console.log(`Sponsor Public Key: ${sponsorKeypair.publicKey()}`);
    console.log(`Sponsor Secret Key: ${sponsorKeypair.secret()}`);

    const friendbotUrl = `https://friendbot.stellar.org?addr=${sponsorKeypair.publicKey()}`;
    let response = await fetch(friendbotUrl)

    // // Optional: Looking at the responses from fetch
    // let json = await response.json();
    // console.log(json);

    // Check that the response is OK, and give a confirmation message.
    if (response.ok) {
        console.log(`Account ${sponsorKeypair.publicKey()} successfully funded.`);
    } else {
        console.log(`Something went wrong funding account: ${sponsorKeypair.publicKey}.`);
    }

    const server = new Server('https://horizon-testnet.stellar.org');
    const sponsorAccount = await server.loadAccount(sponsorKeypair.publicKey());

    let transaction = new TransactionBuilder(
        sponsorAccount, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET
        })
        .addOperation(Operation.beginSponsoringFutureReserves({
            sponsoredId: questKeypair.publicKey()
        }))
        .addOperation(Operation.createAccount({
            destination: questKeypair.publicKey(),
            startingBalance: "0"
        }))
        .addOperation(Operation.endSponsoringFutureReserves({
            source: questKeypair.publicKey()
        }))
        .setTimeout(30)
        .build()

    transaction.sign(
        sponsorKeypair,
        questKeypair
    )

    try {
        let res = await server.submitTransaction(transaction)
        console.log(`Transaction Successful! Hash: ${res.hash}`)
    } catch (error) {
        console.log(`${error}: More details:\n${error.response.data}`)
    }

})();