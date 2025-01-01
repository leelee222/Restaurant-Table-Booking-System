const express = require("express");
const { Booking } = require("./db");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:3000", "https://restaurant-table-booking-system-jet.vercel.app"],
  methods: ["GET", "POST", "DELETE"],
  credentials: true,
}));

const BUSINESS_HOURS = {
  start: "12:00 PM",
  end: "8:00 PM"
};


const isValidTimeSlot = (time) => {
  const validSlots = ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];
  return validSlots.includes(time);
};

const isValidDate = (date) => {
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) return false;
  
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + MAX_ADVANCE_DAYS);
  if (selectedDate > maxDate) return false;
  
  return true;
};

const isValidBookingTime = (date, time) => {
  const now = new Date();
  const bookingTime = new Date(date + ' ' + time);
  if (bookingTime.getDate() === now.getDate()) {
    const hoursBeforeBooking = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursBeforeBooking < SAME_DAY_CUTOFF_HOURS) return false;
  }
  
  return true;
};

const validateBooking = (req, res, next) => {
  const { date, time } = req.body;
  
  if (!isValidDate(date)) {
    return res.status(400).json({ 
      message: `Invalid date. Bookings must be made between today and ${MAX_ADVANCE_DAYS} days in advance.` 
    });
  }

  if (!isValidTimeSlot(time)) {
    return res.status(400).json({ 
      message: `Invalid time slot. Available hours are between ${BUSINESS_HOURS.start} and ${BUSINESS_HOURS.end}.` 
    });
  }
  
  if (!isValidBookingTime(date, time)) {
    return res.status(400).json({ 
      message: `Bookings must be made at least ${SAME_DAY_CUTOFF_HOURS} hours in advance.` 
    });
  }
  
  next();
};

app.post("/create-booking", validateBooking, async (req, res) => {
  const { name, contact, guests, date, time } = req.body;
  
  try {
    const existingBooking = await Booking.findOne({ date, time });
    if (existingBooking) {
      return res.status(400).json({ message: "Time slot already booked." });
    }

    const booking = new Booking({ name, contact, guests, date, time });
    await booking.save();
    
    res.status(201).json({ message: "Booking created successfully", id: booking._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/get-bookings", async (req, res) => {
  const { date } = req.query;
  try {
    const query = date ? { date } : {};
    const bookings = await Booking.find(query);
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/get-available-slots", async (req, res) => {
  const { date } = req.query;
  
  if (!date || !isValidDate(date)) {
    return res.status(400).json({ message: "Invalid or past date" });
  }

  try {
    const bookings = await Booking.find({ date });
    const allSlots = ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];
    const maxCapacity = 4;

    const bookingCounts = bookings.reduce((acc, booking) => {
      acc[booking.time] = (acc[booking.time] || 0) + 1;
      return acc;
    }, {});

    const slotsInfo = allSlots.map(time => ({
      time,
      remainingCapacity: maxCapacity - (bookingCounts[time] || 0)
    }));

    const availableSlots = slotsInfo.filter(slot => slot.remainingCapacity > 0);

    res.status(200).json({
      date,
      availableSlots: availableSlots.map(slot => slot.time),
      slotsInfo: availableSlots
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the Restaurant Table Booking System');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});