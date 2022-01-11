const express = require('express')
const app = express()
const port = 3000

// node app.js

const fs = require('fs');

let rawdata = fs.readFileSync('vdata.json');
let cars = JSON.parse(rawdata);

cars.forEach(function(value){
  console.log(value);
});

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

  console.log(results)
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(results));
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})