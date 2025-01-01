"use client";

import React, { useState } from "react";
import { Box, TextField, Button, Typography, List, ListItem, ListItemText } from "@mui/material";

const AvailabilityDisplay: React.FC = () => {
  const [date, setDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const handleFetch = async () => {
    try {
      const response = await fetch(`https://restaurant-table-booking-system-production.up.railway.app/get-available-slots?date=${date}`);
      const data = await response.json();

      if (response.ok) {
        setAvailableSlots(data);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
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
      <Typography variant="h6" sx={{ mt: 2 }}>
        Available Slots
      </Typography>
      <List sx={{ mt: 2 }}>
        {availableSlots.length > 0 ? (
          availableSlots.map((slot) => (
            <ListItem key={slot}>
              <ListItemText primary={`Time: ${slot}`} />
            </ListItem>
          ))
        ) : (
          <Typography sx={{ mt: 2 }}>No available slots found.</Typography>
        )}
      </List>
    </Box>
  );
};

export default AvailabilityDisplay;