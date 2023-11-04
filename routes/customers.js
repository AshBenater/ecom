const db = require('../db');
const express = require('express');

const customersRouter = express.Router();

//read all customers' details:
customersRouter.get('/', (req, res, next) => {
    db.query('SELECT * FROM customers ORDER BY id', null, (err, result) => {
        if(err) {
            return next(err);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

//read a specific customer's details:
customersRouter.get('/:id', (req, res, next) => {
    const id = req.params.id;
    db.query('SELECT * FROM customers WHERE id = $1', [id], (err, result) => {
        if(err) {
            return next(err);
        } else if(result.rows.length === 0) { //if no customer with the specified 'id' is found in the database...
            return next(new Error(`Customer does not exist in the database.`)); //...invoke the error-handling middleware to display this fact to the user
        }
        res.status(200).send(result.rows[0]);
    });
});

//update a specific customer's details:
customersRouter.put('/:id', (req, res, next) => {
    const id = req.params.id;
    const { first_name, last_name, username, password, email } = req.body;
    db.query('UPDATE customers SET first_name = $1, last_name = $2, username = $3, password = $4, email = $5 WHERE id = $6',
        [first_name, last_name, username, password, email, id],
        (err, result) => {
        if(err) {
            return next(err);
        } else if(result.rows.length === 0) { //if no customer with the specified 'id' is found in the database...
            return next(new Error('Customer does not exist in the database.')); //...invoke the error-handling middleware to display this fact to the user
        }
        res.status(200).send(`Customer with id ${id} updated successfully.`);
    });
});

//delete a specific customer's details:
customersRouter.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    db.query('DELETE FROM customers WHERE id = $1',
        [id],
        (err, result) => {
        if(err) {
            return next(err);
        } else {
            res.status(200).send(`Customer with id ${id} deleted successfully.`);
        }
    });
});

module.exports = customersRouter;