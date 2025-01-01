const express = require("express");
const { Booking } = require("./db");
const cors = require("cors");

const app = express();
app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000',
  'https://restaurant-table-booking-system-jet.vercel.app/',
  'https://restaurant-table-booking-system-production.up.railway.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

app.options('*', cors());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

const MAX_ADVANCE_DAYS = 30;
const SAME_DAY_CUTOFF_HOURS = 2;

const BUSINESS_HOURS = {
  start: "12:00 PM",
  end: "8:00 PM"
};

const RESPONSE_MESSAGES = {
  DATE_INVALID: `Reservation date must be between today and ${MAX_ADVANCE_DAYS} days in advance.`,
  TIME_INVALID: `Reservation time must be between ${BUSINESS_HOURS.start} and ${BUSINESS_HOURS.end}.`,
  ADVANCE_BOOKING: `Reservations must be made at least ${SAME_DAY_CUTOFF_HOURS} hours in advance.`,
  SLOT_OCCUPIED: "We apologize, but this time slot is no longer available.",
  BOOKING_SUCCESS: "Your reservation has been confirmed successfully.",
  SERVER_ERROR: "We apologize for the inconvenience. Please try again later."
};


const formatTime = (time) => {
  if (time.includes(':')) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:00 ${ampm}`;
  }
  return time;
};

const isValidTimeSlot = (time) => {
  const formattedTime = formatTime(time);
  const validSlots = ["12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"];
  return validSlots.includes(formattedTime);
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
  const formattedTime = formatTime(time);

  
  if (!isValidDate(date)) {
    return res.status(400).json({ 
      status: "error",
      message: RESPONSE_MESSAGES.DATE_INVALID,
      code: "INVALID_DATE"
    });
  }

  if (!isValidTimeSlot(formattedTime)) {
    return res.status(400).json({ 
      status: "error",
      message: RESPONSE_MESSAGES.TIME_INVALID,
      code: "INVALID_TIME"
    });
  }
  
  if (!isValidBookingTime(date, formattedTime)) {
    return res.status(400).json({ 
      status: "error",
      message: RESPONSE_MESSAGES.ADVANCE_BOOKING,
      code: "INVALID_ADVANCE_TIME"
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