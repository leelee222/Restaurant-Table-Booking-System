import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const BookingForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    guests: 1,
    date: "",
    time: "",
  });
  const [message, setMessage] = useState("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("https://restaurant-table-booking-system-production.up.railway.app/create-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Booking created successfully!");
        setBookingDetails(formData);
      } else {
        setMessage(data.message || "Failed to create booking.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    }
  };

    const theme = createTheme({
      typography: {
        fontFamily: 'Lexend, Arial, sans-serif',
      },
    });

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, fontFamily: "Lexend, Arial, sans-serif" }}>
      <Typography variant="h4" gutterBottom sx={{fontFamily: "Lexend"}}>
        Book a Table
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
          sx={{fontFamily: "Lexend"}}
        />
        <TextField
          fullWidth
          label="Contact"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          margin="normal"
          required
          sx={{fontFamily: "Lexend"}}
        />
        <TextField
          fullWidth
          label="Number of Guests"
          name="guests"
          type="number"
          value={formData.guests}
          onChange={handleChange}
          margin="normal"
          required
          sx={{fontFamily: "Lexend"}}
        />
        <TextField
          fullWidth
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
          sx={{fontFamily: "Lexend"}}
        />
        <TextField
          fullWidth
          label="Time"
          name="time"
          type="time"
          value={formData.time}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
          sx={{fontFamily: "Lexend"}}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, fontFamily: "Lexend" }}>
          Submit
        </Button>
      </form>
      {message && (
        <Typography sx={{ mt: 2, color: message.includes("successfully") ? "green" : "red" , fontFamily: "Lexend"}}>
          {message}
        </Typography>
      )}
      {bookingDetails && (
        <Box sx={{ mt: 2 , fontFamily: "Lexend"}}>
          <Typography variant="h6" sx={{fontFamily: "Lexend", mb: 1}}>Booking Summary</Typography>
          <Typography sx={{fontFamily: "Lexend", mb:1}}>Name: {bookingDetails.name}</Typography>
          <Typography sx={{fontFamily: "Lexend", mb:1}}>Contact: {bookingDetails.contact}</Typography>
          <Typography sx={{fontFamily: "Lexend", mb:1}}>Guests: {bookingDetails.guests}</Typography>
          <Typography sx={{fontFamily: "Lexend", mb:1}}>Date: {bookingDetails.date}</Typography>
          <Typography sx={{fontFamily: "Lexend", mb:1}}>Time: {bookingDetails.time}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default BookingForm;
