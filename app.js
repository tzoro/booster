const express = require('express')
const app = express()
const port = 3000

// node app.js

const fs = require('fs');
const uuid = require('uuid');

let rawdata = fs.readFileSync('VehicleInfo.json');
let cars = JSON.parse(rawdata);

app.use(express.static('public'))

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('index', { title: 'Booster' })
})

app.get('/search', (req, res) => {

  const s_query = req.query.term;
  let   results = [];

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

  res.setHeader('Content-Type', 'application/json');

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
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})