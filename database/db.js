const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  password: 'Artur-228',
  host: 'localhost',
  port: 5432,
  database: 'traderBot',
})

module.exports = pool
