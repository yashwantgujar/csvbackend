
import express from 'express';
import upload from '../Middleware/multer.middleware.js';
import { uploadCSV, getJobStatus,cancelJob ,downloadTemplate ,getMyJobs} from '../Controllers/csvController.js';
import { verifyToken } from '../Middleware/auth.js';
const router = express.Router();




router.post('/upload',verifyToken, upload.single('file'), uploadCSV);
router.get('/status/:id', verifyToken, getJobStatus);
router.delete('/cancel/:id', verifyToken, cancelJob); 
router.get('/my-jobs', verifyToken, getMyJobs);
router.get('/template',  downloadTemplate);
export default router;