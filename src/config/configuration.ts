// src/config/configuration.ts
export default () => ({
  // 1. 데이터베이스 관련 설정
  // db: {
  //   host: process.env.DATABASE_HOST,
  //   port: parseInt(process.env.DATABASE_PORT, 10),
  // },
  auth: {
    // confirmEmailSecret: process.env.AUTH_CONFIRM_EMAIL_SECRET,
    // confirmEmailExpires: process.env.AUTH_CONFIRM_EMAIL_EXPIRES || '1d',
    jwtTokenSecret: process.env.JWT_ACCESS_SECRET,
    jwtTokenExpires: process.env.JWT_ACCESS_EXPIRES,
    jwtRefreshTokenSecret: process.env.JWT_REFRESH_SECRET,
    jwtRefreshTokenExpires: process.env.JWT_REFRESH_EXPIRES,
  },
});
