const initialSQLPath = './initial-db.sql'
const destinationDBPath = './efg.db'

var fs = require('fs')
var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(destinationDBPath)

fs.readFile(initialSQLPath, 'utf8', function(err, data) {
  if (err) throw err

  // Break up the file into an array of statements, since SQLite cannot handle
  // multiple statement queries.

  let statements = data.split(';')
  // There will always be an empty final element, if properly terminated SQL statement
  statements.pop()

  db.serialize(function () {
    statements.forEach((statement) => {
      db.run(statement)
    })
  })
  db.close()
})