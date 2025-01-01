const express = require("express");
const { Booking } = require("./db");
const cors = require("cors");

const app = express();
app.use(express.json());

const allowedOrigins = [
  'http://localhost:3000',
  'https://restaurant-table-booking-system-jet.vercel.app',
  'https://restaurant-table-booking-system-production.up.railway.app'
].map(origin => origin.trim());

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, tools)
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200
}));

// Preflight requests
app.options('*', cors());

// Test route
app.get('/test-cors', (req, res) => {
  res.json({ message: 'CORS test successful' });
});

const MAX_ADVANCE_DAYS = 30;
const SAME_DAY_CUTOFF_HOURS = 2;

const BUSINESS_HOURS = {
  start: "12:00 PM",
  end: "8:00 PM"
};

const MAX_CAPACITY_PER_SLOT = 4;

const VALID_SLOTS = [
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", 
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"
];

const RESPONSE_MESSAGES = {
  DATE_INVALID: `Reservation date must be between today and ${MAX_ADVANCE_DAYS} days in advance.`,
  TIME_INVALID: `Reservation time must be between ${BUSINESS_HOURS.start} and ${BUSINESS_HOURS.end}.`,
  ADVANCE_BOOKING: `Reservations must be made at least ${SAME_DAY_CUTOFF_HOURS} hours in advance.`,
  SLOT_OCCUPIED: "We apologize, but this time slot is no longer available.",
  BOOKING_SUCCESS: "Your reservation has been confirmed successfully.",
  SERVER_ERROR: "We apologize for the inconvenience. Please try again later."
};


const formatTime = (time) => {
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const isValidTimeSlot = (time) => {
  const formattedTime = formatTime(time);
  return VALID_SLOTS.includes(formattedTime);
};

const isValidBookingTime = (date, time) => {
  const [startHours, startMinutes] = BUSINESS_HOURS.start.split(/[: ]/);
  const [endHours, endMinutes] = BUSINESS_HOURS.end.split(/[: ]/);
  const [bookingHours, bookingMinutes] = time.split(/[: ]/);

  const startTime = new Date(1970, 0, 1, parseInt(startHours) % 12 + (BUSINESS_HOURS.start.includes('PM') ? 12 : 0), startMinutes);
  const endTime = new Date(1970, 0, 1, parseInt(endHours) % 12 + (BUSINESS_HOURS.end.includes('PM') ? 12 : 0), endMinutes);
  const bookingTime = new Date(1970, 0, 1, parseInt(bookingHours) % 12 + (time.includes('PM') ? 12 : 0), bookingMinutes);

  console.log({ startTime, endTime, bookingTime });

  return bookingTime >= startTime && bookingTime <= endTime;
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

const validateBooking = (req, res, next) => {
  const { date, time } = req.body;
  console.log({ date, time });
  const formattedTime = formatTime(time);

  
  if (!formattedTime) {
    return res.status(400).json({
      status: "error",
      message: "Invalid time format",
      code: "INVALID_TIME_FORMAT"
    });
  }

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
    const existingBookings = await Booking.find({ date, time });
    if (existingBookings.length >= MAX_CAPACITY_PER_SLOT) {
      return res.status(400).json({ 
        status: "error",
        message: RESPONSE_MESSAGES.SLOT_OCCUPIED 
      });
    }

    const booking = new Booking({ 
      name, 
      contact, 
      guests, 
      date, 
      time 
    });
    await booking.save();
    
    res.status(201).json({ 
      status: "success",
      message: RESPONSE_MESSAGES.BOOKING_SUCCESS,
      data: {
        bookingId: booking._id,
        slot: time,
        remainingCapacity: MAX_CAPACITY_PER_SLOT - (existingBookings.length + 1)
      }
    });
  } catch (err) {
    res.status(500).json({ 
      status: "error",
      message: RESPONSE_MESSAGES.SERVER_ERROR 
    });
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
      const formattedTime = formatTime(booking.time);
      acc[formattedTime] = (acc[formattedTime] || 0) + 1;
      return acc;
    }, {});

    console.log(bookingCounts);

    const slotsInfo = allSlots.map(time => ({
      time,
      remainingCapacity: maxCapacity - (bookingCounts[time] || 0)
    }));

    const availableSlots = slotsInfo.filter(slot => slot.remainingCapacity > 0);

    res.status(200).json({
      date,
      slotsInfo: slotsInfo,
      availableSlots: slotsInfo
        .filter(slot => slot.remainingCapacity > 0)
        .map(slot => slot.time)
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