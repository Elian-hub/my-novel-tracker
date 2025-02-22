import Book from "../models/book.js";
import ReadingStats from "../models/stats.js";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Fetch books for logged in user
export const fetchBooks = async (req, res, next) => {
  try {
    const books = await Book.find({
      user: req.user.id,
    });
    res.status(200).json({ message: "Books fetched successfully.", books });
  } catch (error) {
    console.error("Error fetching books:", error);
    next(error);
  }
};

// Fetch book by ID
export const fetchBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
    res.status(200).json({ message: "Book fetched successfully.", book });
  } catch (error) {
    console.error("Error fetching book:", error);
    next(error);
  }
};

// Add book
export const addBook = async (req, res, next) => {
  const { title, author, description, numberOfPages } = req.body;
  const bookImage = req.files?.bookImage;

  try {
    // Validate input
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Title must be at least 3 characters long." });
    }
    if (!author || typeof author !== "string" || author.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Author name must be at least 3 characters long." });
    }
    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length < 10
    ) {
      return res
        .status(400)
        .json({ message: "Description must be at least 10 characters long." });
    }
    if (!Number.isInteger(Number(numberOfPages)) || numberOfPages <= 0) {
      return res
        .status(400)
        .json({ message: "Number of pages must be a positive integer." });
    }

    let imageUrl = "";
    if (bookImage) {
      // Use a promise to handle the Cloudinary upload asynchronously
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "books",
            public_id: `book_${Date.now()}`,
          },
          (error, result) => {
            if (error) {
              console.error("Error uploading image to Cloudinary:", error);
              reject(error);
            }
            resolve(result);
          }
        );
        uploadStream.end(bookImage.data);
      });

      imageUrl = result.secure_url;
    }

    // Save book to the database
    const newBook = new Book({
      user: req.user.id,
      title,
      author,
      description,
      numberOfPages: Number(numberOfPages),
      imageUrl,
    });
    await newBook.save();

    let stats = await ReadingStats.findOne({ user: req.user.id });
    if (!stats) {
      stats = new ReadingStats({
        user: req.user.id,
        totalPagesRead: 0,
        booksRead: 0,
        totalBooks: 1,
      });
      await stats.save();
    } else {
      stats.totalBooks++;
      await stats.save();
    }

    res.status(201).json({
      message: "Book added successfully.",
      book: newBook,
    });
  } catch (error) {
    console.error("Error adding book:", error);
    next(error);
  }
};

// Update book by ID
export const updateBook = async (req, res, next) => {
  const { title, author, description, numberOfPages, currentImageUrl } =
    req.body;
  const bookImage = req.files?.bookImage;
  const bookId = req.params.bookId;

  try {
    // Validate input
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Title must be at least 3 characters long." });
    }
    if (!author || typeof author !== "string" || author.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Author name must be at least 3 characters long." });
    }
    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length < 10
    ) {
      return res
        .status(400)
        .json({ message: "Description must be at least 10 characters long." });
    }
    if (!Number.isInteger(Number(numberOfPages)) || numberOfPages <= 0) {
      return res
        .status(400)
        .json({ message: "Number of pages must be a positive integer." });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    let imageUrl = currentImageUrl;
    if (bookImage) {
      // First delete the old image if it exists
      if (currentImageUrl) {
        const fileName = currentImageUrl.split("/").slice(-1)[0].split("_")[1];
        const imagePublicId = `books/book_${fileName.split(".")[0]}`;
        try {
          await cloudinary.uploader.destroy(imagePublicId);
        } catch (error) {
          console.error("Error deleting from Cloudinary:", error);
          return next(error);
        }
      }

      // Upload new image
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "books",
            public_id: `book_${Date.now()}`,
          },
          (error, result) => {
            if (error) {
              console.error("Error uploading image to Cloudinary:", error);
              reject(error);
            }
            resolve(result);
          }
        );
        uploadStream.end(bookImage.data);
      });

      imageUrl = result.secure_url;
    }

    // Update book in the database
    await Book.findByIdAndUpdate(
      bookId,
      {
        title,
        author,
        description,
        numberOfPages:
          book?.progress?.status === "not-started"
            ? Number(numberOfPages)
            : book.numberOfPages,
        imageUrl,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Book updated successfully.",
    });
  } catch (error) {
    console.error("Error updating book:", error);
    next(error);
  }
};

// Delete book by ID
export const deleteBook = async (req, res, next) => {
  const bookId = req.params.bookId;

  try {
    // Delete book from the database
    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found." });
    }

    // Update reading stats
    const stats = await ReadingStats.findOne({ user: req.user.id });
    if (stats) {
      if (
        deletedBook?.progress?.finished &&
        deletedBook?.progress?.timesRead > 0
      ) {
        stats.totalPagesRead -=
          deletedBook.numberOfPages * deletedBook.progress.timesRead;
        stats.booksRead--;
      } else if (
        deletedBook?.progress?.timesRead > 0 &&
        !deletedBook?.progress?.finished
      ) {
        stats.totalPagesRead -=
          deletedBook.numberOfPages * deletedBook.progress.timesRead;
        stats.totalPagesRead -= deletedBook.progress.pagesRead;
        stats.booksRead--;
      } else {
        stats.totalPagesRead -= deletedBook.progress.pagesRead;
      }

      stats.totalBooks--;
      await stats.save();
    }

    // Delete image from Cloudinary if it exists
    if (deletedBook.imageUrl) {
      const fileName = deletedBook.imageUrl
        .split("/")
        .slice(-1)[0]
        .split("_")[1];
      const imagePublicId = `books/book_${fileName.split(".")[0]}`;
      try {
        await cloudinary.uploader.destroy(imagePublicId);
      } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return next(error);
      }
    }

    res.status(200).json({
      message: "Book deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    next(error);
  }
};
