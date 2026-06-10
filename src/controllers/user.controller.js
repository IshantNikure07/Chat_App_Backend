import db from "../config/db.js";
import prisma from "../config/prisma.js";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
async function getUsers(req, res) {
    try {
        const [users] = await db.query("SELECT id, username, email, avatar FROM users");
        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Get Users Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

/**
 * @swagger
 * /api/users/search/{name}:
 *   get:
 *     summary: Search for friends
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: The name to search for
 *       - in: header
 *         name: x-internal-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: Internal API key for validation
 *     responses:
 *       200:
 *         description: List of users found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Invalid API Key)
 *       500:
 *         description: Internal server error
 */
async function searchFriend(req, res){
    try {
        const apiKey = req.headers['x-internal-api-key'] || req.headers['internal-api-key'];
        if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
            return res.status(403).json({ success: false, message: "Forbidden: Invalid Internal API Key" });
        }

        const userId = req.user ? Number(req.user.id) : null;
        const { name } = req.params;
        const users = await prisma.user.findMany({
            where: {
                username: {
                    contains: name,
                },
                ...(userId ? {
                    id: {
                        not: userId,
                    },
                } : {}),
            },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
            },
        });
        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Search Friend Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
/**
 * @swagger
 * /api/users/{userId}/upload-avatar:
 *   post:
 *     summary: Upload profile picture by user ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID to update the avatar for
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: The profile picture file (jpeg, png, jpg, webp)
 *     responses:
 *       200:
 *         description: Profile picture uploaded successfully
 *       400:
 *         description: Bad request (missing file or invalid user ID)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
async function uploadAvatar(req, res) {
    try {
        const userId = Number(req.params.userId);
        if (!userId) {
            return res.status(400).json({ success: false, message: "Invalid or missing userId" });
        }

        // Security check: ensure user can only upload their own profile picture
        if (req.user && Number(req.user.id) !== userId) {
            return res.status(403).json({ success: false, message: "Forbidden: You can only upload your own profile picture" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const avatarUrl = "/public/uploads/" + req.file.filename;

        try {
            // Update user avatar in DB directly
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { avatar: avatarUrl },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    avatar: true
                }
            });

            return res.status(200).json({ 
                success: true, 
                message: "Profile picture uploaded successfully", 
                user: updatedUser 
            });
        } catch (prismaError) {
            // P2025 is Prisma's error code for "Record to update not found"
            if (prismaError.code === "P2025") {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            throw prismaError;
        }
    } catch (error) {
        console.error("Upload Avatar Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export default { getUsers, searchFriend, uploadAvatar };