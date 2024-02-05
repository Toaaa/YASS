import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { sharexDir, uploadsDir } from '../utils/constants';
import writeToLog from '../utils/writeToLog';

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
    const fileStats = await Promise.all(files.map(file => statAsync(path.join(dirPath, file))));
    const fileNames = files.filter((file, index) => fileStats[index].isFile());

    cachedFilenames = fileNames;
    lastCachedTime = Date.now();
  } catch (err:any) {
    console.error(err);
  }
}

cacheFilenames();

setInterval(cacheFilenames, cacheDuration);

router.get('/', (_req: Request, res: Response) => {
  try {
    const cache = Date.now() - lastCachedTime > cacheDuration;
    if (cache) {
      cacheFilenames();
    } else {
    }

    const randomFilename = cachedFilenames[Math.floor(Math.random() * cachedFilenames.length)];

    return res.redirect(`/i/${randomFilename}`);
  } catch (err:any) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error', message: `${err.message}` });
  }
});

export default router;