import Joi from 'joi';
import db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const registerSchema = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required()
});

async function register(req, res) {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { username, email, password } = value;

        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length > 0) {
            return res.status(400).json({ success: false, message: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );

        const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET, { expiresIn: "15m" });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: result.insertId,
                username,
                email,
            },
            token
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function getMe(req, res) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        const { id } = decoded;

        const [rows] = await db.query(
            "SELECT id, username, email FROM users WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: rows[0].id,
                username: rows[0].username,
                email: rows[0].email,
            }
        });

    } catch (error) {
        console.error("GetMe Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

async function login(req, res) {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { email, password } = value;

        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length <= 0) {
            return res.status(400).json({ success: false, message: "Invalid Email or Password" });
        }

        const validPassword = await bcrypt.compare(password, rows[0].password);

        if (!validPassword) {
            return res.status(400).json({ success: false, message: "Invalid Email or Password" });
        }

        const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        await db.query(
            "INSERT INTO refresh_tokens (user_id, refresh_token, expiration_date) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
            [rows[0].id, refreshToken]
        );

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                id: rows[0].id,
                username: rows[0].username,
                email: rows[0].email,
            },
            token,
            refreshToken
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function refreshToken(req, res) {
    try {
        const { error, value } = refreshTokenSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const { refreshToken } = value;

        // 1. DB check
        const [rows] = await db.query(
            "SELECT * FROM refresh_tokens WHERE refresh_token = ?",
            [refreshToken]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        const tokenData = rows[0];

        // 2. Expiry check (MySQL might return Date object)
        if (new Date(tokenData.expiration_date) < new Date()) {
            await db.query(
                "DELETE FROM refresh_tokens WHERE refresh_token = ?",
                [refreshToken]
            );

            return res.status(401).json({
                success: false,
                message: "Refresh token expired"
            });
        }

        // 3. Verify JWT
        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        } catch (err) {
            // Delete the invalid/expired token from the DB as well
            await db.query(
                "DELETE FROM refresh_tokens WHERE refresh_token = ?",
                [refreshToken]
            );
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }

        const { id } = decoded;

        // 4. ROTATION (IMPORTANT 🔥)
        await db.query(
            "DELETE FROM refresh_tokens WHERE refresh_token = ?",
            [refreshToken]
        );

        const newRefreshToken = jwt.sign(
            { id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        await db.query(
            "INSERT INTO refresh_tokens (user_id, refresh_token, expiration_date) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))",
            [id, newRefreshToken]
        );

        // 5. New access token
        const newAccessToken = jwt.sign(
            { id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        return res.status(200).json({
            success: true,
            token: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error("RefreshToken Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export default { register, getMe, login, refreshToken }