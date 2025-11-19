// backend/controllers/userController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// -------------------------------
// Register User
// -------------------------------
exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: 'Please enter all fields.' });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ email, password: hashedPassword, role: role || 'user' });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        console.error('Registration Failed:', err);
        res.status(500).json({ error: err.message });
    }
};

// -------------------------------
// Login (User/Admin)
// -------------------------------
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Please enter all fields.' });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: 'Invalid credentials.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: 'Invalid credentials.' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: { id: user._id, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('Login Failed:', err);
        res.status(500).json({ error: err.message });
    }
};

// -------------------------------
// Get All Users (Admin only)
// -------------------------------
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // exclude password
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// -------------------------------
// Delete User (Admin only)
// -------------------------------
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// -------------------------------
// Add New User by Admin
// -------------------------------
exports.addUserByAdmin = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: 'Please enter all fields.' });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ email, password: hashedPassword, role: role || 'user' });
        await newUser.save();

        res.status(201).json({ message: 'User added successfully by admin.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
