const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt;
const key = require('../setup/urls.js').secret;
const mongoose = require('mongoose');
const Person = mongoose.model('myPerson');

var opts = {}


opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = key;

module.exports = passport =>  { 
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        Person.findById(jwt_payload.id)
        .then(person => {
            if(person) {
                return done(null, person);
            }
            return done(null, false);
        })
        .catch(err => console.log(err));
    }));

    }
