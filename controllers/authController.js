const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");

// Password validation function
const validatePassword = (password) => {
  // Example validation: minimum length of 8 characters and at least one number and one special character
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

// Register a new user
exports.signup = async (req, res) => {
  const { username, name, email, password } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    // Check if the username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already in use" });
    }

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, contain at least one number, and one special character.",
      });
    }

    // Create a new user and save it
    const newUser = new User({
      username,
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error registering user", error });
  }
};

// Login controllerconst bcrypt = require('bcryptjs');
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
     // Validate input fields
     if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Use a generic message to prevent email enumeration
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Use the same generic message
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const payload = {
      user: {
        userId: user._id,
      },
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN });

      // response with token and user info
      res.json({
        token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error: ", error)
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getUser = async (req, res) => {
  try {
    // req.user contains the userId set by the isAuthenticated middleware
    const userId = req.user.userId;

    // Fetch user information from the database
    const user = await User.findById(userId).select('-password'); // Exclude the password field

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with user information
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

//forgot password
exports.forgetPassword = async (req, res) => {
  try {
    // Find the user by email
    const user = await User.findOne({ email: req.body.email });

    // If user not found, send error message
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Generate a unique JWT token for the user that contains the user's id
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // Send the token to the user's email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_APP_EMAIL,
      },
    });

    // Email configuration
    const mailOptions = {
      from: `Nasser Hussein <${process.env.EMAIL}>`,
      to: req.body.email,
      subject: "Reset Password",
      html: `<h1>Reset Your Password</h1>
    <p>Click on the following link to reset your password:</p>
    <a href="http://localhost:3001/en/reset-password/${token}">Press Here to reset Password</a>
    <p>The link will expire in 15 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.status(200).send({ message: "Email sent" });
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
//reset password
exports.resetPassword = async (req, res) => {
  try {
    // Verify the token sent by the user
    const decodedToken = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const { newPassword } = req.body;
    // If the token is invalid, return an error
    if (!decodedToken) {
      return res.status(401).send({ message: "Invalid token" });
    }

    // find the user with the id from the token
    const user = await User.findOne({ _id: decodedToken.userId });
    if (!user) {
      return res.status(401).send({ message: "no user found" });
    }
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required!!" });
    }
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

    // Update user's password, clear reset token and expiration time
    user.password = req.body.newPassword;
    await user.save();

    // Send success response
    res.status(200).send({ message: "Password updated" });
  } catch (err) {
    // Send error response if any error occurs
    res.status(500).send({ message: err.message });
  }
};
