import { Request, Response } from "express";
import fs, { ReadStream, createReadStream, statSync } from "fs";
import sharp, { Sharp } from "sharp";
import path from "path";
import { domainUrl, uploadsDir } from "../utils/constants";
import formatBytes from "../utils/formatBytes";
import formatTime from "../utils/formatTime";

export const checkImageExists = (
  req: Request,
  res: Response,
  next: Function
) => {
  let { path: imagePath, imageName } = req.params;

  if (!imagePath || imagePath.trim() === "") {
    imagePath = "";
    return res.status(400).json({
      error: true,
      status: "Bad Request",
      message: "No image file specified",
    });
  }

  const requestedPath = path.join(uploadsDir, imagePath, imageName);
  let errorPath = requestedPath.replace(/.*\/uploads/, "");

  if (!fs.existsSync(requestedPath)) {
    return res
      .status(404)
      .json({ error: true, status: "Image not found", path: `${errorPath}` });
  }
  next();
};

export const resizeImage = async (
  req: Request,
  res: Response,
  next: Function
) => {
  const { r, a, b } = req.query;
  let { path: imagePath, imageName } = req.params;

  imagePath ? imagePath : (imagePath = "");

  const requestedPath = path.join(uploadsDir, imagePath, imageName);
  let errorPath = requestedPath.replace(/.*\/uploads/, "");

  if (typeof requestedPath !== "string") {
    return res
      .status(404)
      .json({ error: true, status: "Invalid path", path: `${errorPath}` });
  }

  let image: Sharp & { width?: number; height?: number } = sharp(requestedPath);

  if (r && typeof r === "string") {
    const [widthStr, heightStr] = r.split("x");
    const width = parseInt(widthStr, 10);
    const height = parseInt(heightStr, 10);

    if (!isNaN(width) && !isNaN(height)) {
      const aspect = a && (a === "fill" || a === "fit") ? a : "fit";

      if (aspect === "fit") {
        image = image.resize(width, height, { fit: "inside" });
      } else if (aspect === "fill") {
        image = image.resize(width, height, { fit: "cover" });
      }
    } else {
      return res.status(400).json({
        error: true,
        status: "Bad Request",
        message: "Invalid width or height",
      });
    }
  }

  if (b && typeof b === "string") {
    try {
      const blur = parseFloat(b.valueOf());
      image = image.blur(blur);
    } catch (err: any) {
      return res.status(400).json({
        error: true,
        status: "Bad Request",
        message:
          "Invalid blur value. Blur value must be a number between 0.3 and 1000.",
        blur: `${b}`,
      });
    }
  }

  try {
    const format = path.extname(imageName).slice(1).toLowerCase();

    if (format === "gif") {
      res.set("Content-Type", "image/gif");
      const stream: ReadStream = createReadStream(requestedPath);
      stream.pipe(res);
    } else {
      const imageBuffer = await image.toBuffer();
      res.set("Content-Type", `image/${format}`);
      res.send(imageBuffer);
    }
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      status: "Internal Server Error",
      message: `${err.message}`,
    });
  }
};

export const getImageInfo = async (req: Request, res: Response) => {
  let { path: imagePath, imageName } = req.params;

  const requestedPath = path.join(uploadsDir, imagePath, imageName);
  const perma_link = path.join(
    domainUrl,
    requestedPath.replace(/.*\/uploads/, "")
  );

  try {
    const stats = statSync(requestedPath);

    const imageInfo = await sharp(requestedPath).metadata();

    const file = path.basename(requestedPath);
    const file_name = path.parse(path.basename(requestedPath)).name;
    const file_format = path.extname(requestedPath).slice(1).toLowerCase();
    const file_size = formatBytes(stats.size);
    const upload_date = formatTime(stats.birthtime);
    const upload_timestamp = new Date(
      stats.birthtime.getTime() + 1 * 60 * 60 * 1000
    ); // Timezone offset for Europe/Berlin (UTC+1)

    const { width: file_width, height: file_height } = imageInfo;

    res.status(200).json({
      file,
      file_name,
      file_format,
      file_size,
      file_resolution: `${file_width}x${file_height}`,
      file_width,
      file_height,
      upload_date,
      upload_timestamp,
      perma_link,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: true,
      status: "Internal Server Error",
      message: `${err.message}`,
    });
  }
};
