import express from "express";
import {
  addBook,
  fetchBooks,
  fetchBook,
  updateBook,
  deleteBook,
} from "../controllers/book.js";

const router = express.Router();

router.get("/all", fetchBooks);
router.get("/get-book/:bookId", fetchBook);
router.post("/add", addBook);
router.put("/update/:bookId", updateBook);
router.delete("/delete/:bookId", deleteBook);

export default router;
