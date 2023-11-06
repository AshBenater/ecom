const db = require('../db/index.js');

const express = require('express');
const productsRouter = express.Router();

//reads all products
productsRouter.get('/', (req, res, next) => {
    db.query('SELECT * FROM products ORDER BY id', null, (err, result) => {
        if(err) {
            return next(err);
        }
        res.send(result.rows); //sends an array of JSON responses that contain 'id', 'item_name', 'item_description', 'image_url', and 'price' details for all the individual products
    });
});

//reads a specific product
productsRouter.get('/:id', (req, res, next) => {
     db.query(`SELECT * FROM products WHERE id = $1`, [req.params.id],(err, result) => {
        if(err) {
            return next(err);
        } else if(result.rows.length === 0) { //if no product with the specified ID is found in the database...
            return next(new Error('No product with the specified ID found in the database.')); //...invoke the error-handling middleware with a message to this effect
        }
        res.send(result.rows[0]); //sends a JSON response that contains 'id', 'item_name', 'item_description', 'image_url', and 'price' details for the selected id
    });
});

//creates a product
productsRouter.post('/', (req, res, next) => {
    const { item_name, item_description, image_url, price } = req.body;
    db.query('INSERT INTO products (id, item_name, item_description, image_url, price ) ' +
                  'VALUES ((SELECT GREATEST(0, (SELECT MAX(id) FROM products))) + 1, $1, $2, $3, $4)',
                    [item_name, item_description, image_url, price],
        (err, result) => {
            if(err) {
                return next(err);
            } else {
                res.status(200).send('Product created successfully.');
            }
        });
});

// Update a product
productsRouter.put('/:id', (req, res, next) => {
    const { item_name, item_description, image_url, price } = req.body;
    const id = req.params.id;

    // First, check if the product to be updated exists.
    db.query('SELECT * FROM products WHERE id = $1', [id], (selectErr, selectResult) => {
        if (selectErr) {
            console.log('Database Error (Select):', selectErr); // Debugging
            return next(selectErr);
        } else if (selectResult.rows.length === 0) {
            console.log('No Product Found'); // Debugging
            return next(new Error('No product with the specified ID found in the database.'));
        } else {
            // The product exists, proceed with the update.
            db.query('UPDATE products SET item_name = $1, item_description = $2, image_url = $3, price = $4 WHERE id = $5',
                [item_name, item_description, image_url, price, id],
                (updateErr, result) => {
                    if (updateErr) {
                        console.log('Database Error (Update):', updateErr); // Debugging
                        return next(updateErr);
                    } else {
                        const rowsAffected = result.rowCount;
                        if (rowsAffected === 0) {
                            console.log('No Rows Updated'); // Debugging: Log that no rows were updated.
                            return next(new Error('No product with the specified ID found in the database.'));
                        } else {
                            console.log(`Update Successful - ${rowsAffected} rows updated`); // Debugging: Log that the update was successful.
                            res.status(200).send(`Product with id ${id} modified successfully.`);
                        }
                    }
                });
        }
    });
});


//deletes a specific product
productsRouter.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    db.query('DELETE FROM products WHERE id = $1', [id], (err, result) => {
        if(err) {
            return next(err);
        } else {
            res.status(200).send(`Product with id ${id} deleted.`);
        }
    });
});

module.exports = productsRouter;