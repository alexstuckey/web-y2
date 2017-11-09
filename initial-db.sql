CREATE TABLE Events (
  eventID          INTEGER   PRIMARY KEY,
  eventTitle       TEXT      NOT NULL,
  eventBlurb       TEXT,
  eventDate        TEXT      NOT NULL,
  eventURL         TEXT,
  eventVenueID     INTEGER   NOT NULL,
  CONSTRAINT  Event_fk_venueId FOREIGN KEY (eventVenueID)
    REFERENCES Venues (venueID) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Venues (
  venueID          INTEGER   PRIMARY KEY,
  venueName        TEXT      NOT NULL,
  venuePostcode    TEXT,
  venueTown        TEXT,
  venueURL         TEXT,
  venueIcon        TEXT
);

CREATE TABLE Auth (
  auth_token       TEXT      PRIMARY KEY,
  authUsername     TEXT      NOT NULL,
  authIP           TEXT      NOT NULL,
  authDatetime     TEXT      NOT NULL
);

INSERT INTO Venues (venueID, venueName, venuePostcode, venueTown, venueURL, venueIcon) VALUES (1, 'Grinton Lodge Youth Hostel', 'DL11 6HS', 'Richmond', 'http://www.yha.org.uk/hostel/grinton-lodge', 'http://www.yha.org.uk/sites/all/themes/yha/images/logos/yha_header_logo.png');
INSERT INTO Venues (venueID, venueName, venuePostcode, venueTown, venueURL, venueIcon) VALUES (2, 'Sage Gateshead', 'NE8 2JR', 'Gateshead', 'http://www.sagegateshead.com/', 'http://www.sagegateshead.com/files/images/pageimage/1683.7123dea7/630x397.fitandcrop.jpg');

INSERT INTO Events (eventID, eventTitle, eventBlurb, eventDate, eventURL, eventVenueID) VALUES (1, 'Swaledale Squeeze 2018', 'The biggest and best concertina weekend in the world. Held each May in Grinton Lodge YHA, North Yorkshire', '2018-05-21T16:00:00Z', 'http://www.swaledalesqueeze.org.uk', 1);


INSERT INTO Events (eventID, eventTitle, eventBlurb, eventDate, eventURL, eventVenueID) VALUES (2, 'A launch party', 'Just a little bit of a blurb about an event', '2018-04-23T19:00:00Z', 'http://wwww.website.co.uk', 1);
INSERT INTO Events (eventID, eventTitle, eventBlurb, eventDate, eventURL, eventVenueID) VALUES (3, 'Biggest event evarr', 'Sometimes people want to read more about the biggest event', '2018-04-17T13:00:00Z', 'http://biggest.events.com', 1);
INSERT INTO Events (eventID, eventTitle, eventBlurb, eventDate, eventURL, eventVenueID) VALUES (4, 'Chill Evening', 'Relax for an evening at a slow-paced night.', '2018-04-12T18:30:00Z', 'http://chilling.com', 2);