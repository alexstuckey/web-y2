const express = require('express')
const app = express()
const config = require('../config.js');

var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(config.databasePath)



app.get('/events', function (req, res) {
  res.setHeader('Content-Type', 'application/json')

  db.all('SELECT * FROM Events', (err, rows) => {
    res.send(JSON.stringify(rows))
  })

  // db.close()
  
})

app.get('/venues', function (req, res) {
  res.setHeader('Content-Type', 'application/json')

  let response = { 'venues': {} }

  db.each('SELECT * FROM Venues', (err, row) => {
    rowIDString = "v_" + row.id
    delete row.id
    response['venues'][rowIDString] = row
  }, () => {
    // Query completes:
    res.send(JSON.stringify(response))
  })

})

app.post('/events', function (req, res) {
  res.send('a POST to events')
})

app.post('/venues', function (req, res) {
  res.send('a POST to venues')
})

let server = app.listen(config.expressPort, function () {
  console.log('Example app listening on port 3000!')
  // server.close(() => {
  //   console.log('Doh :(')
  // })
})