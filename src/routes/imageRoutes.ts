import express from 'express';
import { checkImageExists, resizeImage } from '../controllers/imageController';

const router = express.Router();

router.get('/:path([^\/]*)?/:imageName', checkImageExists, resizeImage);

export default router;