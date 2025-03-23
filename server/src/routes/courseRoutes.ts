import express from "express";
import multer from "multer";
import { createCourse, deleteCourse, getCourse, listCourses, updateCourse } from "../controllers/courseController";
import { requireAuth } from "@clerk/express";
const router = express.Router();
const upload = multer({storage: multer.memoryStorage()}); // multer memory storage

// BASIC CRUD OPERATIONS

router.get("/", listCourses);
router.post("/", requireAuth(), createCourse);
router.get("/:courseId", getCourse);
router.get("/:courseId", requireAuth(), upload.single("image"), updateCourse);
router.delete("/:courseId", requireAuth(), deleteCourse);


export default router;