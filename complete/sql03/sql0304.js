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
    const { friendbot } = require('../../sq-learn-utils');

    // const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE');
    const questKeypair = Keypair.random();
    const destinationKeypair = Keypair.random();

    // Optional: Log the keypair details if you want to save the information for later.
    console.log(`Quest Public Key: ${questKeypair.publicKey()}`);
    console.log(`Quest Secret Key: ${questKeypair.secret()}`);
    console.log(`Destination Public Key: ${destinationKeypair.publicKey()}`);
    console.log(`Destination Secret Key: ${destinationKeypair.secret()}`);

    // Fund both accounts using friendbot
    await friendbot([questKeypair.publicKey(), destinationKeypair.publicKey()]);

    const clawbackAsset = new Asset(
        code = 'CLAWBACK',
        issuer = questKeypair.publicKey()
    );

    const server = new Server('https://horizon-testnet.stellar.org');
    const questAccount = await server.loadAccount(questKeypair.publicKey());

    // issue the assset
    let transaction = new TransactionBuilder(
        questAccount, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET
        })
        .addOperation(Operation.setOptions({
            setFlags: 10,
            source: questKeypair.publicKey()
        }))
        .addOperation(Operation.changeTrust({
            asset: clawbackAsset,
            source: destinationKeypair.publicKey()
        }))
        .addOperation(Operation.payment({
            destination: destinationKeypair.publicKey(),
            asset: clawbackAsset,
            amount: "500",
            source: questKeypair.publicKey()
        }))
        .setTimeout(30)
        .build();

    transaction.sign(
        questKeypair,
        destinationKeypair
    );

    try {
        let res = await server.submitTransaction(transaction);
        console.log(`Transaction Successful! Hash: ${res.hash}`);

        const questAccount = await server.loadAccount(questKeypair.publicKey());
        let clawbackTransaction = new TransactionBuilder(
            questAccount, {
                fee: BASE_FEE,
                networkPassphrase: Networks.TESTNET
            })
            .addOperation(Operation.clawback({
                asset: clawbackAsset,
                amount: "250",
                from: destinationKeypair.publicKey()
            }))
            .setTimeout(30)
            .build();

        clawbackTransaction.sign(questKeypair);

        res = await server.submitTransaction(clawbackTransaction);
        console.log(`Clawback Successful! Hash: ${res.hash}`);

    } catch (error) {
        console.log(`${error}: More details:\n${error.response.data}`);
    }

})();