import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import User from "../models/user.js";

dotenv.config();

export const refreshAccessToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  console.log(req.body);

  try {
    if (!refreshToken) {
      return res.status(401).send({ error: "Refresh token is required." });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    if (decoded.type !== "refresh") {
      return res.status(403).send({ error: "Invalid refresh token." });
    }

    // Find the user by ID and check the token version
    const user = await User.findById(decoded.id);

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(403).send({ error: "Token is no longer valid." });
    }

    // Generate a new access token
    const accessToken = jwt.sign(
      {
        email: decoded.email,
        id: decoded.id,
        type: "access",
        tokenVersion: decoded.tokenVersion,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.SAME_SITE || "Strict",
      maxAge: 1000 * 60 * 10,
      path: "/",
    });

    res.send({ accessToken, message: "Access token refreshed successfully." });
  } catch (err) {
    console.error("Token verification error:", err); // Log the error for debugging
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).send({ error: "Refresh token has expired." });
    }
    return res.status(403).send({ error: "Invalid refresh token." });
  }
};

// export const refreshAccessToken = async (req, res, next) => {
//   const refreshToken = req.cookies.refreshToken;

//   try {
//     if (!refreshToken) {
//       return res.status(401).send({ error: "Refresh token is required." });
//     }

//     // Verify the refresh token
//     const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

//     if (decoded.type !== "refresh") {
//       return res.status(403).send({ error: "Invalid refresh token." });
//     }

//     // Find the user by ID and check the token version
//     const user = await User.findById(decoded.id);

//     if (!user || user.tokenVersion !== decoded.tokenVersion) {
//       return res.status(403).send({ error: "Token is no longer valid." });
//     }

//     // Generate a new access token
//     const accessToken = jwt.sign(
//       {
//         email: decoded.email,
//         id: decoded.id,
//         type: "access",
//         tokenVersion: decoded.tokenVersion,
//       },
//       process.env.ACCESS_TOKEN_SECRET,
//       { expiresIn: "10m" }
//     );

//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.SAME_SITE || "Strict",
//       maxAge: 1000 * 60 * 10,
//       path: "/",
//     });

//     res.send({ accessToken, message: "Access token refreshed successfully." });
//   } catch (err) {
//     console.error("Token verification error:", err); // Log the error for debugging
//     if (err instanceof jwt.TokenExpiredError) {
//       return res.status(401).send({ error: "Refresh token has expired." });
//     }
//     return res.status(403).send({ error: "Invalid refresh token." });
//   }
// };
