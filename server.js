require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

const app = require('./src/app');

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log('DB와 연결되었습니다😄');
});

mongoose.connection.on('disconnected', () => {
  console.log('DB와 연결이 끊어졌습니다🥲');
});

mongoose.connection.on('error', () => {
  console.log('⚠️ DB와 연결 과정에서 오류가 발생하였습니다.');
  console.log(process.env.MONGODB_URI);
});

app.listen(7008, () => {
  console.log('PORT 7008과 연결되었습니다😊');
});
