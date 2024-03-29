import express from 'express';
import { handleUpload } from '../controllers/uploadController';

const router = express.Router();

router.get('/', (_req, res) => {
  res.redirect('/');
});

router.post('/', handleUpload);

export default router;