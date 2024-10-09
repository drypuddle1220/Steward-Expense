//API routes
//routes for user authentication(register and login)
import express from "express";
import { registerUser, loginUser } from "../controllers/authController";

const router = express.Router();

// Route for registering a new user
router.post("/register", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await registerUser(email, password);
		res.status(201).json({ user });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// Route for logging in a user
router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await loginUser(email, password);
		res.status(200).json({ user });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

export default router;
