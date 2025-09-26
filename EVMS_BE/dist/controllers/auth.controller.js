import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export async function register(req, res) {
    try {
        const { email, password, userName, fullName, phoneNumber, photoURL, role, gender } = req.body;
        if (!email || !password || !userName) {
            return res.status(400).json({ message: 'Thiếu email, password hoặc userName' });
        }
        const existed = await User.findOne({ $or: [{ email }, { userName }] }).lean();
        if (existed) {
            return res.status(400).json({ message: 'Email hoặc userName đã tồn tại' });
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            userName,
            passwordHash,
            fullName,
            phoneNumber,
            photoURL,
            role,
            gender,
        });
        return res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                userName: user.userName,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                photoURL: user.photoURL,
                role: user.role,
                gender: user.gender,
                isDisabled: user.isDisabled,
            },
        });
    }
    catch (error) {
        // Duplicate key (email hoặc userName đã tồn tại)
        if (error?.code === 11000) {
            return res.status(400).json({ message: 'Email hoặc userName đã tồn tại' });
        }
        // Validation error
        if (error?.name === 'ValidationError') {
            return res.status(422).json({ message: 'Dữ liệu không hợp lệ' });
        }
        return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
}
export async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Thiếu email hoặc password' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }
        if (user.isDisabled) {
            return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa' });
        }
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }
        const secret = env.jwtSecret;
        if (!secret) {
            return res.status(500).json({ message: 'Thiếu JWT_SECRET' });
        }
        const payload = { sub: String(user._id), role: user.role };
        const token = jwt.sign(payload, secret, { expiresIn: (env.jwtExpiresIn || '1d') });
        return res.status(200).json({
            accessToken: token,
            user: {
                id: user._id,
                email: user.email,
                userName: user.userName,
                fullName: user.fullName,
                phoneNumber: user.phoneNumber,
                photoURL: user.photoURL,
                role: user.role,
                gender: user.gender,
                isDisabled: user.isDisabled,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
}
