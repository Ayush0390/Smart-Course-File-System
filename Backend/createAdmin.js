// backend/createAdmin.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');

dotenv.config();

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_db';

async function run() {
  try {
    await mongoose.connect(MONGO);
    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'Admin@123';
    const exists = await User.findOne({ email });
    if (exists) {
      console.log('Admin already exists:', exists.email);
      process.exit(0);
    }
    const hashed = await bcrypt.hash(password, 10);
    const admin = await User.create({ email, password: hashed, role: 'admin' });
    console.log('Created admin:', admin.email, 'id:', admin._id);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
