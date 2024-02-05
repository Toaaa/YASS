import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { sharexDir, uploadsDir } from '../utils/constants';

const router = express.Router();

const readFileAsync = promisify(fs.readFile);

let cachedFilenames: string[] = [];
let lastCachedTime: number = 0;
const cacheDuration = 60 * 60 * 1000;

async function cacheFilenames() {
  try {
    const textFilePath = path.resolve(uploadsDir, sharexDir, 'uploads-i.txt');
    const data = await readFileAsync(textFilePath, 'utf8');
    cachedFilenames = data.split('\n').filter(Boolean);
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