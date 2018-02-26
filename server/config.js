module.exports = {
  db: process.env.db || 'mongodb://darshitsoni:darshitsoni@ds111895.mlab.com:11895/crudapp',
  clientSecret: process.env.clientSecret || 'b4a7e4444a9447f7aafdc7a4eb68fd00',
  tokenSecret: process.env.tokenSecret || 'pick a hard to guess string'

};