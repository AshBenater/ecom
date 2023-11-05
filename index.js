const express = require('express');
const session = require('express-session');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json'); /* ... */
const morgan = require('morgan');
const bodyParser = require('body-parser');
const db = require('./db/index.js');
const engine = require('express-handlebars'); //use the 'express-handlebars' package to render views
const path = require('path');
const port = 3000; // You can change the port if needed

const productsRouter = require('./routes/products');
const customersRouter = require('./routes/customers');
const registrationRouter = require('./routes/registration');
const loginRouter = require('./routes/login');
const loginFailureRouter = require('./routes/loginFailure');
const cartRouter = require('./routes/cart');
const ordersRouter = require('./routes/orders');
const addressesRouter = require('./routes/addresses');
const supertest = require('supertest');

// Configure express-session
app.use(session({
    secret: 'aR@nD0m$3cR3tK3yF0rMyApp', // You should set a secret key for session data
    resave: false,
    saveUninitialized: true,
  }));


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//configure the Handlebars view engine
app.engine('handlebars', engine.engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Body-parsing Middleware
app.use(bodyParser.json());

// Support encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Logging Middleware
if (!process.env.IS_TEST_ENV) {
    app.use(morgan('dev'));
}

// Serve static content in the production environment
if(process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "views")));
}

//render the homepage view when the app is loaded
app.get('/', (req, res) => {
    res.render('home');
});

//use 'loginRouter' at the '/login' route
app.use('/login', loginRouter);

//use 'loginFailureRouter' at the '/loginFailure' route
app.use('/loginFailure', loginFailureRouter);

//use 'productsRouter' at the '/api/products' route
app.use('/api/products', productsRouter);

//use 'customersRouter' at the '/api/customers' route
app.use('/api/customers', customersRouter);

//use 'registrationRouter' at the '/api/registration' route
app.use('/api/registration', registrationRouter);

//use 'cartRouter' at the '/api/cart' route
app.use('/api/cart', cartRouter);

//use 'ordersRouter' at the '/api/orders' route
app.use('/api/orders', ordersRouter);

//use 'addressesRouter' at the '/api/addresses' route
app.use('/api/addresses', addressesRouter);

// error handling:
app.use((err, req, res, next) => {
    switch(err.message) {
        case 'Customer does not exist in the database.':
            res.status(404).send(err.message);
            break;
        case 'No address is associated with this customer id.':
            res.status(404).send(err.message);
            break;
        case 'This address is not associated with this customer id.':
            res.status(404).send(err.message);
            break;
        case 'No orders belonging to the specified customer were found in the database.':
            res.status(404).send(err.message);
            break;
        case 'No association of the specified customer ID and order ID exists in the database.':
            res.status(404).send(err.message);
            break;
        case 'No product with the specified ID found in the database.':
            res.status(404).send(err.message);
            break;
        case 'duplicate key value violates unique constraint "customers_username_key"':
            res.status(500).send('The username you have selected is already in use. Please choose a different username.');
            break;
        case 'duplicate key value violates unique constraint "customers_password_key"':
            res.status(500).send('The password you have selected is already in use. Please choose a different password.');
            break;
        case 'duplicate key value violates unique constraint "customers_email_unique"':
            res.status(500).send('The email address you have selected is already in use. Please choose a different email address.');
            break;
        case 'duplicate key value violates unique constraint "products_image_url_key"':
            res.status(409).send('Product creation did not succeed because the image URL is already in use.');
            break;
        case 'Your shopping cart is empty.':
            res.status(404).send(err.message);
            break;
        case 'insert or update on table "cart" violates foreign key constraint "cart_customer_id_fkey"':
            res.status(400).send('There is no record of a customer with the specified \'customerId\' in the database.');
            break;
        case 'null value in column "product_name" of relation "cart" violates not-null constraint':
            res.status(404).send('There is no record of a product with the specified \'productId\' in the database.');
            break;
        default:
            res.status(500).send(err.message);
    }
});


app.get('/', (req, res) => {
  res.send('Hello, Express!'); // Respond with a simple message
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



  
