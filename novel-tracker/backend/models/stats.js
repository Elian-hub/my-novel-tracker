import mongoose from "mongoose";

const ReadingStatsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User
    booksRead: { type: Number, default: 0 }, // Number of books read
    totalPagesRead: { type: Number, default: 0 }, // Total pages read by the user
    totalBooks: { type: Number, default: 0 }, // Total number of books
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("ReadingStats", ReadingStatsSchema);
