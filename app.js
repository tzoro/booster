const express = require('express')
const app = express()
const port = 3000
const db = require('./models/index');
const fs = require('fs');
const uuid = require('uuid');
const morgan = require('morgan');

var cookieSession = require('cookie-session')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var bodyParser = require('body-parser')
var rawdata = fs.readFileSync('VehicleInfo.json');
var cars = JSON.parse(rawdata);
var passport = require('passport');
var LocalStrategy = require('passport-local');

app.use(express.static('public'))
app.use(morgan('combined'))
app.use( bodyParser.json() ); 
app.use(cookieParser());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(cookieSession({
  name: 'session',
  keys: ['xyz'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  db.User.findOne({where: { id: id }}).then(function(user) { 
    done(null, user);
  });
});

passport.use(new LocalStrategy(function verify(username, password, cb) {
  db.User.findOne({where: { username: username }}).then(function(user) { 
     if (!user) { return cb(null, false, { message: 'Incorrect username or password.' }); }
     return cb(null, user);
  });
}));

app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('index', { title: 'Booster' })
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login/password',
  passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }), (req, res) => {
  res.cookie('username', req.user.id) 
  res.redirect('/');
})

app.get('/search', (req, res) => {

  let s_query = req.query.term;
  let results = [];

  cars.forEach(function(value){
    if ((value.make + value.model + value.year).toLowerCase().includes(s_query)) {
      results.push({value: value.make + ' ' + value.model + ' ' + value.year, id: 1})
    }
  });

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(results));
})

app.get('/tabledata', (req, res) => {

  let out = {}
  out.data = [];
  
  cars.forEach(function(value){
    out.data.push([value.make, value.model, value.year])
  });

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(out));
})

app.post('/create', (req, res) => {

  res.setHeader('Content-Type', 'application/json');

  if (req.cookies.hasOwnProperty('username') === false){

    res.end(JSON.stringify({status: 'error', msg: 'Please log in'}));

  } else {

    let v_valid  = true;
    let v_exists = false;

    let make = req.body.make;
    let model = req.body.model;
    let year = req.body.year;

    let fields = ['make', 'model', 'year'];
    let err_msg_part = '';

    for (var i = 0; i < fields.length; i++) {
      if ( req.body[fields[i]].length === 0 ) {
        err_msg_part = err_msg_part + ', ' + fields[i];
        v_valid = false;
      }
    }
    let err_required = 'Please enter fields ' + err_msg_part;

    if(v_valid === false) {
      res.end(JSON.stringify({status: 'error', msg: err_required}));
    } else {
      cars.forEach(function(value){
        if ((value.make + value.model + value.year).toLowerCase().includes(make.toLowerCase() + model.toLowerCase() + year.toLowerCase())) {
          v_exists = true;
        }
      });

      if (v_exists) {
        res.end(JSON.stringify({status: 'error', msg: 'Vehicle already exists'}));
      }else{
        let new_record = {
          "_id": {
            "$oid": uuid.v1()
          },
          "make": make.toUpperCase(),
          "model": model.toUpperCase(),
          "year": year.toUpperCase()
        }
        cars.push(new_record);
        let data = JSON.stringify(cars);
        fs.writeFileSync('VehicleInfo.json', data);
        res.end(JSON.stringify({status: 'ok', msg: 'Vehicle created'}));
      }
    }
  }
})

// sync our sequelize models and then start server
// force: true will wipe our database on each server restart
// this is ideal while we change the models around
db.sequelize.sync({ force: false }).then(() => {
  
  // inside our db sync callback, we start the server
  // this is our way of making sure the server is not listening 
  // to requests if we have not made a db connection
  app.listen(port, () => {
    console.log(`App listening on PORT ${port}`);
  });
});