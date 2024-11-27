const express = require('express');
const User = require('../Model/User');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


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
        const user = new User({ name, email, password });
        await user.save();
        res.status(201).send({ user, message: 'User created successfully' });
    } catch (err) {
        res.status(400).send(err);
        console.log('Error' + err);
    }
});

// USER LOGIN
router.post('/login', async(req, res)=> {
    try{
        const {email, password} = req.body;
        
        // Validating the User Email
        const user = await User.findOne({email});
        
        if(!user){
            throw new Error('Email or password is incorrect provide a valid details');
        }
        
        // Validating User password
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            throw new Error('Email or password is incorrect provide a valid details');
        }
        const token =jwt.sign({
            _id: user._id.toString()
        }, process.env.JWT_KEY)

        res.send({user, token, message: 'Logged in Successfully'});
    }
    catch(err) { 
        res.status(401).send({error: 'Email or password is incorrect provide a valid details'});
        console.log('error' + err)
    }
})




module.exports = router; 