const express = require('express');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const userRoutes = require('./api/routes/userRoutes');
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// 로그 파일 경로 및 스트림 설정
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// 미들웨어 등록
app.use(express.json());

// 로깅 설정
app.use(morgan('combined', { stream: accessLogStream }));

// 라우트 설정
app.use('/', userRoutes);

// 서버 시작
app.listen(process.env.PORT, () => {
  console.log('Server is running on port 3000');
});
