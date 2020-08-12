const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'snYmMGqxoU',
  mongoUri:
    process.env.MONGODB_URI
    || process.env.MONGO_HOST
    || `mongodb://${
      process.env.IP || 'localhost'
    }:${
      process.env.MONGO_PORT || '27017'
    }/expensetracker-bpc`,
};

export default config;
