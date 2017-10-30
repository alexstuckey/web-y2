const initialSQLPath = './initial-db.sql'
const destinationDBPath = './efg.db'

var fs = require('fs')
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(destinationDBPath)

fs.readFile(initialSQLPath, 'utf8', function(err, data) {
  if (err) throw err
  db.serialize(function () {
    db.run(data)
  })
  db.close()
})