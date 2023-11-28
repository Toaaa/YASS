import express, { Express, Request, Response, NextFunction } from 'express';
import { PORT } from './utils/constants';
import uploadRoutes from './routes/uploadRoutes';
import imageRoutes from './routes/imageRoutes';
import { addTimestamps } from './middlewares/addTimestamps';
import { getMetrics } from './middlewares/metrics';
import { getTime } from './middlewares/time';

const app: Express = express();

// Apply middleware
app.use(express.json()); // Parse JSON requests
app.use(addTimestamps); // Use time middleware

// Use the metrics middleware for the /metrics endpoint
app.get('/metrics', getMetrics);

// Use the time middleware for the /time endpoint
app.get('/time', getTime);

// Mount the routes
app.use('/upload', uploadRoutes);
app.use('/', imageRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: true, status: 'Internal Server Error', message: `${err}` });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
