var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { Pool } = require('pg');

const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch'); // Stores data in a file

// const Redis = require('ioredis');
// const redis = new Redis();

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/users', usersRouter);

const CACHE_USER = 'user'
const loginRoute = '/login'



app.get(loginRoute, (req, res) => {

  const status = req.query.status || null;
  res.render('login', { title: 'Login', status});
});

app.get('/api/check-login', (req, res) => {
  if (localStorage.getItem(CACHE_USER) != null) {
    res.status(200).send({
      redirect_url: '/',
    });
    return;
  }
  res.status(200).send({
    redirect_url: loginRoute,
  });
});

app.get('/api/signout', (req, res) => {
  localStorage.clear();
  res.status(200).send({redirect_url: loginRoute})
});

app.get('/signup', (req, res) => {
  res.render('register', { title: 'Sign Up' });
});

module.exports = app;

const db = new Pool({
  user: 'postgres',  // Change as needed
  host: '127.0.0.1',
  database: 'postgres',
  password: '1234567',
  port: 5432
});


// Connect to Database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ', err.stack);
    return;
  }
  console.log('Connected to database.');
});

app.post('/api/login', async (req, res) => {
  try{

    let { email, name } = req.body;

    await db.query('UPDATE users SET isloggedin = $3 WHERE email = $1 AND name = $2',
        [email.toLowerCase(), name.toLowerCase(), true]);
    const result = await db.query('SELECT * FROM users WHERE email = $1 AND name = $2', [email, name.toLowerCase()]);

    if (result.rows.length > 0) {
      result.rows[0]['redirectUrl'] = '/'
      localStorage.setItem(CACHE_USER, JSON.stringify(result.rows[0]));
      return res.json(result.rows[0]);
    }
    res.status(404).send({ error: "User not found" });
  }catch (error){
    console.log(error)
    res.status(500).send({ error: "Internal Server Error"  });
  }
});


// **Fetch Users**
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/api/create_user', (req, res) => {
  let { name, email } = req.body;
  localStorage.clear()
  name = name.toLowerCase();
  email = email.toLowerCase();
  if (!name || !email){
    return res.status(500).json({error: 'Name and email are required'});
  }

  db.query('INSERT INTO users (name, email, isloggedin) VALUES ($1, $2, $3)', [name, email, false],
      (err, result) => {
    if (err){
      if (err.toString().includes('users_email_key')){
        res.status(500).json({error: 'User already exists'});
        return;
      }
      res.status(500).json({error: 'Database error'});
    }else{
      res.json({ message: 'User added!', userId: result.insertId,  redirectUrl: "/login/?status=success" });
    }
  });
});


// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });
//
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
