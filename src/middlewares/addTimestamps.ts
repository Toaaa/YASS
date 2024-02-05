import { Request, Response, NextFunction } from 'express';

export function addTimestamps(req: Request, res: Response, next: NextFunction) {
  const json = res.json;

  res.json = function (body) {
    const _timestamp = new Date(
      new Date().getTime() + (1 * 60 * 60 * 1000)
    ); // Timezone offset for Europe/Berlin (UTC+1)

    const timestamp = {
      ...body,
      timestamp: _timestamp.toISOString(),
    };

    return json.call(this, timestamp);
  };

  next();
}