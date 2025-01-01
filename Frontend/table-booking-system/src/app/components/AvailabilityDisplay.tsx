"use client";

import React, { useState } from "react";
import { Box, TextField, Button, Typography, List, ListItem, ListItemText } from "@mui/material";

const AvailabilityDisplay: React.FC = () => {
  const [date, setDate] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);

  const handleFetch = async () => {
    try {
      const response = await fetch(
        `https://restaurant-table-booking-system-production.up.railway.app/get-bookings?date=${date}`
      );
      const data = await response.json();

      if (response.ok) {
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Check Availability
      </Typography>
      <TextField
        fullWidth
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <Button variant="contained" color="primary" onClick={handleFetch} sx={{ mt: 2 }}>
        Check
      </Button>
      <List sx={{ mt: 2 }}>
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <ListItem key={booking.id}>
              <ListItemText
                primary={`Time: ${booking.time}, Guests: ${booking.guests}`}
                secondary={`Name: ${booking.name}`}
              />
            </ListItem>
          ))
        ) : (
          <Typography sx={{ mt: 2 }}>No bookings found.</Typography>
        )}
      </List>
    </Box>
  );
};

export default AvailabilityDisplay;
