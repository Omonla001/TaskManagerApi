const express = require('express');
const User = require('../Model/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();


router.get('/', (req, res)=>{
    res.status(201).send('This is the user route')
});

// USER REGISTRATION
router.post('/register', async(req, res)=> {
    const {name, email, password} = req.body;
    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ error: 'Email is already in use' });
        }

        // Create and save the new user
        const user = new User({name, email, password });
        await user.save();
        res.status(201).send({ user, message: 'User created successfully' });
    } catch (err) {
        res.status(400).send(err);
        console.log('Error' + err);
    }
});

// USER LOGIN
// router.post('/login', async(req, res)=> {
//     try{
//         const {email, password} = req.body;
        
//         // Validating the User Email
//         const user = await User.findOne({email});
        
//         if(!user){
//             throw new Error('Email or password is incorrect provide a valid details');
//         }
        
//         // Validating User password
//         const isMatch = await bcrypt.compare(password, user.password);

//         if(!isMatch){
//             throw new Error('Email or password is incorrect provide a valid details');
//         }
//         const token =jwt.sign({
//             _id: user._id.toString()
//         }, process.env.JWT_KEY)

//         res.send({user, token, message: 'Logged in Successfully'});
//     }
//     catch(err) { 
//         res.status(401).send({error: 'Email or password is incorrect provide a valid details'});
//         console.log('error' + err)
//     }
// })

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ error: 'Email or password is incorrect' });
        }

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ error: 'Email or password is incorrect' });
        }

        // Generate a token (if needed)
        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_KEY);

        res.send({ message: 'Login successful', user, token });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});
// router.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Find the user in the database
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(401).send({ error: 'Email or password is incorrect' });
//         }

//         // Compare the provided password with the stored hash
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).send({ error: 'Email or password is incorrect' });
//         }

//         // Generate a token (if needed)
//         const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_KEY);

//         res.send({ message: 'Login successful', user, token });
//     } catch (err) {
//         res.status(500).send({ error: err.message });
//     }
// });


// Request OTP for resetting password
router.post('/requestReset', async(req, res)=>{
    const {email} = req.body;

    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).send({error: 'User not found'});
        }
        
        // Generate OTP and Expiration time
        const otp = crypto.randomInt(100000, 999999);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        

        user.resetOtp = otp;
        user.otpExpiresAt = expiresAt;
        await user.save();
        
        // Sending OTP via Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Reset Password OTP',
            text: `Your OTP for resetting password is ${otp} and it will expire in 5 minutes. Please use this OTP to reset your password. If you didn't request for OTP, please ignore this`
        };

        await transporter.sendMail(mailOptions);
        res.send({message: 'OTP sent to your email'});  
    }
    catch(err){
        res.status(500).send({error: 'Failed to send OTP'});
        console.log(err)
    
    }
});

// RESET PASSWORD
router.post('/resetPassword', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Validate newPassword
        if (!newPassword) {
            return res.status(400).send({ error: 'New password is required' });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        
        // Validate the OTP
        if (!user.resetOtp || user.resetOtp !== parseInt(otp) || user.otpExpiresAt < new Date()) {
            return res.status(400).send({ error: 'Invalid or expired OTP' });
        }
        console.log(newPassword);
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 8);
        console.log('Hashed Password:', hashedPassword); // Debugging log

        // Update the user's password and clear OTP fields
        user.password = hashedPassword;
        user.resetOtp = null;
        user.otpExpiresAt = null;

        // Save the user to the database
        await user.save();

        res.send({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});


module.exports = router; 