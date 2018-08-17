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

function runServer(urlToUse) {
    return new Promise((resolve, reject) => {
        mongoose.connect(urlToUse, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(config.PORT, () => {
                console.log(`Listening on localhost:${config.PORT}`);
                resolve();
            }).on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

if (require.main === module) {
    runServer(config.DATABASE_URL).catch(err => console.error(err));
}

function closeServer() {
    return mongoose.disconnect().then(() => new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    }));
}

// ---------------USER ENDPOINTS-------------------------------------

// POST
// creating a new user
app.post('/users/create', (req, res) => {

    //take the name, username and the password from the ajax api call
    let name = req.body.name;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let gamesPlayed = req.body.gamesPlayed;
    let gamesWon = req.body.gamesWon;

    //exclude extra spaces from the username,email and password
    username = username.trim();
    password = password.trim();

    //create an encryption key
    bcrypt.genSalt(10, (err, salt) => {

        //if creating the key returns an error...
        if (err) {

            //display it
            return res.status(500).json({
                message: 'Internal server error'
            });
        }

        //using the encryption key above generate an encrypted pasword
        bcrypt.hash(password, salt, (err, hash) => {

            //if creating the ncrypted pasword returns an error..
            if (err) {

                //display it
                return res.status(500).json({
                    message: 'Internal server error'
                });
            }

            //using the mongoose DB schema, connect to the database and create the new user
            User.create({
                name,
                email,
                username,
                gamesPlayed,
                gamesWon,
                password: hash
            }, (err, item) => {

                //if creating a new user in the DB returns an error..
                if (err) {
                    //display it
                    return res.status(500).json({
                        message: 'Internal Server Error'
                    });
                }
                //if creating a new user in the DB is succefull
                if (item) {

                    //display the new user
                    console.log(`User \`${username}\` created.`);
                    return res.json(item);
                }
            });
        });
    });
});

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
                message: "error connecting to the DB"
            });
        }
        // if there are no users with that username
        if (!items) {
            return res.status(401).json({
                message: "no users with that username"
            });
        }
        //if the username is found
        else {
            items.validatePassword(password, function (err, isValid) {
                //if the connection to the DB to validate the password is not working
                if (err) {
                    return res.status(401).json({
                        message: "connection to the DB to validate the password is not working"
                    });
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

//GET User details to populate
app.get('/users/:username', function (req, res) {

    User
        .find({
            username: req.params.username
        })
        .then(function (user) {
            res.json({
                user
            });
        })
        .catch(function (err) {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            });
        });
});

// PUT --------------------------------------
app.put('/users/:id', function (req, res) {

    bcrypt.genSalt(10, (err, salt) => {

        //if creating the key returns an error...
        if (err) {

            //display it
            return res.status(500).json({
                message: err
            });
        }

        //using the encryption key above generate an encrypted pasword
        bcrypt.hash(req.body.password, salt, (err, hash) => {

            //if creating the ncrypted pasword returns an error..
            if (err) {

                //display it
                return res.status(500).json({
                    message: 'Encryption Error'
                });
            }

            let toUpdate = {};

            let updateableFields = ['name', 'email', 'username', 'password'];

            updateableFields.forEach(function (field) {
                if (field in req.body) {
                    if (field == "password") {
                        toUpdate[field] = hash;
                    } else {
                        toUpdate[field] = req.body[field];
                    }
                }
            });

            console.log(toUpdate);

            User
                .findByIdAndUpdate(req.params.id, {
                    $set: toUpdate
                }).exec().then(function () {
                    console.log(req.body.username);
                    return res.status(204).json({
                        message: req.body.username
                    });
                }).catch(function (err) {
                    return res.status(500).json({
                        message: 'Update Error'
                    });
                });
        });
    });
});

// DELETE ----------------------------------------
app.delete('/users/:id', function (req, res) {
    User
        .findByIdAndRemove(req.params.id).exec().then(function () {
            return res.status(204).end();
        }).catch(function (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        });
});
