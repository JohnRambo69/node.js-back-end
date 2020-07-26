const express = require('express');
const router = express.Router();
const moongose = require('mongoose');
const passport = require('passport');

const Person = require('../../models/Person');
const Profile = require('../../models/Profile');


//@type GET
//@route /api/profiles/
//@dest route for personal  user profile
//@access PRIVATE
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
    .then(profile =>{
        if(!profile){
            return res.status(404).json({profilenotfound: 'No profile found'});
        }
        res.json(profile);
    }
    )
    .catch(err => console.log(err));
});

//@type POST
//@route /api/profiles/
//@dest route for updating/saving  user profile
//@access PRIVATE

router.post('/', passport.authenticate('jwt', {session: false}), (req,res) =>{
    const profileValues = {};
    profileValues.user = req.user.id;
    if(req.body.username) profileValues.username = req.body.username;
    if(req.body.website) profileValues.website = req.body.website;
    if(req.body.country) profileValues.country = req.body.country;
    if(req.body.portfolio) profileValues.portfolio = req.body.portfolio;
    if(typeof req.body.languages !== undefined) {
        profileValues.languages = req.body.languages.split(",");
    }

    //get social links
    profileValues.social = {};
    if(req.body.youtube) profileValues.social.youtube = req.body.youtube;
    if(req.body.facebook) profileValues.social.facebook = req.body.facebook;
    if(req.body.instagram) profileValues.social.instagram = req.body.instagram;


    //database
    Profile.findOne({user: req.user.id})
    .then(profile =>{
        if(profile){
            Profile.findOneAndUpdate(
                {user: req.user.id},
                {$set: profileValues },
                {new: true}
            ).
            then(profile => res.json(profile)).
            catch(err => console.log("problem with update " + err))
        } else {
            Profile.findOne({username: profileValues.username})
            .then(profile =>{
                // user already exist
                    if(profile){
                        res.status(400).json({username: 'Username already exist'});
                    }

                    //create new profile
                    new Profile(profileValues)
                    .save()
                    .then(profile => {
                        res.json(profile);
                    })
                    .catch(err => console.log(err));

            })
            .catch(err => console.log("User already exist" + err));
        }
    })
    .catch(err => console.log("Problem with fetching profile" + err));

});

//@type GET
//@route /api/profiles/:username
//@dest route for getting  user profile based on username
//@access PUBLIC

router.get('/:username', (req, res) => {
    Profile.findOne({username: req.params.username})
    .populate("user", ["name", "profilepic"])
    .then(profile =>{
        if(profile){
            res.json(profile);
        } else {
            res.send(404).json({finderror: "Profile not found"});
        }
    })
    .catch(err => console.log(err))
});


//@type GET
//@route /api/profiles/all
//@dest route for getting  all users profile based on username
//@access PUBLIC
router.get('/find/all', (req, res) => {
    Profile.find()
    .populate("user", ["name", "profilepic"])
    .then(profiles => {
        if(profiles){
            res.json(profiles);
        } else {
            res.json({finderror: "No profiles found"});
        }
    })
    .catch(err => console.log(err));
});

//@type DELETE
//@route /api/profiles/
//@dest route for delete users profile based on id
//@access PRIVATE
router.delete('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    // Profile.findOne({user: req.user.id}).then().catch()
    Profile.findOneAndRemove({user: req.user.id})
    .then( () => {
        Person.findByIdAndRemove({_id : req.user.id})
        .then(() => res.json({success: 'delete was success'}))
        .catch(err => HTMLFormControlsCollection.log(err))
    })
    .catch(err => console.log(err));
});

//@type POST
//@route /api/profiles/workrole
//@dest route for adding work profile for person
//@access PRIVATE
router.post('/workrole',  passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
    .then(profile => {
        if(profile) {
            const newWork = {
                role: req.body.role,
                company: req.body.company,
                country: req.body.country,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                details: req.body.details
            };
            profile.workrole.unshift(newWork);
            profile.save()
            .then( profile => {
                res.json(profile);
            })
            .catch(err => console.log(error));

        } else {
            res.send(404).json({profileerror: "profile not found"});
        }
    })
    .catch(err => console.log(err))
});

//@type DELETE
//@route /api/profiles/workrole/
//@dest route for delete work profile for person
//@access PRIVATE
router.delete('/workrole/:id',passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
    .then(profile => {
        if(profile){
            const removeThis = profile.workrole
            .map(item => item.id)
            .indexOf(req.params.id);

            profile.workrole.splice(removeThis, 1);

            profile.save()
            .then( profile => {
                res.json(profile);
            })
            .catch(err => console.log(err));

        } else {
            return res.status(404);
        }
    })
    .catch(err => console.log(err));
})

module.exports = router;