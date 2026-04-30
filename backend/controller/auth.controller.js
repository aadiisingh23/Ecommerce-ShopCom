import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (id) => { 
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// --- Register New User ---
export const registerUser = async (req, res) => {
  try {
    const { name, email, password} = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create and save the user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      // Generate a mock OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Send Welcome / OTP Email
      const message = `
        <h2>Welcome to ShopCom, ${name}!</h2>
        <p>Thank you for registering on our platform.We are excited to have you on board!</p>
        <p>Your one-time verification OTP is: <strong>${otp}</strong></p>
      `;

      await sendEmail(email, "Welcome to ShopCom - Your OTP" ,message);

      const token = generateToken(user._id);

      res.status(201).json({
        message: "User registered successfully",
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- Login User ---
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log({email,password});
    

    // 1. Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user) {

      const token = generateToken(user._id);

      res.status(200).json({
        message: "Login successful",
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getUser = async (req, res) => {
    try {
        const users = await User.find({}).select("-password");
        res.status(200).json(users);
        console.log(users);

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}