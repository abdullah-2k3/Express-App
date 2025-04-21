const express = require("express");
const cors = require("cors");
const multer = require("multer");
const session = require("express-session");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Setup database
const db = new sqlite3.Database("./entries.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    filename TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
});

// Middleware
app.use(
  cors({
    origin: "http://localhost:5500", // Change to your frontend port if needed
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/uploads", express.static("uploads"));

// File upload
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Dummy user
const USER = { username: "admin", password: "password123" };

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  console.log("Signup Route");
  if (!username || !password)
    return res.status(400).json({ message: "Missing fields" });

  db.run(
    `INSERT INTO users (username, password) VALUES (?, ?)`,
    [username, password],
    function (err) {
      if (err) {
        if (err.code === "SQLITE_CONSTRAINT") {
          return res.status(409).json({ message: "Username already exists" });
        }
        return res.status(500).json({ message: err.message });
      }
      res.status(201).json({ message: "Signup successful" });
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    `SELECT * FROM users WHERE username = ? AND password = ?`,
    [username, password],
    (err, row) => {
      if (err) return res.status(500).json({ message: err.message });

      if (row) {
        req.session.user = username;
        res.json({ message: "Login successful" });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    }
  );
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out" });
});

function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ message: "Unauthorized" });
}

app.post("/submit", isAuthenticated, upload.single("file"), (req, res) => {
  const { name, email } = req.body;
  const file = req.file;

  if (name && email && file) {
    db.run(
      `INSERT INTO entries (name, email, filename) VALUES (?, ?, ?)`,
      [name, email, file.filename],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Entry saved", id: this.lastID });
      }
    );
  } else {
    res.status(400).json({ message: "Missing fields or file" });
  }
});

app.get("/entries", isAuthenticated, (req, res) => {
  db.all(`SELECT * FROM entries`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
