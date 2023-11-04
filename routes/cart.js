const db = require('../db');
const express = require('express');

const cartRouter = express.Router();

//returns the contents of the current customer's shopping cart
cartRouter.get('/:customerId', (req, res, next) => {
    const customer_id = req.params.customerId;
    db.query('SELECT * FROM cart WHERE customer_id = $1', [customer_id], (err, result) => {
        if(err) {
            return next(err); //in the case of an error, invoke the error-handling middleware
        } else if(result.rows.length === 0) { //if there is nothing in the customer's cart...
            return next(new Error('Your shopping cart is empty.')); //...invoke the error-handling middleware with a message to this effect
        } else {
            res.status(200).send(result.rows); //otherwise, send the contents of the cart back to the customer
        }
    });
});

//add a product to the current customer's shopping cart
cartRouter.post('/:customerId', (req, res, next) => {
    const customer_id = req.params.customerId;
    const { product_id, product_quantity }  = req.body;
    db.query('INSERT INTO cart (product_id, product_name, product_description, product_image_url, product_price, product_quantity, cumulative_product_price, customer_id) ' +
        'VALUES ($1, (SELECT item_name FROM products WHERE id = $1), (SELECT item_description FROM products WHERE id = $1), (SELECT image_url FROM products WHERE id = $1), (SELECT price FROM products WHERE id = $1), $2, ((SELECT price FROM products WHERE id = $1) * $2), $3)',
         [product_id, product_quantity, customer_id],
        (err, result) => {
        if(err) {
            return next(err); //in the case of an error, invoke the error-handling middleware
        } else {
            db.query('WITH updated_cart_total AS (SELECT SUM(cumulative_product_price) AS new_cart_total FROM cart WHERE customer_id = $1) UPDATE cart SET cart_total = updated_cart_total.new_cart_total FROM updated_cart_total WHERE customer_id = $1', [customer_id],
                (err, result) => {
                if(err) {
                    return next(err);
                } else {
                    res.status(200).send(`${product_quantity} product(s) with id ${product_id} added to cart.`);
                }
            });
        }
    });
});

//update the quantity of a particular item in the current customer's shopping cart, as well as the cumulative_product_price and cart_total fields
cartRouter.put('/:customerId', (req, res, next) => {
    const customer_id = req.params.customerId;
    const { product_id, product_quantity } = req.body;
    db.query('UPDATE cart SET product_quantity = $1, cumulative_product_price = ($1 * (SELECT price FROM products WHERE id = $2)) WHERE product_id = $2 AND customer_id = $3', [product_quantity, product_id, customer_id],
        (err, result) => {
        if(err) {
            return next(err);
        } else {
            db.query('WITH updated_cart_total AS (SELECT SUM(cumulative_product_price) AS new_cart_total FROM cart WHERE customer_id = $1) UPDATE cart SET cart_total = updated_cart_total.new_cart_total FROM updated_cart_total WHERE customer_id = $1', [customer_id],
                (err, result) => {
                    if(err) {
                    return next(err);
                } else {
                    res.status(200).send(`Quantity (${product_quantity}) of product with id ${product_id} updated successfully.`);
                }
            });
        }
    });
});

//delete an item from the current customer's shopping cart, and update the cart total:
cartRouter.delete('/:customerId/:productId', (req, res, next) => {
    const customer_id = req.params.customerId;
    const product_id = req.params.productId;
    db.query('DELETE FROM cart WHERE customer_id = $1 AND product_id = $2', [customer_id, product_id],
        (err, result) => {
        if(err) {
            return next(err);
        } else {
            db.query('WITH updated_cart_total AS (SELECT SUM(cumulative_product_price) AS new_cart_total FROM cart WHERE customer_id = $1) UPDATE cart SET cart_total = updated_cart_total.new_cart_total FROM updated_cart_total WHERE customer_id = $1', [customer_id],
                (err, result) => {
                if(err) {
                    return next(err);
                } else {
                    res.status(200).send(`Product with id ${product_id} removed from your cart.`);
                }
            });
        }
    });
});

//when the customer has completed their transaction...
cartRouter.post('/:customerId/checkoutComplete', (req, res, next) => {
    const customer_id = req.params.customerId;
    db.query('SELECT * FROM cart WHERE customer_id = $1', [customer_id], //select everything from the customer's cart...
        (err, result) => {
        if(err) {
            return next(err);
        } else if(result.rows.length === 0) {
            res.status(404).send('Your cart is empty so there is nothing to process!'); //if there is nothing in the customer's cart, inform them of that fact
        } else {
            let cartDetails = [];
            for(let index = 0, length = result.rows.length; index < length; index++) {
                cartDetails[index] = {};
                for(let property in result.rows[index]) {
                    cartDetails[index][property] = result.rows[index][property];
                }
            }
            db.query('INSERT INTO orders (id, cart, date_of_purchase, customer_id) VALUES ((SELECT GREATEST(0, (SELECT MAX(id) FROM orders))) + 1, $1, (SELECT CURRENT_TIMESTAMP(2)), $2)', [cartDetails, customer_id], //...insert the customer's cart details and the date of purchase into the 'Orders' table...
                (err, result) => {
                if(err) {
                    return next(err);
                } else {
                    db.query('DELETE FROM cart WHERE customer_id = $1', [customer_id],//...delete the cart associated with this customer
                        (err, result) => {
                        if(err) {
                            return next(err);
                        }
                        else {
                            res.status(200).send('Your transaction has been added to your order history and your cart has been cleared. We hope you enjoy your purchase!'); //...and send an informative message back to the customer
                        }
                    });
                }
            });
        }
    });
});

module.exports = cartRouter;