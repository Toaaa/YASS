import express, { Express, Request, Response, NextFunction } from 'express';
import { PORT, uploadsDir, sharexDir } from './utils/constants';
import { addTimestamps } from './middlewares/addTimestamps';
import { getMetrics } from './middlewares/metrics';
import { getTime } from './middlewares/time';
import uploadRoutes from './routes/uploadRoutes';
import imageRoutes from './routes/imageRoutes';
import randomRoutes from './routes/randomRoutes';
import fs from 'fs';
import path from 'path';

const app: Express = express();

const setupFolders = () => {
  const fullUploadsDir = path.join(uploadsDir, sharexDir);

  if (!fs.existsSync(fullUploadsDir)) {
    fs.mkdirSync(fullUploadsDir, { recursive: true });
    console.log(`Created folder structure: ${fullUploadsDir}`);
  }
};

setupFolders();

app.use(express.json());
app.use(addTimestamps);

app.get('/metrics', getMetrics);

app.get('/time', getTime);

app.use('/random', randomRoutes)

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === '/') {
    res.redirect(307, 'https://github.com/Toaaa/YASS');
  } else {
    next();
  }
});

app.use('/upload', uploadRoutes);
app.use('/', imageRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: true, status: 'Internal Server Error', message: `${err.message}` });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
