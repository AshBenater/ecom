const db = require('../db');
const express = require('express');

const loginFailureRouter = express.Router();

loginFailureRouter.get('/', (req, res) => {
    res.render('loginFailure');
});

module.exports = loginFailureRouter;