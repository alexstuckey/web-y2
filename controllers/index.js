const express = require('express')
const app = express()

app.get('/events', function (req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify({ a: 1 }))
})

app.get('/venues', function (req, res) {
  res.send('Hello World! venues')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})