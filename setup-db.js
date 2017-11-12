const initialSQLPath = './initial-db.sql'
const destinationDBPath = './efg.db'

var fs = require('fs')

let main = () => {
  fs.readFile(initialSQLPath, 'utf8', function(err, data) {
    if (err) throw err

    // Break up the file into an array of statements, since SQLite cannot handle
    // multiple statement queries.

    let statements = data.split(';')
    // There will always be an empty final element, if properly terminated SQL statement
    statements.pop()

    var sqlite3 = require('sqlite3').verbose()
    var db = new sqlite3.Database(destinationDBPath)

    db.serialize(function () {
      statements.forEach((statement) => {
        db.run(statement)
      })
    })
    db.close()
  })
}


if (!module.parent) {
  // ran as `node setup-db.js`
  main()
} else {
  // required from another script
  module.exports = { createDatabase: main }
}