import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHnadler.js";
import { User } from "../models/User.js"
import { Course } from "../models/Course.js"
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import cloudinary from "cloudinary"
import getDataUri from '../utils/dataUri.js';
import { Stats } from "../models/Stats.js";
import crypto from "crypto";



// To register a new user
export const register = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const file = req.file;

    if (!name || !email || !password || !file) return next(new ErrorHandler("Please enter all fields", 400));

    let user = await User.findOne({ email });

    if (user) return next(new ErrorHandler("User Already Exist", 409));


    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    // Upload file on cloudinary;
    user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url
        },
    });

    sendToken(res, user, "Registered Successfully", 201);
});

// Login user
export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(new ErrorHandler("Please enter all fields", 400));

    const user = await User.findOne({ email }).select("+password");

    if (!user) return next(new ErrorHandler("Incorrect email or password", 401));

    const isMatch = await user.comparePassword(password);

    if (!isMatch) return next(new ErrorHandler("Incorrect email or password", 401))

    sendToken(res, user, `Welcome back ${user.name}`, 200);
});

// Logout user
export const logout = catchAsyncError(async (req, res, next) => {
    res.status(200).cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure:true,
        sameSite:"none"
    }).json({
        success: true,
        message: "User logged out successfully"
    })
})

// User profile 
export const getMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({
        success: true,
        user,
    })
})

// changepassword
export const changePassword = catchAsyncError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return next(new ErrorHandler("Please enter all field", 400));
  
    const user = await User.findById(req.user._id).select("+password");
  
    const isMatch = await user.comparePassword(oldPassword);
  
    if (!isMatch) return next(new ErrorHandler("Incorrect Old Password", 400));
  
    user.password = newPassword;
  
    await user.save();
  
    res.status(200).json({
      success: true,
      message: "Password Changed Successfully",
    });
  });

// updateProfile
export const updateProfile = catchAsyncError(async (req, res, next) => {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
        success: true,
        message: "profile updated successfully"
    });
});

// UpdateProfilePicture
export const UpdateProfilePicture = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);
    const file = req.file;
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar = {
        public_id: mycloud.public_id,
        url: mycloud.secure_url
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "profile picture updated successfully"
    });
});

// forgetpassword
export const forgetPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return next(new ErrorHandler("User not found", 400));

    const resetToken = await user.getResetToken();
    
    await user.save();

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `Click on the link to reset your password. ${url}. If you have not requested then please ignore.`;

    // Send token via email
    await sendEmail(user.email, "Rehaan Academy Reset Password", message);

    res.status(200).json({
        success: true,
        message: `Reset Token has been sent to ${user.email}`,
    });
});

// resettpassword
export const resettpassword = catchAsyncError(async (req, res, next) => {
    const {token} = req.params;

    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{
            $gt: Date.now(),
        }
    });

    if (!user) return next(new ErrorHandler("Token is invalid or has been expired",401));

    user.password = req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password changed successfully"
    });
});

// addtoplaylist
export const addToPlaylist = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    const course = await Course.findById(req.body.id);

    if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

    const itemExist = user.playlist.find((item) => {
        if (item.course.toString() === course._id.toString()) return true;
    })
    if (itemExist) return next(new ErrorHandler("Item Already Exists", 409));

    user.playlist.push({
        course: course._id,
        poster: course.poster.url
    });

    await user.save();

    res.status(200).json({
        success: true,
        message: "Added to playlist successfully"
    });
});

// removeFromPlaylist
export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    const course = await Course.findById(req.query.id);

    if (!course) return next(new ErrorHandler("Invalid Course Id", 404));

    const newPlaylist = user.playlist.filter((item) => {
        if (item.course.toString() !== course._id.toString()) return item;
    });
    user.playlist = newPlaylist;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Removed from playlist successfully"
    });
});

// getAllUsers
export const getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find({});

    res.status(200).json({
        success: true,
        users
    });
});

// update User Role
export const updateUserRole = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) return next(new ErrorHandler("User not found", 404));

    if (user.role === "user") user.role = "admin";
    else user.role = "user";

    await user.save();

    res.status(200).json({
        success: true,
        message: "Role Updated"
    });
});

// delete User 
export const deleteUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) return next(new ErrorHandler("User not found", 404));

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    // Cancel subscription

    await user.remove();

    res.status(200).json({
        success: true,
        message: "User Deleted Successfully"
    });
});

// delete My Profile 
export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    // Cancel subscription

    await user.remove();

    res
        .status(200)
        .cookie("token", null, {
            expires: new Date(Date.now()),
        })
        .json({
            success: true,
            message: "User Deleted Successfully"
        });
});


User.watch().on("change", async () => {
    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
  
    const subscription = await User.find({ "subscription.status": "active" });
    stats[0].users = await User.countDocuments();
    stats[0].subscriptions = subscription.length;
    stats[0].createdAt = new Date(Date.now());
  
    await stats[0].save();
  });
  
