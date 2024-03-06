import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { sharexDir, uploadsDir } from '../utils/constants';

const router = express.Router();

const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

let cachedFilenames: string[] = [];
let lastCachedTime: number = 0;
const cacheDuration = 60 * 60 * 1000;

async function cacheFilenames() {
  try {
    const dirPath = path.resolve(uploadsDir, sharexDir);
    const files = await readdirAsync(dirPath);

    // Filter out only files, not (sub-)directories
    const fileStats = await Promise.all(files.map((file: any) => statAsync(path.join(dirPath, file))));
    const fileNames = files.filter((_file: any, index: string | number) => fileStats[index].isFile());

    cachedFilenames = fileNames;
    lastCachedTime = Date.now();
  } catch (err:any) {
    console.error(err);
  }
}

cacheFilenames();

setInterval(cacheFilenames, cacheDuration);

router.get('/', async (_req: Request, res: Response) => {
  try {
    const cache = Date.now() - lastCachedTime > cacheDuration;
    if (cache) {
      console.log('Cache is outdated, refreshing...');
      await cacheFilenames();
    }

    const randomFilename = cachedFilenames[Math.floor(Math.random() * cachedFilenames.length)];
    const filePath = path.join(uploadsDir, sharexDir, randomFilename);

    return res.sendFile(filePath);
  } catch (err:any) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error', message: `${err.message}` });
  }
});

export default router;