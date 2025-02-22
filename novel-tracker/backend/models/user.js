import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    imageUrl: { type: String },
    tokenVersion: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
