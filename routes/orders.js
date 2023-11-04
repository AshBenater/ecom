const db = require('../db');
const express = require('express');

const ordersRouter = express.Router();

ordersRouter.get('/:customerId', (req, res, next) => {
    const customer_id = req.params.customerId;
    db.query('SELECT id AS order_id, date_of_purchase, cart FROM orders WHERE customer_id = $1 ORDER BY 2 DESC', [customer_id],
        (err, result) => {
        if(err) {
            return next(err);
        } else if(result.rows.length === 0) { //if no orders belonging to the specified customer were found in the database...
            return next(new Error('No orders belonging to the specified customer were found in the database.')); //invoke the error-handling middleware with a message to this effect
        }
        else {
            /* shows how the information can be extracted from the 'result' object; something similar to these examples can occur on the front-end to display the information via JSON.parse:
            console.log('result.rows.length: ' + result.rows.length); //logs the number of result rows
            for(let index = 0; index < result.rows.length; index++) { //for as long as there are result rows...
                console.log('========================================================================================================');
                console.log('Order id: ' + result.rows[index].order_id); //...log the order_id
                console.log('Date of purchase: ' + result.rows[index].date_of_purchase); //...log the date_of_purchase
                console.log('Transaction details: ' + result.rows[index].cart); //log an overview of the 'cart' field
                let distinctProductsInCart = result.rows[index].cart.length; //ascertain the number of items in the 'cart' field of this particular record row
                console.log('Number of distinct products in cart: ' + distinctProductsInCart); //logs the number of distinct products that are detailed in the 'cart' field of this particular row
                for(let innerIndex = 0; innerIndex < distinctProductsInCart; innerIndex++) { //for as long as there are distinct products in this row's 'cart' field...
                    console.log('Product id: ' + result.rows[index].cart[innerIndex].product_id); //log the product_id
                    console.log('Customer id: ' + result.rows[index].cart[innerIndex].customer_id); //log the customer_id
                    console.log('Product Name: ' + result.rows[index].cart[innerIndex].product_name); //log the product_name
                    console.log('Product Description: ' + result.rows[index].cart[innerIndex].product_description); //log the product_description
                    console.log('Product Image URL: ' + result.rows[index].cart[innerIndex].product_image_url); //log the product_image_url
                    console.log('Product Price: ' + result.rows[index].cart[innerIndex].product_price); //log the product price
                    console.log('Product Quantity: ' + result.rows[index].cart[innerIndex].product_quantity); //log the product_quantity
                    console.log('Cumulative Product Price: ' + result.rows[index].cart[innerIndex].cumulative_product_price); //log the cumulative_product_price
                    console.log('Cart Total: ' + result.rows[index].cart[innerIndex].cart_total); //log the cart_total
                }
                console.log('-----------------------------------------------------------------------------------------------------------');
            } */
            res.status(200).send(result.rows);
        }
    });
});

//return the details of a specific order for a particular customer:
ordersRouter.get('/:customerId/:orderId', (req, res, next) => {
    const customer_id = req.params.customerId;
    const order_id = req.params.orderId;
    db.query('SELECT id AS order_id, date_of_purchase, cart FROM orders WHERE id = $1 AND customer_id = $2', [order_id, customer_id],
        (err, result) => {
        if(err) {
            return next(err);
        } else if(result.rows.length === 0) { //if no association of the specified customerId and orderId exists in the database...
            return next(new Error('No association of the specified customer ID and order ID exists in the database.')); //...invoke the error-handling middleware with a message to this effect
        } else {
            res.status(200).send(result.rows);
        }
    });
});

module.exports = ordersRouter;