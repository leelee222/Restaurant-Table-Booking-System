const express = require("express");
const db = require("./db");
const cors = require("cors");


const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000", // Allow requests from your frontend's origin
  methods: ["GET", "POST", "DELETE"], // Specify allowed HTTP methods
  credentials: true, // Enable credentials (optional)
}));


app.post("/create-booking", (req, res) => {
    const { name, contact, guests, date, time } = req.body;
  db.get("SELECT * FROM bookings WHERE date = ? AND time = ?", [date, time], (err, row) => {
    if (row) {
      return res.status(400).json({ message: "Time slot already booked." });
    }

    db.run(
      `INSERT INTO bookings (name, contact, guests, date, time) VALUES (?, ?, ?, ?, ?)`,
      [name, contact, guests, date, time],
      function (err) {
        if (err) {
          return res.status(500).json({ message: err.message });
        }
        res.status(201).json({ message: "Booking created successfully", id: this.lastID });
      }
    );
  });
});

app.get("/get-bookings", (req, res) => {
  const { date } = req.query;

  const query = date ? "SELECT * FROM bookings WHERE date = ?" : "SELECT * FROM bookings";
  const params = date ? [date] : [];

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    res.status(200).json(rows);
  });
});

app.get('/', (req, res) => {
  res.send('Welcome to the Restaurant Table Booking System');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
