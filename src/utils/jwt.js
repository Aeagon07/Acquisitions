import jwt from 'jsonwebtoken';
import logger from '#config/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = '1h'; // Token expires in 1 hour

export const jwttoken = {
    sign: (payload) => {
        try{
            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        }catch(error){
            logger.error('Failed to Authenticate User', error);
            throw new Error('Failed to Authenticate User');
        }
    },

    verify: (token) => {
        try{
            return jwt.verify(token, JWT_SECRET);

        }catch(e){
            logger.error('Failed to Authenticate User', e);
            throw new Error('Failed to Authenticate User');
        }
    }
}
