import db from "../config/db.js";

async function getUsers(req, res) {
    try {
        const [users] = await db.query("SELECT id, username, email FROM users");
        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Get Users Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export default { getUsers };