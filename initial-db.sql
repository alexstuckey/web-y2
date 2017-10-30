CREATE TABLE Events (
  id          TEXT      PRIMARY KEY,
  title       TEXT      NOT NULL,
  blurb       TEXT      NOT NULL,
  date        TEXT      NOT NULL,
  url         TEXT      NOT NULL,
  venueId     INTEGER   NOT NULL,
  CONSTRAINT  Event_fk_venueId FOREIGN KEY (venueId)
    REFERENCES Venues (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Venues (
  id          INTEGER   PRIMARY KEY,
  name        TEXT      NOT NULL,
  postcode    TEXT      NOT NULL,
  town        TEXT      NOT NULL,
  url         TEXT      NOT NULL,
  icon        TEXT      NOT NULL
);


INSERT INTO Venues (id, name, postcode, town, url, icon) VALUES (1, 'Grinton Lodge Youth Hostel', 'DL11 6HS', 'Richmond', 'http://www.yha.org.uk/hostel/grinton-lodge', 'http://www.yha.org.uk/sites/all/themes/yha/images/logos/yha_header_logo.png');
INSERT INTO Venues (id, name, postcode, town, url, icon) VALUES (2, 'Sage Gateshead', 'NE8 2JR', 'Gateshead', 'http://www.sagegateshead.com/', 'http://www.sagegateshead.com/files/images/pageimage/1683.7123dea7/630x397.fitandcrop.jpg');

INSERT INTO Events (id, title, blurb, date, url, venueId) VALUES (1, 'Swaledale Squeeze 2018', 'The biggest and best concertina weekend in the world. Held each May in Grinton Lodge YHA, North Yorkshire', '2018-05-21T16:00:00Z', 'http://www.swaledalesqueeze.org.uk', 1);


INSERT INTO Events (id, title, blurb, date, url, venueId) VALUES (2, 'A launch party', 'Just a little bit of a blurb about an event', '2018-04-23T19:00:00Z', 'http://wwww.website.co.uk', 1);
INSERT INTO Events (id, title, blurb, date, url, venueId) VALUES (3, 'Biggest event evarr', 'Sometimes people want to read more about the biggest event', '2018-04-17T13:00:00Z', 'http://biggest.events.com', 1);
INSERT INTO Events (id, title, blurb, date, url, venueId) VALUES (4, 'Chill Evening', 'Relax for an evening at a slow-paced night.', '2018-04-12T18:30:00Z', 'http://chilling.com', 2);