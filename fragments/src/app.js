// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const passport = require('passport');
const authenticate = require('./auth');

const { createErrorResponse } = require('./response');

const logger = require('./logger');
const pino = require('pino-http')({ logger });

const app = express();

// Logging
app.use(pino);

// Security & basics
app.use(helmet());
app.use(cors());
app.use(compression());

// Auth
passport.use(authenticate.strategy());
app.use(passport.initialize());

// Routes
app.use('/', require('./routes'));

// 404 handler (use helper)
app.use((req, res) => {
  res.status(404).json(createErrorResponse(404, 'not found'));
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'unable to process request';

  if (status > 499) {
    logger.error({ err }, 'Error processing request');
  }

  res.status(status).json(createErrorResponse(status, message));
});

module.exports = app;
