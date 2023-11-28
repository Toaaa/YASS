import express, { Express, Request, Response, NextFunction } from 'express';
import { PORT, uploadsDir, sharexDir } from './utils/constants';
import { addTimestamps } from './middlewares/addTimestamps';
import { getMetrics } from './middlewares/metrics';
import { getTime } from './middlewares/time';
import uploadRoutes from './routes/uploadRoutes';
import imageRoutes from './routes/imageRoutes';
import fs from 'fs';
import path from 'path';

const app: Express = express();

// Function to check and create the folder structure
const setupFolders = () => {
  const fullUploadsDir = path.join(uploadsDir, sharexDir);

  // Check if the directory exists, if not, create it
  if (!fs.existsSync(fullUploadsDir)) {
    fs.mkdirSync(fullUploadsDir, { recursive: true });
    console.log(`Created folder structure: ${fullUploadsDir}`);
  }
};

// Call the setup function
setupFolders();

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
