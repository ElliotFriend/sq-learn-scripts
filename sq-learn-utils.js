const fetch = require('node-fetch');

/**
 * Submit a number of addresses to friendbot to be funded on the testnet.
 *
 * Takes either a single public address, or an array of public addresses.
 */
const fundUsingFriendbot = async (addresses) => {
    let addressArray = Array.isArray(addresses) ? [...addresses] : [addresses]
    await Promise.all(addressArray.map(async (pubkey) => {
        const friendbotUrl = `https://friendbot.stellar.org?addr=${pubkey}`;
        let response = await fetch(friendbotUrl)
    }));
}

exports.friendbot = fundUsingFriendbot;