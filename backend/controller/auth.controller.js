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
    const { name, email, password } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Generate OTP and Expiry (10 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // 4. Create user with OTP data
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });

    if (user) {
      // 5. Send the Email
      const message = `
        <h2>Welcome to ShopCom, ${name}!</h2>
        <p>Your one-time verification OTP is: <strong>${otp}</strong></p>
        <p>This code expires in 10 minutes.</p>
      `;

      await sendEmail(email, "Welcome to ShopCom - Your OTP", message);

      const token = generateToken(user._id);

      res.status(201).json({
        message: "User registered. Please verify your email.",
        id: user._id,
        name: user.name,
        email: user.email,
        token: token,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- Login User ---
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log({ email, password });

    // 1. Find user by email
    const user = await User.findOne({ email });
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
};


export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    // This only works if you have an auth middleware protecting this route!
    const user = await User.findById(req.user?._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // 1. Check if OTP matches first
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 2. Then check if that correct OTP is expired
    if (user.otpExpires && Date.now() > user.otpExpires) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Success - Update User
    user.verified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
