const request = require('supertest'); // Import SuperTest
const express = require('express');
const app = express();

// Import your registration route
const registrationRouter = require('../routes/registration');

// Add JSON parsing middleware
app.use(express.json());

// Use the registration route in your Express app
app.use('/api/registration', registrationRouter);

// Describe a test suite
describe('Registration Route', () => {
  it('should create a new customer profile', (done) => {
    // Define the registration data you want to send
    const registrationData = {
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe',
      password: 'securepassword',
      email: 'john@example.com',
      street_number: '123',
      street_name: 'Main St',
      town: 'Cityville',
      country: 'Country',
      postcode: '12345',
      customer_id: 1,
    };

    // Use SuperTest to send a POST request to your registration route
    request(app)
      .post('/api/registration')
      .set('Content-Type', 'application/json') // Set the content type to JSON
      .send(registrationData) // Send the correct registration data as JSON
      .expect(200) // Expected HTTP status code for a successful registration
      .end((err, res) => {
        if (err) return done(err);

        // Assert the response body or message
        const expectedResponse = 'Your customer profile has been created successfully.';
        if (res.text === expectedResponse) {
          done(); // Test passed
        } else {
          done(new Error('Unexpected response: ' + res.text));
        }
      });
  });

  // Add more test cases for different scenarios
});