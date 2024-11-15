/**
 * Author: Professor Krasso
 * Date: 10 September 2024
 * File: index.spec.js
 * Description: Test the customer feedback API
 */

// Require the modules
const request = require('supertest');
const app = require('../../../../src/app');
const { mongo } = require('../../../../src/utils/mongo');

jest.mock('../../../../src/utils/mongo');

// Test the customer feedback API
describe('Apre Customer Feedback API', () => {
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the channel-rating-by-month endpoint
  it('should fetch average customer feedback ratings by channel for a specified month', async () => {
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              channels: ['Email', 'Phone'],
              ratingAvg: [4.5, 3.8]
            }
          ])
        })
      };
      await callback(db);
    });

    const response = await request(app).get('/api/reports/customer-feedback/channel-rating-by-month?month=1'); // Send a GET request to the channel-rating-by-month endpoint

    // Expect a 200 status code
    expect(response.status).toBe(200);

    // Expect the response body to match the expected data
    expect(response.body).toEqual([
      {
        channels: ['Email', 'Phone'],
        ratingAvg: [4.5, 3.8]
      }
    ]);
  });

  // Test the channel-rating-by-month endpoint with missing parameters
  it('should return 400 if the month parameter is missing', async () => {
    const response = await request(app).get('/api/reports/customer-feedback/channel-rating-by-month'); // Send a GET request to the channel-rating-by-month endpoint with missing month
    expect(response.status).toBe(400); // Expect a 400 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'month and channel are required',
      status: 400,
      type: 'error'
    });
  });

  // Test the channel-rating-by-month endpoint with an invalid month
  it('should return 404 for an invalid endpoint', async () => {
    // Send a GET request to an invalid endpoint
    const response = await request(app).get('/api/reports/customer-feedback/invalid-endpoint');
    expect(response.status).toBe(404); // Expect a 404 status code

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });
});

// Test suite for the customer feedback by salesperson endpoint
describe('Apre Customer Feedback by Salesperson API', () => {
  // Clear our mock before each test
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the /api/reports/customer-feedback/feedback-by-salesperson endpoint to return a 404 if the endpoint is invalid
  it('should return a 404 for an invalid endpoint', async() => {
    // Send a GET request to the misspelled endpoint
    const response = await request(app).get('/api/reports/customer-feedback/feedback-by-salespersony');

    // Expect to receive a status code of 404
    expect(response.status).toBe(404);

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });

  // Test the /api/reports/customer-feedback/feedback-by-salesperson endpoint to return a 200 and no data for an invalid salesperson
  it('should return a 200 status code and no data for an invalid salesperson', async() => {
    // Create a mock of the database
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([])
        })
      };
      await callback(db);
    });

    // Send a GET request to the /api/reports/customer-feedback/feedback-by-salesperson/:personName endpoint using the value of Invalid Name
    const response = await request(app).get('/api/reports/customer-feedback/feedback-by-salesperson/Invalid Name');

    // Expect the status code to be 200
    expect(response.status).toBe(200);
    // Expect the response to be an empty array
    expect(response.body).toEqual([]);
  });

  // Test te /api/reports/customer-feedback/feedback-by-salesperson endpoint to return a 200 and data for a salesperson
  it('should return a 200 status code and performance data for a valid salesperson name', async() => {
    // Create a mock of the request and return data
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([
            {
              "channelName": "Online",
              "totalSales": 1,
              "averageRating": 3
            },
            {
              "channelName": "Retail",
              "totalSales": 2,
              "averageRating": 4
            }
          ])
        })
      };
      await callback(db);
    });

    // Send a GET request to the /api/reports/customer-feedback/feedback-by-salesperson/:personName endpoint using the value of Roger Rabbit
    const response = await request(app).get('/api/reports/customer-feedback/feedback-by-salesperson/Roger Rabbit');

    // Expect the status code to be 200
    expect(response.status).toBe(200);
    // Expect the response to be an empty array
    expect(response.body).toEqual([
      {
        "channelName": "Online",
        "totalSales": 1,
        "averageRating": 3
      },
      {
        "channelName": "Retail",
        "totalSales": 2,
        "averageRating": 4
      }
    ]);
  });
});

// Test suite for the sales report API to fetch an array of distinct salesperson from the customerFeedback collection
describe('Apre Sales Report API - Salespeople', () => {
  // Clear our mock before each test
  beforeEach(() => {
    mongo.mockClear();
  });

  // Test the customer-feedback/salespeople endpoint to return a 404 if the endpoint is invalid
  it('should return a 404 for an invalid endpoint', async() => {
    // Send a GET request to the misspelled endpoint
    const response = await request(app).get('/api/reports/customer-feedback/salespeopled');

    // Expect to receive a status code of 404
    expect(response.status).toBe(404);

    // Expect the response body to match the expected data
    expect(response.body).toEqual({
      message: 'Not Found',
      status: 404,
      type: 'error'
    });
  });

  // Test the customer-feedback/salespeople endpoint to return an array of distinct salesperson
  it('should fetch a list of distinct salesperson', async () => {
    // Create a mock of the request and return data
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue(['James Brown', 'John Doe', 'Emily Davis', 'Jane Smith'])
      };
      await callback(db);
    });

    // Send a GET request to the customer-feedback/salespeople endpoint
    const response = await request(app).get('/api/reports/customer-feedback/salespeople');

    // Expect the status code to be 200
    expect(response.status).toBe(200);
    // Expect the response body to match the expected data
    expect(response.body).toEqual(['James Brown', 'John Doe', 'Emily Davis', 'Jane Smith']);
  });

  // Test the customer-feedback/salespeople endpoint with no salesperson found
  it('should return 200 with an empty array if no salesperson is found', async () => {
    // Create a mock of the request and return data
    mongo.mockImplementation(async (callback) => {
      const db = {
        collection: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockResolvedValue([])
      };
      await callback(db);
    });

    // Send a GET request to the customer-feedback/salespeople endpoint
    const response = await request(app).get('/api/reports/customer-feedback/salespeople');

    // Expect the status code to be 200
    expect(response.status).toBe(200);
    // Expect the response to be an empty array
    expect(response.body).toEqual([]);
  });
});