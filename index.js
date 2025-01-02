const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const Pool = require('pg').Pool

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'backend',
  password: '123',
  port: 5432,
})

app.use(express.json())

app.get('/', (request, response) => {
  response.json({ info: 'Express, and Postgres API' })
})
//endpoint users
app.get('/users', (req, res)=> {
    pool.query('SELECT * FROM users', (error, results) => {
        if (error) {
          throw error
            }
            res.status(200).json(results.rows)
        })
})
//endpoint register
app.post('/register', (req, res)=> {
    const { username, password, role } = req.body
    pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *', [username, password, role], (error, results) => {
        if (error) {
          throw error
        }
        res.status(201).send(`User added with ID: ${results.rows[0].id}`)
      })
})
//endpoint profile
app.get('/profile',(req,res)=> {
    const query = "SELECT * FROM users"
    pool.query(query,(err,result)=> {
      if(err){
        res.send(err)
      }else{
        res.send(result.rows)
      }
    })

})

app.get('/categories',(req,res)=> {
  const {name} = req.body;
  pool.query(`INSERT INTO category (name) VALUES ('${req.body.name}') RETURNING *`, (error, results) => {
      if (error) {
        throw error
      }
      res.status(201).send(`category added with ID: ${results.rows[0].id}`)
    })
})

app.get('/categories',(req,res)=> {
  const {name} = req.body;
  pool.query(`INSERT INTO category (name) VALUES ('${req.body.name}') RETURNING *`, (error, results) => {
      if (error) {
        throw error
      }
      res.status(201).send(`category added with ID: ${results.rows[0].id}`)
    })
})


app.listen(3000);