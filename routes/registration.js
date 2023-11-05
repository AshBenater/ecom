const db = require('../db');
const express = require('express');

const registrationRouter = express.Router();

registrationRouter.post('/', (req, res, next) => {
    const {
        first_name,
        last_name,
        username,
        password,
        email,
        street_number,
        street_name,
        town,
        country,
        postcode,
    } = req.body;

    db.query(
        `
        WITH customer_insert AS (
            INSERT INTO customers (first_name, last_name, username, password, email)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        ),
        address_insert AS (
            INSERT INTO addresses (street_number, street_name, town, country, postcode, customer_id)
            VALUES ($6, $7, $8, $9, $10, (SELECT id FROM customer_insert))
        )
        SELECT 1;
        `,
        [
            first_name,
            last_name,
            username,
            password,
            email,
            street_number,
            street_name,
            town,
            country,
            postcode,
        ],
        (err, result) => {
            if (err) {
                return next(err);
            } else {
                res.send('Your customer profile has been created successfully.');
            }
        }
    );
});

module.exports = registrationRouter;
