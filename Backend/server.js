const express = require("express");
const db = require("./db");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "DELETE"],
  credentials: true,
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

const isValidTimeSlot = (time) => {
  const validSlots = ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];
  return validSlots.includes(time);
};

// Add time slot validation
// Add date validation
const isValidDate = (date) => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

app.get("/get-available-slots", (req, res) => {
  const { date } = req.query;
  
  // Validate date
  if (!date || !isValidDate(date)) {
    return res.status(400).json({ message: "Invalid or past date" });
  }

  const allSlots = ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];
  const maxCapacity = 4; // Maximum bookings per slot

  // Get bookings with count
  db.all(
    "SELECT time, COUNT(*) as count FROM bookings WHERE date = ? GROUP BY time",
    [date],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }

      // Create map of booked slots with their counts
      const bookingCounts = rows.reduce((acc, row) => {
        acc[row.time] = row.count;
        return acc;
      }, {});

      // Filter available slots based on capacity
      const availableSlots = allSlots.filter(slot => 
        !bookingCounts[slot] || bookingCounts[slot] < maxCapacity
      );

      res.status(200).json({
        date,
        availableSlots,
        slotsInfo: availableSlots.map(slot => ({
          time: slot,
          remainingCapacity: maxCapacity - (bookingCounts[slot] || 0)
        }))
      });
    }
  );
});

app.get('/', (req, res) => {
  res.send('Welcome to the Restaurant Table Booking System');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});