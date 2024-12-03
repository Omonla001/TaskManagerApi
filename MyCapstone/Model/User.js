const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetOtp: { type: Number },
    otpExpiresAt: { type: Date },
}, {
    timestamps: true
});

userSchema.pre('save', async function (next) {
    const user = this;

    // Hash password only if it's not already hashed
    if (user.isModified('password') && !user.password.startsWith('$2b$')) {
        user.password = await bcrypt.hash(user.password, 8);
        // console.log('First hashed password', user.password);
    }
    
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
