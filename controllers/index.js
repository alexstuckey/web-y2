const express = require('express')
const app = express()
const config = require('../config.js');

var sqlite3 = require('sqlite3').verbose()
var db = new sqlite3.Database(config.databasePath)



app.get(config.baseURLPath + '/events/search', function (req, res) {
  res.setHeader('Content-Type', 'application/json')

  let queryString = 'SELECT Events.*, Venues.* FROM Events, Venues WHERE Events.eventVenueID=Venues.venueID;'
  let queryFilter = (event) => { return true }
  let sendError = false

  console.log('GET BASE/events/search', req.query)
  if (req.query.search && req.query.fromDate && req.query.toDate) {
    console.log('  queried Search & Date')
  } else if (req.query.search) {
    console.log('  queried Search')
  } else if (req.query.fromDate && req.query.toDate) {
    console.log('  queried Date')

    // EXTERNAL CODE
    // Code from: https://stackoverflow.com/a/46362201/298051
    re = /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/
    // END EXTERNAL CODE

    if (re.test(req.query.fromDate) && re.test(req.query.toDate)) {
      let dateFromDate = new Date(req.query.fromDate)
      let dateToDate = new Date(req.query.toDate)

      if ( dateFromDate < dateToDate ) {
        queryFilter = (event) => {
          let eventDate = new Date(event.date)
          return (eventDate > dateFromDate && eventDate < dateToDate)
        }

      } else {
        // negative date range
        console.log('  ERROR date range specified was negative')
        sendError = {
          code: 400,
          string: "date range specified was negative, or less than 1 day."
        } 
      }

    } else {
      // Not valid date
      console.log('  ERROR not a valid set of dates')
      sendError = {
          code: 400,
          string: "not a valid set of dates"
        }
    }
    
  } else {
    console.log('  no params, return all')

    // Default queryString already set above
  }

  if (sendError == false) {

    db.all(queryString, (err, rows) => {
      let results = { events: [] }

      results.events = rows.map((row) => {
        return newRow = {
          event_id: 'e_' + row.eventID,
          title: row.eventTitle,
          blurb: row.eventBlurb,
          date: row.eventDate,
          url: row.eventURL,
          venue: {
            name: row.venueName,
            postcode: row.venuePostcode,
            town: row.venueTown,
            url: row.venueURL,
            icon: row.venueIcon,
            venue_id: 'v_' + row.venueID 
          }
        }
      })

      // Apply an arbitratry filter
      results.events = results.events.filter(queryFilter)

      res.send(JSON.stringify(results))
    })
  } else {
    res.status(sendError.code)
    res.send(JSON.stringify({"error": sendError.string}))
  }

  // db.close()
  
})

app.get(config.baseURLPath + '/events/get/:event_id', function (req, res) {
  res.setHeader('Content-Type', 'application/json')

  // Check for integer input
  if (req.params['event_id'] % 1 === 0) {
    db.all('SELECT * FROM Events WHERE eventID=?', req.params['event_id'], (err, rows) => {
      if (rows.length >= 1) {
        res.send(JSON.stringify(rows[0]))
      } else {
        res.status(400).send(JSON.stringify({"error": "no such event"}))
      }
    })
  } else {
    // Not an integer
    res.status(400).send(JSON.stringify({"error": "no such event"}))
  }

  // db.close()
  
})

app.get(config.baseURLPath + '/venues', function (req, res) {
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

app.post(config.baseURLPath + '/events', function (req, res) {
  res.send('a POST to events')
})

app.post(config.baseURLPath + '/venues/add', function (req, res) {

  if (AUTHENTICATED) {
    // Validate all the input: name, postcode, town, url, icon
    if (!name) {
      res.status(400)
      res.send(JSON.stringify({"error": "required input for name"}))
      return
    }

    //Run SQL
    db.run('INSERT INTO Venues (name, postcode, town, url, icon) VALUES (?,?,?,?,?)', req.params['name'], req.params['postcode'], req.params['town'], req.params['url'], req.params['icon'], (err) => {
      if (err) {
        return console.log(err.message)
      }

      console.log(`A row has been inserted with rowid ${this.lastID}`);
    })

  } else {
    res.status(400)
    res.send(JSON.stringify({"error": "not authorised, wrong token"}))
    return
  }
  
})

app.use('/static', express.static('static'))

app.get(config.baseURLPath + '/index.html', (req, res) => {
  res.sendFile('index.html', {root: './static'});
})

app.get(config.baseURLPath + '/admin.html', (req, res) => {
  res.sendFile('admin.html', {root: './static'});
})

let server = app.listen(config.expressPort, function () {
  console.log('Example app listening on port 3000!')
  // server.close(() => {
  //   console.log('Doh :(')
  // })
})