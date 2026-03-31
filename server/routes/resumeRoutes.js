import { Router } from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";
import { uploadResume } from "../controllers/resumeController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-resume", verifyToken, upload.single("resume"), uploadResume);

export default router;
