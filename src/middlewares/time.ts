import { Request, Response, NextFunction } from 'express';

export const getTime = (req: Request, res: Response, next: NextFunction) => {
  const currentTimestamp = new Date().toISOString();
  const unixTime = Math.floor(Date.now() / 1000);

  res.status(200).json({ timestamp: currentTimestamp, timestamp_unix: unixTime });
};