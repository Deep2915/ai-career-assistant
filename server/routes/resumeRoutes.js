import { Router } from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";
import { uploadResume, getResumeURL } from "../controllers/resumeController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload-resume", verifyToken, upload.single("resume"), uploadResume);
router.get("/resume-file/:conversationId", verifyToken, getResumeURL);

export default router;
