const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jsonwt = require('jsonwebtoken');
const passport = require('passport');
const key = require('../../setup/urls');
const Person = require('../../models/Person');

const female = "https://www.freepngimg.com/thumb/female_centaur/4-2-female-centaur-free-png-image.png";


router.get('/', (req, res) => {
    res.json({test: "Auth is success"});
});

//@type POST
//@route /api/pauth/register/
//@dest route for register person
//@access PUBLIC

router.post('/register', (req, res) =>{
    Person.findOne({email: req.body.email})
    .then(person => {
        if(person){
            return res.status(400).json({emailerror: "Email is already registered."})
        } else {
            const newPerson = new Person({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                gender: req.body.gender
            });
            // changing profile picture dependency of gender
            if(newPerson.gender.toLowerCase() !== "male"){
                newPerson.profilepic = female;
            }
            // encrypting password
            bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newPerson.password, salt, (err, hash) => {
                    if(err) throw err;
                    newPerson.password = hash;
                    newPerson
                        .save()
                        .then(person => res.json(person))
                        .catch(err => console.log(err));
                });
            });
        }
    })
    .catch(err => console.log(err));
});

//@type POST
//@route /api/auth/login
//@dest route for login
//@access PUBLIC

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    Person.findOne({ email })
    .then(person => {
        if(!person){
            return res.status(404).json({emailerror: "User not found."});
        } 
            bcrypt.compare(password, person.password)
            .then(isCorrect => {
                if(isCorrect) {
                    // res.json({success: 'User is able to login successfuly'});
                    const payload = {
                        id: person.id,
                        name: person.name,
                        email: person.email
                    };

                    jsonwt.sign(
                        payload, 
                        key.secret,
                        {expiresIn: 3600},
                        (err, token) => {
                            res.json({
                                success: true,
                                token: "Bearer " + token
                            });
                        }
                    );

                } else {
                    res.status(400).json({passworderror: 'Password is not correct.'});
                }
            })
            .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

//@type GET
//@route /api/auth/profile
//@dest route for profile for person
//@access PRIVATE

router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res) =>{
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        profilepic: req.user.profilepic,
        gender: req.user.gender
    })
})


module.exports = router;