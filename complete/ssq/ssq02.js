(async () => {
  // Include the StellarSDK and some other utilities.
  const StellarSdk = require('stellar-sdk')
  const fetch = require('node-fetch')
  const { NFTStorage, Blob } = require('nft.storage')
  const fs = require('fs')

  // Generate two Keypairs: one for issuing the NFT, and one for receiving it.
  const issuerKeypair = StellarSdk.Keypair.random()
  const receiverKeypair = StellarSdk.Keypair.fromSecret('SASJS6FPUY5QRTAEYQZDZMD2MBWT4TTJP5D2KQ6VXCHNPNBOQGKPBNOG')

  // Optional: Log the keypair details if you want to save the information for later.
  console.log(`Issuer Public Key: ${issuerKeypair.publicKey()}`)
  console.log(`Issuer Secret Key: ${issuerKeypair.secret()}`)
  console.log(`Receiver Public Key: ${receiverKeypair.publicKey()}`)
  console.log(`Receiver Secret Key: ${receiverKeypair.secret()}`)

  // Fund both accounts using Friendbot. We're performing the fetch operation, and ensuring the response comes back "OK".
  await Promise.all([issuerKeypair, receiverKeypair].map(async (kp) => {
    // Set up the Friendbot URL endpoints
    const friendbotUrl = `https://friendbot.stellar.org?addr=${kp.publicKey()}`
    const response = await fetch(friendbotUrl)

    // // Optional: Looking at the responses from fetch
    // let json = await response.json();
    // console.log(json);

    // Check that the response is OK, and give a confirmation message.
    if (response.ok) {
      console.log(`Account ${kp.publicKey()} successfully funded.`)
    } else {
      console.log(`Something went wrong funding account: ${kp.publicKey}.`)
    }
  }))

  // Create the Asset so we can issue it on the network.
  const nftAsset = new StellarSdk.Asset('vvNFT', issuerKeypair.publicKey())

  // Store the Image and metadata using nft.storage
  const NFT_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDk0MWMyREJCNjc5MzVhMzg4Nzc0MzlmMDM1ZjMxM2U4Yzg2N0U0N2EiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1MzMzMTgzNzA0OCwibmFtZSI6InNzcS1uZnQtbWV0YWRhdGEifQ.JuG4SALhWh8d-styGAwJUlXEcRkNE66McAwyeOEyqxc' // Get this from https://nft.storage/manage
  const IMAGE_PATH = '/home/elliot/Dev/sdf/sq-learn/scripts/my-booty.jpg'
  const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

  const imageCID = await client.storeBlob(new Blob([fs.readFileSync(IMAGE_PATH)]))
  console.log(`imageCID: ${imageCID}`)

  const metadata = {
    name: 'Very Valuable NFT',
    description: 'This is the most valuable NFT available on any blockchain. Ever.',
    url: `https://nftstorage.link/ipfs/${imageCID}`,
    issuer: nftAsset.getIssuer(),
    code: nftAsset.getCode()
  }
  const metadataCID = await client.storeBlob(new Blob([JSON.stringify(metadata)]))
  console.log(`metadataCID: ${metadataCID}`)

  // Connect to the testnet with the StellarSdk.
  const server = new StellarSdk.Server('https://horizon-testnet.stellar.org')
  const account = await server.loadAccount(issuerKeypair.publicKey())

  // Build a transaction that mints the NFT.
  const transaction = new StellarSdk.TransactionBuilder(
    account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
    // Add the NFT metadata to the issuer account using a `manageData` operation.
    .addOperation(StellarSdk.Operation.manageData({
      name: 'ipfshash',
      value: metadataCID,
      source: issuerKeypair.publicKey()
    }))
    // Perform a `changeTrust` operation to create a trustline for the receiver account.
    .addOperation(StellarSdk.Operation.changeTrust({
      asset: nftAsset,
      limit: '0.0000001',
      source: receiverKeypair.publicKey()
    }))
    // Add a `payment` operation to send the NFT to the receiving account.
    .addOperation(StellarSdk.Operation.payment({
      destination: receiverKeypair.publicKey(),
      asset: nftAsset,
      amount: '0.0000001',
      source: issuerKeypair.publicKey()
    }))
    // setTimeout is required for a transaction, and it also must be built.
    .setTimeout(30)
    .build()

  // Sign the transaction with the necessary keypairs.
  transaction.sign(issuerKeypair)
  transaction.sign(receiverKeypair)

  try {
    await server.submitTransaction(transaction)
    console.log('The asset has been issued to the receiver')
  } catch (error) {
    console.log(`${error}. More details: \n${error.response.data}`)
  }
})()
