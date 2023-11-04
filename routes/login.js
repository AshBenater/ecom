const db = require('../db');
const express = require('express');

const loginRouter = express.Router();

//configure and register the LocalStrategy for passport authentication:
const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

let USERNAME; //declare two variables that will be passed
let USER_ID; //to the 'loggedIn' view upon successful authentication

passport.use(new LocalStrategy(function verify(username, password, cb) {
    db.query('SELECT * FROM Customers WHERE username = $1', [username], function(err, user) {
        if(err) {
            return cb(err);
        }
        if(user.rowCount === 0) { //if the query was unsuccessful
            return cb(null, false, { failureMessage: 'Incorrect username or password.' }); //invoke 'cb' with the appropriate failure parameters
        }

        USERNAME = username; //define the value of the 'USERNAME' variable
        USER_ID = user.rows[0]['id']; //define the value of the 'USER_ID' variable

        crypto.pbkdf2(password, '0', 310000, 32, 'sha256', function(err, hashedPassword) {
            if(err) {
                return cb(err);
            }
            if(password === user.rows[0]['password']) { //if the user-provided password is equal to the password returned from the query...
                return cb(null, user); //...continue with successful authentication
            } else {
                return cb(null, false, { failureMessage: 'Incorrect username or password.' }); //otherwise, continue with the unsuccessful authentication flow
            }
        });
    });
}));

//render the 'login' view when the user navigates to the login page
loginRouter.get('/', (req, res) => {
    res.status(200).render('login');
});

//either render the 'loggedIn' page or redirect to the 'loginFailure' page based on whether the user's login was successful
loginRouter.post('/authenticated', passport.authenticate('local', {
    failureRedirect: `../loginFailure`
}), (req, res) => {
    res.status(200).render('loggedIn', { USERNAME, USER_ID }); //pass the 'USERNAME' and 'USER_ID' variables to the 'loggedIn' view so they can be used in database queries (eg. to look up the order history of the logged-in customer)
});

//allow the user to logout; when the user logs out they are redirected to the login screen
loginRouter.post('/authenticated/logout', (req, res) => {
    res.redirect('../../login');
});

module.exports = loginRouter;