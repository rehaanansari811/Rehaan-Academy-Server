import express from 'express';
import { addLecture, createCourse, deleteCourse, deleteLecture, getAllCourses, getCourseLecture } from '../controllers/courseController.js';
import singleUpload from '../middlewares/multer.js';
import { authorizedAdmin, authorizedSubscribers, isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

// Get all courses without lectures
router.route("/courses").get(getAllCourses)

// Create new courses - only admin
router.route("/createCourse").post(isAuthenticated, authorizedAdmin, singleUpload, createCourse)

// Get Course Details, Add lectures, Delete Course
router.route("/course/:id")
    .get(isAuthenticated,authorizedSubscribers, getCourseLecture)
    .post(isAuthenticated, authorizedAdmin, singleUpload, addLecture)
    .delete(isAuthenticated, authorizedAdmin, deleteCourse);


// Delete Lecture
router.route("/lecture")
    .delete(isAuthenticated, authorizedAdmin, deleteLecture);

export default router;