import express from 'express';
import { checkImageExists, resizeImage, getImageInfo } from '../controllers/imageController';

const router = express.Router();

router.get('/:path([^\/]*)?/:imageName/info', checkImageExists, getImageInfo);
router.get('/:path([^\/]*)?/:imageName', checkImageExists, resizeImage);

export default router;