import express from 'express';
import logger from '#config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '#routes/auth.routes.js';
import securityMiddleware from '#middleware/security.middleware.js';
import { use } from 'react';

const app = express();
app.use(helmet()); // this secure Express apps with various HTTP headers
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// It is uses to parse incoming request bodies in a middleware before your handlers, available under the req.body property.

app.use(cookieParser());

app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
// morgain is an HTTP request logger middleware for node.js.

app.use(securityMiddleware);


app.get('/', (req, res) => {
    logger.info('Hello From Acquisitions API');
    res.status(200).json({
        message: 'Acquisitions API is running',
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    }); 
})

app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'Acquisitions API is running',
    });
});

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes);

app.use((req, res) => {
    res.status(404).json({ error : 'ROUTE NOT FOUND'})
})

export default app;
