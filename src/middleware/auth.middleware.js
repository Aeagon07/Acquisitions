import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

const getBearerToken = req => {
  const authorization = req.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice(7).trim();
};

export const authenticateToken = (req, res, next) => {
  try {
    const token = cookies.get(req, 'token') || getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
    }

    req.user = jwttoken.verify(token);
    return next();
  } catch {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Your session is invalid or has expired',
    });
  }
};

export const requireRole = roles => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
    });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You do not have permission to access this resource',
    });
  }

  return next();
};
