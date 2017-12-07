const express = require('express')
const app = express()
const config = require('../config.js')
const crypto = require('crypto')
const fs = require('fs')
const request = require('request')
const qs = require('qs')
const parseXMLString = require('xml2js').parseString
const setupDB = require('../setup-db.js')

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))

let db

let sameDay = (d1, d2) => {
  // EXTERNAL CODE
  // Code from: https://stackoverflow.com/a/43855221/
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
  // END EXTERNAL CODE
}

let whenAuthenticated = (auth_token, ip, success, failure) => {
  if ( auth_token == 'concertina' && ip.startsWith('129.234') ) {
    success()
  } else {
    db.all('SELECT * FROM Auth WHERE auth_token=?', auth_token, (err, rows) => {
      if (rows.length >= 1) {
        console.log(rows)
        if ( rows[0].authIP == ip ) {
          let dbDate = new Date(rows[0].authDatetime)
          dbDate.setHours( dbDate.getHours() + 2 )
          let now = new Date()
          if ( dbDate > now ) {
            //success
            success()
          } else {
            console.log("  auth_token has expired")
            failure()
          }
        } else {
          console.log("  IP address does not match auth_token")
          failure()
        }
      } else {
        console.log("  auth_token not found in DB")
        failure()
      }
    })
  }
}



