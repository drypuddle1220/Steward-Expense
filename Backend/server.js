//express server setup
const express = require("express");
const mongoose = require("mongoose");
const User = require("./userModel"); // Your user model file
const bcrypt = require("bcryptjs");
const app = express();

app.use(express.json());

mongoose.connect("mongodb://localhost:27017/expense_tracker", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

app.post("/api/register", async (req, res) => {
	const { email, password } = req.body;

	try {
		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create a new user
		const newUser = new User({
			email,
			password: hashedPassword,
		});

		await newUser.save();

		res.status(201).json({ message: "User created successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error", error });
	}
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
