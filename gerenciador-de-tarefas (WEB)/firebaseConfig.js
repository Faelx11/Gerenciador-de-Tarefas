const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://1:224063002841:web:ce106a15d12b1c881d86c8.firebaseio.com',
});

const db = admin.firestore();
module.exports = db;