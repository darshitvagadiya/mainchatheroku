module.exports = {
  db: process.env.db || 'mongodb://localhost/mainChat',
  clientSecret: process.env.clientSecret || 'ab7c313db4c74a91be73a782cacdda78',
  tokenSecret: process.env.tokenSecret || 'pick a hard to guess string'

};