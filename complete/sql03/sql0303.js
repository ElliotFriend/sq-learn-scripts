(async () => {
    const {
        Keypair,
        Server,
        TransactionBuilder,
        Networks,
        Operation,
        Asset,
        Claimant,
        BASE_FEE
    } = require('stellar-sdk');
    const { friendbot } = require('../../sq-learn-utils');

    // const questKeypair = Keypair.fromSecret('SECRET_KEY_HERE');
    const questKeypair = Keypair.random();
    const claimantKeypair = Keypair.random();

    // Optional: Log the keypair details if you want to save the information for later.
    console.log(`Quest Public Key: ${questKeypair.publicKey()}`);
    console.log(`Quest Secret Key: ${questKeypair.secret()}`);
    console.log(`Claimant Public Key: ${claimantKeypair.publicKey()}`);
    console.log(`Claimant Secret Key: ${claimantKeypair.secret()}`);

    // Fund both accounts using friendbot
    await friendbot([questKeypair.publicKey(), claimantKeypair.publicKey()]);

    const server = new Server('https://horizon-testnet.stellar.org');
    const questAccount = await server.loadAccount(questKeypair.publicKey());

    let transaction = new TransactionBuilder(
        questAccount, {
            fee: BASE_FEE,
            networkPassphrase: Networks.TESTNET
        })
        .addOperation(Operation.createClaimableBalance({
            asset: Asset.native(),
            amount: "100",
            claimants: [
                new Claimant(
                    claimantKeypair.publicKey(),
                    Claimant.predicateNot(
                        Claimant.predicateBeforeRelativeTime("300")
                    )
                )
            ]
        }))
        .setTimeout(30)
        .build();

    transaction.sign(questKeypair);

    try {
        let res = await server.submitTransaction(transaction);
        console.log(`Transaction Successful! Hash: ${res.hash}`);
        console.log(transaction.getClaimableBalanceId(0));

        console.log(`Waiting 5 minutes. Please check back ${new Date(new Date().getTime() + 300000)}`);
        const waitFiveMinutes = () => new Promise(resolve => setTimeout(resolve, 300000));
        await waitFiveMinutes();

        const claimantAccount = await server.loadAccount(claimantKeypair.publicKey());
        let claimTransaction = new TransactionBuilder(
            claimantAccount, {
                fee: BASE_FEE,
                networkPassphrase: Networks.TESTNET
            })
            .addOperation(Operation.claimClaimableBalance({
                balanceId: transaction.getClaimableBalanceId(0)
            }))
            .setTimeout(30)
            .build();

        claimTransaction.sign(claimantKeypair);

        res = await server.submitTransaction(claimTransaction);
        console.log(`Balance Successfully Claimed! ${res.hash}`);
    } catch (error) {
        console.log(`${error}: More details:\n${error.response.data}`);
    }

})();