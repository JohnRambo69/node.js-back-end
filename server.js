const express = require('express');
const bodyParser = require('body-parser');
//const passport = require('passport-jwt');
const mongoose = require('mongoose');

// const bcrypt = require('bcrypt');
// const jsonwebtoken = require('jsonwebtoken');

const port = process.env.PORT || 3000

//all routes
const auth = require('./routes/api/auth');
const profiles = require('./routes/api/profiles');
const questions = require('./routes/api/questions');
const passport = require('passport');

// mongo config
const db = require('./setup/urls').mongoUrl;
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.log(err));

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//passport middleware
app.use(passport.initialize());
// config for jwt strategy
require('./strategies/jsonjwtstrategy')(passport);





app.get('/', (req, res) => {
    res.send('Im live !!!');
});

app.use('/api/auth', auth);
app.use('/api/profiles', profiles);
app.use('/api/questions', questions);






app.listen(port, () => {
    console.log(`Server listening at port : ${port}`);
})