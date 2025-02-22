import mongoose from "mongoose";

const BookSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String, required: true },
    numberOfPages: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    rating: { type: Number, default: 0 },
    progress: {
      currentPage: { type: Number, default: 0 }, // User's current page in the book
      pagesRead: { type: Number, default: 0 }, // Total pages read by the user for this book
      pagesReadToday: { type: Number, default: 0 }, // Pages read by the user today
      lastReadAt: { type: Date }, // Timestamp for the last time the book was read
      finished: { type: Boolean, default: false }, // Indicates if the book is finished
      timesRead: { type: Number, default: 0 }, // Number of times the book has been read
      status: { type: String, default: "not-started" }, // Status of the book (not-started, reading, finished)
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Book", BookSchema);
