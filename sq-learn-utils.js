const fetch = require('node-fetch')
const { StrKey } = require('stellar-sdk')

/**
 * Submit a number of addresses to friendbot to be funded on the testnet.
 *
 * @param {string|array} addresses A public address or array of public addresses
 */
const fundUsingFriendbot = async (addresses) => {
  const addressArray = Array.isArray(addresses) ? [...addresses] : [addresses]
  await Promise.all(addressArray.map(async (pubkey) => {
    if (StrKey.isValidEd25519PublicKey(pubkey)) {
      const friendbotUrl = `https://friendbot.stellar.org?addr=${pubkey}`
      await fetch(friendbotUrl)
    }
  }))
}

exports.friendbot = fundUsingFriendbot
