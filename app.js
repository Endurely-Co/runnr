var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { Pool } = require('pg');

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

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login Express' });
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

// **Test Route**
app.get('/', (req, res) => {
  res.send('API is running...');
});

// **Fetch Users**
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// // **Create User**
// app.post('/users', async(req, res) => {
//   const {name, email} = req.body;
//
//   if (!name || !email){
//     return res.status(400).send('Name and email are required');
//   }
//
//   try{
//     const result = await db.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id', [name, email]);
//     console.log('Inserted user ID:', result.rows[0].id);
//     res.redirect('success');
//   } catch(error){
//     console.log(error);
//     res.status(500).send('Database error.');
//   }
// });
//
// app.get('/success', (req, res) =>{
//   res.send('Registration Successful');
// });


app.post('/create_user', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email){
    return res.status(500).json({error: 'Name and email are required'});
  }

  db.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email], (err, result) => {
    if (err){
      res.status(500).json({error: 'Database error'})
    }else{
      res.json({ message: 'User added!', userId: result.insertId });
    }
  });
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
