const db = require('../db');
const express = require('express');

const addressesRouter = express.Router();

// read all customers' addresses
addressesRouter.get('/', (req, res, next) => {
    db.query('SELECT * FROM addresses ORDER BY id', null, (err, result) => {
        if (err) {
            return next(err);
        } else {
            res.status(200).send(result.rows);
        }
    });
});

// read a particular customer's address(es)
addressesRouter.get('/:customerId', (req, res, next) => {
    const customer_id = req.params.customerId;
    db.query('SELECT * FROM addresses WHERE customer_id = $1', [customer_id], (err, result) => {
        if (err) {
            return next(err);
        } else if (result.rows.length === 0) {
            return next(new Error('No address is associated with this customer id.'));
        } else {
            res.send(result.rows);
        }
    });
});

// update a particular address for a particular customer
addressesRouter.put('/:customerId/:addressId', (req, res, next) => {
    const address_id = req.params.addressId;
    const customer_id = req.params.customerId;
    const { street_number, street_name, town, country, postcode } = req.body;

    console.log('customerId:', customer_id); // Debugging
    console.log('addressId:', address_id); // Debugging

    // First, check if the address to be updated exists.
    db.query('SELECT * FROM addresses WHERE id = $1 AND customer_id = $2', [address_id, customer_id], (selectErr, selectResult) => {
        if (selectErr) {
            console.log('Database Error:', selectErr); // Debugging
            return next(selectErr);
        } else if (selectResult.rows.length === 0) {
            console.log('No Address Found'); // Debugging
            return next(new Error('No address is associated with this customer id.'));
        } else {
            // The address exists, proceed with the update.
            db.query('UPDATE addresses SET street_number = $1, street_name = $2, town = $3, country = $4, postcode = $5 WHERE customer_id = $6 AND id = $7',
                [street_number, street_name, town, country, postcode, customer_id, address_id],
                (updateErr, result) => {
                    if (updateErr) {
                        console.log('Database Error:', updateErr); // Debugging
                        return next(updateErr);
                    } else {
                        const rowsAffected = result.rowCount;
                        if (rowsAffected === 0) {
                            console.log('No Rows Updated'); // Debugging: Log that no rows were updated.
                            return next(new Error('This address is not associated with this customer id.'));
                        } else {
                            console.log(`Update Successful - ${rowsAffected} rows updated`); // Debugging: Log that the update was successful.
                            res.status(200).send('Your address has been updated successfully.');
                        }
                    }
                });
        }
    });
});


module.exports = addressesRouter;
