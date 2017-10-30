const express = require('express')
const app = express()




var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database('./abc.db')

db.serialize(function () {

  db.each('SELECT Events.* FROM  Events, Venues WHERE Venues.id=2 and Events.venueId=Venues.id;', function (err, row) {
    console.log(row.id + ': ' + JSON.stringify(row))
  })

})

db.close()




app.get('/events', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify({ a: 1 }))
})

app.get('/venues', function (req, res) {
  res.send('Hello World! venues')
})

app.post('/events', function (req, res) {
  res.send('a POST to events')
})

app.post('/venues', function (req, res) {
  res.send('a POST to venues')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})