import express from "express";
import { check, body } from "express-validator";
import {
  deleteUser,
  forgotPassword,
  loginUser,
  logoutUser,
  resetPassword,
  signUpUser,
  updateUser,
} from "../controllers/user.js";
import { refreshAccessToken } from "../controllers/token.js";
import { authenticateUser } from "../middleware/authenticate-user.js";

const router = express.Router();

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .normalizeEmail(),
    body("name")
      .notEmpty()
      .withMessage("Name is required.")
      .isString()
      .withMessage("Name must be a string.")
      .trim(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Please enter a password with at least 8 characters.")
      .trim(),
    check("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match!");
      }
      return true;
    }),
  ],
  signUpUser
);

router.post("/login", loginUser);
router.post("/logout", authenticateUser, logoutUser);
router.post("/token/refresh", refreshAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.delete("/delete-account", authenticateUser, deleteUser);
router.put("/update-account", authenticateUser, updateUser);

export default router;
