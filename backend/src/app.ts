import express from 'express';
import indexRoutes from './routes/indexRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/api/index', indexRoutes);

app.use(errorHandler);

export default app;