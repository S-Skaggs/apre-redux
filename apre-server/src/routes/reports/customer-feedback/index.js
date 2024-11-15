/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre customer feedback API for the customer feedback reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');
const { error } = require('ajv/dist/vocabularies/applicator/dependencies');

const router = express.Router();

/**
 * @description
 *
 * GET /channel-rating-by-month
 *
 * Fetches average customer feedback ratings by channel for a specified month.
 *
 * Example:
 * fetch('/channel-rating-by-month?month=1')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/channel-rating-by-month', (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month) {
      return next(createError(400, 'month and channel are required'));
    }

    mongo (async db => {
      const data = await db.collection('customerFeedback').aggregate([
        {
          $addFields: {
            date: { $toDate: '$date' }
          }
        },
        {
          $group: {
            _id: {
              channel: "$channel",
              month: { $month: "$date" },
            },
            ratingAvg: { $avg: '$rating'}
          }
        },
        {
          $match: {
            '_id.month': Number(month)
          }
        },
        {
          $group: {
            _id: '$_id.channel',
            ratingAvg: { $push: '$ratingAvg' }
          }
        },
        {
          $project: {
            _id: 0,
            channel: '$_id',
            ratingAvg: 1
          }
        },
        {
          $group: {
            _id: null,
            channels: { $push: '$channel' },
            ratingAvg: { $push: '$ratingAvg' }
          }
        },
        {
          $project: {
            _id: 0,
            channels: 1,
            ratingAvg: 1
          }
        }
      ]).toArray();

      res.send(data);
    }, next);

  } catch (err) {
    console.error('Error in /rating-by-date-range-and-channel', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /feedback-by-salesperson/:salesperson
 *
 * Fetches the total sales, average rating, and channel for a given salesperson
 *
 * Example:
 * fetch('/feedback-by-salesperson/John Doe')
 * .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/feedback-by-salesperson/:salesperson', (req, res, next) => {
  // Surround our api in a try-catch for safety
  try {
    // Query our database
    mongo (async db => {
      const feedbackForSalesPerson = await db.collection('customerFeedback').aggregate([
        // Match on the provided salesperson
        {
          $match: {
            salesperson: req.params.salesperson,
          }
        },
        // Group our data
        {
          $group: {
            _id: {
              channel: '$channel',
            },
            totalSales: { $sum: 1 },
            averageRating: { $avg: '$rating' }
          }
        },
        // Create an object to project the required fields
        {
          $project: {
            _id: 0,
            channelName: '$_id.channel',
            totalSales: 1,
            averageRating: 1
          }
        }
      ]).toArray();

      console.log(feedbackForSalesPerson);
      // Send our results to the response
      res.send(feedbackForSalesPerson);
    }, next);
  } catch (err) {
    console.error('Error in /feedback-by-salesperson', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /salespeople
 *
 * Fetches a list of distinct salesperson from the customerFeedback collection
 *
 * Example:
 * fetch('/salespeople')
 *  .then(response => response.json())
 *  .then(data => console.log(data))
 */
router.get('/salespeople', (req, res, next) => {
  // Surround our query in a try-catch for added safety
  try {
    mongo (async db => {
      // Query our database for an array of distinct salesperson
      const salespeople = await db.collection('customerFeedback').distinct('salesperson');

      // Send our results to the response
      res.send(salespeople);
    }, next);
  } catch (err) {
    // Log the error
    console.error('Error getting distinct salesperson', err);
    // Pass our error object to the next middleware
    next(err);
  }
});

module.exports = router;