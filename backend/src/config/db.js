const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "kingsbal",
  password: "014/Pt/0148328",
  port: 5432,
});

module.exports = pool;
