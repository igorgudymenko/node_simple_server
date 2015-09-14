/**
 * Created by Igor Gudymenko on 9/14/2015.
 */

module.exports = {
  db: process.env.MONGODB || 'mongodb://localhost:27017/test',
  sessionSecret: process.env.SESSION_SECRET || 'Your Session Secret goes here'
};