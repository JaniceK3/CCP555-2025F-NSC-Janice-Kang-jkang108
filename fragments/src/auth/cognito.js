// src/cognito.js
const BearerStrategy = require('passport-http-bearer').Strategy;
const { CognitoJwtVerifier } = require('aws-jwt-verify');
const logger = require('../logger');
const { authorize } = require('./auth-middleware');

const jwtVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_POOL_ID,
  clientId: process.env.AWS_COGNITO_CLIENT_ID,
  tokenUse: 'id', // lab expects the id_token; switch to 'access' if you prefer access tokens
});

logger.info('Configured to use AWS Cognito for Authorization');

jwtVerifier
  .hydrate()
  .then(() => logger.info('Cognito JWKS successfully cached'))
  .catch((err) => logger.error({ err }, 'Unable to cache Cognito JWKS'));

module.exports.strategy = () =>
  new BearerStrategy(async (token, done) => {
    try {
      const user = await jwtVerifier.verify(token);
      logger.debug({ user }, 'verified user token');
      done(null, user);
    } catch (err) {
      logger.error({ err }, 'could not verify token');
      done(null, false);
    }
  });

module.exports.authenticate = () => authorize('bearer');
