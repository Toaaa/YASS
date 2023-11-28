import { Request, Response } from 'express';
import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import { uploadsDir } from '../utils/constants';

export const checkImageExists = (req: Request, res: Response, next: Function) => {
  let { path: imagePath, imageName } = req.params;
  if (!imagePath) {
    imagePath = '';
  }

  const requestedPath = path.join(uploadsDir, imagePath, imageName);
  let errorPath = requestedPath.replace(/.*\/uploads/, '');

  if (!fs.existsSync(requestedPath)) {
    return res.status(404).json({ error: true, status: 'Image not found', path: `${errorPath}` });
  }
  next();
};

export const resizeImage = async (req: Request, res: Response, next: Function) => {
  const { r, a } = req.query;
  let { path: imagePath, imageName } = req.params;

  if (!imagePath) {
    imagePath = '';
  }

  const requestedPath = path.join(uploadsDir, imagePath, imageName);
  let errorPath = requestedPath.replace(/.*\/uploads/, '');

  if (typeof requestedPath !== 'string') {
    return res.status(404).json({ error: true, status: 'Invalid path', path: `${errorPath}` });
  }

  let image = sharp(requestedPath);

  if (r && typeof r === 'string') {
    const [width, height] = r.split('x').map(Number);
    const aspect = a && (a === 'fill' || a === 'fit') ? a : 'fit';

    if (aspect === 'fit') {
      image = image.resize(width, height, { fit: 'inside' });
    } else if (aspect === 'fill') {
      image = image.resize(width, height, { fit: 'cover' });
    }
  }

  try {
    const imageBuffer = await image.toBuffer();
    const format = path.extname(imageName).slice(1).toLowerCase();

    res.set('Content-Type', `image/${format}`);
    res.send(imageBuffer);
  } catch (err) {
    res.status(500).json({ error: true, status: 'Internal Server Error imageController.ts', message: `${err}` });
  }
};
