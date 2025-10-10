// fragments/src/auth/auth-middleware.js
const passport = require('passport');
const hash = require('../hash');
const { createErrorResponse } = require('../response');

const extractIdentity = (user) => {
  if (!user) {
    return undefined;
  }

  if (typeof user === 'string') {
    return user;
  }

  return (
    user.email ||
    user.username ||
    user['cognito:username'] ||
    user.sub ||
    user.id ||
    undefined
  );
};

function authorize(strategy) {
  return (req, res, next) =>
    passport.authenticate(strategy, { session: false }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json(createErrorResponse(401, 'unauthorized'));
      }

      const identity = extractIdentity(user);
      if (!identity) {
        return res.status(401).json(createErrorResponse(401, 'unauthorized'));
      }

      const normalized = identity.trim().toLowerCase();
      const ownerId = hash(normalized);

      req.user = {
        email: normalized,
        ownerId,
        raw: user,
      };
      req.ownerId = ownerId;

      return next();
    })(req, res, next);
}

module.exports = { authorize };
