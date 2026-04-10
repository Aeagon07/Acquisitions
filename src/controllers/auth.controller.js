import { formatValidationErrors } from "#utils/format.js";
import logger from '#config/logger.js';
import { signInSchema, signUpSchema } from "../validations/auth.validation.js";
import { authenticateUser, createUser } from "#services/auth.service.js";
import { jwttoken } from "#utils/jwt.js";
import { cookies } from "#utils/cookies.js";


export const signup = async (req, res, next) => {
    try{
        const validationResult = signUpSchema.safeParse(req.body);

        if(!validationResult.success){
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationErrors(validationResult.error)
            });
        }

        const { name, email, password, role } = validationResult.data;

        // Auth Service
        const user = await createUser({ name, email, password, role });
        
        const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role })
        cookies.set(res, 'token', token);

        logger.info(`User registered with email: ${email}`);
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id, name: user.name, email: user.email, role: user.role
            }
        })
    }catch(e){
        logger.error('Error in signup controller', e);

        if(e.message === 'User Alredy Exists' || e.message === 'User Already Exists!'){
            return res.status(409).json({
                error: 'User already exists',
            });
        }

        return res.status(500).json({
            error: 'Internal server error',
        });
    }
}

export const signin = async (req, res, next) => {
    try{
        const validationResult = signInSchema.safeParse(req.body);

        if(!validationResult.success){
            return res.status(400).json({
                error: 'Validation failed',
                details: formatValidationErrors(validationResult.error)
            });
        }

        const { email, password } = validationResult.data;
        const user = await authenticateUser(email, password);

        const token = jwttoken.sign({ id: user.id, email: user.email, role: user.role });
        cookies.set(res, 'token', token);

        logger.info(`User signed in with email: ${email}`);
        return res.status(200).json({
            message: 'User signed in successfully',
            user: {
                id: user.id, name: user.name, email: user.email, role: user.role
            }
        });
    }catch(e){
        logger.error('Error in signin controller', e);

        if(e.message === 'User Not Found!' || e.message === 'Invalid Credentials!'){
            return res.status(401).json({
                error: 'Invalid email or password',
            });
        }

        return res.status(500).json({
            error: 'Internal server error',
        });
    }
}

export const signout = async (req, res, next) => {
    try{
        cookies.clear(res, 'token');
        logger.info('User signed out successfully');

        return res.status(200).json({
            message: 'User signed out successfully',
        });
    }catch(e){
        logger.error('Error in signout controller', e);

        return res.status(500).json({
            error: 'Internal server error',
        });
    }
}
