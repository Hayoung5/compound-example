const express = require('express');
const userRoutes = require('./api/routes/userRoutes');
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// 미들웨어 등록
app.use(express.json());

// 라우트 설정
app.use('/', userRoutes);

// 서버 시작
app.listen(process.env.PORT, () => {
  console.log('Server is running on port 3000');
});