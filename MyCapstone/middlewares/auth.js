const jwt = require('jsonwebtoken');
const User = require('../Model/User');
require('dotenv').config();





const auth = async (req, res, next) =>{
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token , process.env.JWT_KEY);
        const user = await User.findOne({
            _id: decoded._id,
        })

        if(!user){
            throw new Error ('Email or password is incorrect provide a valid details');
        }
        req.user = user;
        req.token = token;
        next();
    }
    catch(err){
        res.status(401).send({err: err.message});
        console.log(err);
    }
}

module.exports = auth;