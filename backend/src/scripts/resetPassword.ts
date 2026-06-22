import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_db';

const resetPassword = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'rahul.luminedge21@gmail.com';
        const newPassword = '190221';

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        const result = await User.updateOne(
            { email },
            { $set: { passwordHash } }
        );

        if (result.modifiedCount > 0) {
            console.log(`Password reset successfully for ${email}`);
        } else {
            console.log(`User ${email} not found`);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error resetting password:', error);
        process.exit(1);
    }
};

resetPassword();
