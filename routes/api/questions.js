const express = require('express');
const router = express.Router();
const moongose = require('mongoose');
const passport = require('passport');


const Person = require('../../models/Person');
const Profile = require('../../models/Profile');
const Question = require('../../models/Question');



router.get('/showall', (req, res) => {
    Question.find()
    .sort({date: 'desc'})
    .then(questions => {
        res.json(questions);
    })
    .catch(err => res.json({questionerror: "No questions to display."}));
});

//@type POST
//@route /api/questions/
//@dest route post question
//@access PRIVATE
router.post('/', passport.authenticate('jwt', {session: false}), (req,res) =>{
    const newQuestion = new Question({
        user: req.user.id,
        textone: req.body.textone,
        texttwo: req.body.texttwo,
        name: req.body.name
    })

    newQuestion.save()
    .then(question => {
        res.json(question);
    })
    .catch(err => console.log("Unable t0 push question " + err));

});

//@type POST
//@route /api/questions/answer/:id
//@dest route post answer
//@access PRIVATE
router.post('/answer/:id', passport.authenticate('jwt', {session: false}), (req,res) =>{
    Question.findById(req.params.id)
    .then(question => {
        const addAnswer = {
            name: req.body.name,
            text: req.body.text
        }
        question.answers.unshift(addAnswer);

        question.save()
        .then( res.json(addAnswer))
        .catch(err => console.log(err));
    })
    .catch(err => res.json({answererror: "Question not found"}));
});

//@type POST
//@route /api/questions/upvote/:id
//@dest route to upvote answer
//@access PRIVATE
router.post('/upvote/:id', passport.authenticate('jwt', {session: false}), (req,res) =>{
    Profile.findOne({user: req.user.id})
    .then(profile => {
        Question.findById(req.params.id).then(question => {
            if(question.upvotes.filter(upvote => upvote.user.toString() ===
             req.user.id.toString()).length > 0) {
                 return res.status(400).json({noupvote: "User arleady voted"})
             }
             question.upvotes.unshift({user: req.user.id});
             question.save()
             .then(question => {
                 const totalUpvotes = question.upvotes.length;
                 res.json({totalupvotes: totalUpvotes});
             })
             .catch(err => console.log(err));
            
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));

   
 

});




module.exports = router;