import logger from "#config/logger.js";
import bcrypt from 'bcrypt';
import { db } from "#config/database.js";
import { users } from "#models/user.model.js";
import { eq } from 'drizzle-orm';


export const hashPassword = async (password) => {
    try{
        return await bcrypt.hash(password, 10);
        // 10 => it is number of rounds for hashing the password!
    }catch(e){
        logger.error(`Error Hashing Password: ${e}`);
        throw new Error('Invalid Password !');
    }
}

export const authenticateUser = async (email, password) => {
    try{
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if(!user) throw new Error('User Not Found!');

        const isPasswordValid = await comparePassword(password, user.password);

        if(!isPasswordValid) throw new Error('Invalid Credentials!');

        return user;
    }catch(e){
        logger.error(`Error Authenticating User: ${e}`);
        throw e;
    }
}

export const comparePassword = async (password, hashedPassword) => {
    try{
        return await bcrypt.compare(password, hashedPassword);
    }catch(e){
        logger.error(`Error Comparing Password: ${e}`);
        throw new Error('Invalid Password !');
    }
}

export const createUser = async ({name, email, password, role='user' }) => {
    try{
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if(existingUser.length > 0) throw new Error('User Already Exists!');

        const password_hash = await hashPassword(password);

        const [newUser] = await db
            .insert(users)
            .values({ name, email, password: password_hash, role})
            .returning({ id: users.id, name: users.name, email: users.email, role: users.role, created_at: users.created_at });
        
        logger.info(`User ${newUser.email} created successfully`);
        return newUser;
    }catch(e){
        logger.error(`Error Creating User: ${e}`);
        throw e;
    }
}
