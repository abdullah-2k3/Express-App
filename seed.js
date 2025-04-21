const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./entries.db");

const sampleEntries = [
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    filename: "alice_resume.pdf",
  },
  //   {
  //     name: "Bob Smith",
  //     email: "bob@example.com",
  //     filename: "bob_portfolio.png",
  //   },
  //   {
  //     name: "Charlie Brown",
  //     email: "charlie@example.com",
  //     filename: "charlie_cv.docx",
  //   },
  //   { name: "Dana White", email: "dana@example.com", filename: "dana_file.pdf" },
  //   { name: "Eli Turner", email: "eli@example.com", filename: "eli_image.jpg" },
  //   {
  //     name: "Fiona Green",
  //     email: "fiona@example.com",
  //     filename: "fiona_resume.pdf",
  //   },
  //   {
  //     name: "George King",
  //     email: "george@example.com",
  //     filename: "george_docs.zip",
  //   },
  //   {
  //     name: "Hannah Lee",
  //     email: "hannah@example.com",
  //     filename: "hannah_cv.doc",
  //   },
  //   {
  //     name: "Ian Knight",
  //     email: "ian@example.com",
  //     filename: "ian_portfolio.pdf",
  //   },
  //   {
  //     name: "Jenna Sparks",
  //     email: "jenna@example.com",
  //     filename: "jenna_upload.png",
  //   },
];

db.serialize(() => {
  const stmt = db.prepare(
    "INSERT INTO entries (name, email, filename) VALUES (?, ?, ?)"
  );

  sampleEntries.forEach((entry) => {
    stmt.run(entry.name, entry.email, entry.filename);
  });

  stmt.finalize(() => {
    console.log("Sample users inserted.");
    db.close();
  });
});
