const { Pool, Client } = require('pg');

const dbConfig = {
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    database: 'ecom',
    port: '5432', // e.g., 5432
};

const pool = new Pool(dbConfig);
const client = new Client(dbConfig);

module.exports = {
    query: (text, params, callback) => {
        const start = Date.now();
        return pool.query(text, params, (err, res) => {
            const duration = Date.now() - start;
            // ... (your existing code for query execution)
            callback(err, res);
        });
    },
    // ... (rest of your code)
    //the following code was included in the example code that I used to get this project working, but I do not currently make use of it [23.02.22]:
    getClient: (callback) => {
        pool.connect((err, client, done) => {
            const query = client.query;

            client.query = (...args) => {
                client.lastQuery = args;
                return query.apply(client, args);
            }

            const timeout = setTimeout(() => {
                console.error('A client has been checked out for more than 5 seconds!');
                console.error(`The last executed query on this client was ${client.lastQuery}`);
            }, 5000);

            const release = (err) => {
                done(err);
                clearTimeout(timeout);
                client.query = query;
            }

            callback(err, client, release);
        });
    }
};