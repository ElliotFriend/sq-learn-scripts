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

/**
 * Wait a given number of minutes, and then move on.
 *
 * @param {number} minutes The number of minutes to wait before proceeding.
 */
const waitSomeMinutes = async (minutes) => {
  const milliseconds = minutes * 60000
  console.log(`Waiting ${minutes} minutes. Please check back ${new Date(new Date().getTime() + milliseconds)}`)
  await new Promise(resolve => setTimeout(resolve, milliseconds))
}

exports.friendbot = fundUsingFriendbot
exports.waitSomeMinutes = waitSomeMinutes