app.get(config.baseURLPath + '/events/search', function (req, res) {
  res.setHeader('Content-Type', 'application/json')

  let queryString = 'SELECT Events.*, Venues.* FROM Events, Venues WHERE Events.eventVenueID=Venues.venueID;'
  let queryFilters = []
  let sendError = false

  let applySearch = () => {
    // First, split the keywords
    let keywords = req.query.search.split(' ')
    // Second, move all to lowercase
    keywords = keywords.map((keyword) => {
      return keyword.toLowerCase()
    })
    console.log(keywords)

    // Third, build a filter to find keywords in date
    queryFilters.push((event) => {
      // Check whether each keywords exists in the event
      let appearances = keywords.map((keyword) => {
        return event.title.toLowerCase().includes(keyword)
      })
      // Apply logical AND to array of booleans
      return appearances.reduce((prev, i) => {
        return prev && i
      }, true)
    })
  }

  let applyDates = () => {
    // EXTERNAL CODE
    // Code from: https://stackoverflow.com/a/46362201/298051
    reShort = /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/
    reLong = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/
    // END EXTERNAL CODE

    if ((reShort.test(req.query.fromDate) && reShort.test(req.query.toDate)) || (reLong.test(req.query.fromDate) && reLong.test(req.query.toDate)) ) {
      let dateFromDate = new Date(req.query.fromDate)
      let dateToDate = new Date(req.query.toDate)

      if ( dateFromDate < dateToDate ) {
        queryFilters.push((event) => {
          let eventDate = new Date(event.date)
          return (eventDate > dateFromDate && eventDate < dateToDate)
        })

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
  }

  let applySingleDate = () => {
    // EXTERNAL CODE
    // Code from: https://stackoverflow.com/a/46362201/298051
    reShort = /^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/
    reLong = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/
    // END EXTERNAL CODE

    if (reLong.test(req.query.date) || reShort.test(req.query.date)) {
      let dateDate = new Date(req.query.date)

      queryFilters.push((event) => {
        let eventDate = new Date(event.date)
        
        // return (eventDate == dateDate)
        return sameDay(eventDate, dateDate)
      })

    } else {
      // Not valid date
      console.log('  ERROR not a valid date')
      sendError = {
          code: 400,
          string: "not a valid date"
        }
    }
  }

  console.log('GET BASE/events/search', req.query)
  if (req.query.search && req.query.fromDate && req.query.toDate) {
    console.log('  queried Search & Dates')
    applySearch()
    applyDates()

  } else if (req.query.search) {
    console.log('  queried Search')
    applySearch()

  } else if (req.query.fromDate && req.query.toDate) {
    console.log('  queried Dates')
    applyDates()
    
  } else if (req.query.date) {
    console.log('  queried single Date')
    applySingleDate()

  } else if (eq.query.date && eq.query.search) {
    console.log('  queried single Date')
    applySearch()
    applySingleDate()

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

      // Apply arbitratry filters
      queryFilters.forEach( (queryFilter) => {
        results.events = results.events.filter(queryFilter)
      })

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

  let e_id

  if (req.params.event_id.startsWith('e_')) {
    e_id = req.params.event_id.substring(2)
  } else {
    e_id = req.params.event_id
  }



  // Check for integer input
  if (e_id % 1 === 0) {
    db.all('SELECT * FROM Events WHERE eventID=?', e_id, (err, rows) => {
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
    let rowIDString = "v_" + row.venueID
    let newRow = {
      name: row.venueName,
      postcode: row.venuePostcode,
      town: row.venueTown,
      url: row.venueURL,
      icon: row.venueIcon
    }
    response['venues'][rowIDString] = newRow
  }, () => {
    // Query completes:
    res.send(JSON.stringify(response))
  })

})

app.post(config.baseURLPath + '/events/add', function (req, res) {
  whenAuthenticated(req.body.auth_token, req.ip, () => {
    // Validate all the input:
    //   REQUIRED: (id) title, venue_id, date
    //   OPTIOANL: url, blurb
    if (!req.body.title || !req.body.venue_id || !req.body.date) {
      res.status(400)
      res.send(JSON.stringify({"error": "missing required input parameters"}))
      return
    } else {
      // Before insert, a) validate the date,

      // EXTERNAL CODE
      // Code from: https://stackoverflow.com/a/3143231/298051
      re = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z)/
      // END EXTERNAL CODE

      if (re.test(req.body.date)) {
        // and b) check that a venue exists with that id
        db.all('SELECT * FROM Venues WHERE venueID=?', req.body.venue_id, (err, rows) => {
          if (rows.length == 1) {
            db.run('INSERT INTO Events (eventTitle, eventBlurb, eventDate, eventURL, eventVenueID) VALUES (?,?,?,?,?)', req.body.title, req.body.blurb, req.body.date, req.body.url, req.body.venue_id, function (err) {
              if (err) {
                return console.log(err.message)
              }
              console.log(err)
              console.log(`An event has been inserted with row_id ${this.lastID}`);
              res.status(201)
              res.location(config.baseURLPath + '/events/get/' + this.lastID)
              res.send(JSON.stringify({"success": "event inserted with row_id " + this.lastID}))
              return
            })
          } else {
            res.status(400)
            res.send(JSON.stringify({"error": "event cannot be inserted due to an invalid venue_id"}))
            return
          }
        })
      } else {
        res.status(400)
        res.send(JSON.stringify({"error": "event cannot be inserted due to an invalid date string"}))
        return
      }

    }

  }, () => {
    res.status(400)
    res.send(JSON.stringify({"error": "not authorised, wrong token"}))
    return
  })

})

app.post(config.baseURLPath + '/venues/add', function (req, res) {

  whenAuthenticated(req.body.auth_token, req.ip, () => {
    // Validate all the input:
    //   REQUIRED: name
    //   OPTIOANL: postcode, town, url, icon
    if (!req.body.name) {
      res.status(400)
      res.send(JSON.stringify({"error": "required input for name"}))
      return
    } else {
      //Run SQL
      db.run('INSERT INTO Venues (venueName, venuePostcode, venueTown, venueURL, venueIcon) VALUES (?,?,?,?,?)', req.body.name, req.body.postcode, req.body.town, req.body.url, req.body.icon, (err) => {
        if (err) {
          return console.log(err.message)
        }
        console.log(`A venue has been inserted with rowid ${this.lastID}`);
        res.status(201)
        res.location(config.baseURLPath + '/venues')
        res.send(JSON.stringify({"success": "venue inserted"}))
        return
      })
    }

  }, () => {
    res.status(400)
    res.send(JSON.stringify({"error": "not authorised, wrong token"}))
    return
  })
  
})

app.use('/static', express.static('static'))

app.get(config.baseURLPath + '/index.html', (req, res) => {
  res.sendFile('index.html', {root: './static'});
})

app.get(config.baseURLPath + '/admin.html', (req, res) => {

  if (req.headers.cookie) {
    // Extracts auth_token
    whenAuthenticated(req.headers.cookie.split('=')[1], req.ip, () => {
      res.sendFile('admin.html', {root: './static'})
    }, () => {
      res.sendFile('login.html', {root: './static'})
    })
  } else {
    res.sendFile('login.html', {root: './static'})
  }

})

app.post(config.baseURLPath + '/admin.html', (req, res) => {
  // Check req.body.username and .password
  db.all('SELECT * FROM Auth WHERE authUsername=? AND authPassword=?', req.body.username, req.body.password, (err, rows) => {
    if (rows.length >= 1) {
      // Set auth_token cookie
      res.cookie('auth_token', rows[0].auth_token)

      // Send page
      res.sendFile('admin.html', {root: './static'})
    } else {
      console.log("  invalid user & pass")
      res.sendFile('login.html', {root: './static'})
    }
  })
})

app.post(config.baseURLPath + '/auth', function (req, res) {
  // username and password, then combines it with IP address
  // returns an auth_token

  if (!req.body.username || !req.body.password) {
    res.status(400)
    res.send(JSON.stringify({"error": "missing required input parameters"}))
    return
  } else {
    // Record the time
    let createTime = new Date().toISOString()

    // Generate token
    let auth_token = crypto.randomBytes(20).toString('hex');

    // Insert into database
    db.run('INSERT INTO Auth (auth_token, authUsername, authPassword, authIP, authDatetime) VALUES (?, ?, ?, ?, ?)', auth_token, req.body.username, req.body.password, req.ip, createTime, (err) => {
      if (err) {
        return console.log(err.message)
      }
      console.log(`An auth_token (${auth_token}) has been inserted with username ${req.body.username} and IP ${req.ip}`);
      
      // Return the auth_token via HTTP
      res.send(JSON.stringify({"auth_token": auth_token}))
    })
  }

})

app.get(config.baseURLPath + '/auth', function (req, res) {
  if (!req.query.auth_token) {
    res.send(JSON.stringify({"authenticated": true,
                             "error": "no supplied auth_token"}))
  } else {
    whenAuthenticated(req.query.auth_token, req.ip, () => {
      res.send(JSON.stringify({"authenticated": true}))
    }, () => {
      res.send(JSON.stringify({"authenticated": false}))
    })
  }
})

app.get(config.baseURLPath + '/externalevents', function (req, res) {
  // Method for routing client requests to the Eventful API
  // http://api.eventful.com/

  let parameters =  {
    app_key: config.eventfulKey,
    location: "Durham, United Kingdom",
    date: "Future"
  }

  if (req.query.date) {
    // single date

    let dateDate = new Date(req.query.date)

    let firstHalf = dateDate.toISOString().slice(0,10).replace(/-/g,"") + '00'
    dateDate.setDate(dateDate.getDate() + 1)
    let secondHalf = dateDate.toISOString().slice(0,10).replace(/-/g,"") + '00'
    let combined = firstHalf + '-' + secondHalf
    console.log(combined)

    parameters.date = combined

  } else if (req.query.fromDate && req.query.fromDate) {
    // date range
    
    let dateFromDate = new Date(req.query.fromDate)
    let dateToDate = new Date(req.query.toDate)

    let firstHalf = dateFromDate.toISOString().slice(0,10).replace(/-/g,"") + '00'
    let secondHalf = dateTODate.toISOString().slice(0,10).replace(/-/g,"") + '00'
    let combined = firstHalf + '-' + secondHalf
    console.log(combined)

    parameters.date = combined
  }

  request.get({
    url: "http://api.eventful.com/rest/events/search",
    qs: {
      app_key: config.eventfulKey,
      location: "Durham, United Kingdom",
      date: "Future"
    }
  }, (error, response, body) => {
      if (error) {
        console.error('eventful request failed:', error);
        res.status(400)
        res.send(JSON.stringify({"error": "eventful request failed"}))
      } else {
        parseXMLString(body, (err, result) => {
          if (err) {
            return console.error('xml parsing error:', err)
          } else {
            res.setHeader('Content-Type', 'application/json')
            res.send(JSON.stringify(result))
          }
        })
      }
    })
})

let server = app.listen(config.expressPort, function () {
  // Check if database exists
  if (fs.existsSync(config.databasePath)) {
    var sqlite3 = require('sqlite3').verbose()
    db = new sqlite3.Database(config.databasePath)
  } else {
    setupDB.createDatabase()
    var sqlite3 = require('sqlite3').verbose()
    db = new sqlite3.Database(config.databasePath)
  }

  console.log(`Example app listening on port ${config.expressPort}!`)

})