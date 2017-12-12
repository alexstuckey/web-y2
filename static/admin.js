$(function () {
  $('#inputEventDate').datetimepicker({
      inline: true,
      sideBySide: true
    })

  // Perform AJAX to populate venues table
  loadVenuesTable()

    $('#submitAddEvent').click(() => {
      let date = ''
      if ($('#inputEventDate').data("DateTimePicker").date()) {
        date = $('#inputEventDate').data("DateTimePicker").date().seconds(0).milliseconds(0).toISOString().replace('00.000', '00')
      }

      // Perform AJAX
      $.ajax({
        url: '/events2017/events/add',
        method: 'POST',
        data: {
          title: $('#inputEventTitle').val(),
          blurb: $('#inputEventBlurb').val(),
          date: date,
          url: $('#inputEventURL').val(),
          venue_id: $('#inputEventVenueID').val()
        }
      }).done((data, textStatus, jqXHR) => {

      }).fail((jqXHR, textStatus) => {
        // ERROR
        alert(jqXHR.responseText)
      });
    })

    $('#submitAddVenue').click(() => {
      // Perform AJAX
      $.ajax({
        url: '/events2017/venues/add',
        method: 'POST',
        data: {
          name: $('#inputVenueName').val(),
          postcode: $('#inputVenuePostcode').val(),
          town: $('#inputVenueTown').val(),
          url: $('#inputVenueURL').val(),
          icon: $('#inputVenueIcon').val()
        }
      }).done((data, textStatus, jqXHR) => {
        // Trigger a reload of the table
        loadVenuesTable()
      }).fail((jqXHR, textStatus) => {
        // ERROR
        alert(jqXHR.responseText)
      });
    })

})

let addVenuesRow = (venue) => {
  $('<tr data-toggle="modal" data-target="#venueModal"> <th>'+ venue.venue_id.substring(2) + '</th> <td>' + venue.name + '</td> <td>' + venue.postcode + '</td> <td>' + venue.town + '</td> <td>' + venue.url + '</td> <td>' + venue.icon + '</td> <td>' + '</td> </tr>').appendTo('#venuesTable tbody').data('venueObj', venue)
}

let addVenueEventsRow = (event) => {
  $('<tr> <th>'+ event.event_id.substring(2) +'</th> <td>'+ event.title + '</td> <td>' + event.blurb + '</td> <td>' + moment(event.date).format('LLL') +'</td> <td>' + event.url + '</td> <td>' + event.venue.venue_id.substring(2) +'</td> </tr>').appendTo('#venueEventsTable tbody').data('eventObj', event)
}

let loadVenuesTable = () => {
  $.ajax({
    url: '/events2017/venues',
    method: 'GET'
  }).done((data, textStatus, jqXHR) => {
    // Erase previous table, if exists
    $("#venuesTable").find("tr:gt(0)").remove()

    // Populate table
    let venues = Object.keys(data.venues).map( (key) => {
      let tmpVenue = data.venues[key]
      tmpVenue.venue_id = key
      return tmpVenue
    } )

    venues.forEach( addVenuesRow )

    // Show table
    $('#venuesTable').collapse('show')
  }).fail((jqXHR, textStatus) => {
    // ERROR
    alert('error')
  });
}

$('#venueModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget) // Button that triggered the modal
  var venueObj = button.data('venueObj') // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this)
  modal.find('.modal-title').text(venueObj.name)
  modal.find('#inputEventVenueID').val(venueObj.venue_id.substring(2))

  modal.find('#inputEventTitle').val('')
  modal.find('#inputEventBlurb').val('')
  modal.find('#inputEventDate').val('')
  modal.find('#inputEventURL').val('')

  // Fetch all events, then filter down
  $.ajax({
      url: '/events2017/events/search',
      method: 'GET'
    }).done((data, textStatus, jqXHR) => {
      // Erase previous table, if exists
      $("#venueEventsTable").find("tr:gt(0)").remove()

      // Populate table
      let events = data.events.filter( (event) => {
        return (event.venue.venue_id == venueObj.venue_id)
      } )

      events.forEach( addVenueEventsRow )

      // date
    }).fail((jqXHR, textStatus) => {
      // ERROR
      alert('error')
    });

})