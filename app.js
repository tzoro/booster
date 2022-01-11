const express = require('express')
const app = express()
const port = 3000

// node app.js

const fs = require('fs');

let rawdata = fs.readFileSync('VehicleInfo.json');
let cars = JSON.parse(rawdata);

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('index', { title: 'Hey', message: 'Hello there!' })
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})