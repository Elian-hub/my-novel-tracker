import Book from "../models/book.js";
import ReadingStats from "../models/stats.js";

// Get user's reading statistics
export const getReadingStats = async (req, res) => {
  try {
    const stats = await ReadingStats.findOne({ user: req.user.id });

    return res.status(200).json(stats || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update progress for a specific book
export const updateReadingProgress = async (req, res) => {
  const { bookId, pagesReadToday, currentPage, rating } = req.body;

  try {
    const book = await Book.findOne({ _id: bookId, user: req.user.id });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // if (book?.progress?.status === "finished" || book?.progress?.finished) {
    //   return res
    //     .status(400)
    //     .json({ message: "You can't update progress for a finished book" });
    // }

    if (currentPage > book.numberOfPages) {
      return res
        .status(400)
        .json({ message: "Current page cannot be greater than total pages" });
    }

    // Initialize or fetch the reading stats
    let stats = await ReadingStats.findOne({ user: req.user.id });

    // Update book progress
    const progress = book.progress;
    progress.currentPage = currentPage;
    progress.pagesRead += pagesReadToday;
    progress.pagesReadToday = pagesReadToday;
    progress.lastReadAt = new Date();

    // Check if the book is finished
    if (currentPage === book.numberOfPages && !progress.finished) {
      progress.finished = true; // Mark as finished
      progress.status = "finished"; // Update status
      progress.timesRead += 1; // Increment timesRead

      // Update stats for the first read
      if (progress.timesRead === 1) {
        stats.booksRead += 1;
      }
    } else if (!progress.finished) {
      progress.status = "reading"; // Set status to "reading" if not finished
    }

    // Always update total pages read for non-finished books

    stats.totalPagesRead += pagesReadToday;

    // Save the stats and book
    await stats.save();
    if (rating !== undefined) book.rating = rating;

    await book.save();

    return res.status(200).json({
      message: "Progress and details updated successfully",
      book,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Reset book for re-reading
export const resetBookForRereading = async (req, res) => {
  const { bookId } = req.body;
  try {
    // Find the book by user and book ID
    const book = await Book.findOne({ _id: bookId, user: req.user.id });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the book is finished
    if (!book.progress.finished) {
      return res
        .status(400)
        .json({ message: "You can't re-read an unfinished book" });
    }

    // Reset progress fields for re-reading only if the book status is finished and status is finished
    book.progress.currentPage = 0;
    book.progress.pagesRead = 0;
    book.progress.pagesReadToday = 0;
    book.progress.lastReadAt = null;
    book.progress.finished = false;
    book.progress.status = "not-started"; // Reset to initial status

    await book.save();

    return res.status(200).json({ message: "Book reset for re-reading", book });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
