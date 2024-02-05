import { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { sharexDir, domainUrl, secretKey, stringLength, stringCharacters, uploadsDir } from '../utils/constants';

const generateRandomString = (length: number) => {
  let result = '';
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
      return res.status(500).json({ error: `Error uploading file: ${err}` });
    }

    const { secret } = req.body;
    if (!secret || secret !== secretKey) {
      return res.status(403).json({ error: 'Invalid Secret Key' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `${domainUrl}${sharexDir}${req.file.filename}`;

    const textFilePath = path.resolve(uploadsDir, sharexDir, 'uploads-i.txt');
    fs.appendFile(textFilePath, `${req.file.filename}.png\n`, (appendErr) => {
      if (appendErr) {
        console.error(appendErr);
        return res.status(500).json({ error: 'Error updating text file', message: appendErr.message });
      }
      return res.send(fileUrl); // send the raw url
    });
  });
};