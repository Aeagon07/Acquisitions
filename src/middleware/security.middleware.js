import aj from '#config/arcjet.js';
import { slidingWindow } from '@arcjet/node';
import logger from '#config/logger.js';

const securityMiddleware = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'test' || !process.env.ARCJET_KEY) {
      return next();
    }

    const role = req.user?.role || 'guest';

    let limit;

    switch (role) {
      case 'admin':
        limit = 20;
        break;
      case 'user':
        limit = 10;
        break;
      case 'guest':
      default:
        limit = 5;
        break;
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `Rate Limit for ${role}`,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot request blocked', {
        ip: req.ip,
        userAgetnt: req.get('User-Agent'),
        path: req.path,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Automated requests are not allowed',
      });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield Blocked request', {
        ip: req.ip,
        userAgetnt: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Request blocked by security policy',
      });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate Limit Exceeded', {
        ip: req.ip,
        userAgetnt: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });

      return res
        .status(403)
        .json({ error: 'Forbidden', message: 'Request limit exceeded' });
    }

    return next();
  } catch (e) {
    console.error('Arcjet Middleware Error:', e);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong with the security middleware',
    });
  }
};

export default securityMiddleware;
