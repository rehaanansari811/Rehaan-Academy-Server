import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Stats } from "../models/Stats.js";
import ErrorHandler from "../utils/errorHnadler.js";
import { sendEmail } from "../utils/sendEmail.js"


export const contact = catchAsyncError(async (req, res, next) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) return next(new ErrorHandler("All fields are mandatory", 400))

    const to = process.env.MY_MAIL;
    const subject = "Contact from Rehaan Codes";
    const text = `I am ${name} and my Email is ${email}. \n${message}`;

    await sendEmail(to, subject, text);

    res.status(200).json({
        success: true,
        message: "Your message was sent successfully"
    })
})

export const courseRequest = catchAsyncError(async (req, res, next) => {

    const { name, email, course } = req.body;
    if (!name || !email || !course) return next(new ErrorHandler("All fields are mandatory", 400))

    const to = process.env.MY_MAIL;
    const subject = "Requesting for a course to Rehaan Codes";
    const text = `I am ${name} and my Email is ${email}. \n${course}`;

    await sendEmail(to, subject, text);

    res.status(200).json({
        success: true,
        message: "Your request was sent successfully"
    })
})

export const getDashboardStats = catchAsyncError(async (req, res, next) => {

    const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(12);

    const statsData = [];

    for (let i = 0; i < stats.length; i++) {
        statsData.unshift(stats[i]);
    }

    const requiredSize = 12 - stats.length;

    for (let i = 0; i < requiredSize; i++) {
        statsData.unshift({
            users: 0,
            subscriptions: 0,
            views: 0
        });
    }

    const userCount = statsData[11].users;
    const subscriptionCount = statsData[11].subscriptions;
    const viewsCount = statsData[11].views;

    let usersPercentage = 0,
        viewsPercentage = 0,
        subscriptionPercentage = 0;

    let usersProfit = true,
        viewsProfit = true,
        subscriptionProfit = true;

    if (statsData[10].users === 0) usersPercentage = userCount * 100;
    if (statsData[10].views === 0) viewsPercentage = viewsCount * 100;
    if (statsData[10].subscriptions === 0) subscriptionPercentage = subscriptionCount * 100;
    else {
        const difference = {
            users: statsData[11].users - statsData[10].users,
            views: statsData[11].views - statsData[10].views,
            subscriptions: statsData[11].subscriptions - statsData[10].subscriptions,
        }

        usersPercentage = (difference.users / statsData[10].users) * 100;
        viewsPercentage = (difference.views / statsData[10].views) * 100;
        subscriptionPercentage = (difference.subscriptions / statsData[10].subscriptions) * 100;

        if (usersPercentage < 0) usersProfit = false;
        if (viewsPercentage < 0) viewsProfit = false;
        if (subscriptionPercentage < 0) subscriptionProfit = false;

    }
    
    res.status(200).json({
        success: true,
        stats: statsData,
        userCount,
        subscriptionCount,
        viewsCount,
        subscriptionPercentage,
        usersPercentage,
        viewsPercentage,
        subscriptionProfit,
        usersProfit,
        viewsProfit
    })
})