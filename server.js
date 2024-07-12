require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { body } = require("express-validator");
const validateBook = require("./routes/book_router");
const Book = require("./models/books");
const { ObjectId } = require("mongoose").Types;

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

mongoose.connect(process.env.DB_HOST, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = mongoose.connection;

// db.once("open", () => {
//   console.log("Connected to MongoDB");
// });

db.on("error", (err) => {
  console.log("DB Error: " + err);
});

// Home route
app.get("/", (req, res) => {
  res.send("Lab - Week9");
});

// GET route to fetch all books
app.get("/api/books", (req, res) => {
  Book.find({})
    .then((books) => {
      res.json(books);
    })
    .catch((error) => {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

// Serve the books.html page to display all books
app.get("/books", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "books.html"));
});

// Serve the add_book.html form
app.get("/book/add", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "add_book.html"));
});

// POST route to add a new book
app.post("/book/add", validateBook, (req, res) => {
  let book = new Book({
    title: req.body.title,
    author: req.body.author,
    pages: req.body.pages,
    genres: req.body.genres,
    rating: req.body.rating,
  });

  book
    .save()
    .then(() => {
      res.json({ message: "Successfully Added" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

// Fetching a Single Book by ID
app.get("/api/book/:id", (req, res) => {
  const bookId = req.params.id;

  // Validate if the provided bookId is a valid ObjectId
  if (!ObjectId.isValid(bookId)) {
    return res.status(400).json({ error: "Invalid book ID" });
  }

  Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json({ book: book });
    })
    .catch((err) => {
      console.error("Error fetching book by id:", err);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

// Deleting a Book by ID
app
  .route("/book/:id")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "views", "book.html"));
  })
  .delete((req, res) => {
    const query = { _id: req.params.id };
    Book.deleteOne(query)
      .then((result) => {
        if (result.deletedCount > 0) {
          res.json({ success: true, message: "Successfully Deleted" });
        } else {
          res.status(404).json({ error: "Book not found" });
        }
      })
      .catch((err) => {
        console.error("Error deleting book by id:", err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  });

app.get("/book/edit/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "edit-book.html"));
});
app
  .route("/api/book/edit/:id")
  .get((req, res) => {
    Book.findById(req.params.id)
      .then((book) => {
        if (!book) {
          return res.status(404).json({ error: "Book not found" });
        }
        res.json({ book: book });
      })
      .catch((err) => {
        console.error("Error fetching book by id:", err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  })
  .post((req, res) => {
    let updatedBook = {
      title: req.body.title,
      author: req.body.author,
      pages: req.body.pages,
      genres: req.body.genres,
      rating: req.body.rating,
    };
    const query = { _id: req.params.id };
    Book.updateOne(query, updatedBook)
      .then(() => {
        res.json({ message: "Successfully Updated" });
      })
      .catch((err) => {
        console.error("Error updating book by id:", err);
        res.status(500).json({ error: "Internal Server Error" });
      });
  });

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
