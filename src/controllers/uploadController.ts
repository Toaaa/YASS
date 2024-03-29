import { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import { sharexDir, domainUrl, secretKey, stringLength, stringCharacters, uploadsDir } from '../utils/constants';

const generateRandomString = (length: number) => {
  let result: string = '';
  const stringCharactersLength = stringCharacters.length;
  for (let i = 0; i < length; i++) {
    result += stringCharacters.charAt(Math.floor(Math.random() * stringCharactersLength));
  }
  return result;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(uploadsDir, sharexDir));
  },
  filename: (_req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const filename = generateRandomString(stringLength);
    cb(null, `${filename}${fileExtension}`);
  },
});

const upload = multer({ storage }).single('sharex');

export const handleUpload = (req: Request, res: Response): void => {
  upload(req, res, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: true, message: `Error uploading file: ${err.message}` });
    }

    const { secret } = req.body;
    if (!secret || secret !== secretKey) {
      return res.status(401).json({ error: true, message: 'Invalid Secret Key' });
    }

    if (!req.file) {
      return res.status(400).json({ error: true, message: 'No file uploaded' });
    }

    const fileUrl = `${domainUrl}${sharexDir}${req.file.filename}`;
    return res.send(fileUrl); // send the raw url
  });
};