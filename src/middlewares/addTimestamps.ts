import { Request, Response, NextFunction } from 'express';

export function addTimestamps(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;

  res.json = function (body) {
    const newBody = {
      ...body,
      timestamp: new Date().toISOString(),
    };
    return originalJson.call(this, newBody);
  };

  next();
}