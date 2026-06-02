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

export default { getUsers, searchFriend };