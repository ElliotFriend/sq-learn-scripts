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
    const questKeypair = Keypair.random();
    const issuerKeypair = Keypair.random();
    const distributorKeypair = Keypair.random();
    const destinationKeypair = Keypair.random();

    // Optional: Log the keypair details if you want to save the information for later.
    console.log(`Quest Public Key: ${questKeypair.publicKey()}`);
    console.log(`Quest Secret Key: ${questKeypair.secret()}`);
    console.log(`Issuer Public Key: ${issuerKeypair.publicKey()}`);
    console.log(`Issuer Secret Key: ${issuerKeypair.secret()}`);
    console.log(`Distributor Public Key: ${distributorKeypair.publicKey()}`);
    console.log(`Distributor Secret Key: ${distributorKeypair.secret()}`);
    console.log(`Destination Public Key: ${destinationKeypair.publicKey()}`);
    console.log(`Destination Secret Key: ${destinationKeypair.secret()}`);

    // Fund all accounts using friendbot
    await Promise.all([
        questKeypair,
        issuerKeypair,
        distributorKeypair,
        destinationKeypair
    ].map(async (kp) => {
        const friendbotUrl = `https://friendbot.stellar.org?addr=${kp.publicKey()}`;
        let response = await fetch(friendbotUrl)

        // // Optional: Looking at the responses from fetch
        // let json = await response.json();
        // console.log(json);

        // Check that the response is OK, and give a confirmation message.
        if (response.ok) {
            console.log(`Account ${kp.publicKey()} successfully funded.`);
        } else {
            console.log(`Something went wrong funding account: ${kp.publicKey}.`);
        }
    }));

    const server = new Server('https://horizon-testnet.stellar.org');
    const questAccount = await server.loadAccount(questKeypair.publicKey());
    const pathAsset = new Asset(
        code = 'PATH',
        issuer = issuerKeypair.publicKey()
    );

    let transaction = new TransactionBuilder(
        questAccount, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET
        })
        .addOperation(Operation.changeTrust({
            asset: pathAsset,
            source: destinationKeypair.publicKey()
        }))
        .addOperation(Operation.changeTrust({
            asset: pathAsset,
            source: distributorKeypair.publicKey()
        }))
        .addOperation(Operation.payment({
            destination: distributorKeypair.publicKey(),
            asset: pathAsset,
            amount: "1000000",
            source: issuerKeypair.publicKey()
        }))
        .addOperation(Operation.createPassiveSellOffer({
            selling: pathAsset,
            buying: Asset.native(),
            amount: "10000",
            price: "1",
            source: distributorKeypair.publicKey()
        }))
        .addOperation(Operation.createPassiveSellOffer({
            selling: Asset.native(),
            buying: pathAsset,
            amount: "10000",
            price: "1",
            source: distributorKeypair.publicKey()
        }))
        .addOperation(Operation.pathPaymentStrictSend({
            sendAsset: Asset.native(),
            sendAmount: "1000",
            destination: destinationKeypair.publicKey(),
            destAsset: pathAsset,
            destMin: "1000"
        }))
        .addOperation(Operation.pathPaymentStrictReceive({
            sendAsset: pathAsset,
            sendMax: "450",
            destination: questKeypair.publicKey(),
            destAsset: Asset.native(),
            destAmount: "450",
            source: destinationKeypair.publicKey()
        }))
        .setTimeout(30)
        .build()

    transaction.sign(
        questKeypair,
        issuerKeypair,
        destinationKeypair,
        distributorKeypair
    )

    console.log(transaction.toXDR())

    try {
        let res = await server.submitTransaction(transaction)
        console.log(`Transaction Successful! Hash: ${res.hash}`)
    } catch (error) {
        console.log(`${error}: More details:\n${error.response}`)
    }
})();