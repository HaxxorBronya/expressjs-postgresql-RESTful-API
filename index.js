const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const bcrypt = require('bcrypt');
const port = 3000
const Pool = require('pg').Pool
const jwt = require('jsonwebtoken');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'backend',
  password: '123',
  port: 5432,
})

app.use(express.json())

// middleware
const accessValidation = (req, res, next) => {
  const {authorization} = req.headers;
  if(!authorization){
    return res.status(401).json({
      message: "butuh token well"
    })
  }
  const token = authorization.split(' ')[1];
  const secret = 'qwerty1234';
  try {
    const jwtDecode = jwt.verify(token, secret);
    if(typeof jwtDecode !== "string"){
      req.userData = jwtDecode;
    }
  } catch (error) {
    return res.status(401).json({
      message: "butuh token boyy"
    })
  }
  next()
}

app.get('/', (request, response) => {
  response.json({
     info: 'Express, and Postgres API',
     category: 'localhost:3000/categories',
     article: 'localhost:3000/articles',
     users: 'localhost:3000/users',
     register: 'localhost:3000/register',
     login: 'localhost:3000/login',


    })
})
//endpoint users
app.get('/users', accessValidation, (req, res)=> {
    pool.query('SELECT * FROM users', (error, results) => {
        if (error) {
          throw error
        }
        res.status(200).json(results.rows)
    })
})
//endpoint register
app.post('/register', async (req, res)=> {
    const { username,email, password, role } = req.body
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    pool.query('INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *', [username, email, hashedPassword, role], (error, results) => {
        if (error) {
          throw error
        }
        res.status(201).send(`User added with ID: ${results.rows[0].id}`)
      })
})
//endpoint profile
app.post('/login', (req,res)=> {
    const {username, password} = req.body;
    pool.query(`SELECT * FROM users where username = '${username}'`, async (error, results)=>{
      if(error){
        throw error;
      }else{
        const passwordSaved = results.rows[0].password;
        const hashed = await bcrypt.compare(password, passwordSaved);

        if(hashed == true){
          const payload = {
            id: results.rows[0].id,
            username: results.rows[0].username,
            email: results.rows[0].email,
            password: results.rows[0].password,
          };
          const secret = 'qwerty1234';
          const token = jwt.sign(payload, secret, {
            expiresIn: '1h',
          });

          res.json({
            data: {
              id: results.rows[0].id,
              username: results.rows[0].username,
              email: results.rows[0].email,
              password: results.rows[0].password,
            },
            token: token
          })
        }else{
          res.send('password beda');
        }
        
        // console.log(passwordSaved);
        // console.log(hashed);
        // res.json(results.rows[0].password)
      }
    })



})
//categories
app.get('/categories',(req,res)=> {
  const {name} = req.body;
  pool.query(`INSERT INTO category (name) VALUES ('${req.body.name}') RETURNING *`, (error, results) => {
      if (error) {
        throw error
      }
      res.status(201).send(`category added with ID: ${results.rows[0].id}`)
    })
})
//fetch data by ID
app.get('/categories/:id',(req,res) => {
  const id = req.params.id
  console.log(id);
  const get_id = `SELECT * FROM category WHERE id = '${id}'`
  pool.query(get_id,(err,result) => {
    if(err){
      res.send(err)
    }else{
      res.send(result.rows[0])
    }
  })
})
//update category
app.put('/categories/update/:id',(req,res) => {
  const id = req.params.id;
  const name = req.body.name;

  const update_query = "UPDATE category SET name = $1 where id = $2";
  pool.query(update_query,[name,id],(err,result) => {
    if(err){
      res.send(err)
    }else{
      res.send("name updated")
    }
  })
})
//delete category
app.delete('/categories/delete/:id',(req,res) => {
  const id = req.params.id;
  const delete_query = 'DELETE FROM category where id = $1'
  pool.query(delete_query,[id],(err,result) => {
    if(err){
      res.send(err)
    }else{
      res.send(result)
    }
  })
})
//articles
app.get('/articles',(req,res)=> {
  const {title,content} = req.body;
  pool.query(`INSERT INTO articles (title,content) VALUES ('${req.body.title}','${req.body.content}') RETURNING *`, (error, results) => {
      if (error) {
        throw error
      }
      res.status(201).send(`articles added with ID: ${results.rows[0].id}`)
    })
})
//fetch data by ID
app.get('/articles/:id',(req,res) => {
  const id = req.params.id
  console.log(id);
  const get_id = `SELECT * FROM articles WHERE id = '${id}'`
  pool.query(get_id,(err,result) => {
    if(err){
      res.send(err)
    }else{
      res.send(result.rows[0])
    }
  })
})
//update article
app.put('/articles/update/:id',(req,res) => {
  const id = req.params.id;
  const title = req.body.title;
  const content = req.body.content;

  const update_query = "UPDATE articles SET title = $1,content = $2 where id = $3";
  pool.query(update_query,[title,content,id],(err,result) => {
    if(err){
      res.send(err)
    }else{
      res.send("artikel updated")
    }
  })
})
//delete artikel
app.delete('/articles/delete/:id',(req,res) => {
  const id = req.params.id;
  const delete_query = 'DELETE FROM articles where id = $1'
  pool.query(delete_query,[id],(err,result) => {
    if(err){
      res.send(err)
    }else{
      res.send(result)
    }
  })
})


app.listen(3000);