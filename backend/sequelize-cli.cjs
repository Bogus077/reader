require('dotenv').config();

const shared = {
  username: process.env.DB_USER     || process.env.POSTGRES_USER     || 'postgres',
  password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.DB_NAME     || process.env.POSTGRES_DB       || 'reader',
  host:     process.env.DB_HOST     || 'postgres',
  port:     Number(process.env.DB_PORT || 5432),
  dialect:  'postgres',
  logging:  false,
};

module.exports = {
  development: shared,
  test:        shared,
  production:  shared,
};
