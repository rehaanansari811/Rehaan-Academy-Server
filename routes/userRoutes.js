import express from 'express';
import { UpdateProfilePicture, addToPlaylist, changePassword, deleteMyProfile, deleteUser, forgetPassword, getAllUsers, getMyProfile, login, logout, register, removeFromPlaylist, resettpassword, updateProfile, updateUserRole } from '../controllers/userController.js';
import { authorizedAdmin, isAuthenticated } from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';

const router = express.Router();

// To register a new user
router.route("/register").post(singleUpload, register);

// Login user
router.route("/login").post(login);

// Logout user
router.route("/logout").get(logout);

// Get my profile and delete my profile
router.route("/myprofile").get(isAuthenticated, getMyProfile).delete(isAuthenticated, deleteMyProfile);

// Change Password
router.route("/changepassword").put(isAuthenticated, changePassword);

// Update Profile
router.route("/updateprofile").put(isAuthenticated, updateProfile);

// UpdateProfilePicture
router.route("/updateprofilepicture").put(isAuthenticated, singleUpload, UpdateProfilePicture);

// Forget Password
router.route("/forgetpassword").post(forgetPassword);

// ResetPassword
router.route("/resettpassword/:token").put(resettpassword);

// Add to Playlist
router.route("/addtoplaylist").post(isAuthenticated, addToPlaylist);

// Remove From Playlist
router.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist);


// ====== ADMIN Routes ======

// 1. get All Users
router.route("/admin/users").get(isAuthenticated, authorizedAdmin, getAllUsers);

// 2. update User Role
router.route("/admin/user/:id").put(isAuthenticated, authorizedAdmin, updateUserRole).delete(isAuthenticated, authorizedAdmin, deleteUser);









export default router;