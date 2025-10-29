import express from 'express';
import cors from 'cors';
import indexRoutes from './routes/indexRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors(
    {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Forum API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/index', indexRoutes);
app.use('/api/markets', marketRoutes);

app.use(errorHandler);

export default app;