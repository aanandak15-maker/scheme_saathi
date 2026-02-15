
import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Required for Twilio form-encoded webhooks

import apiRoutes from './routes/api';

// Routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Scheme Saathi Backend is running!' });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
