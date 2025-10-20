const { Pool } = require('pg');

const pool = new Pool({
  user: 'modul_user',
  host: 'localhost',
  database: 'modul',
  password: '1048',
  port: 5432,
});

module.exports = pool;