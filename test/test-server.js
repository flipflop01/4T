const {
    app,
    runServer,
    closeServer
} = require('../server');

var chai = require('chai');

var chaiHttp = require('chai-http');

var user = require('../models/user.js');

var should = chai.should();

chai.use(chaiHttp);

describe('Fullstack-Capstone', function () {
    it('create a new user on POST', function () {
        chai.request(app)
            .post('/users/create')
            .send({
                name: "Liam Tanelli",
                email: "liamt@gmail.com",
                username: "user1",
                password: "pass1"
            })
            .then(function (err, res) {
                //should.equal(err, null);
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                done();
            })
            .catch(err => console.log({
                err
            }));
    });
    it('Should Update User Details', function () {
        chai.request(app)
            .put('/users/:id')
            .then(function (res) {
                res.should.have.status(201);
                done();
            })
            .catch(err => console.log({
                err
            }));
    });
    it('Should Delete a User', function () {

        chai.request(app)
            .delete('/user/:id')
            .then(function (res) {
                res.should.have.status(201);
                done();
            })
            .catch(err => console.log({
                err
            }));

    });
    it('Should Get Users Details', function () {

        chai.request(app)
            .get('/users/:username')
            .then(function (res) {
                res.should.have.status(201);
                done();
            })
            .catch(err => console.log({
                err
            }));
    });

});
