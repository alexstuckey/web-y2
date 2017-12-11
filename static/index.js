$(function () {
  $('#datetimepicker1').datetimepicker({
    format: 'DD/MM/YYYY'
  })
  $('#datetimepicker2').datetimepicker({
    format: 'DD/MM/YYYY',
    useCurrent: false //Important! See issue #1075
  })

  $("#datetimepicker1").on("dp.change", function (e) {
    $('#datetimepicker2').data("DateTimePicker").minDate( e.date.add(1, 'days') )
  })
  $("#datetimepicker2").on("dp.change", function (e) {
    $('#datetimepicker1').data("DateTimePicker").maxDate(e.date)
  })

  $('#submitSearch').click(() => {
    if ($('#datetimepicker1').data("DateTimePicker").date()===null && $('#datetimepicker1').data("DateTimePicker").date()===null) {
      alert("No date(s) entered.")
      return
    }

    let fromDate = ''
    if ($('#datetimepicker1').data("DateTimePicker").date()) {
      fromDate = $('#datetimepicker1').data("DateTimePicker").date().add(6, 'h').toISOString().substring(0,10)
    }
    let toDate = ''
    if ($('#datetimepicker2').data("DateTimePicker").date()) {
      toDate = $('#datetimepicker2').data("DateTimePicker").date().add(6, 'h').toISOString().substring(0,10)
    }

    console.log(fromDate, toDate)

    if (toDate == '') {
      // then single date search

      // Perform AJAX
      $.ajax({
        url: '/events2017/events/search',
        method: 'GET',
        data: {
          search: $('#inputKeywords').val(),
          date: fromDate,
        }
      }).done((data, textStatus, jqXHR) => {
        // Erase previous table, if exists
        $("#eventsTable").find("tr:gt(0)").remove()

        // Populate table
        data.events.forEach( addRow )

        // Show table
        $('#eventsTable').collapse('show')
      }).fail((jqXHR, textStatus) => {
        // ERROR
        alert('error: get events internal (single)')
      })

      if ($('#externalEventsCheckbox').prop('checked')===true) {
        $.ajax({
          url: '/events2017/externalevents',
          method: 'GET',
          data: {
            date: fromDate,
          }
        }).done((data, textStatus, jqXHR) => {
          // Erase previous table, if exists
          $("#eventsTableExternal").find("tr:gt(0)").remove()

          // Populate table
          data.search.events[0].event.forEach( addRowExternal )

          // Show table & header
          $('#eventsTableExternal').collapse('show')
          $('#eventsTableExternalHeader').collapse('show')
        }).fail((jqXHR, textStatus) => {
          // ERROR
          alert('error: get events external (single)')
        })
      }
    } else {
      // range date search

      // Perform AJAX
      $.ajax({
        url: '/events2017/events/search',
        method: 'GET',
        data: {
          search: $('#inputKeywords').val(),
          fromDate: fromDate,
          toDate: toDate
        }
      }).done((data, textStatus, jqXHR) => {
        // Erase previous table, if exists
        $("#eventsTable").find("tr:gt(0)").remove()

        // Populate table
        data.events.forEach( addRow )

        // Show table
        $('#eventsTable').collapse('show')
      }).fail((jqXHR, textStatus) => {
        // ERROR
        alert('error: get events internal (range)')
      })

      if ($('#externalEventsCheckbox').prop('checked')===true) {
        $.ajax({
          url: '/events2017/externalevents',
          method: 'GET',
          data: {
            fromDate: fromDate,
            toDate: toDate
          }
        }).done((data, textStatus, jqXHR) => {
          // Erase previous table, if exists
          $("#eventsTableExternal").find("tr:gt(0)").remove()

          // Populate table
          data.search.events[0].event.forEach( addRowExternal )

          // Show table & header
          $('#eventsTableExternal').collapse('show')
          $('#eventsTableExternalHeader').collapse('show')
        }).fail((jqXHR, textStatus) => {
          // ERROR
          alert('error: get events external (range)')
        })
      }
    }

    if ($('#externalEventsCheckbox').prop('checked')===false) {
      // Show table & header
      $('#eventsTableExternal').collapse('hide')
      $('#eventsTableExternalHeader').collapse('hide')
    }

    


  })
})

let addRow = (event) => {
  $('<tr data-toggle="modal" data-target="#eventModal"> <th>'+ event.event_id.substring(2) +'</th> <td>'+ event.title +'</td> <td>'+ moment(event.date).format('LLL') +'</td> <td>'+ event.venue.name +'</td> </tr>').appendTo('#eventsTable tbody').data('eventObj', event)
}

let addRowExternal = (event) => {
  $('<tr> <td>'+ event.title[0] +'</td> <td>'+ moment(event.start_time[0]).format('LLL') +'</td> <td>'+ event.venue_name[0] +'</td> </tr>').appendTo('#eventsTableExternal tbody').data('eventObj', event)
}

$('#eventModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget) // Button that triggered the modal
  var eventObj = button.data('eventObj') // Extract info from data-* attributes
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this)
  modal.find('.modal-title').text(eventObj.title)
  modal.find('.modal-body #modalEventDate').text(moment(eventObj.date).format('LLL'))
  modal.find('.modal-body #modalVenueName').text(eventObj.venue.name)

  // Optional values need to be checked
  if (eventObj.venue.postcode) {
    modal.find('.modal-body #modalVenuePostcode').text(eventObj.venue.postcode).removeClass('text-muted')
  } else {
    modal.find('.modal-body #modalVenuePostcode').text('No value').addClass('text-muted')
  }
  if (eventObj.url) {
    modal.find('.modal-body #modalEventURL').text(eventObj.url).removeClass('text-muted').attr('href', eventObj.url)
  } else {
    modal.find('.modal-body #modalEventURL').text('No value').addClass('text-muted').attr('href', '')
  }
  if (eventObj.blurb) {
    modal.find('.modal-body #modalEventBlurb').text(eventObj.blurb).removeClass('text-muted')
  } else {
    modal.find('.modal-body #modalEventBlurb').text('No value').addClass('text-muted')
  }
  if (eventObj.venue.icon) {
    modal.find('.modal-body #modalVenueIcon').attr('src', eventObj.venue.icon)
  } else {
    modal.find('.modal-body #modalVenueIcon').attr('src', '')
  }
  if (eventObj.venue.url) {
    modal.find('.modal-body #modalVenueURL').text(eventObj.venue.url).removeClass('text-muted').attr('href', eventObj.venue.url)
  } else {
    modal.find('.modal-body #modalVenueURL').text('No value').addClass('text-muted').attr('href', '')
  }
  if (eventObj.venue.town) {
    modal.find('.modal-body #modalVenueTown').text(eventObj.venue.town).removeClass('text-muted')
  } else {
    modal.find('.modal-body #modalVenueTown').text('No value').addClass('text-muted')
  }
})