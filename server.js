const User = require('./models/user');
const Entry = require('./models/entry');
const bodyParser = require('body-parser');
const config = require('./config');
const mongoose = require('mongoose');
const moment = require('moment');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const express = require('express');
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

mongoose.Promise = global.Promise;

// ---------------- RUN/CLOSE SERVER --------------------------------------------
let server = undefined;

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

module.exports = { app, runServer, closeServer };

// ---------------USER ENDPOINTS-------------------------------------

// POST 
// creating a new user
app.post('/users/create', (req, res) => {

	const requiredFields = ['name', 'email', 'username', 'password'];

	for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
    //Grab info from ajax api call
	let name = req.body.name;
	let email = req.body.email;
	let username = req.body.username;
	let password = req.body.password;

	username = username.trim();
	password = password.trim();

	//use the mongoose DB schema, connect to the database and create the new user
	User.create({
		name, 
		email,
		username,
		password: hash,
	}, (err, item) => {

		//if creating returns an error
		if(err) {
			return res.status(500).json({
				message: 'Internal Service Error'
			});
		}
		//if successfull
		if(item) {
			console.log('User \`${username}\' created');
			return res.json(item);
		}
	});
}

// signing in a user
app.post('/users/login', function (req, res) {

    //take username and pass from the ajax api call
    const username = req.body.username;
    const password = req.body.password;

    //using mongoose DB schema, connect to database and user with the same username as above
    User.findOne({
        username: username
    }, function (err, items) {

        //if error connecting to the DB
        if (err) {
            return res.status(500).json({
                message: "Internal server error"
            });
        }
        // if there are no users with that username
        if (!items) {
            return res.status(401).json({
                message: "Not found!"
            });
        }
        //if the username is found
        else {
            items.validatePassword(password, function (err, isValid) {
                //if the connection to the DB to validate the password is not working
                if (err) {
                    console.log('Could not connect to the DB to validate the password.');
                }
                //if the password is not valid
                if (!isValid) {
                    return res.status(401).json({
                        message: "Password Invalid"
                    });
                }
                //if the password is valid
                else {
                    //return the logged in user
                    console.log(`User \`${username}\` logged in.`);
                    return res.json(items);
                }
            });
        };
    });
})