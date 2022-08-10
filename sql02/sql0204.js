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

    // const questKeypair = StellarSdk.Keypair.fromSecret('SECRETKEYHERE');
    const questKeypair = Keypair.random()
    const secondSigner = Keypair.random()
    const thirdSigner = Keypair.random()

    // Optional: Log the keypair details if you want to save the information for later.
    console.log(`Quest Public Key: ${questKeypair.publicKey()}`);
    console.log(`Quest Secret Key: ${questKeypair.secret()}`);
    console.log(`Second Signer Public Key: ${secondSigner.publicKey()}`);
    console.log(`Second Signer Secret Key: ${secondSigner.secret()}`);
    console.log(`Third Signer Public Key: ${thirdSigner.publicKey()}`);
    console.log(`Third Signer Secret Key: ${thirdSigner.secret()}`);

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
        .addOperation(Operation.setOptions({
            masterWeight: 1,
            lowThreshold: 5,
            medThreshold: 5,
            highThreshold: 5
        }))
        .addOperation(Operation.setOptions({
            signer: {
                ed25519PublicKey: secondSigner.publicKey(),
                weight: 2
            }
        }))
        .addOperation(Operation.setOptions({
            signer: {
                ed25519PublicKey: thirdSigner.publicKey(),
                weight: 2
            }
        }))
        .setTimeout(30)
        .build()

    transaction.sign(questKeypair)

    try {
        let res = await server.submitTransaction(transaction)
        console.log(`Additional Signers Successfully Added! Hash: ${res.hash}`)

        const questAccount = await server.loadAccount(questKeypair.publicKey())
        let multisigTransaction = new TransactionBuilder(
            questAccount, {
                fee: BASE_FEE,
                networkPassphrase: Networks.TESTNET
            })
            .addOperation(Operation.manageData({
                name: "I signed this",
                value: "with three signatures!"
            }))
            .setTimeout(30)
            .build()
        
            multisigTransaction.sign(
                questKeypair,
                secondSigner,
                thirdSigner
            )

        res = await server.submitTransaction(multisigTransaction)
        console.log(`Multisig Transaction Successful! Hash: ${res.hash}`)
    } catch (error) {
        console.log(`${error}: More details:\n${error.response.data}`)
    }
})();