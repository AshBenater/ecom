const db = require('../db');
const express = require('express');

const addressesRouter = express.Router();

//read all customers' addresses:
addressesRouter.get('/', (req, res, next) => {
    db.query('SELECT * FROM addresses ORDER BY id', null, (err, result) => {
        if(err) {
            return next(err);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

//read a particular customer's address(es):
addressesRouter.get('/:customerId', (req, res, next) => {
    const customer_id = req.params.customerId;
    db.query('SELECT * FROM addresses WHERE customer_id = $1', [customer_id],
        (err, result) => {
        if(err) {
            return next(err);
        } else if(result.rows.length === 0 ) { //if there is no address in the database for the specified customer...
            return next(new Error('No address is associated with this customer id.')); //...invoke the error-handling middleware with a message to this effect
        }
        else {
            res.send(result.rows);
        }
    });
});

//update a particular address for a particular customer (a rich customer might have more than one address, so the address id is required):
addressesRouter.put('/:customerId/:addressId', (req, res, next) => {
    const address_id = req.params.addressId;
    const customer_id = req.params.customerId;
    const { street_number, street_name, town, country, postcode } = req.body;
    db.query('UPDATE addresses SET street_number = $1, street_name = $2, town = $3, country = $4, postcode = $5 WHERE customer_id = $6 AND id = $7',
        [street_number, street_name, town, country, postcode, customer_id, address_id],
        (err, result) => {
        if(err) {
            return next(err);
        } else if(result.rows.length === 0) { //if this address is not associated with this customer in the database...
            return next(new Error('This address is not associated with this customer id.')); //...invoke the error-handling middleware with a message to this effect
        }
        else {
            res.status(200).send('Your address has been updated successfully.');
        }
    });
});

module.exports = addressesRouter;