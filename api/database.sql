--
-- The major change in the database and one that I need you to observe is the relationships.
-- It's also the main reason you should draw an ERD
--

CREATE TABLE IF NOT EXISTS landlord (
  ID         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  First_Name VARCHAR(100) NOT NULL,
  Last_Name  VARCHAR(100) NOT NULL,
  UserName   VARCHAR(100) NOT NULL UNIQUE,
  Email      VARCHAR(191) NOT NULL UNIQUE,
  Address    VARCHAR(191) NOT NULL,
  KRA_PIN    VARCHAR(191) NOT NULL,
  Password   VARCHAR(191) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tenant (
  ID         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  First_Name VARCHAR(100) NOT NULL,
  Last_Name  VARCHAR(100) NOT NULL,
  UserName   VARCHAR(100) NOT NULL UNIQUE,
  Email      VARCHAR(191) NOT NULL UNIQUE,
  Address    VARCHAR(191) NOT NULL,
  KRA_PIN    VARCHAR(191) NOT NULL,
  Password   VARCHAR(191) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS counties (
  id int(11) NOT NULL AUTO_INCREMENT,
  County varchar(15) DEFAULT NULL,
  added_by int(11) NOT NULL,
  updated_on timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Code varchar(6) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS sub_counties (
  id int(11) NOT NULL AUTO_INCREMENT,
  SubCounty varchar(19) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS wards (
  id int(11) NOT NULL AUTO_INCREMENT,
  Ward varchar(28) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS plots(
  ID INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(191) NOT NULL ,
  description TEXT NOT NULL ,
  landlord INT,
  county       INT NOT NULL,
  Constituency INT NOT NULL,
  Ward         INT NOT NULL,
  Town         VARCHAR(191) NOT NULL,
  photo TEXT, -- This will have links to the photos of the plot
  approved BOOLEAN DEFAULT FALSE,
  FOREIGN KEY(landlord) REFERENCES landlord(ID),
  FOREIGN KEY(county) REFERENCES counties(id),
  FOREIGN KEY(Ward) REFERENCES wards(id),
  FOREIGN KEY(Constituency) REFERENCES sub_counties(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS houses(
  ID INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(191) NOT NULL , -- The house type, single, one bedroom, bedsitter
  monthly_rent DOUBLE NOT NULL ,
  booking_amount DOUBLE NOT NULL , -- The amount required to book the house
  description TEXT,status SET('vacant', 'occupied', 'booked') DEFAULT 'vacant', -- This will be set to vacant if there's an available room
  photo TEXT,
  plot INT,
  FOREIGN KEY(plot) REFERENCES plots(ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE transactions(
  transaction_no VARCHAR(40) PRIMARY KEY, -- The MPESA transaction ID
  details TEXT,
  amount DOUBLE,
  time_payed DATETIME DEFAULT current_timestamp
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS booking(
  ID INT AUTO_INCREMENT PRIMARY KEY ,
  house INT NOT NULL ,
  tenant INT,
  reciept_id VARCHAR(40) UNIQUE,
  date_booked DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (house) REFERENCES houses(ID),
  FOREIGN KEY (tenant) REFERENCES tenant(ID),
  FOREIGN KEY (reciept_id) REFERENCES transactions(transaction_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;