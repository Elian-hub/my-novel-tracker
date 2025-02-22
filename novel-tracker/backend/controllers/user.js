import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodeMailer from "nodemailer";
import { validationResult } from "express-validator";
import dotenv from "dotenv";

import User from "../models/user.js";
import Book from "../models/book.js";
import ReadingStats from "../models/stats.js";

import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

// Sign up user
export const signUpUser = async (req, res) => {
  const { email, password, name } = req.body;
  const uploadImage = req.files?.profileImage;

  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Upload image to Cloudinary if a file is provided
    let imageUrl = null;
    if (uploadImage) {
      // Use a promise to handle the Cloudinary upload asynchronously
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "users", // You can specify a folder in Cloudinary for user images
            public_id: `user_${Date.now()}`, // Custom public ID for the image
          },
          (error, result) => {
            if (error) {
              reject(error);
            }
            resolve(result);
          }
        );

        // Use the buffer to upload the file
        uploadStream.end(uploadImage.data); // Use uploadImage.data for the buffer
      });

      imageUrl = result.secure_url; // Get the URL of the uploaded image
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      password: hashedPassword,
      name,
      imageUrl, // Save the image URL returned by Cloudinary
    });

    await user.save();

    res.status(201).json({
      message:
        "Account created successfully. You will be redirected to the login page.",
    });
  } catch (error) {
    console.error("Error signing up user:", error);
    return res.status(500).json({ message: "Error signing up user" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate access token
    const accessToken = jwt.sign(
      {
        email: user.email,
        id: user._id,
        type: "access",
        tokenVersion: user.tokenVersion,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "10m",
      }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        email: user.email,
        id: user._id,
        type: "refresh",
        tokenVersion: user.tokenVersion,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Set both tokens in cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: process.env.SAME_SITE || "Strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 10,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.SAME_SITE || "Strict",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/", // Make the cookie available across all routes
    });

    res.status(200).json({
      message: "Login successful",
      tokens: {
        accessToken,
        refreshToken,
      },
      user: {
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl, // Include the image URL in the response
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    next(error);
  }
};

// Logout user
export const logoutUser = async (req, res, next) => {
  try {
    // Update the user to increment tokenVersion
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { tokenVersion: 1 },
    });

    // Clear the access token and refresh token cookie
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).send({ message: "User logged out successfully." });
  } catch (err) {
    console.error("Error logging out user:", err);
    next(err);
  }
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Generate a password reset token
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id,
        type: "reset",
        tokenVersion: user.tokenVersion,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    const url = `${process.env.FRONTEND_APP_URL}/auth/reset-password/${token}`;

    const mailOptions = {
      from: process.env.USER,
      to: email,
      subject: "Reset your password",
      html: `<p>Click <a href="${url}">here</a> to reset your password. This link will only be open for one hour.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.send({ message: "Password reset email sent." });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    next(err);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!token) {
      return res.status(400).send({ message: "Token is required." });
    }

    // Verify the JWT
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    if (decoded.type !== "reset") {
      return res.status(403).send({ message: "Invalid token type." });
    }

    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      return res
        .status(404)
        .send({ message: "User not found or token invalid." });
    }

    // Check if token version matches
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(403).send({ message: "Token is no longer valid." });
    }

    // Hash and save the new password
    user.password = await bcrypt.hash(password, 12);

    // Increment the token version after resetting password to invalidate old tokens
    user.tokenVersion += 1;
    await user.save();

    res.send({ message: "Password reset successfully." });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      next({ status: 403, message: "Token expired." });
    }
    console.error("Error in resetPassword:", err);
    next(err);
  }
};

// Update user profile
export const updateUser = async (req, res) => {
  const { oldEmail, name, email, currentProfileImage } = req.body;
  const profileImage = req.files?.profileImage;

  try {
    const user = await User.findOne({ email: oldEmail });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const userId = user._id;

    if (req.user.id !== userId.toString()) {
      return res
        .status(403)
        .send({ message: "You are not authorized to update this user." });
    }

    let profileImageUrl = currentProfileImage; // Default to current image URL

    if (profileImage) {
      // If there's a new image upload
      // First delete the old image if it exists
      if (currentProfileImage) {
        const fileName = currentProfileImage
          .split("/")
          .slice(-1)[0]
          .split("_")[1];
        const imagePublicId = `users/user_${fileName.split(".")[0]}`;

        await cloudinary.uploader
          .destroy(imagePublicId)
          .then((result) => console.log("Cloudinary delete result:", result))
          .catch((error) =>
            console.error("Error deleting from Cloudinary:", error)
          );
      }

      // Upload the new image
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "users", // You can specify a folder in Cloudinary for user images
            public_id: `user_${Date.now()}`, // Custom public ID for the image
          },
          (error, result) => {
            if (error) {
              reject(error);
            }
            resolve(result);
          }
        );

        // Use the buffer to upload the file
        uploadStream.end(profileImage.data); // Use profileImage.data for the buffer
      });

      profileImageUrl = result.secure_url; // Get the URL of the uploaded image
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: oldEmail },
      { name, email, imageUrl: profileImageUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User profile updated successfully",
      user: {
        name,
        email,
        imageUrl: profileImageUrl,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteUser = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const userId = user._id;

    if (req.user.id !== userId.toString()) {
      return res
        .status(403)
        .send({ message: "You are not authorized to delete this user." });
    }

    // Construct the image public ID for the user's image
    const userFileName = user.imageUrl.split("/").slice(-1)[0].split("_")[1];
    const userImagePublicId = `users/user_${userFileName.split(".")[0]}`;

    // Fetch all books associated with the user
    const books = await Book.find({ user: userId });

    // Extract the image public IDs from the books' image URLs
    const bookImagePublicIds = books
      .map((book) => {
        const fileName = book.imageUrl.split("/").slice(-1)[0].split("_")[1];
        return `books/book_${fileName.split(".")[0]}`;
      })
      .filter(Boolean);

    // Perform deletions in parallel using Promise.all
    await Promise.all([
      User.deleteOne({ _id: userId }),
      Book.deleteMany({ user: userId }),
      ReadingStats.deleteOne({ user: userId }),

      // Deleting the user's image from Cloudinary
      cloudinary.uploader
        .destroy(userImagePublicId)
        .then((result) =>
          console.log("Cloudinary delete result (user image):", result)
        )
        .catch((error) =>
          console.error("Error deleting user image from Cloudinary:", error)
        ),

      // Delete book images from Cloudinary
      ...bookImagePublicIds.map((imagePublicId) =>
        cloudinary.uploader
          .destroy(imagePublicId)
          .then((result) =>
            console.log("Cloudinary delete result (book image):", result)
          )
          .catch((error) =>
            console.error("Error deleting book image from Cloudinary:", error)
          )
      ),
    ]);

    res
      .status(200)
      .send({ message: "User and associated data deleted successfully." });
  } catch (err) {
    console.error("Error deleting user:", err);
    next(err);
  }
};
